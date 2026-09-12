// Diet mode metadata, descriptions, and suggested activities — sourced
// from the CaloRhythm app, with fasting-only content removed (no "IF Only"
// mode here). Calorie/BMI math lives in src/fitnessMath.js.

export const DIET_MODES = [
  "Keto",
  "Low Carb",
  "Carnivore",
  "Clean Eating",
  "Pescatarian",
  "Diabetic-Friendly",
  "Low Sodium",
  "Calorie Deficit",
  "TTC"
]

export const DIET_META = {
  "Keto": {
    "emoji": "🥑",
    "color": "#f472b6",
    "tagline": "High fat · Very low carb"
  },
  "Low Carb": {
    "emoji": "🥦",
    "color": "#60a5fa",
    "tagline": "Moderate carbs · Flexible"
  },
  "Carnivore": {
    "emoji": "🥩",
    "color": "#fb923c",
    "tagline": "Animal only · Zero carb"
  },
  "Clean Eating": {
    "emoji": "🌿",
    "color": "#34d399",
    "tagline": "Whole foods · No junk"
  },
  "Pescatarian": {
    "emoji": "🐟",
    "color": "#06b6d4",
    "tagline": "Fish & plants · No red meat"
  },
  "Diabetic-Friendly": {
    "emoji": "💉",
    "color": "#10b981",
    "tagline": "Low GI · Blood sugar control"
  },
  "Low Sodium": {
    "emoji": "🧂",
    "color": "#f59e0b",
    "tagline": "Heart healthy · Reduce salt"
  },
  "Calorie Deficit": {
    "emoji": "⚖️",
    "color": "#ec4899",
    "tagline": "Controlled portions · Fat loss"
  },
  "TTC": {
    "emoji": "🌸",
    "color": "#f9a8d4",
    "tagline": "Fertility nutrition · Trying to conceive"
  }
}

