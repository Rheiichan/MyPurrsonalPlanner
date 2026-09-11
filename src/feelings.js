// Each feeling maps to a suggested action. Where the action has a real
// destination in the app, `path` links there; otherwise it's just a
// gentle, in-the-moment suggestion with nowhere specific to go.
export const FEELINGS = [
  { feeling: 'I Hate Everyone', action: 'Eat', path: '/recipes' },
  { feeling: 'Everyone Hates Me', action: 'Sleep', path: '/sleep' },
  {
    feeling: 'I Hate Myself',
    action: 'Take a Shower',
    path: null,
    advice: [
      "A shower won't fix everything, but it can interrupt the spiral for a few minutes — sometimes that's enough to think a little more clearly.",
      "Taking care of your body is still an act of self-respect, even on days you don't feel like you deserve it.",
      "Let the water be the reset button. You don't have to feel better right away — just let this be one small, kind thing you did for yourself today.",
    ],
  },
  { feeling: 'Everyone Hates Everyone', action: 'Go Outside', path: '/travel' },
  { feeling: 'Overwhelmed by Thoughts', action: 'Write Them Down', path: '/notebooks' },
  {
    feeling: 'Lost and Alone',
    action: 'Talk to a Friend',
    path: null,
    advice: [
      "You don't need the perfect words — just reaching out is enough. Most people are glad to be asked how you're doing.",
      "Isolation makes everything feel bigger than it is. One honest conversation can shrink it back down to size.",
      "You don't have to carry this by yourself. Send the text you've been putting off — they'd probably want to hear from you.",
    ],
  },
  { feeling: 'Stuck in the Past', action: 'Plan For the Future', path: '/goals' },
  { feeling: 'Anxious About the Future', action: 'Focus on the Present', path: '/gratitude' },
  { feeling: "I'm not Enough", action: 'List Your Achievements', path: '/gratitude?tab=achievements' },
  { feeling: "I Can't Control Anything", action: 'Organize Something', path: '/calendar' },
  {
    feeling: 'I Feel Unloved',
    action: 'Do Something Kind For Yourself',
    path: null,
    advice: [
      "Treat yourself the way you'd treat someone you love — even if it's just making your favorite drink or resting for ten minutes.",
      "You don't need someone else's permission to be gentle with yourself today.",
      "Kindness toward yourself isn't indulgent — it's necessary. Do one small thing, just for you.",
    ],
  },
  {
    feeling: 'No One Understands Me',
    action: 'Express Yourself Creatively',
    path: null,
    advice: [
      "Put it into a drawing, a playlist, a page of writing — it doesn't have to make sense to anyone else to be worth making.",
      "Sometimes what's hard to say out loud comes out easier through a pen, a paintbrush, or a melody.",
      "You don't need an audience for this. Make something just because it helps you feel a little more like yourself.",
    ],
  },
  {
    feeling: 'I Feel Restless',
    action: 'Take A Long Walk',
    path: null,
    advice: [
      "Let your body move while your mind wanders — you don't need a destination, just some fresh air and a change of scenery.",
      "Restlessness often eases with motion. Even fifteen minutes outside can shift how you feel.",
      "Leave your phone behind if you can. Notice five things you see, hear, or smell along the way.",
    ],
  },
  { feeling: 'I Feel Like Giving Up', action: 'Remember A Time You Succeeded', path: '/gratitude?tab=achievements' },
  {
    feeling: "I'm Invisible",
    action: 'Help Someone in Need',
    path: null,
    advice: [
      "Being seen isn't the only way to matter — showing up for someone else can remind you that you do.",
      "A small act of kindness toward someone else often makes us feel more connected too, not less.",
      "You don't have to do something big. A kind word or a helping hand is enough to matter today.",
    ],
  },
  { feeling: "I'm Pressured", action: 'Do A Simple Task You Enjoy', path: '/projects' },
]
