# Homepage Redesign - DevCapa

## Concept & Vision

A minimal, elegant digital business card that serves as a personal homepage. The design prioritizes simplicity over functionality — it should feel like a premium calling card, not a feature-heavy portfolio. The page communicates identity through restraint: a brand name, a nickname, apps, and contact links arranged with intentional white space.

## Design Language

### Aesthetic Direction
Minimal dark theme with a monochromatic grayscale palette. Inspired by high-end business cards and premium personal websites. No gradients, no decorations — just clean typography and subtle interactions.

### Color Palette
- Background: `#0a0a0a`
- Card/Surface: `#171717`
- Surface Alt: `#262626`
- Border: `#404040`
- Text Primary: `#f5f5f5`
- Text Secondary: `#a3a3a3`
- Text Muted: `#525252`

### Typography
- Font: NanumMyeongjo (serif, already in use)
- Brand (DEVCAPA): 0.65rem, muted color, letter-spacing 0.3em, uppercase
- Nickname (0010capacity): 1.6rem, bold, primary color
- Body/UI: 0.7-0.85rem

### Spatial System
- Vertical centering with generous spacing
- App icons: 36x36px, 10px border-radius
- Contact icons: 18px, no border, muted color
- Profile card: 160px width, fixed to bottom

### Motion Philosophy
- Profile card: `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)` — smooth slide up/down
- App icons: `transform scale(1.15)` on hover — subtle zoom
- Contact icons: `color` transition on hover

## Layout & Structure

### Page Structure (top to bottom)
1. **Blog link** — top-right corner, static text
2. **Brand area** — centered, DEVCAPA (small) + 0010capacity (main)
3. **App rail** — horizontal row of app icons
4. **Contact icons** — GitHub and Email, below app rail
5. **Profile card** — fixed to bottom, collapsible

### Responsive Strategy
- Mobile: Stack maintains, card width adjusts
- Desktop: Centered layout with fixed-width card

## Features & Interactions

### App Icons
- Display 4 apps from `apps.json`: Logit, Mnemo, Optimal Route Planner, Traffic Light Order Viewer
- Each icon shows initials (L, M, ORP, TL) since no custom icons available
- Hover: scale up 1.15x, border color lightens
- Click: navigate to app's distribution URL

### Contact Icons
- GitHub: links to `https://github.com/0010capacity`
- Email: links to `mailto:0010capacity@gmail.com`
- No border, just the icon in muted color
- Hover: color lightens

### Profile Card (Collapsible)
- Fixed to bottom of viewport, centered
- Initially shows only tab handle ("About") — 44px visible
- Click anywhere on card to expand/collapse
- Expanded state shows:
  - Name: 이정원
  - School: 광운대학교 인공지능학과
  - Country: South Korea
  - Tech stack tags: TypeScript, C#, ASP.NET, iOS, Android

### Blog Link
- Static text link to `/blog`
- Top-right corner, muted color

## Component Inventory

### AppIcon
- **Default**: 36x36px, #171717 bg, 1px #262626 border, 10px radius, centered text
- **Hover**: scale 1.15x, border #404040, bg #1f1f1f
- **Click**: navigate to app URL

### ContactIcon
- **Default**: 18px, no border, color #4a4a4a
- **Hover**: color #a3a3a3
- **Click**: open link (GitHub/new tab, Email/mailto)

### ProfileCard
- **Collapsed**: 160px width, 44px visible (tab handle only)
- **Expanded**: full content visible, 160px width
- **Transition**: 0.5s cubic-bezier slide
- **Tab handle**: "About" text, muted color, bottom border

### TechTag
- **Default**: #262626 bg, #6b6b6b text, 4px radius, 0.6rem font

## Technical Approach

- **Framework**: Next.js 15 with App Router
- **Styling**: CSS Modules (page.module.css)
- **Data**: Profile from `public/data/profile.json`, Apps from `public/data/apps.json`
- **Icons**: Lucide React (already installed) for GitHub/Email
- **Animation**: Pure CSS transitions, no JavaScript animation libraries
