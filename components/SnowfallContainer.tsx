"use client";

import { useSnowfall } from "./SnowfallProvider";
import Snowfall from "./Snowfall";

export default function SnowfallContainer() {
  const { isEnabled } = useSnowfall();

  if (!isEnabled) {
    return null;
  }

  return <Snowfall />;
}
