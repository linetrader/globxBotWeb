// src/app/(site)/account/components/AccountInfoForm.tsx
"use client";

import React from "react";
import { Card, InfoGrid } from "@/components/ui";
import { AccountInfoProps } from "@/types/account/types";

export default function AccountInfoForm({
  username,
  email,
  name,
  countryLabel,
}: AccountInfoProps) {
  return (
    <Card title="계정 정보">
      <Card>
        <InfoGrid
          items={[
            {
              label: "아이디",
              value: (
                <span className="font-mono break-all">{username || "-"}</span>
              ),
            },
            {
              label: "이메일",
              value: (
                <span className="font-mono break-all">{email || "-"}</span>
              ),
            },
            { label: "이름", value: name || "-" },
            { label: "국가", value: countryLabel || "-" },
          ]}
        />
      </Card>
    </Card>
  );
}
