// Blog Types
export interface BlogPost {
  slug: string;
  title: string;
  content?: string;
  excerpt?: string;
  date: string;
  tags?: string[];
}

// App Types
export type Platform = "ios" | "android" | "web" | "windows" | "macos" | "linux";

export interface DistributionChannel {
  type: string;
  url: string;
  label?: string;
}

export interface App {
  name: string;
  slug: string;
  description?: string;
  platforms?: Platform[];
  icon?: string;
  url: string;
  distribution_channels?: DistributionChannel[];
}
