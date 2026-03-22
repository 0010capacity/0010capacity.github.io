import type { Metadata } from "next";
import { getApps } from "@/lib/static-apps";
import AppsPageClient from "./client";

export const revalidate = 3600;

export async function generateStaticParams(): Promise<
  Array<{ params: string[] }>
> {
  return [{ params: [] }];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Apps | DevCapa",
    description: "Apps developed by DevCapa",
    openGraph: {
      title: "Apps | DevCapa",
      description: "Apps developed by DevCapa",
      url: "https://0010capacity.github.io/apps/",
      type: "website",
    },
  };
}

export default async function AppsPage() {
  const apps = await getApps();

  return <AppsPageClient apps={apps} />;
}
