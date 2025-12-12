// src/app/admin/process/list/page.tsx
"use client";

import { useProcessList } from "./hooks/useProcessList";
import ProcessPageView from "./view/ProcessPageView";

function Page() {
  const data = useProcessList();
  return <ProcessPageView {...data} />;
}

export default Page;
