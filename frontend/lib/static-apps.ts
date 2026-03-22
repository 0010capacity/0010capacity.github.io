import fs from "fs/promises";
import path from "path";
import type { App } from "./types";

interface AppsData {
  apps: App[];
}

const APPS_PATH = path.join(process.cwd(), "public/data/apps.json");

export async function getApps(): Promise<App[]> {
  const content = await fs.readFile(APPS_PATH, "utf-8");
  const data: AppsData = JSON.parse(content);
  return data.apps;
}

export async function getAppBySlug(slug: string): Promise<App | undefined> {
  const apps = await getApps();
  return apps.find(app => app.slug === slug);
}
