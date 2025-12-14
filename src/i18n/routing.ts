// src/i18n/routing.ts (수정: LOCALES만 export, getMessageConfig 로직 제거)

import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
// getRequestConfig import 및 모든 메시지 로드 로직 제거

/** 지원 로케일 */
// [핵심 수정] LOCALES를 export 하여 request.ts에서 안전하게 참조
export const LOCALES = ["ko", "en", "ja", "zh", "vi"] as const;

export const routing = defineRouting({
  locales: LOCALES as unknown as string[],
  defaultLocale: "ko",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

// 미들웨어/플러그인 호환성을 위해 routing 객체를 default export (유지)
export default routing;

// getMessageConfig 및 관련 모든 로직 (importMessages, setNested 등) 제거
// 이 코드는 routing.ts에 남기지 않습니다. (순환 참조 회피)
// (이 로직들은 request.ts로 이동합니다.)
