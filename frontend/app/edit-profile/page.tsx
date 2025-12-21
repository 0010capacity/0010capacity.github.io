"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Stack,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Group,
  Card,
  Badge,
  Alert,
  Checkbox,
  Box,
  Loader,
  Center,
  ActionIcon,
} from "@mantine/core";
import {
  IconSave,
  IconPlus,
  IconX,
  IconExternalLink,
} from "@tabler/icons-react";
import { createProfilePR } from "../../lib/github";
import { GitHubAnalyzer } from "../../lib/github";

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

  if (profileLoading) {
    return (
      <Center mih="100vh">
        <Stack align="center" gap="md">
          <Loader />
          <Text>Loading profile data...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1} mb="md">
          Edit Profile
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {/* GitHub Token */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                GitHub Personal Access Token *
              </Text>
              <TextInput
                type="password"
                value={token}
                onChange={e => setToken(e.currentTarget.value)}
                placeholder="ghp_..."
                disabled={isLoading}
              />
              <Group gap="xs">
                <Checkbox
                  checked={rememberToken}
                  onChange={e => setRememberToken(e.currentTarget.checked)}
                  label="Remember token (save in browser)"
                />
              </Group>
              <Text size="xs" c="dimmed">
                Please enter a token with repo permissions.
              </Text>
            </Stack>

            {/* Name */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Name *
              </Text>
              <TextInput
                value={profileData.name}
                onChange={e => handleInputChange("name", e.currentTarget.value)}
                disabled={isLoading}
              />
            </Stack>

            {/* Email */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Email *
              </Text>
              <TextInput
                type="email"
                value={profileData.email}
                onChange={e =>
                  handleInputChange("email", e.currentTarget.value)
                }
                disabled={isLoading}
              />
            </Stack>

            {/* Country */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Country *
              </Text>
              <TextInput
                value={profileData.country}
                onChange={e =>
                  handleInputChange("country", e.currentTarget.value)
                }
                disabled={isLoading}
              />
            </Stack>

            {/* Education */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Education *
              </Text>
              <TextInput
                value={profileData.education}
                onChange={e =>
                  handleInputChange("education", e.currentTarget.value)
                }
                disabled={isLoading}
              />
            </Stack>

            {/* Bio */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Bio *
              </Text>
              <Textarea
                value={profileData.bio}
                onChange={e => handleInputChange("bio", e.currentTarget.value)}
                placeholder="Enter your bio..."
                rows={4}
                disabled={isLoading}
              />
            </Stack>

            {/* Tech Stack */}
            <Card withBorder>
              <Card.Section withBorder inheritPadding py="md">
                <Group justify="space-between" align="center">
                  <Title order={3} size="h4">
                    Tech Stack
                  </Title>
                  <Button
                    size="xs"
                    onClick={detectTechStack}
                    disabled={isDetecting || !token || isLoading}
                    loading={isDetecting}
                    variant="light"
                  >
                    {isDetecting ? "Detecting..." : "Auto-detect from GitHub"}
                  </Button>
                </Group>
              </Card.Section>

              <Card.Section inheritPadding py="md">
                <Stack gap="md">
                  {/* Current Tech Stack */}
                  <Box>
                    {profileData.techStack.length > 0 ? (
                      <Group gap="xs">
                        {profileData.techStack.map(tech => (
                          <Badge
                            key={tech}
                            variant="light"
                            rightSection={
                              <ActionIcon
                                size="xs"
                                color="blue"
                                radius="xl"
                                variant="transparent"
                                onClick={() => removeTechStack(tech)}
                              >
                                <IconX size={10} />
                              </ActionIcon>
                            }
                          >
                            {tech}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text size="sm" c="dimmed">
                        No tech stack registered.
                      </Text>
                    )}
                  </Box>

                  {/* Manual Add */}
                  <Group gap="xs">
                    <TextInput
                      style={{ flex: 1 }}
                      value={newTech}
                      onChange={e => setNewTech(e.currentTarget.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTechStack(newTech);
                        }
                      }}
                      placeholder="Enter tech stack (e.g., React, Python, Node.js)"
                      disabled={isLoading}
                    />
                    <Button
                      size="sm"
                      onClick={() => addTechStack(newTech)}
                      disabled={!newTech.trim() || isLoading}
                      leftSection={<IconPlus size={14} />}
                    >
                      Add
                    </Button>
                  </Group>

                  {/* Auto-detection Results */}
                  {showTechStackEditor && detectedTechStack.length > 0 && (
                    <Card withBorder p="md" bg="var(--mantine-color-green-9)">
                      <Stack gap="md">
                        <Group justify="space-between" align="center">
                          <Title order={4} size="h5" c="green.2">
                            Technologies detected from GitHub
                          </Title>
                          <Group gap="xs">
                            <Button
                              size="xs"
                              onClick={addAllDetectedTech}
                              variant="light"
                              color="green"
                              leftSection={<IconPlus size={14} />}
                            >
                              Add All
                            </Button>
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="green"
                              onClick={() => setShowTechStackEditor(false)}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                        <Group gap="xs">
                          {detectedTechStack.map(tech => (
                            <Button
                              key={tech}
                              size="xs"
                              onClick={() => addDetectedTech(tech)}
                              disabled={profileData.techStack.includes(tech)}
                              variant="light"
                              color="green"
                            >
                              + {tech}
                            </Button>
                          ))}
                        </Group>
                      </Stack>
                    </Card>
                  )}

                  {!token && (
                    <Alert color="yellow" title="GitHub Token Required">
                      You need to enter a GitHub token to use the auto-detection
                      feature.
                    </Alert>
                  )}
                </Stack>
              </Card.Section>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert color="red" title="Error">
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {prUrl && (
              <Alert color="green" title="Success">
                <Group justify="space-between">
                  <Text>Profile updated successfully!</Text>
                  <Button
                    component="a"
                    href={prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="xs"
                    variant="light"
                    rightSection={<IconExternalLink size={14} />}
                  >
                    View PR
                  </Button>
                </Group>
              </Alert>
            )}

            {/* Submit Buttons */}
            <Group justify="flex-end" gap="md" pt="md">
              <Button
                type="button"
                variant="default"
                onClick={() => window.history.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                leftSection={<IconSave size={16} />}
              >
                Save
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
