"use client";

import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import AdminLayout from "@/components/AdminLayout";
import MarkdownEditor from "@/components/MarkdownEditor";
import TagInput from "@/components/TagInput";
import { blogApi } from "@/lib/api";

// Navigation Context for SPA-style routing
interface NavState {
  view: "list" | "new" | "edit";
  slug?: string;
}

interface NavContextType {
  navState: NavState;
  navigate: (state: NavState) => void;
  goBack: () => void;
}

const NavContext = createContext<NavContextType | null>(null);

function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}

// Types
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published: boolean;
  tags: string[];
  view_count?: number;
  created_at: string;
  updated_at: string;
}

// Constants
const STATUS_OPTIONS = [
  { id: "draft", name: "임시저장", description: "아직 발행되지 않은 글" },
  { id: "published", name: "발행됨", description: "공개된 글" },
];

// Blog List Component
function BlogList() {
  const { navigate } = useNav();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await blogApi.list();
      const posts = Array.isArray(data) ? data : [];
      setPosts(posts as BlogPost[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "블로그 글 목록을 불러오는데 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await blogApi.delete(slug, token);
      setPosts(posts.filter(post => post.slug !== slug));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === "all") return true;
    if (filter === "published") return post.published;
    if (filter === "draft") return !post.published;
    return true;
  });

  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;

  return (
    <AdminLayout title="블로그 관리">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <p className="text-neutral-500 text-sm">총 {posts.length}개의 글</p>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filter === "all"
                  ? "bg-neutral-700 text-white"
                  : "bg-neutral-900 text-neutral-500 hover:text-neutral-300"
              }`}
            >
              전체 ({posts.length})
            </button>
            <button
              onClick={() => setFilter("published")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filter === "published"
                  ? "bg-green-900/50 text-green-400"
                  : "bg-neutral-900 text-neutral-500 hover:text-neutral-300"
              }`}
            >
              발행됨 ({publishedCount})
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filter === "draft"
                  ? "bg-neutral-700 text-neutral-300"
                  : "bg-neutral-900 text-neutral-500 hover:text-neutral-300"
              }`}
            >
              임시저장 ({draftCount})
            </button>
          </div>
        </div>
        <button
          onClick={() => navigate({ view: "new" })}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm rounded transition-colors"
        >
          + 새 글 작성
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 border border-red-900/50 text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12 border border-neutral-800 rounded">
          <p className="text-neutral-500 mb-4">등록된 블로그 글이 없습니다</p>
          <button
            onClick={() => navigate({ view: "new" })}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            첫 번째 글을 작성해보세요 →
          </button>
        </div>
      )}

      {!loading && filteredPosts.length === 0 && posts.length > 0 && (
        <div className="text-center py-12 border border-neutral-800 rounded">
          <p className="text-neutral-500">
            {filter === "published"
              ? "발행된 글이 없습니다"
              : "임시저장된 글이 없습니다"}
          </p>
        </div>
      )}

      {!loading && filteredPosts.length > 0 && (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="border border-neutral-800 rounded p-4 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.published ? (
                      <span className="px-2 py-1 text-xs bg-green-900/50 text-green-400 rounded">
                        발행됨
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-neutral-800 text-neutral-400 rounded">
                        임시저장
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg text-neutral-100 mb-1">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-neutral-500 text-sm mb-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-neutral-800/50 text-neutral-400 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-neutral-600">
                    <span>
                      {new Date(post.updated_at).toLocaleDateString("ko-KR")}{" "}
                      수정
                    </span>
                    {post.view_count !== undefined && (
                      <span>{post.view_count.toLocaleString()} views</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => navigate({ view: "edit", slug: post.slug })}
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    편집
                  </button>
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    보기
                  </a>
                  {deleteConfirm === post.slug ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(post.slug)}
                        className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-sm text-neutral-500 hover:text-white transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(post.slug)}
                      className="px-3 py-1.5 text-sm text-neutral-600 hover:text-red-400 transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

// New Blog Post Component
function NewBlogPost() {
  const { navigate, goBack } = useNav();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: [] as string[],
    published: false,
  });

  const handleSubmit = async (
    e: React.FormEvent,
    shouldPublish: boolean = false
  ) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("로그인이 필요합니다");
      setLoading(false);
      return;
    }

    try {
      await blogApi.create({ ...formData, published: shouldPublish }, token);
      navigate({ view: "list" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "블로그 글 생성에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="새 블로그 글" onBack={goBack} backLabel="← 블로그 목록">
      <form
        onSubmit={e => handleSubmit(e, false)}
        className="max-w-2xl space-y-8"
      >
        {error && (
          <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm text-neutral-500 mb-2"
          >
            제목 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="블로그 글 제목을 입력하세요"
            required
            disabled={loading}
          />
          <p className="mt-1 text-xs text-neutral-600">
            URL 슬러그는 UUID를 기반으로 자동 생성됩니다
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm text-neutral-500 mb-2"
          >
            요약
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={e =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            placeholder="목록에 표시될 간단한 요약을 입력하세요"
            disabled={loading}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2">태그</label>
          <TagInput
            tags={formData.tags}
            onChange={tags => setFormData({ ...formData, tags })}
            placeholder="주제, 카테고리 등을 입력하세요"
          />
          <p className="text-neutral-600 text-xs mt-1">
            Enter 또는 쉼표로 태그를 추가하세요
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2">본문 *</label>
          <MarkdownEditor
            value={formData.content}
            onChange={content => setFormData({ ...formData, content })}
            placeholder="블로그 글을 마크다운으로 작성하세요..."
            height={500}
            minHeight={400}
          />
          <div className="flex justify-end mt-2">
            <span className="text-neutral-600 text-xs">
              {formData.content.length.toLocaleString()}자
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-4 pt-4 border-t border-neutral-800">
          <p className="text-sm text-neutral-500">
            &ldquo;발행하기&rdquo;를 누르면 즉시 공개됩니다. 임시저장하면 나중에
            발행할 수 있습니다.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={e => handleSubmit(e, true)}
              disabled={loading || !formData.title || !formData.content}
              className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
            >
              {loading ? "저장 중..." : "발행하기"}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.content}
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-600 text-neutral-100 rounded transition-colors"
            >
              {loading ? "저장 중..." : "임시저장"}
            </button>
            <button
              type="button"
              onClick={goBack}
              disabled={loading}
              className="px-6 py-3 text-neutral-400 hover:text-white transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

// Edit Blog Post Component
function EditBlogPost({ slug }: { slug: string }) {
  const { navigate, goBack } = useNav();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    tags: [] as string[],
    published: false,
  });

  const fetchPost = useCallback(async () => {
    try {
      setFetchLoading(true);
      const post = (await blogApi.getBySlug(slug)) as BlogPost;
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        tags: post.tags || [],
        published: post.published || false,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "블로그 글을 불러오는데 실패했습니다"
      );
    } finally {
      setFetchLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleSubmit = async (e: React.FormEvent, shouldPublish?: boolean) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("로그인이 필요합니다");
      setLoading(false);
      return;
    }

    const updateData = {
      ...formData,
      published:
        shouldPublish !== undefined ? shouldPublish : formData.published,
    };

    try {
      await blogApi.update(slug, updateData, token);
      setFormData(prev => ({
        ...prev,
        published: updateData.published,
      }));
      setSuccessMessage("저장되었습니다!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "블로그 글 수정에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout
        title="블로그 글 수정"
        onBack={goBack}
        backLabel="← 블로그 목록"
      >
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="블로그 글 수정"
      onBack={goBack}
      backLabel="← 블로그 목록"
    >
      <form onSubmit={e => handleSubmit(e)} className="max-w-2xl space-y-8">
        {successMessage && (
          <div className="p-4 border border-green-900/50 bg-green-900/20 text-green-400 text-sm rounded">
            ✓ {successMessage}
          </div>
        )}
        {error && (
          <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
            {error}
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-sm text-neutral-500 mb-3">상태</label>
          <div className="flex gap-3">
            {STATUS_OPTIONS.map(status => (
              <button
                key={status.id}
                type="button"
                disabled={loading}
                className={`px-4 py-2 rounded transition-colors ${
                  (status.id === "published") === formData.published
                    ? status.id === "published"
                      ? "bg-green-900/50 text-green-400 border border-green-700"
                      : "bg-neutral-700 text-neutral-200 border border-neutral-600"
                    : "bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700"
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    published: status.id === "published",
                  })
                }
              >
                {status.name}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm text-neutral-500 mb-2"
          >
            제목 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="블로그 글 제목을 입력하세요"
            required
            disabled={loading}
          />
        </div>

        {/* Slug (Read-only) */}
        <div>
          <label htmlFor="slug" className="block text-sm text-neutral-500 mb-2">
            슬러그 (URL)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-neutral-600 text-sm">/blog/</span>
            <span className="flex-1 px-4 py-3 bg-neutral-950 border border-neutral-800 rounded text-neutral-400">
              {formData.slug}
            </span>
          </div>
          <p className="text-neutral-600 text-xs mt-1">
            슬러그는 생성 시 자동으로 지정되며 변경할 수 없습니다
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm text-neutral-500 mb-2"
          >
            요약
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={e =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            placeholder="목록에 표시될 간단한 요약을 입력하세요"
            disabled={loading}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2">태그</label>
          <TagInput
            tags={formData.tags}
            onChange={tags => setFormData({ ...formData, tags })}
            placeholder="주제, 카테고리 등을 입력하세요"
          />
          <p className="text-neutral-600 text-xs mt-1">
            Enter 또는 쉼표로 태그를 추가하세요
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2">본문 *</label>
          <MarkdownEditor
            value={formData.content}
            onChange={content => setFormData({ ...formData, content })}
            placeholder="블로그 글을 마크다운으로 작성하세요..."
            height={500}
            minHeight={400}
          />
          <div className="flex justify-end mt-2">
            <span className="text-neutral-600 text-xs">
              {formData.content.length.toLocaleString()}자
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-4 pt-4 border-t border-neutral-800">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.content}
              className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
            >
              {loading ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={() => navigate({ view: "list" })}
              disabled={loading}
              className="px-6 py-3 text-neutral-400 hover:text-white transition-colors"
            >
              목록으로
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

// Main Client Component with SPA-style Routing
export default function BlogAdminClient() {
  const [navState, setNavState] = useState<NavState>({ view: "list" });
  const [history, setHistory] = useState<NavState[]>([]);

  const navigate = useCallback(
    (state: NavState) => {
      setHistory(prev => [...prev, navState]);
      setNavState(state);
    },
    [navState]
  );

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevState = newHistory.pop();
      setHistory(newHistory);
      setNavState(prevState || { view: "list" });
    } else {
      setNavState({ view: "list" });
    }
  }, [history]);

  const renderView = () => {
    switch (navState.view) {
      case "new":
        return <NewBlogPost />;
      case "edit":
        return navState.slug ? (
          <EditBlogPost slug={navState.slug} />
        ) : (
          <BlogList />
        );
      case "list":
      default:
        return <BlogList />;
    }
  };

  return (
    <NavContext.Provider value={{ navState, navigate, goBack }}>
      {renderView()}
    </NavContext.Provider>
  );
}
