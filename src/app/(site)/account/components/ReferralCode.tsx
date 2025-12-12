// components/profile/ReferralCode.tsx
"use client";

import React from "react";
import { Card, Button, InputField, Section } from "@/components/ui";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import type { ReferralCodeProps } from "@/types/account/types";

export default function ReferralCode({ refLink, onCopy }: ReferralCodeProps) {
  const hasLink = typeof refLink === "string" && refLink.length > 0;

  return (
    <Card title="회원가입 레퍼럴 링크">
      <Section
        layout="two-col"
        columnsTemplate="1fr auto"
        contentClassName="items-end gap-2 max-w-3xl"
        left={
          <InputField
            type="text"
            value={hasLink ? refLink : "-"}
            readOnly
            className="font-mono select-all"
          />
        }
        right={
          <Button
            type="button"
            variant="outline"
            className="h-10 min-h-10 px-3"
            onClick={onCopy}
            aria-label="레퍼럴 링크 복사"
            title="복사"
            disabled={!hasLink}
          >
            <ClipboardDocumentIcon className="h-5 w-5" aria-hidden />
          </Button>
        }
      />
    </Card>
  );
}
