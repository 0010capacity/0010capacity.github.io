"use client";

import Link from "next/link";
import { BookOpen, FileText, AppWindow } from "lucide-react";
import styles from "./page.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function HomePage() {
  const navItems: NavItem[] = [
    {
      href: "/novels",
      label: "소설",
      icon: <BookOpen size={32} strokeWidth={1.5} />,
    },
    {
      href: "/blog",
      label: "블로그",
      icon: <FileText size={32} strokeWidth={1.5} />,
    },
    {
      href: "/apps",
      label: "앱",
      icon: <AppWindow size={32} strokeWidth={1.5} />,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Navigation Grid */}
      <div className={styles.navGrid}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={styles.navItem}>
            <div className={styles.iconWrapper}>{item.icon}</div>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <Link href="/about" className={styles.footerLink}>
          이정원에 대해
        </Link>
        <span className={styles.footerDot}>·</span>
        <Link href="/admin/login" className={styles.footerLink}>
          관리
        </Link>
      </footer>
    </div>
  );
}
