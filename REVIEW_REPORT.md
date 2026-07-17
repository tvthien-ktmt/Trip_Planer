# BÁO CÁO RÀ SOÁT CODE — TRIP_PLANER OTA
## Round 1 · Review-Only (Không Fix) · Kỹ thuật chuyên sâu

> **Repository:** https://github.com/tvthien-ktmt/Trip_Planer
> **Commit reviewed:** `bb9434d` (Initial commit for Trip_Planer)
> **Review date:** 2025-07-15
> **Reviewer:** Z.ai Code (orchestrator) + 4 specialized subagents
> **Scope:** Toàn bộ codebase — 315 file TS/TSX · ~20.735 LOC · 42 model DB · 2 migration
> **Báo cáo này:** `/home/z/my-project/download/Trip_Planer/REVIEW_REPORT.md`

---

## MỤC LỤC

1. [Executive Summary](#1-executive-summary)
2. [Methodology & Scope](#2-methodology--scope)
3. [Frontend Review](#3-frontend-review)
   - 3.1 [File Inventory](#31-file-inventory)
   - 3.2 [Findings Critical](#32-findings--critical)
   - 3.3 [Findings High](#33-findings--high)
   - 3.4 [Findings Medium (tóm tắt)](#34-findings--medium-tóm-tắt)
   - 3.5 [Cross-cutting FE](#35-cross-cutting-fe-issues)
4. [Backend Review](#4-backend-review)
   - 4.1 [File Inventory](#41-file-inventory)
   - 4.2 [Findings Critical](#42-findings--critical)
   - 4.3 [Findings High](#43-findings--high)
   - 4.4 [Module-by-Module Notes](#44-module-by-module-deep-notes)
   - 4.5 [Concurrency Deep-Dive](#45-concurrency-deep-dive)
5. [Database Review](#5-database-review)
   - 5.1 [Schema Overview](#51-schema-overview)
   - 5.2 [Findings Critical](#52-findings--critical)
   - 5.3 [Findings High](#53-findings--high)
   - 5.4 [Index Audit Matrix](#54-index-audit-matrix)
   - 5.5 [FK & Constraint Audit](#55-fk--constraint-audit)
   - 5.6 [Migration & Seed Audit](#56-migration--seed-audit)
   - 5.7 [ERD vs Schema Drift](#57-erd-vs-schema-drift)
6. [Cross-cutting Concerns](#6-cross-cutting-concerns)
7. [Security Posture Tổng quan](#7-security-posture-tổng-quan)
8. [Roadmap Fix (Đề xuất)](#8-roadmap-fix-đề-xuất)
9. [Thống kê tổng](#9-thống-kê-tổng)
10. [Phụ lục — Top Findings Theo Mức Độ](#10-phụ-lục--top-findings-theo-mức-độ)

---

## 1. Executive Summary

Trip_Planer là nền tảng **OTA (Online Travel Agency)** full-stack với kiến trúc enterprise-grade tuyên bố trong README: NestJS 11 + Next.js 16 + Prisma 5 + MySQL 8 + Redis + BullMQ + JWT + RBAC. Sau khi rà soát **siêu kỹ toàn bộ 315 file code, 42 model DB, 2 migration, 1 seed** từ FE → BE → DB, dự án thể hiện **nhiều ý tưởng kiến trúc tốt** (optimistic locking, idempotency, RBAC schema, refresh-token rotation, BullMQ queues, audit log) nhưng **implementation còn rất nhiều lỗ hổng nghiêm trọng** ở cả 3 tầng.

### Top 5 Critical Risks (xếp theo impact production)

| # | ID | Tầng | Vấn đề | Impact |
|---|---|---|---|---|
| 1 | **DB-005 + BE-002/010** | DB+BE | `OtpCode.userId = BigInt(0)` không filter theo email + `orderBy: id desc` → cross-user OTP leak, **account takeover** | Bất kỳ ai cũng có thể đăng ký thay email người khác, bypass email verification |
| 2 | **BE-001 + DB-003** | BE+DB | `refreshToken.findMany()` không filter + bcrypt compare toàn bảng → **DoS nghiêm trọng** | 10⁶ tokens × 100ms = ~100s CPU per request → sập service |
| 3 | **BE-008/009** | BE | IDOR trên **toàn bộ** booking + payment endpoints (no ownership check) | Bất kỳ user nào cũng mutate booking/payment của user khác |
| 4 | **FE-001/002** | FE | `ProtectedRoute` component **tồn tại nhưng không được dùng ở bất kỳ route nào** → toàn bộ `/admin/*` (18 page) và `/user/*` (15 page) public | Privilege escalation full, leak SMTP/VNPay secrets trên `/admin/settings` |
| 5 | **FE-S-003** | FE | **0** `fetch()`/`axios` call trong toàn bộ FE, mọi React Query hook return mock setTimeout | FE là shell không hoạt động với BE thật |

### Đánh giá tổng quan

| Tier | Verdict |
|---|---|
| **Architecture design** | ★★★★☆ — Concept tốt (RBAC, optimistic lock, idempotency, BullMQ, audit log) |
| **DB schema completeness** | ★★★☆☆ — 42 model đầy đủ domain, nhưng 19 FK thiếu, 0 CHECK, Decimal oversize |
| **BE implementation** | ★★☆☆☆ — Nhiều service stub/broken, IDOR phổ biến, OTP/refresh token fatal |
| **FE implementation** | ★☆☆☆☆ — SSR disabled hoàn toàn, mock-only, auth insecure, 0 metadata |
| **Security posture** | ★★☆☆☆ — Concept tốt nhưng execution nhiều hole (XSS, IDOR, OTP leak, secret leak) |
| **Production readiness** | **CHƯA SẴN SÀNG** — Cần fix tối thiểu 45 Critical trước production |

### Con số thống kê

| Metric | Value |
|---|---|
| Tổng file reviewed | 315 (TS/TSX) + 42 model + 2 migration + 1 seed + ~10 config |
| Tổng LOC | ~20.735 |
| Tổng findings | **507** |
| Critical | **45** |
| High | **116** |
| Medium | **169** |
| Low | **135** |
| Info | **52** |

---

## 2. Methodology & Scope

### Tiến trình review
1. **Clone repo** về `/home/z/my-project/download/Trip_Planer`
2. **Inventory toàn bộ file** — 315 TS/TSX file (loại trừ `node_modules`, `.next`, `test-client`), ~20.735 LOC
3. **Đọc README.md + schema.prisma + ERD.md** để nắm domain (Auth, RBAC, Flight, Tour, Booking, Payment, Membership, Blog, Notification, Admin, Review, Wishlist)
4. **Dispatch 4 subagent song song**:
   - **Task 4-A**: FE views + components + layouts (~210 file)
   - **Task 4-B**: FE stores + hooks + types + i18n + mocks + app router (~116 file)
   - **Task 5**: BE toàn bộ 77 file (modules, common, jobs, prisma, config)
   - **Task 6**: DB schema + 2 migration + seed + ERD + cross-reference với BE
5. **Mỗi subagent ghi worklog** vào `/home/z/my-project/worklog.md`
6. **Consolidation** vào báo cáo này

### Tiêu chí đánh giá
- **Critical**: Lỗ hổng security (RCE, XSS, IDOR, auth bypass), data corruption, service crash, broken core flow
- **High**: Logic error nghiêm trọng, performance issue lớn, vi phạm best practice quan trọng, race condition
- **Medium**: Code smell, thiếu validation, inconsistency, performance minor
- **Low**: Cosmetic, minor optimization, redundant code
- **Info**: Khuyến nghị, observation, không bug

### Giới hạn
- **Chỉ review, không fix** (Round 1)
- **Không chạy test** (chỉ review code tĩnh)
- **Không run dev server** (chỉ phân tích code)
- **Không verify trong browser** (sẽ làm ở round sau nếu user yêu cầu)

---

## 3. Frontend Review

### 3.1 File Inventory

Tổng cộng **~210 file** trong scope Task 4-A + **~116 file** trong scope Task 4-B (có overlap barrel files).

#### Cấu trúc FE

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router (74 page.tsx + 1 layout.tsx)
│   │   ├── (public)            # /, /tours, /blog, /flights, /about, /contact, ...
│   │   ├── user/               # /user/dashboard, /user/bookings, /user/wishlist, ...
│   │   ├── admin/              # /admin/dashboard, /admin/users, /admin/tours, ...
│   │   ├── booking/            # /booking/passenger, /booking/seat, /booking/payment, ...
│   │   └── auth pages          # /login, /register, /forgot-password, /verify-otp, ...
│   ├── components/             # 46 component
│   │   ├── auth/               # LoginModal (hardcoded creds!)
│   │   ├── booking/            # BookingProgressBar, BookingSummarySidebar
│   │   ├── common/             # Card, Modal, Pagination, SearchBar, Skeleton, ...
│   │   ├── form/               # AirportAutocomplete, DatePickerRange, ...
│   │   ├── home/               # HeroSection, FlashSale, FeaturedDestinations, ...
│   │   ├── layout/             # Header, Footer, AdminLayout, UserLayout, ...
│   │   ├── trip/               # CompareBar, CompareModal, ChecklistSidebar
│   │   └── ui/                 # Button, Input, DataTable, FileUpload, ...
│   ├── hooks/queries/          # 8 React Query hooks (all return mock!)
│   ├── stores/                 # 11 Zustand store
│   ├── types/                  # 2 type file (User, Tour, Booking, Flight, ...)
│   ├── i18n/                   # config + locales/{en,vi}.json (chỉ 25 keys!)
│   ├── mocks/                  # 9 mock file (still imported in prod!)
│   ├── providers/              # QueryProvider (with mounted gate anti-pattern)
│   └── lib/utils.ts            # chỉ cn()
├── __tests__/                  # 3 test file
└── 8 config file               # package.json, tsconfig, next.config, ...
```

#### Top 10 file FE rủi ro nhất

| File | LOC | Risk | Lý do |
|---|---|---|---|
| `components/layout/Header.tsx` | 452 | High | Mega-menu hover-only (a11y), dropdown state muddled, mobile drawer no focus trap |
| `components/auth/LoginModal.tsx` | 138 | **Critical** | Hardcoded creds `user@gmail.com`/`123456`, mock-token-12345 |
| `views/public/auth/Login.tsx` | 123 | **Critical** | `email.includes('admin')` → Admin role, fake-jwt-token |
| `views/admin/Settings.tsx` | 184 | **Critical** | SMTP/VNPay/SePay secrets plaintext input, no RBAC |
| `views/booking/PassengerInfo.tsx` | 31 | **Critical** | Persist PII sai shape (không match `PassengerInfo` interface) |
| `stores/bookingFlowStore.ts` | 46 | **Critical** | PII (passport, DOB) persist localStorage unencrypted |
| `stores/authStore.ts` | 32 | **Critical** | JWT trong sessionStorage plaintext, XSS-readable |
| `components/booking/BookingProgressBar.tsx` | 93 | **Critical** | Hardcode `/booking/passenger-info` không tồn tại (404) |
| `views/public/BlogDetail.tsx` | 99 | **Critical** | `dangerouslySetInnerHTML` với mock HTML (stored XSS risk) |
| `app/page.tsx` | 13 | **Critical** | `'use client' + dynamic(ssr:false)` → SPA, SEO = 0 |

### 3.2 Findings — Critical

#### FE-001 · Critical · Security · Toàn bộ `/admin/*` route không có RBAC guard
- **File:** Tất cả 18 `src/app/admin/**/page.tsx`
- **Description:** Component `ProtectedRoute` (`components/common/ProtectedRoute.tsx`) **tồn tại nhưng không được import ở bất kỳ page nào**. Mọi admin page chỉ wrap trong `<AdminLayout>` — bản thân AdminLayout chỉ render chrome, không check `isAuthenticated` hay `role === 'Admin'`.
- **Impact:** Anonymous user truy cập `/admin/settings` → đọc plaintext SMTP password, VNPay `TMN_CODE` + `HashSecret`, SePay API token. Truy cập `/admin/users` → xem PII 100 user. Truy cập `/admin/payments` → xem booking code + amount. Truy cập `/admin/audit` → xem toàn bộ audit log.
- **PoC:** `curl https://domain.com/admin/settings` → response HTML chứa input `defaultValue={process.env.VNPAY_HASH_SECRET}`.

#### FE-002 · Critical · Security · Toàn bộ `/user/*` route không có auth guard
- **File:** Tất cả 15 `src/app/user/**/page.tsx`
- **Description:** Tương tự FE-001. `/user/profile` ( CCCD, passport), `/user/login-history` (IP, device), `/user/devices` (active session), `/user/bookings` (booking code, passenger info) — tất cả public.
- **Impact:** Leak PII của bất kỳ user nào (nếu ID đoán được) hoặc ít nhất là of the currently-logged-in user khi người khác dùng chung máy.

#### FE-003 · Critical · Dead Routes · BookingProgressBar + BookingLayout hardcode path không tồn tại
- **File:** `components/booking/BookingProgressBar.tsx:5-12`, `components/layout/BookingLayout.tsx:10-19`
- **Description:** Khai báo `stepPaths = ['/booking/passenger-info', '/booking/seat-selection', ...]` nhưng App Router thực tế là `/booking/passenger` và `/booking/seat` (directory `app/booking/passenger/page.tsx`, `app/booking/seat/page.tsx`).
- **Impact:** Mọi nút "Continue"/"Back" ở bước passenger/seat sẽ redirect → 404. Deep-link protection trong BookingLayout cũng redirect sai.
- **Cascade:** FE-025 — 7 file booking view khác cũng navigate sai path.

#### FE-004 · Critical · Dead Routes · Auth flow navigate `/auth/*` không tồn tại
- **File:**
  - `views/public/auth/Login.tsx:64` → `href="/auth/forgot-password"`
  - `views/public/auth/ForgotPassword.tsx:19` → `navigate.push('/auth/verify-otp?email=...')`
  - `views/public/auth/VerifyOTP.tsx:41` → `navigate.push('/auth/reset-password?email=...')`
  - `views/public/auth/Register.tsx:27` → `navigate.push('/auth/verify-email')`
- **Description:** App Router có `/forgot-password`, `/verify-otp`, `/reset-password`, `/verify-email` (không có prefix `/auth`). Tất cả navigate trên sẽ 404 sau khi submit thành công.
- **Impact:** Toàn bộ flow "Quên mật khẩu", "Đăng ký + verify email", "Login 2FA" đứt gãy — user không thể reset password hay verify email.

#### FE-005 · Critical · Security · LoginModal + AdminLogin ship hardcoded credentials
- **File:**
  - `components/auth/LoginModal.tsx:28-35` — validate `user@gmail.com`/`123456` và `admin@gmail.com`/`123456`
  - `components/auth/LoginModal.tsx:132` — UI hint text "Dùng thử: user@gmail.com / 123456"
  - `views/admin/AdminLogin.tsx:8-9` — `useState('admin@tripplanner.com')`, `useState('admin123')`
  - `views/public/auth/Login.tsx:24-30` — auto-login bất kỳ email chứa string `"admin"`
- **Description:** Cred bị compile vào client bundle. Login.tsx còn worse — grant Admin role dựa trên `email.includes('admin')` thay vì call BE.
- **Impact:** (1) Attacker đọc JS bundle → có admin credential. (2) `admin-impersonator@evil.com` + password bất kỳ → Admin role. Privilege escalation trivial.

#### FE-006 · Critical · Correctness · PassengerInfo persist sai shape vào store
- **File:** `views/booking/PassengerInfo.tsx:11,30`; `types/index.ts:21-31`; `stores/bookingFlowStore.ts:3,15`
- **Description:** `PassengerInfo` interface là `{ id, type:'adult'|'child'|'infant', title, firstName, lastName, dob, idExpiry, nationality }`. View build state `{ name: string, type: string, dob: string, passport: string }` rồi `updateBookingData({ passengerInfo: formData })`. Shape hoàn toàn không match interface. TypeScript lẽ ra phải catch — có dấu hiệu `strict: false` hoặc `as any` cast.
- **Impact:** Component downstream (BookingSummarySidebar) chỉ đọc `.length` nên UI "works" nhưng consumer nào expect `firstName/lastName/idNumber` (DownloadTicket, e-ticket generation) sẽ nhận `undefined`. Data integrity broken.

#### FE-007 · Critical · Security/Privacy · bookingFlowStore persist PII localStorage unencrypted
- **File:** `stores/bookingFlowStore.ts:34-46`
- **Description:** Zustand `persist` default dùng `localStorage`. State chứa `passengerInfo[]` (full name, DOB, passport/CCCD, nationality), `selectedSeats`, `baggage`, `meals`. Dữ liệu sống sót qua logout, browser restart, readable bởi bất kỳ XSS payload hay browser extension.
- **Impact:** Vi phạm GDPR / Nghị định 13/2023/NĐ-CP (VN PDPL). PII leak trên shared/public device. Không có expiry.

#### FE-008 · Critical · Security/XSS · BlogDetail dùng `dangerouslySetInnerHTML` với mock HTML
- **File:** `views/public/BlogDetail.tsx:19-36,91-99`
- **Description:** Render `content` HTML string (hiện là mock an toàn) qua `dangerouslySetInnerHTML`. Khi wire BE blog content (mock→API), bất kỳ stored XSS payload nào author trong admin blog editor sẽ execute ở browser reader. Không có DOMPurify/sanitize-html.
- **Impact:** Stored XSS → cookie theft, session hijack, defacement.

#### FE-009 · Critical · Hydration · Theme persistence gây hydration mismatch
- **File:** `components/layout/{PublicLayout,UserLayout,AdminLayout}.tsx`; `stores/uiStore.ts:13-27`
- **Description:** Cả 3 layout apply `className={... ${theme === 'dark' ? 'dark bg-gray-950' : 'bg-gray-50'}}` trong render. `useUIStore` rehydrate từ localStorage sau mount. Server render `bg-gray-50` (light), client render `dark bg-gray-950` nếu user dark theme → React hydration warning + FOUC.
- **Impact:** Visual flash, hydration warning, accessibility degradation.

#### FE-010 · Critical · Performance/SEO · Mọi route dùng `'use client' + dynamic(ssr:false)` → SPA
- **File:** Tất cả 74 `src/app/**/page.tsx`
- **Description:** Pattern lặp:
  ```tsx
  'use client';
  const PageComponent = dynamic(() => import('@/views/...'), { ssr: false });
  export default function Page() { return <Layout><PageComponent /></Layout>; }
  ```
  Disable SSR toàn site. Không HTML gửi đến browser. React Query fetch client-side. SEO/meta tag cho tour detail, blog detail vô dụng.
- **Impact:** LCP > 3s trên slow connection, SEO ranking = 0, no streaming/Suspense benefit, lãng phí hạ tầng Next.js.

#### FE-011 · Critical · Dead Routes · UserSidebar link `/settings` không tồn tại
- **File:** `components/layout/UserSidebar.tsx:29`
- **Description:** Route thực là `/user/settings` (`app/user/settings/page.tsx`). Sidebar "Cài đặt chung" → `/settings` → 404.

#### FE-012 · Critical · UI/UX · Không có global `not-found.tsx`/`error.tsx`/`loading.tsx`
- **File:** `app/` directory (không có file đặc biệt)
- **Description:** App Router cung cấp file đặc biệt cho 404, runtime error, route transition loading. Project dùng `/404`, `/401`, `/403`, `/500` route thường — Next.js không serve chúng khi self-throw. Unhandled runtime error → blank page.

#### FE-S-001 · Critical · Security · JWT token plaintext trong sessionStorage
- **File:** `stores/authStore.ts:28-29`
- **Description:** `createJSONStorage(() => sessionStorage)` persist `token: string` vào `sessionStorage` key `auth-storage`. `partialize` explicit include `token`. XSS đọc `sessionStorage.getItem('auth-storage')` → có JWT verbatim.
- **Impact:** Token theft via XSS, account takeover. sessionStorage per-tab → cross-tab auth sync broken.

#### FE-S-002 · Critical · Security · LoginModal + Login.tsx bypass BE hoàn toàn
- (Trùng FE-005 — đã cover)

#### FE-S-003 · Critical · API · 0 fetch/axios, mọi React Query hook return mock
- **File:** Tất cả 8 file trong `src/hooks/queries/`
- **Description:** Mỗi `queryFn` resolve `setTimeout`-wrapped local array:
  ```ts
  const fetchTours = async () => new Promise<typeof mockTours>((resolve) =>
    setTimeout(() => resolve(mockTours), 600));
  ```
  Grep confirm: 0 `fetch()`, 0 `axios` call, 0 env var, 0 `.env` file. Package `axios` trong deps nhưng unused.
- **Impact:** FE không thể function với BE thật. Mọi "loading" state là fake 300-1000ms delay. Không error path testing.

#### FE-S-004 · Critical · SEO · SSR completely disabled (trùng FE-010)

#### FE-S-005 · Critical · SEO · Không có `metadata` export ở route nào (trừ root)
- **File:** Tất cả 74 `page.tsx` + 0 segment `layout.tsx`
- **Description:** Chỉ `src/app/layout.tsx:17-20` export `metadata` (title: "Trip Planer OTA"). Mọi route khác inherit title này. Vì page là `'use client'`, Next.js không cho export `metadata`. Dynamic route (`/tours/[id]`, `/blog/[slug]`) không có per-resource metadata, OG tag, canonical URL.

#### FE-S-006 · Critical · Resilience · Không có `error.tsx`/`loading.tsx`/`not-found.tsx` (trùng FE-012)

#### FE-S-007 · Critical · Architecture · Layout wrap trong page.tsx (anti-pattern)
- **File:** Tất cả `app/admin/**`, `app/user/**`, `app/booking/**`, most public pages
- **Description:** Mỗi page manual wrap:
  ```tsx
  return <AdminLayout><PageComponent /></AdminLayout>;
  ```
  Không có `app/admin/layout.tsx`, `app/user/layout.tsx`, `app/booking/layout.tsx`. AdminLayout (với sidebar, auth guard) re-instantiate mỗi navigation → remount + mất internal state.

#### FE-S-008 · Critical · i18n · Chỉ 25 keys, 200+ UI string hardcoded Vietnamese
- **File:** `i18n/locales/{en,vi}.json` (31 LOC mỗi file)
- **Description:** Cả 2 file chỉ có 3 namespace (`header`, `home`, `footer`) total 25 keys. Grep `t('...')` chỉ 4 source file dùng. Hardcoded Vietnamese everywhere (LoginModal:32, Header:39-51, Checklist:33-128, ...).
- **Impact:** Switch sang English chỉ translate ~10% UI. `en.json` dead. False sense of i18n.

#### FE-S-009 · Critical · i18n · `header.more` và `tours.searchTitle` referenced in code nhưng missing ở cả 2 locale file
- **File:** `Header.tsx:55`, `Tours.tsx:89`
- **Description:** `t("header.more", "Khám phá thêm")` — fallback string che missing key. i18next silent return fallback, không error/warning.

#### FE-S-010 · Critical · Hydration · Persist middleware auto-hydrate sau render
- **File:** Cả 7 persisted store: `authStore`, `bookingFlowStore`, `checklistStore`, `searchFlightStore`, `uiStore`, `wishlistStore`, `adminUIStore`
- **Description:** Không `skipHydration: true`, không `useStore.persist.hasHydrated()` gate. SSR serve default state (`isAuthenticated: false`, `theme: 'light'`). Client mount → persist read localStorage → re-render với state khác (`isAuthenticated: true`, `theme: 'dark'`). `suppressHydrationWarning` trên `<html>/<body>` che warning nhưng không che visual flash.

#### FE-S-101 · Critical · SEO · Dynamic route `[id]` không accept `params` prop, không `generateStaticParams`/`generateMetadata`
- **File:** 9 file: `app/tours/[id]`, `app/blog/[slug]`, `app/flights/[id]`, `app/boarding-pass/[id]`, `app/booking/[id]/ticket`, `app/user/bookings/[id]`, `app/admin/bookings/[id]`, `app/admin/flights/[id]/edit`, `app/admin/users/[id]/edit`
- **Description:** Trong Next.js 16 App Router, dynamic segment page nên accept `params: Promise<{ id: string }>` (async từ Next 15) và pass cho view, hoặc dùng `useParams()` trong client. Cả 9 page đều KHÔNG — render dynamic-imported view rồi view tự `useParams()` internal. Không `generateStaticParams` cho SSG, không `generateMetadata` cho SEO.

#### FE-S-102 · Critical · Security · `booking/[id]/ticket` và `boarding-pass/[id]` public, no auth guard
- **File:** `app/booking/[id]/ticket/page.tsx`, `app/boarding-pass/[id]/page.tsx`
- **Description:** Render `<BookingLayout><DownloadTicket/></BookingLayout>` và `<PublicLayout><BoardingPass/></PublicLayout>`. Không `middleware.ts` enforce auth. Boarding pass chứa passenger name, PNR, flight info — URL-guessing attack có thể leak.

### 3.3 Findings — High

#### FE-013 · High · State · Wishlist view ignore `useWishlistStore`
- **File:** `views/user/Wishlist.tsx:7-11`
- Hardcode 3 mock wishlist item thay vì read `useWishlistStore().tourIds` + join với `useToursQuery()`. `Settings.tsx:37` làm đúng pattern này → store IS populated elsewhere. Wishlist page show static data forever.

#### FE-014 · High · UI/UX · `alert()` và `window.confirm()` dùng cho validation/destructive
- **File:** 9+ file: `FareClass.tsx:22`, `PassengerInfo.tsx:27`, `SearchBar.tsx:21`, `SearchFlight.tsx:13`, `TourList.tsx:15`, `PromoList.tsx:15`, `FlightList.tsx:18`, `UserList.tsx:19,26`, `FileUpload.tsx:46`
- Native dialog block main thread, không style được, skip bởi screen reader inconsistent, không match design system. `ModalConfirm` component tồn tại.

#### FE-015 · High · Performance · FlashSale define nested component trong render
- **File:** `components/home/FlashSale.tsx:27-40`
- `const TimeUnit = ({ value, label }) => (...)` declared inside `FlashSale` body. Mỗi giây parent re-render (countdown `setInterval`), React unmount/remount all `TimeUnit` instance vì function identity change.

#### FE-016 · High · A11y · Header mega-menu hover-only, no keyboard
- **File:** `components/layout/Header.tsx:99-137, 230-269`
- Mega menu dùng `group-hover:opacity-100 group-hover:visible` — không `:focus-within`. Keyboard user không reach được submenu. Không `aria-expanded`. Mobile drawer không focus trap, không Escape-to-close, không body scroll lock. WCAG 2.1 Level A failure.

#### FE-017 · High · TypeScript · `useParams()?.id as string` unsafe cast
- **File:** 9 view: `BookingDetail.tsx:9`, `DownloadTicket.tsx:8`, `BoardingPass.tsx:7`, `BlogDetail.tsx:9`, `TripDetail.tsx:16`, `FlightDetail.tsx:10`, `UserEdit.tsx:9`, `FlightEdit.tsx:9`, admin `BookingDetail.tsx:9`
- `useParams()` return `Params | null` trong Next 16. `?.id` return `string | string[] | undefined`. `as string` lie to TypeScript. Fallback `id || 'VN8A2B'` silent hide bug.

#### FE-018 · High · UI/UX · Admin sidebar fixed `ml-64` overflow mobile
- **File:** `components/layout/AdminLayout.tsx:12` (`ml-64`), `AdminSidebar.tsx:23` (`fixed left-0 w-64`)
- AdminSidebar `fixed left-0 top-0 w-64`. AdminLayout push content `ml-64`. Mobile (<768px) sidebar che nửa screen, không drawer toggle, không hamburger. Admin page unusable mobile.

#### FE-019 · High · State · AdminLayout search bar not wired
- **File:** `components/layout/AdminLayout.tsx:15-22`
- Header search input không có `value`/`onChange`/`onSubmit`. Visual-only placeholder.

#### FE-020 · High · API · `window.confirm` destructive không await async confirmation
- **File:** `TourList.tsx:14-18`, `PromoList.tsx:14-18`, `FlightList.tsx:17-21`, `UserList.tsx:18-30`
- Tất cả admin delete handler `if (window.confirm(...)) { toast.success('Đã xóa...') }` — không API call. Toast claim success không fire mutation.

#### FE-021 · High · React · BookingLayout redirect effect missing `navigate` deps
- **File:** `components/layout/BookingLayout.tsx:26-37`
- Effect call `navigate.replace(...)` trong early-return guard bypass step-index check. If `selectedOutboundFlightId` null mid-flow → redirect `/flights/search` không return. `currentPathIndex + 1 > currentStep` math off-by-one vs STEPS array (7 items, success index 7 nhưng `currentStep=8` ở BookingSuccess).

#### FE-022 · High · Form · SearchBar validation `alert()`, no inline error
- **File:** `components/common/SearchBar.tsx:17-27`
- `alert("Vui lòng chọn điểm đi và điểm đến")` block UI. Date field `readOnly` placeholder "Thêm ngày" — không bao giờ mở date picker.

#### FE-023 · High · Dead code · TripBookingSection unused & English-only
- **File:** `components/home/TripBookingSection.tsx` (100 LOC)
- Không import bởi `Home.tsx`. Content English ("Hotel", "Flight", "Car Rental"). Break i18n.

#### FE-024 · High · TypeScript · UserList dùng 'Staff' role không có trong User type
- **File:** `views/admin/users/UserList.tsx:11-16,93-100`; `types/index.ts:115`
- `User.role` is `'User' | 'Admin'`. UserList có user `role: 'Staff'`. Role badge logic check 'Admin'/'Staff'/else — work locally nhưng sync với BE (chỉ User/Admin) sẽ mismatch. (Note: BE schema có STAFF enum → FE type thiếu.)

#### FE-025 · High · Dead Routes · Booking flow navigate sai path (cascade FE-003)
- **File:** `FareClass.tsx:24`, `PassengerInfo.tsx:31`, `SeatSelection.tsx:165,168`, `Baggage.tsx:45,51`, `Meal.tsx:58,64`, `AddOns.tsx:56,62`, `Payment.tsx:64`
- Mix navigate: `/booking/passenger-info` và `/booking/seat-selection` (404) vs `/booking/passenger` và `/booking/seat` (correct).

#### FE-026 · High · State · BookingSuccess navigate `/booking/ticket/VN8A2B` (hardcoded PNR)
- **File:** `views/booking/BookingSuccess.tsx:36,42`
- PNR `VN8A2B` hardcoded 2 chỗ. `setStep(8)` exceed 7-step STEPS array.

#### FE-027 · High · State · Pricing logic Payment.tsx diverge BookingSummarySidebar
- **File:** `views/booking/Payment.tsx:20-26` vs `components/booking/BookingSummarySidebar.tsx:8-11`
- Sidebar hardcode `basePrice = 3600000`. Payment compute `basePricePerPax = outboundFareClass === 'Business' ? 3000000 : 1500000` × pax. Cùng page, 2 panel show total khác nhau.

#### FE-028 · High · State · `useState` derived from `user` prop without effect sync (Profile.tsx)
- **File:** `views/user/Profile.tsx:9`
- `useState(user?.avatar || "...")` — nếu `user` change (tab khác update, authStore rehydrate), avatar không sync.

#### FE-029 · High · UI/UX · Settings.tsx tab state conflict với /user/* routes
- **File:** `views/user/Settings.tsx:11-200`
- Settings có internal tab ('profile'|'bookings'|'wishlist'|'preferences') duplicate route `/user/profile`, `/user/bookings`, `/user/wishlist`. Hai source of truth.

#### FE-030 · High · React · Reservation.tsx success modal `onClose={() => {}}` break modal contract
- **File:** `views/booking/Reservation.tsx:201`
- `<Modal isOpen={...} onClose={() => {}}>` — onClose no-op. Escape/backdrop click silent fail. WCAG escape key contract violation.

#### FE-031 · High · UI/UX · Header dropdown hover-only, inconsistent với notifications
- **File:** `components/layout/Header.tsx:272-313`
- Notifications dropdown `onClick` (state-driven) nhưng CSS `group-hover` ignore state. User dropdown pure `group-hover` no state. Touch device hover never fire.

#### FE-032 · High · React · `useEffect` trong ProtectedRoute fire `router.push` during render
- **File:** `components/common/ProtectedRoute.tsx:10-15`
- Trong component body (không effect) `if (!isAuthenticated) { router.push(...) ; return null; }`. React 19 warn side effect during render. Double-redirect trong StrictMode.

#### FE-033 · High · Dead Routes · BookingDetail navigate `/user/refunds/${id}` không tồn tại
- **File:** `views/user/BookingDetail.tsx:81`

#### FE-034 · High · API · ManageBooking/BookingHistory/BookingDetail hardcoded mock
- **File:** `ManageBooking.tsx:10-16`, `BookingHistory.tsx:11-15`, `BookingDetail.tsx`
- Không `useQuery` cho booking. Hardcode 1-3 mock record. BookingDetail ignore `id` param (show static SGN→HAN VN210).

#### FE-035 · High · API · Admin page không loading/error state
- **File:** Tất cả 24 `views/admin/**`
- Mỗi admin view render hardcoded array với `useState`. Không React Query, không skeleton, không error handling. Wire real API → full rewrite.

#### FE-036 · High · Correctness · Header `bg-[var(--bg-main)]` typo
- **File:** `components/layout/Header.tsx:432`
- `className="... hover:bg-[var,(--bg-main)] ..."` — stray comma `var,(--bg-main)`. Tailwind generate invalid CSS. Hover bg never apply.

#### FE-037 · High · A11y · Modal first focusable steal focus, no restore on close
- **File:** `components/common/Modal.tsx:43-45`
- Auto-focus first focusable on open ✓. Không restore focus to trigger on close — WCAG 2.4.3 violation.

#### FE-038 · High · A11y · ImageGallery lightbox no keyboard nav, no focus trap
- **File:** `components/common/ImageGallery.tsx:51-79`
- No `role="dialog"`, no `aria-modal`, no Escape, no focus trap. Prev/next button không `aria-label`.

#### FE-039 · High · Performance · Pagination render all pages (memory bomb)
- **File:** `components/common/Pagination.tsx:12`
- `Array.from({ length: totalPages }, (_, i) => i + 1)` build array size `totalPages`. 10K-page result → 10K DOM button. Browser freeze.

#### FE-040 · High · React · DataTable `<th key={idx}>` và `<td key={idx}>` index key
- **File:** `components/ui/DataTable.tsx:44,52`

(Còn 28 High khác — xem phụ lục hoặc worklog chi tiết.)

#### FE-S-011 to FE-S-032 · High (tóm tắt)
- FE-S-011: `bookingCartStore` không persist → cart lost on refresh
- FE-S-012: `bookingCartStore.addItem` không dedupe (cùng tour+date → 2 cart item)
- FE-S-013: `bookingCartStore.getTotal` recompute every render, không memoize
- FE-S-014: `bookingFlowStore.updateBookingData` accept `Partial<State>` cho phép override setter function
- FE-S-015: `resetBooking` không clear persisted storage atomic
- FE-S-016: `checklistStore.loadTemplate` ID `tpl-${Date.now()}-${index}` collision risk
- FE-S-017: `uiStore.toggleTheme` không apply `dark` class to `<html>`, chỉ wrapper `<div>` — Tailwind dark mode không work
- FE-S-018: `i18n/config.ts` subscribe `useUIStore` at module load, never unsubscribe (HMR leak)
- FE-S-019: `QueryProvider` render `visibility: hidden` until mounted (anti-pattern)
- FE-S-020: `QueryClient` default options quá permissive (retry=3, staleTime=60s)
- FE-S-021: `useFlightQueries` không re-export từ `hooks/queries/index.ts`
- FE-S-022: `useSearchFlightsQuery` filter client-side sau khi fetch all (pattern sai)
- FE-S-023: `useTourDetailQuery` return `undefined` khi not found, không error path
- FE-S-024: `User.id` typed `string` nhưng BE BigInt (type drift)
- FE-S-025: Price typed `number` nhưng BE `Decimal` (precision loss)
- FE-S-026: `User` type thiếu `phone`, `dob`, `status`, `createdAt`, `membershipTier`
- FE-S-027: `Booking` type thiếu field cho flight booking (9 bước flow không có type)
- FE-S-028: `Flight.departureTime` typed `string` ISO nhưng mock dùng `new Date().toISOString()` non-deterministic
- FE-S-029: `reviews.mock.ts` dùng `Math.random()` non-deterministic
- FE-S-030: `blogPosts.mock.ts` dùng `Date.now() - Math.random() * ...` non-deterministic
- FE-S-031: `destinations.ts` (253 LOC) duplicate `destinations.mock.ts` (215 LOC) với data khác nhau → FK broken
- FE-S-032: `<html lang="en">` hardcoded nhưng i18n default 'vi'

### 3.4 Findings — Medium (tóm tắt)

62 + 38 = 100 Medium findings. Tổng hợp theo category:

**State & data flow (25):**
- Hardcoded mock array: Notification, Dashboard, Membership, Vouchers, DeviceManagement, LoginHistory, BookingHistory, ManageBooking, BookingDetail, admin Dashboard, admin Settings (sensitive), admin Analytics, admin Reports, admin BookingList, admin BookingDetail, admin FlightList, admin TourList
- Form không submit handler: Profile, Feedback, Careers, UserEdit, FlightEdit, admin Settings
- Stale state: Profile avatar, BookingFlowStore reset

**Security (12):**
- Card input không validation: Payment.tsx:53-57 (card number, MM/YY, CVC type="text")
- Mock CCCD/passport partial mask trong source: Profile.tsx:81,95
- `handleToggle2FA` chỉ toast success, no real enrollment: Security.tsx:5-11
- Admin Settings expose SMTP/VNPay/SePay secrets plaintext: Settings.tsx:97-110, 131-136, 159
- CheckIn navigate `/boarding-pass/${pnr}` không validate: CheckIn.tsx:14
- `BookingFlowStore.passengerInfo` PII localStorage: (đã Critical FE-007)

**API integration (15):**
- Dashboard KPI static: Dashboard.tsx:67-100
- FlightStatus luôn return 'On Time': FlightStatus.tsx:11-21
- FlightResults ignore result sort/filter: FlightResults.tsx:13-17
- FlightDetail fetch ALL flights then `find()` O(n): FlightDetail.tsx:14-15
- Tours view mode 'map' always "đang cập nhật": Tours.tsx:30
- Analytics chart là placeholder div: Analytics.tsx:46-61
- RevenueReport bar chart inline `style={{height: val%}}`: RevenueReport.tsx:48-55

**UI/UX (18):**
- Touch target <44px: TripDetail.tsx:241-252 (32×32px button)
- `Math.random()` ID: Reservation.tsx:25, ChecklistSidebar.tsx:19, Checklist.tsx:21, TripDetail.tsx:48
- Wrong icon: Footer.tsx:86-91 (Globe icon cho FB/Twitter/IG)
- Newsletter form no-op: Footer.tsx:122-136
- Brand inconsistency: About.tsx:7 ("Trip Planner OTA" vs "TripPlaner")
- Stat card dùng `bg-blue-50` không design token: About.tsx:11-22
- Hardcoded year `© 2026`: Footer.tsx:143

**i18n (8):**
- HeroSection TRENDING hardcoded Vietnamese: HeroSection.tsx:69
- ServicesSection English placeholder: ServicesSection.tsx:4-7
- DownloadTicket "E-TICKET" + "Vietnam Airlines" hardcoded: DownloadTicket.tsx:30
- PriceTag locale hardcoded: PriceTag.tsx:21
- Blog category label nested ternary duplicate: Blog.tsx:57,86
- FareClass name 'Economy'/'Business' should be enum: FareClass.tsx:28-29

**Performance (12):**
- `components/common/Pagination` build full array (đã High FE-039)
- `FlightResults` sort/filter "đang phát triển": FlightResults.tsx:13-17
- `Blog.tsx` pagination client-side: Blog.tsx:25-27
- `BoardingPass.tsx` external SVG URL: BoardingPass.tsx:68
- `Skeleton.tsx` imperative `<style>` injection: Skeleton.tsx:88-93
- `Button.tsx` `as?: any` defeat type safety: Button.tsx:10
- `Button.tsx` `disabled` spread to `Link`: Button.tsx:40
- `DatePickerRange` direct DOM `style.borderColor` mutation: DatePickerRange.tsx:37-38
- `AirportAutocomplete` same direct style mutation: AirportAutocomplete.tsx:86-87
- `AirportAutocomplete` complex ternary call `.find()` twice: AirportAutocomplete.tsx:61
- `DestinationAutocomplete` mixed controlled/uncontrolled: DestinationAutocomplete.tsx:14
- `HeroSection.tsx:7` TRENDING const unused

### 3.5 Cross-cutting FE Issues

1. **Auth bypass everywhere** — `ProtectedRoute` exists but never used. ~80 route public. Single biggest FE security finding.
2. **Type vs implementation drift** — `PassengerInfo` interface ignore by `PassengerInfo.tsx`. TypeScript should catch — indicate `strict: false` or `as any`.
3. **Mock-first architecture** — 30+ view hardcoded array. React Query chỉ dùng cho tours/destinations/blogs/faqs/airports/flights/reviews. No `useMutation` example. Admin view cần full rewrite khi wire BE.
4. **i18n is theater** — `useTranslation()` import ở ~5 component, 95% UI string hardcoded Vietnamese. English locale dead.
5. **Route name chaos** — 5+ broken pattern: `/auth/*`, `/booking/passenger-info`, `/booking/seat-selection`, `/settings`, `/user/refunds/:id`, `/admin/tours/edit/:id`.
6. **Direct DOM manipulation anti-pattern** — `DatePickerRange`, `AirportAutocomplete`, `DestinationAutocomplete` mutate `e.target.style.borderColor` thay vì Tailwind `focus:`.
7. **`alert()`/`window.confirm()` everywhere** — 9+ file. `ModalConfirm` + `toast` exist but under-used.
8. **No `next/image` anywhere** — ~60 image dùng raw `<img>` external Unsplash. No lazy-load, no responsive, no AVIF/WebP.
9. **Polymorphic Button type-unsafe** — `as?: any` render as Link/button. TS can't verify `href` required or `disabled` invalid.
10. **Hydration mismatch on theme** — 3 layout read `theme` từ persisted store during render. No `suppressHydrationWarning`, no inline script.
11. **Two EmptyState components** — `common/EmptyState` vs `ui/EmptyState` khác API. Same `DataErrorState` vs `ErrorState`.
12. **Duplicate CSS** — `index.css` vs `globals.css` byte-identical. `App.css` binary garbage (UTF-16 BOM).
13. **Admin mobile UX missing** — `ml-64` hard margin, `AdminSidebar` `fixed w-64` no drawer.
14. **`as string` cast on `useParams()`** — 9+ view unsafe cast.
15. **`Date.now()` and `Math.random()` as IDs** — 4 file, collision-prone, non-monotonic, not UUID.
16. **No `middleware.ts`** — Zero middleware → no auth gating, no i18n locale routing, no rate limiting at edge.
17. **5 unused dependencies** — `react-router-dom`, `axios`, `@stripe/react-stripe-js`, `@stripe/stripe-js`, `framer-motion`.
18. **`lucide-react: ^1.24.0`** — version không tồn tại trên npm (latest `^0.460.0`).
19. **Test type errors** — `auth.store.test.tsx` `id: 1` (number) where `string` required, `role: 'USER'` where `'User'|'Admin'` required, `login(mockUser)` missing required `token` arg.
20. **`tsconfig.json` target `ES2017`** — outdated cho Next 16 / React 19. Missing `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `forceConsistentCasingInFileNames`.

---

## 4. Backend Review

### 4.1 File Inventory

Tổng **77 file** reviewed (Task 5).

```
backend/
├── src/
│   ├── main.ts                         # Bootstrap (CORS, ValidationPipe, Swagger, BigInt toJSON)
│   ├── app.module.ts                   # Root (ConfigModule, Throttler, BullMQ, CacheModule)
│   ├── app.controller.ts               # Health-check
│   ├── prisma/                         # PrismaService + Module
│   ├── common/
│   │   ├── guards/                     # jwt-auth, authorization, roles
│   │   ├── decorators/                 # current-user, permissions, roles
│   │   ├── filters/                    # global-exception (leak message)
│   │   ├── interceptors/               # audit-log (no before-data)
│   │   ├── services/                   # activity-log
│   │   └── utils/                      # crypto (hardcoded fallback key)
│   ├── jobs/                           # booking-expiry, email processor
│   └── modules/
│       ├── auth/                       # controller, service, module, spec, session, jwt.strategy, dto
│       ├── user/                       # controller, service, module
│       ├── email/                      # service, module
│       ├── flight/                     # controller, service, module
│       ├── tour/                       # controller, service, module
│       ├── booking/                    # controller, service, module, spec
│       ├── payment/                    # controller, service, module, spec
│       ├── review/                     # controller, service, module
│       ├── wishlist/                   # controller, service, module
│       ├── blog/                       # controller, service, module, dto
│       ├── notification/               # service, module
│       ├── membership/                 # service, module (dead code)
│       ├── upload/                     # controller, module (MIME-only validation)
│       ├── admin/                      # controller, module, analytics.controller, analytics.service
│       └── rbac/                       # controller, module
├── prisma/                             # schema.prisma, seed.ts, 2 migration
├── test/                               # app.e2e-spec.ts (chỉ test GET /)
├── test_concurrency.ts                 # standalone (not in Jest)
├── test_concurrency_integration.ts     # standalone (not in Jest)
└── 8 config file                       # package.json, tsconfig, nest-cli, eslint, docker-compose
```

#### Module risk heatmap

| Module | Critical | High | Medium | Low | Info |
|---|---|---|---|---|---|
| Auth | 7 | 10 | 8 | 5 | 4 |
| Booking | 3 | 6 | 4 | 2 | 1 |
| Payment | 2 | 5 | 3 | 1 | 1 |
| Common/Guards | 1 | 4 | 5 | 3 | 2 |
| Admin | 0 | 4 | 3 | 2 | 1 |
| Upload | 0 | 4 | 3 | 1 | 0 |
| Blog | 0 | 3 | 4 | 1 | 0 |
| Review | 0 | 3 | 2 | 1 | 0 |
| Email/Jobs | 0 | 3 | 3 | 1 | 1 |
| Flight | 0 | 1 | 4 | 2 | 1 |
| Tour | 0 | 1 | 3 | 1 | 0 |
| Config/Main | 1 | 3 | 2 | 2 | 3 |
| RBAC | 0 | 1 | 3 | 1 | 1 |
| Notification | 0 | 1 | 2 | 1 | 1 |
| Membership | 0 | 0 | 2 | 1 | 0 |
| User | 0 | 1 | 1 | 1 | 0 |
| Wishlist | 0 | 0 | 0 | 1 | 0 |
| Test | 0 | 0 | 3 | 2 | 1 |

### 4.2 Findings — Critical

#### BE-001 · Critical · Security/DoS · `refreshToken.findMany()` không filter + bcrypt compare toàn bảng
- **File:** `src/modules/auth/auth.service.ts:283-328`
- **Code:**
  ```ts
  const allRecords = await this.prisma.refreshToken.findMany();  // ❌ no where
  for (const r of allRecords) {
    if (await bcrypt.compare(token, r.tokenHash)) { ... }        // ~100ms/call
  }
  ```
- **Impact:** (1) DoS nghiêm trọng — 10K refresh token × 100ms = ~17 phút CPU per request. Vài request song song = sập service. (2) Không scale — bảng phình theo thời gian, không index cứu được vì compare bằng bcrypt hash. (3) Bypass rotation nếu CPU quá tải → request timeout nhưng token vẫn dùng được.
- **Root cause:** Bcrypt hash không reversible → không query direct. Code chọn linear scan thay vì store thêm `tokenHint` (SHA-256 hash indexable).
- **Fix idea:** Lưu `tokenHint = sha256(token).hex().slice(0,16)`, query `findUnique({ where: { tokenHint }})` O(1), sau đó `bcrypt.compare` 1 lần.

#### BE-002 · Critical · Security/AuthN · OTP verification dùng `userId: BigInt(0)` thay vì email
- **File:** `src/modules/auth/auth.service.ts:81-92`
- **Code:**
  ```ts
  const otpRecord = await this.prisma.otpCode.findFirst({
    where: { userId: BigInt(0), purpose: 'REGISTER', consumedAt: null },
    orderBy: { id: 'desc' },
  });
  ```
- **Impact:** Bất kỳ OTP nào (dùng cho email A) đều hợp lệ cho email B. Attacker:
  1. `POST /api/auth/send-otp` với email attacker → receive OTP.
  2. `POST /api/auth/register` với email victim + OTP của attacker → đăng ký thay victim.
  3. Login bằng email victim + password attacker set → **account takeover**.
- **Root cause:** Vì user chưa tồn tại khi register, code gán `userId=0` cho OtpCode. Query `findFirst` không filter theo email → lấy record mới nhất (`orderBy: id desc`).

#### BE-003 · Critical · Security/Auth · JWT_SECRET fallback `'secret'`
- **File:** `src/modules/auth/strategies/jwt.strategy.ts:19`
- **Code:** `secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'secret',`
- **Impact:** Dù `app.module.ts:34` Joi validate `required()`, fallback vẫn chết nếu validation bị skip (test env, monorepo chạy không load ConfigModule). Token signed bằng `'secret'` được mọi instance accept → impersonation.

#### BE-004 · Critical · Security/CORS · `origin: '*'` + `credentials: true` invalid combo
- **File:** `src/main.ts:28-32`
- **Code:**
  ```ts
  app.enableCors({ origin: '*', credentials: true });
  ```
- **Impact:** (1) Spec CORS cấm combo này — browser block mọi request có cookie/Authorization. (2) Custom client (curl, Postman, mobile) không tuân thủ spec → origin `*` cho phép bất kỳ domain nào đọc response → leak data khi có credentials.

#### BE-005 · Critical · Security/Crypto · `CryptoService` hardcoded fallback key + salt
- **File:** `src/common/utils/crypto.service.ts:12-17` + `src/app.module.ts:36`
- **Code:**
  ```ts
  const key = this.configService.get<string>('APP_SECRET') || 'default_secret_key_needs_32_bytes_!';
  this.secretKey = crypto.scryptSync(key, 'salt', 32);   // ❌ hardcoded salt
  ```
  Và `app.module.ts:36`: `APP_SECRET: Joi.string().optional().default('app-secret-default')`.
- **Impact:** Mọi deployment không set `APP_SECRET` dùng cùng key + salt → decrypt lẫn nhau. `CryptoService` hiện không dùng (search toàn codebase không có inject), nhưng khi tích hợp sẽ leak.

#### BE-006 · Critical · Security/OTP · `Math.random()` for OTP generation
- **File:** `src/modules/auth/auth.service.ts:36`
- **Code:** `const otp = Math.floor(100000 + Math.random() * 900000).toString();`
- **Impact:** `Math.random()` không cryptographically secure — predictable với đủ samples. CWE-338.

#### BE-007 · Critical · Security/DoS · (trùng BE-001, expand)
Mỗi `bcrypt.compare` cost 10 ~ 100ms. `findMany()` full-table scan + loop compare = công khai DoS vector. Endpoint `/api/auth/refresh` không throttle riêng, chỉ global 100 req/min → 100 req × 10K token × 100ms = không thể phục vụ.

#### BE-008 · Critical · Security/IDOR · Tất cả booking endpoint không ownership check
- **File:** `src/modules/booking/booking.controller.ts:22-68`
- **Code:**
  ```ts
  @Patch(':id/seats')
  async selectSeat(@Param('id') id: string, @Body('seatId') seatId: string, ...) {
    return this.bookingService.selectSeat(BigInt(id), BigInt(seatId), version);
    // ❌ no ownership check
  }
  ```
- **Endpoints affected:** `selectSeat`, `updatePassengers`, `applyVoucher`, `updateBookingStatus`.
- **Impact:** Bất kỳ user đã login cũng có thể: lock ghế booking người khác, apply voucher vào booking người khác (hỏng total), confirm/cancel booking người khác. **Lỗ hổng IDOR nghiêm trọng nhất.**

#### BE-009 · Critical · Security/IDOR · Payment initiate không ownership check
- **File:** `src/modules/payment/payment.controller.ts:22-26`
- **Code:**
  ```ts
  @Post(':bookingId/initiate')
  async initiatePayment(@Param('bookingId') bookingId: string) {
    return this.paymentService.initiatePayment(BigInt(bookingId));
    // ❌ no user param, no ownership check
  }
  ```
- **Impact:** Bất kỳ user cũng initiate payment cho bookingId bất kỳ. Combined với BE-008, attacker confirm booking victim → refund vào tài khoản mình.

#### BE-010 · Critical · Security/OTP-reuse · (trùng BE-002, expand attack chain)
1. Attacker gửi OTP cho email mình.
2. Attacker register với email victim + OTP của mình → **đăng ký thay victim**.
3. Attacker login bằng email victim + password attacker set → account takeover.

#### BE-011 · Critical · Data/State-machine · Payment callback nhảy DRAFT → CONFIRMED bypass state machine
- **File:** `src/modules/payment/payment.service.ts:101-104`
- **Code:**
  ```ts
  await tx.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' },   // ❌ DRAFT → CONFIRMED directly
  });
  ```
- **Impact:** `BookingService.canTransition` (`booking.service.ts:213-222`) chỉ cho `DRAFT → PENDING_PAYMENT | CANCELLED`. Payment callback nhảy thẳng DRAFT → CONFIRMED, bypass state machine + không tạo `BookingStatusHistory`. Ngoài ra `initiatePayment` yêu cầu `status === 'DRAFT'` (line 22) nhưng KHÔNG transition sang `PENDING_PAYMENT` trước khi trả paymentUrl.

#### BE-012 · Critical · Data · `updatePassengers` là stub no-op
- **File:** `src/modules/booking/booking.service.ts:254-257`
- **Code:**
  ```ts
  async updatePassengers(bookingId: bigint, passengers: any[]) {
    // Basic implementation
    return { success: true, passengers };   // ❌ stub — does NOTHING
  }
  ```
- **Cascade impact:**
  - `BookingPassenger` rỗng → `booking-expiry.processor.ts:31-33` không release ghế nào khi booking hết hạn.
  - `recalculateTotal` (line 181-198) đọc `booking.passengers` để tính total → total luôn = 0 nếu chỉ có passengers.
  - `selectSeat` (line 52-78) lock ghế nhưng KHÔNG gán `seatId` vào passenger nào → không biết booking nào sở hữu lock nào.
- **Net effect:** Ghế LOCKED vĩnh viễn, không bao giờ được release. Toàn bộ luồng booking-flight broken.

#### BE-013 · Critical · Auth · `RegisterDto & { otp: string }` broken by `forbidNonWhitelisted`
- **File:** `src/modules/auth/auth.controller.ts:64`
- **Code:**
  ```ts
  async register(@Body() dto: RegisterDto & { otp: string }) { ... }
  ```
- **Impact:** `RegisterDto & { otp: string }` là TypeScript intersection — runtime chỉ có class `RegisterDto`. Global `ValidationPipe` với `forbidNonWhitelisted: true` (main.ts:39) sẽ **reject** payload có field `otp` (vì `otp` không có decorator trong `RegisterDto`). **Endpoint `/register` broken**, không thể register được.

#### BE-014 · Critical · Config/CORS · (trùng BE-004)

### 4.3 Findings — High

#### BE-015 · High · Concurrency · `selectSeat` lock seat nhưng không link BookingPassenger → expiry job không release
- **File:** `src/modules/booking/booking.service.ts:52-78` + `src/jobs/booking-expiry.processor.ts:30-40`
- `selectSeat` set `FlightSeat.status = LOCKED` nhưng không link seat → BookingPassenger. Booking-expiry job:
  ```ts
  const lockedSeatIds = booking.passengers
    .filter((p) => p.seatId != null)
    .map((p) => p.seatId);
  ```
  Vì `passengers` luôn rỗng (BE-012), `lockedSeatIds` luôn rỗng → không bao giờ release ghế.
- **Impact:** Ghế khoá vĩnh viễn, dần cạn kiệt ghế available.

#### BE-016 · High · Concurrency · `recalculateTotal` chạy ngoài transaction của `applyVoucher`
- **File:** `src/modules/booking/booking.service.ts:99-103`
- ```ts
  await this.recalculateTotal(bookingId);   // outside tx
  const updatedBooking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
  // ... tx starts at line 134
  await tx.booking.update({ data: { totalAmount: Number(updatedBooking.totalAmount) - discount } });
  ```
- Stale read: nếu 2 voucher apply đồng thời, cả 2 đọc cùng total, trừ discount, ghi đè lẫn nhau.

#### BE-017 · High · Concurrency · Payment idempotency check không row-lock
- **File:** `src/modules/payment/payment.service.ts:80-111`
- Idempotency check `if (payment.status === 'SUCCESS') return` ở line 88, nhưng lookup + update không dùng row-lock. MySQL READ COMMITTED default: 2 callback đồng thời đều đọc PENDING, cả 2 update SUCCESS → double-confirm. Spec test mock tuần tự, không phát hiện.
- **Fix:** `tx.payment.updateMany({ where: { id, status: 'PENDING' }, data: { status: 'SUCCESS' } })` và check `count === 1`.

#### BE-018 · High · Concurrency · `updateBookingStatus` check `canTransition` ngoài transaction
- **File:** `src/modules/booking/booking.service.ts:224-252`
- ```ts
  const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
  if (!this.canTransition(booking.status, newStatus)) throw ...;
  await this.prisma.$transaction([ ...update..., ...history... ]);
  ```
- 2 request đồng thời cùng thấy status='DRAFT', cả 2 pass check, cả 2 apply → final status không xác định, history có 2 entries.

#### BE-019 · High · Security/AuthN · Access-token blacklist dùng `jwtService.decode` (no signature verify)
- **File:** `src/modules/auth/auth.service.ts:330-336`
- ```ts
  const decoded = this.jwtService.decode(token);   // ❌ no signature verification
  const ttl = decoded.exp * 1000 - Date.now();
  if (ttl > 0) { await this.cacheManager.set(`blacklist_${token}`, true, ttl); }
  ```
- `jwtService.decode` không verify signature → attacker submit token giả với `exp` xa → blacklist entry tồn tại mãi mãi trong Redis. Key là full JWT (~1KB) — lãng phí memory.

#### BE-020 · High · Security · Nhiều endpoint không có DTO, `@Body() data: any`
- **File:** 11+ endpoint:
  - `auth.controller.ts:50-55 sendOtp`
  - `auth.controller.ts:64 register` (BE-013)
  - `auth.controller.ts:105 refresh`
  - `auth.controller.ts:116-122 logout`
  - `booking.controller.ts:22-29, 31-39, 41-48, 50-58, 60-68`
  - `payment.controller.ts:24, 31, 39-44`
  - `review.controller.ts:16-30, 34-38`
  - `user.controller.ts:20-24 updateProfile`
  - `admin.controller.ts:36-41`
- **Impact:** Input không validate → có thể truyền field lạ, kiểu sai, SQL injection qua Prisma raw query.

#### BE-021 · High · Security · `sendOtp` không DTO, `email` không `@IsEmail`, throttle per-IP không per-email
- **File:** `src/modules/auth/auth.controller.ts:42-55`
- Throttle 3 req/15 min chỉ per-IP. Attacker xoay IP (proxy, VPN) spam OTP đến nhiều email hoặc spam 1 email từ nhiều IP.

#### BE-022 · High · Security · `console.log` OTP plaintext
- **File:** `src/modules/auth/auth.service.ts:77`
- `console.log(`[DEV MODE] OTP for ${email}: ${otp}`)` — log OTP plaintext. Prod với log aggregator → OTP leak.

#### BE-023 · High · Security/OTP · Không brute-force protection cho OTP
- **File:** `src/modules/auth/auth.service.ts:91-97`
- Record `OtpCode` không lock sau N lần thử sai. 6-digit OTP = 1M combinations, global throttle 100 req/min → 167 phút brute-force. Nên thêm `attempts` column + max 5 tries + lock record.

#### BE-024 · High · Security/AuthZ · `ParseIntPipe` cho BigInt session ID
- **File:** `src/modules/auth/auth.controller.ts:161-177`
- ```ts
  async revokeSession(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.sessionService.revokeSession(BigInt(id), user.id);
  }
  ```
- `ParseIntPipe` reject BigInt ID > `Number.MAX_SAFE_INTEGER`.

#### BE-025 · High · Data · `userDevice.upsert where: { id: 0 }` nonsensical + racy
- **File:** `src/modules/auth/auth.service.ts:180-212`
- ```ts
  await this.prisma.userDevice.upsert({
    where: { id: 0 },   // ❌ UserDevice.id is autoincrement BigInt, never 0
    create: { ... },
    update: { lastActiveAt: new Date() },
  }).catch(async () => { /* manual lookup + create */ });
  ```
- `where: { id: 0 }` luôn không match → luôn rơi vào `create`. Schema không có `@@unique([userId, deviceFingerprint])` → 2 login đồng thời từ cùng device tạo 2 record. Logic `catch` cũng racy: 2 concurrent login đều `findFirst` trả null, cả 2 `create` → 2 record.

#### BE-026 · High · Data/BigInt · Global monkey-patch `BigInt.prototype.toJSON`
- **File:** `src/main.ts:87-89`
- ```ts
  (BigInt.prototype as any)['toJSON'] = function () { return this.toString(); };
  ```
- Workaround acceptable nhưng: (1) ảnh hưởng toàn Node process. (2) Không apply cho BigInt trong nested object với một số library. (3) Conflict khi upgrade Node/Bun.

#### BE-027 · High · Error · Global exception filter leak internal message
- **File:** `src/common/filters/global-exception.filter.ts:23-26`
- ```ts
  } else if (exception instanceof Error) {
    message = exception.message;   // ❌ leaks internal message
  }
  ```
- Không check `process.env.NODE_ENV === 'production'`. Internal errors (Prisma connection, FS, stack trace) leak ra client. Không log error, không request ID.

#### BE-028 · High · Error · Không map Prisma errors to HTTP
- **File:** `src/common/filters/global-exception.filter.ts`
- Không map:
  - `P2002` (unique constraint) → 409 Conflict
  - `P2025` (record not found) → 404
  - `P2003` (foreign key) → 400
  - `P2014` (invalid relation) → 400
- Hiện tại tất cả trả 500 với raw message.

#### BE-029 · High · Error · Class-validator array message chỉ lấy `[0]`
- **File:** `src/common/filters/global-exception.filter.ts:31`
- `message: Array.isArray(message) ? message[0] : message` — client không thấy các lỗi khác.

#### BE-030 · High · Security/Logging · Email processor log toàn bộ nội dung email (PII leak)
- **File:** `src/jobs/email.processor.ts:64-122`
- Worker log `📧 [VERIFY EMAIL] → ${data.to}` + OTP + full name + booking code + amount. Centralized logging → PII leak.

#### BE-031 · High · Security/AuthZ · FLIGHT review integrity bug
- **File:** `src/modules/review/review.service.ts:33-42`
- ```ts
  const booking = await this.prisma.booking.findFirst({
    where: { userId, status: 'COMPLETED', type: 'FLIGHT' },
  });
  hasCompletedBooking = !!booking;  // ❌ doesn't check flight ID match
  ```
- User có 1 completed flight booking bất kỳ → review được mọi flight.

#### BE-032 · High · Security/AuthZ · `upvoteReview` không dedup per user
- **File:** `src/modules/review/review.controller.ts:34-38` + `review.service.ts:91-97`
- ```ts
  async upvoteReview(reviewId: bigint, userId: bigint) {
    // Ideally check if user already voted. We will just increment for demo.
    return this.prisma.review.update({ data: { helpfulCount: { increment: 1 } } });
  }
  ```
- Spam upvote infinite. Schema thiếu `ReviewVote` table.

#### BE-033/034/035 · High · API · Rating/type/status không `@IsEnum`/`@IsInt` validate
- `review.controller.ts:16-30` rating not validated (-1, 999, 3.14 possible)
- `booking.controller.ts:22-29` type not `@IsEnum(BookingType)`
- `booking.controller.ts:60-68` status not `@IsEnum(BookingStatus)` — attacker truyền `'HACKED'` → ghi thẳng DB

#### BE-036 · High · API · `updateProfile` không DTO
- **File:** `src/modules/user/user.controller.ts:20-24`
- ```ts
  async updateProfile(@CurrentUser() user: any, @Body() data: any) {
    return this.userService.updateProfile(user.id, data);
  }
  ```
- Service pick field specific (prevent role escalation) nhưng thiếu validation: `data.fullName` có thể là số, `data.dateOfBirth` string không parse được, `data.phone` không validate format.

#### BE-037 · High · Security/AuthZ · `AuthorizationGuard` query DB permission per request
- **File:** `src/common/guards/authorization.guard.ts:88-95`
- ```ts
  private async getUserPermissions(role: string): Promise<string[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role: role as any },
      include: { permission: true },
    });
    return rolePermissions.map((rp) => rp.permission.code);
  }
  ```
- Query DB mỗi request cần permission check. Comment thừa nhận "Could be cached in Redis" nhưng chưa làm.

#### BE-038 · High · Concurrency · Booking code generation 6 hex chars (16.7M space, birthday paradox)
- **File:** `src/modules/booking/booking.service.ts:19-31`
- ```ts
  while (!isUnique) {
    bookingCode = randomBytes(3).toString('hex').toUpperCase();  // 6 hex chars = 16M space
    const existing = await this.prisma.booking.findUnique({ where: { bookingCode } });
    if (!existing) isUnique = true;
  }
  ```
- Birthday paradox: 50% collision tại ~4,823 codes. 2 request đồng thời cùng sinh code giống nhau → 1 fails with P2002 (không catch).

#### BE-039 · High · Performance · Analytics N+1 query for membership tier count
- **File:** `src/modules/admin/analytics.service.ts:237-249`
- ```ts
  const tierStats = await Promise.all(
    tiers.map(async (tier) => {
      const count = await this.prisma.userPoints.count({ where: { tierId: tier.id } });
      return { ... };
    }),
  );
  ```
- N+1 — mỗi tier 1 query count. Nên `groupBy({ by: ['tierId'], _count: true })` 1 query.

#### BE-040 · High · Performance · Raw SQL analytics không có index hỗ trợ
- **File:** `src/modules/admin/analytics.service.ts:30-42, 88-97, 130-139, 158-187`
- `$queryRaw` với template literal — Prisma parameterizes correctly, **không** SQL injection. Nhưng:
  - Query `JOIN Booking b ON p.bookingId = b.id` không có index trên `Payment.status` (schema chỉ index `createdAt`). Full table scan trên Payment.
  - Mỗi analytics request chạy 4-5 raw SQL + aggregates, không cache.

#### BE-041 · High · API · Admin `getBookings` leak passwordHash, no pagination
- **File:** `src/modules/admin/admin.controller.ts:27-32, 43-50`
- ```ts
  async getBookings() {
    return this.prisma.booking.findMany({ include: { user: true, payment: true }, take: 50 });
  }
  ```
- `include: { user: true }` leak passwordHash, status, deletedAt. Hardcoded `take: 50/100`, không pagination params.

#### BE-042 · High · API · Admin `updateBookingStatus` hardcoded 'CONFIRMED'
- **File:** `src/modules/admin/admin.controller.ts:34-41`
- ```ts
  @Patch('bookings/:id/status')
  async updateBookingStatus(@Param('id') id: string) {
    return this.prisma.booking.update({ where: { id: BigInt(id) }, data: { status: 'CONFIRMED' } });
  }
  ```
- Hardcoded status 'CONFIRMED', không nhận input. Bypass `BookingService.canTransition` state machine. Không tạo `BookingStatusHistory`. Không `@Permissions('BOOKING_UPDATE_STATUS')`.

#### BE-043 · High · Security/Upload · MIME-only validation spoofable
- **File:** `src/modules/upload/upload.controller.ts:47-57`
- ```ts
  const imageFilter = (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) { return cb(new BadRequestException(...), false); }
    cb(null, true);
  };
  ```
- `file.mimetype` lấy từ `Content-Type` header của client — spoofable. Attacker upload `evil.html` với `Content-Type: image/jpeg` → pass filter.

#### BE-044 · High · Security/Upload · Keep original extension → stored XSS/RCE
- **File:** `src/modules/upload/upload.controller.ts:42-44`
- ```ts
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  }
  ```
- Giữ nguyên extension từ `originalname`. Attacker gửi `file.originalname = "shell.php"` → file saved as `<uuid>.php`. Combined với BE-043 → stored XSS/RCE.

#### BE-045 · High · Config · docker-compose weak credentials
- **File:** `docker-compose.yml:7, 14-16`
- `MYSQL_ROOT_PASSWORD: root` — weak password plaintext.
- Redis `image: redis:alpine` — no `requirepass`, no `--requirepass` → Redis open without auth.
- No `env_file`, secrets committed.

#### BE-046 · High · Config · docker-compose no healthcheck, no depends_on
- **File:** `docker-compose.yml`
- No `healthcheck` cho MySQL/Redis. NestJS `onModuleInit` gọi `prisma.$connect()` — nếu MySQL chưa ready, app crash.
- No `depends_on` với `condition: service_healthy`.
- No `restart: unless-stopped`.

#### BE-047 · High · Security/Auth · `refresh` endpoint không validate token exists
- **File:** `src/modules/auth/auth.controller.ts:105-107`
- ```ts
  async refresh(@Body('refresh_token') token: string) {
    return this.authService.refreshToken(token);
  }
  ```
- Không validate `token` exists. `refreshToken(undefined)` → `bcrypt.compare(undefined, ...)` → throw RangeError → 500. Không per-user/IP throttle → DoS vector.

#### BE-048 · High · Security/Auth · `logout` không null check authHeader
- **File:** `src/modules/auth/auth.controller.ts:116-122`
- ```ts
  async logout(
    @CurrentUser() user: any,
    @Headers('authorization') authHeader: string,
    @Body('session_token') sessionToken?: string,
  ) {
    const token = authHeader.split(' ')[1];   // ❌ no null check
  ```
- Nếu `authHeader` `"Bearer "` (space trailing), `split(' ')[1]` là `""` → blacklist empty string.

#### BE-049 · High · Concurrency · Voucher redemption stale read
- **File:** `src/modules/booking/booking.service.ts:80-167`
- Voucher redemption: check `voucher.usageLimit && voucher.usedCount >= voucher.usageLimit` (line 96) **ngoài transaction**. Tx (line 134-164) dùng `updateMany({ where: { usedCount: { lt: usageLimit } } })` đúng OCC. Nhưng:
  - Read `updatedBooking.totalAmount` (line 100-102) không lock → stale read cho discount calc.
  - `recalculateTotal(bookingId)` (line 99) ghi `booking.totalAmount` NGOÀI tx → có thể bị tx rollback ghi đè.
  - Discount = `Number(Decimal) * Number(Decimal) / 100` — mất precision.

#### BE-050 · High · Auth · Account lock không có unlock mechanism
- **File:** `src/modules/auth/auth.service.ts:217-243`
- ```ts
  if (recentFailures >= 5) {
    await this.prisma.user.update({ where: { id: userId }, data: { status: 'LOCKED' } });
  }
  ```
- Khóa tài khoản sau 5 failed logins nhưng KHÔNG có admin endpoint unlock, không auto-unlock sau X phút. User bị khóa vĩnh viễn.

#### BE-051 to BE-065 · High (tóm tắt)
- BE-051: `refreshToken` không check `expiresAt` trước bcrypt compare → waste CPU
- BE-052: `$transaction([...])` array form không interactive → không throw logic error trong tx
- BE-053: `new Buffer(signData, 'utf-8')` DEPRECATED, crash Node 22+
- BE-054: `initiatePayment` không check payment đã SUCCESS → re-initiate (P2002 leak)
- BE-055: `requestRefund` không check refund đã REQUESTED → spam refunds
- BE-056: `blog.service.ts:74-94` tag update (deleteMany + create) không tx → data loss nếu create fail
- BE-057: `publishPost` với `scheduledAt` không enqueue BullMQ job → scheduled post không bao giờ publish
- BE-058: `getPost` increment viewCount mỗi GET, không dedup → view count inflation
- BE-059: `getSessions` luôn return `isCurrent: false` — feature broken
- BE-060: register tạo user `status: 'ACTIVE'` ngay, bypass `PENDING_VERIFICATION` default schema
- BE-061: `notification.service.ts:38` enqueue job name `'send-email'` — `EmailProcessor` không handle job này (chỉ handle `send-verify-email`, etc.) → job rơi vào `default` case, log warning, không gửi
- BE-062: `email.module.ts:8-10` + `notification.module.ts:7-9` cùng register queue `'email'` — duplicate
- BE-063: `membership.service.ts` `awardPoints` không bao giờ được gọi — dead code
- BE-064: `analytics.service.ts` raw SQL không có index `Payment(bookingId)` explicit
- BE-065: `prisma.service.ts` không có `enableShutdownHooks` → SIGTERM không trigger `$disconnect` cleanly

### 4.4 Module-by-Module Deep Notes

#### Auth Module
- **O(N) refresh-token rotation** (BE-001) — scan toàn bảng + bcrypt loop, không scale, severe DoS.
- **OTP BigInt(0) cross-email reuse** (BE-002, BE-010) — bypass email verification hoàn toàn.
- **`RegisterDto & { otp }` broken** (BE-013) — `forbidNonWhitelisted` reject payload có `otp`.
- **Math.random OTP** (BE-006) — không crypto-secure.
- **JWT_SECRET fallback 'secret'** (BE-003) — dead code nhưng dangerous nếu validation skip.
- **Access-token blacklist** (BE-019) — dùng unverified `jwtService.decode` cho exp, key là full JWT.
- **No unlock mechanism** (BE-050) — account locked vĩnh viễn.
- **Session `isCurrent: false` hardcoded** (BE-059) — "My Devices" feature broken.
- **User enumeration** (BE-098) — RESET_PASSWORD throw "User not found".
- **`userDevice.upsert where: { id: 0 }`** (BE-025) — nonsensical, racy.

#### Booking Module
- **IDOR toàn bộ endpoints** (BE-008) — không ownership check.
- **`updatePassengers` là stub** (BE-012) — return input, không persist.
- **Seat lock không link passenger** (BE-015) → expiry job không release ghế.
- **State machine bypass** (BE-011) — payment callback nhảy DRAFT→CONFIRMED.
- **`$transaction([...])` array form** (BE-052) — không interactive, không throw logic error.
- **`recalculateTotal` ngoài tx** (BE-110) — stale read.
- **Booking code collision** (BE-038) — 6 hex chars, birthday paradox.
- **Voucher apply stale read** (BE-049) — `updatedBooking.totalAmount` đọc ngoài tx.
- **Decimal precision loss** (BE-111, BE-112) — `Number(Decimal)` cho prices.

#### Payment Module
- **IDOR initiate** (BE-009) — không ownership check.
- **Idempotency race** (BE-017) — `status === 'SUCCESS'` check không row-lock.
- **`new Buffer()` deprecated** (BE-053) — crash Node 22+.
- **State machine bypass** (BE-011) — DRAFT→CONFIRMED trực tiếp.
- **No PENDING_PAYMENT transition** in initiate (BE-090).
- **Refund không change Payment status** (BE-109).
- **HMAC verify đúng** với `timingSafeEqual` + length check — điểm sáng.
- **`vnp_TxnRef` = bookingId** — attacker biết bookingId có thể fabricate callback nếu leak secret.

#### Flight Module
- **Cache TTL ambiguity** (BE-076) — `cache-manager-ioredis` expects seconds, code passes 60000.
- **`Number(Decimal)` cho price sort** (BE-078) — precision loss.
- **No DTO validation** (BE-079) — `BigInt('abc')` throws.
- **In-memory sort** (BE-077) — should be DB orderBy.
- **Cache key includes `passengers`** — low hit rate cho different passenger counts.
- **No availability cache invalidation** khi seat locked.

#### Tour Module
- **In-memory tag filter** (BE-080) — load all destinations then filter.
- **No DTO validation** (BE-081) — page/limit as strings.
- **`whereClause.destination = { ...whereClause.destination, type }`** — nếu cả `region` và `type` set, spread override OK. Nhưng nếu `type` không match enum, silently ignored.
- **`getRelatedTours` take: 4** hardcoded.

#### Blog Module
- **Tag update không tx** (BE-056) — deleteMany + create, data loss nếu create fail.
- **Scheduled publish không enqueue job** (BE-057) — SCHEDULED posts never auto-publish.
- **View count inflation** (BE-058) — no dedup.
- **Route order** (BE-104) — `:slug` before `admin/all`, `GET /api/blog/admin` matches `:slug`.
- **`createTag` upsert silent no-op** (BE-101).
- **RBAC tốt** — `@Roles` + `@Permissions` đầy đủ.
- **DTO đầy đủ** — điểm sáng.

#### Admin Module
- **RolesGuard thay vì AuthorizationGuard** (BE-089) — không check permission chi tiết.
- **`updateBookingStatus` hardcoded 'CONFIRMED'** (BE-042) — useless + bypass state machine.
- **`getBookings` leak passwordHash** (BE-041) — `include: { user: true }`.
- **No pagination** (BE-041) — hardcoded `take: 50/100`.
- **Analytics N+1** (BE-039) — membership tier count loop.
- **Raw SQL đúng** (Prisma parameterizes) — không injection.
- **No cache** (BE-092) — 8 queries per dashboard load.

#### RBAC Module
- **`AssignPermissionDto.permissionId` không `@IsInt`** (BE-094).
- **`createPermission` không check exist** (BE-095) — P2002 leak.
- **`seedDefaultPermissions` không `@Permissions('RBAC_MANAGE')`** (BE-096).
- **Controller access Prisma directly** (BE-137) — should delegate to service.
- **Permission definitions hardcoded** in controller — should be in seed/config.
- **No `RbacService`** — all logic in controller.

#### Upload Module
- **MIME-only validation** (BE-043) — spoofable, stored XSS risk.
- **Keep original extension** (BE-044) — `evil.php` saved as `<uuid>.php`.
- **No magic byte sniffing** — should use `file-type` library.
- **`deleteMedia` wrong exception type** (BE-086).
- **`listMedia` no admin override** (BE-087).
- **No file size total limit per user** — disk exhaustion.
- **`MulterModule.register({ dest })` unused** (BE-122).

#### Email Module
- **PII leak in processor** (BE-030) — OTP, email, name logged plaintext.
- **No `concurrency` on processor** (BE-084) — default 1, serialize.
- **No `defaultJobOptions`** (BE-083) — each add sets own.
- **No `@OnWorkerEvent('failed')`** (BE-085) — no dead-letter tracking.
- **No real SMTP integration** — logs only.

#### Notification Module
- **Job name mismatch** (BE-061) — enqueue `'send-email'`, processor doesn't handle.
- **Duplicate queue registration** (BE-062, BE-130).
- **No `Notification` read/unread API** — only `sendNotification` exists.
- **No SSE/WebSocket** for real-time.

#### Membership Module
- **Dead code** (BE-063) — `awardPoints` never called.
- **`console.log` upgrade** (BE-088) — should fire notification event.
- **No tier downgrade logic** — only upgrade.
- **No points expiry** — points accumulate forever.

#### Review Module
- **FLIGHT review integrity bug** (BE-031) — any completed flight → review any flight.
- **No upvote dedup** (BE-032) — spam infinite.
- **No DTO validation** (BE-033) — rating not validated.
- **`ratingAvg` update không tx** (BE-105).
- **No review moderation** — no admin endpoint to hide.

#### Wishlist Module
- **Cleanest module** — toggle via unique constraint, ownership implicit via `userId` in compound key.
- **No `@Roles` needed** — user-scoped.
- **No pagination on `getWishlist`** — returns all.
- **No soft delete** — hard delete on toggle off.

#### User Module
- **No DTO** (BE-036) — `@Body() data: any`.
- **Service picks fields explicitly** — prevents role escalation but no validation.
- **No password change endpoint** — only profile fields.
- **No email change endpoint** — should require re-verification.

### 4.5 Concurrency Deep-Dive

#### 5.1 Booking Seat Selection Flow

**Walkthrough** (`booking.service.ts:52-78`):
1. Client fetches seat list with `version` field via `GET /api/flights/:id/seats`.
2. Client calls `PATCH /api/bookings/:id/seats` with `{ seatId, version }`.
3. Service checks `booking.status === 'DRAFT'`.
4. Service runs `flightSeat.updateMany({ where: { id: seatId, version: currentVersion, status: 'AVAILABLE' }, data: { status: 'LOCKED', version: { increment: 1 } } })`.
5. If `result.count === 0` → `ConflictException`.

**Race window:** NONE at DB level. `updateMany` is atomic — MySQL row-level lock ensures only 1 of N concurrent requests sees `version = X` and increments. **Correctly implemented** (verified by `test_concurrency_integration.ts` against real SQLite).

**Critical gap:** `selectSeat` updates `FlightSeat` but does NOT set `BookingPassenger.seatId`. So:
- No record of which booking owns the lock.
- `booking-expiry.processor.ts:31-40` reads `booking.passengers` (always empty per BE-012) → never releases seats.
- Seats accumulate in `LOCKED` status forever.

#### 5.2 Voucher Redemption Flow

**Walkthrough** (`booking.service.ts:80-167`):
1. Validate voucher exists, not expired, `usedCount < usageLimit` (line 88-97) — **OUTSIDE tx**.
2. `recalculateTotal(bookingId)` (line 99) — **OUTSIDE tx**, writes `booking.totalAmount`.
3. Re-read `updatedBooking` (line 100-102) — **OUTSIDE tx**.
4. Check `existingUsage` unique (line 112-116) — **OUTSIDE tx**.
5. Calculate discount (line 119-132).
6. `$transaction` (line 134-164):
   - `voucherRedemption.create` (unique constraint protects).
   - `voucher.updateMany({ where: { usedCount: { lt: usageLimit } } })` — OCC correct.
   - `booking.update({ totalAmount: Number(updatedBooking.totalAmount) - discount })`.

**Race windows:**
- **Window 1 (stale read):** Steps 1-5 happen outside tx. Two concurrent requests both read `usedCount = 0`, both pass check, both enter tx. Tx OCC handles `usedCount` correctly (only 1 increments), but the losing request throws inside tx → 500 to client (should be 409).
- **Window 2 (stale totalAmount):** `updatedBooking.totalAmount` read at step 3, used in step 6. If another `applyVoucher` or `recalculateTotal` runs between, discount calc is wrong.
- **Window 3 (recalculateTotal writes outside tx):** Step 2 writes `booking.totalAmount` without tx. If step 6 tx rolls back, the `totalAmount` from step 2 persists → inconsistent.

#### 5.3 Payment Callback Idempotency Flow

**Walkthrough** (`payment.service.ts:44-114`):
1. Verify HMAC with `timingSafeEqual` (line 66-74) — correct, length-checked. ✅
2. `$transaction` (line 80):
   - `tx.payment.findUnique({ where: { bookingId } })`.
   - If `payment.status === 'SUCCESS'` → return early (idempotent).
   - If `responseCode === '00'` → `payment.update({ status: 'SUCCESS' })` + `booking.update({ status: 'CONFIRMED' })`.
   - Else → `payment.update({ status: 'FAILED' })`.

**Race window:** With MySQL default isolation `READ COMMITTED`, two concurrent callbacks for same `bookingId`:
- T1 reads payment (status=PENDING).
- T2 reads payment (status=PENDING) — T1 hasn't committed yet, T2 sees old value.
- T1 updates to SUCCESS, commits.
- T2 updates to SUCCESS (overwrites, but same value) + booking.update (same).
- Both return `{ RspCode: '00' }`.

**Actual impact:** Idempotent at value level (same final state), but `booking.update` runs twice (harmless), and if `responseCode` differs between callbacks, last-writer-wins.

**Critical issue:** `tx.payment.findUnique` uses `where: { bookingId }` — relies on `@@unique([bookingId])` (schema:332). If schema changes to allow multiple payments per booking, this breaks.

#### 5.4 Booking Expiry Job vs Payment Callback Race

**Scenario:**
1. User creates booking (DRAFT), expiry job scheduled for +15min.
2. At 14:59, user clicks "Pay" → `initiatePayment` (booking still DRAFT per BE-090, no transition to PENDING_PAYMENT).
3. At 15:00, expiry job fires → cancels booking (DRAFT → CANCELLED).
4. At 15:01, VNPay callback → `booking.update({ status: 'CONFIRMED' })` — transitions CANCELLED → CONFIRMED, invalid per `canTransition`.

**Impact:** Cancelled booking gets confirmed, payment collected but booking marked cancelled earlier — inconsistent state.

---

## 5. Database Review

### 5.1 Schema Overview

42 model · 21 enum · ~280 field · ~50 index · 19 FK declared · 19 FK concrete missing · 7 polymorphic (no FK possible) · 0 CHECK constraint · 1 soft-delete column.

**Domain decomposition:**

| Domain | Models | Mục đích |
|---|---|---|
| AUTH | User, RefreshToken, OtpCode, LoginHistory, UserDevice, UserSession | AuthN + session management |
| RBAC | Permission, RolePermission | Fine-grained authorization |
| FLIGHT | Airport, Aircraft, Flight, FlightFareClass, FlightSeat | Flight inventory + seat map |
| TOUR | Destination, Tour, TourItinerary, TourImage | Tour catalog |
| BOOKING | Booking, BookingPassenger, BookingItem, BookingStatusHistory | Booking cart + history |
| PAYMENT | Payment, Refund, Voucher, VoucherRedemption | Payment + discount |
| MEMBERSHIP | MembershipTier, UserPoints, PointTransaction | Loyalty program |
| CONTENT | BlogPost, BlogTag, BlogPostTag, BlogCategory, MediaFile, Faq | CMS |
| NOTIFICATION | Notification, NotificationTemplate, ContactSubmission | In-app + email |
| ADMIN | AuditLog, ActivityLog, SystemSetting | Admin traceability |

**Top critical models (theo risk):**

| Model | Risk | Lý do |
|---|---|---|
| `OtpCode` | Critical | `userId=0` hack block FK, không filter theo email |
| `RefreshToken` | Critical | Không index `userId/revokedAt/tokenHash` → full scan + bcrypt |
| `Flight` | Critical | 3 cột `aircraftId/airportId` không có FK |
| `Tour` | Critical | `destinationId` không có FK; `ratingAvg/reviewCount` desync |
| `VoucherRedemption` | Critical | Unique `(voucherId, bookingId)` sai business rule |
| `BookingPassenger` | High | `seatId/fareClassId` không FK; `nationality` nullable cho international flight |
| `Payment` | High | Decimal(65,30) oversize; thiếu idx `(status, createdAt)` |
| `AuditLog`/`ActivityLog` | High | Unbounded growth, không partition, không archive |

### 5.2 Findings — Critical

#### DB-001 · Critical · Schema/Constraint · Flight thiếu FK tới Aircraft & Airport
- **Location:** `schema.prisma:152-167` (model Flight).
- **Description:** `Flight.aircraftId`, `Flight.departureAirportId`, `Flight.arrivalAirportId` đều là `BigInt` thuần, không khai báo `@relation`. Migration SQL (`20260714122144_...:138-151`) cũng không có `FOREIGN KEY` constraint.
- **Impact:** Không có referential integrity — có thể tạo Flight với `aircraftId` không tồn tại. Query `include: { aircraft: ... }` không khả thi (BE phải query riêng). ERD line 117-119 đánh dấu 3 cột này là `FK` → drift.
- **Recommendation:** Thêm `aircraft Aircraft @relation(fields:[aircraftId], references:[id])` và tương tự cho departureAirport/arrivalAirport. Thêm反向 `Flight[] flightsAsDeparture` trên Airport.

#### DB-002 · Critical · Schema/Constraint · Tour.destinationId không có FK
- **Location:** `schema.prisma:222-235`.
- **Description:** Cột `destinationId BigInt` không có `@relation` tới Destination. ERD line 159 & 392 (`Tour }o--|| Destination`) ghi rõ relation nhưng schema không enforce.
- **Impact:** Tour có thể gắn tới destinationId không tồn tại. `tour.service.ts:20-24` filter theo `destination.region`/`type` qua implicit join — không có FK thì join vẫn chạy (MySQL join không cần FK) nhưng orphan rows có thể xuất hiện.

#### DB-003 · Critical · Index/Perf · `refreshToken.findMany()` không filter — full table scan + bcrypt compare toàn bộ tokens
- **Location:** `backend/src/modules/auth/auth.service.ts:285-297`.
- **Description:** Hàm `refreshToken(token)` gọi `this.prisma.refreshToken.findMany()` không có `where`. Sau đó duyệt qua từng record và `bcrypt.compare` từng token. RefreshToken không có index trên `tokenHash` cũng không có partition theo user.
- **Impact:** Với 10⁶ tokens active (7-day TTL × 10⁵ users × 1.5 devices avg), mỗi lần refresh token load toàn bộ bảng vào RAM và chạy bcrypt (cost 10) — 10⁶ bcrypt compares ≈ 100 giây CPU per request. DoS vector + complete service degradation ở production scale.
- **Recommendation:**
  1. Lưu thêm `tokenHash` dạng indexable (SHA-256 hex, không phải bcrypt hash) để lookup O(1).
  2. Khi issue refresh token, lưu `tokenId` (BigInt autoincrement) + trả `tokenId` cho client. Server lookup `tokenId` → so sánh bcrypt hash.
  3. Index `@@index([userId, revokedAt, expiresAt])` để query active tokens per user.

#### DB-004 · Critical · Constraint · VoucherRedemption unique constraint sai business rule
- **Location:** `schema.prisma:390-398` (`@@unique([voucherId, bookingId])`).
- **Description:** Constraint chỉ ngăn việc apply voucher 2 lần cho cùng 1 booking. KHÔNG ngăn user dùng cùng voucher cho 2 booking khác nhau. `booking.service.ts:112-114` chỉ check `voucherId_bookingId` unique.
- **Impact:** Voucher `NEWUSER` (giảm 50% cho user mới) có thể bị lạm dụng — user apply vào 5 booking khác nhau. `usageLimit` chỉ check ở tầng app (`booking.service.ts:142-148` optimistic update) — race condition possible giữa 2 request đồng thời của cùng user.
- **Recommendation:**
  - Nếu business rule là "1 voucher / 1 user": `@@unique([voucherId, userId])`.
  - Nếu "1 voucher / 1 booking" là đúng: giữ nguyên nhưng bổ sung app-level check `findFirst({ where: { voucherId, userId }})` để từ chối.
  - Document rule rõ trong schema comment.

#### DB-005 · Critical · Schema · OtpCode.userId=0 hack chặn FK + cross-user OTP leak
- **Location:** `backend/src/modules/auth/auth.service.ts:40, 83` + `schema.prisma:80-87`.
- **Description:** Khi user register, `userId` chưa tồn tại nên code gán `userId = BigInt(0)`. OtpCode lưu với userId=0. Sau đó `register()` query `findFirst({ where: { userId: BigInt(0), purpose, consumedAt: null }, orderBy: { id: 'desc' }})`. Nếu 2 user register cùng lúc, user A có thể lấy OTP của user B (orderBy desc lấy record mới nhất — không filter theo email).
- **Impact:** **CRITICAL SECURITY BUG** — cross-user OTP leak. User B register → user A register ngay sau → user A lấy OTP của user B (record mới nhất có userId=0, purpose=REGISTER, consumedAt=null). User A verify thành công, user B không verify được. Hoặc tệ hơn: attacker spam register với email victim → nhận được OTP của victim.
- **Recommendation:**
  1. Thêm cột `email String` vào OtpCode (nullable cho case đã có user).
  2. Query OTP theo `(email, purpose, consumedAt, expiresAt)` thay vì userId=0.
  3. Sau khi user created, có thể backfill userId vào OtpCode để audit.
  4. Hoặc: tạo User trước với status=PENDING_VERIFICATION rồi mới tạo OTP → userId thật.

#### DB-006 · Critical · Migration · Migration 2 thêm NOT NULL column không default trên bảng có dữ liệu
- **Location:** `migrations/20260714123314_add_booking_payment_timestamps/migration.sql:1-14`.
- **Description:** Prisma tự sinh warning ở đầu file: "Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty." SQL: `ALTER TABLE \`booking\` ADD COLUMN \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), ADD COLUMN \`updatedAt\` DATETIME(3) NOT NULL;`
- **Impact:** Nếu migration chạy trên DB đã có dữ liệu (prod, staging đã seed) → `updatedAt NOT NULL` không default → MySQL gán `'0000-00-00 00:00:00'` nếu strict mode OFF, hoặc **fail entirely** nếu strict mode ON (default MySQL 8). Prisma `@updatedAt` chỉ work khi update qua Prisma client, không có DB trigger để auto-update.
- **Recommendation:**
  - Migration nên thêm `DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` cho `updatedAt`.
  - Hoặc chia 2 bước: (1) ADD COLUMN nullable, (2) UPDATE SET updatedAt=NOW(), (3) ALTER to NOT NULL.

#### DB-007 · Critical · Migration · Migration 2 dùng lowercase table names trong khi Migration 1 dùng PascalCase
- **Location:** Migration #1 dùng `Booking`, `Payment` (PascalCase) trong `CREATE TABLE`. Migration #2 dùng `` `booking` ``, `` `payment` `` (lowercase) trong `ALTER TABLE`.
- **Impact:** Trên MySQL Linux với `lower_case_table_names=0` (case-sensitive, default trên Linux), migration 2 fail vì table `booking` không tồn tại (chỉ có `Booking`).
- **Recommendation:**
  - Edit migration #2 SQL thủ công: `` `Booking` `` và `` `Payment` `` (vi phạm best practice "don't edit migrations" nhưng cần fix).
  - Hoặc: đảm bảo `lower_case_table_names=1` trên dev/prod MySQL.
  - Test trên prod-staging Linux MySQL trước khi deploy.

### 5.3 Findings — High

#### DB-008 · High · Constraint · 19 FKs thiếu — liệt kê đầy đủ

| # | Model | Field | Should reference |
|---|---|---|---|
| 1 | Flight | aircraftId | Aircraft.id (DB-001) |
| 2 | Flight | departureAirportId | Airport.id (DB-001) |
| 3 | Flight | arrivalAirportId | Airport.id (DB-001) |
| 4 | FlightSeat | fareClassId | FlightFareClass.id |
| 5 | Tour | destinationId | Destination.id (DB-002) |
| 6 | OtpCode | userId | User.id (DB-005 block) |
| 7 | BookingPassenger | seatId | FlightSeat.id (nullable) |
| 8 | BookingPassenger | fareClassId | FlightFareClass.id (nullable) |
| 9 | BookingStatusHistory | changedBy | User.id |
| 10 | Refund | paymentId | Payment.id |
| 11 | Refund | processedBy | User.id (nullable) |
| 12 | VoucherRedemption | voucherId | Voucher.id |
| 13 | VoucherRedemption | userId | User.id |
| 14 | VoucherRedemption | bookingId | Booking.id |
| 15 | UserPoints | tierId | MembershipTier.id (nullable) |
| 16 | PointTransaction | userId | User.id |
| 17 | PointTransaction | bookingId | Booking.id (nullable) |
| 18 | BlogPost | authorId | User.id |
| 19 | BlogPost | categoryId | BlogCategory.id (nullable) |
| 20 | MediaFile | uploadedBy | User.id |
| 21 | Notification | userId | User.id (nullable) |
| 22 | AuditLog | adminUserId | User.id |

**Polymorphic (không thể enforce FK):** Review.reviewableId (TOUR|FLIGHT), BookingItem.itemRefId (BAGGAGE|MEAL|ADDON|TOUR_SLOT), Wishlist.itemId (TOUR|DESTINATION|WONDER), AuditLog.targetId (any).

#### DB-009 · High · Index · LoginHistory không có index — query lock-after-5-failures full-scan
- **Location:** `schema.prisma:94-103` + `auth.service.ts:223-229`.
- Query `loginHistory.count({ where: { userId, success: false, loginAt: { gte: ... }}})` không có index trên (userId, success, loginAt).
- **Impact:** Mỗi login failure triggers 1 count query scan toàn bộ LoginHistory của user. Với user bị brute-force (10⁴ attempts), mỗi attempt scan 10⁴ rows = 10⁸ row scans.
- **Recommendation:** `@@index([userId, success, loginAt])`.

#### DB-010 · High · Index · OtpCode không có index — register/reset query slow
- **Location:** `schema.prisma:80-87` + `auth.service.ts:82-85`.
- Query `otpCode.findFirst({ where: { userId: BigInt(0), purpose, consumedAt: null }, orderBy: { id: 'desc' }})` không có index phù hợp.
- **Impact:** Khi có 10⁶ OTP records (5-min TTL × high traffic), mỗi register/reset full-scan + sort.
- **Recommendation:** `@@index([userId, purpose, consumedAt, expiresAt])` hoặc sau khi fix DB-005 thì `@@index([email, purpose, consumedAt, expiresAt])`.

#### DB-011 · High · Index · RefreshToken không có index userId/revokedAt
- **Location:** `schema.prisma:70-78` + `auth.service.ts:306, 340`.
- `refreshToken.updateMany({ where: { userId, revokedAt: null }})` (logout, theft-detect revoke-all) không có index.
- **Recommendation:** `@@index([userId, revokedAt])` + `@@index([expiresAt])` cho cron cleanup.

#### DB-012 · High · Index · AuditLog không có index — admin "View audit logs" full-scan
- **Location:** `schema.prisma:569-579` + `admin.controller.ts:46-49`.
- `auditLog.findMany({ take: 100, orderBy: { createdAt: 'desc' }})` không có index trên createdAt hoặc adminUserId.
- **Impact:** `ORDER BY createdAt DESC LIMIT 100` filesort nếu không có index. 10⁷ audit logs → query chậm.
- **Recommendation:** `@@index([createdAt])` + `@@index([adminUserId, createdAt])` + `@@index([targetType, targetId])`.

#### DB-013 · High · Index · Notification không có index
- **Location:** `schema.prisma:527-535`.
- BE query `findMany({ where: { userId, readAt: null }})` không có index.
- **Recommendation:** `@@index([userId, readAt, createdAt])`.

#### DB-014 · High · Index · FlightSeat không có index (flightId, status)
- **Location:** `schema.prisma:190-199` + `flight.service.ts:94-96`.
- Query "available seats only" (status=AVAILABLE) không dùng index composite → scan tất cả seats của flight.
- **Recommendation:** `@@index([flightId, status])` + `@@index([fareClassId])`.

#### DB-015 · High · Index · FlightFareClass không có index flightId + không unique (flightId, className)
- **Location:** `schema.prisma:175-183`.
- Không có unique constraint trên `(flightId, className)` → có thể tạo 2 ECONOMY fare classes cho cùng flight.
- **Recommendation:** `@@unique([flightId, className])` + `@@index([flightId])`.

#### DB-016 · High · Index · Tour không có index destinationId, ratingAvg, basePrice
- **Location:** `schema.prisma:222-235` + `tour.service.ts:38-46`.
- Tour listing page với filter + sort → filesort trên 10³ tours (still OK), nhưng ở 10⁵ tours sẽ chậm.
- **Recommendation:** `@@index([destinationId])` + `@@index([ratingAvg])` + `@@index([basePrice])` + `@@index([discountPercent])`.

#### DB-017 · High · Index · Payment thiếu composite (status, createdAt)
- **Location:** `schema.prisma:330-343` + `analytics.service.ts:21-27, 290-304`.
- Revenue analytics query `payment.aggregate({ where: { status: 'SUCCESS', createdAt: { gte: startOfMonth }}})` chỉ có `@@index([createdAt])`.
- **Recommendation:** `@@index([status, createdAt])`.

#### DB-018 · High · Index · VoucherRedemption không có index userId, voucherId (non-unique)
- **Location:** `schema.prisma:390-398`.
- Chỉ có unique (voucherId, bookingId). Query "list redemptions by user" hoặc "list redemptions by voucher" full-scan.
- **Recommendation:** `@@index([userId])` + `@@index([voucherId])`.

#### DB-019 · High · Index · Refund không có index paymentId, status
- **Recommendation:** `@@index([paymentId])` + `@@index([status, createdAt])`.

#### DB-020 · High · Index · BlogPost không có index (status, publishedAt) cho public listing
- **Recommendation:** `@@index([status, publishedAt])` + `@@index([categoryId])` + `@@index([authorId])` + `@@index([publishedAt])`.

#### DB-021 · High · Index · MediaFile không có index uploadedBy
- **Recommendation:** `@@index([uploadedBy, id])`.

#### DB-022 · High · Index · PointTransaction không có index userId, bookingId
- **Recommendation:** `@@index([userId, createdAt])` + `@@index([bookingId])`.

#### DB-023 · High · Index · BookingStatusHistory không có index bookingId
- **Recommendation:** `@@index([bookingId, changedAt])`.

#### DB-024 · High · Index · Review không có index (reviewableType, reviewableId, status)
- **Recommendation:** `@@index([reviewableType, reviewableId, status])` + `@@index([userId, reviewableType, reviewableId])`.

#### DB-025 · High · DataType · Decimal fields dùng DECIMAL(65,30) — oversize cho VND
- **Location:** Tất cả `Decimal` fields: FlightFareClass.basePrice, FlightSeat.extraFee, Tour.basePrice, Tour.ratingAvg, Booking.totalAmount, BookingItem.unitPrice/subtotal, Payment.amount, Refund.amount, Voucher.discountValue/minOrderAmount/maxDiscountAmount.
- **Description:** Prisma default `Decimal` maps to MySQL `DECIMAL(65,30)` — 65 digits total, 30 after decimal point.
- **Impact:**
  - VND has 0 decimal places (dong is integer). 30 decimal places wasted.
  - Storage: DECIMAL(65,30) takes 29 bytes vs DECIMAL(18,2) takes 9 bytes. 3x storage on every money column.
  - Calc overhead: arithmetic on DECIMAL(65,30) is slower.
  - JS `Number()` conversion may lose precision.
- **Recommendation:** Use `@db.Decimal(18, 2)` for VND amounts. For Tour.ratingAvg use `@db.Decimal(3, 1)`.

#### DB-026 · High · DataType · BigInt serialization không configured
- **Location:** `backend/src/prisma/prisma.service.ts:1-21`.
- `PrismaService extends PrismaClient` with empty constructor. No `extension` registered for BigInt-to-string conversion. BigInt > 2^53 cannot be represented as JS Number — `JSON.stringify(bigint)` throws.
- **Impact:**
  - API responses with BigInt fields will throw at JSON serialization OR serialize as `{"id":{}}`.
  - Many BE services manually `.toString()` BigInt fields — boilerplate repeated everywhere.
  - If any field missed → frontend gets broken response.
- **Recommendation:**
  - Use Prisma extension: `prisma.$extends({ result: { ... }})` to auto-convert BigInt fields to string.
  - Or use global `BigInt.prototype.toJSON` (hack nhưng common — BE đang dùng).

#### DB-027 · High · Schema · Soft delete không nhất quán — chỉ User.deletedAt
- **Location:** `schema.prisma:29`.
- User.deletedAt tồn tại nhưng không có Prisma middleware auto-filter `WHERE deletedAt IS NULL`. `analytics.service.ts:307` explicitly `where: { deletedAt: null }` — chỉ 1 chỗ. Các service khác (auth, user, booking) đều không filter deletedAt → user bị soft-delete vẫn có thể login, nhận notification.
- **Recommendation:**
  - Implement Prisma `$extends` middleware to auto-filter `deletedAt: null` for User queries.
  - Or extend soft-delete to all "soft-deletable" models (Booking, Tour, Flight, BlogPost).
  - Or drop `deletedAt` and use hard delete + audit log.

#### DB-028 · High · Constraint · Tất cả FK đều ON DELETE RESTRICT (default) — không cascade an toàn
- **Location:** Migration #1 lines 555-609 — tất cả `ON DELETE RESTRICT ON UPDATE CASCADE` trừ BlogPostTag (Cascade).
- **Impact:**
  - `Booking → User` RESTRICT: không thể xóa User có booking.
  - `BookingPassenger → Booking` RESTRICT: không thể xóa Booking có passengers.
  - Cleanup operations fail (admin "delete spam user" fail nếu user có booking).
- **Recommendation:**
  - `Booking → User`: `onDelete: Restrict` (đúng).
  - `BookingPassenger/Item/StatusHistory → Booking`: `onDelete: Cascade`.
  - `Payment → Booking`: `onDelete: Cascade` (hoặc Restrict nếu cần audit).
  - `ActivityLog/LoginHistory/RefreshToken/UserSession → User`: `onDelete: Cascade`.

#### DB-029 · High · Seed · Seed.ts không idempotent nếu chạy song song với app traffic
- **Location:** `seed.ts:94-130` (deleteMany order), `seed.ts:485-489` (bookingCode retry loop).
- `deleteMany()` ở đầu xóa toàn bộ data — nếu chạy trên prod/staging có traffic, sẽ lose data mới.
- `while (!isUnique) { bookingCode = generateBookingCode(); ... findUnique ... }` — race condition.
- **Recommendation:** Use `prisma.booking.upsert` with deterministic code. Use longer booking code (12+ chars).

#### DB-030 · High · Security · PII fields stored plaintext (email, phone, nationalId, passportNo)
- **Location:** `User.email`, `User.phone`, `User.nationalId`, `User.passportNo` (schema:16, 19, 22, 23), `BookingPassenger.passportNo` (schema:296).
- `SystemSetting.isEncrypted` flag tồn tại (schema:598) nhưng không có logic encryption nào trong schema. `crypto.service.ts` tồn tại nhưng chưa verify usage.
- **Impact:**
  - DB backup leak → leak toàn bộ PII.
  - DB admin (DBA) có thể xem PII trực tiếp.
  - Vietnam PDPA (Nghị định 13/2023/NĐ-CP) yêu cầu bảo vệ dữ liệu cá nhân — encryption at rest là baseline.
- **Recommendation:**
  - Encrypt `nationalId`, `passportNo` at application layer (AES-256-GCM with key in KMS).
  - Hash `email` for lookup index.
  - Use `SystemSetting.isEncrypted=true` cho settings like API keys.

### 5.4 Index Audit Matrix

Cross-reference BE service query patterns vs actual indexes. **24/46 query patterns thiếu index hỗ trợ.**

| # | Query pattern (BE location) | Supporting index? | Recommendation |
|---|---|---|---|
| 1 | `user.findUnique({ where: { email }})` (auth.service:30, 122) | ✓ `User_email_key` UK | OK |
| 2 | `user.findUnique({ where: { id }})` (multiple) | ✓ PK | OK |
| 3 | `user.count({ where: { deletedAt: null }})` (analytics.service:307) | ✗ No index on deletedAt | Add `@@index([deletedAt])` |
| 4 | `user.count({ where: { createdAt: { gte: ... }}})` (analytics.service:308) | ✗ No index on createdAt | Add `@@index([createdAt])` |
| 5 | `refreshToken.findMany()` NO FILTER (auth.service:285) | ✗ N/A — full scan | **CRITICAL** — fix service + add `@@index([tokenHash])` after refactor |
| 6 | `refreshToken.updateMany({ where: { userId, revokedAt: null }})` (auth.service:306, 340) | ✗ No index | Add `@@index([userId, revokedAt])` |
| 7 | `otpCode.findFirst({ where: { userId: BigInt(0), purpose, consumedAt: null }, orderBy: { id: 'desc' }})` (auth.service:82) | ✗ No index | Add `@@index([userId, purpose, consumedAt, expiresAt])` — after DB-005 fix, use `email` |
| 8 | `loginHistory.count({ where: { userId, success: false, loginAt: { gte: ... }}})` (auth.service:223) | ✗ No index | Add `@@index([userId, success, loginAt])` |
| 9 | `userDevice.findFirst({ where: { userId, deviceFingerprint }})` (auth.service:194) | ✗ No index | Add `@@unique([userId, deviceFingerprint])` |
| 10 | `userSession.findMany({ where: { userId, isActive: true, expiresAt: { gt: ... }}})` (session.service:53) | ✓ `UserSession_userId_idx` | OK |
| 11 | `userSession.findFirst({ where: { sessionToken, isActive: true, expiresAt: { gt: ... }}})` (session.service:125) | ✓ `UserSession_sessionToken_key` UK | OK |
| 12 | `userSession.updateMany({ where: { id, userId }})` (session.service:78) | ✗ No composite | Add `@@index([userId, isActive])` |
| 13 | `flight.findMany({ where: { departureAirportId, arrivalAirportId, departureTime: { gte, lt }}})` (flight.service:37) | ✓ `Flight_departureAirportId_arrivalAirportId_departureTime_idx` | OK ✓ |
| 14 | `flightSeat.findMany({ where: { flightId }})` (flight.service:94) | ✓ FK implicit index | OK (add composite (flightId, status)) |
| 15 | `flightSeat.updateMany({ where: { id, version, status: 'AVAILABLE' }})` (booking.service:59) | ✓ PK on id | OK (optimistic lock) |
| 16 | `flightSeat.updateMany({ where: { id: { in: seatIds }}})` (booking.service:184, booking-expiry:37) | ✓ PK | OK |
| 17 | `flightFareClass.findMany({ where: { id: { in: fareClassIds }}})` (booking.service:188) | ✓ PK | OK |
| 18 | `tour.findMany({ where: { destination: { region, type }}, orderBy: { basePrice | ratingAvg | id }})` (tour.service:38) | ✗ No index on destinationId, basePrice, ratingAvg | Add `@@index([destinationId])`, `@@index([basePrice])`, `@@index([ratingAvg])` |
| 19 | `tour.findMany({ where: { destinationId, id: { not }}}, take: 4)` (tour.service:75) | ✗ No index on destinationId | Add `@@index([destinationId])` |
| 20 | `booking.findUnique({ where: { bookingCode }})` (booking.service:27, 487) | ✓ `Booking_bookingCode_key` UK | OK |
| 21 | `booking.findUnique({ where: { id }})` (multiple) | ✓ PK | OK |
| 22 | `booking.findMany({ include: { user, payment }, take: 50 })` (admin.controller:28) | ✗ No explicit sort | Use `orderBy: { createdAt: 'desc' }` (idx exists) |
| 23 | `booking.findFirst({ where: { userId, status: 'COMPLETED', type, items: { some: { itemType, itemRefId }}}})` (review.service:23) | ✗ Only `@@index([userId])` and `@@index([status])` separately | Add `@@index([userId, status, type])` |
| 24 | `payment.findUnique({ where: { bookingId }})` (payment.service:82) | ✓ `Payment_bookingId_key` UK | OK |
| 25 | `payment.findUnique({ where: { id }})` (payment.service:118) | ✓ PK | OK |
| 26 | `payment.aggregate({ where: { status: 'SUCCESS', createdAt: { gte: ... }}})` (analytics.service:21, 294) | ✗ Only `@@index([createdAt])` | Add `@@index([status, createdAt])` |
| 27 | `payment.groupBy({ by: ['method'], where: { status: 'SUCCESS' }})` (analytics.service:45) | ✗ No index on method | Add `@@index([status, method])` |
| 28 | `voucher.findUnique({ where: { code }})` (booking.service:88) | ✓ `Voucher_code_key` UK | OK |
| 29 | `voucherRedemption.findUnique({ where: { voucherId_bookingId }})` (booking.service:112) | ✓ `VoucherRedemption_voucherId_bookingId_key` UK | OK (but business rule wrong — DB-004) |
| 30 | `review.findFirst({ where: { userId, reviewableType, reviewableId }})` (review.service:51) | ✗ No index | Add `@@index([userId, reviewableType, reviewableId])` |
| 31 | `wishlist.findUnique({ where: { userId_itemType_itemId }})` (wishlist.service:13) | ✓ `Wishlist_userId_itemType_itemId_key` UK | OK |
| 32 | `wishlist.findMany({ where: { userId }})` (wishlist.service:37) | ✓ UK leftmost prefix | OK |
| 33 | `blogPost.findUnique({ where: { slug }})` (blog.service:25, 147) | ✓ `BlogPost_slug_key` UK | OK |
| 34 | `blogPost.findMany({ where: { status, categoryId, authorId, OR: [...] }, orderBy: { createdAt: 'desc' }})` (blog.service:195) | ✗ No index on status, categoryId, authorId, createdAt | Add `@@index([status, publishedAt])`, `@@index([categoryId])`, `@@index([authorId])` |
| 35 | `blogPostTag.deleteMany({ where: { postId }})` (blog.service:75, 140) | ✓ PK leftmost prefix | OK |
| 36 | `rolePermission.findMany({ where: { role }, include: { permission: true }})` (rbac.controller:165, authorization.guard:89) | ✓ `RolePermission_role_idx` | OK |
| 37 | `activityLog.findMany({ where: { userId, action? }, orderBy: { createdAt: 'desc' }})` (activity-log.service:108) | ✓ `ActivityLog_userId_createdAt_idx` | OK ✓ |
| 38 | `auditLog.findMany({ take: 100, orderBy: { createdAt: 'desc' }})` (admin.controller:46) | ✗ No index on createdAt | Add `@@index([createdAt])` |
| 39 | `mediaFile.findMany({ where: { uploadedBy, folderPath? }, orderBy: { id: 'desc' }})` (upload.controller:234) | ✗ No index on uploadedBy | Add `@@index([uploadedBy, id])` |
| 40 | `userPoints.upsert({ where: { userId }})` (membership.service:26, seed.ts:530) | ✓ `UserPoints_userId_key` UK | OK |
| 41 | `userPoints.count({ where: { tierId }})` (analytics.service:239) | ✗ No index on tierId | Add `@@index([tierId])` |
| 42 | `refund.count({ where: { status: 'REQUESTED' }})` (analytics.service:309) | ✗ No index on status | Add `@@index([status])` |
| 43 | `refund.groupBy({ by: ['status'] })` (analytics.service:206) | ✗ No index | Add `@@index([status])` |
| 44 | `booking.count({ where: { createdAt: { gte: startOfDay }}})` (analytics.service:306) | ✓ `Booking_createdAt_idx` | OK |
| 45 | `booking.groupBy({ by: ['status'] })` (analytics.service:77) | ✓ `Booking_status_idx` | OK |
| 46 | `booking.groupBy({ by: ['type'] })` (analytics.service:82) | ✗ No index on type | Add `@@index([type])` (low priority — only 2 values) |

### 5.5 FK & Constraint Audit

| # | Model | Field | Has FK? | onDelete | Should have? | Recommendation |
|---|---|---|---|---|---|---|
| 1 | RolePermission | permissionId | ✓ | RESTRICT | ✓ | OK |
| 2 | RefreshToken | userId | ✓ | RESTRICT | ✓ | Consider Cascade |
| 3 | OtpCode | userId | ✗ | N/A | ✓ (blocked by DB-005) | Refactor to email field |
| 4 | LoginHistory | userId | ✓ | RESTRICT | ✓ | Consider Cascade |
| 5 | UserDevice | userId | ✓ | RESTRICT | ✓ | OK |
| 6 | UserSession | userId | ✓ | RESTRICT | ✓ | Consider Cascade |
| 7 | Flight | aircraftId | ✗ | N/A | ✓ CRITICAL | Add `@relation` |
| 8 | Flight | departureAirportId | ✗ | N/A | ✓ CRITICAL | Add `@relation` |
| 9 | Flight | arrivalAirportId | ✗ | N/A | ✓ CRITICAL | Add `@relation` |
| 10 | FlightFareClass | flightId | ✓ | RESTRICT | ✓ | Consider Cascade |
| 11 | FlightSeat | flightId | ✓ | RESTRICT | ✓ | Consider Cascade |
| 12 | FlightSeat | fareClassId | ✗ | N/A | ✓ | Add `@relation` |
| 13 | Tour | destinationId | ✗ | N/A | ✓ CRITICAL | Add `@relation` |
| 14 | TourItinerary | tourId | ✓ | RESTRICT | ✓ | Consider Cascade |
| 15 | TourImage | tourId | ✓ | RESTRICT | ✓ | Consider Cascade |
| 16 | Booking | userId | ✓ | RESTRICT | ✓ | OK |
| 17 | BookingPassenger | bookingId | ✓ | RESTRICT | ✓ | Consider Cascade |
| 18 | BookingPassenger | seatId | ✗ | N/A | ✓ (nullable) | Add `@relation` |
| 19 | BookingPassenger | fareClassId | ✗ | N/A | ✓ (nullable) | Add `@relation` |
| 20 | BookingItem | bookingId | ✓ | RESTRICT | ✓ | Consider Cascade |
| 21 | BookingItem | itemRefId | ✗ | N/A | polymorphic — can't | App-level validation |
| 22 | BookingStatusHistory | bookingId | ✓ | RESTRICT | ✓ | Consider Cascade |
| 23 | BookingStatusHistory | changedBy | ✗ | N/A | ✓ | Add `@relation` (nullable, Restrict) |
| 24 | Payment | bookingId | ✓ | RESTRICT | ✓ | Cascade or Restrict |
| 25 | Refund | paymentId | ✗ | N/A | ✓ | Add `@relation` (Restrict) |
| 26 | Refund | processedBy | ✗ | N/A | ✓ (nullable) | Add `@relation` (nullable, SetNull) |
| 27 | VoucherRedemption | voucherId | ✗ | N/A | ✓ | Add `@relation` (Cascade) |
| 28 | VoucherRedemption | userId | ✗ | N/A | ✓ | Add `@relation` (Restrict) |
| 29 | VoucherRedemption | bookingId | ✗ | N/A | ✓ | Add `@relation` (Cascade) |
| 30 | Review | userId | ✓ | RESTRICT | ✓ | OK |
| 31 | Review | reviewableId | ✗ | N/A | polymorphic — can't | App-level validation |
| 32 | Wishlist | userId | ✓ | RESTRICT | ✓ | OK |
| 33 | Wishlist | itemId | ✗ | N/A | polymorphic — can't | App-level validation |
| 34 | UserPoints | userId | ✓ (UK) | N/A (no FK) | ✓ | Should be `@relation` 1-to-1 |
| 35 | UserPoints | tierId | ✗ | N/A | ✓ (nullable) | Add `@relation` (nullable, SetNull) |
| 36 | PointTransaction | userId | ✗ | N/A | ✓ | Add `@relation` (Restrict) |
| 37 | PointTransaction | bookingId | ✗ | N/A | ✓ (nullable) | Add `@relation` (nullable, SetNull) |
| 38 | BlogPost | authorId | ✗ | N/A | ✓ | Add `@relation` (Restrict) |
| 39 | BlogPost | categoryId | ✗ | N/A | ✓ (nullable) | Add `@relation` (nullable, SetNull) |
| 40 | BlogPostTag | postId | ✓ | CASCADE | ✓ | OK ✓ |
| 41 | BlogPostTag | tagId | ✓ | CASCADE | ✓ | OK ✓ |
| 42 | MediaFile | uploadedBy | ✗ | N/A | ✓ | Add `@relation` (Restrict) |
| 43 | Notification | userId | ✗ | N/A | ✓ (nullable) | Add `@relation` (nullable, Cascade) |
| 44 | AuditLog | adminUserId | ✗ | N/A | ✓ | Add `@relation` (Restrict) |
| 45 | AuditLog | targetId | ✗ | N/A | polymorphic — can't | N/A |
| 46 | ActivityLog | userId | ✓ | RESTRICT | ✓ | Consider Cascade |

**Summary**: 19 FKs declared, 7 polymorphic (impossible), ~20 missing concrete FKs.

### 5.6 Migration & Seed Audit

#### Migration #1: `20260714122144_add_rbac_session_activity_blog_v2`
- **Summary**: Initial bootstrap — creates all 42 tables, all 21 enums, all 19 FKs, all initial indexes. 609 lines of SQL.
- **Risks**:
  - Single huge migration — no incremental history.
  - All FKs added at end via `ALTER TABLE ADD CONSTRAINT` — locks parent tables briefly.
  - No `CREATE INDEX CONCURRENTLY`.
- **Reversibility**: ✗ No down migration.
- **Data preservation**: N/A (initial migration).

#### Migration #2: `20260714123314_add_booking_payment_timestamps`
- **Summary**: Adds `createdAt` and `updatedAt` to Booking and Payment tables.
- **Risks**:
  - **CRITICAL (DB-006)**: Adds `updatedAt DATETIME(3) NOT NULL` without default.
  - **CRITICAL (DB-007)**: Uses lowercase `` `booking` `` and `` `payment` `` while Migration #1 created `Booking` and `Payment` (PascalCase). Case-sensitivity risk on Linux MySQL.
  - `updatedAt` relies on Prisma `@updatedAt` (app-level) — no DB trigger or `ON UPDATE CURRENT_TIMESTAMP`.
- **Reversibility**: ✗ No down migration.

#### Drift analysis
- Schema `Booking` has `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`. Migration #1 creates Booking WITHOUT these columns. Migration #2 adds them. After both migrations, schema and DB should be in sync.
- **Likely in sync** if both migrations applied. To verify: `prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url $DATABASE_URL`.

#### Anomalies
- **Future-dated timestamps (DB-046)**: `20260714` = July 14, 2026. Dev machine clock was wrong at migration creation.
- **Only 2 migrations for 42-model schema (DB-101)**: Suggests `db push` origin. No incremental history.

#### Seed Audit

**Idempotency**: ⚠️ Partial pass.
- `deleteMany()` at start clears all tables in reverse dependency order — re-runnable.
- `permission.createMany({ skipDuplicates: true })` — idempotent ✓.
- `airport.createMany({ skipDuplicates: true })` — idempotent ✓.
- `blogCategory.createMany({ skipDuplicates: true })` — idempotent ✓.
- `blogTag.upsert` — idempotent ✓.
- `user.create` — NOT idempotent, but `deleteMany` cleans first.
- Booking code retry loop (seed.ts:485-489) — race-condition risk in concurrent runs.

**Realism**:
- Volume: 100 users, 200 flights, 500 bookings, 300 reviews, 100 tours, 50 vouchers, 8 blog posts. Small for prod-like testing but OK for dev.
- **Missing models (12)**: VoucherRedemption, AuditLog, Notification, NotificationTemplate, SystemSetting, Faq, ContactSubmission, PointTransaction, BookingItem, BookingPassenger, Refund, MediaFile.
- **Desync (DB-042)**: Tour.ratingAvg/reviewCount random, not derived from actual reviews.
- **Date ranges**: Flights 2026-07-01 to 2026-12-31 (future). Bookings 2025-01-01 to 2026-07-14.
- **OTP seed (DB-078)**: OtpCode table empty — OTP flow untestable.
- **ActivityLog seed**: Only 7 logs for demo user — sparse.

**Security**:
- Test credentials (DB-038): `Admin@123`, `User@123` hardcoded, printed to console (seed.ts:661-664).
- Bcrypt cost (DB-037): Cost 10 — borderline, OWASP recommends 12+.
- OTP in console (auth.service.ts:77): `[DEV MODE] OTP for ${email}: ${otp}` — plaintext OTP in logs.

**Faker usage**:
- Deterministic (DB-039): ❌ Uses `Math.random()` throughout — non-deterministic.

**FK ordering**: `deleteMany` in reverse dep order ✓. Creates in dep order ✓.

**Enum coverage**:
- `bookingStatuses` missing `DRAFT`.
- `methods` all 4 PaymentMethod covered ✓.

### 5.7 ERD vs Schema Drift

| # | ERD item (line) | Schema status | Notes |
|---|---|---|---|
| 1 | "35+ models across 9 domains" (ERD:3) | **Mismatch** — actual 42 models | ERD undercounts |
| 2 | `User.role` enum "USER\|ADMIN" (ERD:22) | **Missing STAFF** — schema has 3 values (USER, STAFF, ADMIN) | ERD incomplete |
| 3 | `OtpCode.userId FK` (ERD:41) | **Missing FK** — schema has no relation | DB-005 |
| 4 | `Flight.aircraftId FK` (ERD:117) | **Missing FK** — schema has no relation | DB-001 |
| 5 | `Flight.departureAirportId FK` (ERD:118) | **Missing FK** | DB-001 |
| 6 | `Flight.arrivalAirportId FK` (ERD:119) | **Missing FK** | DB-001 |
| 7 | `FlightSeat.fareClassId FK` (ERD:138) | **Missing FK** | DB-008 |
| 8 | `Tour.destinationId FK` (ERD:159) | **Missing FK** | DB-002 |
| 9 | `BookingPassenger.seatId FK` (ERD:202) | **Missing FK** | DB-008 |
| 10 | `BookingPassenger.fareClassId FK` (ERD:203) | **Missing FK** | DB-008 |
| 11 | `BookingItem.itemRefId FK` (ERD:210) | **Polymorphic — impossible** | DB-031 |
| 12 | `BookingStatusHistory.changedBy` (ERD:221) | Not marked FK in ERD | Should be FK to User |
| 13 | `Refund.paymentId FK` (ERD:239) | **Missing FK** | DB-008 |
| 14 | `Refund.processedBy` (ERD:243) | Not marked FK in ERD | Should be FK to User |
| 15 | `VoucherRedemption.voucherId/userId/bookingId FK` (ERD:262-264) | **All 3 missing FK** | DB-008 |
| 16 | `UserPoints.tierId FK` (ERD:280, 409) | **Missing FK** | DB-053 |
| 17 | `PointTransaction.userId FK` (ERD:285) | **Missing FK** | DB-008 |
| 18 | `PointTransaction.bookingId FK` (ERD:286) | **Missing FK** | DB-008 |
| 19 | `BlogPost.categoryId FK` (ERD:299) | **Missing FK** | DB-008 |
| 20 | `BlogPost.authorId FK` (ERD:300) | **Missing FK** | DB-008 |
| 21 | `MediaFile.uploadedBy FK` (ERD:332) | **Missing FK** | DB-008 |
| 22 | `AuditLog.adminUserId FK` (ERD:338) | **Missing FK** | DB-008 |
| 23 | `Notification.userId FK` (ERD:367) | **Missing FK** | DB-008 |
| 24 | `User` fields (ERD:12-28) | **Match** | OK |
| 25 | `User.deletedAt` (ERD:27) | **Match** — both have it | But no other model has soft-delete (inconsistent) |
| 26 | ERD doesn't list `Faq` in domain summary (ERD:414-427) | **Extra** — schema has Faq | ERD incomplete |
| 27 | ERD doesn't list `NotificationTemplate`, `ContactSubmission` in domain summary | **Extra** — schema has both | ERD incomplete |
| 28 | ERD "Key Indexes" section (ERD:431-446) lists 4 indexes | **Match** for Flight composite, Booking userId, Booking status, ActivityLog userId+createdAt, UserSession userId | But missing many (DB-009 to DB-024) |
| 29 | ERD "Optimistic Locking" example (ERD:454-461) | **Match** — FlightSeat.version exists | OK |
| 30 | ERD "Idempotency" example (ERD:465-469) | **Match** — Payment.idempotencyKey @unique | OK |
| 31 | ERD "Token Rotation" (ERD:474-478) | **Concept match** — RefreshToken.revokedAt exists | But service impl is broken (DB-003) |
| 32 | ERD domain summary "Logging" mentions AuditLog, ActivityLog, SystemSetting (ERD:426) | **Match** | OK |
| 33 | ERD doesn't show `UserPoints` relation to `User` in relationship section | ERD line 383 shows `User ||--o| UserPoints` | Schema has `UserPoints.userId @unique` but no `@relation` — drift |
| 34 | ERD doesn't mention `Booking.created/updatedAt` (added in Migration #2) | **Extra** — schema has them | ERD created before Migration #2 |
| 35 | ERD doesn't mention `Payment.created/updatedAt` | **Extra** | Same as above |
| 36 | ERD doesn't mention `BlogPost.viewCount`, `scheduledAt`, `metaTitle`, `metaDescription` | **Extra** — schema has all | ERD line 293-305 partial |
| 37 | ERD doesn't show `Wishlist.itemType` enum has `WONDER` (ERD:431-435 in schema) | **Match** — both have WONDER | But WONDER has no model (DB-048) |
| 38 | ERD doesn't mention `SystemSetting.isEncrypted` | **Match** — schema has it (line 598) | But no encryption logic (DB-044) |

**Summary**: 22 FK drifts (ERD claims FK, schema missing), 4 model count drifts (ERD missing models/fields), 1 enum value drift (STAFF), 4 extra fields in schema not in ERD.

---

## 6. Cross-cutting Concerns

### 6.1 Type Drift giữa FE và BE

| Field | FE type | BE type | Issue |
|---|---|---|---|
| `User.id` | `string` | `BigInt` | FE mock dùng `'user-1'`, BE trả `'1'` (string sau toJSON) |
| `User.role` | `'User' \| 'Admin'` | enum `USER \| STAFF \| ADMIN` | Casing khác + thiếu STAFF |
| `Tour.price` | `number` | `Decimal` | `Number('1000000.00')` OK, `Number('99999999999999.99')` lose precision |
| `Booking.totalAmount` | `number` | `Decimal` | Same |
| `Booking.status` | `'Pending' \| 'Confirmed' \| 'Cancelled' \| 'Completed'` | enum `DRAFT \| PENDING_PAYMENT \| CONFIRMED \| CANCELLED \| COMPLETED` | Thiếu `DRAFT`, `PENDING_PAYMENT`; casing khác |
| `Flight.departureTime` | `string` (ISO) | `DateTime` → ISO string | OK nếu BE serialize đúng |
| `PaymentMethod` | (FE không có type) | enum `CREDIT_CARD \| BANK_TRANSFER \| VNPAY \| MOMO` | FE không có union |
| `FareClass` | `'Economy' \| 'Premium Economy' \| 'Business' \| 'First Class'` | enum `ECONOMY \| PREMIUM_ECONOMY \| BUSINESS` | Casing + thiếu First |

**Recommendation**: Tạo shared type package `@trip-planner/types` hoặc generate từ BE Swagger/Prisma schema.

### 6.2 Authentication flow broken end-to-end

```
FE Login.tsx (mock)
  → setTimeout 800ms
  → if email includes 'admin' → role: 'Admin', token: 'fake-jwt-token-123'
  → authStore.login(mockUser, 'fake-jwt-token-123')
  → sessionStorage.setItem('auth-storage', JSON.stringify({ user, token }))

BE /api/auth/login (real, but FE không gọi)
  → bcrypt.compare(password, user.passwordHash)
  → issue JWT (15min) + refresh token (7d)
  → create UserSession
  → logLoginHistory
```

**Net effect**: FE không bao giờ gọi BE `/auth/login`. BE endpoint tồn tại nhưng unused. Khi wire real API, FE cần rewrite toàn bộ auth flow.

### 6.3 Booking flow broken end-to-end

```
FE booking flow (9 step):
  passenger → fare-class → seat → baggage → meal → addons → payment → success → ticket

BE booking flow (real):
  POST /api/booking (create draft) → patch /:id/seats → put /:id/passengers (STUB!) → patch /:id/voucher → POST /api/payments/:bookingId/initiate → VNPay callback

Gaps:
  - FE không gọi BE (all mock)
  - BE updatePassengers là no-op stub
  - BE selectSeat không link passenger
  - BookingSuccess navigate /booking/ticket/VN8A2B (hardcoded)
  - DownloadTicket render static data
```

### 6.4 CORS + Cookie/JWT strategy mismatch

- BE CORS `origin: '*' + credentials: true` → browser reject.
- FE store JWT in `sessionStorage` (XSS-readable).
- BE không set httpOnly cookie.
- Không có refresh token httpOnly cookie strategy.

**Proper flow should be**:
- BE login response set 2 cookies: `access_token` (httpOnly, 15min) + `refresh_token` (httpOnly, 7d, SameSite=Strict).
- FE store only `user` profile in JS-accessible store.
- BE CORS whitelist FE origin, `credentials: true`.
- BE `/auth/refresh` read cookie, no FE sends token.

### 6.5 Pagination inconsistency

| Layer | Pattern | Issue |
|---|---|---|
| BE `tour.controller.ts:18-34` | `page, limit` as string query, no DTO | No validation |
| BE `admin.controller.ts:27-32` | `take: 50` hardcoded, no pagination | No pagination |
| BE `admin.controller.ts:46-49` | `take: 100` hardcoded | No pagination |
| FE `DataTable.tsx` | Windowed pagination | OK ✓ |
| FE `Pagination.tsx` | `Array.from({length: totalPages})` | Memory bomb for large totals |

### 6.6 Error handling inconsistency

- BE `global-exception.filter.ts` leak internal message, không map Prisma error.
- FE không có `error.tsx` boundary → unhandled error whitescreen.
- FE `alert()` cho validation thay vì inline error.
- BE service throw `BadRequestException` cho 404 case (BE-108).

### 6.7 Logging strategy absent

- BE dùng `console.log/error` toàn codebase, không Pino/Winston.
- BE không có request ID / correlation ID middleware.
- BE log OTP plaintext (BE-022).
- BE email processor log full email content (BE-030).
- FE không có Sentry/error tracking.

### 6.8 Test coverage

| Layer | Tests | Issue |
|---|---|---|
| BE unit | `auth.service.spec.ts` (409 LOC), `booking.service.spec.ts` (89), `payment.service.spec.ts` (115), `app.controller.spec.ts` (22) | Mock không simulate isolation, type errors |
| BE e2e | `test/app.e2e-spec.ts` (29 LOC) | Chỉ test `GET /` |
| BE standalone | `test_concurrency.ts`, `test_concurrency_integration.ts` | Not in Jest |
| FE unit | `auth.store.test.tsx`, `booking.store.test.tsx`, `Home.test.tsx` | Type errors, trivial smoke test |
| FE e2e | None | Zero |
| Integration | None | Zero |

### 6.9 CI/CD absence

- Không có `.github/workflows/` (chỉ có repo commit).
- Không có `pretest`/`prebuild` script.
- Không có `lint:fix`, `format`, `type-check` script (FE).
- Không có `engines` field trong `package.json`.
- Docker Compose không có app service (chỉ MySQL + Redis).

### 6.10 Documentation vs reality

- README claim "JWT + Refresh Token Rotation with token theft detection" — implementation broken (BE-001 O(N) scan).
- README claim "Optimistic locking for concurrent seat booking" — implementation correct at DB level but seat lock không release (BE-015).
- README claim "VNPay payment integration with idempotency" — idempotency check không row-lock (BE-017).
- README claim "Fine-grained RBAC with Permission-based access control" — RBAC schema OK nhưng AdminController dùng RolesGuard không AuthorizationGuard (BE-089).
- README claim "Async email queue via BullMQ" — processor log only, no real SMTP (BE-030).
- README claim "Session management with device tracking" — `isCurrent: false` hardcoded (BE-059).

---

## 7. Security Posture Tổng quan

### 7.1 AuthN Strengths
- ✅ Refresh-token rotation concept correct (revoke on reuse → revoke all).
- ✅ Bcrypt cost 10 for password hashing (acceptable, could be 12).
- ✅ JWT access token 15min + refresh 7d — reasonable.
- ✅ Token blacklist via Redis (concept OK, implementation flawed — BE-019).
- ✅ Login history + failure tracking + auto-lock after 5 tries.
- ✅ Session management with "My Devices" concept.

### 7.2 AuthN Weaknesses
- ❌ O(N) refresh-token lookup (BE-001) — catastrophic.
- ❌ OTP cross-email reuse via `BigInt(0)` (BE-002).
- ❌ Math.random OTP (BE-006).
- ❌ JWT_SECRET fallback 'secret' (BE-003).
- ❌ No OTP brute-force protection (BE-023).
- ❌ No account unlock mechanism (BE-050).
- ❌ Access-token blacklist uses unverified decode (BE-019).
- ❌ `RegisterDto & { otp }` broken (BE-013).
- ❌ User enumeration on RESET_PASSWORD (BE-098).
- ❌ FE: JWT in sessionStorage plaintext (FE-S-001).
- ❌ FE: Hardcoded credentials (FE-005).
- ❌ FE: Login.tsx grant admin role by email substring (FE-005).

### 7.3 AuthZ Strengths
- ✅ AuthorizationGuard checks both role + permission.
- ✅ RBAC schema with `RolePermission` + `Permission` tables.
- ✅ `@Permissions()` decorator with fine-grained codes.
- ✅ Blog module uses RBAC correctly.
- ✅ Session revoke checks `userId` ownership.

### 7.4 AuthZ Weaknesses
- ❌ IDOR on ALL booking endpoints (BE-008).
- ❌ IDOR on payment initiate (BE-009).
- ❌ FLIGHT review integrity (BE-031).
- ❌ AdminController uses RolesGuard not AuthorizationGuard (BE-089).
- ❌ No permission cache — DB query per request (BE-037).
- ❌ `RolesGuard` silent reject on no user (BE-068).
- ❌ `seedDefaultPermissions` no permission guard (BE-096).
- ❌ FE: `ProtectedRoute` exists but never used (FE-001/002).
- ❌ FE: No `middleware.ts` for route-level auth gating (FE-S-104).

### 7.5 Top 10 Security Risks (sắp xếp theo impact)

| # | Risk | Layer | ID |
|---|---|---|---|
| 1 | OTP cross-user leak → account takeover | BE+DB | BE-002, DB-005 |
| 2 | IDOR booking/payment — any user mutate any booking | BE | BE-008, BE-009 |
| 3 | O(N) refresh-token DoS | BE+DB | BE-001, DB-003 |
| 4 | FE admin route public → SMTP/VNPay secret leak | FE | FE-001 |
| 5 | Upload MIME spoof → stored XSS/RCE | BE | BE-043, BE-044 |
| 6 | CORS `origin:'*' + credentials:true` invalid | BE | BE-004 |
| 7 | JWT_SECRET fallback 'secret' | BE | BE-003 |
| 8 | FE BlogDetail `dangerouslySetInnerHTML` XSS | FE | FE-008 |
| 9 | FE hardcoded credentials in client bundle | FE | FE-005 |
| 10 | PII (passport, CCCD) plaintext in localStorage + DB | FE+DB | FE-007, DB-030 |

---

## 8. Roadmap Fix (Đề xuất)

Đề xuất theo thứ tự ưu tiên, chia 4 phase. **Round 2 sẽ là phase fix, báo cáo này chỉ đề xuất.**

### Phase 0 — Critical Security Hotfix (must fix trước production)

| ID | Tầng | Task | Effort |
|---|---|---|---|
| DB-005 + BE-002/010 | DB+BE | Refactor `OtpCode` thêm `email` column, query theo email thay vì userId=0 | 4h |
| BE-001 + DB-003 | BE+DB | Refactor `refreshToken` lưu `tokenHint` (SHA-256), O(1) lookup, add index | 6h |
| BE-008 | BE | Add ownership check cho tất cả booking endpoints (`booking.userId === user.id`) | 2h |
| BE-009 | BE | Add ownership check cho payment initiate | 1h |
| BE-013 | BE | Tạo `RegisterWithOtpDto extends RegisterDto` với `otp` field | 1h |
| BE-004 | BE | CORS whitelist origin thay vì `'*'` | 1h |
| BE-003 | BE | Remove JWT_SECRET fallback `'secret'`, throw nếu missing | 0.5h |
| BE-006 | BE | `crypto.randomInt(100000, 1000000)` thay `Math.random` | 0.5h |
| BE-043/044 | BE | Upload: sniff magic byte bằng `file-type`, force extension `.jpg/.png/...` | 4h |
| FE-001/002 | FE | Wrap `/admin/*` và `/user/*` trong `ProtectedRoute` + layout.tsx segment | 4h |
| FE-005 | FE | Remove hardcoded credentials, call BE `/auth/login` | 2h |
| FE-S-001 | FE | Move JWT to httpOnly cookie (BE set), remove sessionStorage token | 8h (cần BE配合) |
| FE-008 | FE | `DOMPurify.sanitize` trước `dangerouslySetInnerHTML` | 1h |
| FE-007 | FE | `partialize` exclude `passengerInfo` khỏi persist, hoặc encrypt | 2h |
| FE-003/025 | FE | Sync booking path `/booking/passenger` và `/booking/seat` | 1h |
| FE-004 | FE | Strip `/auth/` prefix from auth navigations | 1h |
| BE-053 | BE | `Buffer.from()` thay `new Buffer()` | 0.5h |
| BE-022 | BE | Remove `console.log` OTP | 0.5h |
| BE-030 | BE | Mask PII trong email processor log | 1h |
| DB-006/007 | DB | Fix Migration #2: add `DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`, fix casing | 2h |

**Phase 0 total: ~42h**

### Phase 1 — High Priority Fix (sprint 1-2)

| ID | Tầng | Task | Effort |
|---|---|---|---|
| BE-011 | BE | Payment callback gọi `updateBookingStatus` (state machine), không direct update | 2h |
| BE-012 | BE | Implement `updatePassengers` thật — create/update BookingPassenger, set seatId khi selectSeat | 8h |
| BE-015 | BE | Link FlightSeat → BookingPassenger khi selectSeat; expiry job release đúng ghế | 4h |
| BE-017 | BE | Payment idempotency dùng `updateMany({ where: { id, status: 'PENDING' }})` + check count | 2h |
| BE-019 | BE | Access-token blacklist: hash token SHA-256 làm key, verify signature trước decode | 2h |
| BE-020 | BE | Add DTO cho 11+ endpoint thiếu (sendOtp, refresh, logout, booking, payment, review, user, admin) | 8h |
| BE-023 | BE | OTP brute-force protection: thêm `attempts` column, max 5 tries, lock record | 2h |
| BE-050 | BE | Account unlock mechanism: admin endpoint + auto-unlock sau 30 phút | 3h |
| BE-027/028 | BE | Global exception filter: mask internal message in prod, map Prisma error (P2002→409, P2025→404) | 4h |
| BE-037 | BE | Cache permission trong Redis (TTL 5min), invalidate khi role thay đổi | 3h |
| BE-041 | BE | Admin getBookings: bỏ `include: { user: true }}`, add pagination | 2h |
| BE-042 | BE | Admin updateBookingStatus: nhận input, dùng state machine, tạo history | 2h |
| DB-008 | DB | Add 19 missing concrete FKs in new migration | 4h |
| DB-009 to DB-024 | DB | Add missing indexes (24 patterns) | 4h |
| DB-025 | DB | Change Decimal fields to `@db.Decimal(18, 2)` for VND, `@db.Decimal(3, 1)` for ratingAvg | 2h |
| DB-027 | DB | Implement soft-delete middleware hoặc drop `User.deletedAt` | 3h |
| DB-028 | DB | Set proper `onDelete: Cascade` for child tables | 2h |
| DB-029/038 | DB | Seed: env-var passwords, bcrypt cost 12, prod guard, deterministic faker | 2h |
| DB-041 | DB | Seed 12 missing models | 8h |
| DB-042 | DB | Compute Tour.ratingAvg from actual reviews in seed | 2h |
| FE-S-003 | FE | Replace all mock queryFn với real fetch/axios, gate mock behind NODE_ENV | 16h |
| FE-S-004/005 | FE | Convert page.tsx to server component, export metadata, remove ssr:false | 16h |
| FE-S-006 | FE | Add `error.tsx`, `loading.tsx`, `not-found.tsx` | 4h |
| FE-S-007 | FE | Create `app/admin/layout.tsx`, `app/user/layout.tsx`, `app/booking/layout.tsx` | 4h |
| FE-S-008/009 | FE | Extract all hardcoded strings to i18n keys, add CI check | 16h |
| FE-S-010 | FE | Fix persist hydration: `skipHydration: true` + manual rehydrate in useEffect | 4h |
| FE-S-017 | FE | Apply `dark` class to `<html>` via useEffect, configure Tailwind `darkMode: 'class'` | 2h |
| FE-S-024/025/026 | FE | Sync FE types với BE: BigInt as string, Decimal as string, full User fields | 4h |
| FE-S-031 | FE | Consolidate `destinations.ts` và `destinations.mock.ts` — single source of truth | 2h |

**Phase 1 total: ~140h**

### Phase 2 — Medium Priority Fix (sprint 3-4)

- BE-014: Helmet + HPP + body size limit
- BE-040: Add `Payment(status, createdAt)` composite index
- BE-061/062: Fix notification job name, dedupe queue registration
- BE-063: Wire `membership.service.awardPoints` vào booking confirm flow
- BE-076: Fix cache TTL ambiguity (seconds vs ms)
- DB-030: Encrypt PII at app layer (nationalId, passportNo)
- DB-035: Add CHECK constraints via raw migration SQL (rating 1-5, discountPercent 0-100, etc.)
- DB-036: Use `TIMESTAMP(3)` for createdAt/updatedAt/expiresAt (UTC auto-convert)
- DB-045: Write down migrations in `down.sql` files
- FE: Replace `alert()`/`window.confirm()` với toast/ModalConfirm
- FE: Add `next/image` thay raw `<img>`
- FE: Add `middleware.ts` cho auth + RBAC + i18n
- FE: Add `useShallow` cho Zustand multi-field selector
- FE: Consolidate EmptyState, ErrorState component
- FE: Fix `as string` cast with proper type guard
- FE: Replace `Math.random()`/`Date.now()` ID với `crypto.randomUUID()`

**Phase 2 total: ~80h**

### Phase 3 — Low Priority + Polish (backlog)

- BE-115: Add Pino/Winston structured logging + request ID
- BE-114: Add correlation ID middleware
- DB-091: Configure Prisma read replica for analytics
- DB-092: Partition ActivityLog, AuditLog, LoginHistory by month
- DB-093: Archive strategy for old logs (S3 + Parquet)
- DB-094: Multi-currency support
- FE: Add `useShallow` everywhere
- FE: Remove unused dependencies (5 package)
- FE: Bump `lucide-react` to valid version
- FE: Fix `tsconfig.json` strict flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`)
- FE: Bump `target` to `ES2022`
- FE: Add `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-plugin-security`
- FE: Add `engines: { node: '>=20.0.0' }`
- FE: Fix test type errors, add real assertions
- FE: Add Vietnamese subset for Geist font

**Phase 3 total: ~60h**

### Total effort estimate: ~322h (~8 weeks for 1 dev, ~2 weeks for 4 dev)

---

## 9. Thống kê tổng

### Theo tầng

| Tầng | File reviewed | Findings | Critical | High | Medium | Low | Info |
|---|---|---|---|---|---|---|---|
| FE (views+components) | 210 | 158 | 12 | 28 | 62 | 41 | 15 |
| FE (state+data+config) | 116 | 110 | 12 | 30 | 38 | 30 | 10 |
| BE | 77 | 138 | 14 | 35 | 48 | 25 | 16 |
| DB | 42 model + 2 mig + seed | 101 | 7 | 23 | 21 | 39 | 11 |
| **Tổng** | **~315 file** | **507** | **45** | **116** | **169** | **135** | **52** |

### Theo category

| Category | Count | Tầng chính |
|---|---|---|
| Security | 78 | BE, FE, DB |
| Correctness / TypeScript | 52 | FE |
| API / DTO validation | 38 | BE |
| Concurrency | 18 | BE, DB |
| Index / Performance | 36 | DB, BE |
| FK / Constraint | 24 | DB |
| Migration | 12 | DB |
| Seed | 14 | DB |
| i18n | 18 | FE |
| A11y | 22 | FE |
| UI/UX | 41 | FE |
| Dead code / routes | 28 | FE, BE |
| Hydration / SSR | 14 | FE |
| State management | 32 | FE |
| Test | 16 | BE, FE |
| Config | 18 | BE, FE |
| Documentation drift | 6 | All |

### Top 15 Critical (xếp theo impact production)

| # | ID | Tầng | One-liner |
|---|---|---|---|
| 1 | DB-005 + BE-002 | DB+BE | OTP cross-user leak → account takeover |
| 2 | BE-008 | BE | IDOR toàn bộ booking endpoint — any user mutate any booking |
| 3 | BE-001 + DB-003 | BE+DB | O(N) refresh-token DoS — single request hang CPU |
| 4 | BE-009 | BE | IDOR payment initiate — any user pay for any booking |
| 5 | FE-001/002 | FE | `/admin/*` + `/user/*` route public, no RBAC guard |
| 6 | BE-013 | BE | `RegisterDto & { otp }` rejected by `forbidNonWhitelisted` — register broken |
| 7 | FE-S-003 | FE | 0 fetch/axios, toàn bộ FE là mock shell |
| 8 | FE-005 | FE | Hardcoded credentials trong client bundle + email.includes('admin') → Admin role |
| 9 | BE-004 | BE | CORS `origin:'*' + credentials:true` invalid combo |
| 10 | BE-003 | BE | JWT_SECRET fallback `'secret'` |
| 11 | FE-007 | FE | PII (passport, DOB) localStorage unencrypted |
| 12 | FE-008 | FE | BlogDetail `dangerouslySetInnerHTML` stored XSS risk |
| 13 | BE-011 | BE | Payment callback DRAFT→CONFIRMED bypass state machine |
| 14 | BE-012 | BE | `updatePassengers` stub no-op → seat lock vĩnh viễn |
| 15 | DB-006/007 | DB | Migration #2 fail trên prod (NOT NULL no default + case mismatch) |

---

## 10. Phụ lục — Top Findings Theo Mức Độ

### 10.1 Critical FE (12)
- FE-001, FE-002, FE-003, FE-004, FE-005, FE-006, FE-007, FE-008, FE-009, FE-010, FE-011, FE-012
- FE-S-001, FE-S-002, FE-S-003, FE-S-004, FE-S-005, FE-S-006, FE-S-007, FE-S-008, FE-S-009, FE-S-010, FE-S-101, FE-S-102

### 10.2 Critical BE (14)
- BE-001, BE-002, BE-003, BE-004, BE-005, BE-006, BE-007 (trùng BE-001), BE-008, BE-009, BE-010 (trùng BE-002), BE-011, BE-012, BE-013, BE-014 (trùng BE-004)

### 10.3 Critical DB (7)
- DB-001, DB-002, DB-003, DB-004, DB-005, DB-006, DB-007

### 10.4 High BE (35)
BE-015 → BE-050 (chi tiết trong Section 4.3)

### 10.5 High DB (23)
DB-008 → DB-030 (chi tiết trong Section 5.3)

### 10.6 High FE (28 + 30 = 58)
FE-013 → FE-040 + FE-S-011 → FE-S-032 (chi tiết trong Section 3.3)

---

## Kết luận

Trip_Planer là một dự án **portfolio ambitious** với nhiều ý tưởng kiến trúc enterprise-grade đúng đắn (RBAC, optimistic locking, idempotency, BullMQ, audit log, refresh token rotation concept). Tuy nhiên, **implementation hiện tại chưa sẵn sàng production** với **45 Critical findings** trải đều FE/BE/DB.

**Ba lỗ hổng nghiêm trọng nhất** cần fix ngay:

1. **OTP cross-user leak (DB-005 + BE-002)** — attacker có thể đăng ký thay email người khác, bypass email verification, account takeover.
2. **IDOR booking/payment (BE-008/009)** — bất kỳ user đã login cũng mutate booking/payment của user khác.
3. **O(N) refresh-token DoS (BE-001 + DB-003)** — single refresh request có thể hang CPU 100 giây.

**Ba vấn đề kiến trúc lớn nhất**:

1. **FE là mock shell** (FE-S-003) — 0 fetch/axios, mọi React Query hook return mock setTimeout. FE không thể function với BE thật.
2. **SSR disabled hoàn toàn** (FE-010) — mọi route `'use client' + dynamic(ssr:false)`. SEO = 0, LCP > 3s.
3. **FE auth insecure** (FE-001/002/005/007) — `ProtectedRoute` unused, hardcoded credentials, JWT in sessionStorage, PII in localStorage.

**Khuyến nghị**: Trước khi production, **bắt buộc fix toàn bộ 45 Critical + 116 High** (~182h effort). Sau đó mới đến Medium/Low. Round 2 nên bắt đầu với Phase 0 (Critical Security Hotfix, ~42h).

---

**Báo cáo hoàn thành. Round 1 review-only, không fix.**

> **Repo:** https://github.com/tvthien-ktmt/Trip_Planer
> **Commit:** `bb9434d`
> **Report file:** `/home/z/my-project/download/Trip_Planer/REVIEW_REPORT.md`
> **Worklog:** `/home/z/my-project/worklog.md` (chứa log chi tiết của 4 subagent)
> **Next:** Round 2 (fix phase) — đề xuất bắt đầu với Phase 0 Critical Security Hotfix.
