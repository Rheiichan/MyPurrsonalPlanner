// Each feeling maps to a suggested action. Where the action has a real
// destination in the app, `path` links there; otherwise it's just a
// gentle, in-the-moment suggestion with nowhere specific to go.
export const FEELINGS = [
  { feeling: 'I Hate Everyone', action: 'Eat', path: '/recipes' },
  { feeling: 'Everyone Hates Me', action: 'Sleep', path: '/sleep' },
  { feeling: 'I Hate Myself', action: 'Take a Shower', path: null },
  { feeling: 'Everyone Hates Everyone', action: 'Go Outside', path: '/travel' },
  { feeling: 'Overwhelmed by Thoughts', action: 'Write Them Down', path: '/notebooks' },
  { feeling: 'Lost and Alone', action: 'Talk to a Friend', path: null },
  { feeling: 'Stuck in the Past', action: 'Plan For the Future', path: '/goals' },
  { feeling: 'Anxious About the Future', action: 'Focus on the Present', path: '/gratitude' },
  { feeling: "I'm not Enough", action: 'List Your Achievements', path: '/gratitude?tab=achievements' },
  { feeling: "I Can't Control Anything", action: 'Organize Something', path: '/calendar' },
  { feeling: 'I Feel Unloved', action: 'Do Something Kind For Yourself', path: null },
  { feeling: 'No One Understands Me', action: 'Express Yourself Creatively', path: null },
  { feeling: 'I Feel Restless', action: 'Take A Long Walk', path: null },
  { feeling: 'I Feel Like Giving Up', action: 'Remember A Time You Succeeded', path: '/gratitude?tab=achievements' },
  { feeling: "I'm Invisible", action: 'Help Someone in Need', path: null },
  { feeling: "I'm Pressured", action: 'Do A Simple Task You Enjoy', path: '/projects' },
]
