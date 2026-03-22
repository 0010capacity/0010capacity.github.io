import Link from "next/link";
import { Button, ButtonProps } from "@mantine/core";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps extends ButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({
  href = "/",
  label = "돌아가기",
  ...props
}: BackButtonProps) {
  return (
    <Button
      component={Link}
      href={href}
      variant="subtle"
      size="sm"
      leftSection={<ArrowLeft size={16} />}
      mb="lg"
      style={{ alignSelf: "flex-start" }} // Ensures left alignment even in centered stacks
      {...props}
    >
      {label}
    </Button>
  );
}