export const DIET_INFO = {
  "Keto": {
    "what": "A very low-carb, high-fat diet that puts your body into ketosis — burning fat for fuel instead of glucose.",
    "purpose": [
      "Rapid fat loss",
      "Reduced hunger",
      "Mental clarity",
      "Blood sugar control"
    ],
    "effects": [
      "Days 1–3: Carb withdrawal, 'keto flu'",
      "Week 2: Ketosis begins, energy improves",
      "Month 1: Significant fat loss",
      "Long-term: Metabolic adaptation, maintenance"
    ],
    "risks": [
      "Keto flu during transition",
      "Restrictive — hard to sustain socially",
      "Low fiber if vegetables are avoided",
      "May raise LDL in some individuals"
    ],
    "macros": {
      "carbs": "5–10%",
      "protein": "20–25%",
      "fat": "65–75%"
    }
  },
  "Low Carb": {
    "what": "A low-carb diet reduces carbohydrate intake to 50–100g/day. Less strict than keto, it still promotes fat burning while allowing more food flexibility.",
    "purpose": [
      "Steady fat loss",
      "Better blood sugar control",
      "Reduced bloating",
      "More sustainable than keto"
    ],
    "effects": [
      "Week 1–2: Water weight loss",
      "Month 1: Fat loss begins",
      "Month 2+: Metabolic improvement",
      "Long-term: Stable energy levels"
    ],
    "risks": [
      "Carb cravings initially",
      "Less effective without calorie awareness",
      "May lack fiber if not planned well",
      "Social eating can be challenging"
    ],
    "macros": {
      "carbs": "15–25%",
      "protein": "25–35%",
      "fat": "40–50%"
    }
  },
  "Carnivore": {
    "what": "A zero-carb diet consisting exclusively of animal products — meat, fish, eggs, and some dairy. Eliminates all plant foods.",
    "purpose": [
      "Elimination diet for autoimmune issues",
      "Simplicity — no tracking needed",
      "High satiety",
      "Potential joint pain relief"
    ],
    "effects": [
      "Week 1: Digestion adjusts, possible fatigue",
      "Week 2–3: Energy stabilizes",
      "Month 1+: Weight loss, reduced inflammation",
      "Long-term: Highly individual results"
    ],
    "risks": [
      "Zero fiber — gut microbiome impact",
      "Very restrictive and socially difficult",
      "High saturated fat intake",
      "Nutritional gaps without careful planning"
    ],
    "macros": {
      "carbs": "0–2%",
      "protein": "30–40%",
      "fat": "60–70%"
    }
  },
  "Clean Eating": {
    "what": "A whole-foods approach that eliminates processed foods, refined sugar, and artificial ingredients. No strict macros — just real, minimally processed food.",
    "purpose": [
      "Overall health improvement",
      "Sustainable long-term lifestyle",
      "Natural energy",
      "Reduced inflammation"
    ],
    "effects": [
      "Week 1: Reduced bloating",
      "Month 1: Better skin, digestion, energy",
      "Month 2+: Gradual fat loss if in deficit",
      "Long-term: Disease risk reduction"
    ],
    "risks": [
      "Higher food cost",
      "Time-intensive meal prep",
      "Social eating is harder",
      "No guarantee of weight loss without calorie awareness"
    ],
    "macros": {
      "carbs": "40–50%",
      "protein": "25–30%",
      "fat": "25–30%"
    }
  },
  "Pescatarian": {
    "what": "A pescatarian eats fish and seafood but no other meat. Combined with vegetables, legumes, and whole grains, it is one of the most heart-healthy and sustainable diets.",
    "purpose": [
      "Heart health through omega-3s",
      "Sustainable protein sources",
      "High micronutrient intake",
      "Environmentally friendly"
    ],
    "effects": [
      "Week 1–2: Improved cholesterol",
      "Month 1: Better energy, lighter digestion",
      "Long-term: Reduced cardiovascular risk",
      "Skin: Omega-3s support glow and elasticity"
    ],
    "risks": [
      "Mercury risk in high-fish intake",
      "Limited protein variety when dining out",
      "Can be low in iron if red meat was primary source",
      "Requires careful meal planning"
    ],
    "macros": {
      "carbs": "40–50%",
      "protein": "25–30%",
      "fat": "25–30%"
    }
  },
  "Diabetic-Friendly": {
    "what": "A diabetic-friendly diet focuses on low glycemic index (GI) foods that stabilize blood sugar, reduce insulin spikes, and support long-term metabolic health.",
    "purpose": [
      "Blood sugar stabilization",
      "Reduced insulin resistance",
      "Weight management",
      "Prevention of diabetic complications"
    ],
    "effects": [
      "Days 1–7: Blood sugar stabilizes",
      "Week 2–4: Energy more consistent",
      "Month 2+: HbA1c may improve",
      "Long-term: Reduced risk of neuropathy and retinopathy"
    ],
    "risks": [
      "Requires consistent carb counting",
      "Social eating is more complex",
      "Some low-GI foods are calorie-dense",
      "Needs regular medical monitoring"
    ],
    "macros": {
      "carbs": "40–45% (low GI only)",
      "protein": "25–30%",
      "fat": "25–35%"
    }
  },
  "Low Sodium": {
    "what": "A low sodium diet restricts daily salt intake to under 1,500–2,000mg/day. It is prescribed for hypertension, heart disease, kidney conditions, and fluid retention.",
    "purpose": [
      "Lower blood pressure",
      "Reduce fluid retention",
      "Heart disease prevention",
      "Kidney health support"
    ],
    "effects": [
      "Week 1: Reduced bloating and water retention",
      "Month 1: Measurable blood pressure drop",
      "Long-term: Reduced stroke and heart attack risk",
      "Kidneys: Less strain and improved filtration"
    ],
    "risks": [
      "Food can taste bland initially — takes adjustment",
      "Hidden sodium in processed foods is hard to track",
      "Can be too restrictive if not managed properly",
      "Electrolyte imbalance if sodium drops too low"
    ],
    "macros": {
      "carbs": "40–50%",
      "protein": "25–30%",
      "fat": "25–30%"
    }
  },
  "Calorie Deficit": {
    "what": "A calorie deficit diet means consuming fewer calories than your body burns (TDEE). It is the universal principle behind fat loss — regardless of food type.",
    "purpose": [
      "Guaranteed fat loss when sustained",
      "No food group restrictions",
      "Flexible and sustainable",
      "Compatible with any other diet style"
    ],
    "effects": [
      "Week 1–2: Water weight drops, scale moves",
      "Week 3–4: True fat loss begins",
      "Month 2+: Noticeable body composition changes",
      "Long-term: Metabolic adaptation may slow progress"
    ],
    "risks": [
      "Too large a deficit causes muscle loss",
      "Hunger and fatigue if deficit is aggressive",
      "Can trigger disordered eating in susceptible individuals",
      "Requires accurate calorie tracking"
    ],
    "macros": {
      "carbs": "30–40%",
      "protein": "30–35%",
      "fat": "25–35%"
    }
  },
  "TTC": {
    "what": "A fertility-focused nutrition plan for those trying to conceive. Prioritizes folate, iron, zinc, omega-3s, and antioxidants that support reproductive health.",
    "purpose": [
      "Support egg and sperm quality",
      "Boost fertility hormones",
      "Build nutrient reserves for pregnancy",
      "Reduce inflammation affecting implantation"
    ],
    "effects": [
      "Week 1-2: Better energy and hormone balance",
      "Month 1: Improved cycle regularity",
      "Month 2+: Optimal nutrient stores built",
      "Long-term: Healthier pregnancy outcomes"
    ],
    "risks": [
      "Avoid raw fish and high-mercury seafood",
      "Limit caffeine to under 200mg/day",
      "Avoid alcohol completely",
      "Consult OB-GYN before supplementing"
    ],
    "macros": {
      "carbs": "40-50% low GI",
      "protein": "25-30%",
      "fat": "25-35% omega-3 rich"
    }
  }
}

