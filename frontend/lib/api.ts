const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper function for API calls
async function apiCall<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  data?: unknown,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && (method === "POST" || method === "PUT")) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}`,
    }));
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiCall("POST", "/api/auth/login", credentials),

  register: (credentials: { username: string; password: string }) =>
    apiCall("POST", "/api/auth/register", credentials),
};

// Novels API
export const novelsApi = {
  list: (params?: {
    status?: string;
    novel_type?: string;
    genre?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.novel_type) query.append("novel_type", params.novel_type);
    if (params?.genre) query.append("genre", params.genre);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());
    const queryString = query.toString();
    return apiCall("GET", `/api/novels${queryString ? `?${queryString}` : ""}`);
  },

  getBySlug: (slug: string) => apiCall("GET", `/api/novels/${slug}`),

  create: (data: unknown, token: string) =>
    apiCall("POST", "/api/novels", data, token),

  update: (slug: string, data: unknown, token: string) =>
    apiCall("PUT", `/api/novels/${slug}`, data, token),

  delete: (slug: string, token: string) =>
    apiCall("DELETE", `/api/novels/${slug}`, undefined, token),

  // Genres and Types
  getGenres: () => apiCall("GET", "/api/novels/genres"),

  getNovelTypes: () => apiCall("GET", "/api/novels/types"),

  // Related novels
  getRelations: (slug: string) =>
    apiCall("GET", `/api/novels/${slug}/relations`),

  addRelation: (
    slug: string,
    data: { related_novel_slug: string; relation_type?: string },
    token: string
  ) => apiCall("POST", `/api/novels/${slug}/relations`, data, token),

  removeRelation: (slug: string, relatedSlug: string, token: string) =>
    apiCall(
      "DELETE",
      `/api/novels/${slug}/relations?related_slug=${relatedSlug}`,
      undefined,
      token
    ),

  // Chapters
  getChapters: (slug: string) => apiCall("GET", `/api/novels/${slug}/chapters`),

  getChapter: (slug: string, number: number) =>
    apiCall("GET", `/api/novels/${slug}/chapters/${number}`),

  createChapter: (slug: string, data: unknown, token: string) =>
    apiCall("POST", `/api/novels/${slug}/chapters`, data, token),

  updateChapter: (slug: string, number: number, data: unknown, token: string) =>
    apiCall("PUT", `/api/novels/${slug}/chapters/${number}`, data, token),

  deleteChapter: (slug: string, number: number, token: string) =>
    apiCall(
      "DELETE",
      `/api/novels/${slug}/chapters/${number}`,
      undefined,
      token
    ),
};

// Blog API
export const blogApi = {
  list: (params?: { published?: boolean; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.published !== undefined)
      query.append("published", params.published.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());
    const queryString = query.toString();
    return apiCall("GET", `/api/blog${queryString ? `?${queryString}` : ""}`);
  },

  getBySlug: (slug: string) => apiCall("GET", `/api/blog/${slug}`),

  create: (data: unknown, token: string) =>
    apiCall("POST", "/api/blog", data, token),

  update: (slug: string, data: unknown, token: string) =>
    apiCall("PUT", `/api/blog/${slug}`, data, token),

  delete: (slug: string, token: string) =>
    apiCall("DELETE", `/api/blog/${slug}`, undefined, token),
};

// Apps API
export const appsApi = {
  list: (params?: { platform?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.platform) query.append("platform", params.platform);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());
    const queryString = query.toString();
    return apiCall("GET", `/api/apps${queryString ? `?${queryString}` : ""}`);
  },

  getBySlug: (slug: string) => apiCall("GET", `/api/apps/${slug}`),

  // Get available platforms
  getPlatforms: () => apiCall("GET", "/api/apps/platforms"),

  // Get available distribution channels
  getChannels: () => apiCall("GET", "/api/apps/channels"),

  create: (data: unknown, token: string) =>
    apiCall("POST", "/api/apps", data, token),

  update: (slug: string, data: unknown, token: string) =>
    apiCall("PUT", `/api/apps/${slug}`, data, token),

  delete: (slug: string, token: string) =>
    apiCall("DELETE", `/api/apps/${slug}`, undefined, token),
};

// System API
export const systemApi = {
  health: () => apiCall("GET", "/health"),

  info: () => apiCall("GET", "/"),
};
