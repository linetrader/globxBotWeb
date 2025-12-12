// src/app/admin/bots/work-queue/page.tsx
"use client";

import { useWorkQueueList } from "./hooks/useWorkQueueList";
import { WorkQueuePageView } from "./view/WorkQueuePageView";

export default function WorkQueueListPage() {
  const data = useWorkQueueList();

  return (
    <WorkQueuePageView
      loading={data.loading}
      error={data.error}
      rows={data.rows}
      page={data.page}
      pageSize={data.pageSize}
      total={data.total}
      setPage={data.setPage}
      statusFilter={data.statusFilter}
      setStatusFilter={data.setStatusFilter}
      refresh={data.refresh}
      usernameInput={data.usernameInput}
      setUsernameInput={data.setUsernameInput}
      applyUsernameFilter={data.applyUsernameFilter}
      keepDays={data.keepDays}
      setKeepDays={data.setKeepDays}
      cleanupLoading={data.cleanupLoading}
      runCleanup={data.runCleanup}
    />
  );
}
