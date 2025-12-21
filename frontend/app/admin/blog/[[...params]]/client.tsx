"use client";

import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Paper,
  TextInput,
  Textarea,
  Alert,
  Center,
  Loader,
  SegmentedControl,
  Anchor,
  ActionIcon,
} from "@mantine/core";
import { AlertCircle, X, CheckCircle } from "lucide-react";
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
      <Stack gap="lg">
        <Group justify="space-between" align="flex-end">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              총 {posts.length}개의 글
            </Text>
            <SegmentedControl
              value={filter}
              onChange={val => setFilter(val as "all" | "published" | "draft")}
              size="xs"
              data={[
                { label: `전체 (${posts.length})`, value: "all" },
                { label: `발행됨 (${publishedCount})`, value: "published" },
                { label: `임시저장 (${draftCount})`, value: "draft" },
              ]}
            />
          </Stack>
          <Button size="sm" onClick={() => navigate({ view: "new" })}>
            + 새 글 작성
          </Button>
        </Group>

        {error && (
          <Alert
            icon={<AlertCircle size={16} />}
            title="오류"
            color="red"
            mb="lg"
          >
            {error}
          </Alert>
        )}

        {loading && (
          <Center py="xl">
            <Loader />
          </Center>
        )}

        {!loading && posts.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Text size="sm" c="dimmed">
                등록된 블로그 글이 없습니다
              </Text>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => navigate({ view: "new" })}
              >
                첫 번째 글을 작성해보세요 →
              </Button>
            </Stack>
          </Center>
        )}

        {!loading && filteredPosts.length === 0 && posts.length > 0 && (
          <Center py="xl">
            <Text size="sm" c="dimmed">
              {filter === "published"
                ? "발행된 글이 없습니다"
                : "임시저장된 글이 없습니다"}
            </Text>
          </Center>
        )}

        {!loading && filteredPosts.length > 0 && (
          <Stack gap="md">
            {filteredPosts.map(post => (
              <Paper key={post.id} p="md" radius="md" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group gap="xs" align="center">
                        <Badge
                          color={post.published ? "green" : "gray"}
                          variant="light"
                          size="sm"
                        >
                          {post.published ? "발행됨" : "임시저장"}
                        </Badge>
                      </Group>
                      <Text fw={500} size="md">
                        {post.title}
                      </Text>
                      {post.excerpt && (
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {post.excerpt}
                        </Text>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <Group gap="xs" wrap="wrap">
                          {post.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="dot"
                              size="sm"
                              color="gray"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </Group>
                      )}
                      <Text size="xs" c="dimmed">
                        {new Date(post.updated_at).toLocaleDateString("ko-KR")}{" "}
                        수정
                      </Text>
                    </Stack>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() =>
                          navigate({ view: "edit", slug: post.slug })
                        }
                      >
                        편집
                      </Button>
                      <Anchor
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        size="xs"
                      >
                        보기
                      </Anchor>
                      {deleteConfirm === post.slug ? (
                        <>
                          <Button
                            size="xs"
                            color="red"
                            variant="subtle"
                            onClick={() => handleDelete(post.slug)}
                          >
                            확인
                          </Button>
                          <Button
                            size="xs"
                            variant="subtle"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            취소
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="xs"
                          color="red"
                          variant="subtle"
                          onClick={() => setDeleteConfirm(post.slug)}
                        >
                          삭제
                        </Button>
                      )}
                    </Group>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
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
      <Box component="form" onSubmit={e => handleSubmit(e, false)} maw={600}>
        <Stack gap="xl">
          {error && (
            <Alert icon={<AlertCircle size={16} />} title="오류" color="red">
              {error}
            </Alert>
          )}

          {/* Title */}
          <TextInput
            label="제목 *"
            placeholder="블로그 글 제목을 입력하세요"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            disabled={loading}
            size="sm"
          />
          <Text size="xs" c="dimmed">
            URL 슬러그는 UUID를 기반으로 자동 생성됩니다
          </Text>

          {/* Excerpt */}
          <Textarea
            label="요약"
            placeholder="목록에 표시될 간단한 요약을 입력하세요"
            value={formData.excerpt}
            onChange={e =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            minRows={3}
            disabled={loading}
            size="sm"
          />

          {/* Tags */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              태그
            </Text>
            <TagInput
              tags={formData.tags}
              onChange={tags => setFormData({ ...formData, tags })}
              placeholder="주제, 카테고리 등을 입력하세요"
            />
            <Text size="xs" c="dimmed">
              Enter 또는 쉼표로 태그를 추가하세요
            </Text>
          </Stack>

          {/* Content */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              본문 *
            </Text>
            <MarkdownEditor
              value={formData.content}
              onChange={content => setFormData({ ...formData, content })}
              placeholder="블로그 글을 마크다운으로 작성하세요..."
              height={500}
              minHeight={400}
            />
            <Group justify="flex-end">
              <Text size="xs" c="dimmed">
                {formData.content.length.toLocaleString()}자
              </Text>
            </Group>
          </Stack>

          {/* Submit */}
          <Stack gap="md" pt="md">
            <Text size="sm" c="dimmed">
              &ldquo;발행하기&rdquo;를 누르면 즉시 공개됩니다. 임시저장하면
              나중에 발행할 수 있습니다.
            </Text>
            <Group gap="md">
              <Button
                type="button"
                onClick={e => handleSubmit(e, true)}
                disabled={loading || !formData.title || !formData.content}
                loading={loading}
              >
                발행하기
              </Button>
              <Button
                type="submit"
                variant="light"
                disabled={loading || !formData.title || !formData.content}
                loading={loading}
              >
                임시저장
              </Button>
              <Button
                type="button"
                variant="subtle"
                onClick={goBack}
                disabled={loading}
              >
                취소
              </Button>
            </Group>
          </Stack>
        </Stack>
      </Box>
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
        <Center py="xl">
          <Loader />
        </Center>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="블로그 글 수정"
      onBack={goBack}
      backLabel="← 블로그 목록"
    >
      <Box component="form" onSubmit={e => handleSubmit(e)} maw={600}>
        <Stack gap="xl">
          {successMessage && (
            <Alert icon={<CheckCircle size={16} />} title="완료" color="green">
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert icon={<AlertCircle size={16} />} title="오류" color="red">
              {error}
            </Alert>
          )}

          {/* Status */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              상태
            </Text>
            <SegmentedControl
              value={formData.published ? "published" : "draft"}
              onChange={val =>
                setFormData({
                  ...formData,
                  published: val === "published",
                })
              }
              disabled={loading}
              data={[
                { label: "임시저장", value: "draft" },
                { label: "발행됨", value: "published" },
              ]}
              size="sm"
            />
          </Stack>

          {/* Title */}
          <TextInput
            label="제목 *"
            placeholder="블로그 글 제목을 입력하세요"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            disabled={loading}
            size="sm"
          />

          {/* Slug (Read-only) */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              슬러그 (URL)
            </Text>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                /blog/
              </Text>
              <TextInput
                placeholder={formData.slug}
                value={formData.slug}
                disabled
                size="sm"
                style={{ flex: 1 }}
              />
            </Group>
            <Text size="xs" c="dimmed">
              슬러그는 생성 시 자동으로 지정되며 변경할 수 없습니다
            </Text>
          </Stack>

          {/* Excerpt */}
          <Textarea
            label="요약"
            placeholder="목록에 표시될 간단한 요약을 입력하세요"
            value={formData.excerpt}
            onChange={e =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            minRows={3}
            disabled={loading}
            size="sm"
          />

          {/* Tags */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              태그
            </Text>
            <TagInput
              tags={formData.tags}
              onChange={tags => setFormData({ ...formData, tags })}
              placeholder="주제, 카테고리 등을 입력하세요"
            />
            <Text size="xs" c="dimmed">
              Enter 또는 쉼표로 태그를 추가하세요
            </Text>
          </Stack>

          {/* Content */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              본문 *
            </Text>
            <MarkdownEditor
              value={formData.content}
              onChange={content => setFormData({ ...formData, content })}
              placeholder="블로그 글을 마크다운으로 작성하세요..."
              height={500}
              minHeight={400}
            />
            <Group justify="flex-end">
              <Text size="xs" c="dimmed">
                {formData.content.length.toLocaleString()}자
              </Text>
            </Group>
          </Stack>

          {/* Submit */}
          <Group gap="md" pt="md">
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.content}
              loading={loading}
            >
              저장
            </Button>
            <Button
              type="button"
              variant="subtle"
              onClick={() => navigate({ view: "list" })}
              disabled={loading}
            >
              목록으로
            </Button>
          </Group>
        </Stack>
      </Box>
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
