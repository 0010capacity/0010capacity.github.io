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
            <Github size={24} strokeWidth={1.5} />
          </a>
          <a
            href="mailto:0010capacity@gmail.com"
            className={styles.contactLink}
            aria-label="Email"
          >
            <Mail size={24} strokeWidth={1.5} />
          </a>
        </div>
      </main>

      {/* Collapsible profile card */}
      <button
        className={`${styles.profileCard} ${isExpanded ? styles.expanded : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="Toggle profile card"
        type="button"
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
      </button>
    </div>
  );
}
