// src/i18n/request.ts

import { getRequestConfig } from "next-intl/server";
import { LOCALES } from "./routing"; // LOCALES는 src/i18n/routing.ts에서 가져옴

/** 지원 로케일 (routing.ts와 동기화) */
type AppLocale = (typeof LOCALES)[number];

/** 네임스페이스 정의 (필요한 모든 메시지 파일을 명시) */
const NAMESPACES = [
  "header",
  "authLogin",
  "authSignup",
  "about",
  // [참고] 이 목록은 프로젝트에서 실제로 사용되는 모든 네임스페이스를 포함해야 합니다.
  // 예: "common", "dashboard", "history/staking", 등
] as const;
type Namespace = (typeof NAMESPACES)[number];

/** 재귀 JSON 타입 */
type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[];

/** 안전 import 함수 */
async function importMessages(
  lang: AppLocale,
  ns: Namespace
): Promise<{ [key: string]: JSONValue }> {
  try {
    // 경로: 현재 파일 위치 (src/i18n/)에서 messages 폴더로 접근합니다.
    const mod = await import(`./messages/${lang}/${ns}.json`);
    return mod.default as { [key: string]: JSONValue };
  } catch (e) {
    console.error(`i18n load error: locale='${lang}', ns='${ns}'`, e);
    // 로드 실패 시 빈 객체를 반환하여 앱 충돌을 방지하고 빈 메시지 사용을 허용합니다.
    return {};
  }
}

/** 중첩 객체에 값 설정 (필요한 경우 구현 - 현재는 네임스페이스가 평탄하므로 단순화) */
function setMessages(
  target: { [key: string]: JSONValue },
  ns: Namespace,
  value: { [key: string]: JSONValue }
): void {
  // 만약 네임스페이스에 슬래시(예: history/center)가 있다면 setNested 로직을 사용해야 합니다.
  // 현재는 평탄한 네임스페이스만 가정하고 단순 주입합니다.
  target[ns] = value;
}

export default getRequestConfig(async ({ locale: requestLocale }) => {
  // 💡 [수정] let을 const로 변경하여 ESLint 오류 해결
  const locale = await requestLocale;

  const lang = (LOCALES as readonly string[]).includes(locale as string)
    ? (locale as AppLocale)
    : "ko";

  // 병렬 로드
  const loaded = await Promise.all(
    NAMESPACES.map((ns) => importMessages(lang, ns))
  );

  // 로드된 메시지를 messages 객체에 중첩 주입
  const messages: { [key: string]: JSONValue } = {};
  NAMESPACES.forEach((ns, i) => {
    // 평탄한 구조이므로, 단순히 네임스페이스 이름을 키로 사용합니다.
    setMessages(messages, ns, loaded[i]);
  });

  return { locale: lang, messages };
});
