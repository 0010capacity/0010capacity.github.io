import AppsAdminClient from "./client";

export function generateStaticParams() {
  return [{ params: [] }, { params: ["new"] }];
}

export const dynamicParams = false;

export default function AppsAdminPage() {
  return <AppsAdminClient />;
}
