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
      const response = (await novelsApi.list()) as NovelsResponse;
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ongoing: "bg-blue-900/50 text-blue-400",
      completed: "bg-green-900/50 text-green-400",
      hiatus: "bg-yellow-900/50 text-yellow-400",
      draft: "bg-neutral-800 text-neutral-400",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded ${colors[status] || colors.draft}`}
      >
        {getStatusName(status)}
      </span>
    );
  };

  const getTypeBadge = (novelType: string) => {
    const colors: Record<string, string> = {
      short: "bg-purple-900/50 text-purple-400",
      long: "bg-indigo-900/50 text-indigo-400",
      series: "bg-cyan-900/50 text-cyan-400",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded ${colors[novelType] || "bg-neutral-800 text-neutral-400"}`}
      >
        {getNovelTypeName(novelType)}
      </span>
    );
  };

  return (
    <AdminLayout title="소설 관리">
      <div className="flex justify-between items-center mb-8">
        <p className="text-neutral-500 text-sm">총 {novels.length}개의 소설</p>
        <button
          onClick={() => navigate({ view: "new" })}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm rounded transition-colors"
        >
          + 새 소설
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

      {!loading && novels.length === 0 && (
        <div className="text-center py-12 border border-neutral-800 rounded">
          <p className="text-neutral-500 mb-4">아직 소설이 없습니다</p>
          <button
            onClick={() => navigate({ view: "new" })}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            첫 소설 작성하기 →
          </button>
        </div>
      )}

      {!loading && novels.length > 0 && (
        <div className="space-y-4">
          {novels.map(novel => (
            <div
              key={novel.id}
              className="border border-neutral-800 rounded p-4 hover:border-neutral-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(novel.novel_type)}
                    {getStatusBadge(novel.status)}
                  </div>
                  <h3 className="text-lg text-neutral-100 mb-1">
                    {novel.title}
                  </h3>
                  {novel.description && (
                    <p className="text-neutral-500 text-sm mb-2 line-clamp-2">
                      {novel.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {novel.genres?.map(genre => (
                      <span
                        key={genre}
                        className="px-2 py-0.5 text-xs bg-neutral-800/50 text-neutral-400 rounded"
                      >
                        {getGenreName(genre)}
                      </span>
                    ))}
                  </div>
                  <p className="text-neutral-600 text-xs">
                    {new Date(novel.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() =>
                      navigate({ view: "chapter-new", slug: novel.slug })
                    }
                    className="px-3 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
                  >
                    + {getNovelUnit(novel.novel_type)}
                  </button>
                  <button
                    onClick={() =>
                      navigate({ view: "chapters", slug: novel.slug })
                    }
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {novel.novel_type === "series" ? "회차 관리" : "장 관리"}
                  </button>
                  <button
                    onClick={() => navigate({ view: "edit", slug: novel.slug })}
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    정보 수정
                  </button>
                  {deleteConfirm === novel.slug ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(novel.slug)}
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
                      onClick={() => setDeleteConfirm(novel.slug)}
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
    <div className="flex flex-wrap gap-2">
      {GENRES.map(genre => (
        <button
          key={genre.id}
          type="button"
          onClick={() => toggleGenre(genre.id)}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            selected.includes(genre.id)
              ? "bg-neutral-100 text-neutral-900"
              : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
          } disabled:opacity-50`}
        >
          {genre.name}
        </button>
      ))}
    </div>
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
        const response = (await novelsApi.list()) as NovelsResponse;
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
    <div className="space-y-4">
      {/* Selected relations */}
      {selected.length > 0 && (
        <div className="space-y-2">
          {selected.map(relation => (
            <div
              key={relation.slug}
              className="flex items-center gap-2 p-2 bg-neutral-900 rounded"
            >
              <span className="flex-1 text-neutral-300">{relation.title}</span>
              <select
                value={relation.relation_type}
                onChange={e =>
                  updateRelationType(relation.slug, e.target.value)
                }
                disabled={disabled}
                className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm text-neutral-300"
              >
                {RELATION_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeRelation(relation.slug)}
                disabled={disabled}
                className="px-2 py-1 text-neutral-500 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add relation */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="연관 작품 검색..."
            disabled={disabled}
            className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
          />
          <select
            value={selectedRelationType}
            onChange={e => setSelectedRelationType(e.target.value)}
            disabled={disabled}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-300"
          >
            {RELATION_TYPES.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {showDropdown && filteredNovels.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-neutral-900 border border-neutral-700 rounded shadow-lg max-h-48 overflow-y-auto">
            {filteredNovels.map(novel => (
              <button
                key={novel.slug}
                type="button"
                onClick={() => addRelation(novel)}
                className="w-full px-4 py-2 text-left text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                {novel.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
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
    content: "", // For short/long novels that don't use chapters
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
      // 소설 생성 후 첫 번째 챕터 작성 페이지로 이동
      navigate({ view: "chapter-new", slug: response.slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "소설 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="새 소설" onBack={goBack} backLabel="← 소설 목록">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
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
            placeholder="소설 제목을 입력하세요"
            required
            disabled={loading}
          />
          <p className="mt-1 text-xs text-neutral-600">
            URL 슬러그는 UUID 기반으로 자동 생성됩니다
          </p>
        </div>

        {/* Novel Type */}
        <div>
          <label className="block text-sm text-neutral-500 mb-3">
            소설 유형 *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {NOVEL_TYPES.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, novel_type: type.id })
                }
                disabled={loading}
                className={`p-4 rounded border text-left transition-colors ${
                  formData.novel_type === type.id
                    ? "border-neutral-400 bg-neutral-800"
                    : "border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="font-medium text-neutral-200">{type.name}</div>
                <div className="text-xs text-neutral-500 mt-1">
                  {type.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className="block text-sm text-neutral-500 mb-3">장르</label>
          <GenreSelector
            selected={formData.genres}
            onChange={genres => setFormData({ ...formData, genres })}
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm text-neutral-500 mb-2"
          >
            설명
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            placeholder="소설에 대한 간단한 설명을 입력하세요"
            disabled={loading}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm text-neutral-500 mb-3">상태</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(status => (
              <button
                key={status.id}
                type="button"
                onClick={() => setFormData({ ...formData, status: status.id })}
                disabled={loading}
                className={`px-4 py-2 rounded transition-colors ${
                  formData.status === status.id
                    ? "bg-neutral-100 text-neutral-900"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {status.name}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-4 pt-4 border-t border-neutral-800">
          <p className="text-sm text-neutral-500">
            {formData.novel_type === "short"
              ? "소설 정보를 저장하면 본문 작성 페이지로 이동합니다."
              : formData.novel_type === "long"
                ? "소설 정보를 저장하면 첫 번째 장(章) 작성 페이지로 이동합니다."
                : "소설 정보를 저장하면 1화 작성 페이지로 이동합니다."}
          </p>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !formData.title}
              className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
            >
              {loading
                ? "생성 중..."
                : formData.novel_type === "short"
                  ? "저장 후 본문 작성 →"
                  : formData.novel_type === "long"
                    ? "저장 후 1장 작성 →"
                    : "저장 후 1화 작성 →"}
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
      // Update novel
      await novelsApi.update(slug, formData, token);

      // Handle relation changes
      const removedRelations = originalRelations.filter(
        orig => !relatedNovels.some(rel => rel.slug === orig.slug)
      );

      const addedOrUpdatedRelations = relatedNovels.filter(rel => {
        const orig = originalRelations.find(o => o.slug === rel.slug);
        return !orig || orig.relation_type !== rel.relation_type;
      });

      // Remove relations
      for (const rel of removedRelations) {
        await novelsApi.removeRelation(slug, rel.slug, token);
      }

      // Add or update relations
      for (const rel of addedOrUpdatedRelations) {
        await novelsApi.addRelation(
          slug,
          {
            related_novel_slug: rel.slug,
            relation_type: rel.relation_type,
          },
          token
        );
      }

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
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="소설 편집" onBack={goBack} backLabel="← 소설 목록">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
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
            placeholder="소설 제목을 입력하세요"
            required
            disabled={loading}
          />
        </div>

        {/* Novel Type */}
        <div>
          <label className="block text-sm text-neutral-500 mb-3">
            소설 유형 *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {NOVEL_TYPES.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, novel_type: type.id })
                }
                disabled={loading}
                className={`p-4 rounded border text-left transition-colors ${
                  formData.novel_type === type.id
                    ? "border-neutral-400 bg-neutral-800"
                    : "border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="font-medium text-neutral-200">{type.name}</div>
                <div className="text-xs text-neutral-500 mt-1">
                  {type.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className="block text-sm text-neutral-500 mb-3">장르</label>
          <GenreSelector
            selected={formData.genres}
            onChange={genres => setFormData({ ...formData, genres })}
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm text-neutral-500 mb-2"
          >
            설명
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            placeholder="소설에 대한 간단한 설명을 입력하세요"
            disabled={loading}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm text-neutral-500 mb-3">상태</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(status => (
              <button
                key={status.id}
                type="button"
                onClick={() => setFormData({ ...formData, status: status.id })}
                disabled={loading}
                className={`px-4 py-2 rounded transition-colors ${
                  formData.status === status.id
                    ? "bg-neutral-100 text-neutral-900"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {status.name}
              </button>
            ))}
          </div>
        </div>

        {/* Related Novels */}
        <div>
          <label className="block text-sm text-neutral-500 mb-3">
            연관 작품
          </label>
          <RelatedNovelsSelector
            novelSlug={slug}
            selected={relatedNovels}
            onChange={setRelatedNovels}
            disabled={loading}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
          >
            {loading ? "저장 중..." : "저장"}
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
      </form>
    </AdminLayout>
  );
}

// Chapters List Component
function ChaptersList({ slug }: { slug: string }) {
  const { navigate } = useNav();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [novelData, chaptersData] = await Promise.all([
        novelsApi.getBySlug(slug),
        novelsApi.getChapters(slug),
      ]);
      setNovel(novelData as Novel);
      setChapters((chaptersData as Chapter[]) || []);
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
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  };

  // 소설 유형에 따른 라벨
  const unit = novel ? getNovelUnit(novel.novel_type) : "화";
  const titleText = novel
    ? novel.novel_type === "series"
      ? `${novel.title} - 회차 관리`
      : `${novel.title} - 장 관리`
    : "챕터 관리";

  return (
    <AdminLayout
      title={titleText}
      onBack={() => navigate({ view: "list" })}
      backLabel="← 소설 목록"
    >
      <div className="flex justify-between items-center mb-8">
        <p className="text-neutral-500 text-sm">
          총 {chapters.length}개의{" "}
          {novel?.novel_type === "series" ? "회차" : "장"}
        </p>
        <button
          onClick={() => navigate({ view: "chapter-new", slug })}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm rounded transition-colors"
        >
          + 새 {unit}
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

      {!loading && chapters.length === 0 && (
        <div className="text-center py-12 border border-neutral-800 rounded">
          <p className="text-neutral-500 mb-4">
            아직 {novel?.novel_type === "series" ? "회차" : "장"}이 없습니다
          </p>
          <button
            onClick={() => navigate({ view: "chapter-new", slug })}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            첫 {novel?.novel_type === "series" ? "화" : "장"} 작성하기 →
          </button>
        </div>
      )}

      {!loading && chapters.length > 0 && (
        <div className="space-y-2">
          {chapters.map(chapter => (
            <div
              key={chapter.id}
              className="flex items-center justify-between p-4 border border-neutral-800 rounded hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-neutral-600 text-sm w-12">
                  {chapter.chapter_number}
                  {unit}
                </span>
                <span className="text-neutral-200">
                  {chapter.title || `(제목 없음)`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate({
                      view: "chapter-edit",
                      slug,
                      chapterNumber: chapter.chapter_number,
                    })
                  }
                  className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  편집
                </button>
                {deleteConfirm === chapter.chapter_number ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(chapter.chapter_number)}
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
                    onClick={() => setDeleteConfirm(chapter.chapter_number)}
                    className="px-3 py-1.5 text-sm text-neutral-600 hover:text-red-400 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

// New Chapter Component
function NewChapter({ slug }: { slug: string }) {
  const { navigate } = useNav();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(false);
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
      const [novelData, chaptersData] = await Promise.all([
        novelsApi.getBySlug(slug),
        novelsApi.getChapters(slug),
      ]);
      setNovel(novelData as Novel);

      // Set next chapter number
      const chapters = (chaptersData as { chapter_number: number }[]) || [];
      const maxNumber = chapters.reduce(
        (max: number, c: { chapter_number: number }) =>
          Math.max(max, c.chapter_number),
        0
      );
      setFormData(prev => ({ ...prev, number: maxNumber + 1 }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다"
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

    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    setError("");
    setLoading(true);
    setIsSubmitting(true);

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("로그인이 필요합니다");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      await novelsApi.createChapter(
        slug,
        {
          chapter_number: formData.number,
          title: formData.title.trim() || null,
          content: formData.content,
        },
        token
      );
      // 성공 메시지 표시 (소설 유형에 따라 단위 변경)
      const unit = novel ? getNovelUnit(novel.novel_type) : "화";
      const titleText = formData.title.trim() || `(제목 없음)`;
      setSuccessMessage(`${formData.number}${unit} "${titleText}" 저장 완료!`);
      // 다음 챕터 작성을 위해 폼 초기화
      setFormData({
        number: formData.number + 1,
        title: "",
        content: "",
      });
      setError("");
      // 3초 후 성공 메시지 숨김
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "챕터 생성에 실패했습니다");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout
        title="새 챕터"
        onBack={() => navigate({ view: "chapters", slug })}
        backLabel="← 목록"
      >
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  // 소설 유형에 따른 라벨
  const unitLabel = novel ? getNovelUnitLabel(novel.novel_type) : "회차";
  const listLabel = novel ? getUnitListLabel(novel.novel_type) : "목록";
  const nextText = novel ? getNextUnitText(novel.novel_type) : "다음 화";
  const titleText = novel
    ? novel.novel_type === "series"
      ? `${novel.title} - 새 화`
      : `${novel.title} - 새 장`
    : "새 챕터";

  return (
    <AdminLayout
      title={titleText}
      onBack={() => navigate({ view: "chapters", slug })}
      backLabel={`← ${listLabel}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="grid grid-cols-[100px_1fr] gap-4">
          <div>
            <label
              htmlFor="number"
              className="block text-sm text-neutral-500 mb-2"
            >
              {unitLabel} *
            </label>
            <input
              type="number"
              id="number"
              value={formData.number}
              onChange={e =>
                setFormData({ ...formData, number: parseInt(e.target.value) })
              }
              min={1}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-neutral-600 transition-colors"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm text-neutral-500 mb-2"
            >
              제목
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="챕터 제목을 입력하세요 (선택사항)"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-2">내용 *</label>
          <MarkdownEditor
            value={formData.content}
            onChange={content => setFormData({ ...formData, content })}
            placeholder="챕터 내용을 입력하세요..."
            minHeight={400}
          />
        </div>

        <div className="flex flex-col gap-4 pt-4 border-t border-neutral-800">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !formData.content || isSubmitting}
              className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
            >
              {loading ? "생성 중..." : `저장 후 ${nextText} →`}
            </button>
            <button
              type="button"
              disabled={loading || !formData.content || isSubmitting}
              onClick={async () => {
                // Prevent duplicate submissions
                if (isSubmitting) {
                  return;
                }

                const token = localStorage.getItem("admin_token");
                if (!token) return;
                setLoading(true);
                setIsSubmitting(true);
                try {
                  await novelsApi.createChapter(
                    slug,
                    {
                      chapter_number: formData.number,
                      title: formData.title.trim() || null,
                      content: formData.content,
                    },
                    token
                  );
                  navigate({ view: "chapters", slug });
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "챕터 생성에 실패했습니다"
                  );
                  setLoading(false);
                  setIsSubmitting(false);
                }
              }}
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-600 text-neutral-100 rounded transition-colors"
            >
              {loading ? "생성 중..." : "저장 후 목록으로"}
            </button>
            <button
              type="button"
              onClick={() => navigate({ view: "chapters", slug })}
              disabled={loading}
              className="px-6 py-3 text-neutral-400 hover:text-white transition-colors"
            >
              취소
            </button>
          </div>
          <p className="text-xs text-neutral-600">
            &ldquo;저장 후 {nextText}&rdquo;를 누르면 저장하고 바로
            {novel?.novel_type === "series"
              ? " 다음 회차를"
              : " 다음 장을"}{" "}
            작성할 수 있습니다.
          </p>
        </div>
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
  const { navigate } = useNav();
  const [novel, setNovel] = useState<Novel | null>(null);
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
      const chapter = chapterData as Chapter;
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
          title: formData.title.trim() || null,
          content: formData.content,
        },
        token
      );
      navigate({ view: "chapters", slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "챕터 수정에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout
        title="챕터 편집"
        onBack={() => navigate({ view: "chapters", slug })}
        backLabel="← 목록"
      >
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={
        novel ? `${novel.title} - 챕터 ${chapterNumber} 편집` : "챕터 편집"
      }
      onBack={() => navigate({ view: "chapters", slug })}
      backLabel="← 챕터 목록"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-[100px_1fr] gap-4">
          <div>
            <label
              htmlFor="number"
              className="block text-sm text-neutral-500 mb-2"
            >
              회차
            </label>
            <input
              type="number"
              id="number"
              value={formData.number}
              disabled
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-500"
            />
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm text-neutral-500 mb-2"
            >
              제목
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="챕터 제목을 입력하세요 (선택사항)"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-2">내용 *</label>
          <MarkdownEditor
            value={formData.content}
            onChange={content => setFormData({ ...formData, content })}
            placeholder="챕터 내용을 입력하세요..."
            minHeight={400}
          />
        </div>

        <div className="flex gap-4 pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={loading || !formData.content}
            className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
          >
            {loading ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ view: "chapters", slug })}
            disabled={loading}
            className="px-6 py-3 text-neutral-400 hover:text-white transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

// Main Router Component
export default function NovelsAdminClient() {
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
        return <NewNovel />;
      case "edit":
        return navState.slug ? (
          <EditNovel slug={navState.slug} />
        ) : (
          <NovelsList />
        );
      case "chapters":
        return navState.slug ? (
          <ChaptersList slug={navState.slug} />
        ) : (
          <NovelsList />
        );
      case "chapter-new":
        return navState.slug ? (
          <NewChapter slug={navState.slug} />
        ) : (
          <NovelsList />
        );
      case "chapter-edit":
        return navState.slug && navState.chapterNumber ? (
          <EditChapter
            slug={navState.slug}
            chapterNumber={navState.chapterNumber}
          />
        ) : (
          <NovelsList />
        );
      case "list":
      default:
        return <NovelsList />;
    }
  };

  return (
    <NavContext.Provider value={{ navState, navigate, goBack }}>
      {renderView()}
    </NavContext.Provider>
  );
}
