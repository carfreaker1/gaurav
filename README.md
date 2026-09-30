# Gaurav — The personal edition

An interactive lifestyle site built with React, Three.js, React Three Fiber, Drei, GSAP ScrollTrigger and Framer Motion.

## Run

```sh
npm install
npm run dev
```

Production: `npm run build`. Preview the build: `npm run preview`.

## Customize

Edit **src/config.js** for the hero copy, lifestyle text, scrolling words, photos, videos, Instagram links, birthday settings and personal message.

The gallery uses the supplied local images and videos in `assets/`. Music comes from `songs/Ashke.mp3` and attempts audible autoplay from 27 seconds. If the browser blocks autoplay, the first tap or keypress starts it. The sound toggle can pause or resume playback.

The on-page message editor saves in the current browser. To publish a message for everyone, update `content.message` and rebuild.

## Birthday behavior

- Every **30 September**, starting in **2026**, the celebration opens automatically after loading.
- Dates are evaluated in **Asia/Kolkata**, independently of the visitor's device timezone.
- It opens once per date per browser-tab session, including across refreshes.
- The date is checked every 30 seconds and when the tab regains visibility, so a page left open across midnight also celebrates.
- The celebration includes close, Escape and replay controls. Other days show a preview control.
- The date/timezone/start year are editable under `content.birthday`. The displayed year updates automatically.

## Experience

- Real 3D photo panels, reflective orbital forms, pointer lighting and a scroll-reactive hero camera.
- A 3D gallery with clickable panels, five accessible selector buttons, previous/next controls, mobile swipes, and photo/video previews.
- GSAP typography responds to scroll position and speed, with alternating travel, skew and restrained motion trails.
- Instagram's official embed script attempts the profile embed and creates its iframe when supported. An always-available profile link and local photo card cover blocked/unavailable embeds. No Instagram content is scraped.
- Mobile pixel-ratio caps, offscreen scene suspension, lazy scene loading, reduced-motion support and usable photo fallbacks without WebGL.
- A native birthday dialog supplies keyboard focus containment. Media dialogs support Escape and focus restoration.

## Structure

- `src/App.jsx`: page assembly, personal message and media dialog
- `src/config.js`: editable content and birthday settings
- `src/components/LifestyleExperience.jsx`: lifestyle sections and annual celebration
- `src/components/3d/SpatialScene.jsx`: interactive photo scenes
- `src/components/ScrollType.jsx`: scroll-speed typography
- `src/lib/birthday.js`: India-time calendar and recurring reveal
- `src/experience.css`: lifestyle visual design
- `src/components/ui.jsx`: navigation, loader, audio and shared controls

## Check

`npm test` runs desktop and mobile Chrome checks for the gallery, scroll effects, message persistence, Instagram fallback, yearly birthday behavior, India midnight and missing WebGL. The Playwright configuration uses an installed Google Chrome browser.

The Three.js vendor chunk is the main JavaScript payload; Vite reports its size during builds. Photos are lazy-loaded, while videos and music are only requested for playback or preview.
