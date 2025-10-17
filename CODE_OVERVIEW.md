# KNP 특허법률사무소 웹사이트 코드 개요

## 1. 프로젝트 전반
- 이 저장소는 WordPress 기반 다국어 사이트를 정적 형태로 내보낸 결과물이다.
- 루트 `index.html`은 방문자를 한국어 사이트(`/language/ko/`)로 즉시 리디렉션하며, 공통 JS(`static/js/redirect.js`)가 런타임 호스트에 맞춰 최종 URL을 정규화한다.
- `npm` 의존성은 개발용 도구에 한정된다. `express` 패키지는 실제 서비스가 아닌 로컬 확인용 서버 구성을 위해 포함돼 있다.

## 2. 빌드·검증 흐름
```bash
npm install   # 최초 한 번
npm test      # scripts/validate.js 실행
```
- 별도의 번들링 단계는 없다. 정적 파일을 웹 서버 또는 CDN에 업로드하면 된다.
- `scripts/validate.js`는 리디렉션 메타 태그·JS 포함 여부, Windows ADS(`:Zone.Identifier`) 아티팩트 존재 여부를 검사한다. 새로 갱신한 후에는 `npm test`를 실행해 루트 리디렉션과 파일명이 깨지지 않았는지 확인한다.

## 3. 최상위 파일·폴더
- `index.html`: 메타 리프레시, `window.KNPLAW_REDIRECT` 설정, `static/js/redirect.js` 로드 담당.
- `static/js/redirect.js`: 호스트 화이트리스트, 경로, `canonical`/`meta` 갱신 로직 등을 통합한 공통 리디렉터. 로컬 호스트 접근 시에는 리디렉션을 건너뛴다.
- `404_not_found/index.html`: Staatic가 생성한 404 페이지. WordPress 테마/플러그인 리소스가 인라인 또는 외부 스크립트로 포함돼 있다.
- `language/`: WordPress 다국어 루트.
  - `ko`, `en`, `jp`, `cn` 하위 폴더에 각 언어별 정적 페이지가 있다.
  - 한국어 폴더에는 추가적으로 `뉴스자료`, `업무소개`, `인재채용`, `전문가소개`, `회사소개` 등 한글 경로가 유지된다.
- `wp-content/`, `wp-includes/`, `wp-json/`: WordPress 테마(예: The7), 플러그인(Ultimate VC Addons, Elementor, KBoard 등), REST 응답 JSON이 그대로 보존돼 있다. 실제 수정은 WordPress 원본에서 수행하고 다시 정적 내보내기를 해야 한다.
- `robots.txt`, `wp-sitemap.xml`, `wp-sitemap-index.xsl` 등: 검색 엔진 설정 및 사이트맵.
- `package.json`, `package-lock.json`: npm 스크립트 및 의존성 정의.

## 4. 리디렉션 전략
1. 사용자가 루트(`/`)에 진입하면 `index.html`의 메타 태그가 `/language/ko/`로 이동시킨다.
2. 동일 페이지에서 `KNPLAW_REDIRECT` 설정을 주입한 뒤 `static/js/redirect.js`가 실행된다.
   - 허용 도메인(`allowHosts`) 이외 호스트로 접근 시 `productionOrigin` + `path` 조합으로 재이동한다.
   - `data-redirect-*` 속성이 붙은 메타/링크 요소는 JS가 실행된 뒤 정규화된 URL로 덮어쓴다.
3. 각 언어 페이지(`language/{locale}/index.html`)에서도 `canonical` 및 언어별 `hreflang` 링크가 유지돼 SEO 시나리오에 대응한다. 필요하면 `path` 값을 언어별 시작 페이지로 바꿔서 다른 기본 언어를 노출할 수 있다.

