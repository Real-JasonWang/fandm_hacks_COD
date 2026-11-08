

<div align="center">

<img src="./public/logo-banner.png" alt="Call of Doodie Banner" width="680" style="border-radius: 16px; margin: 16px auto; display: block; max-width: 100%; box-shadow: 0 8px 30px rgba(0,0,0,0.08);" />

# Call of Doodie 💩



[![Made for F&M](https://img.shields.io/badge/F_%26_M-Diplomats-blue?style=for-the-badge&logo=target)](https://www.fandm.edu)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [System Flowchart](#-system-architecture-flowchart) • [AI Precision Pipeline](#-ai-precision-vision-pipeline) • [House Cup](#-college-house-cup) • [Map & Restrooms](#-campus-restroom-finder) • [Privacy First](#-privacy--safety-first) • [Theme System](#-7-candy-palettes--dark-mode) • [Quick Start](#-quick-start)

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

## ⚡ Architecture Flowchart

```mermaid
flowchart TD
    %% 1. STUDENT ONBOARDING & PRIVACY VAULT
    subgraph S1["1. Student Access & Privacy Shield"]
        A1["Student Opens Call of Doodie on Phone or Laptop"] --> A2{"Choose Your App Vibe"}
        A2 -->|"💩 Playful Mode"| A3["Full Fun Vibe: Emojis, Confetti, Badges, and AI Tools"]
        A2 -->|"🌿 Discreet Mode"| A4["Minimalist 'Gut Log': Zero Emojis, Quiet for Class, AI Disabled"]
        A3 --> A5["Select College House or Hall (Ware, Bonchek, Weis, Brooks, Roschel, Schnader, Thomas, Dietz)"]
        A4 --> A5
        A5 --> A6{"Choose Login Method"}
        A6 -->|"1-Click Test Demo"| A7["Instant Demo Session: diplomat@fandm.edu"]
        A6 -->|"Private Student Auth"| A8["Student Email Login: @fandm.edu"]
        A7 --> A9["Local Device Vault: All health logs saved in browser storage with Zero Tracking"]
        A8 --> A9
    end

    %% 2. 3-WAY INPUT ENGINE
    subgraph S2["2. 3-Way Daily Check-In Engine"]
        A9 --> B0{"How do you want to check in today?"}
        
        %% Option A: 10-Second Quick Log
        B0 -->|"Option A: 10-Sec Quick Log"| B1["Bristol Stool Scale Slider: Tap Type 1 to 7"]
        B1 --> B2["Sleep Hours Slider (0 to 14 Hours)"]
        B2 --> B3["Water Tracker (1 to 10 Glasses)"]
        B3 --> B4["Dining Hall Veggie Counter (0 to 10 Servings)"]
        B4 --> B5["Daily Stress Level (Calm, Okay, Meh, Stressed, Overwhelmed)"]
        
        %% Option B: AI Vision Photo Check
        B0 -->|"Option B: AI Photo Check"| C1["Take or upload photo of toilet bowl"]
        C1 --> C2["Zero-Disk Shield: Photo is blurred in memory instantly and never written to disk"]
        C2 --> C3["AI Vision Precision Pipeline (See Detailed AI Flowchart Below)"]
        C3 --> C4["Auto-fills Bristol Type, Soiling Level, and Symptoms into Form"]
        
        %% Option C: Voice & NLP Chat Log
        B0 -->|"Option C: Voice & Chat Log"| D1["Type or speak what happened in plain English"]
        D1 --> D2["Gemini NLP Parser with Smart Regex Fallback"]
        D2 --> D3["Extracts Sleep, Water, Veggies, Stress, and Digestion details"]
        D3 --> D4["Auto-populates check-in fields for quick student review"]
    end

    %% 3. SAFETY TRIAGE & HEALTH GUIDANCE
    subgraph S3["3. Red Flag Health Triage & Daily Advice"]
        B5 --> E1{"Scan for Critical Warning Signs"}
        C4 --> E1
        D4 --> E1
        
        E1 -->|"Blood, dark tarry stool, or severe pain"| E2["TRIGGER RED FLAG HEALTH ALERT"]
        E2 --> E3["Instant Emergency Guidance + 1-Tap Call to F&M Wellness Center and 911"]
        
        E1 -->|"Normal or mild daily symptoms"| F1["Personalized Daily Advice Engine"]
        F1 --> F2["Sleep Rhythm Guidance: How sleep cycles affect gut digestion"]
        F1 --> F3["Hydration Tips: Water balance based on stool moisture"]
        F1 --> F4["Dining Hall Tips: Salad, fruit, and fiber suggestions for D-Hall"]
        F1 --> F5["Stress Relief: 5-minute breathing break when stress is high"]
    end

    %% 4. FAIR HOUSE CUP ALGORITHM
    subgraph S4["4. Fair College House Cup Scoring Algorithm"]
        F2 --> G1["Calculate Daily Points"]
        F3 --> G1
        F4 --> G1
        F5 --> G1
        
        G1 --> G2["+10 Points: Daily Check-In Streak"]
        G1 --> G3["+5 Points: Hydration Goal (6+ glasses)"]
        G1 --> G4["+5 Points: Fiber & Balanced Meal Goal"]
        G1 --> G5["3+ Days Consistency Multiplier: Unlocks House Cup Points"]
        
        G2 --> H1["Dorm Size Fair-Weighting Formula"]
        G3 --> H1
        G4 --> H1
        G5 --> H1
        
        H1 --> H2["Equalizes Large Houses (Ware, Bonchek ~350 students) and Small Halls (Dietz, Thomas ~100 students)"]
        H2 --> H3["100% Anonymous House Leaderboard Update"]
        H3 --> H4["Only House Totals are displayed; individual names and logs are never visible"]
    end

    %% 5. CAMPUS RESTROOM DISCOVERY & CROWDSOURCING
    subgraph S5["5. Campus Restroom Finder & Facility Map"]
        A1 --> M1["Open Campus Restroom Map Tab"]
        M1 --> M2["Embedded Official F&M Concept3D Campus Map API"]
        M2 --> M3{"Filter Campus Restrooms"}
        M3 --> M4["All-Gender Restrooms"]
        M3 --> M5["ADA Wheelchair Accessible"]
        M3 --> M6["Quiet Single-Stall Spots"]
        M3 --> M7["Period Product Dispensers"]
        
        M4 --> M8["GPS Distance Estimator: Walking meters and minutes from anywhere on the Quad"]
        M5 --> M8
        M6 --> M8
        M7 --> M8
        
        M8 --> M9["Student Cleanliness Crowdsourcing: 1-tap report for soap refill, paper shortage, or cleaning needed"]
    end

    %% 6. HABIT LOOP & REWARDS
    subgraph S6["6. Daily Habit Loop & Student Rewards"]
        H4 --> R1["Celebrate Check-In with Tactile Apple Bouncy Physics and Confetti"]
        R1 --> R2["Earn Weekly House Badges: Hydration Hero, Consistency Champion, Gut Guardian"]
        R2 --> R3["Review 7-Day History Trends in Personal Private Diary"]
        R3 --> R4["Build Healthier College Routines Day by Day!"]
    end
```

---

## 🔬 AI Precision Pipeline

```mermaid
flowchart TD
    %% STAGE A: CLIENT PRE-PROCESSING
    subgraph A["Stage A: Client-Side Pre-Flight & Privacy Shield"]
        P1["Student Takes or Uploads Photo in Toilet Bowl"] --> P2["HTML5 Canvas In-Memory Ingestion (RAM Only)"]
        P2 --> P3["EXIF & Metadata Stripping: Removes GPS coordinates, timestamp, and device info"]
        P3 --> P4["Instant Gaussian Privacy Blur (40px) Applied on UI"]
        P4 --> P5["Zero-Disk Guarantee: Photo is never saved to phone storage or cloud storage"]
    end

    %% STAGE B: ANTI-SPOOFING & ENVIRONMENT VERIFICATION
    subgraph B["Stage B: Anti-Spoofing & Context Verification"]
        P5 --> Q1["Toilet Bowl Context Scanner"]
        Q1 --> Q2{"Is this a real bowel movement in a toilet bowl?"}
        Q2 -->|"Fake object: melted chocolate, toy, food, or non-toilet"| Q3["Flag as Invalid: isValid = false"]
        Q3 --> Q4["Prompt Student: 'Please upload a clear photo of a bowel movement in a toilet bowl'"]
        Q2 -->|"Real toilet bowl sample confirmed"| Q5["Pass to Multi-Spectral AI Vision Core"]
    end

    %% STAGE C: MULTI-SPECTRAL MORPHOLOGY
    subgraph C["Stage C: Morphology & Edge Contour Analysis"]
        Q5 --> R1["Contour & Edge Segmentation"]
        R1 --> R2["Shape Classification: Nut-like lumps vs sausage log vs soft blobs vs liquid"]
        R2 --> R3["Surface Texture Mapping: Smooth surface vs surface cracks vs ragged mushy edges"]
        R3 --> R4["Particle Cohesion Index: Checks if stool holds together or breaks into chunks"]
    end

    %% STAGE D: TOILET WATER DYNAMICS
    subgraph D["Stage D: Water Dynamics & Moisture Index"]
        R4 --> S1["Toilet Water Cloudiness Scanner"]
        S1 --> S2["Moisture & Dissolution Rate: Clean water (solid) vs cloudy bowl (rapid breakdown)"]
        S2 --> S3["Buoyancy & Density Estimator: Dense sinker vs neutral float vs liquid suspension"]
        S3 --> S4["Soiling Level Calculation: Rates cleanup need from 0 (clean) to 5 (heavy)"]
    end

    %% STAGE E: 4-STAGE REASONING
    subgraph E["Stage E: 4-Stage Visual Chain-of-Thought (CoT) Differential Matrix"]
        S4 --> T1["Stage 1 Morphology: Shape, edge consistency, and surface crack analysis"]
        T1 --> T2["Stage 2 Moisture: Interaction with toilet bowl water and particle integrity"]
        T2 --> T3["Stage 3 Differential Diagnosis: Explains why it is this type and rules out adjacent types"]
        T3 --> T4["Stage 4 Digestion Speed: Translates shape into digestion speed (slow, optimal, or fast)"]
        T4 --> T5["Bristol Stool Scale Matching: Selects exact Bristol Number 1 to 7"]
    end

    %% STAGE F: CALIBRATION & AUTO-FILL
    subgraph F["Stage F: Confidence Calibration & Structured Auto-Fill"]
        T5 --> U1["Confidence Score Calibration (0.0 to 1.0)"]
        U1 --> U2["Symptom Detection: Detects bloating, straining, urgency, or irregularities"]
        U2 --> U3["Hydration Alert Engine: OPTIMAL, DEHYDRATED, CRITICAL_DRY, or NORMAL"]
        U3 --> U4["Strict JSON Schema Validation (Zero Markdown Backticks)"]
        U4 --> U5["Auto-Fills Daily Check-In Form with Bristol Type, Confidence %, and Tips"]
        U5 --> U6["RAM Purge: In-memory image buffer instantly destroyed upon analysis completion"]
    end
```

### 🔬 How the Photo Check Works

1. **Temporary image processing**: The photo is read into device memory through an HTML5 canvas. EXIF metadata, such as location and camera information, is removed before analysis. The app also blurs the preview on screen. The image is not saved by this feature.
2. **Basic image validation**: The vision model first checks whether the image shows a toilet-bowl sample. If the image shows an unrelated object or cannot be checked clearly, it returns `isValid = false` and asks the student to try again.
3. **Shape and surface analysis**: The model uses image segmentation and morphology to study the sample's outline and texture. It looks for features such as a smooth surface (Type 4), cracks (Type 3), separate lumps (Type 1), or other patterns from the Bristol Stool Scale.
4. **Moisture clues**: The model also checks visible signs of moisture, such as whether the sample keeps its shape, breaks apart, or makes the water look cloudy. These clues help distinguish formed stool from mushy or liquid stool.
5. **Structured classification**: The result is compared with the Bristol Stool Scale and returned as structured JSON. The app records the suggested type, confidence score, and basic observations instead of presenting the model's hidden internal reasoning as fact.
6. **Model and response time**: The feature uses **Gemini 3.5 Flash-Lite** when the optional AI service is enabled. Response time and daily request limits depend on the network, API configuration, and service availability.

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