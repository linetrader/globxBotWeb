// src/app/admin/bots/strategy/page.tsx
"use client";

import { useStrategy } from "./hooks/useStrategy";
import StrategyView from "./view/StrategyView";

export default function Page() {
  const data = useStrategy();
  return <StrategyView {...data} />;
}
