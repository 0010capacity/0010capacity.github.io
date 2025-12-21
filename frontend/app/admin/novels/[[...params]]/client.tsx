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
import { novelsApi } from "@/lib/api";
import {
  Stack,
  Group,
  Text,
  Button,
  Paper,
  Badge,
  Flex,
  Box,
  Input,
  Textarea,
  Select,
  ActionIcon,
  Alert,
  Grid,
  Loader,
} from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";

// Navigation Context for SPA-style routing
interface NavState {
  view: "list" | "new" | "edit" | "chapters" | "chapter-new" | "chapter-edit";
  slug?: string;
  chapterNumber?: number;
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
interface Novel {
  id: string;
  title: string;
  slug: string;
  description: string;
  novel_type: string;
  genres: string[];
  status: string;
  chapter_count?: number;
  related_novels?: RelatedNovel[];
  created_at: string;
  updated_at: string;
}

interface RelatedNovel {
  id: string;
  slug: string;
  title: string;
  relation_type: string;
}

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NovelsResponse {
  novels: Novel[];
  total: number;
}

interface ChaptersResponse {
  chapters: Chapter[];
}

interface ChapterResponse {
  chapter: Chapter;
}

// Constants
const NOVEL_TYPES = [
  {
    id: "short",
    name: "단편",
    description: "한 편으로 완결되는 짧은 이야기",
    unit: "장",
    unitLabel: "장(章)",
    listLabel: "장 목록",
    nextText: "다음 장",
  },
  {
    id: "long",
    name: "장편",
    description: "한 권 분량의 완결된 이야기",
    unit: "장",
    unitLabel: "장(章)",
    listLabel: "장 목록",
    nextText: "다음 장",
  },
  {
    id: "series",
    name: "연재물",
    description: "여러 회차로 연재되는 이야기",
    unit: "화",
    unitLabel: "회차",
    listLabel: "회차 목록",
    nextText: "다음 화",
  },
];

// Helper: 소설 유형에 따른 단위 가져오기
const getNovelUnit = (novelType: string) => {
  return NOVEL_TYPES.find(t => t.id === novelType)?.unit || "화";
};

const getNovelUnitLabel = (novelType: string) => {
  return NOVEL_TYPES.find(t => t.id === novelType)?.unitLabel || "회차";
};

const getUnitListLabel = (novelType: string) => {
  return NOVEL_TYPES.find(t => t.id === novelType)?.listLabel || "목록";
};

const getNextUnitText = (novelType: string) => {
  return NOVEL_TYPES.find(t => t.id === novelType)?.nextText || "다음";
};

const GENRES = [
  { id: "fantasy", name: "판타지" },
  { id: "romance", name: "로맨스" },
  { id: "action", name: "액션" },
  { id: "thriller", name: "스릴러" },
  { id: "mystery", name: "미스터리" },
  { id: "sf", name: "SF" },
  { id: "horror", name: "호러" },
  { id: "drama", name: "드라마" },
  { id: "comedy", name: "코미디" },
  { id: "slice_of_life", name: "일상" },
  { id: "historical", name: "역사" },
  { id: "martial_arts", name: "무협" },
  { id: "game", name: "게임" },
  { id: "sports", name: "스포츠" },
  { id: "music", name: "음악" },
  { id: "psychological", name: "심리" },
  { id: "supernatural", name: "초자연" },
  { id: "adventure", name: "모험" },
];

const RELATION_TYPES = [
  { id: "related", name: "연관 작품" },
  { id: "sequel", name: "후속작" },
  { id: "prequel", name: "전편" },
  { id: "spinoff", name: "스핀오프" },
  { id: "same_universe", name: "같은 세계관" },
];

const STATUS_OPTIONS = [
  { id: "draft", name: "임시저장" },
  { id: "ongoing", name: "연재중" },
  { id: "completed", name: "완결" },
  { id: "hiatus", name: "휴재" },
];

// Helper functions
const getNovelTypeName = (typeId: string) => {
  return NOVEL_TYPES.find(t => t.id === typeId)?.name || typeId;
};

const getGenreName = (genreId: string) => {
  return GENRES.find(g => g.id === genreId)?.name || genreId;
};

const getStatusName = (statusId: string) => {
  return STATUS_OPTIONS.find(s => s.id === statusId)?.name || statusId;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ongoing: "blue",
    completed: "green",
    hiatus: "yellow",
    draft: "gray",
  };
  return colors[status] || "gray";
};

