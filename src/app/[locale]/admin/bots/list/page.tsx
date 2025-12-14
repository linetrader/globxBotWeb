// src/app/admin/bots/list/page.tsx
"use client";

import { useBotsList } from "./hooks/useBotsList";
import ListView from "./view/ListView";

export default function Page() {
  const data = useBotsList();
  return <ListView {...data} />;
}
