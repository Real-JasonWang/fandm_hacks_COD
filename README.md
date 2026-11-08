

<div align="center">

<img src="./public/logo-banner.png" alt="Call of Doodie Banner" width="680" style="border-radius: 16px; margin: 16px auto; display: block; max-width: 100%; box-shadow: 0 8px 30px rgba(0,0,0,0.08);" />

# Call of Doodie 💩



[![Made for F&M](https://img.shields.io/badge/F_%26_M-Diplomats-blue?style=for-the-badge&logo=target)](https://www.fandm.edu)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [System Flowchart](#-how-call-of-doodie-works-complete-architecture) • [House Cup](#-college-house-cup) • [Map & Restrooms](#-campus-restroom-finder) • [Privacy First](#-privacy--safety-first) • [Theme System](#-7-candy-palettes--dark-mode) • [Quick Start](#-quick-start)

</div>

---

## What is Call of Doodie?

Poop is a big part of our daily life and well being. 

How easily and regularly your body digests food is one of the clearest signs of how well you're resting and drinking water. It tells doctors about our overall health, and you probably remember how good you felt after a good poop day. So why don't we talk about it? 

In college, life is busy and stressful. Late-night study sessions in Shadek, D-Hall food, and midterm crunch times can mess with your sleep, water habits, and digestion. 

**Call of Doodie** makes tracking your routine simple, private, and fun for F&M students. Check in daily, compete anonymously for your college house, and find the cleanest, nearest restroom anywhere on campus! 

---

## Key Features

### 🏆 College House Cup

- **8 campus buildings**: Ware College House, Bonchek College House, Weis College House, Brooks College House, Roschel College House, Schnader Hall, Thomas Hall, and Dietz Hall.  
- **Fair Evaluation**: Balanced for different dorm populations so smaller halls like Dietz compete on equal footing with large houses like Ware\!  
- **Rewarding Habits, Not Perfection**: Points reward regular logging and self-care, never penalizing students.  
- **100% Anonymous**: Only total community points and participation rates appear on the leaderboard, never personal logs or names\!

### 🗺️ Campus Restroom Finder

- **Interactive Campus Spatial Map**: Official Franklin & Marshall College Concept3D interactive map embedded right in the app.  
- **Smart Filters**: Find All-Gender restrooms, ADA-accessible stalls, single-stall quiet spaces, and period product dispensers.  
- **Real-Time Student Cleanliness Reports**: Report needs like soap refills, cleaning requests, or plumbing fixes with one tap to keep campus clean.  
- **GPS Distance Estimator**: Displays walking distance in meters and minutes from anywhere on the Quad or across campus.  
- **Automatic Night Map**: Smoothly adapts to dark mode without harsh white map glare\!

### 📝 Private Daily Check-ins

- **10-Second Manual Log**: Tap your Bristol scale stool type (1 to 7), water intake, sleep hours, and daily stress level.  
- **AI Photo Check (Optional)**: Instant shape and digestion check powered by privacy-first vision. Images are blurred in memory immediately and **never stored to disk or uploaded to any server**.
- **Voice & Chat Log**: Simply type or speak how you feel (*"Slept 7 hours, drank 6 glasses of water, smooth digestion"*), and smart parsing fills out your daily form\!  
- **Helpful Post-Check-in Tips**: After every log, receive friendly, high-school-level wellness advice on water, fiber, and sleep to help you feel your best tomorrow.

---

## ⚡ How Call of Doodie Works (Complete Architecture)

Here is a full breakdown of how our app handles privacy, AI vision, voice parsing, health triage, fair House Cup scoring, and campus maps:

```mermaid
flowchart TD
    %% SUBGRAPH 1: ONBOARDING & PRIVACY
    subgraph S1["1. Student Access and Privacy Choice"]
        A1["Student opens Call of Doodie on Phone or Laptop"] --> A2{"Pick Your App Vibe"}
        A2 -->|"Playful Mode"| A3["Full Experience with Emojis, Confetti, and AI Tools"]
        A2 -->|"Discreet Mode"| A4["Clean 'Gut Log' with Zero Emojis and AI Disabled for Class"]
        A3 --> A5["Select College House: Ware, Bonchek, Weis, Brooks, Roschel, Schnader, Thomas, or Dietz"]
        A4 --> A5
        A5 --> A6["Local Storage Shield: Health data stays 100% on device, never sold or tracked"]
    end

    %% SUBGRAPH 2: CHECK-IN ENGINE (3 PATHS)
    subgraph S2["2. Triple-Track Daily Check-In Engine"]
        A6 --> B0{"How do you want to log today?"}
        
        %% Track A: Manual Quick Log
        B0 -->|"Option A: 10-Sec Quick Log"| B1["Tap Bristol Stool Scale Type 1 to 7"]
        B1 --> B2["Set Sleep Hours, Water Glasses, Veggie Servings, and Stress Level"]
        
        %% Track B: AI Vision Photo Check
        B0 -->|"Option B: AI Photo Check"| C1["Take or upload photo of toilet bowl"]
        C1 --> C2["Zero-Disk Shield: Photo is blurred in memory instantly and never written to disk"]
        C2 --> C3["AI Anti-Spoofing Check: Confirms real toilet bowl and bowel movement"]
        C3 --> C4["Gemini 3.5 Flash-Lite Multimodal Vision Engine"]
        C4 --> C5["4-Stage Reasoning: Shape, Moisture in Water, Type Decision, Digestion Speed"]
        C5 --> C6["Auto-fills Bristol Type, Soiling Level, and Symptoms into Form"]
        
        %% Track C: Voice & NLP Chat Log
        B0 -->|"Option C: Voice and Chat Log"| D1["Type or speak what happened in plain English"]
        D1 --> D2["Gemini NLP Parser with Smart Regex Fallback"]
        D2 --> D3["Pulls out Sleep, Water, Stress, and Digestion details"]
        D3 --> D4["Auto-populates check-in fields for quick student review"]
    end

    %% SUBGRAPH 3: SAFETY TRIAGE
    subgraph S3["3. Red Flag Safety Triage and Health Alerts"]
        B2 --> E1{"Check for Urgent Warning Signs"}
        C6 --> E1
        D4 --> E1
        
        E1 -->|"Blood, severe black stool, or extreme pain"| E2["TRIGGER RED FLAG HEALTH ALERT"]
        E2 --> E3["Show Emergency Guidance + 1-Tap Buttons for F&M Wellness Center and 911"]
        
        E1 -->|"Normal or mild daily symptoms"| F1["Generate Custom Daily Health Tips"]
        F1 --> F2["Sleep Rhythm Advice: How last night affects your morning digestion"]
        F1 --> F3["Hydration Advice: Drink tips based on stool moisture and water intake"]
        F1 --> F4["Dining Hall Tips: Salad, fruit, and fiber suggestions for D-Hall"]
    end

    %% SUBGRAPH 4: FAIR HOUSE CUP ENGINE
    subgraph S4["4. Fair College House Cup Scoring Algorithm"]
        F2 --> G1["Calculate Daily Points"]
        F3 --> G1
        F4 --> G1
        
        G1 --> G2["+10 Points: Daily Check-In Streak"]
        G1 --> G3["+5 Points: Hydration and Self-Care Goals"]
        G1 --> G4["3+ Days Consistency Multiplier"]
        
        G2 --> H1["Dorm Size Fair-Weighting Math Formula"]
        G3 --> H1
        G4 --> H1
        
        H1 --> H2["Equalizes Big Houses (Ware, Bonchek ~350 students) and Small Halls (Dietz, Thomas ~100 students)"]
        H2 --> H3["100% Anonymous House Leaderboard Update"]
        H3 --> H4["Only House Totals are displayed; student names and logs are never visible"]
    end

    %% SUBGRAPH 5: CAMPUS RESTROOM DISCOVERY
    subgraph S5["5. Campus Restroom and Facility Finder"]
        A1 --> M1["Open Campus Restroom Map Tab"]
        M1 --> M2["Embedded Official F&M Concept3D Campus Map API"]
        M2 --> M3{"Filter Campus Restrooms"}
        M3 --> M4["All-Gender Restrooms"]
        M3 --> M5["ADA Wheelchair Accessible"]
        M3 --> M6["Quiet Single-Stall Spots"]
        M3 --> M7["Period Product Dispensers"]
        
        M4 --> M8["GPS Distance Estimator: Walking meters and minutes across the Quad"]
        M5 --> M8
        M6 --> M8
        M7 --> M8
        
        M8 --> M9["Student Cleanliness Crowdsourcing: 1-tap report for soap, paper, or cleaning needed"]
    end

    %% SUBGRAPH 6: REWARDS & HABIT LOOP
    subgraph S6["6. Daily Habit Loop and Student Motivation"]
        H4 --> R1["Celebrate Check-In with Tactile Apple Bouncy Physics and Confetti"]
        R1 --> R2["Earn Weekly House Badges: Hydration Hero, Consistency Champion, Gut Guardian"]
        R2 --> R3["Review 7-Day History Trends in Personal Private Diary"]
        R3 --> R4["Build Healthier College Routines Day by Day!"]
    end
```

### 🔍 How Each Stage Works

1. **Student Access & Privacy First**: Students choose between **Playful Mode** (emojis, AI camera, and cheers) and **Discreet Mode** ("Gut Log" for quiet lecture halls). All health logs stay inside local browser storage.
2. **Triple-Track Check-In**: Students can log manually in 10 seconds, snap an optional blurred photo via **Gemini 3.5 Flash-Lite** (1.6-second speed, 500 free requests per day), or speak/type naturally to auto-fill the form.
3. **Safety Triage & Tips**: If red flags like bleeding or severe pain are logged, immediate emergency guidance pops up with one-tap calls to the F&M Diplomat Wellness Center and 911. Otherwise, students get personalized advice on sleep, water, and dining hall fiber.
4. **Fair House Cup Algorithm**: Points are weighted mathematically by dorm size, ensuring small dorms (Dietz, Thomas) compete fairly with massive houses (Ware, Bonchek). Leaderboards are 100% anonymous.
5. **Campus Restroom Finder**: Integrates F&M's official Concept3D map, calculates walking distances across campus, filters by ADA/gender neutrality, and crowdsources soap/cleanliness reports.
6. **Habit Loop**: Keeps students coming back with Apple-style tactile physics, streak badges, 7-day health charts, and confetti celebrations.

---

## Two Interface Vibes

We know you might be checking in while sitting with roommates in Hartman Green, or quietly during a lecture in Keiper:

| Vibe | Look & Feel | Best For |
| :---- | :---- | :---- |
| **💩 Playful** | Confetti, cheerful emojis, Bristol shapes, full AI tools, and house cheers\! | Relaxing in your dorm, celebrating streaks, and having fun with campus friends. |
| **🌿 Discreet** | Minimalist look named "Gut Log", no jokes or poop emojis, AI tools disabled. | Quiet in-class logs, library check-ins, and zero-distraction wellness tracking. |

---

## Palettes & Dark Mode

Pick your favorite color in **Settings & Preferences**! The app updates cleanly with smooth Apple styling:

- 🍑 **Warm Peach** · Cozy, energetic sunset orange  
- 🎓 **Diplomat Blue** · Proud F&M True Blue  
- 🍵 **Fresh Matcha** · Calm soothing sage green  
- 💜 **Royal Lavender** · Elegant iris purple  
- 🍯 **Sunset Amber** · Golden hour warm honey  
- 🌸 **Cherry Blossom** · Soft strawberry rose pink  
- 🌊 **Ocean Teal** · Crisp Pacific breeze cyan

> **Dark Mode:** Supports **Auto (Matches Device)**, **Light Mode**, and **Dark Mode**.

---

## Privacy & Safety First

1. **Zero-Disk Photo Stream**: Camera checks analyze images purely in temporary device memory (RAM). Photos are blurred right away and deleted immediately after grading.  
2. **Local Session Protection**: Personal health logs stay private in your local browser storage.  
3. **Red Flag Health Alerts**: If you log warning signs like bad stomach pain or unusual symptoms, the app shows helpful tips and one-tap contact buttons for F&M Student Wellness (Diplomat Center) and 911.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19 \+ TypeScript \+ Vite 8  
- **Styling**: Tailwind CSS v4 with custom CSS Apple design tokens  
- **Icons & Visuals**: Handcrafted Apple Bristol SVGs \+ Lucide React \+ Canvas Confetti  
- **Typography**: `@fontsource/nunito` (200-900 weights)  
- **Map System**: Concept3D Spatial API Embed (Layers 32461 & 57938\)  
- **AI Engine (Opt-in)**: Google GenAI SDK (`@google/genai` Gemini 3.5 Flash-Lite / 500 RPD free tier)

---

## 🚀 Quick Start

### 1\. Clone the repository

```sh
git clone https://github.com/Real-JasonWang/fandm_hacks_COD.git
cd fandm_hacks_COD
```

### 2\. Install dependencies

```sh
npm install
```

### 3\. Start local development server

```sh
npm run dev
```

Open `http://localhost:5173` in your browser\!

### 4\. Build for production

```sh
npm run build
```

---

## 🏛️ Franklin & Marshall College Houses & Halls

- 💜 **Roschel College House**  
- ❤️ **Bonchek College House**  
- 💛 **Brooks College House**  
- 💙 **Ware College House**  
- 💚 **Weis College House**  
- 🔷 **Schnader Hall**  
- 🟢 **Thomas Hall**  
- 🍊 **Dietz Hall**