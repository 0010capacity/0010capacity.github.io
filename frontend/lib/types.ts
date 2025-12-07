// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: AdminInfo;
}

export interface AdminInfo {
  id: string;
  username: string;
}

export interface Claims {
  sub: string;
  username: string;
  exp: number;
  iat: number;
}

// Novel Types
export interface Novel {
  id: string;
  slug: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  novel_type?: "short" | "long" | "series";
  genre?: string;
  genres?: string[];
  status: "draft" | "ongoing" | "completed" | "hiatus";
  view_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateNovel {
  slug: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  genre?: string;
  status?: "draft" | "ongoing" | "completed";
}

export interface UpdateNovel {
  title?: string;
  description?: string;
  cover_image_url?: string;
  genre?: string;
  status?: "draft" | "ongoing" | "completed";
}

// Novel Chapter Types
export interface NovelChapter {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  view_count?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChapter {
  chapter_number: number;
  title: string;
  content: string;
  published_at?: string;
}

export interface UpdateChapter {
  title?: string;
  content?: string;
  published_at?: string;
}

// Blog Types
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  tags: string[];
  published: boolean;
  view_count?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPost {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  tags?: string[];
  published?: boolean;
  published_at?: string;
}

export interface UpdateBlogPost {
  title?: string;
  content?: string;
  excerpt?: string;
  cover_image_url?: string;
  tags?: string[];
  published?: boolean;
  published_at?: string;
}

// App Types
export type Platform =
  | "ios"
  | "android"
  | "web"
  | "windows"
  | "macos"
  | "linux"
  | "game";

export interface DistributionChannel {
  type: string;
  url: string;
  label?: string;
}

export interface App {
  id: string;
  name: string;
  slug: string;
  description?: string;
  platforms: Platform[];
  icon_url?: string;
  screenshots: string[];
  distribution_channels: DistributionChannel[];
  privacy_policy_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApp {
  name: string;
  description?: string;
  platforms?: Platform[];
  icon_url?: string;
  screenshots?: string[];
  distribution_channels?: DistributionChannel[];
  privacy_policy_url?: string;
}

export interface UpdateApp {
  name?: string;
  description?: string;
  platforms?: Platform[];
  icon_url?: string;
  screenshots?: string[];
  distribution_channels?: DistributionChannel[];
  privacy_policy_url?: string;
}

// List Query Types
export interface ListQuery {
  limit?: number;
  offset?: number;
}

export interface NovelListQuery extends ListQuery {
  status?: "draft" | "ongoing" | "completed";
}

export interface BlogListQuery extends ListQuery {
  published?: boolean;
}

export interface AppListQuery extends ListQuery {
  platform?: Platform;
}
