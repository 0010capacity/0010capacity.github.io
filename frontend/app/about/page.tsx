import Link from "next/link";
import {
  Container,
  Title,
  Text,
  Group,
  Anchor,
  Badge,
  Button,
  Stack,
  Box,
} from "@mantine/core";

export default function AboutPage() {
  return (
    <Container
      size="xs"
      h="100vh"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 명함 카드 */}
      <Box w="100%">
        {/* 이름 */}
        <Box mb="xl" style={{ textAlign: "center" }}>
          <Title
            order={1}
            size="h2"
            fw={500}
            mb={4}
            style={{ letterSpacing: "-0.025em" }}
          >
            이정원
          </Title>
          <Text size="sm" c="dimmed">
            LEE JEONG WON
          </Text>
        </Box>

        {/* 정보 */}
        <Stack gap="md" mb="xl">
          {[
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
          ].map((item, index) => (
            <Group
              key={index}
              justify="space-between"
              py="xs"
              style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
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
                  c="dimmed"
                  underline="hover"
                  style={{
                    color: "var(--mantine-color-text)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "white")}
                  onMouseLeave={e =>
                    (e.currentTarget.style.color = "var(--mantine-color-text)")
                  }
                >
                  {item.value}
                </Anchor>
              ) : (
                <Text
                  size="sm"
                  c="dimmed"
                  ta="right"
                  style={{ color: "var(--mantine-color-text)" }}
                >
                  {item.value}
                </Text>
              )}
            </Group>
          ))}
        </Stack>

        {/* 한 줄 소개 */}
        <Box mb="xl" style={{ textAlign: "center" }}>
          <Text size="sm" c="dimmed" fs="italic">
            &ldquo;뭐든 만듭니다.&rdquo;
          </Text>
        </Box>

        {/* 기술 스택 */}
        <Box mb="xl">
          <Text
            size="xs"
            c="dimmed"
            tt="uppercase"
            ta="center"
            mb="md"
            fw={700}
            style={{ letterSpacing: "2px" }}
          >
            Skills
          </Text>
          <Group justify="center" gap="xs">
            {[
              "TypeScript",
              "C#",
              "ASP.NET",
              "JavaScript",
              "Java",
              "Kotlin",
              "Swift",
              "iOS",
              "Android",
              "Web",
            ].map(skill => (
              <Badge
                key={skill}
                variant="outline"
                color="gray"
                size="sm"
                radius="xl"
                style={{
                  fontWeight: 400,
                  color: "var(--mantine-color-dimmed)",
                  borderColor: "var(--mantine-color-dark-4)",
                }}
              >
                {skill}
              </Badge>
            ))}
          </Group>
        </Box>
      </Box>

      {/* 돌아가기 */}
      <Box mt="lg">
        <Button
          component={Link}
          href="/"
          variant="subtle"
          color="gray"
          size="sm"
          leftSection="←"
        >
          돌아가기
        </Button>
      </Box>
    </Container>
  );
}