## 5. 다국어 자산 구조
- `language/ko/`: 한국어 기본 사이트. WordPress 메뉴·게시판(KBoard) 자료가 한글 슬러그로 배치돼 있다.
- `language/en/`: 영어 버전. 기본 텍스트는 영문, 일부 플러그인 문자열은 번역되지 않을 수 있다.
- `language/jp/`, `language/cn/`: 일본어·중국어 버전. 동일한 테마 구조를 공유하며 `wp-content` 자산을 그대로 사용한다.
- 언어별 폴더 내 `feed/`, `comments/`, `wp-sitemap-*.xml` 등 부가 자료도 함께 커밋돼 있어 외부 서비스(뉴스 수집, RSS 등)와의 연동을 끊지 않는다.

## 6. WordPress 테마·플러그인 자원
- `wp-content/themes/dt-the7/`: The7 테마 CSS/JS. 커스텀 스타일이나 동작을 수정하려면 원본 WordPress에서 테마 파일을 변경 후 재배포해야 한다.
- `wp-content/plugins/`: Elementor, Contact Form 7, Revolution Slider, KBoard 등 사이트에서 사용한 플러그인의 정적 자산.
- `wp-json/`: REST API 응답을 캐시한 JSON. 외부 시스템이 REST 엔드포인트를 직접 호출하는 대신 정적 JSON을 참조하도록 구성할 수 있다.

## 7. 운영·배포 체크리스트
- WordPress에서 콘텐츠를 변경하면 **Staatic(또는 유사 플러그인)** 으로 전체 사이트를 다시 내보내고 이 저장소에 덮어써야 한다.
- 새로 받은 정적 파일을 커밋하기 전에 `scripts/validate.js`를 돌려 루트 리디렉션 구성이 유지됐는지 확인한다.
- 정적 호스팅 환경에 배포할 때는 루트와 `language/` 디렉터리를 포함한 모든 파일을 업로드해야 다국어 링크, RSS, 사이트맵이 정상 작동한다.
- CDN 캐시를 사용하는 경우 `static/js/redirect.js` 변경 시 캐시 무효화가 필요하다.

## 8. 자주 변경되는 지점
- `static/js/redirect.js`: 리디렉션 허용 호스트, 기본 경로를 수정할 때.
- `language/ko/` 하위 한글 경로: 새 게시판·페이지가 추가될 경우 WordPress가 생성한 폴더명이 추가된다.
- `wp-sitemap*.xml`: WordPress에서 자동으로 갱신되므로 재배포 시 교체된다.

## 9. WordPress 의존성 제거 로드맵
WordPress를 더 이상 활용하지 않고 독립적인 정적 사이트로 운영하려면 다음 과정을 참고한다.

1. **현 상태 동결**
   - WordPress에서 더 이상 내보내기를 수행하지 않고, 현재 저장소를 기준선으로 삼는다.
   - `language/`, `wp-content/uploads/`, `wp-json/` 등 폴더별 용도와 사용 여부를 조사해 실제 필요한 자산 목록을 정리한다.
   - 잔존 WordPress 종속성을 빠짐없이 제거하기 위해 루트에서 다음 탐지 스크립트를 실행한다.

     ```bash
     OPTS='-RIn --binary-files=without-match --exclude-dir={.git,node_modules,dist,build,.next,.astro,public}'

     # HTML 내 WP 흔적
     grep $OPTS -i -E 'wp-content|wp-includes|wp-json|/xmlrpc\.php|wp-emoji|wp-embed|wp-block|wp-polyfill' .

     # 스크립트/스타일 경로
     grep $OPTS -i -E 'jquery(\.min)?\.js|emoji-release|min\.js|contact-?form-7|elementor|yoast' .

     # 메타/링크
     grep $OPTS -i -E '<link[^>]+shortlink|<link[^>]+EditURI|<meta[^>]+generator="WordPress' .

     # 도메인 하드코딩 검사
     grep $OPTS -i -E "https?://[^\"' ]*knp-law\.co\.kr/wp-" .
     ```

     발견되면 해당 자산(예: `wp-emoji-release.min.js`, `wp-json` 호출, `wp-content/uploads/...` 경로)을 단계적으로 대체하거나 제거하고, 정적 데이터·새 자산 경로로 치환한다.
