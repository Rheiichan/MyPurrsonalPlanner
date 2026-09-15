// supabase/functions/send-notifications/index.ts
//
// Deploy with: supabase functions deploy send-notifications
// Runs on a schedule (see supabase/022_notification_schedule.sql) every
// 5 minutes. Checks four things and sends a push for anything due:
//   1. Quick To-Do reminders at 6:00, 12:00, and 18:00 (if anything's unchecked)
//   2. A mood check-in nudge at 18:00 (if today's mood isn't logged yet)
//   3. Calendar events, at their exact set time (rounded to the nearest 5 min)
//   4. Goals, at 9:00 on their target date (if not marked done)
//
// All times are Asia/Manila (UTC+8, no DST).

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@example.com'
// A secret only this function and the cron job know — checked below so
// this endpoint can't be triggered by anyone else. This sidesteps
// Supabase's publishable/secret-key vs JWT distinction entirely: it's
// just our own shared password for this one job. Set it as an Edge
// Function secret (CRON_SECRET) and also disable "Verify JWT" for this
// function in the Dashboard, since our own check below replaces it.
const CRON_SECRET = Deno.env.get('CRON_SECRET')!

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// Asia/Manila is a fixed UTC+8 offset (no daylight saving).
function manilaNow() {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utcMs + 8 * 60 * 60000)
}

// Returns true only once per exact 5-minute tick (e.g. "06:00", "12:00").
function floorToTick(hh: number, mm: number) {
  return `${pad(hh)}:${pad(mm - (mm % 5))}`
}

// Writes a notification_log row first (acts as a lock/dedupe); if that
// insert fails because the row already exists, we've already sent this
// exact reminder, so skip. Only sends to subscriptions that still work —
// dead ones (404/410) are cleaned up automatically.
async function sendToUser(userId: string, kind: string, refKey: string, title: string, body: string, url = '/hub') {
  const { error: logError } = await supabase
    .from('notification_log')
    .insert({ user_id: userId, kind, ref_key: refKey })
  if (logError) {
    if (logError.code === '23505') return // already sent
    console.error('log insert error', logError)
    return
  }

  const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', userId)
  if (!subs || subs.length === 0) return

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url })
      )
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
      } else {
        console.error('push send error', err)
      }
    }
  }
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('authorization') || ''
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = manilaNow()
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const tickLabel = floorToTick(now.getHours(), now.getMinutes())
  const summary: Record<string, number> = {}

  // 1) Quick To-Do reminders — 6am, noon, 6pm — only for users with something unchecked
  if (['06:00', '12:00', '18:00'].includes(tickLabel)) {
    const { data: pending } = await supabase.from('quick_todos').select('user_id')
    const userIds = [...new Set((pending || []).map((t) => t.user_id as string))]
    for (const userId of userIds) {
      await sendToUser(
        userId, 'quick_todo', `${todayStr}:${tickLabel}`,
        "You've got unfinished quick to-dos",
        "A few things are still on your Quick To-Do list — tap to check them off.",
        '/hub'
      )
    }
    summary.quick_todo = userIds.length
  }

  // 2) Mood check-in nudge at 6pm, only if not logged today
  if (tickLabel === '18:00') {
    const { data: allProfiles } = await supabase.from('profiles').select('id')
    const { data: loggedToday } = await supabase.from('mood_logs').select('user_id').eq('log_date', todayStr)
    const loggedSet = new Set((loggedToday || []).map((m) => m.user_id as string))
    const toRemind = (allProfiles || []).map((p) => p.id as string).filter((id) => !loggedSet.has(id))
    for (const userId of toRemind) {
      await sendToUser(
        userId, 'mood', todayStr,
        'How are you feeling today?',
        "You haven't logged your mood yet today — takes just a tap.",
        '/mood'
      )
    }
    summary.mood = toRemind.length
  }

  // 3) Calendar agenda — fires at each event's own set time (rounded to 5 min)
  const { data: events } = await supabase
    .from('calendar_events')
    .select('id, user_id, title, event_time')
    .eq('event_date', todayStr)
    .not('event_time', 'is', null)
  let agendaCount = 0
  for (const ev of events || []) {
    const [eh, em] = (ev.event_time as string).split(':').map(Number)
    if (floorToTick(eh, em) === tickLabel) {
      await sendToUser(
        ev.user_id as string, 'agenda', ev.id as string,
        'Upcoming: ' + ev.title,
        `Happening now (${(ev.event_time as string).slice(0, 5)})`,
        '/calendar'
      )
      agendaCount++
    }
  }
  summary.agenda = agendaCount

  // 4) Goals — a single reminder at 9am on the goal's target date
  if (tickLabel === '09:00') {
    const { data: goals } = await supabase
      .from('goals')
      .select('id, user_id, title')
      .eq('target_date', todayStr)
      .eq('is_done', false)
    for (const g of goals || []) {
      await sendToUser(g.user_id as string, 'goal', g.id as string, 'Goal due today', g.title as string, '/goals')
    }
    summary.goal = (goals || []).length
  }

  return new Response(JSON.stringify({ tick: tickLabel, summary }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
