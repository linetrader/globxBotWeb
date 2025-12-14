"use client";

import { Form, Card } from "@/components/ui";
import { MyConfigFormView } from "./components/MyConfigFormView";
import { HistoryTable } from "./components/HistoryTable";
import { useMyConfig } from "./hooks/useMyConfig";

export default function MyConfigPage() {
  const vm = useMyConfig();

  return (
    // [수정] max-w-7xl -> max-w-5xl (약 1024px)로 변경
    // 너무 넓지도 않고, 좁지도 않은 적당한 크기입니다.
    <div className="w-full mx-auto max-w-5xl p-4">
      <Form className="grid grid-cols-1 gap-4">
        {/* 봇 상태 & 자격 증명 폼 */}
        <Card className="p-4">
          <MyConfigFormView vm={vm} />
        </Card>

        {/* API 저장 내역 테이블 */}
        <Card className="p-4">
          <HistoryTable vm={vm} />
        </Card>
      </Form>
    </div>
  );
}