export const ACTIVITIES = {
  "Keto": [
    {
      "icon": "🚶",
      "name": "Brisk Walking",
      "time": "30 min",
      "cal": "~150 kcal",
      "level": "Easy",
      "tip": "Ideal while in ketosis — fat-burning is sustained with low-intensity cardio.",
      "how": "Walk at a pace where you can talk but feel slightly breathless. Morning walks boost fat metabolism."
    },
    {
      "icon": "🧘",
      "name": "Yoga and Stretching",
      "time": "20-30 min",
      "cal": "~80 kcal",
      "level": "Easy",
      "tip": "Reduces cortisol, which helps prevent fat storage. Perfect on rest days.",
      "how": "Full-body stretch: neck rolls, shoulder stretch, hip flexor, hamstring, spinal twist. Hold each 30 sec."
    },
    {
      "icon": "🪜",
      "name": "Stair Climbing",
      "time": "10-15 min",
      "cal": "~100 kcal",
      "level": "Moderate",
      "tip": "Short bursts of stair work spike HGH and fat burning without breaking ketosis.",
      "how": "Go up and down stairs continuously for 10 min. Rest 1 min, repeat. No stairs? Step up on a sturdy chair."
    },
    {
      "icon": "💪",
      "name": "Bodyweight Squats",
      "time": "15 min",
      "cal": "~90 kcal",
      "level": "Moderate",
      "tip": "Preserves muscle on keto. Pair with protein intake after workout.",
      "how": "3 sets x 15 reps. Feet shoulder-width apart, sit back like onto a chair. Rest 60 sec between sets."
    },
    {
      "icon": "🏠",
      "name": "House Cleaning",
      "time": "30-45 min",
      "cal": "~130 kcal",
      "level": "Easy",
      "tip": "NEAT activity is highly effective on keto for daily calorie burn.",
      "how": "Vacuum, mop, scrub — keep moving continuously. Put on music and stay active throughout."
    },
    {
      "icon": "🤸",
      "name": "Jumping Jacks",
      "time": "10 min",
      "cal": "~80 kcal",
      "level": "Moderate",
      "tip": "Short cardio bursts tap into fat stores quickly — ideal for keto.",
      "how": "3 rounds of 1 min on, 30 sec rest. Keep arms straight and land softly on the balls of your feet."
    }
  ],
  "Low Carb": [
    {
      "icon": "🚴",
      "name": "Stationary Cycling",
      "time": "20-30 min",
      "cal": "~200 kcal",
      "level": "Moderate",
      "tip": "Great for burning extra carbs without over-taxing glycogen stores.",
      "how": "Moderate pace for 20 min. No bike? March in place with high knees at the same intensity."
    },
    {
      "icon": "🚶",
      "name": "Power Walking",
      "time": "30 min",
      "cal": "~160 kcal",
      "level": "Easy",
      "tip": "Elevates heart rate gently — good for everyday low-carb fat burning.",
      "how": "Swing your arms actively. Walk at a brisk pace. Include slight inclines if possible."
    },
    {
      "icon": "🤸",
      "name": "Jump Rope",
      "time": "15 min",
      "cal": "~150 kcal",
      "level": "Moderate",
      "tip": "High-calorie burn in short time — pairs well with low-carb eating.",
      "how": "No rope? Simulate the movement: bounce lightly on feet, swinging arms in circles. 1 min on, 30 sec rest."
    },
    {
      "icon": "🏋️",
      "name": "Water Bottle Circuit",
      "time": "20 min",
      "cal": "~140 kcal",
      "level": "Moderate",
      "tip": "Resistance training preserves lean muscle on low-carb diets.",
      "how": "Use water bottles as weights. Do bicep curls, shoulder press, rows. 3 rounds x 12 reps each."
    },
    {
      "icon": "🧘",
      "name": "Pilates Core Work",
      "time": "20 min",
      "cal": "~80 kcal",
      "level": "Easy",
      "tip": "Strengthens deep core muscles without spiking hunger.",
      "how": "Lie on back: 15 crunches, 30-sec plank, 15 leg raises, 30-sec side plank. Repeat twice."
    },
    {
      "icon": "🪜",
      "name": "Step-Ups",
      "time": "15 min",
      "cal": "~110 kcal",
      "level": "Moderate",
      "tip": "Functional lower-body exercise that burns well without cardio equipment.",
      "how": "Use a sturdy step or chair. Step up right foot, bring left up, step down. 3 sets x 12 per leg."
    }
  ],
  "Carnivore": [
    {
      "icon": "💪",
      "name": "Heavy Compound Lifts",
      "time": "30 min",
      "cal": "~180 kcal",
      "level": "Intense",
      "tip": "Carnivore high protein intake makes it ideal for muscle building. Train hard.",
      "how": "Squats (3x10), push-ups (3x15), rows with a bag (3x12). Rest 90 sec. Focus on full range of motion."
    },
    {
      "icon": "🏃",
      "name": "Sprint Intervals",
      "time": "15 min",
      "cal": "~180 kcal",
      "level": "Intense",
      "tip": "Short all-out sprints match carnivore high-energy fuel system.",
      "how": "Sprint 20 sec, walk 40 sec. Repeat 8-10 times. Can be done in place with high-knees sprinting."
    },
    {
      "icon": "🚶",
      "name": "Long Slow Walks",
      "time": "45-60 min",
      "cal": "~200 kcal",
      "level": "Easy",
      "tip": "Carnivore athletes combine LISS with heavy lifting. Walks aid recovery.",
      "how": "Fasted morning walk at a comfortable pace. Focus on breathing and posture."
    },
    {
      "icon": "🤸",
      "name": "Calisthenics Circuit",
      "time": "20 min",
      "cal": "~160 kcal",
      "level": "Intense",
      "tip": "Bodyweight training on carnivore builds serious functional strength.",
      "how": "10 pull-ups (use table edge), 20 push-ups, 15 dips on chair, 30-sec plank. 3 rounds, 1 min rest."
    },
    {
      "icon": "🧘",
      "name": "Mobility Work",
      "time": "15 min",
      "cal": "~40 kcal",
      "level": "Easy",
      "tip": "Meat-heavy diets can cause stiffness. Daily mobility keeps joints healthy.",
      "how": "Roll out quads, glutes, upper back. Hold sore spots 30 sec. Follow with hip circles and thoracic rotations."
    },
    {
      "icon": "🪜",
      "name": "Loaded Stair Carries",
      "time": "10 min",
      "cal": "~120 kcal",
      "level": "Intense",
      "tip": "Carrying weight up stairs builds functional strength aligned with carnivore goals.",
      "how": "Fill a backpack with books. Walk up and down stairs for 10 min continuously. Keep back straight."
    }
  ],
  "Clean Eating": [
    {
      "icon": "🚶",
      "name": "Nature Walk",
      "time": "40 min",
      "cal": "~170 kcal",
      "level": "Easy",
      "tip": "Clean eating and nature walks share a holistic wellness mindset. Reduces stress hormones.",
      "how": "Find a park or quiet street. Walk mindfully — no phone. Notice your surroundings. Breathe deeply."
    },
    {
      "icon": "🧘",
      "name": "Morning Yoga Flow",
      "time": "25 min",
      "cal": "~90 kcal",
      "level": "Easy",
      "tip": "Aligns with clean eating whole-person wellness philosophy. Reduces cortisol.",
      "how": "Sun salutation x5, warrior I and II, downward dog, childs pose. Follow a YouTube guided flow if unsure."
    },
    {
      "icon": "🤸",
      "name": "Dance Cardio",
      "time": "30 min",
      "cal": "~200 kcal",
      "level": "Moderate",
      "tip": "Fun and sustainable — keeps you consistent without feeling like exercise.",
      "how": "Put on upbeat music and dance freely for 30 min. Or follow a Zumba or dance fitness video online."
    },
    {
      "icon": "🏋️",
      "name": "Resistance Band Workout",
      "time": "25 min",
      "cal": "~130 kcal",
      "level": "Moderate",
      "tip": "Tones muscle and burns fat — complement to clean eating body composition goals.",
      "how": "Band exercises: squat pull-apart, lateral walks, rows, bicep curls, glute bridges. 3x15 each."
    },
    {
      "icon": "🚴",
      "name": "Cycling",
      "time": "30 min",
      "cal": "~220 kcal",
      "level": "Moderate",
      "tip": "Aerobic base training pairs beautifully with clean whole-food carbohydrates.",
      "how": "Moderate effort — you should be able to speak short sentences. Steady pace throughout."
    },
    {
      "icon": "🏠",
      "name": "Garden or Outdoor Chores",
      "time": "30-45 min",
      "cal": "~140 kcal",
      "level": "Easy",
      "tip": "NEAT activity fully aligned with clean eating connection-to-nature philosophy.",
      "how": "Weeding, watering, raking, sweeping — keep moving. Do it mindfully as active meditation."
    }
  ],
  "Pescatarian": [
    {
      "icon": "🏊",
      "name": "Swimming",
      "time": "30 min",
      "cal": "~250 kcal",
      "level": "Moderate",
      "tip": "Perfect for pescatarians — the ocean and pool connection matches the seafood lifestyle.",
      "how": "Swim laps at a comfortable pace. No pool? Do standing aerobics or simulate swimming arms while jogging."
    },
    {
      "icon": "🚶",
      "name": "Beach or Park Walking",
      "time": "40 min",
      "cal": "~160 kcal",
      "level": "Easy",
      "tip": "Walking on soft surfaces like sand increases calorie burn by 30 percent vs pavement.",
      "how": "Walk barefoot on grass or sand when safe. Engage core, swing arms naturally."
    },
    {
      "icon": "🧘",
      "name": "Pilates",
      "time": "25 min",
      "cal": "~90 kcal",
      "level": "Easy",
      "tip": "Lean pescatarian physique is well-supported by core-strengthening pilates.",
      "how": "Hundred exercise, single leg stretch, roll-up, side plank, swan. Follow a beginner Pilates video."
    },
    {
      "icon": "🚴",
      "name": "Cycling",
      "time": "30 min",
      "cal": "~200 kcal",
      "level": "Moderate",
      "tip": "Sustainable cardio paired with omega-3-rich diet speeds fat loss.",
      "how": "Steady-state ride at moderate effort. Aim to keep heart rate at 60-70 percent of max."
    },
    {
      "icon": "💪",
      "name": "Resistance Training",
      "time": "25 min",
      "cal": "~140 kcal",
      "level": "Moderate",
      "tip": "Fish protein supports excellent muscle recovery — strength train 3 times per week.",
      "how": "Push-ups, dumbbell rows, split squats, overhead press. 3 rounds x 12 reps."
    },
    {
      "icon": "🤸",
      "name": "Jump Rope",
      "time": "15 min",
      "cal": "~180 kcal",
      "level": "Moderate",
      "tip": "High-intensity cardio in short bursts maximizes omega-3 anti-inflammatory benefits.",
      "how": "1 min rope (or simulated), 30 sec rest. 10 rounds. Shake hands loose between rounds."
    }
  ],
  "Diabetic-Friendly": [
    {
      "icon": "🚶",
      "name": "Post-Meal Walking",
      "time": "10-15 min",
      "cal": "~60 kcal",
      "level": "Easy",
      "tip": "Walking 10 min after eating is clinically proven to lower post-meal blood sugar spikes.",
      "how": "Walk at a gentle pace within 30 min of eating. Even indoors around the house counts. Do after every meal."
    },
    {
      "icon": "🧘",
      "name": "Chair Yoga",
      "time": "20 min",
      "cal": "~50 kcal",
      "level": "Easy",
      "tip": "Reduces stress hormones that spike blood sugar. Safe for all fitness levels.",
      "how": "Seated neck rolls, seated twists, seated forward bend, seated leg raises. Use any sturdy chair."
    },
    {
      "icon": "🚴",
      "name": "Stationary Bike",
      "time": "20-30 min",
      "cal": "~150 kcal",
      "level": "Easy",
      "tip": "Low-impact cardio that improves insulin sensitivity safely.",
      "how": "Slow comfortable pace. No bike? March in place lifting knees high for the same duration."
    },
    {
      "icon": "💪",
      "name": "Resistance Bands",
      "time": "20 min",
      "cal": "~100 kcal",
      "level": "Easy",
      "tip": "Muscle building improves insulin sensitivity — every kg of muscle helps glucose regulation.",
      "how": "Seated or standing: rows, bicep curls, leg press against wall. 3x15 slow controlled reps."
    },
    {
      "icon": "🤸",
      "name": "Gentle Stretching",
      "time": "15 min",
      "cal": "~40 kcal",
      "level": "Easy",
      "tip": "Improves circulation in feet and legs — critical for diabetic foot health.",
      "how": "Focus on calves, ankles, hamstrings, and lower back. Hold each stretch 30-60 sec. Never bounce."
    },
    {
      "icon": "🏠",
      "name": "Housework Intervals",
      "time": "30 min",
      "cal": "~110 kcal",
      "level": "Easy",
      "tip": "Frequent low-intensity movement throughout the day keeps blood sugar steadier than one big workout.",
      "how": "Set a timer: 15 min of cleaning, 5 min rest, 15 min more. Keeps you moving in manageable bursts."
    }
  ],
  "Low Sodium": [
    {
      "icon": "🚶",
      "name": "Daily Walking",
      "time": "30-45 min",
      "cal": "~150 kcal",
      "level": "Easy",
      "tip": "Lowers blood pressure naturally — combining with low sodium diet doubles the effect.",
      "how": "Walk at a brisk but comfortable pace. Morning walks before breakfast are especially effective."
    },
    {
      "icon": "🧘",
      "name": "Deep Breathing",
      "time": "10-15 min",
      "cal": "~20 kcal",
      "level": "Easy",
      "tip": "Activates parasympathetic nervous system, directly reducing blood pressure.",
      "how": "Inhale 4 counts, hold 4, exhale 6. Repeat for 10 min. Can be done lying down or seated."
    },
    {
      "icon": "🤸",
      "name": "Gentle Stretching",
      "time": "20 min",
      "cal": "~50 kcal",
      "level": "Easy",
      "tip": "Improves circulation and helps kidneys flush excess sodium more efficiently.",
      "how": "Focus on neck, shoulders, chest, hips, calves. Hold 30 sec each. Breathe deeply throughout."
    },
    {
      "icon": "🚴",
      "name": "Low-Intensity Cycling",
      "time": "30 min",
      "cal": "~150 kcal",
      "level": "Easy",
      "tip": "Aerobic exercise strengthens the heart and reduces the workload that high sodium creates.",
      "how": "Very comfortable pace. Aim for light sweat only — avoid intense cardio when managing hypertension."
    },
    {
      "icon": "💪",
      "name": "Light Resistance Training",
      "time": "20 min",
      "cal": "~100 kcal",
      "level": "Easy",
      "tip": "Builds heart-healthy muscle. Avoid heavy lifting or breath-holding with hypertension.",
      "how": "Use light resistance. No straining. Exercises: seated rows, light squats, calf raises. Breathe every rep."
    },
    {
      "icon": "🏊",
      "name": "Water Walking",
      "time": "30 min",
      "cal": "~200 kcal",
      "level": "Easy",
      "tip": "Water pressure assists circulation and has a natural calming effect on blood pressure.",
      "how": "Walk laps in shallow pool water. The resistance gives a gentle full-body workout."
    }
  ],
  "Calorie Deficit": [
    {
      "icon": "🏃",
      "name": "Jogging",
      "time": "25-30 min",
      "cal": "~280 kcal",
      "level": "Moderate",
      "tip": "Highest calorie burn per minute — ideal for creating a deeper deficit.",
      "how": "Run at a conversational pace. Jog 5 min, walk 2 min, repeat. Build up weekly."
    },
    {
      "icon": "🤸",
      "name": "HIIT Circuit",
      "time": "20 min",
      "cal": "~250 kcal",
      "level": "Intense",
      "tip": "Afterburn effect keeps burning calories for hours after workout.",
      "how": "Burpees 30 sec, rest 15 sec. Jump squats 30 sec, rest 15 sec. Mountain climbers 30 sec, rest 15 sec. 5 rounds."
    },
    {
      "icon": "🪜",
      "name": "Stair Climbing",
      "time": "20 min",
      "cal": "~180 kcal",
      "level": "Moderate",
      "tip": "High calorie burn, zero equipment. One of the most efficient home exercises for deficit dieting.",
      "how": "Go up and down stairs continuously for 20 min. Hold rail if needed. Two steps at a time to increase intensity."
    },
    {
      "icon": "💃",
      "name": "Dance Workout",
      "time": "30 min",
      "cal": "~240 kcal",
      "level": "Moderate",
      "tip": "High calorie burn in an enjoyable format — improves adherence to exercise routine.",
      "how": "Follow a dance fitness YouTube video or freestyle to upbeat music for 30 min non-stop."
    },
    {
      "icon": "🚶",
      "name": "Weighted Walking",
      "time": "40 min",
      "cal": "~220 kcal",
      "level": "Easy",
      "tip": "Adding a backpack with 5 kg increases calorie burn by 20 percent with minimal joint stress.",
      "how": "Fill a backpack with books or bottles. Walk at normal pace. Great for daily deficit without fatigue."
    },
    {
      "icon": "💪",
      "name": "Full Body Strength",
      "time": "25 min",
      "cal": "~180 kcal",
      "level": "Moderate",
      "tip": "Muscle mass increases BMR — every kg of muscle burns extra calories at rest, amplifying deficit.",
      "how": "Push-ups, squats, rows, lunges, plank. 45 sec on, 15 sec rest. 4 full rounds."
    }
  ]
}

