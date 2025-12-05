"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import TagInput from "@/components/TagInput";
import { appsApi } from "@/lib/api";

export default function NewAppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    platform: "ios",
    icon_url: "",
    store_url: "",
    website_url: "",
    github_url: "",
    tags: [] as string[],
    features: [""] as string[],
    screenshots: [""] as string[],
    version: "",
    release_date: "",
    privacy_policy_url: "",
    support_email: "",
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length ? newFeatures : [""] });
  };

  const handleScreenshotChange = (index: number, value: string) => {
    const newScreenshots = [...formData.screenshots];
    newScreenshots[index] = value;
    setFormData({ ...formData, screenshots: newScreenshots });
  };

  const addScreenshot = () => {
    setFormData({ ...formData, screenshots: [...formData.screenshots, ""] });
  };

  const removeScreenshot = (index: number) => {
    const newScreenshots = formData.screenshots.filter((_, i) => i !== index);
    setFormData({ ...formData, screenshots: newScreenshots.length ? newScreenshots : [""] });
  };

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

    // Clean up empty strings from arrays
    const cleanedData = {
      ...formData,
      features: formData.features.filter((f) => f.trim() !== ""),
      screenshots: formData.screenshots.filter((s) => s.trim() !== ""),
    };

    try {
      await appsApi.create(cleanedData, token);
      router.push("/admin/apps");
    } catch (err) {
      setError(err instanceof Error ? err.message : "앱 등록에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="새 앱 등록" backHref="/admin/apps" backLabel="← 앱 목록">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
            {error}
          </div>
        )}

        {/* Basic Info Section */}
        <div className="space-y-6">
          <h2 className="text-lg text-neutral-300 border-b border-neutral-800 pb-2">
            기본 정보
          </h2>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm text-neutral-500 mb-2">
              앱 이름 *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="앱 이름을 입력하세요"
              required
              disabled={loading}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm text-neutral-500 mb-2">
              슬러그 (URL)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-neutral-600 text-sm">/apps/</span>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                placeholder="app-slug"
                disabled={loading}
              />
            </div>
          </div>

          {/* Platform */}
          <div>
            <label htmlFor="platform" className="block text-sm text-neutral-500 mb-2">
              플랫폼 *
            </label>
            <select
              id="platform"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-neutral-600 transition-colors"
              disabled={loading}
            >
              <option value="ios">iOS</option>
              <option value="android">Android</option>
              <option value="web">Web</option>
              <option value="macos">macOS</option>
              <option value="windows">Windows</option>
              <option value="cross-platform">크로스 플랫폼</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm text-neutral-500 mb-2">
              설명
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
              placeholder="앱에 대한 간단한 설명을 입력하세요"
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-neutral-500 mb-2">태그</label>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
              placeholder="카테고리, 기능 등을 입력하세요"
            />
          </div>
        </div>

        {/* Links Section */}
        <div className="space-y-6">
          <h2 className="text-lg text-neutral-300 border-b border-neutral-800 pb-2">
            링크
          </h2>

          {/* Icon URL */}
          <div>
            <label htmlFor="icon_url" className="block text-sm text-neutral-500 mb-2">
              앱 아이콘 URL
            </label>
            <input
              type="url"
              id="icon_url"
              value={formData.icon_url}
              onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="https://example.com/icon.png"
              disabled={loading}
            />
            {/* Icon Preview */}
            {formData.icon_url && (
              <div className="mt-2">
                <div className="w-16 h-16 bg-neutral-800 rounded-xl overflow-hidden">
                  <img
                    src={formData.icon_url}
                    alt="Icon preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Store URL */}
          <div>
            <label htmlFor="store_url" className="block text-sm text-neutral-500 mb-2">
              스토어 URL
            </label>
            <input
              type="url"
              id="store_url"
              value={formData.store_url}
              onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="https://apps.apple.com/app/..."
              disabled={loading}
            />
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="website_url" className="block text-sm text-neutral-500 mb-2">
              웹사이트 URL
            </label>
            <input
              type="url"
              id="website_url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="https://example.com"
              disabled={loading}
            />
          </div>

          {/* GitHub URL */}
          <div>
            <label htmlFor="github_url" className="block text-sm text-neutral-500 mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              id="github_url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="https://github.com/username/repo"
              disabled={loading}
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-4">
          <h2 className="text-lg text-neutral-300 border-b border-neutral-800 pb-2">
            주요 기능
          </h2>

          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                placeholder={`기능 ${index + 1}`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-3 text-neutral-500 hover:text-red-400 transition-colors"
                disabled={loading}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addFeature}
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            disabled={loading}
          >
            + 기능 추가
          </button>
        </div>

        {/* Screenshots Section */}
        <div className="space-y-4">
          <h2 className="text-lg text-neutral-300 border-b border-neutral-800 pb-2">
            스크린샷
          </h2>

          {formData.screenshots.map((screenshot, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={screenshot}
                  onChange={(e) => handleScreenshotChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                  placeholder={`스크린샷 URL ${index + 1}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(index)}
                  className="p-3 text-neutral-500 hover:text-red-400 transition-colors"
                  disabled={loading}
                >
                  ×
                </button>
              </div>
              {/* Screenshot Preview */}
              {screenshot && (
                <div className="w-24 h-40 bg-neutral-800 rounded overflow-hidden ml-4">
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addScreenshot}
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            disabled={loading}
          >
            + 스크린샷 추가
          </button>
        </div>

        {/* Additional Info Section */}
        <div className="space-y-6">
          <h2 className="text-lg text-neutral-300 border-b border-neutral-800 pb-2">
            추가 정보
          </h2>

          {/* Version */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="version" className="block text-sm text-neutral-500 mb-2">
                버전
              </label>
              <input
                type="text"
                id="version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                placeholder="1.0.0"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="release_date" className="block text-sm text-neutral-500 mb-2">
                출시일
              </label>
              <input
                type="date"
                id="release_date"
                value={formData.release_date}
                onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-neutral-600 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          {/* Privacy Policy URL */}
          <div>
            <label htmlFor="privacy_policy_url" className="block text-sm text-neutral-500 mb-2">
              개인정보처리방침 URL
            </label>
            <input
              type="url"
              id="privacy_policy_url"
              value={formData.privacy_policy_url}
              onChange={(e) => setFormData({ ...formData, privacy_policy_url: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="https://example.com/privacy"
              disabled={loading}
            />
          </div>

          {/* Support Email */}
          <div>
            <label htmlFor="support_email" className="block text-sm text-neutral-500 mb-2">
              지원 이메일
            </label>
            <input
              type="email"
              id="support_email"
              value={formData.support_email}
              onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="support@example.com"
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={loading || !formData.name}
            className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
          >
            {loading ? "등록 중..." : "앱 등록"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
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