const getTypeColor = (novelType: string): string => {
  const colors: Record<string, string> = {
    short: "purple",
    long: "indigo",
    series: "cyan",
  };
  return colors[novelType] || "gray";
};

// Novel List Component
function NovelsList() {
  const { navigate } = useNav();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      setLoading(true);
      const response = (await novelsApi.list({
        include_drafts: true,
      })) as NovelsResponse;
      setNovels(response.novels || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "소설 목록을 불러오는데 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await novelsApi.delete(slug, token);
      setNovels(novels.filter(novel => novel.slug !== slug));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <AdminLayout title="소설 관리">
        <Flex justify="center" align="center" h={300}>
          <Loader />
        </Flex>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="소설 관리">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            총 {novels.length}개의 소설
          </Text>
          <Button
            onClick={() => navigate({ view: "new" })}
            leftSection={<IconPlus size={16} />}
            size="sm"
          >
            새 소설
          </Button>
        </Group>

        {/* Error Message */}
        {error && (
          <Alert title="오류" color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {novels.length === 0 && (
          <Paper
            p="xl"
            ta="center"
            style={{ borderTop: "1px solid var(--mantine-color-gray-7)" }}
          >
            <Text c="dimmed" mb="md">
              아직 소설이 없습니다
            </Text>
            <Button variant="light" onClick={() => navigate({ view: "new" })}>
              첫 소설 작성하기 →
            </Button>
          </Paper>
        )}

        {/* Novel List */}
        <Stack gap="md">
          {novels.map(novel => (
            <Paper
              key={novel.id}
              p="md"
              style={{
                borderLeft: `4px solid var(--mantine-color-${getTypeColor(novel.novel_type)}-6)`,
              }}
            >
              <Stack gap="sm">
                {/* Badges */}
                <Group gap="xs">
                  <Badge color={getTypeColor(novel.novel_type)} variant="light">
                    {getNovelTypeName(novel.novel_type)}
                  </Badge>
                  <Badge color={getStatusColor(novel.status)} variant="light">
                    {getStatusName(novel.status)}
                  </Badge>
                </Group>

                {/* Title and Description */}
                <Box>
                  <Text fw={600} size="md" mb="xs">
                    {novel.title}
                  </Text>
                  {novel.description && (
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {novel.description}
                    </Text>
                  )}
                </Box>

                {/* Genres */}
                {novel.genres && novel.genres.length > 0 && (
                  <Group gap="xs">
                    {novel.genres.map(genre => (
                      <Badge key={genre} variant="dot" size="sm">
                        {getGenreName(genre)}
                      </Badge>
                    ))}
                  </Group>
                )}

                {/* Meta */}
                <Text size="xs" c="dimmed">
                  {new Date(novel.created_at).toLocaleDateString("ko-KR")}
                </Text>

                {/* Actions */}
                <Group justify="flex-end" gap="xs" mt="md">
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() =>
                      navigate({ view: "chapter-new", slug: novel.slug })
                    }
                  >
                    + {getNovelUnit(novel.novel_type)}
                  </Button>
                  <Button
                    variant="default"
                    size="xs"
                    onClick={() =>
                      navigate({ view: "chapters", slug: novel.slug })
                    }
                  >
                    {novel.novel_type === "series" ? "회차 관리" : "장 관리"}
                  </Button>
                  <Button
                    variant="default"
                    size="xs"
                    onClick={() => navigate({ view: "edit", slug: novel.slug })}
                  >
                    정보 수정
                  </Button>
                  {deleteConfirm === novel.slug ? (
                    <>
                      <Button
                        variant="light"
                        color="red"
                        size="xs"
                        onClick={() => handleDelete(novel.slug)}
                      >
                        확인
                      </Button>
                      <Button
                        variant="default"
                        size="xs"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => setDeleteConfirm(novel.slug)}
                    >
                      삭제
                    </Button>
                  )}
                </Group>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </AdminLayout>
  );
}

// Genre Selector Component
function GenreSelector({
  selected,
  onChange,
  disabled,
}: {
  selected: string[];
  onChange: (genres: string[]) => void;
  disabled?: boolean;
}) {
  const toggleGenre = (genreId: string) => {
    if (selected.includes(genreId)) {
      onChange(selected.filter(g => g !== genreId));
    } else {
      onChange([...selected, genreId]);
    }
  };

  return (
    <Group gap="xs">
      {GENRES.map(genre => (
        <Badge
          key={genre.id}
          variant={selected.includes(genre.id) ? "filled" : "light"}
          onClick={() => !disabled && toggleGenre(genre.id)}
          style={{
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {genre.name}
        </Badge>
      ))}
    </Group>
  );
}

// Related Novels Selector Component
function RelatedNovelsSelector({
  novelSlug,
  selected,
  onChange,
  disabled,
}: {
  novelSlug?: string;
  selected: { slug: string; title: string; relation_type: string }[];
  onChange: (
    relations: { slug: string; title: string; relation_type: string }[]
  ) => void;
  disabled?: boolean;
}) {
  const [allNovels, setAllNovels] = useState<Novel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRelationType, setSelectedRelationType] = useState("related");

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const response = (await novelsApi.list({
          include_drafts: true,
        })) as NovelsResponse;
        setAllNovels(response.novels?.filter(n => n.slug !== novelSlug) || []);
      } catch (err) {
        console.error("Failed to fetch novels:", err);
      }
    };
    fetchNovels();
  }, [novelSlug]);

  const filteredNovels = allNovels.filter(
    novel =>
      novel.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selected.some(s => s.slug === novel.slug)
  );

  const addRelation = (novel: Novel) => {
    onChange([
      ...selected,
      {
        slug: novel.slug,
        title: novel.title,
        relation_type: selectedRelationType,
      },
    ]);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const removeRelation = (slug: string) => {
    onChange(selected.filter(s => s.slug !== slug));
  };

  const updateRelationType = (slug: string, relationType: string) => {
    onChange(
      selected.map(s =>
        s.slug === slug ? { ...s, relation_type: relationType } : s
      )
    );
  };

  return (
    <Stack gap="md">
      {/* Selected relations */}
      {selected.length > 0 && (
        <Stack gap="sm">
          {selected.map(relation => (
            <Group
              key={relation.slug}
              justify="space-between"
              p="sm"
              style={{ backgroundColor: "var(--mantine-color-gray-8)" }}
            >
              <Text flex={1} size="sm">
                {relation.title}
              </Text>
              <Select
                value={relation.relation_type}
                onChange={value =>
                  value && updateRelationType(relation.slug, value)
                }
                disabled={disabled}
                data={RELATION_TYPES.map(type => ({
                  value: type.id,
                  label: type.name,
                }))}
                size="xs"
                searchable={false}
                clearable={false}
              />
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => removeRelation(relation.slug)}
                disabled={disabled}
                size="sm"
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}

      {/* Add relation */}
      <Stack gap="sm">
        <Group gap="sm">
          <Input
            placeholder="연관 작품 검색..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.currentTarget.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            disabled={disabled}
            flex={1}
          />
          <Select
            value={selectedRelationType}
            onChange={value => value && setSelectedRelationType(value)}
            disabled={disabled}
            data={RELATION_TYPES.map(type => ({
              value: type.id,
              label: type.name,
            }))}
            searchable={false}
            clearable={false}
            style={{ minWidth: 150 }}
          />
        </Group>

        {showDropdown && filteredNovels.length > 0 && (
          <Paper
            p="xs"
            style={{
              maxHeight: 300,
              overflow: "auto",
              border: "1px solid var(--mantine-color-gray-6)",
            }}
          >
            <Stack gap={0}>
              {filteredNovels.map(novel => (
                <Button
                  key={novel.slug}
                  variant="subtle"
                  onClick={() => addRelation(novel)}
                  justify="flex-start"
                  size="sm"
                >
                  {novel.title}
                </Button>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Stack>
  );
}

// New Novel Component
function NewNovel() {
  const { navigate, goBack } = useNav();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    novel_type: "series" as string,
    genres: [] as string[],
    status: "draft" as string,
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
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
      const submitData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        novel_type: formData.novel_type,
        genres: formData.genres,
        status: formData.status,
      };

      const response = (await novelsApi.create(submitData, token)) as Novel;
      navigate({ view: "chapter-new", slug: response.slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "소설 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="새 소설" onBack={goBack} backLabel="← 소설 목록">
      <form onSubmit={handleSubmit}>
        <Stack gap="lg" maw={600}>
          {error && (
            <Alert title="오류" color="red" variant="light">
              {error}
            </Alert>
          )}

          {/* Title */}
          <Stack gap="xs">
            <Text component="label" fw={500} size="sm">
              제목 *
            </Text>
            <Input
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.currentTarget.value })
              }
              placeholder="소설 제목을 입력하세요"
              required
              disabled={loading}
            />
            <Text size="xs" c="dimmed">
              URL 슬러그는 UUID 기반으로 자동 생성됩니다
            </Text>
          </Stack>

          {/* Novel Type */}
          <Stack gap="xs">
            <Text fw={500} size="sm">
              소설 유형 *
            </Text>
            <Grid gutter="md">
              {NOVEL_TYPES.map(type => (
                <Grid.Col key={type.id} span={{ base: 12, sm: 4 }}>
                  <Paper
                    p="md"
                    onClick={() =>
                      setFormData({ ...formData, novel_type: type.id })
                    }
                    style={{
                      cursor: "pointer",
                      border:
                        formData.novel_type === type.id
                          ? "2px solid var(--mantine-primary-color)"
                          : "2px solid var(--mantine-color-gray-6)",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <Text fw={600} size="sm">
                      {type.name}
                    </Text>
                    <Text size="xs" c="dimmed" mt="xs">
                      {type.description}
                    </Text>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>

          {/* Genres */}
          <Stack gap="xs">
            <Text fw={500} size="sm">
              장르
            </Text>
            <GenreSelector
              selected={formData.genres}
              onChange={genres => setFormData({ ...formData, genres })}
              disabled={loading}
            />
          </Stack>

          {/* Description */}
          <Stack gap="xs">
            <Text component="label" fw={500} size="sm">
              설명
            </Text>
            <Textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.currentTarget.value })
              }
              rows={4}
              placeholder="소설에 대한 간단한 설명을 입력하세요"
              disabled={loading}
            />
          </Stack>

          {/* Status */}
          <Stack gap="xs">
            <Text fw={500} size="sm">
              상태
            </Text>
            <Group gap="xs">
              {STATUS_OPTIONS.map(status => (
                <Badge
                  key={status.id}
                  variant={formData.status === status.id ? "filled" : "light"}
                  onClick={() =>
                    setFormData({ ...formData, status: status.id })
                  }
                  style={{
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {status.name}
                </Badge>
              ))}
            </Group>
          </Stack>

          {/* Submit */}
          <Stack
            gap="md"
            pt="md"
            style={{ borderTop: "1px solid var(--mantine-color-gray-7)" }}
          >
            <Text size="sm" c="dimmed">
              {formData.novel_type === "short"
                ? "소설 정보를 저장하면 본문 작성 페이지로 이동합니다."
                : formData.novel_type === "long"
                  ? "소설 정보를 저장하면 첫 번째 장(章) 작성 페이지로 이동합니다."
                  : "소설 정보를 저장하면 1화 작성 페이지로 이동합니다."}
            </Text>
            <Group justify="flex-start">
              <Button
                type="submit"
                disabled={loading || !formData.title}
                loading={loading}
              >
                {formData.novel_type === "short"
                  ? "저장 후 본문 작성 →"
                  : formData.novel_type === "long"
                    ? "저장 후 1장 작성 →"
                    : "저장 후 1화 작성 →"}
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={goBack}
                disabled={loading}
              >
                취소
              </Button>
            </Group>
          </Stack>
        </Stack>
      </form>
    </AdminLayout>
  );
}

// Edit Novel Component
function EditNovel({ slug }: { slug: string }) {
  const { navigate, goBack } = useNav();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    novel_type: "series",
    genres: [] as string[],
    status: "draft",
  });

  const [relatedNovels, setRelatedNovels] = useState<
    { slug: string; title: string; relation_type: string }[]
  >([]);
  const [originalRelations, setOriginalRelations] = useState<
    { slug: string; title: string; relation_type: string }[]
  >([]);

  const fetchNovel = useCallback(async () => {
    try {
      const novel = (await novelsApi.getBySlug(slug)) as Novel;
      setFormData({
        title: novel.title,
        description: novel.description || "",
        novel_type: novel.novel_type || "series",
        genres: novel.genres || [],
        status: novel.status,
      });

      const relations =
        novel.related_novels?.map(r => ({
          slug: r.slug,
          title: r.title,
          relation_type: r.relation_type,
        })) || [];
      setRelatedNovels(relations);
      setOriginalRelations(relations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "소설을 불러오는데 실패했습니다"
      );
    } finally {
      setFetchLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchNovel();
  }, [fetchNovel]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const removedRelations = originalRelations.filter(
        orig => !relatedNovels.some(r => r.slug === orig.slug)
      );
      const addedOrUpdatedRelations = relatedNovels.filter(r => {
        const orig = originalRelations.find(o => o.slug === r.slug);
        return !orig || orig.relation_type !== r.relation_type;
      });

      const submitData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        novel_type: formData.novel_type,
        genres: formData.genres,
        status: formData.status,
      };

      if (removedRelations.length > 0) {
        submitData.remove_related_novels = removedRelations.map(r => r.slug);
      }

      if (addedOrUpdatedRelations.length > 0) {
        submitData.related_novels = addedOrUpdatedRelations.map(r => ({
          related_novel_slug: r.slug,
          relation_type: r.relation_type,
        }));
      }

      await novelsApi.update(slug, submitData, token);
      navigate({ view: "list" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "소설 수정에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout title="소설 편집" onBack={goBack} backLabel="← 소설 목록">
        <Flex justify="center" align="center" h={300}>
          <Loader />
        </Flex>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="소설 편집" onBack={goBack} backLabel="← 소설 목록">
      <form onSubmit={handleSubmit}>
        <Stack gap="lg" maw={600}>
          {error && (
            <Alert title="오류" color="red" variant="light">
              {error}
            </Alert>
          )}

          {/* Title */}
          <Stack gap="xs">
            <Text component="label" fw={500} size="sm">
              제목 *
            </Text>
            <Input
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.currentTarget.value })
              }
              placeholder="소설 제목"
              required
              disabled={loading}
            />
          </Stack>

          {/* Novel Type */}
          <Stack gap="xs">
            <Text fw={500} size="sm">
              소설 유형 *
            </Text>
            <Grid gutter="md">
              {NOVEL_TYPES.map(type => (
                <Grid.Col key={type.id} span={{ base: 12, sm: 4 }}>
                  <Paper
                    p="md"
                    onClick={() =>
                      setFormData({ ...formData, novel_type: type.id })
                    }
                    style={{
                      cursor: "pointer",
                      border:
                        formData.novel_type === type.id
                          ? "2px solid var(--mantine-primary-color)"
                          : "2px solid var(--mantine-color-gray-6)",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <Text fw={600} size="sm">
                      {type.name}
                    </Text>
                    <Text size="xs" c="dimmed" mt="xs">
                      {type.description}
                    </Text>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>

          {/* Genres */}
          <Stack gap="xs">
            <Text fw={500} size="sm">
              장르
            </Text>
            <GenreSelector
              selected={formData.genres}
              onChange={genres => setFormData({ ...formData, genres })}
              disabled={loading}
            />
          </Stack>

          {/* Description */}
          <Stack gap="xs">
            <Text component="label" fw={500} size="sm">
              설명
            </Text>
            <Textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.currentTarget.value })
              }
              rows={4}
              placeholder="소설에 대한 설명"
              disabled={loading}
            />
          </Stack>

          {/* Status */}
          <Stack gap="xs">
            <Text fw={500} size="sm">
              상태
            </Text>
            <Group gap="xs">
              {STATUS_OPTIONS.map(status => (
                <Badge
                  key={status.id}
                  variant={formData.status === status.id ? "filled" : "light"}
                  onClick={() =>
                    setFormData({ ...formData, status: status.id })
                  }
                  style={{
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {status.name}
                </Badge>
              ))}
            </Group>
          </Stack>

          {/* Related Novels */}
          <Stack gap="xs">
            <Text fw={500} size="sm">
              연관 작품
            </Text>
            <RelatedNovelsSelector
              novelSlug={slug}
              selected={relatedNovels}
              onChange={setRelatedNovels}
              disabled={loading}
            />
          </Stack>

          {/* Submit */}
          <Group
            justify="flex-start"
            pt="md"
            style={{ borderTop: "1px solid var(--mantine-color-gray-7)" }}
          >
            <Button
              type="submit"
              disabled={loading || !formData.title}
              loading={loading}
            >
              저장
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={goBack}
              disabled={loading}
            >
              취소
            </Button>
          </Group>
        </Stack>
      </form>
    </AdminLayout>
  );
}

// Chapters List Component
function ChaptersList({ slug }: { slug: string }) {
  const { navigate, goBack } = useNav();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [novelData, chaptersData] = await Promise.all([
        novelsApi.getBySlug(slug),
        novelsApi.getChapters(slug),
      ]);
      setNovel(novelData as Novel);
      setChapters((chaptersData as ChaptersResponse).chapters || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (chapterNumber: number) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await novelsApi.deleteChapter(slug, chapterNumber, token);
      setChapters(chapters.filter(c => c.chapter_number !== chapterNumber));
      setDeleteConfirm(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "장을 삭제하는데 실패했습니다"
      );
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title={`${novel?.title} - ${getUnitListLabel(novel?.novel_type || "series")}`}
        onBack={goBack}
        backLabel="← 돌아가기"
      >
        <Flex justify="center" align="center" h={300}>
          <Loader />
        </Flex>
      </AdminLayout>
    );
  }

  const unit = getNovelUnit(novel?.novel_type || "series");

  const titleText =
    novel?.novel_type === "series" ? `${unit} 목록` : `${unit} 목록`;

  return (
    <AdminLayout
      title={`${novel?.title} - ${titleText}`}
      onBack={goBack}
      backLabel="← 돌아가기"
    >
      <Stack gap="lg">
        {error && (
          <Alert title="오류" color="red" variant="light">
            {error}
          </Alert>
        )}

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            총 {chapters.length}개의 {unit}
          </Text>
          <Button
            onClick={() => navigate({ view: "chapter-new", slug })}
            leftSection={<IconPlus size={16} />}
            size="sm"
          >
            새 {unit}
          </Button>
        </Group>

        {chapters.length === 0 ? (
          <Paper p="xl" ta="center">
            <Text c="dimmed" mb="md">
              아직 {unit}이 없습니다
            </Text>
            <Button
              variant="light"
              onClick={() => navigate({ view: "chapter-new", slug })}
            >
              첫 {unit} 작성하기 →
            </Button>
          </Paper>
        ) : (
          <Stack gap="md">
            {chapters.map(chapter => (
              <Paper key={chapter.id} p="md">
                <Group justify="space-between" align="flex-start">
                  <Box flex={1}>
                    <Text fw={600} size="md">
                      {unit} {chapter.chapter_number}: {chapter.title}
                    </Text>
                    <Text size="xs" c="dimmed" mt="xs">
                      {new Date(chapter.created_at).toLocaleDateString("ko-KR")}
                    </Text>
                  </Box>
                  <Group gap="xs">
                    <Button
                      variant="default"
                      size="xs"
                      onClick={() =>
                        navigate({
                          view: "chapter-edit",
                          slug,
                          chapterNumber: chapter.chapter_number,
                        })
                      }
                    >
                      수정
                    </Button>
                    {deleteConfirm === chapter.chapter_number ? (
                      <>
                        <Button
                          variant="light"
                          color="red"
                          size="xs"
                          onClick={() => handleDelete(chapter.chapter_number)}
                        >
                          확인
                        </Button>
                        <Button
                          variant="default"
                          size="xs"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          취소
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => setDeleteConfirm(chapter.chapter_number)}
                      >
                        삭제
                      </Button>
                    )}
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </AdminLayout>
  );
}

// New Chapter Component
function NewChapter({ slug }: { slug: string }) {
  const { navigate, goBack } = useNav();
  const [novel, setNovel] = useState<Novel | null>(null);

  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    number: 1,
    title: "",
    content: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNovelData = useCallback(async () => {
    try {
      const novelData = (await novelsApi.getBySlug(slug)) as Novel;
      const chaptersData = (await novelsApi.getChapters(
        slug
      )) as ChaptersResponse;
      setNovel(novelData);

      const chapters = chaptersData.chapters || [];
      const maxNumber = Math.max(
        ...chapters.map((c: Chapter) => c.chapter_number),
        0
      );
      setFormData(prev => ({
        ...prev,
        number: maxNumber + 1,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "소설 정보를 불러오는데 실패했습니다"
      );
    } finally {
      setFetchLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchNovelData();
  }, [fetchNovelData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("로그인이 필요합니다");
      setIsSubmitting(false);
      return;
    }

    try {
      await novelsApi.createChapter(
        slug,
        {
          chapter_number: formData.number,
          title: formData.title,
          content: formData.content,
        },
        token
      );

      const unit = getNovelUnit(novel?.novel_type || "series");

      setSuccessMessage(`${unit}이 저장되었습니다`);

      // 성공 메시지 표시 후 다음 단계로 진행
      setTimeout(() => {
        navigate({ view: "chapter-new", slug });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout title="새 장" onBack={goBack} backLabel="← 돌아가기">
        <Flex justify="center" align="center" h={300}>
          <Loader />
        </Flex>
      </AdminLayout>
    );
  }

  const unitLabel = getNovelUnitLabel(novel?.novel_type || "series");
  const listLabel = getUnitListLabel(novel?.novel_type || "series");
  const nextText = getNextUnitText(novel?.novel_type || "series");
  const titleText =
    novel?.novel_type === "series"
      ? `새로운 회차`
      : novel?.novel_type === "long"
        ? `새로운 장(章)`
        : `새로운 본문`;

  return (
    <AdminLayout title={titleText} onBack={goBack} backLabel="← 돌아가기">
      <form onSubmit={handleSubmit}>
        <Stack gap="lg" maw={900}>
          {error && (
            <Alert title="오류" color="red" variant="light">
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert title="성공" color="green" variant="light">
              {successMessage}
            </Alert>
          )}

          {/* Chapter Number */}
          <Stack gap="xs">
            <Text component="label" fw={500} size="sm">
              {unitLabel}
            </Text>
            <Input
              type="number"
              value={formData.number}
              onChange={e =>
                setFormData({
                  ...formData,
                  number: parseInt(e.currentTarget.value) || 1,
                })
              }
              min={1}
              disabled={isSubmitting}
            />
          </Stack>

          {/* Title */}
          <Stack gap="xs">
            <Text component="label" fw={500} size="sm">
              제목 *
            </Text>
            <Input
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.currentTarget.value })
              }
              placeholder="장의 제목을 입력하세요"
              required
              disabled={isSubmitting}
            />
          </Stack>

          {/* Content */}
          <Stack gap="xs">
            <Text component="label" fw={500} size="sm">
              내용 *
            </Text>
            <MarkdownEditor
              value={formData.content}
              onChange={content => setFormData({ ...formData, content })}
            />
          </Stack>

          {/* Submit */}
          <Group
            justify="flex-start"
            pt="md"
            style={{ borderTop: "1px solid var(--mantine-color-gray-7)" }}
          >
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.content}
              loading={isSubmitting}
            >
              저장 후 {nextText} 작성 →
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => navigate({ view: "chapters", slug })}
              disabled={isSubmitting}
            >
              {listLabel}로 돌아가기
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={goBack}
              disabled={isSubmitting}
            >
              취소
            </Button>
          </Group>
        </Stack>
      </form>
    </AdminLayout>
  );
}

// Edit Chapter Component
function EditChapter({
  slug,
  chapterNumber,
}: {
  slug: string;
  chapterNumber: number;
}) {
  const { navigate, goBack } = useNav();
  const [, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    number: chapterNumber,
    title: "",
    content: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [novelData, chapterData] = await Promise.all([
        novelsApi.getBySlug(slug),
        novelsApi.getChapter(slug, chapterNumber),
      ]);
      setNovel(novelData as Novel);

      const chapter = (chapterData as ChapterResponse).chapter;
      setFormData({
        number: chapter.chapter_number,
        title: chapter.title,
        content: chapter.content,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다"
      );
    } finally {
      setFetchLoading(false);
    }
  }, [slug, chapterNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      await novelsApi.updateChapter(
        slug,
        chapterNumber,
        {
          title: formData.title,
          content: formData.content,
        },
        token
      );
      navigate({ view: "chapters", slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout title="장 편집" onBack={goBack} backLabel="← 돌아가기">
        <Flex justify="center" align="center" h={300}>
          <Loader />
        </Flex>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="장 편집" onBack={goBack} backLabel="← 돌아가기">
      <form onSubmit={handleSubmit}>
        <Stack gap="lg" maw={900}>
          {error && (
            <Alert title="오류" color="red" variant="light">
              {error}
            </Alert>
          )}

          {/* Title */}
          <Stack gap="xs">
            <Text component="label" fw={500} size="sm">
              제목 *
            </Text>
            <Input
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.currentTarget.value })
              }
              placeholder="장의 제목"
              required
              disabled={loading}
            />
          </Stack>

          {/* Content */}
          <Stack gap="xs">
            <Text component="label" fw={500} size="sm">
              내용 *
            </Text>
            <MarkdownEditor
              value={formData.content}
              onChange={content => setFormData({ ...formData, content })}
            />
          </Stack>

          {/* Submit */}
          <Group
            justify="flex-start"
            pt="md"
            style={{ borderTop: "1px solid var(--mantine-color-gray-7)" }}
          >
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.content}
              loading={loading}
            >
              저장
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => navigate({ view: "chapters", slug })}
              disabled={loading}
            >
              목록으로 돌아가기
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={goBack}
              disabled={loading}
            >
              취소
            </Button>
          </Group>
        </Stack>
      </form>
    </AdminLayout>
  );
}

// Main NovelsAdminClient Component
export default function NovelsAdminClient() {
  const [navState, setNavState] = useState<NavState>({
    view: "list",
  });
  const [, setHistory] = useState<NavState[]>([]);

  const navigate = useCallback(
    (state: NavState) => {
      setHistory((prev: NavState[]) => [...prev, navState]);
      setNavState(state);
    },
    [navState]
  );

  const goBack = useCallback(() => {
    setHistory((prev: NavState[]) => {
      const newHistory = [...prev];
      const prevState = newHistory.pop();
      if (prevState) {
        setNavState(prevState);
      }
      return newHistory;
    });
  }, []);

  const renderView = () => {
    const { view, slug, chapterNumber } = navState;

    switch (view) {
      case "list":
        return <NovelsList />;
      case "new":
        return <NewNovel />;
      case "edit":
        return slug ? <EditNovel slug={slug} /> : null;
      case "chapters":
        return slug ? <ChaptersList slug={slug} /> : null;
      case "chapter-new":
        return slug ? <NewChapter slug={slug} /> : null;
      case "chapter-edit":
        return slug && chapterNumber ? (
          <EditChapter slug={slug} chapterNumber={chapterNumber} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <NavContext.Provider value={{ navState, navigate, goBack }}>
      {renderView()}
    </NavContext.Provider>
  );
}
