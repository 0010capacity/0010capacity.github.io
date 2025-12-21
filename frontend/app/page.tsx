"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Container,
  Flex,
  UnstyledButton,
  Text,
  Group,
  Box,
  Title,
  Badge,
  Stack,
} from "@mantine/core";
import { BookOpen, FileText, AppWindow } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

export default function HomePage() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      href: "/novels",
      label: "소설",
      sublabel: "읽으러 가기",
      icon: <BookOpen size={40} strokeWidth={1.5} />,
    },
    {
      href: "/blog",
      label: "블로그",
      sublabel: "보러 가기",
      icon: <FileText size={40} strokeWidth={1.5} />,
    },
    {
      href: "/apps",
      label: "앱",
      sublabel: "구경하기",
      icon: <AppWindow size={40} strokeWidth={1.5} />,
    },
  ];

  return (
    <Container
      fluid
      h="100dvh"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)",
      }}
    >
      {/* Header */}
      <Box
        py="lg"
        px="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-dark-4)",
          backdropFilter: "blur(8px)",
          background: "rgba(10, 10, 10, 0.5)",
        }}
      >
        <Container size="lg">
          <Group justify="space-between" align="center">
            <Box>
              <Title
                order={1}
                size="h2"
                fw={600}
                style={{
                  background:
                    "linear-gradient(135deg, #f5f5f5 0%, #a3a3a3 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                이정원
              </Title>
              <Text size="sm" c="dimmed" mt="xs">
                개발자 · 창작가 · 기술 애호가
              </Text>
            </Box>
            <Group gap="xs" hiddenFrom="sm">
              <Badge
                variant="light"
                color="accent"
                size="sm"
                style={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                }}
              >
                Developer
              </Badge>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Main Content */}
      <Box
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <Stack align="center" gap="xl" w="100%">
          {/* Intro Text */}
          <Box
            style={{
              textAlign: "center",
              maxWidth: "600px",
            }}
          >
            <Title
              order={2}
              size="h3"
              fw={400}
              c="dimmed"
              mb="md"
              style={{
                fontSize: "clamp(1.25rem, 5vw, 1.5rem)",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
            >
              소설, 블로그, 그리고 개인 프로젝트를
              <br />
              한곳에서 만나보세요
            </Title>
          </Box>

          {/* Menu Grid */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            gap={{ base: "md", sm: "xl" }}
            align="center"
            justify="center"
            wrap="wrap"
            w="100%"
            style={{
              maxWidth: "700px",
            }}
          >
            {navItems.map(item => (
              <UnstyledButton
                key={item.href}
                component={Link}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  position: "relative",
                  flex: "1 1 auto",
                  minWidth: "140px",
                }}
              >
                <Box
                  style={{
                    position: "relative",
                    padding: "1.5rem",
                    borderRadius: "var(--mantine-radius-lg)",
                    border: "1px solid",
                    borderColor:
                      hoveredItem === item.href
                        ? "var(--mantine-color-accent-5)"
                        : "var(--mantine-color-dark-4)",
                    background:
                      hoveredItem === item.href
                        ? "linear-gradient(135deg, rgba(58, 158, 236, 0.1) 0%, rgba(62, 39, 35, 0.1) 100%)"
                        : "transparent",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    minHeight: "160px",
                    backdropFilter:
                      hoveredItem === item.href ? "blur(8px)" : "none",
                  }}
                >
                  {/* Icon */}
                  <Box
                    style={{
                      transition: "all 0.3s ease-in-out",
                      color:
                        hoveredItem === item.href
                          ? "var(--mantine-color-accent-5)"
                          : "var(--mantine-color-gray-6)",
                      transform:
                        hoveredItem === item.href
                          ? "scale(1.2) translateY(-4px)"
                          : "scale(1) translateY(0)",
                    }}
                  >
                    {item.icon}
                  </Box>

                  {/* Title */}
                  <Title
                    order={2}
                    size="h4"
                    fw={600}
                    c={hoveredItem === item.href ? "white" : "dimmed"}
                    style={{
                      transition: "color 0.2s ease-in-out",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.label}
                  </Title>

                  {/* Subtitle */}
                  <Text
                    size="xs"
                    c={hoveredItem === item.href ? "accent.4" : "dark.6"}
                    style={{
                      transition: "color 0.2s ease-in-out",
                      fontStyle: "italic",
                      fontSize: "0.8rem",
                    }}
                  >
                    {item.sublabel}
                  </Text>
                </Box>
              </UnstyledButton>
            ))}
          </Flex>
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        py="md"
        px="md"
        style={{
          borderTop: "1px solid var(--mantine-color-dark-4)",
          backdropFilter: "blur(8px)",
          background: "rgba(10, 10, 10, 0.5)",
        }}
      >
        <Group justify="center" gap="xs">
          <Link
            href="/about"
            style={{
              textDecoration: "none",
              color: "var(--mantine-color-dark-6)",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "color 0.2s ease-in-out",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "var(--mantine-color-accent-5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "var(--mantine-color-dark-6)";
            }}
          >
            이정원에 대해
          </Link>
          <Text c="dark.6" size="sm">
            ·
          </Text>
          <Link
            href="/portfolio"
            style={{
              textDecoration: "none",
              color: "var(--mantine-color-dark-6)",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "color 0.2s ease-in-out",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "var(--mantine-color-accent-5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "var(--mantine-color-dark-6)";
            }}
          >
            포트폴리오
          </Link>
          <Text c="dark.6" size="sm">
            ·
          </Text>
          <Link
            href="/admin/login"
            style={{
              textDecoration: "none",
              color: "var(--mantine-color-dark-6)",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "color 0.2s ease-in-out",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "var(--mantine-color-accent-5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "var(--mantine-color-dark-6)";
            }}
          >
            관리
          </Link>
        </Group>
      </Box>
    </Container>
  );
}
