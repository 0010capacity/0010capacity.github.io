"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, ExternalLink } from "lucide-react";
import { createPrivacyPolicyPR } from "../../lib/github";
import { Button } from "../../components";

function SubmitPRForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [appName, setAppName] = useState("");
  const [language, setLanguage] = useState("ko");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prUrl, setPrUrl] = useState("");
  const [error, setError] = useState("");

  // Load URL parameters
  useEffect(() => {
    const appParam = searchParams.get("app");
    const langParam = searchParams.get("lang");

    if (appParam) {
      setAppName(decodeURIComponent(appParam));
    }
    if (langParam) {
      setLanguage(langParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPrUrl("");

    try {
      const url = await createPrivacyPolicyPR(
        token,
        appName,
        language,
        content
      );
      setPrUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Submit Privacy Policy PR</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium mb-1">
            GitHub Personal Access Token
          </label>
          <input
            type="password"
            id="token"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full p-2 border rounded"
            required
            placeholder="ghp_..."
          />
          <p className="text-sm text-gray-600 mt-1">
            Please enter a token with repo permissions.
          </p>
        </div>

        <div>
          <label htmlFor="appName" className="block text-sm font-medium mb-1">
            App Name
          </label>
          <input
            type="text"
            id="appName"
            value={appName}
            onChange={e => setAppName(e.target.value)}
            className="w-full p-2 border rounded"
            required
            placeholder="MyApp"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-1">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="ko">Korean (ko)</option>
            <option value="en">English (en)</option>
            <option value="ja">Japanese (ja)</option>
            <option value="zh">Chinese (zh)</option>
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Privacy Policy Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-2 border rounded h-64"
            required
            placeholder="Enter the privacy policy content..."
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={() => window.history.back()}
            variant="secondary"
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            icon={Send}
          >
            {isLoading ? "Creating PR..." : ""}
          </Button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {prUrl && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          PR created successfully!{" "}
          <Button
            as="a"
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="sm"
            icon={ExternalLink}
          ></Button>
        </div>
      )}
    </div>
  );
}

export default function SubmitPRPage() {
  return (
    <Suspense
      fallback={<div className="max-w-2xl mx-auto p-6">Loading...</div>}
    >
      <SubmitPRForm />
    </Suspense>
  );
}
