"use client";

import Link from "next/link";
import { Github, Mail, FileText, AppWindow } from "lucide-react";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <main className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <h1 className={styles.title}>DevCapa</h1>
          <p className={styles.subtitle}>Developer Portfolio</p>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <Link href="/blog" className={styles.navButton}>
            <FileText size={20} strokeWidth={1.5} />
            <span>Blog</span>
          </Link>
          <Link href="/apps" className={styles.navButton}>
            <AppWindow size={20} strokeWidth={1.5} />
            <span>Apps</span>
          </Link>
        </nav>

        {/* Contact Links */}
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
    </div>
  );
}
