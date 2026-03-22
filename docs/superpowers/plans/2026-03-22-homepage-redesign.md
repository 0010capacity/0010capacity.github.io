# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the homepage to be a minimal digital business card with app icons, contact links, and a collapsible profile card.

**Architecture:** Single-page component with CSS Modules. Data from existing JSON files (profile.json, apps.json). Collapsible card uses React state for toggle. No external animation libraries.

**Tech Stack:** Next.js 15, CSS Modules, Lucide React (icons)

---

## File Structure

- Modify: `app/page.tsx` — complete rewrite with new layout
- Modify: `app/page.module.css` — complete rewrite with new styles
- No new files needed

---

## Tasks

### Task 1: Rewrite page.tsx

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write new page.tsx**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Github, Mail } from "lucide-react";
import styles from "./page.module.css";

const TECH_STACK = [
  "TypeScript",
  "C#",
  "ASP.NET",
  "iOS",
  "Android",
] as const;

const APPS = [
  { name: "Logit", initials: "L", url: "https://apps.apple.com/kr/app/logit-log-of-the-day/id6752603467" },
  { name: "Mnemo", initials: "M", url: "https://apps.apple.com/kr/app/mnemo-memory-card-game/id6752640768" },
  { name: "Optimal Route", initials: "ORP", url: "https://my-optimal-route-planner.web.app/" },
  { name: "Traffic Light", initials: "TL", url: "https://traffic-light-order-viewer.web.app/" },
];

export default function HomePage() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.container}>
      {/* Blog link */}
      <Link href="/blog" className={styles.blogLink}>
        Blog
      </Link>

      {/* Main content */}
      <main className={styles.main}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.brandLabel}>DEVCAPA</span>
          <h1 className={styles.nickname}>0010capacity</h1>
        </div>

        {/* App icons */}
        <div className={styles.appRail}>
          {APPS.map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.appIcon}
              title={app.name}
            >
              {app.initials}
            </a>
          ))}
        </div>

        {/* Contact icons */}
        <div className={styles.contact}>
          <a
            href="https://github.com/0010capacity"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactLink}
            aria-label="GitHub"
          >
            <Github size={18} strokeWidth={1.5} />
          </a>
          <a
            href="mailto:0010capacity@gmail.com"
            className={styles.contactLink}
            aria-label="Email"
          >
            <Mail size={18} strokeWidth={1.5} />
          </a>
        </div>
      </main>

      {/* Collapsible profile card */}
      <div
        className={`${styles.profileCard} ${isExpanded ? styles.expanded : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.profileTab}>About</div>
        <div className={styles.profileContent}>
          <div className={styles.profileName}>이정원</div>
          <div className={styles.profileSchool}>
            광운대학교<br />인공지능학과
          </div>
          <div className={styles.profileCountry}>South Korea</div>
          <div className={styles.techStack}>
            {TECH_STACK.map((tech) => (
              <span key={tech} className={styles.techTag}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify file is valid TypeScript**

Run: `npx tsc --noEmit app/page.tsx`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: rewrite homepage with digital business card layout"
```

---

### Task 2: Rewrite page.module.css

**Files:**
- Modify: `app/page.module.css`

- [ ] **Step 1: Write new page.module.css**

```css
.container {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding-bottom: 70px;
  box-sizing: border-box;
}

/* Blog link */
.blogLink {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #525252;
  font-size: 0.75rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.blogLink:hover {
  color: #a3a3a3;
}

/* Main content */
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

/* Brand */
.brand {
  text-align: center;
}

.brandLabel {
  display: block;
  font-size: 0.65rem;
  color: #3d3d3d;
  letter-spacing: 0.3em;
  margin-bottom: 0.4rem;
}

.nickname {
  font-size: 1.6rem;
  font-weight: 700;
  color: #f5f5f5;
  letter-spacing: -0.01em;
  margin: 0;
}

/* App rail */
.appRail {
  display: flex;
  gap: 0.75rem;
}

.appIcon {
  width: 44px;
  height: 44px;
  background: #171717;
  border: 1px solid #262626;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.45rem;
  color: #6b6b6b;
  text-decoration: none;
  transition: all 0.3s ease;
}

.appIcon:hover {
  transform: scale(1.15);
  border-color: #404040;
  background: #1f1f1f;
}

/* Contact icons */
.contact {
  display: flex;
  gap: 1.25rem;
}

.contactLink {
  color: #4a4a4a;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.contactLink:hover {
  color: #a3a3a3;
}

/* Profile card */
.profileCard {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(calc(100% - 44px));
  width: 160px;
  background: #171717;
  border: 1px solid #262626;
  border-bottom: none;
  border-radius: 16px 16px 0 0;
  padding: 0 1.25rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.profileCard:hover,
.profileCard.expanded {
  transform: translateX(-50%) translateY(0);
}

.profileTab {
  color: #6b6b6b;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  padding: 0.75rem 0;
  border-bottom: 1px solid #262626;
  margin-bottom: 0.75rem;
}

.profileContent {
  padding-bottom: 1rem;
}

.profileName {
  color: #e5e5e5;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.profileSchool {
  color: #8b8b8b;
  font-size: 0.7rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.profileCountry {
  color: #6b6b6b;
  font-size: 0.65rem;
  margin-bottom: 0.75rem;
}

.techStack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
}

.techTag {
  background: #262626;
  color: #6b6b6b;
  font-size: 0.6rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 480px) {
  .profileCard {
    width: 140px;
  }

  .nickname {
    font-size: 1.4rem;
  }
}
```

- [ ] **Step 2: Run build to verify**

Run: `npm run build 2>&1 | head -50`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/page.module.css
git commit -m "feat: add styles for redesigned homepage"
```

---

### Task 3: Test the page

**Files:**
- None (manual verification)

- [ ] **Step 1: Start dev server and verify**

Run: `npm run dev`
Expected: Dev server starts without errors

- [ ] **Step 2: Verify in browser**
- Page loads at localhost:3000
- Brand shows DEVCAPA (small) and 0010capacity (large)
- App icons visible (L, M, ORP, TL)
- GitHub and Email icons below apps
- Blog link in top-right
- Profile card at bottom, click to expand/collapse
- No console errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete homepage redesign

- Minimal digital business card layout
- App icons with hover effects
- Collapsible profile card with tech stack
- Contact icons below apps"
```

---

## Summary

1. Rewrite `page.tsx` with new layout (brand, app rail, contacts, collapsible card)
2. Rewrite `page.module.css` with matching styles
3. Test and verify

**Total: 3 tasks, ~15 minutes**
