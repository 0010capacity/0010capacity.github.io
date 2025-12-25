"use client";

import {
  Container,
  Title,
  Text,
  Group,
  Anchor,
  Stack,
  Box,
} from "@mantine/core";
import { BackButton } from "../../components";

export default function AboutPage() {
  const items = [
    {
      label: "이메일",
      value: "0010capacity@gmail.com",
      href: "mailto:0010capacity@gmail.com",
    },
    {
      label: "GitHub",
      value: "@0010capacity",
      href: "https://github.com/0010capacity",
      external: true,
    },
    { label: "학교", value: "광운대학교 인공지능학과" },
    { label: "위치", value: "대한민국" },
  ];

  const skills = [
    "TypeScript",
    "JavaScript",
    "C#",
    "Java",
    "Kotlin",
    "Swift",
    "ASP.NET",
    "iOS",
    "Android",
    "Web",
  ];

  return (
    <Container size="sm" py="xl" mih="100vh">
      <Stack gap="xl">
        <BackButton href="/" />

        {/* 이름 */}
        <Box style={{ textAlign: "center" }}>
          <Title order={1} size="h2" fw={400} mb="xs">
            이정원
          </Title>
          <Text size="sm" c="dimmed">
            LEE JEONG WON
          </Text>
        </Box>

        {/* 정보 */}
        <Stack
          gap="md"
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "xl",
          }}
        >
          {items.map((item, index) => (
            <Group
              key={index}
              justify="space-between"
              py="xs"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <Text size="sm" c="dimmed">
                {item.label}
              </Text>
              {item.href ? (
                <Anchor
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  size="sm"
                  underline="hover"
                >
                  {item.value}
                </Anchor>
              ) : (
                <Text size="sm">{item.value}</Text>
              )}
            </Group>
          ))}
        </Stack>

        {/* 기술 스택 */}
        <Box
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "xl",
          }}
        >
          <Text
            size="xs"
            c="dimmed"
            tt="uppercase"
            mb="md"
            fw={500}
            style={{ letterSpacing: "0.1em" }}
          >
            Skills
          </Text>
          <Group gap="sm">
            {skills.map(skill => (
              <Text key={skill} size="sm" c="dimmed">
                {skill}
              </Text>
            ))}
          </Group>
        </Box>
      </Stack>
    </Container>
  );
}