// Fallback activity set for any diet mode without its own list (e.g. TTC).
export const FALLBACK_ACTIVITIES = [
  {
    "icon": "🚶",
    "name": "Nature Walk",
    "time": "40 min",
    "cal": "~170 kcal",
    "level": "Easy",
    "tip": "Clean eating and nature walks share a holistic wellness mindset. Reduces stress hormones.",
    "how": "Find a park or quiet street. Walk mindfully — no phone. Notice your surroundings. Breathe deeply."
  },
  {
    "icon": "🧘",
    "name": "Morning Yoga Flow",
    "time": "25 min",
    "cal": "~90 kcal",
    "level": "Easy",
    "tip": "Aligns with clean eating whole-person wellness philosophy. Reduces cortisol.",
    "how": "Sun salutation x5, warrior I and II, downward dog, childs pose. Follow a YouTube guided flow if unsure."
  },
  {
    "icon": "🤸",
    "name": "Dance Cardio",
    "time": "30 min",
    "cal": "~200 kcal",
    "level": "Moderate",
    "tip": "Fun and sustainable — keeps you consistent without feeling like exercise.",
    "how": "Put on upbeat music and dance freely for 30 min. Or follow a Zumba or dance fitness video online."
  },
  {
    "icon": "🏋️",
    "name": "Resistance Band Workout",
    "time": "25 min",
    "cal": "~130 kcal",
    "level": "Moderate",
    "tip": "Tones muscle and burns fat — complement to clean eating body composition goals.",
    "how": "Band exercises: squat pull-apart, lateral walks, rows, bicep curls, glute bridges. 3x15 each."
  },
  {
    "icon": "🚴",
    "name": "Cycling",
    "time": "30 min",
    "cal": "~220 kcal",
    "level": "Moderate",
    "tip": "Aerobic base training pairs beautifully with clean whole-food carbohydrates.",
    "how": "Moderate effort — you should be able to speak short sentences. Steady pace throughout."
  },
  {
    "icon": "🏠",
    "name": "Garden or Outdoor Chores",
    "time": "30-45 min",
    "cal": "~140 kcal",
    "level": "Easy",
    "tip": "NEAT activity fully aligned with clean eating connection-to-nature philosophy.",
    "how": "Weeding, watering, raking, sweeping — keep moving. Do it mindfully as active meditation."
  }
]