2. **새 정적 스택 선정**
   - 유지보수가 쉬운 정적 사이트 빌드 도구(예: Next.js SSG, Astro, Eleventy 등) 또는 프레임워크 없는 템플릿 구조를 선택한다.
   - 다국어·레이아웃 분리에 강한 Astro 또는 Next.js(SSG 전용 모드)를 1순위 후보로 검토하고, 페이지 콘텐츠는 MD/MDX, 목록·메타데이터는 YAML/JSON 등으로 분리한다.
   - 현행 URL(`language/ko/*`)을 유지하거나 `/ko/*` 형태로 단순화할지 결정하고, 변경 시엔 리디렉션 전략을 함께 수립한다.
3. **콘텐츠 마이그레이션**
   - WordPress가 생성한 HTML을 적절한 템플릿/마크다운/데이터 파일로 변환하고, 헤더·푸터·CTA 등 반복 요소는 부분 템플릿으로 분리한다.
   - 다국어 지원이 필요하면 언어별 콘텐츠 파일 또는 i18n 키 체계를 도입한다.
   - WordPress 단축코드(shortcode), Elementor 위젯 등은 컴포넌트로 대체하고, 본문 내 절대 경로(`wp-content/uploads/...`)는 일괄 변환 스크립트로 `/assets/...` 등 새 규칙에 맞춘다.
4. **자산 파이프라인 정리**
   - 이미지·폰트 등 정적 자산을 `/public`(또는 CDN 버킷)으로 옮기고 명명 규칙을 재정비한다.
   - WordPress 플러그인에 종속된 CSS·JS를 대체할 맞춤 코드나 경량 라이브러리를 검토한다.
   - 빌드 단계에서 이미지 포맷(WebP/AVIF) 변환과 `srcset` 자동화를 적용하고, 웹폰트는 서브셋+preload로 최적화한다.
   - CSS/JS는 tree-shaking·critical CSS 추출 등으로 경량화해 플러그인 의존성을 최소화한다.
   - 빌드 산출물에는 해시 기반 파일명을 적용해 캐시 무효화가 자동 관리되도록 하고, 정적 자산은 `Cache-Control: public, max-age=31536000, immutable` 전략을 전제로 설계한다. 반대로 HTML은 `no-cache` 또는 `max-age=0, must-revalidate`로 설정해 새 빌드를 즉시 반영한다.
5. **문의 폼 등 동적 기능 재구현**
   - Contact Form 7 등 플러그인에 의존하던 폼을 직접 구현하고, 처리 백엔드(서버리스 함수, 경량 Express API, 외부 폼 서비스)를 연결한다.
   - 서버리스(Cloudflare Workers, Netlify/Vercel Functions) 또는 외부 폼 서비스(Formspree, Basin 등)를 비교 검토하고, 메일 전송은 SMTP 직접 호출 대신 트랜잭션 메일 서비스(SES, SendGrid, Postmark 등)를 사용한다. SPF는 물론 DKIM·DMARC 정렬을 확인한다.
   - 스팸 방지(Cloudflare Turnstile, 허니팟, rate limit)를 반영하고, 검색 기능이 필요하면 빌드 시 정적 인덱스를 생성해 Lunr/Fuse.js 등 클라이언트 검색과 연동한다.
6. **기존 SEO/리디렉션 유지**
   - 현행 URL(`language/ko/...` 등)을 그대로 유지하거나 필요한 경우 정적 호스팅의 리디렉션 규칙으로 대응한다.
   - `canonical`, `hreflang`, 사이트맵, `robots.txt`, OpenGraph 메타 등을 새 빌드 파이프라인에서 자동 생성하도록 설정한다.
   - Cloudflare Redirect Rules 또는 호스팅별 리디렉션 매커니즘을 활용해 `/wp-content/uploads/*` → `/assets/*`, 기존 `language/...` → 신규 경로 등의 301 맵을 정의하고, 도메인 정규화(슬래시, www 여부) 정책을 일관되게 적용한다.
   - Cloudflare Bulk Redirects 등을 사용할 경우 `redirects.csv`와 같은 매핑 파일을 저장소에 두고, 운영팀이 동일한 소스에서 관리하도록 한다.
   - `hreflang`에는 `x-default` 항목을 포함하고, 오픈그래프/트위터 카드 이미지는 절대 URL로 유지해 공유 시 썸네일이 깨지지 않도록 한다.
