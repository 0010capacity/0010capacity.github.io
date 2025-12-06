"use client";

import { useState, useEffect } from "react";
import { Save, ExternalLink, X, Plus } from "lucide-react";
import { createProfilePR } from "../../lib/github";
import { GitHubAnalyzer } from "../../lib/github";
import {
  Button,
  Card,
  ErrorMessage,
  Badge,
  Form,
  FormField,
  FormActions,
  Input,
  Textarea,
} from "../../components";

interface ProfileData {
  name: string;
  email: string;
  country: string;
  education: string;
  bio: string;
  techStack: string[];
}

export default function EditProfilePage() {
  const [token, setToken] = useState("");
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    country: "",
    education: "",
    bio: "",
    techStack: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [prUrl, setPrUrl] = useState("");
  const [error, setError] = useState("");
  const [newTech, setNewTech] = useState("");
  const [showTechStackEditor, setShowTechStackEditor] = useState(false);
  const [detectedTechStack, setDetectedTechStack] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [rememberToken, setRememberToken] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Load profile data from public/data/profile.json
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/data/profile.json");
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data.");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Load saved token on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("github_token");
    if (savedToken) {
      setToken(savedToken);
      setRememberToken(true);
    }
  }, []);

  // Save or remove token based on remember preference
  useEffect(() => {
    if (rememberToken && token) {
      localStorage.setItem("github_token", token);
    } else if (!rememberToken) {
      localStorage.removeItem("github_token");
    }
  }, [token, rememberToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPrUrl("");

    try {
      const url = await createProfilePR(token, profileData);
      setPrUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTechStack = (tech: string) => {
    if (tech.trim() && !profileData.techStack.includes(tech.trim())) {
      setProfileData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech.trim()],
      }));
    }
    setNewTech("");
  };

  const removeTechStack = (tech: string) => {
    setProfileData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech),
    }));
  };

  const detectTechStack = async () => {
    if (!token) {
      alert("Please enter your GitHub token.");
      return;
    }

    setIsDetecting(true);
    try {
      const analyzer = new GitHubAnalyzer("0010capacity", token);
      const techStack = await analyzer.analyzeTechStack();
      const formattedTechStack = analyzer.getFormattedTechStack(techStack);
      setDetectedTechStack(formattedTechStack);
      setShowTechStackEditor(true);
    } catch (error) {
      alert(
        "Failed to detect tech stack: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const addDetectedTech = (tech: string) => {
    if (!profileData.techStack.includes(tech)) {
      setProfileData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech],
      }));
    }
  };

  const addAllDetectedTech = () => {
    const newTechs = detectedTechStack.filter(
      tech => !profileData.techStack.includes(tech)
    );
    setProfileData(prev => ({
      ...prev,
      techStack: [...prev.techStack, ...newTechs],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      {profileLoading ? (
        <div className="text-center py-8">
          <p className="text-lg">Loading profile data...</p>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <FormField label="GitHub Personal Access Token" required>
            <Input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="ghp_..."
            />
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="rememberToken"
                checked={rememberToken}
                onChange={e => setRememberToken(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="rememberToken" className="text-sm text-gray-600">
                Remember token (save in browser)
              </label>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Please enter a token with repo permissions.
            </p>
          </FormField>

          <FormField label="Name" required>
            <Input
              type="text"
              value={profileData.name}
              onChange={e => handleInputChange("name", e.target.value)}
            />
          </FormField>

          <FormField label="Email" required>
            <Input
              type="email"
              value={profileData.email}
              onChange={e => handleInputChange("email", e.target.value)}
            />
          </FormField>

          <FormField label="Country" required>
            <Input
              type="text"
              value={profileData.country}
              onChange={e => handleInputChange("country", e.target.value)}
            />
          </FormField>

          <FormField label="Education" required>
            <Input
              type="text"
              value={profileData.education}
              onChange={e => handleInputChange("education", e.target.value)}
            />
          </FormField>

          <FormField label="Bio" required>
            <Textarea
              value={profileData.bio}
              onChange={e => handleInputChange("bio", e.target.value)}
              placeholder="Enter your bio..."
              className="h-24"
            />
          </FormField>

          {/* 테크 스택 섹션 */}
          <Card
            title="Tech Stack"
            actions={
              <Button
                type="button"
                onClick={detectTechStack}
                disabled={isDetecting || !token}
                variant="success"
                size="sm"
              >
                {isDetecting ? "Detecting..." : "Auto-detect from GitHub"}
              </Button>
            }
          >
            {/* Current Tech Stack */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {profileData.techStack.map(tech => (
                  <Badge
                    key={tech}
                    variant="info"
                    className="flex items-center gap-2"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechStack(tech)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 ml-1"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
              {profileData.techStack.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tech stack registered.
                </p>
              )}
            </div>

            {/* Manual Add */}
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                value={newTech}
                onChange={e => setNewTech(e.target.value)}
                onKeyPress={e =>
                  e.key === "Enter" &&
                  (e.preventDefault(), addTechStack(newTech))
                }
                placeholder="Enter tech stack (e.g., React, Python, Node.js)"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => addTechStack(newTech)}
                disabled={!newTech.trim()}
                variant="secondary"
                size="sm"
                icon={Plus}
              ></Button>
            </div>

            {/* Auto-detection Results */}
            {showTechStackEditor && detectedTechStack.length > 0 && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Technologies detected from GitHub
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={addAllDetectedTech}
                      variant="success"
                      size="sm"
                      icon={Plus}
                    ></Button>
                    <Button
                      type="button"
                      onClick={() => setShowTechStackEditor(false)}
                      variant="secondary"
                      size="sm"
                      icon={X}
                    ></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detectedTechStack.map(tech => (
                    <Button
                      key={tech}
                      type="button"
                      onClick={() => addDetectedTech(tech)}
                      disabled={profileData.techStack.includes(tech)}
                      variant="outline"
                      size="sm"
                      className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-700 disabled:opacity-50"
                    >
                      + {tech}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {!token && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                You need to enter a GitHub token to use the auto-detection
                feature.
              </p>
            )}
          </Card>

          <FormActions>
            <div className="flex gap-4 w-full">
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
                className="flex-1"
                icon={Save}
              >
                {isLoading ? "Saving..." : ""}
              </Button>
            </div>
          </FormActions>
        </Form>
      )}

      {error && <ErrorMessage message={error} className="mt-4" />}

      {prUrl && (
        <Card className="mt-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="text-green-800 dark:text-green-200">
            Profile updated successfully!{" "}
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
        </Card>
      )}
    </div>
  );
}
