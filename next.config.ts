// next.config.ts

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path"; // 💡 [추가] path 모듈 import

// [핵심 확인] 플러그인 경로가 src/i18n/request.ts를 정확히 가리키는지 확인
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // swcMinify: true, // 이미 설정되어 있다면 유지
  // reactStrictMode: true, // 이미 설정되어 있다면 유지

  // [Alias 설정 유지] Webpack이 @/ 경로를 인식하도록 돕습니다.
  webpack: (config, { isServer, defaultLoaders }) => {
    // 💡 [핵심 수정] JSON 파일이 Webpack에 의해 올바르게 처리되도록 규칙을 추가합니다.
    // 이는 동적 import가 실패할 때 메시지 파일 번들링을 강제하는 역할을 합니다.
    config.module.rules.push({
      test: /\.json$/,
      // [중요] src/i18n/messages 경로의 JSON 파일을 강제로 포함하도록 설정
      // path.join 또는 path.resolve를 사용하여 절대 경로를 지정해야 안정적입니다.
      include: path.join(__dirname, "src", "i18n", "messages"),
      type: "javascript/auto",
    });

    // Alias 설정이 있다면 여기에 포함됩니다. (현재는 주석 처리되어 있으므로 생략)
    /*
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    */

    return config;
  },
};

export default withNextIntl(nextConfig); // 💡 withNextIntl로 래핑되어야 합니다.
