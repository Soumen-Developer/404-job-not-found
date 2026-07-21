# CY-Jobs Design System & Guidelines

This document details the design system, color palettes, typography, visual layouts, and asset management for the CY-Jobs Career Operating System. It ensures that any new feature maintains a premium, cohesive, and modern user experience.

---

## 🎨 Color Palette

We utilize a curated system design color palette that is modern, clean, and has high contrast:

| Color Name | Hex Code | Purpose | Tailwind Class |
| :--- | :--- | :--- | :--- |
| **Primary Blue** | `#1976D2` | Main branding, primary CTAs, links, and highlights | `bg-primary`, `text-primary` |
| **Primary Hover** | `#0C67C1` | Hover state for primary buttons | `hover:bg-primary-hover` |
| **Secondary Green** | `#2ECC71` | Success states, verify badges, positive values | `bg-secondary` |
| **Accent Teal/Cyan** | `#0098B6` | Secondary highlights, search actions, borders | `bg-bluelighter` |
| **Accent Yellow** | `#FFCA28` | Warning states, special badges, active search focus | `bg-accentYellow` |
| **Dark Gray** | `#364153` | Primary headings, readable text, high-contrast panels | `text-[#364153]` |
| **Slate Gray** | `#6A7282` | Body descriptions, subtitles, form labels | `text-[#6A7282]` |
| **Light Background** | `#F5F8F8` | Warm grayish-teal background for clean modern canvas | `bg-[#F5F8F8]` |
| **Surface White** | `#FFFFFF` | Card backgrounds, inputs, dropdown items | `bg-white` |

---

## ✍️ Typography

- **Font Family:** `font-sans` maps to **Poppins** or **Geist Sans** (with fallback to `system-ui`, `Helvetica`, `Arial`). This provides geometric, clean, modern characters suitable for high-end tech products.
- **Sizes:**
  - Hero Headings: `text-4xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight`
  - Section Headings: `text-3xl md:text-4xl font-extrabold`
  - Job Titles: `font-bold text-lg`
  - Body Text: `text-base text-[#6A7282] leading-relaxed`

---

## 🖼️ Media & Static Assets

To ensure high-fidelity visual mockups, CY-Jobs avoids placeholder images and relies on these custom, statically served assets:

1. **Hero Illustration (`/hero_illustration.png`):**
   - *Design Style:* Clean vector outline-art style with soft green and yellow accents.
   - *Details:* Displays a young professional woman working productively at her desk on a laptop, with a round wall clock and a desk calendar.
2. **Onboarding Graphics (`/onboarding_library.png`):**
   - *Design Style:* Warm library lighting, professional color grading, high-end photography.
   - *Details:* A candidate sitting cross-legged reading a book in front of bookshelves.
3. **Testimonial Headshot (`/testimonial_headshot.png`):**
   - *Design Style:* Friendly corporate headshot with clean studio lighting.
   - *Details:* A smiling male executive with headphones around his neck, wearing a red hoodie.

---

## 📱 Responsiveness Guidelines

All layouts must strictly implement responsive design classes:
- **Paddings:** Use `px-4 sm:px-6 lg:px-8` on page containers to scale gutters.
- **Grids:** Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for job feeds or features grids.
- **Forms/Search Inputs:** Stack inputs vertically on mobile screen widths and merge horizontally on larger screens:
  - Mobile: Full width stacking inputs (`w-full flex-col`).
  - Tablet/Desktop: Inline row (`md:flex-row`).
- **Interactive Drawers:** Any sidebar navigation or menu links must collapse into a mobile hamburger menu button under `lg` breakpoint. Use React state hooks to toggle open/close.

---

## ✨ Micro-Animations & Hover Effects

An interface that feels responsive encourages candidate interaction:
- **Hover Transitions:** Add `transition-all duration-300` on buttons and cards.
- **Card Hover Elevation:** Add `hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5` to job cards to make them feel interactive.
- **Icon Pop-outs:** Add `group-hover:scale-110` to icon wrapper divs on hover.

---

## 🧠 Domain & Recommendation Design

CY-Jobs employs a multi-faceted scoring architecture to match candidates to roles:
- **Skill Matching:** Compares user skills (from resumes, GitHub, and manual entry) against job requirements. Includes a proficiency-weighted score (Beginner vs Expert).
- **Experience Mapping:** Calculates total years of experience from parsed resumes and aligns with job tier brackets (Entry, Mid, Senior, Executive).
- **Preference Alignment:** Scores matches based on user preferences for remote work, salary boundaries, job type (full-time/contract), and location.
- **Explainability:** The engine returns an `explanation` payload to visually break down exactly *why* a candidate matched a role (e.g., "Strong skill match (85%). You have 4 matching skills").
