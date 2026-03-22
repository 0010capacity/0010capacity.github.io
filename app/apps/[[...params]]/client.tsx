"use client";

import Link from "next/link";
import type { App } from "@/lib/types";
import styles from "./client.module.css";

interface AppsPageClientProps {
  apps: App[];
}

export default function AppsPageClient({ apps }: AppsPageClientProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← DevCapa
        </Link>
        <h1 className={styles.title}>Apps</h1>
      </div>

      <div className={styles.grid}>
        {apps.map(app => (
          <a
            key={app.slug}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.appCard}
          >
            <div className={styles.iconWrapper}>
              {app.icon ? (
                <img
                  src={app.icon}
                  alt={`${app.name} icon`}
                  className={styles.icon}
                />
              ) : (
                <div className={styles.iconPlaceholder}>
                  {app.name.charAt(0)}
                </div>
              )}
              <div className={styles.overlay}>
                <span className={styles.appName}>{app.name}</span>
                {app.description && (
                  <span className={styles.appDescription}>
                    {app.description}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
