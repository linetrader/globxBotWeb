// src/app/(site)/my-config/page.tsx
"use client";

import { Section, Form, Card } from "@/components/ui";
import { MyConfigFormView } from "./components/MyConfigFormView";
import { HistoryTable } from "./components/HistoryTable";
import { useMyConfig } from "./hooks/useMyConfig";

export default function MyConfigPage() {
  const vm = useMyConfig();

  return (
    <Section className="mx-auto max-w-3xl p-4">
      <Form className="grid grid-cols-1 gap-4">
        <Card className="p-4">
          <MyConfigFormView vm={vm} />
        </Card>

        <Card className="p-4">
          <HistoryTable vm={vm} />
        </Card>
      </Form>
    </Section>
  );
}