7. **빌드·배포 자동화**
   - `npm run build`, `npm run lint`, `npm run deploy` 등 스크립트를 정의하고 CI(예: GitHub Actions)로 자동 테스트·배포 흐름을 구성한다.
   - GitHub Actions 등에서 링크 검사(lychee/htmltest), i18n 누락 검사, 접근성 점검(pa11y 또는 Lighthouse CI)을 추가해 품질을 상시 검증한다.
   - 핵심 검사(Lighthouse CI 등)에 최소 점수 기준을 설정하고, 링크·i18n·접근성 검사에서 실패가 발생하면 배포를 중단하는 품질 게이트를 구성한다.
   - 호스팅 플랫폼(Vercel, Netlify, Cloudflare Pages, S3+CloudFront 등)을 결정하고 PR 프리뷰·본배포 흐름을 자동화한다.
   - Cloudflare 또는 웹 서버 레벨에서 CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy 등 보안 헤더를 일관되게 적용하고, 스테이징 도메인은 `robots.txt`로 크롤링을 차단한다.
8. **WordPress 서비스 종료**
   - 새 정적 사이트가 동작하는 것을 확인한 뒤 WordPress 인스턴스를 종료하거나 격리한다.
   - 본 서비스 전 Staging 도메인에서 폼 전송·SEO 태그·성능을 검증하고, 컷오버 전 DNS TTL을 300s 수준으로 축소한다.
   - 배포 후 초기 48시간은 Cloudflare Analytics, 에러 로그, 404 캡처 등을 집중 모니터링하고, 문제 발생 시 즉시 롤백할 경로를 확보한다.
   - WordPress 종료 전 DB 덤프, `wp-content/uploads`, 테마·플러그인 버전을 백업하고, 새 운영 절차를 `CODE_OVERVIEW.md`와 온보딩 문서에 반영한다.

## 9-A. 의존성 제거 완료 기준
- `wp-` 접두 경로나 WordPress 전용 스크립트·메타 태그가 정적 산출물에서 탐지되지 않는다.
- 모든 자산 경로가 `/assets/...` 등 새 규칙으로 일원화되고, 과거 경로는 301 리디렉션으로 처리된다.
- 문의 폼과 검색 등 동적 기능이 새 백엔드/서버리스 환경에서 정상 동작하며 스팸 방지·발신 인증(DMARC 포함)이 설정돼 있다.
- `language/ko/*` 등 기존 URL이 301 리디렉션을 통해 새 페이지로 연결되고, 크롤러 404가 발생하지 않는다.
- `canonical`·`hreflang`·`sitemap.xml`·`robots.txt`가 자동 생성돼 검색 콘솔에 제출됐다.
- 링크 검사·i18n 누락·접근성 검사가 CI에서 통과하고, 배포 파이프라인이 자동화됐다.
- CDN/Cloudflare 등에서 HTTPS, 캐시, 리디렉션 정책이 일관되게 적용된다.

## 9-B. 단계적 일정 예시
- **1주차**: 잔존 WordPress 흔적 스캔, 콘텐츠·URL·자산·폼 변환 설계.
- **2~3주차**: 정적 스택 구축, 템플릿화, 자산 이동, 폼 대체 구현.
- **4주차**: SEO/리디렉션 구성, 품질 CI 도입, 스테이징 공개 후 피드백 수렴.
- **5주차**: 본 서비스 컷오버 및 모니터링, WordPress 백업 후 서비스 종료.

## 10. 추가 참고
- 정적 파일 특성상 Node/Express 서버가 별도로 포함되어 있지 않으므로, 로컬 확인은 `npx serve` 같은 정적 서버를 활용하면 편리하다.
- 운영 중 404 처리를 커스터마이징하려면 호스팅 계정에서 `404_not_found/index.html`을 지정하거나, CDN 규칙을 이 파일로 매핑한다.
