# BÁO CÁO RÀ SOÁT CODE ROUND 2 — TRIP_PLANER OTA

## Review-Only · Kỹ thuật chuyên sâu · Clean Code + SOLID + Design Patterns + Bug Fix Guidance

> **Repository:** https://github.com/tvthien-ktmt/Trip_Planer
> **Commit reviewed:** `0d0bd1a` ("Fix all issues from review report Phase 1 to Phase 3")
> **Previous round:** `bb9434d` (Round 1 — 507 findings, 45 Critical)
> **Review date:** 2025-07-15
> **Reviewer:** Z.ai Code (orchestrator) + 3 specialized subagents (R2-FE, R2-BE, R2-DB)
> **Scope:** 321 file TS/TSX · ~22.157 LOC · 42 model DB · 2 migration · 7 file mới (middleware.ts, lib/api.ts, hooks/useMounted.ts, app/admin/layout.tsx, app/user/layout.tsx, encryption.util.ts, prisma.service.ts extension)
> **Báo cáo này:** `/home/z/my-project/download/Trip_Planer/REVIEW_REPORT_V2.md`

---

## MỤC LỤC

1. [Executive Summary](#1-executive-summary)
2. [Methodology & Round 1 Verification Summary](#2-methodology--round-1-verification-summary)
3. [Frontend Review (Round 2)](#3-frontend-review-round-2)
   - 3.1 [File Inventory](#31-file-inventory)
   - 3.2 [Round 1 Verification Matrix](#32-round-1-verification-matrix)
   - 3.3 [NEW Findings — Critical](#33-new-findings--critical)
   - 3.4 [NEW Findings — High (tóm tắt)](#34-new-findings--high-tóm-tắt)
   - 3.5 [Clean Code Scorecard](#35-clean-code-scorecard)
   - 3.6 [SOLID Compliance](#36-solid-compliance)
   - 3.7 [Design Pattern Assessment](#37-design-pattern-assessment)
4. [Backend Review (Round 2)](#4-backend-review-round-2)
   - 4.1 [File Inventory](#41-file-inventory)
   - 4.2 [Round 1 Verification Matrix](#42-round-1-verification-matrix)
   - 4.3 [NEW Findings — Critical](#43-new-findings--critical)
   - 4.4 [NEW Findings — High (tóm tắt)](#44-new-findings--high-tóm-tắt)
   - 4.5 [Module Risk Heatmap](#45-module-risk-heatmap)
   - 4.6 [SOLID + Design Patterns](#46-solid--design-patterns)
5. [Database Review (Round 2)](#5-database-review-round-2)
   - 5.1 [Schema Overview](#51-schema-overview)
   - 5.2 [Round 1 Verification Matrix](#52-round-1-verification-matrix)
   - 5.3 [NEW Findings — Critical](#53-new-findings--critical)
   - 5.4 [NEW Findings — High (tóm tắt)](#54-new-findings--high-tóm-tắt)
   - 5.5 [Migration Drift Audit](#55-migration-drift-audit)
   - 5.6 [FK & Constraint Audit](#56-fk--constraint-audit)
6. [Cross-cutting Concerns](#6-cross-cutting-concerns)
7. [Bug Fix Guidance — Top Issues](#7-bug-fix-guidance--top-issues)
8. [Roadmap Fix Round 3 (Đề xuất)](#8-roadmap-fix-round-3-đề-xuất)
9. [Thống kê tổng Round 2](#9-thống-kê-tổng-round-2)
10. [Phụ lục](#10-phụ-lục)

---

## 1. Executive Summary

Commit `0d0bd1a` đã fix nhiều Round 1 Critical (OTP cross-user leak, IDOR booking, refresh-token DoS, OTP brute-force, upload MIME spoof, payment idempotency, JWT_SECRET fallback, CORS whitelist, v.v.) — nhưng **fix vẫn còn nhiều gap** và **đã introduce NEW Critical bugs**:

### Top 5 NEW Critical Risks (xếp theo impact production)

| #   | ID                    | Tầng | Vấn đề                                                                                                                                                                                                 | Impact                                                                   |
| --- | --------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| 1   | **R2-BE-001**         | BE   | `PrismaService.$use()` đã bị **remove trong Prisma 5+** (đang dùng `@prisma/client@6.19.2`) → `TypeError: this.$use is not a function` → **Nest không bootstrap được**, PII encryption hoàn toàn no-op | **App crash ngay tại boot**, mọi PII không được encrypt                  |
| 2   | **R2-BE-002/003/004** | BE   | 3 module `PaymentModule`, `ReviewModule`, `WishlistModule` thiếu `imports`/`providers` → DI fail → app không start                                                                                     | **App không boot được**                                                  |
| 3   | **R2-DB-001**         | DB   | Migration #1 không được update — vẫn tạo OLD broken schema (missing 19 FK, 30+ indexes, `tokenHint`/`email`/`attempts` columns, oversize DECIMAL(65,30))                                               | `prisma migrate deploy` trên fresh DB → broken schema, code fail runtime |
| 4   | **R2-FE-001**         | FE   | `authStore.logout()` chỉ clear in-memory state, **không clear `token` cookie** → cookie persist 24h sau logout, middleware vẫn pass user qua `/admin/*`                                                | **User nghĩ đã logout nhưng cookie vẫn valid**, shared device = takeover |
| 5   | **R2-FE-002**         | FE   | Dual AdminLayout & UserLayout — segment layout mới + old components/layout/AdminLayout.tsx vẫn wrap trong page.tsx → double chrome, triple auth check, role casing chaos                               | Visual mess, STAFF users bị deny admin                                   |

### Round 1 Critical Verification (Tổng)

| Tầng     | Critical Round 1 | FIXED        | PARTIAL      | NOT FIXED   | NEW BUG    |
| -------- | ---------------- | ------------ | ------------ | ----------- | ---------- |
| FE       | 12               | 6            | 3            | 3           | 7 new      |
| BE       | 14               | 9            | 4            | 1           | 14 new     |
| DB       | 7                | 2            | 5            | 0           | 3 new      |
| **Tổng** | **33**           | **17 (52%)** | **12 (36%)** | **4 (12%)** | **24 new** |

### Đánh giá tổng quan

| Tier                   | Round 1       | Round 2                                     | Trend                                                                              |
| ---------------------- | ------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Architecture design    | ★★★★☆         | ★★★★☆                                       | →                                                                                  |
| DB schema completeness | ★★★☆☆         | ★★★★☆                                       | ↑ (19 FK + 30+ index + Decimal fix trong schema, nhưng migration drift)            |
| BE implementation      | ★★☆☆☆         | ★★★☆☆                                       | ↑ (IDOR/OTP/refresh fixed, nhưng Prisma 5 $use crash + DI break)                   |
| FE implementation      | ★☆☆☆☆         | ★★☆☆☆                                       | ↑ (middleware+api.ts+layout segment, nhưng dual layout + cookie bug + role casing) |
| Security posture       | ★★☆☆☆         | ★★★☆☆                                       | ↑                                                                                  |
| Production readiness   | CHƯA SẴN SÀNG | **VẪN CHƯA SẴN SÀNG** — app không boot được | →                                                                                  |

### Con số thống kê Round 2

| Metric                | Round 1 | Round 2                                      |
| --------------------- | ------- | -------------------------------------------- |
| Tổng file reviewed    | 315     | 321 (+6 file mới)                            |
| Tổng LOC              | ~20.735 | ~22.157 (+1.422 LOC)                         |
| **Tổng NEW findings** | 507     | **330** (R2-FE: 114, R2-BE: 115, R2-DB: 101) |
| NEW Critical          | 45      | 24                                           |
| NEW High              | 116     | 64                                           |
| NEW Medium            | 169     | 126                                          |
| NEW Low               | 135     | 93                                           |
| NEW Info              | 52      | 23                                           |

---

## 2. Methodology & Round 1 Verification Summary

### Tiến trình Round 2

1. `git pull origin main` — kéo commit `0d0bd1a` về local
2. `git diff bb9434d 0d0bd1a --stat` — xác định 191 file thay đổi, 7 file mới
3. Đọc ngay 7 file mới để phát hiện bug sơ bộ (đã thấy `useMounted.ts` syntax error claim — thực ra OK, file đúng)
4. **Dispatch 3 subagent song song**:
   - **R2-FE**: Review ~190 file FE, verify 22 Round 1 Critical/High, đánh giá Clean Code + SOLID + Design Patterns
   - **R2-BE**: Review 67 file BE, verify 14 Round 1 Critical + 35 High, đánh giá kiến trúc NestJS + Repository Pattern
   - **R2-DB**: Review 42 model + 2 migration + seed, verify 30 Round 1 findings, deep audit migration drift
5. Mỗi subagent append worklog vào `/home/z/my-project/worklog.md`
6. **Consolidation** vào báo cáo này

### Điểm mới của Round 2 so với Round 1

- **Clean Code Scorecard** — đánh giá naming/function length/DRY/SRP cho từng module
- **SOLID Compliance Assessment** — ví dụ cụ thể cho từng nguyên tắc S/O/L/I/D
- **Design Pattern Assessment** — patterns dùng đúng, patterns thiếu, anti-patterns
- **Bug Fix Guidance CONCRETE** — code snippets cụ thể cho mỗi Critical (user request "hướng dẫn cách fix")
- **Migration Drift Audit** — phát hiện schema fix nhưng migration không sync (CRITICAL)

### Round 1 Verification Summary

| Layer            | Total R1 findings | FIXED                                                                  | PARTIAL                    | NOT FIXED            | NEW BUG introduced     |
| ---------------- | ----------------- | ---------------------------------------------------------------------- | -------------------------- | -------------------- | ---------------------- |
| FE Critical (12) | 12                | 6 (FE-003,004,005,006,007,008)                                         | 3 (FE-001,002,S-001)       | 3 (FE-011,012,S-007) | 7 (R2-FE-001 đến 007)  |
| FE High (~28)    | 28                | ~10                                                                    | ~12                        | ~6                   | 23 (R2-FE-008 đến 030) |
| BE Critical (14) | 14                | 9 (BE-002,003,004,006,008,009,012,013,017,019,030,037,041,053,061,063) | 4 (BE-001,005,011,027/028) | 1 (BE-015)           | 14 (R2-BE-001 đến 014) |
| BE High (~35)    | 35                | ~22                                                                    | ~10                        | ~3                   | 28 (R2-BE-015 đến 043) |
| DB Critical (7)  | 7                 | 2 (DB-006,007)                                                         | 5 (DB-001,002,003,004,005) | 0                    | 3 (R2-DB-001,002,003)  |
| DB High (23)     | 23                | 1 (DB-026)                                                             | 20                         | 2 (DB-027,029)       | 13 (R2-DB-004 đến 016) |

---

## 3. Frontend Review (Round 2)

### 3.1 File Inventory

Tổng **~190 file** đã review.

#### 7 file mới/add changed đáng chú ý

| File                       | LOC | Role                           | Risk        | Lý do                                                                                    |
| -------------------------- | --- | ------------------------------ | ----------- | ---------------------------------------------------------------------------------------- |
| `src/middleware.ts`        | 54  | Edge auth gate                 | 🔴 Critical | Role casing bug (`'ADMIN'/'STAFF'` vs `'Admin'`), redirect `/auth/login` không tồn tại   |
| `src/lib/api.ts`           | 49  | axios instance + interceptors  | 🔴 Critical | Hardcoded `http://localhost:3000` refresh URL, `any` types cho `bookingApi` payload      |
| `src/hooks/useMounted.ts`  | 12  | mounted hook                   | 🟢 Low      | Clean (lưu ý: claim syntax error trong task là sai, file đúng)                           |
| `src/app/admin/layout.tsx` | 37  | admin segment layout           | 🔴 Critical | Duplicate `components/layout/AdminLayout`, returns `null` thay vì spinner                |
| `src/app/user/layout.tsx`  | 37  | user segment layout            | 🔴 Critical | Same as admin layout                                                                     |
| `src/stores/uiStore.ts`    | 48  | UI state (theme/lang/currency) | 🟢 Low      | `applyTheme` đã apply `dark` class to `<html>` (FE-S-017 fixed)                          |
| `src/stores/authStore.ts`  | 34  | auth state                     | 🟠 High     | `partialize` exclude token — token in-memory only, không rehydrate từ cookie sau refresh |

#### Top 10 file FE rủi ro nhất Round 2

| File                             | LOC | Risk        | Lý do                                                                  |
| -------------------------------- | --- | ----------- | ---------------------------------------------------------------------- |
| `components/layout/Header.tsx`   | 455 | 🔴 Critical | God component 12 trách nhiệm, mega-menu hover-only (a11y)              |
| `views/public/Tours.tsx`         | 331 | 🔴 Critical | LOC>300, dead import, `/trip/${id}` wrong route, raw `toLocaleString`  |
| `views/public/auth/Register.tsx` | 230 | 🟡 Medium   | Bug `type={password ? 'text' : 'password'}` — password luôn visible    |
| `app/admin/layout.tsx`           | 37  | 🔴 Critical | Duplicate layout, returns `null`                                       |
| `app/user/layout.tsx`            | 37  | 🔴 Critical | Same                                                                   |
| `views/admin/AdminLogin.tsx`     | 88  | 🟠 High     | Hardcoded URL, `data.user.role !== 'ADMIN'` (chỉ ADMIN, không STAFF)   |
| `views/user/Wishlist.tsx`        | 71  | 🟠 High     | Hardcoded mock array, ignore `useWishlistStore`                        |
| `views/user/Settings.tsx`        | 201 | 🟠 High     | LOC>200, `/trip/${id}` wrong route, NPE risk `user?.name.charAt(0)`    |
| `views/user/BookingHistory.tsx`  | 100 | 🟠 High     | Hardcoded mock, `/booking/ticket/${id}` wrong route (segment reversed) |
| `views/booking/Reservation.tsx`  | 222 | 🟠 High     | LOC>200, navigate `/settings` (404), fake `setTimeout` API call        |

### 3.2 Round 1 Verification Matrix

| R1 ID                                      | Status                  | Evidence                                                                                                           | Notes                                                                                                         |
| ------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| FE-001 (admin no RBAC)                     | **PARTIAL**             | `middleware.ts:30-37` check `'ADMIN'/'STAFF'` (uppercase); `app/admin/layout.tsx:18` check `'Admin'` (capitalized) | **NEW BUG**: role casing mismatch — STAFF bị deny                                                             |
| FE-002 (user no auth)                      | **PARTIAL**             | `middleware.ts:41-46` redirect to `/auth/login` (NON-EXISTENT)                                                     | **NEW BUG**: redirect URL wrong → infinite loop/404                                                           |
| FE-003 (booking 404 paths)                 | **FIXED**               | `BookingProgressBar.tsx:4-12` dùng `/booking/passenger`, `/booking/seat` đúng                                      | OK                                                                                                            |
| FE-004 (auth routes)                       | **FIXED**               | `Login.tsx:89` → `/forgot-password` đúng                                                                           | OK                                                                                                            |
| FE-005 (hardcoded creds)                   | **FIXED**               | `LoginModal.tsx:24-30` call `fetch('/api/auth/login')` với user creds                                              | **NEW BUG**: hardcoded `http://localhost:3000` URL 3 chỗ (DRY)                                                |
| FE-006 (PII shape)                         | **FIXED**               | `PassengerInfo.tsx:13-24` match `PassengerInfo` interface                                                          | OK                                                                                                            |
| FE-007 (PII localStorage)                  | **FIXED**               | `bookingFlowStore.ts:44-48` `partialize` exclude `passengerInfo`                                                   | OK                                                                                                            |
| FE-008 (XSS BlogDetail)                    | **FIXED**               | `BlogDetail.tsx:6` import `DOMPurify`, line 99 sanitize                                                            | OK                                                                                                            |
| FE-009 (theme hydration)                   | **PARTIAL**             | `uiStore.ts:42-44` `onRehydrateStorage` re-apply theme; `app/layout.tsx:33` `suppressHydrationWarning`             | Vẫn SSR-unfriendly: `i18n/config.ts:14` read store tại module init                                            |
| FE-010 (SPA all 'use client')              | **NOT FIXED**           | Tất cả 80 `app/**/page.tsx` vẫn `'use client' + dynamic(ssr:false)`                                                | Zero SSR, zero metadata per route                                                                             |
| FE-011 (UserSidebar /settings)             | **NOT FIXED**           | `UserSidebar.tsx:29` vẫn `/settings`                                                                               | Click → 404                                                                                                   |
| FE-012 (no error/loading/not-found)        | **NOT FIXED**           | `find . -name "error.tsx"` returns 0                                                                               | Unhandled error → blank page                                                                                  |
| FE-S-001 (JWT sessionStorage)              | **PARTIAL**             | `authStore.ts:29-30` exclude token from sessionStorage                                                             | **NEW BUG**: token in-memory only → sau refresh, `lib/api.ts:15` không có token → 401 → infinite refresh loop |
| FE-S-003 (no fetch/axios)                  | **PARTIAL**             | `lib/api.ts` tạo axios; 6/8 query hook dùng `api.get`; `useFaqQuery` vẫn mock; admin views vẫn mock                | Mixed state                                                                                                   |
| FE-S-004/005 (SSR disabled)                | **NOT FIXED**           | All page.tsx vẫn `'use client' + ssr:false`                                                                        | Same as FE-010                                                                                                |
| FE-S-006 (no error/loading)                | **NOT FIXED**           | Same as FE-012                                                                                                     | Same                                                                                                          |
| FE-S-007 (Layout in page.tsx)              | **NOT FIXED — NEW BUG** | New `app/admin/layout.tsx` + `app/user/layout.tsx` segment added, BUT page.tsx vẫn wrap `<AdminLayout>`            | **Double chrome, triple auth check**                                                                          |
| FE-S-008/009 (i18n keys missing)           | **NOT FIXED**           | `en.json`/`vi.json` vẫn 25 keys; `header.more`, `tours.searchTitle` vẫn absent                                     | Same                                                                                                          |
| FE-S-010 (persist auto-hydrate)            | **PARTIAL**             | `uiStore` fix `onRehydrateStorage`; 6 store khác vẫn auto-hydrate                                                  | Same                                                                                                          |
| FE-S-017 (toggleTheme dark class)          | **FIXED**               | `uiStore.ts:14-22` `applyTheme` toggle `documentElement.classList`                                                 | OK                                                                                                            |
| FE-S-019 (QueryProvider visibility:hidden) | **FIXED**               | `QueryProvider.tsx` remove mounted gate                                                                            | OK                                                                                                            |
| FE-S-024/025/026 (type drift)              | **NOT FIXED**           | `Tour.price: number`, `User.id: string`, `Booking.status` PascalCase vs BE uppercase                               | Same                                                                                                          |
| FE-S-031 (duplicate destinations)          | **NOT FIXED**           | `mocks/destinations.ts` + `mocks/data/destinations.mock.ts` vẫn tồn tại                                            | Dead code                                                                                                     |

### 3.3 NEW Findings — Critical

#### R2-FE-001 · Logout không clear `token` cookie (Security)

- **Files:** `src/stores/authStore.ts:22-24`, `src/components/layout/Header.tsx:67-71`, `src/components/layout/UserSidebar.tsx:59`
- **Description:** `authStore.logout()` chỉ `set({ user: null, token: null, isAuthenticated: false })`. Login flow set `document.cookie = 'token=...; max-age=86400'` ở 3 chỗ (LoginModal, Login, AdminLogin) nhưng **không có code path nào clear cookie khi logout**. Middleware `src/middleware.ts:13` đọc `request.cookies.get('token')` — sau logout, cookie vẫn còn JWT 24h, middleware vẫn pass user qua `/admin/*` và `/user/*`.
- **Impact:** User click "Logout" nhưng JWT cookie vẫn valid 24h. Shared computer / XSS token theft = takeover. Break security contract "logout revokes session".
- **Fix Guidance:**
  ```ts
  // src/stores/authStore.ts
  logout: () => {
    // Clear cookie (must match path/domain used at login)
    document.cookie = 'token=; path=/; max-age=0; samesite=lax';
    // Best effort: call backend to revoke refresh token
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    set({ user: null, token: null, isAuthenticated: false });
  },
  ```
  Better: move cookie management to dedicated `src/lib/auth.ts` lib, prefer backend-set httpOnly cookie.

#### R2-FE-002 · Dual AdminLayout & UserLayout (Architecture)

- **Files:** `src/app/admin/layout.tsx` (mới, 37 LOC) vs `src/components/layout/AdminLayout.tsx` (cũ, 48 LOC); `src/app/user/layout.tsx` (mới, 37 LOC) vs `src/components/layout/UserLayout.tsx` (cũ, 26 LOC); `src/app/admin/dashboard/page.tsx:9` (và 17 admin page khác) vẫn wrap `<AdminLayout>`.
- **Description:** Commit `0d0bd1a` thêm Next.js segment layout để centralize auth — nhưng page.tsx **không được update để remove inner `<AdminLayout>`/`<UserLayout>` wrap**. Kết quả mỗi `/admin/*` page render:
  1. `app/admin/layout.tsx` → `<Header />` + `<main>{children}</main>` + `<Footer />`
  2. children = `page.tsx` → `<AdminLayout>` (từ `components/layout/`) → `<ProtectedRoute>` + `<AdminSidebar>` + admin search-bar header + `<main>{page content}</main>`

  Result: **double chrome** (public Header + admin search bar), **triple auth check** (middleware + segment layout + ProtectedRoute), **double main wrapper**.

- **Impact:** Visual mess, 3 redundant auth check, performance overhead.
- **Fix Guidance:** Pick ONE layout strategy. Recommended: delete `components/layout/AdminLayout.tsx` & `UserLayout.tsx`, merge sidebar+header logic vào segment layout, update tất cả `admin/**/page.tsx` để NOT wrap:

  ```tsx
  // src/app/admin/dashboard/page.tsx (after fix)
  "use client";
  import dynamic from "next/dynamic";
  const PageComponent = dynamic(() => import("@/views/admin/Dashboard"));
  export default function Page() {
    return <PageComponent />; // No <AdminLayout> wrap — segment layout handles it
  }

  // src/app/admin/layout.tsx (merge in AdminSidebar + admin header)
  export default function AdminLayout({ children }) {
    // ... existing auth check ...
    return (
      <div className="min-h-screen flex">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <AdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    );
  }
  ```

#### R2-FE-003 · Role casing inconsistency (Bug/Security)

- **Files:** `src/middleware.ts:35` (`user.role !== 'ADMIN' && user.role !== 'STAFF'`), `src/app/admin/layout.tsx:18` (`user?.role !== 'Admin'`), `src/views/public/auth/Login.tsx:46` (`role: data.user.role === 'ADMIN' ? 'Admin' : 'User'`), `src/views/admin/AdminLogin.tsx:31` (`data.user.role !== 'ADMIN'`), `src/components/layout/AdminLayout.tsx:11` (`allowedRoles={['Admin', 'ADMIN', 'STAFF', 'Staff']}` — defensive hack), `src/types/index.ts:119` (`role: 'User' | 'Admin' | 'Staff'`).
- **Description:** Backend JWT dùng uppercase roles (`ADMIN`, `STAFF`, `USER`). FE `User` type dùng capitalized (`User`, `Admin`, `Staff`). Login.tsx map chỉ ADMIN→Admin, mọi thứ khác→User → **STAFF trở thành 'User' trong store**. Middleware đọc cookie JWT (uppercase) check `!== 'ADMIN' && !== 'STAFF'` (passes cho STAFF). Segment layout đọc từ authStore (capitalized) check `!== 'Admin'` — STAFF user có `role='User'` trong store → check `!== 'Admin'` là TRUE → redirect to /login. **STAFF users không access được /admin/\* qua UI.**
- **Impact:** STAFF role silently denied admin access. New dev confused bởi dual casing.
- **Fix Guidance:** Single source of truth — define `Role` enum, convert tại boundary:

  ```ts
  // src/types/index.ts
  export const UserRole = {
    USER: "USER",
    ADMIN: "ADMIN",
    STAFF: "STAFF",
  } as const;
  export type UserRole = (typeof UserRole)[keyof typeof UserRole];

  // src/views/public/auth/Login.tsx — don't transform, store as-is
  login({ ...data.user, role: data.user.role as UserRole }, data.access_token);

  // src/app/admin/layout.tsx
  if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
    redirect;
  }
  ```

#### R2-FE-004 · All tour cards link `/trip/${id}` non-existent route (Routing)

- **Files:** `RecommendedTours.tsx:110,145`, `Tours.tsx:245`, `Settings.tsx:149`, `CompareModal.tsx:75` — 5 chỗ.
- **Description:** Hardcode `/trip/${tour.id}`. Actual route là `src/app/tours/[id]/page.tsx` → URL `/tours/:id`. Không có `/trip/[id]` route. Click → 404.
- **Impact:** Mọi "View tour detail" click 404. Critical user-flow breakage.
- **Fix Guidance:** Find-replace `/trip/` → `/tours/`. Better: define route constants:
  ```ts
  // src/lib/routes.ts
  export const routes = {
    tourDetail: (id: string) => `/tours/${id}`,
    flightDetail: (id: string) => `/flights/${id}`,
    bookingTicket: (id: string) => `/booking/${id}/ticket`,
  } as const;
  // Usage: <Link href={routes.tourDetail(tour.id)}>
  ```

#### R2-FE-005 · Booking ticket URL segment reversed (Routing)

- **Files:** `BookingSuccess.tsx:36` (`navigate.push('/booking/ticket/NEWPNR')`), `BookingHistory.tsx:78` (`navigate.push(`/booking/ticket/${booking.id}`)`).
- **Description:** Actual route `src/app/booking/[id]/ticket/page.tsx` → URL `/booking/:id/ticket` (id BEFORE "ticket"). Cả 2 call site dùng `/booking/ticket/:id` (id AFTER) → 2 segment swapped → 404.
- **Impact:** Sau booking success, "Tải e-Ticket" 404. Booking history ticket-download icon 404.
- **Fix Guidance:**
  ```diff
  - navigate.push('/booking/ticket/NEWPNR');
  + navigate.push(`/booking/${bookingId}/ticket`);
  ```

#### R2-FE-006 · Reservation.tsx navigate `/settings` (Routing — NOT FIXED từ FE-011)

- **File:** `src/views/booking/Reservation.tsx:54`
- **Description:** Sau reservation success, navigate `/settings` — non-existent (actual `/user/settings`). Middleware không match `/settings` → 404.
- **Fix Guidance:** `navigate.push('/user/bookings');`

#### R2-FE-007 · Middleware redirect `/auth/login` non-existent (Routing)

- **File:** `src/middleware.ts:44` (`return NextResponse.redirect(new URL('/auth/login', request.url));`)
- **Description:** Unauth user hit `/user/*` → redirect `/auth/login` — không có route này (login ở `/login`). Infinite redirect loop or 404.
- **Impact:** Guest click "Tài khoản của tôi" → broken redirect.
- **Fix Guidance:**
  ```diff
  - return NextResponse.redirect(new URL('/auth/login', request.url));
  + const loginUrl = new URL('/login', request.url);
  + loginUrl.searchParams.set('redirect', pathname);
  + return NextResponse.redirect(loginUrl);
  ```

### 3.4 NEW Findings — High (tóm tắt)

23 High findings (R2-FE-008 đến R2-FE-030). Tổng hợp theo category:

**Architecture (5):**

- R2-FE-008: `app/admin/layout.tsx` & `app/user/layout.tsx` là `'use client'` → defeat SSR
- R2-FE-009: Cookie set via `document.cookie` không `secure`/`httpOnly`/env-TTL (3 chỗ)
- R2-FE-010: `authStore` không rehydrate token từ cookie sau refresh → 401 loop
- R2-FE-011: `lib/api.ts` 401-retry hardcode `http://localhost:3000/api/auth/refresh`
- R2-FE-021: `Header.tsx` 455-LOC God component (SRP violation)

**Bug (10):**

- R2-FE-012: Wishlist view hardcoded mock, ignore `useWishlistStore`
- R2-FE-016: `Register.tsx` password field luôn visible (`type={password ? 'text' : 'password'}` inverted)
- R2-FE-017: `useFaqQuery` vẫn import `mockFaqs`
- R2-FE-018: `Checklist.tsx` vẫn import `mockChecklistTemplates`
- R2-FE-019: NO `error.tsx`/`loading.tsx`/`not-found.tsx` (FE-012 NOT FIXED)
- R2-FE-020: `BookingSuccess` gọi `setStep(8)` out of 7-step range
- R2-FE-022: `Tours.tsx` 331 LOC, dead import, wrong route
- R2-FE-023: All admin views hardcoded mock (FE-S-003 partial)
- R2-FE-026: `params?.id as string` unsafe cast 9 view
- R2-FE-052: `VerifyOTP.tsx` không call API verify OTP — chỉ navigate với OTP trong URL

**Performance (3):**

- R2-FE-013: DataTable `[...Array(totalPages)]` memory bomb
- R2-FE-015: AirportAutocomplete no `useMemo` cho filtered list
- R2-FE-025: NO `next/image` usage anywhere

**TypeScript (2):**

- R2-FE-027: `: any` used 19 lần across 10 file
- R2-FE-046: `Button.tsx` `as?: any` defeat type safety

**Security (1):**

- R2-FE-024: `next.config.ts` `images.remotePatterns` allows `**` (SSRF risk)

**DRY/Clean Code (3):**

- R2-FE-029: Two `EmptyState` components
- R2-FE-030: Two destination mock files (FE-S-031 NOT FIXED)
- R2-FE-047/048: Magic numbers trong BookingSummarySidebar, Payment

**A11y (3):**

- R2-FE-040/041/042: Header mega-menu/notification/user dropdown hover-only, no keyboard

### 3.5 Clean Code Scorecard

| File / Directory                                | Naming  | Func Length | DRY     | SRP     | Avg      |
| ----------------------------------------------- | ------- | ----------- | ------- | ------- | -------- |
| `src/middleware.ts`                             | ★★★★★   | ★★★★★       | ★★★★    | ★★★★    | 4.5      |
| `src/lib/api.ts`                                | ★★★★    | ★★★★        | ★★★     | ★★★     | 3.5      |
| `src/hooks/useMounted.ts`                       | ★★★★★   | ★★★★★       | ★★★★★   | ★★★★★   | 5.0      |
| `src/app/admin/layout.tsx`                      | ★★★★    | ★★★★        | ★★      | ★★★     | 3.25     |
| `src/components/layout/Header.tsx`              | ★★★★    | ★★          | ★★      | ★       | **2.25** |
| `src/components/layout/BookingLayout.tsx`       | ★★★★    | ★★★         | ★★★★    | ★★★★    | 3.5      |
| `src/components/auth/LoginModal.tsx`            | ★★★★    | ★★★         | ★★      | ★★★     | 3.0      |
| `src/components/booking/BookingProgressBar.tsx` | ★★★★★   | ★★★★★       | ★★★★★   | ★★★★★   | 5.0      |
| `src/components/common/Modal.tsx`               | ★★★★★   | ★★★★        | ★★★★★   | ★★★★★   | 4.75     |
| `src/components/common/SearchBar.tsx`           | ★★★     | ★★          | ★★★     | ★★      | **2.5**  |
| `src/components/ui/DataTable.tsx`               | ★★★★    | ★★          | ★★★     | ★★★     | 3.0      |
| `src/components/form/AirportAutocomplete.tsx`   | ★★★     | ★★          | ★★      | ★★★     | **2.5**  |
| `src/stores/*` (avg)                            | ★★★★    | ★★★★        | ★★★★    | ★★★★    | 4.0      |
| `src/hooks/queries/*` (avg)                     | ★★★     | ★★★★        | ★★★     | ★★★★    | 3.25     |
| `src/views/booking/*` (avg)                     | ★★★★    | ★★★         | ★★★     | ★★★     | 3.25     |
| `src/views/public/auth/*` (avg)                 | ★★★     | ★★★         | ★★      | ★★★     | **2.75** |
| `src/views/public/Tours.tsx`                    | ★★★     | ★★          | ★★      | ★★      | **2.25** |
| `src/views/user/Wishlist.tsx`                   | ★★★     | ★★★★        | ★       | ★★      | **2.5**  |
| `src/views/admin/Dashboard.tsx`                 | ★★★     | ★★★★        | ★       | ★★★     | **2.75** |
| `src/views/admin/users/UserList.tsx`            | ★★★     | ★★          | ★★      | ★★★     | **2.5**  |
| `src/views/booking/Reservation.tsx`             | ★★★     | ★★          | ★★      | ★★      | **2.25** |
| **OVERALL AVG**                                 | **3.6** | **3.3**     | **3.0** | **3.4** | **3.3**  |

**Major issues:** DRY violations (3 layouts, 3 cookie sets, 5 `/trip/` routes, 2 EmptyState, 2 destinations), God component (Header), mock-data sprawl trong admin views.

### 3.6 SOLID Compliance

#### S — Single Responsibility

1. **`Header.tsx`** (455 LOC, 12 trách nhiệm: nav, mega-menu, theme, language, currency, mobile drawer, wishlist, cart, notifications, user avatar, login/register, logout)
2. **`SearchBar.tsx`** (186 LOC, 4 tab hotels/tours/flights/activities với form khác nhau)
3. **`middleware.ts`** (40 LOC, làm cả authN + authZ + routing)

#### O — Open/Closed

1. **`Button.tsx`** — `variant` union, thêm variant phải sửa component
2. **`BookingProgressBar.tsx`** — `STEPS` array hardcode, thêm step phải sửa file
3. **`authStore.ts`** — `User` type imported trực tiếp, thêm field phải sửa type + store + mọi consumer

#### L — Liskov Substitution

1. **`ProtectedRoute` vs `app/admin/layout.tsx`** — cả 2 implement "auth gate" nhưng contract khác nhau (allowedRoles vs single role check, redirect target) — NOT substitutable
2. **`common/EmptyState` vs `ui/EmptyState`** — cùng tên, prop signature khác — NOT substitutable

#### I — Interface Segregation

1. **`Booking` interface** — fat: identity + scheduling + pricing + status + contact. `BookingHistory.tsx` chỉ cần 6 field
2. **`Tour` interface** — 16 field. List view chỉ cần 12
3. **`bookingFlowStore`** — mix data + metadata + actions

#### D — Dependency Inversion

1. **`lib/api.ts:2`** — `import { useAuthStore }` — api layer depend on concrete Zustand store
2. **`i18n/config.ts:5`** — `import { useUIStore }` — i18n depend on concrete UI store
3. **`LoginModal.tsx:24-30`** — direct `fetch('http://localhost:3000/...')` — view depend on concrete URL + HTTP client
4. **`middleware.ts:13`** — depend on specific cookie name `'token'` hardcode

### 3.7 Design Pattern Assessment

#### Patterns dùng đúng

- **Factory** — `axios.create({...})`
- **Interceptor/Middleware** — `api.interceptors.request.use` + `response.use`
- **Observer** — `useUIStore.subscribe` trong `i18n/config.ts:22`
- **Provider** — `QueryProvider`
- **forwardRef + displayName** — `Button`, `Input`, `Card`

#### Patterns thiếu

1. **Repository Pattern** — `lib/api.ts` có `bookingApi` (tốt) nhưng không có `tourRepository`, `userRepository`. View gọi hook trực tiếp, hook gọi `api.get` trực tiếp. Nên có repository layer centralize endpoint + DTO transform
2. **Strategy Pattern** — Pricing logic scatter `BookingSummarySidebar`, `Payment`, `FareClass`, `Reservation` với hardcode numbers. Nên có `PricingStrategy` per fare class
3. **Command Pattern** — Booking flow 7 step, mỗi step mutate `bookingFlowStore`. Nên encapsulate mỗi step là Command object (`SelectFareClassCommand`, `AddPassengerCommand`) với `execute()` + `undo()` — enable proper back navigation
4. **State Machine** — `BookingStatus` transitions không modeled. `currentStep` là number không có transition guards. Nên dùng XState hoặc discriminated union
5. **Adapter Pattern** — BE trả BigInt IDs + Decimal prices; FE dùng `string` + `number`. Không có adapter layer transform BE → FE types

#### Anti-patterns

- **God Component** — `Header.tsx` (455 LOC, 12 trách nhiệm)
- **Prop Drilling** — `currency`/`theme` read từ store 10+ component
- **Layout-in-Page** — mỗi `page.tsx` wrap Layout (R2-FE-002)
- **Magic Numbers/Strings** — 30+ instance hardcode
- **Dead Code** — `mocks/destinations.ts` 254 LOC, `useToursQuery.fetchTours` function, `QueryProvider` `Toaster` import, `Header` `location` var
- **DRY Violations** — 3 cookie-set sites, 3 AdminLayout/UserLayout impls, 2 EmptyState, 2 destination mock, 5 `/trip/${id}` refs, 9 `params?.id as string` casts

---

## 4. Backend Review (Round 2)

### 4.1 File Inventory

Tổng **67 file** đã review.

#### Top 10 file BE rủi ro nhất Round 2

| File                                      | LOC | Risk        | Lý do                                                                                |
| ----------------------------------------- | --- | ----------- | ------------------------------------------------------------------------------------ |
| `prisma/prisma.service.ts`                | 75  | 🔴 Critical | `$use()` deprecated trong Prisma 5+ — app crash tại boot                             |
| `common/utils/encryption.util.ts`         | 32  | 🔴 Critical | Hardcoded fallback `ENCRYPTION_KEY='1234...'`                                        |
| `common/utils/crypto.service.ts`          | 42  | 🟠 High     | `APP_SALT` fallback `crypto.randomBytes` — new salt mỗi restart → data undecryptable |
| `modules/payment/payment.module.ts`       | 9   | 🔴 Critical | Missing `imports: [BookingModule]` → DI fail                                         |
| `modules/review/review.module.ts`         | 7   | 🔴 Critical | Missing `providers: [ReviewService]` → DI fail                                       |
| `modules/wishlist/wishlist.module.ts`     | 7   | 🔴 Critical | Missing `providers: [WishlistService]` → DI fail                                     |
| `modules/booking/booking.service.ts`      | 348 | 🔴 Critical | God service 7 trách nhiệm, `selectSeatForPassenger` dead code                        |
| `modules/auth/auth.service.ts`            | 515 | 🟠 High     | God service, refresh-token logic phức tạp                                            |
| `modules/booking/booking.service.spec.ts` | 89  | 🔴 Critical | Missing `MembershipService` provider → spec crash                                    |
| `modules/payment/payment.service.spec.ts` | 115 | 🔴 Critical | Missing `BookingService` + wrong mock methods → spec crash                           |

### 4.2 Round 1 Verification Matrix

| R1 ID                                            | Status                    | Evidence                                                                                                                                                                                                              | Notes                                                                                                       |
| ------------------------------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| BE-001 (refresh-token DoS)                       | **PARTIAL**               | `auth.service.ts:336-355` dùng `tokenHint` (SHA-256 first 16 hex) + `findMany({where:{tokenHint}})` → O(1)                                                                                                            | Vẫn loop `candidates` với `bcrypt.compare`; không filter `revokedAt:null` (intentional cho theft detection) |
| BE-002/010 (OTP cross-email)                     | **FIXED**                 | `auth.service.ts:99-107`; `schema.prisma:99` thêm `email` column + index                                                                                                                                              | OK                                                                                                          |
| BE-003 (JWT_SECRET fallback)                     | **FIXED**                 | `jwt.strategy.ts:16-21` throw `[FATAL]` if missing                                                                                                                                                                    | OK                                                                                                          |
| BE-004/014 (CORS)                                | **FIXED**                 | `main.ts:40-54` whitelist từ `CORS_ORIGINS` env                                                                                                                                                                       | OK                                                                                                          |
| BE-005 (CryptoService hardcoded key)             | **PARTIAL — NEW BUG**     | `crypto.service.ts:13-18` `APP_SECRET` throw if missing — TỐT. NHƯNG `APP_SALT` fallback `crypto.randomBytes(16).toString('hex')` → **new salt mỗi restart → data undecryptable**                                     | R2-BE-013                                                                                                   |
| BE-006 (Math.random OTP)                         | **FIXED**                 | `auth.service.ts:30-32` `crypto.randomInt(100000, 1000000)`                                                                                                                                                           | OK                                                                                                          |
| BE-008 (IDOR booking)                            | **FIXED**                 | `booking.controller.ts:92-101,120,132,144,156,167` `verifyOwnership()` tất cả 6 endpoint                                                                                                                              | OK                                                                                                          |
| BE-009 (IDOR payment)                            | **FIXED**                 | `payment.service.ts:29-32` ownership check                                                                                                                                                                            | OK                                                                                                          |
| BE-011 (state machine bypass)                    | **PARTIAL**               | `payment.service.ts:122-152` dùng `canTransition()` validate, nhưng vẫn `tx.booking.update({status:'CONFIRMED'})` trực tiếp — bypass `BookingService.updateBookingStatus` (no OCC, no changedBy, no awardPoints hook) | R2-BE-020                                                                                                   |
| BE-012 (updatePassengers stub)                   | **FIXED**                 | `booking.service.ts:275-307` persist via `deleteMany` + `create`                                                                                                                                                      | OK                                                                                                          |
| BE-013 (RegisterDto & otp broken)                | **FIXED**                 | `auth.dto.ts:22-30` `RegisterWithOtpDto extends RegisterDto` with `otp` field                                                                                                                                         | OK                                                                                                          |
| BE-015 (seat lock không link passenger)          | **NOT FIXED — DEAD CODE** | `booking.service.ts:310-347` thêm `selectSeatForPassenger` NHƯNG controller endpoint vẫn gọi `selectSeat` cũ (no link). Expiry job filter `p.seatId != null` → empty array → **seats never released**                 | R2-BE-006                                                                                                   |
| BE-017 (payment idempotency no row-lock)         | **FIXED**                 | `payment.service.ts:122-129` `updateMany where status='PENDING'` atomic conditional update                                                                                                                            | OK                                                                                                          |
| BE-019 (blacklist unverified decode)             | **FIXED**                 | `auth.service.ts:406,411-412` `jwtService.verify()` + SHA-256 hash key                                                                                                                                                | OK                                                                                                          |
| BE-020 (no DTO 11+ endpoint)                     | **PARTIAL**               | DTO added cho booking/review. `wishlist.controller.ts:24-25` vẫn `@Body('itemType')`/`@Body('itemId')` no DTO                                                                                                         | R2-BE-079                                                                                                   |
| BE-022 (console.log OTP)                         | **PARTIAL**               | `auth.service.ts:89-93` no longer log OTP value, nhưng vẫn `console.log` (not `Logger`) + logs email in dev                                                                                                           | R2-BE-022                                                                                                   |
| BE-027/028 (exception filter)                    | **PARTIAL**               | `global-exception.filter.ts:24-44` map P2002/P2025, mask in prod. NHƯNG missing P2003/P2014/P2021/P2024; chỉ trả `message[0]`; no Logger — silently swallowed                                                         | R2-BE-026/027/028                                                                                           |
| BE-030 (email PII leak)                          | **FIXED**                 | `email.processor.ts:60-66` `maskEmail()` helper                                                                                                                                                                       | OK                                                                                                          |
| BE-037 (AuthorizationGuard DB query per request) | **FIXED**                 | `authorization.guard.ts:92-107` Redis cache 5-min TTL. NHƯNG no invalidation on RBAC mutation                                                                                                                         | R2-BE-029                                                                                                   |
| BE-041 (admin getBookings leak passwordHash)     | **FIXED**                 | `admin.controller.ts:52-69` `select` exclude `passwordHash`                                                                                                                                                           | OK                                                                                                          |
| BE-042 (admin updateBookingStatus hardcoded)     | **PARTIAL**               | `admin.controller.ts:96-116` dùng `canTransition()` nhưng bypass `BookingService.updateBookingStatus` — direct `prisma.$transaction([update, createHistory])` no OCC                                                  | R2-BE-037                                                                                                   |
| BE-043/044 (upload MIME spoof)                   | **FIXED**                 | `upload.controller.ts:48-69,71-92` MIME + extension + magic-bytes signature                                                                                                                                           | OK                                                                                                          |
| BE-050 (account lock no unlock)                  | **FIXED — NEW BUG**       | `auth.controller.ts:209-221` + `auth.service.ts:448-459` unlock endpoint + auto-unlock 30 min. NHƯNG controller `throw new Error('Forbidden')` → 500 not 403                                                          | R2-BE-007                                                                                                   |
| BE-053 (new Buffer deprecated)                   | **FIXED**                 | `payment.service.ts:93` `Buffer.from(signData, 'utf-8')`                                                                                                                                                              | OK                                                                                                          |
| BE-061 (notification job name mismatch)          | **FIXED**                 | `notification.service.ts:7-13` `TEMPLATE_TO_JOB` map                                                                                                                                                                  | OK                                                                                                          |
| BE-063 (membership awardPoints dead code)        | **FIXED**                 | `booking.service.ts:262-269` `awardPoints` gọi trên COMPLETED transition                                                                                                                                              | OK                                                                                                          |

**Tally:** Critical 9/14 FIXED, 4 PARTIAL, 1 NOT FIXED (BE-015 dead code). High ~22/35 FIXED.

### 4.3 NEW Findings — Critical

#### R2-BE-001 · `PrismaService.$use()` removed trong Prisma 5+/6+ → app crash tại boot

- **File:** `prisma/prisma.service.ts:15`
- **Description:** Code gọi `this.$use(async (params, next) => {...})` trong constructor. `$use` middleware API **deprecated trong Prisma 4.16 và removed trong Prisma 5.0+**. Version cài `@prisma/client@6.19.2` (package.json declare `^5.22.0`). Verified `node_modules/.prisma/client/default.d.ts` KHÔNG có `$use` member.
- **Impact:** `TypeError: this.$use is not a function` thrown trong PrismaService constructor → `onModuleInit` fail → **Nest không bootstrap được**. Kể cả nếu không crash, zero PII encryption/decryption xảy ra — toàn bộ BE-005/DB-030 "fix" là no-op.
- **Fix Guidance:** Replace `$use` với `$extends` (Prisma 5+ idiom):
  ```ts
  // prisma.service.ts
  constructor() {
    super();
    this.$extends({
      query: {
        user: {
          async create({ model, operation, args, query }) {
            if (args.data?.nationalId) args.data.nationalId = encrypt(args.data.nationalId);
            if (args.data?.passportNo) args.data.passportNo = encrypt(args.data.passportNo);
            return query(args);
          },
          // ... wrap update, upsert, findMany, findUnique
        },
        bookingPassenger: { /* same */ },
      },
    });
  }
  ```

#### R2-BE-002 · PaymentModule missing BookingModule import → DI fail

- **File:** `payment/payment.module.ts:5-9`
- **Description:** `PaymentService` constructor inject `BookingService` (`payment.service.ts:18`), nhưng `PaymentModule` chỉ declare `controllers: [PaymentController], providers: [PaymentService]` — không `imports: [BookingModule]`.
- **Impact:** `Error: Nest can't resolve dependencies of PaymentService (?, PrismaService, ConfigService, BookingService)` tại boot. **App không start.**
- **Fix Guidance:**
  ```ts
  @Module({
    imports: [BookingModule], // ← add
    controllers: [PaymentController],
    providers: [PaymentService],
  })
  export class PaymentModule {}
  ```

#### R2-BE-003 · ReviewModule missing ReviewService provider → DI fail

- **File:** `review/review.module.ts:4-7`
- **Description:** `ReviewController` inject `ReviewService` (`review.controller.ts:31`), nhưng `ReviewModule` chỉ có `controllers: [ReviewController]` — không `providers: [ReviewService]`.
- **Impact:** `Nest can't resolve dependencies of ReviewController (ReviewService, ?)` tại boot.
- **Fix Guidance:** Add `providers: [ReviewService], exports: [ReviewService]`.

#### R2-BE-004 · WishlistModule missing WishlistService provider → DI fail

- **File:** `wishlist/wishlist.module.ts:4-7`
- **Description:** Same pattern as R2-BE-003.
- **Impact:** App không start.
- **Fix Guidance:** Add `providers: [WishlistService], exports: [WishlistService]`.

#### R2-BE-005 · `encryption.util.ts` hardcode fallback `ENCRYPTION_KEY`

- **File:** `common/utils/encryption.util.ts:5`
- **Description:** `const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012');` — identical vulnerability class như Round 1 BE-005, nhưng trong file NEW added để "fix" PII encryption.
- **Impact:** Nếu `ENCRYPTION_KEY` env var thiếu (default in dev), tất cả PII encrypted với hardcoded key publicly-known. Ai có DB dump + source code → decrypt toàn bộ `nationalId`/`passportNo`.
- **Fix Guidance:**
  ```ts
  const rawKey = process.env.ENCRYPTION_KEY;
  if (!rawKey || Buffer.byteLength(rawKey, "utf8") !== 32) {
    throw new Error("[FATAL] ENCRYPTION_KEY must be exactly 32 bytes");
  }
  const ENCRYPTION_KEY = Buffer.from(rawKey, "utf8");
  ```

#### R2-BE-006 · BE-015 "fix" là dead code; seats không bao giờ release bởi expiry job

- **Files:** `booking/booking.service.ts:310-347` (new method); `booking/booking.controller.ts:121` (caller); `jobs/booking-expiry.processor.ts:31-33`
- **Description:** Round 2 thêm `selectSeatForPassenger(bookingId, passengerId, seatId, version)` link `BookingPassenger.seatId`. NHƯNG controller endpoint `PATCH :id/seats` vẫn gọi `bookingService.selectSeat(bookingId, seatId, version)` (no passenger link). Expiry job filter `booking.passengers.filter(p => p.seatId != null)` — vì `selectSeat` không set `seatId` cho passenger nào, filter return `[]` và `flightSeat.updateMany` không bao giờ được gọi.
- **Impact:** Mỗi seat locked qua API bị **permanently locked** — không bao giờ release. Sau vài trăm booking, tất cả seat trên flight phổ biến unavailable. Revenue-impacting data leak.
- **Fix Guidance:** Hoặc (a) đổi controller gọi `selectSeatForPassenger` (require `passengerId` in DTO), hoặc (b) merge link logic vào `selectSeat`:
  ```ts
  // booking.controller.ts
  @Patch(':id/seats')
  async selectSeat(@Param('id') id, @Body() dto: SelectSeatDto, @CurrentUser() user) {
    await this.verifyOwnership(BigInt(id), user.id);
    return this.bookingService.selectSeatForPassenger(
      BigInt(id), BigInt(dto.passengerId), BigInt(dto.seatId), dto.version,
    );
  }
  // SelectSeatDto: add @IsString() passengerId: string;
  ```

#### R2-BE-007 · `auth.controller.ts` admin/unlock throw raw Error → 500 not 403

- **File:** `auth/auth.controller.ts:217-219`
- **Description:**
  ```ts
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden"); // ← raw Error → 500 Internal Server Error
  }
  ```
- **Impact:** Authorization failure return 500 (not 403). Client không distinguish auth failure vs server crash. Bypass global `AuthorizationGuard` + `@Roles('ADMIN')` pattern dùng everywhere else — inconsistent AuthZ.
- **Fix Guidance:** Remove inline check; dùng `@UseGuards(JwtAuthGuard, AuthorizationGuard)` + `@Roles('ADMIN')` trên endpoint. Hoặc `throw new ForbiddenException('Admin only')`.

#### R2-BE-008 · `booking.service.spec.ts` missing MembershipService provider → spec crash

- **File:** `booking/booking.service.spec.ts:12-35`
- **Description:** `BookingService` constructor require `(PrismaService, @InjectQueue('booking'), MembershipService)`. Spec provide PrismaService + queue token nhưng **không** MembershipService. `Test.createTestingModule` throw `Nest can't resolve dependencies of BookingService (?, ?, +)`.
- **Impact:** `npm test` fail immediately cho booking spec. Test suite broken.
- **Fix Guidance:**
  ```ts
  providers: [
    BookingService,
    { provide: PrismaService, useValue: {...} },
    { provide: getQueueToken('booking'), useValue: { add: jest.fn() } },
    { provide: MembershipService, useValue: { awardPoints: jest.fn().mockResolvedValue(undefined) } }, // ← add
  ],
  ```

#### R2-BE-009 · `payment.service.spec.ts` missing BookingService + wrong mock methods

- **File:** `payment/payment.service.spec.ts:12-36, 87-90`
- **Description:** (1) `PaymentService` constructor require `BookingService` — không provide → DI fail. (2) Spec mock `prisma.payment.update` và `prisma.booking.update`, nhưng actual service dùng `tx.payment.updateMany` và `tx.booking.update` trong `$transaction` (payment.service.ts:123, 139). (3) Spec `$transaction` mock (`jest.fn(async (cb) => cb(prisma))`) pass `prisma` as `tx`, nhưng spec chỉ mock `payment.findUnique`/`payment.update` — `updateMany` undefined → `TypeError`.
- **Impact:** Spec fail tại module creation; kể cả nếu fix, assertion không match actual code path.
- **Fix Guidance:** Provide `BookingService` mock + mock `payment.updateMany`, `booking.update`, `bookingStatusHistory.create`.

#### R2-BE-010 · `encryption.util.ts` decrypt return ciphertext on error (silent failure)

- **File:** `common/utils/encryption.util.ts:28-31`
- **Description:**
  ```ts
  } catch (e) {
    console.error('Decryption failed', e);
    return text; // ← returns ciphertext (or garbage) to caller
  }
  ```
- **Impact:** Nếu decryption fail (wrong key, corrupted data, tampered authTag), service silently return raw `enc:iv:authTag:ciphertext` string cho API response. Client thấy garbage thay vì error. Masks data corruption. GCM authTag failure indicate tampering — nên là security event, không silent.
- **Fix Guidance:** Throw `DecryptionException`; let global filter handle. Hoặc return `null` và let service decide.

#### R2-BE-011 · PrismaService $use middleware không handle createMany/updateMany/deleteMany

- **File:** `prisma/prisma.service.ts:19-38`
- **Description:** Middleware check `params.action === 'create' || 'update' || 'upsert'` và access `params.args.data?.nationalId`. Cho `createMany`, Prisma dùng `args.data: [...]` (array) — `args.data?.nationalId` là `undefined` → không encrypt. Same cho `updateMany`.
- **Impact:** Bulk operation (`prisma.user.createMany`, `prisma.bookingPassenger.updateMany`) write plaintext PII. Seed script hoặc batch import bypass encryption entirely.
- **Fix Guidance:** Handle array form:
  ```ts
  if (Array.isArray(params.args.data)) {
    params.args.data = params.args.data.map((rec) => {
      if (rec.nationalId) rec.nationalId = encrypt(rec.nationalId);
      if (rec.passportNo) rec.passportNo = encrypt(rec.passportNo);
      return rec;
    });
  }
  ```

#### R2-BE-012 · Encryption key rotation impossible (key baked into ciphertext format)

- **File:** `common/utils/encryption.util.ts:14`
- **Description:** Ciphertext format `enc:${iv}:${authTag}:${encrypted}` không có key-version prefix. Nếu `ENCRYPTION_KEY` rotated, tất cả existing ciphertext undecryptable (GCM authTag fail).
- **Impact:** No key rotation strategy. Operational risk — nếu key leak, không rotate được mà không lose all PII.
- **Fix Guidance:** Add key version: `enc:v1:${iv}:${authTag}:${encrypted}` và maintain keyring `Map<version, Buffer>`.

#### R2-BE-013 · `crypto.service.ts` `APP_SALT` fallback generate new salt mỗi restart

- **File:** `common/utils/crypto.service.ts:16`
- **Description:** `const salt = this.configService.get<string>('APP_SALT') || crypto.randomBytes(16).toString('hex');` — nếu `APP_SALT` env thiếu, random salt được generate mỗi process start. `scryptSync(key, salt, 32)` produce different `secretKey` mỗi restart.
- **Impact:** Tất cả data encrypted bởi `CryptoService.encrypt()` trong process trước trở nên undecryptable sau restart. Silent data loss.
- **Fix Guidance:** Throw nếu `APP_SALT` missing (same as `APP_SECRET`):
  ```ts
  const salt = this.configService.get<string>("APP_SALT");
  if (!salt)
    throw new Error(
      "[FATAL] APP_SALT required for deterministic key derivation",
    );
  ```

#### R2-BE-014 · `BookingController` inject `PrismaService` trực tiếp + làm data access

- **File:** `booking/booking.controller.ts:88, 92-101, 167-185`
- **Description:** Controller có `private readonly prisma: PrismaService` và chạy `this.prisma.booking.findUnique` trong `verifyOwnership` AND `getBooking`. Controller làm repository work + ownership enforcement + DTO declaration + HTTP routing.
- **Impact:** SRP violation; untestable without mocking Prisma; logic reuse impossible.
- **Fix Guidance:** Move `verifyOwnership` + `getBooking` query vào `BookingService`; controller chỉ orchestrate. Remove `PrismaService` injection từ controller.

### 4.4 NEW Findings — High (tóm tắt)

28 High findings (R2-BE-015 đến R2-BE-043). Tổng hợp:

**Concurrency (8):**

- R2-BE-015: `selectSeatForPassenger` dead code (no caller)
- R2-BE-017: `updatePassengers` không trong transaction → partial failure orphans
- R2-BE-018: `updatePassengers` không gọi `recalculateTotal`
- R2-BE-019: `initiatePayment` transition booking BEFORE create payment record (no tx)
- R2-BE-020: Payment callback bypass `BookingService.updateBookingStatus` (no OCC, no changedBy)
- R2-BE-037: Admin `updateBookingStatus` dùng array `$transaction` (no OCC)
- R2-BE-038: `register` OTP lookup race (no row lock)
- R2-BE-040: `booking-expiry.processor.ts` race với payment callback

**Security (10):**

- R2-BE-021: `generateOtp` RESET_PASSWORD reveal user non-existence
- R2-BE-022: Login auto-unlock bypass admin manual lock
- R2-BE-023: `JwtStrategy` return soft-deleted users
- R2-BE-024: `JwtStrategy.validate` return full user entity (including passwordHash)
- R2-BE-025: Upload signature validation TOCTOU-vulnerable
- R2-BE-029: AuthorizationGuard cache không invalidate trên RBAC mutation
- R2-BE-030: `BigInt(id)` không try/catch (10+ endpoint)
- R2-BE-039: `logout` không invalidate session nếu `session_token` không passed
- R2-BE-042: `requestRefund` dùng `UnauthorizedException` cho ownership violation (sai 401 vs 403)
- R2-BE-043: `idempotencyKey` dùng `Date.now()` (collision-prone)

**Error handling (3):**

- R2-BE-026: GlobalExceptionFilter missing Prisma error codes (P2003/P2014/P2021/P2024)
- R2-BE-027: Filter return only first validation error
- R2-BE-028: Filter không log exception

**Business logic (4):**

- R2-BE-031: `register` set `status:'ACTIVE'` overriding schema default (contradict comment)
- R2-BE-032: `getBooking` duplicate DB query
- R2-BE-033: `requestRefund` không transition booking state
- R2-BE-034: `vnpayCallback` BigInt parse không guard

**Design (3):**

- R2-BE-035: `upvoteReview` abuse ActivityLog as vote table
- R2-BE-036: AuthorizationGuard silent failure khi no permissions assigned
- R2-BE-041: `booking-expiry.processor.ts` không record BookingStatusHistory

### 4.5 Module Risk Heatmap

| Module         | Critical                   | High       | Medium | Low    | Info   | Trend vs R1                          |
| -------------- | -------------------------- | ---------- | ------ | ------ | ------ | ------------------------------------ |
| prisma         | 2 (R2-001, R2-011)         | 1 (R2-013) | 1      | 0      | 0      | ↑ ($use bug startup-blocking)        |
| payment        | 1 (R2-002)                 | 4          | 2      | 1      | 0      | ↓ (idempotency fixed) but DI broken  |
| review         | 1 (R2-003)                 | 1          | 1      | 0      | 0      | → (DI broken, vote hack)             |
| wishlist       | 1 (R2-004)                 | 0          | 1      | 0      | 0      | → (DI broken)                        |
| booking        | 1 (R2-006)                 | 4          | 4      | 1      | 1      | → (IDOR fixed, seat-release broken)  |
| auth           | 1 (R2-007)                 | 4          | 3      | 2      | 0      | ↓ (refresh-token DoS fixed)          |
| common/filters | 0                          | 3          | 0      | 0      | 0      | → (Prisma mapping partial)           |
| common/guards  | 0                          | 1          | 1      | 0      | 0      | ↓ (cache added)                      |
| common/utils   | 2 (R2-005, R2-009/010/012) | 1          | 0      | 0      | 1      | ↑ (new encryption file has new bugs) |
| jobs           | 1 (R2-006 seat-release)    | 2          | 2      | 0      | 1      | →                                    |
| admin          | 0                          | 2          | 2      | 0      | 1      | ↓ (state machine used)               |
| upload         | 0                          | 1          | 3      | 1      | 0      | ↓ (signature check added)            |
| blog           | 0                          | 0          | 3      | 2      | 0      | →                                    |
| flight         | 0                          | 0          | 3      | 0      | 0      | →                                    |
| tour           | 0                          | 0          | 1      | 0      | 0      | →                                    |
| **TOTAL**      | **14**                     | **28**     | **38** | **21** | **14** |                                      |

### 4.6 SOLID + Design Patterns

#### S — Single Responsibility

1. **BookingService** (348 LOC) — 7 trách nhiệm: draft creation, seat locking, voucher application, total recalculation, state machine, passenger management, membership points trigger
2. **AuthService** (515 LOC) — auth + OTP + token generation + token blacklist + device tracking + account lock/unlock + password reset
3. **BookingController** (187 LOC) — DTO declaration + ownership verification + direct Prisma queries + HTTP routing
4. **UploadController** (343 LOC) — file upload + magic-bytes validation + MediaFile CRUD + directory traversal guard

#### O — Open/Closed

1. **PaymentService** — hardcode VNPay. Thêm Stripe/MoMo phải sửa `initiatePayment` + `vnpayCallback`. No `PaymentStrategy` interface
2. **BookingService.canTransition** — hardcode transitions map. Thêm `REFUND_PENDING` state phải sửa method
3. **NotificationService.TEMPLATE_TO_JOB** — hardcode map
4. **ActivityLogService.getActionLabel** — hardcode labels map

#### L — Liskov Substitution

1. **PrismaService extends PrismaClient** — override constructor + thêm `$use`. Với Prisma 5+ remove `$use`, subtype contract khác parent (parent không có `$use` member). Substitution break.
2. **ActivityLogService `@Optional() prisma`** — nếu prisma null, `log()` silently return. Consumer expect "log always succeeds" get silent failure

#### I — Interface Segregation

1. **`ActivityAction` type** — 27-action union. Client cần chỉ auth action phải depend full type
2. **`Cache` interface** — used in AuthorizationGuard, AuthService, FlightService. Mỗi cái chỉ cần `get`+`set`

#### D — Dependency Inversion

1. **All services depend on `PrismaService` concretion** — no `IUserRepository`, `IBookingRepository` abstraction. 13 violations
2. **BookingService depends on `MembershipService` concretion** — should depend on `IPointsService` interface
3. **PaymentService depends on `BookingService` concretion** — should depend on `IBookingStateMachine` interface
4. **JwtStrategy depends on `AuthService` concretion** — should depend on `ITokenBlacklistService` interface

#### Design Patterns

**Patterns dùng đúng:**

- Module/Controller/Service layering (NestJS standard)
- BullMQ Producer/Consumer — `EmailService` + `EmailProcessor` separate
- Decorator — `@Roles`, `@Permissions`, `@CurrentUser`

**Patterns thiếu:**

- **Repository Pattern** — NOT used. 13 service access `PrismaService` trực tiếp. Không abstraction layer. Unit test hard (must mock Prisma internals)
- **CQRS** — NOT used. Single model cho read/write. Read-heavy analytics query same Prisma model
- **Strategy Pattern** — NOT used cho payment method. `PaymentService` VNPay-only. Thêm Stripe phải sửa service
- **Factory** — NOT used. `generateTokens` quasi-factory private
- **Observer/Event-Driven** — NOT used. `BookingService.updateBookingStatus` directly call `membershipService.awardPoints`. Should emit `BookingCompletedEvent`
- **State Machine** — `canTransition` hardcode map, not proper State Pattern

**Anti-patterns:**

- God Service — BookingService (348 LOC), AuthService (515 LOC), UploadController (343 LOC)
- Anemic Domain Model — `BookingStatusHistory`, `PointTransaction`, `ActivityLog` pure data record, no behavior
- Fat Controller — BookingController, UploadController, RbacController (270 LOC)
- Primitive Obsession — `userId: bigint`, `bookingId: bigint` everywhere. Should be value objects `UserId`, `BookingId`
- Shotgun Surgery — Adding field to `User` requires editing: schema, PrismaService middleware, AuthService, UserService, AdminController, JwtStrategy. No single source of truth
- Cargo Cult — `@UseGuards(JwtAuthGuard, AuthorizationGuard)` + `@Roles('ADMIN')` + `@Permissions('X')` everywhere, nhưng `AuthorizationGuard` silently pass nếu no `@Permissions` decorator

---

## 5. Database Review (Round 2)

### 5.1 Schema Overview

42 model · 21 enum · ~280 field · **38 FK declared** (R1: 19, +19 mới) · **~50 indexes** (R1: ~30, +20 mới) · 1 soft-delete column · 0 CHECK constraint.

**Round 1 → Round 2 changes:**

- +19 FK concrete (Flight→Aircraft/Airport, FlightSeat→FlightFareClass, Tour→Destination, BookingPassenger→Seat/FareClass, BookingStatusHistory→User, Refund→Payment/User, VoucherRedemption→Voucher/User/Booking, UserPoints→Tier, PointTransaction→User/Booking, BlogPost→User/Category, MediaFile→User, Notification→User, AuditLog→User)
- +20+ indexes (RefreshToken 3 idx, OtpCode 2 idx, LoginHistory 1 idx, AuditLog 3 idx, Notification 1 idx, FlightSeat 2 idx, FlightFareClass 1 UK+1 idx, Tour 4 idx, Payment 1 idx, VoucherRedemption 2 idx, Refund 2 idx, BlogPost 4 idx, MediaFile 1 idx, PointTransaction 2 idx, BookingStatusHistory 1 idx, Review 2 idx, UserDevice 1 UK)
- Decimal fields đổi từ `DECIMAL(65,30)` → `@db.Decimal(18, 2)` cho money, `@db.Decimal(3, 1)` cho ratingAvg
- `RefreshToken.tokenHint` column mới (SHA-256 first 16 hex) cho O(1) lookup
- `OtpCode.email` column mới + `OtpCode.attempts` column mới
- `UserDevice @@unique([userId, deviceFingerprint])` mới
- `FlightFareClass @@unique([flightId, className])` mới
- `VoucherRedemption @@unique([voucherId, userId])` mới (DB-004 fix — nhưng conflict, xem R2-DB-002)
- `onDelete: Cascade` cho 15+ relation (Booking→User, BookingPassenger→Booking, Payment→Booking, etc.)

**NHƯNG:** Migration #1 **không được update** — vẫn tạo old broken schema. Xem R2-DB-001.

### 5.2 Round 1 Verification Matrix

| R1 ID                                     | Status                | Evidence                                                                                                                                                                                                                                                                                                                 | Notes                                                                          |
| ----------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| DB-001 (Flight thiếu FK)                  | **PARTIAL**           | `schema.prisma:189-194` có relations. **Migration #1 không có FK constraint**                                                                                                                                                                                                                                            | Drift                                                                          |
| DB-002 (Tour.destinationId no FK)         | **PARTIAL**           | `schema.prisma:280-281` có relation. Migration drift                                                                                                                                                                                                                                                                     | Same                                                                           |
| DB-003 (RefreshToken no index)            | **PARTIAL**           | `schema.prisma:91-93` 3 indexes. `auth.service.ts:339` dùng `tokenHint`. Migration drift                                                                                                                                                                                                                                 | Code OK                                                                        |
| DB-004 (VoucherRedemption unique sai)     | **PARTIAL — NEW BUG** | `schema.prisma:485-486` có cả 2 UK `(voucherId, bookingId)` VÀ `(voucherId, userId)`                                                                                                                                                                                                                                     | **Conflict** — user không re-dùng voucher sau booking CANCELLED. Xem R2-DB-002 |
| DB-005 (OtpCode userId=0)                 | **PARTIAL**           | `schema.prisma:99` thêm `email String?`. `auth.service.ts:99-107` query theo email. **`userId BigInt @default(0)` vẫn còn** — block FK                                                                                                                                                                                   | R2-DB-005                                                                      |
| DB-006 (Migration #2 NOT NULL no default) | **FIXED**             | Migration #2 có `DEFAULT CURRENT_TIMESTAMP(3)`                                                                                                                                                                                                                                                                           | Stale comment warning còn                                                      |
| DB-007 (Migration #2 lowercase)           | **FIXED**             | Migration #2 dùng PascalCase                                                                                                                                                                                                                                                                                             | OK                                                                             |
| DB-008 (19 FKs thiếu)                     | **PARTIAL**           | Schema thêm 19 FK mới. **Migration #1 không có**                                                                                                                                                                                                                                                                         | Drift                                                                          |
| DB-009 to DB-024 (indexes thiếu)          | **PARTIAL**           | Schema thêm tất cả. **Migration #1 không có**                                                                                                                                                                                                                                                                            | Drift                                                                          |
| DB-025 (Decimal oversize)                 | **PARTIAL**           | Schema dùng `@db.Decimal(18,2)`. **Migration #1 vẫn `DECIMAL(65,30)`**                                                                                                                                                                                                                                                   | Drift                                                                          |
| DB-026 (BigInt serialization)             | **FIXED**             | `main.ts:109-111` patch `BigInt.prototype.toJSON`                                                                                                                                                                                                                                                                        | OK                                                                             |
| DB-027 (soft delete inconsistent)         | **NOT FIXED**         | Chỉ `User.deletedAt`. Không có middleware auto-filter. `analytics.service.ts:307` manually filter 1 chỗ; tất cả query khác không filter                                                                                                                                                                                  | Same                                                                           |
| DB-028 (FKs ON DELETE RESTRICT)           | **PARTIAL — NEW BUG** | Schema dùng Cascade cho 15+ relation, bao gồm `Booking→User`. **Booking→User Cascade nguy hiểm**: hard-delete user → mất toàn bộ booking history (legal compliance violation, Luật Kế toán 2015 Điều 40 yêu cầu giữ 10 năm)                                                                                              | R2-DB-009                                                                      |
| DB-029 (seed not idempotent)              | **NOT FIXED**         | `seed.ts:94-130` vẫn `deleteMany()` tất cả tables. `create()` không `upsert()`                                                                                                                                                                                                                                           | Same                                                                           |
| DB-030 (PII plaintext)                    | **PARTIAL**           | `prisma.service.ts:15-65` $use middleware encrypt/decrypt `nationalId` + `passportNo`. AES-256-GCM. **5 sub-issues**: (1) `ENCRYPTION_KEY` default hardcode; (2) `$use`deprecated Prisma 5; (3)`email`/`phone` vẫn plaintext; (4) middleware không encrypt trong WHERE clause; (5) decrypt recursive chỉ check depth 1-2 | R2-DB-003, R2-DB-004, R2-DB-016                                                |

**Tổng**: 3/30 FIXED, 25/30 PARTIAL, 2/30 NOT FIXED.

### 5.3 NEW Findings — Critical

#### R2-DB-001 · Migration #1 không được update sau khi fix schema → drift nghiêm trọng

- **File:** `prisma/migrations/20260714122144_add_rbac_session_activity_blog_v2/migration.sql` (609 lines, unchanged từ initial commit `bb9434d`)
- **Description:** `git diff bb9434d..0d0bd1a -- backend/prisma/migrations/20260714122144_*.sql` trả về **empty** — migration #1 không hề được sửa. Schema.prisma đã thêm 19 FK mới, 30+ indexes mới, columns mới (`RefreshToken.tokenHint`, `OtpCode.email`, `OtpCode.attempts`), đổi `DECIMAL(65,30)` → `DECIMAL(18,2)`, nhưng migration #1 vẫn tạo schema cũ:
  - `RefreshToken` (sql:44-53): chỉ có `id, userId, tokenHash, expiresAt, revokedAt, deviceInfo` + PRIMARY KEY — **KHÔNG có `tokenHint` column, KHÔNG có 3 indexes mới**
  - `OtpCode` (sql:56-65): chỉ có `id, userId, codeHash, purpose, expiresAt, consumedAt` — **KHÔNG có `email`, `attempts` columns, KHÔNG có 2 indexes mới**
  - `Flight` (sql:138-151): chỉ có 1 index `[departureAirportId, arrivalAirportId, departureTime]` — **KHÔNG có FK constraints tới Aircraft/Airport**
  - `FlightFareClass` (sql:154-163): `basePrice DECIMAL(65, 30)` — **KHÔNG phải `DECIMAL(18, 2)`**
  - `Tour` (sql:193-205): `basePrice DECIMAL(65, 30)`, `ratingAvg DECIMAL(65, 30)` — **KHÔNG phải `DECIMAL(18, 2)` và `DECIMAL(3, 1)`**, **KHÔNG có FK `destinationId_fkey`**
  - `Booking.totalAmount DECIMAL(65, 30)`, `Payment.amount DECIMAL(65, 30)`, `Refund.amount DECIMAL(65, 30)`, `Voucher` 3 fields DECIMAL(65,30) — **TẤT CẢ vẫn oversize**
  - `VoucherRedemption` (sql:331-340): chỉ có `@@unique([voucherId, bookingId])` — **KHÔNG có `@@unique([voucherId, userId])`** (DB-004 fix)
  - Chỉ 19 FK constraints được tạo (sql:554-609), vs ~38 FK trong schema mới
- **Impact:** `prisma migrate deploy` trên fresh DB (CI/CD, new dev onboarding, prod deployment) tạo **OLD broken schema** — không có FKs, không có indexes, oversize Decimals, không có tokenHint/email/attempts columns. Code fail runtime: `auth.service.ts:339` query `where: { tokenHint }` → `Unknown column 'tokenHint'` error. `auth.service.ts:99` query `where: { email }` on OtpCode → `Unknown column 'email'` error. **Toàn bộ app broken trên fresh DB.**
- **Fix Guidance:** Tạo migration #3 để sync schema:

  ```sql
  -- prisma/migrations/20260715000000_sync_schema_with_round1_fixes/migration.sql

  -- Add missing columns
  ALTER TABLE `RefreshToken` ADD COLUMN `tokenHint` VARCHAR(191) NULL;
  ALTER TABLE `OtpCode` ADD COLUMN `email` VARCHAR(191) NULL,
                          ADD COLUMN `attempts` INTEGER NOT NULL DEFAULT 0;

  -- Add missing indexes
  CREATE INDEX `RefreshToken_userId_revokedAt_idx` ON `RefreshToken`(`userId`, `revokedAt`);
  CREATE INDEX `RefreshToken_expiresAt_idx` ON `RefreshToken`(`expiresAt`);
  CREATE INDEX `RefreshToken_tokenHint_idx` ON `RefreshToken`(`tokenHint`);
  -- ... (all 30+ indexes)

  -- Add missing FKs
  ALTER TABLE `Flight` ADD CONSTRAINT `Flight_aircraftId_fkey`
    FOREIGN KEY (`aircraftId`) REFERENCES `Aircraft`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
  -- ... (all 19 FKs)

  -- Fix Decimal sizes
  ALTER TABLE `FlightFareClass` MODIFY COLUMN `basePrice` DECIMAL(18, 2) NOT NULL;
  ALTER TABLE `Tour` MODIFY COLUMN `basePrice` DECIMAL(18, 2) NOT NULL,
                       MODIFY COLUMN `ratingAvg` DECIMAL(3, 1) NOT NULL DEFAULT 0;
  -- ... (all Decimal fixes)

  -- Add VoucherRedemption second UK
  CREATE UNIQUE INDEX `VoucherRedemption_voucherId_userId_key` ON `VoucherRedemption`(`voucherId`, `userId`);
  ```

  Better: **squash migrations** — `prisma migrate resolve --rolled-back 20260714122144_add_rbac_session_activity_blog_v2` + delete folder + `prisma migrate dev --name init` để tạo lại migration #1 từ schema hiện tại.

#### R2-DB-002 · VoucherRedemption: 2 unique constraints conflict → user không re-dùng voucher sau booking CANCELLED

- **File:** `schema.prisma:475-489`
- **Description:** Schema có cả 2 constraints:
  ```prisma
  @@unique([voucherId, bookingId]) // prevent applying same voucher to same booking twice
  @@unique([voucherId, userId])    // DB-004 fix: prevent user from using same voucher multiple times
  ```
  Khi user áp dụng voucher `V1` cho booking `B1` (status DRAFT → CANCELLED do timeout), record `VoucherRedemption(voucherId=V1, userId=U1, bookingId=B1)` tồn tại vĩnh viễn. Nếu user muốn áp dụng `V1` cho booking mới `B2`:
  - `bookingService.applyVoucher` (booking.service.ts:143) gọi `tx.voucherRedemption.create({ data: { voucherId: V1, userId: U1, bookingId: B2 } })`
  - `@@unique([voucherId, userId])` bị vi phạm (V1+U1 đã tồn tại) → `PrismaClientKnownRequestError` P2002
  - User bị khóa vĩnh viễn khỏi voucher `V1` dù booking `B1` đã CANCELLED
- **Impact:** UX broken — user mất voucher do booking bị cancel (timeout 15 phút, payment fail, etc.). Business rule sai: intent là "một user chỉ được hưởng discount của voucher MỘT LẦN thành công", không phải "một user chỉ được APPLY voucher một lần bất kể kết quả".
- **Fix Guidance:** 3 options:
  1. **Drop `@@unique([voucherId, userId])`**, giữ chỉ `@@unique([voucherId, bookingId])` + thêm application-level check trong `applyVoucher`:
     ```typescript
     const existingSuccessRedemption = await tx.voucherRedemption.findFirst({
       where: {
         voucherId: voucher.id,
         userId,
         booking: { status: { in: ["CONFIRMED", "COMPLETED"] } },
       },
     });
     if (existingSuccessRedemption)
       throw new BadRequestException("Bạn đã sử dụng voucher này rồi");
     ```
  2. **Delete VoucherRedemption record khi booking CANCELLED** (trong `bookingService.updateBookingStatus` hoặc `booking-expiry.processor.ts`):
     ```typescript
     if (newStatus === "CANCELLED") {
       await tx.voucherRedemption.deleteMany({ where: { bookingId } });
       await tx.voucher.update({
         where: { id: voucherId },
         data: { usedCount: { decrement: 1 } },
       });
     }
     ```
  3. **Thêm `status` column vào VoucherRedemption** + unique partial index.

#### R2-DB-003 · `ENCRYPTION_KEY` default hardcoded `'12345678901234567890123456789012'`

- **File:** `encryption.util.ts:5`
- **Description:**
  ```typescript
  const ENCRYPTION_KEY = Buffer.from(
    process.env.ENCRYPTION_KEY || "12345678901234567890123456789012",
  );
  ```
  Nếu `process.env.ENCRYPTION_KEY` không set, PII (`nationalId`, `passportNo` của User + BookingPassenger) được encrypt bằng hardcoded key này. Attacker có source code (public repo GitHub) + DB dump → decrypt toàn bộ PII.
- **Impact:** Mass PII leak nếu env var thiếu. `crypto.service.ts:13-15` (CryptoService dùng `APP_SECRET`) đã throw error nếu thiếu — `encryption.util.ts` không consistent.
- **Fix Guidance:**
  ```typescript
  const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY;
  if (!ENCRYPTION_KEY_RAW || ENCRYPTION_KEY_RAW.length !== 32) {
    throw new Error(
      "[FATAL] ENCRYPTION_KEY must be a 32-byte string. Application startup aborted.",
    );
  }
  const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_RAW);
  ```

### 5.4 NEW Findings — High (tóm tắt)

13 High findings (R2-DB-004 đến R2-DB-016). Tổng hợp:

**Migration/Drift (1):**

- R2-DB-001 (đã cover ở Critical)

**Security (3):**

- R2-DB-004: Prisma `$use()` deprecated trong Prisma 5 — silently break trên upgrade
- R2-DB-016: PrismaService middleware không encrypt `nationalId`/`passportNo` trong WHERE clause → lookup by PII silently fails

**Schema (4):**

- R2-DB-005: `OtpCode.userId` vẫn `@default(0)` → block FK
- R2-DB-006: `RefreshToken.tokenHint` là `String?` nullable nhưng code luôn set
- R2-DB-007: `auth.service.ts:339` findMany return nhiều records, loop bcrypt → O(N) nếu collision
- R2-DB-009: Booking → User `onDelete: Cascade` → hard-delete user mất toàn bộ booking history (legal compliance)

**Constraint (3):**

- R2-DB-010: Không có CHECK constraint nào trong toàn schema
- R2-DB-013: `schema.test.prisma` chỉ có 2 models, Int IDs — không match production
- R2-DB-014: `BookingStatusHistory.fromStatus`/`toStatus` là String không phải enum

**Index (1):**

- R2-DB-011: `ActivityLog.findFirst` query theo `(userId, action)` nhưng không có index tương ứng

**Seed (1):**

- R2-DB-015: `seed.ts` vẫn không idempotent — `deleteMany()` wipe data, không safe cho concurrent

### 5.5 Migration Drift Audit

#### Migration #1: `20260714122144_add_rbac_session_activity_blog_v2/migration.sql` (609 lines)

- **Changes from R1**: NONE (git diff returns empty)
- **Status**: **BROKEN DRIFT** — creates old schema with:
  - `DECIMAL(65, 30)` cho tất cả money/rating fields (should be `DECIMAL(18, 2)` / `DECIMAL(3, 1)`)
  - Missing columns: `RefreshToken.tokenHint`, `OtpCode.email`, `OtpCode.attempts`
  - Missing indexes: all 30+ new indexes from R2 schema
  - Missing FK constraints: all 19 new FKs from R2 schema
  - Missing unique constraints: `FlightFareClass @@unique([flightId, className])`, `UserDevice @@unique([userId, deviceFingerprint])`, `VoucherRedemption @@unique([voucherId, userId])`
- **Drift severity**: CRITICAL — `prisma migrate deploy` produces broken schema

#### Migration #2: `20260714123314_add_booking_payment_timestamps/migration.sql` (20 lines)

- **Changes from R1**:
  - `booking` → `Booking` (PascalCase fix — DB-007)
  - `payment` → `Payment` (PascalCase fix — DB-007)
  - `updatedAt DATETIME(3) NOT NULL` → `updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` (DB-006 fix)
- **Status**: FIXED but stale comment warning remains (R2-DB-008)

#### Drift Analysis

- `prisma migrate diff --from-migrations ./migrations --to-schema-datamodel ./schema.prisma` would show 50+ diffs
- `prisma migrate deploy` on fresh DB → old broken schema
- `prisma db push` → syncs schema but bypasses migration history (no audit trail)
- **Recommendation**: Create Migration #3 to sync, OR squash all migrations into single `init` migration

### 5.6 FK & Constraint Audit

| Model                | Field              | Has FK?       | onDelete    | R1 → R2 | Recommendation                                   |
| -------------------- | ------------------ | ------------- | ----------- | ------- | ------------------------------------------------ |
| RefreshToken         | userId             | Y             | Cascade     | Y → Y   | OK                                               |
| OtpCode              | userId             | N (default 0) | —           | N → N   | Change to `BigInt?` + FK (R2-DB-005)             |
| LoginHistory         | userId             | Y             | Cascade     | Y → Y   | Consider RESTRICT                                |
| UserDevice           | userId             | Y             | Cascade     | Y → Y   | OK                                               |
| UserSession          | userId             | Y             | Cascade     | Y → Y   | OK                                               |
| Flight               | aircraftId         | Y (NEW)       | RESTRICT    | N → Y   | OK                                               |
| Flight               | departureAirportId | Y (NEW)       | RESTRICT    | N → Y   | OK                                               |
| Flight               | arrivalAirportId   | Y (NEW)       | RESTRICT    | N → Y   | OK                                               |
| FlightFareClass      | flightId           | Y             | RESTRICT    | Y → Y   | Change to Cascade                                |
| FlightSeat           | flightId           | Y             | RESTRICT    | Y → Y   | Change to Cascade                                |
| FlightSeat           | fareClassId        | Y (NEW)       | RESTRICT    | N → Y   | OK                                               |
| Tour                 | destinationId      | Y (NEW)       | RESTRICT    | N → Y   | OK                                               |
| Booking              | userId             | Y             | **Cascade** | Y → Y   | **Change to RESTRICT + soft-delete** (R2-DB-009) |
| BookingPassenger     | bookingId          | Y             | Cascade     | Y → Y   | OK                                               |
| BookingPassenger     | seatId             | Y (NEW)       | RESTRICT    | N → Y   | Consider SET NULL                                |
| BookingPassenger     | fareClassId        | Y (NEW)       | RESTRICT    | N → Y   | OK                                               |
| BookingStatusHistory | changedBy          | Y (NEW)       | RESTRICT    | N → Y   | Consider SET NULL                                |
| Payment              | bookingId          | Y             | Cascade     | Y → Y   | Change to RESTRICT                               |
| Refund               | paymentId          | Y (NEW)       | RESTRICT    | N → Y   | Consider Cascade                                 |
| Refund               | processedBy        | Y (NEW)       | RESTRICT    | N → Y   | Consider SET NULL                                |
| VoucherRedemption    | voucherId          | Y (NEW)       | RESTRICT    | N → Y   | OK                                               |
| VoucherRedemption    | userId             | Y (NEW)       | Cascade     | N → Y   | Change to RESTRICT                               |
| VoucherRedemption    | bookingId          | Y (NEW)       | Cascade     | N → Y   | Change to RESTRICT                               |
| Review               | userId             | Y             | Cascade     | Y → Y   | Change to RESTRICT                               |
| UserPoints           | userId             | Y (UK, no FK) | —           | N → N   | Add FK + Cascade                                 |
| UserPoints           | tierId             | Y (NEW)       | RESTRICT    | N → Y   | Change to SET NULL                               |
| PointTransaction     | userId             | Y (NEW)       | Cascade     | N → Y   | Consider RESTRICT                                |
| BlogPost             | authorId           | Y (NEW)       | RESTRICT    | N → Y   | OK                                               |
| BlogPost             | categoryId         | Y (NEW)       | RESTRICT    | N → Y   | Consider SET NULL                                |
| MediaFile            | uploadedBy         | Y (NEW)       | RESTRICT    | N → Y   | Consider SET NULL                                |
| Notification         | userId             | Y (NEW)       | RESTRICT    | N → Y   | Change to Cascade                                |
| AuditLog             | adminUserId        | Y (NEW)       | RESTRICT    | N → Y   | OK                                               |
| ActivityLog          | userId             | Y             | Cascade     | Y → Y   | Consider RESTRICT                                |

**Tổng FKs**: R1 = 19, R2 = 38 (19 new FKs in schema, **0 in migration #1**).

---

## 6. Cross-cutting Concerns

### 6.1 App không boot được (showstopper)

3 lỗi khiến `npm run start:dev` fail ngay tại startup:

1. **R2-BE-001**: `PrismaService.$use()` removed trong Prisma 6 → `TypeError` trong constructor → `onModuleInit` fail
2. **R2-BE-002/003/004**: 3 module thiếu `imports`/`providers` → `Nest can't resolve dependencies`
3. **R2-DB-001**: (không crash boot, nhưng `prisma migrate deploy` tạo broken schema → code fail runtime)

**Verification cần làm trước báo cáo "fix done":** `npm run start:dev` phải chạy được mà không throw error.

### 6.2 Type Drift giữa FE và BE (vẫn chưa fix)

| Field                 | FE type                                                               | BE type                                                                | Issue                                               |
| --------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| `User.id`             | `string`                                                              | `BigInt` (serialized as string via toJSON patch)                       | OK nếu patch chạy                                   |
| `User.role`           | `'User' \| 'Admin' \| 'Staff'` (capitalized)                          | enum `USER \| STAFF \| ADMIN` (uppercase)                              | **Casing mismatch** — R2-FE-003                     |
| `Tour.price`          | `number`                                                              | `Decimal` (serialized as string)                                       | **Precision loss** nếu Number()                     |
| `Booking.totalAmount` | `number`                                                              | `Decimal`                                                              | Same                                                |
| `Booking.status`      | `'Pending' \| 'Confirmed' \| 'Cancelled' \| 'Completed'` (PascalCase) | enum `DRAFT \| PENDING_PAYMENT \| CONFIRMED \| CANCELLED \| COMPLETED` | **Missing `DRAFT`, `PENDING_PAYMENT`; casing khác** |
| `FareClass`           | `'Economy' \| 'Premium Economy' \| 'Business' \| 'First Class'`       | enum `ECONOMY \| PREMIUM_ECONOMY \| BUSINESS`                          | **Casing + thiếu First**                            |

### 6.3 Authentication flow vẫn broken end-to-end

```
FE Login.tsx (đã call BE)
  → fetch('http://localhost:3000/api/auth/login')  ← hardcoded URL
  → set document.cookie = 'token=...; max-age=86400; samesite=lax'  ← no secure, no httpOnly
  → authStore.login(user, access_token)
  → authStore persisted to sessionStorage (exclude token)
  → token in-memory only

After refresh:
  → authStore.token = null  ← in-memory lost
  → lib/api.ts:15 reads useAuthStore.getState().token → null
  → Authorization header empty
  → BE returns 401
  → api.ts:23-38 retry interceptor kicks in
  → axios.post('http://localhost:3000/api/auth/refresh', {}, { withCredentials: true })
  → BE refresh endpoint reads cookie, returns new access_token
  → api(originalRequest) retry with NEW token... but authStore.token still null
  → Next 401 → infinite loop
```

**Proper flow should be:**

- BE `/auth/login` set 2 cookies: `access_token` (httpOnly, 15min) + `refresh_token` (httpOnly, 7d, SameSite=Strict)
- FE store only `user` profile (non-sensitive) in JS-accessible store
- BE CORS whitelist FE origin, `credentials: true`
- BE `/auth/refresh` read cookie, return new access_token cookie
- FE không bao giờ touch token

### 6.4 Booking flow vẫn broken end-to-end

```
FE booking flow (9 step):
  passenger → fare-class → seat → baggage → meal → addons → payment → success → ticket

BE booking flow (real):
  POST /api/booking (create draft)
  → patch /:id/seats (selectSeat — NOT selectSeatForPassenger, no link)
  → put /:id/passengers (updatePassengers — has impl now)
  → patch /:id/voucher
  → POST /api/payments/:bookingId/initiate
  → VNPay callback

Gaps:
  - FE không gọi BE (admin views still mock)
  - BE selectSeat không link passenger → expiry job không release ghế (R2-BE-006)
  - BookingSuccess navigate /booking/ticket/NEWPNR (wrong segment order — R2-FE-005)
  - DownloadTicket render static data
```

### 6.5 Migration workflow broken

- Schema.prisma đã fix nhiều nhưng migration #1 không sync
- `prisma db push` (dev) syncs schema, bypasses migration history
- `prisma migrate deploy` (prod/CI) tạo old broken schema → app crash
- **Need**: Tạo migration #3 OR squash migrations

### 6.6 Test suite broken

- `booking.service.spec.ts` crash tại module creation (missing MembershipService provider)
- `payment.service.spec.ts` crash tại module creation (missing BookingService + wrong mock methods)
- `auth.service.spec.ts` (409 LOC) có type errors từ R1 chưa fix
- E2E test chỉ test `GET /`

### 6.7 Documentation vs reality (cập nhật)

- README claim "JWT + Refresh Token Rotation with token theft detection" — **FIXED** (BE-001 partial — tokenHint + bcrypt loop)
- README claim "Optimistic locking for concurrent seat booking" — **BROKEN** (BE-015 dead code — seat không link passenger, expiry không release)
- README claim "VNPay payment integration with idempotency" — **FIXED** (BE-017 atomic updateMany)
- README claim "Fine-grained RBAC with Permission-based access control" — **PARTIAL** (cache added nhưng no invalidation)
- README claim "Async email queue via BullMQ" — **FIXED** (PII mask applied)
- README claim "Session management with device tracking" — **PARTIAL** (sessionToken không hash trong DB)

---

## 7. Bug Fix Guidance — Top Issues

### 7.1 Showstopper Fixes (must do trước mọi thứ khác)

#### Fix 1: PrismaService $use → $extends (R2-BE-001)

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "./encryption.util";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();

    // PII fields to encrypt
    const PII_FIELDS = ["nationalId", "passportNo"];

    // Helper to encrypt record data
    const encryptPii = (data: any) => {
      if (!data) return data;
      for (const field of PII_FIELDS) {
        if (data[field] !== undefined && data[field] !== null) {
          data[field] = encrypt(data[field]);
        }
      }
      return data;
    };

    // Helper to decrypt record(s)
    const decryptPii = (record: any) => {
      if (!record) return record;
      if (Array.isArray(record)) return record.forEach(decryptPii);
      for (const field of PII_FIELDS) {
        if (
          record[field] &&
          typeof record[field] === "string" &&
          record[field].startsWith("enc:")
        ) {
          record[field] = decrypt(record[field]);
        }
      }
      // Decrypt nested user/passengers
      if (record.user) decryptPii(record.user);
      if (record.passengers) record.passengers.forEach(decryptPii);
      return record;
    };

    // Use $extends (Prisma 5+ idiom) instead of $use
    this.$extends({
      query: {
        user: {
          async create({ args, query }) {
            args.data = encryptPii(args.data);
            return query(args);
          },
          async update({ args, query }) {
            args.data = encryptPii(args.data);
            return query(args);
          },
          async upsert({ args, query }) {
            args.create = encryptPii(args.create);
            args.update = encryptPii(args.update);
            return query(args);
          },
          async createMany({ args, query }) {
            if (Array.isArray(args.data)) args.data = args.data.map(encryptPii);
            else args.data = encryptPii(args.data);
            return query(args);
          },
          // Decrypt on read
          async findUnique({ args, query }) {
            const r = await query(args);
            return decryptPii(r);
          },
          async findFirst({ args, query }) {
            const r = await query(args);
            return decryptPii(r);
          },
          async findMany({ args, query }) {
            const r = await query(args);
            return decryptPii(r);
          },
        },
        bookingPassenger: {
          // Same pattern as user
          async create({ args, query }) {
            args.data = encryptPii(args.data);
            return query(args);
          },
          async update({ args, query }) {
            args.data = encryptPii(args.data);
            return query(args);
          },
          // ... etc
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

#### Fix 2: 3 Module DI breaks (R2-BE-002/003/004)

```typescript
// payment/payment.module.ts
import { Module } from "@nestjs/common";
import { BookingModule } from "../booking/booking.module"; // ← add
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

@Module({
  imports: [BookingModule], // ← add
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}

// review/review.module.ts
import { Module } from "@nestjs/common";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";

@Module({
  controllers: [ReviewController],
  providers: [ReviewService], // ← add
  exports: [ReviewService],
})
export class ReviewModule {}

// wishlist/wishlist.module.ts
import { Module } from "@nestjs/common";
import { WishlistController } from "./wishlist.controller";
import { WishlistService } from "./wishlist.service";

@Module({
  controllers: [WishlistController],
  providers: [WishlistService], // ← add
  exports: [WishlistService],
})
export class WishlistModule {}
```

#### Fix 3: Tạo Migration #3 sync schema (R2-DB-001)

```bash
# Option A: Tạo migration mới
npx prisma migrate dev --name sync_round1_fixes --create-only
# Edit generated migration.sql manually to include all ALTER statements
npx prisma migrate dev

# Option B: Squash migrations (recommended)
npx prisma migrate resolve --rolled-back 20260714122144_add_rbac_session_activity_blog_v2
npx prisma migrate resolve --rolled-back 20260714123314_add_booking_payment_timestamps
rm -rf prisma/migrations/20260714122144_*
rm -rf prisma/migrations/20260714123314_*
npx prisma migrate dev --name init
```

#### Fix 4: Encryption key hardcode (R2-DB-003 + R2-BE-005 + R2-BE-013)

```typescript
// common/utils/encryption.util.ts
import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY;
if (
  !ENCRYPTION_KEY_RAW ||
  Buffer.byteLength(ENCRYPTION_KEY_RAW, "utf8") !== 32
) {
  throw new Error(
    "[FATAL] ENCRYPTION_KEY must be exactly 32 bytes. " +
      "Application startup aborted. Set ENCRYPTION_KEY in your .env file.",
  );
}
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_RAW, "utf8");

export function encrypt(text: string): string {
  /* ... */
}
export function decrypt(text: string): string {
  if (!text || !text.startsWith("enc:")) return text;
  try {
    /* ... */
  } catch (e) {
    // R2-BE-010 fix: throw instead of silent return
    throw new Error(
      "Decryption failed — data may be corrupted or tampered with",
    );
  }
}

// common/utils/crypto.service.ts
@Injectable()
export class CryptoService {
  private readonly secretKey: Buffer;

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>("APP_SECRET");
    const salt = this.configService.get<string>("APP_SALT");
    if (!secret) throw new Error("[FATAL] APP_SECRET required");
    if (!salt)
      throw new Error(
        "[FATAL] APP_SALT required for deterministic key derivation",
      );
    this.secretKey = crypto.scryptSync(secret, salt, 32);
  }
  // ...
}
```

#### Fix 5: Seat link + expiry release (R2-BE-006 + R2-BE-015)

```typescript
// booking/dto/select-seat.dto.ts
import { IsString, IsInt, Min } from 'class-validator';
export class SelectSeatDto {
  @IsString() passengerId: string;
  @IsString() seatId: string;
  @IsInt() @Min(0) version: number;
}

// booking/booking.controller.ts
@Patch(':id/seats')
async selectSeat(
  @Param('id') id: string,
  @Body() dto: SelectSeatDto,
  @CurrentUser() user: AuthenticatedUser,
) {
  await this.verifyOwnership(BigInt(id), user.id);
  // Wire to selectSeatForPassenger instead of selectSeat
  return this.bookingService.selectSeatForPassenger(
    BigInt(id),
    BigInt(dto.passengerId),
    BigInt(dto.seatId),
    dto.version,
  );
}

// Verify selectSeatForPassenger links BookingPassenger.seatId:
// booking.service.ts:310-347 (already implemented — verify it sets seatId)
```

### 7.2 FE Critical Fixes

#### Fix 6: Logout clear cookie (R2-FE-001)

```typescript
// src/lib/auth.ts (new file)
const COOKIE_NAME = "token";
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24h

export function setAuthCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; secure" : "";
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${TOKEN_TTL_SECONDS}; samesite=lax${secure}`;
}

export function clearAuthCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match?.[1] || null;
}

// src/stores/authStore.ts
import { clearAuthCookie, getAuthCookie } from "../lib/auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... existing state
      hydrateFromCookie: () => {
        const token = getAuthCookie();
        if (token && !get().token) {
          set({ token, isAuthenticated: true });
        }
      },
      logout: () => {
        clearAuthCookie();
        // Best effort: call backend to revoke refresh token
        fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        }).catch(() => {});
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoginModalOpen: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// src/app/layout.tsx or providers/QueryProvider.tsx — call on mount
useEffect(() => {
  useAuthStore.getState().hydrateFromCookie();
}, []);
```

#### Fix 7: Dual AdminLayout (R2-FE-002)

```typescript
// Step 1: Delete components/layout/AdminLayout.tsx and components/layout/UserLayout.tsx

// Step 2: Update app/admin/layout.tsx to include sidebar + header
// src/app/admin/layout.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores';
import { useMounted } from '../../hooks/useMounted';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader'; // new component

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const mounted = useMounted();

  useEffect(() => {
    if (mounted && (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'STAFF'))) {
      router.push('/admin/login');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

// Step 3: Update all admin/**/page.tsx to NOT wrap in <AdminLayout>
// src/app/admin/dashboard/page.tsx
'use client';
import dynamic from 'next/dynamic';
const Dashboard = dynamic(() => import('@/views/admin/Dashboard'));
export default function Page() {
  return <Dashboard />;  // No <AdminLayout> wrap
}
```

#### Fix 8: Role casing (R2-FE-003)

```typescript
// src/types/index.ts
export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  role: UserRole; // Use uppercase enum
  // ... rest
}

// src/views/public/auth/Login.tsx — don't transform, store as-is
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    toast.error(data.message);
    return;
  }

  // Store as-is (don't transform ADMIN → Admin)
  login({ ...data.user, role: data.user.role as UserRole }, data.access_token);
};

// src/app/admin/layout.tsx
if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
  redirect;
}

// src/middleware.ts (already correct — checks uppercase)
```

#### Fix 9: Tour/booking route paths (R2-FE-004 + R2-FE-005)

```typescript
// src/lib/routes.ts (new file)
export const routes = {
  tourDetail: (id: string) => `/tours/${id}`,
  flightDetail: (id: string) => `/flights/${id}`,
  bookingTicket: (id: string) => `/booking/${id}/ticket`,
  blogDetail: (slug: string) => `/blog/${slug}`,
  userBookingDetail: (id: string) => `/user/bookings/${id}`,
  adminBookingDetail: (id: string) => `/admin/bookings/${id}`,
} as const;

// Usage everywhere:
// RecommendedTours.tsx:110,145
<Link href={routes.tourDetail(tour.id)}>
// Tours.tsx:245
<Link href={routes.tourDetail(tour.id)}>
// Settings.tsx:149
<Link href={routes.tourDetail(tour.id)}>
// CompareModal.tsx:75
navigate.push(routes.tourDetail(tour.id));
// BookingSuccess.tsx:36
navigate.push(routes.bookingTicket(bookingId));
// BookingHistory.tsx:78
navigate.push(routes.bookingTicket(booking.id));
// UserSidebar.tsx:29
{ name: 'Cài đặt chung', path: '/user/settings', icon: <Settings /> }
// Reservation.tsx:54
navigate.push('/user/bookings');
```

#### Fix 10: Middleware redirect URL (R2-FE-007)

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  let user: any = null;
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        user = JSON.parse(Buffer.from(parts[1]!, "base64").toString("utf-8"));
      }
    } catch (error) {
      // Don't log in Edge runtime
    }
  }

  // Admin paths
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token || !user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // User paths — R2-FE-007 fix: redirect to /login (not /auth/login)
  if (pathname.startsWith("/user")) {
    if (!token || !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname); // preserve original target
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
```

### 7.3 BE High Priority Fixes

#### Fix 11: Payment callback use state machine (R2-BE-020)

```typescript
// payment/payment.service.ts
async vnpayCallback(vnpayParams: any) {
  // ... HMAC verify ...

  const bookingId = BigInt(vnpayParams['vnp_TxnRef']);
  const responseCode = vnpayParams['vnp_ResponseCode'];

  return this.prisma.$transaction(async (tx) => {
    // Atomic conditional update — only succeed if PENDING
    const result = await tx.payment.updateMany({
      where: { bookingId, status: 'PENDING' },
      data: {
        status: responseCode === '00' ? 'SUCCESS' : 'FAILED',
        transactionRef: vnpayParams['vnp_TxnRef'],
      },
    });

    if (result.count === 0) {
      // Already processed — idempotent return
      return { RspCode: '00', Message: 'Already processed' };
    }

    // Use BookingService state machine (not direct update)
    if (responseCode === '00') {
      // Refactor updateBookingStatus to accept tx parameter
      await this.bookingService.updateBookingStatusWithTx(tx, bookingId, 'CONFIRMED', null);
    }

    return { RspCode: '00', Message: 'Confirm Success' };
  });
}

// booking/booking.service.ts
async updateBookingStatusWithTx(
  tx: PrismaTransaction,
  bookingId: bigint,
  newStatus: BookingStatus,
  changedBy: bigint | null,
) {
  const booking = await tx.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new NotFoundException('Booking not found');
  if (!this.canTransition(booking.status, newStatus)) {
    throw new BadRequestException(`Cannot transition from ${booking.status} to ${newStatus}`);
  }

  // OCC: only update if status hasn't changed
  const result = await tx.booking.updateMany({
    where: { id: bookingId, status: booking.status },
    data: { status: newStatus },
  });

  if (result.count === 0) {
    throw new ConflictException('Booking status was modified by another request');
  }

  await tx.bookingStatusHistory.create({
    data: {
      bookingId,
      fromStatus: booking.status,
      toStatus: newStatus,
      changedBy,
      changedAt: new Date(),
    },
  });

  // Award points on COMPLETED
  if (newStatus === 'COMPLETED') {
    await this.membershipService.awardPointsWithTx(tx, booking.userId, bookingId, booking.totalAmount);
  }
}
```

#### Fix 12: Global exception filter complete (R2-BE-026/027/028)

```typescript
// common/filters/global-exception.filter.ts
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  private readonly prismaErrorMap: Record<
    string,
    { status: HttpStatus; message: string }
  > = {
    P2002: { status: HttpStatus.CONFLICT, message: "Record already exists" },
    P2003: {
      status: HttpStatus.CONFLICT,
      message: "Foreign key constraint failed",
    },
    P2014: { status: HttpStatus.BAD_REQUEST, message: "Invalid relation" },
    P2016: {
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      message: "Invalid value",
    },
    P2021: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Table missing",
    },
    P2024: {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: "Database timeout",
    },
    P2025: { status: HttpStatus.NOT_FOUND, message: "Record not found" },
  };

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === "string" ? res : (res as any).message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = this.prismaErrorMap[exception.code];
      if (mapped) {
        status = mapped.status;
        message = mapped.message;
      }
    } else if (exception instanceof Error) {
      // Log internal error but don't leak to client
      this.logger.error(
        `[${request.method} ${request.url}] Unhandled error: ${exception.message}`,
        exception.stack,
      );
      // In production, mask internal errors
      if (process.env.NODE_ENV === "production") {
        message = "Internal server error";
      } else {
        message = exception.message;
      }
    }

    // R2-BE-028 fix: always log
    if (status >= 500) {
      this.logger.error(
        `[${request.method} ${request.url}] ${status} - ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // R2-BE-027 fix: return all validation errors, not just first
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message : [message],
    });
  }
}
```

### 7.4 DB High Priority Fixes

#### Fix 13: VoucherRedemption conflict (R2-DB-002)

```prisma
// schema.prisma
model VoucherRedemption {
  id         BigInt   @id @default(autoincrement())
  voucherId  BigInt
  voucher    Voucher  @relation(fields: [voucherId], references: [id])
  userId     BigInt
  user       User     @relation(fields: [userId], references: [id])
  bookingId  BigInt
  booking    Booking  @relation(fields: [bookingId], references: [id])
  redeemedAt DateTime @default(now())

  // Drop @@unique([voucherId, userId]) — too restrictive
  @@unique([voucherId, bookingId])  // Keep — prevent same voucher on same booking
  @@index([userId])
  @@index([voucherId])
}
```

```typescript
// booking/booking.service.ts — add application-level check
async applyVoucher(bookingId: bigint, code: string, userId: bigint) {
  return this.prisma.$transaction(async (tx) => {
    const voucher = await tx.voucher.findUnique({ where: { code } });
    if (!voucher) throw new NotFoundException('Voucher not found');

    // Check if user already used this voucher in a CONFIRMED/COMPLETED booking
    const existingSuccess = await tx.voucherRedemption.findFirst({
      where: {
        voucherId: voucher.id,
        userId,
        booking: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
      },
    });
    if (existingSuccess) {
      throw new BadRequestException('Bạn đã sử dụng voucher này rồi');
    }

    // ... rest of voucher logic
  });
}

// booking-expiry.processor.ts — release voucher on cancel
async process(job) {
  const { bookingId } = job.data;
  const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || (booking.status !== 'DRAFT' && booking.status !== 'PENDING_PAYMENT')) return;

  await this.prisma.$transaction(async (tx) => {
    // Conditional cancel
    const result = await tx.booking.updateMany({
      where: { id: bookingId, status: { in: ['DRAFT', 'PENDING_PAYMENT'] } },
      data: { status: 'CANCELLED' },
    });
    if (result.count === 0) return;

    // Release voucher if applied
    const redemption = await tx.voucherRedemption.findUnique({
      where: { bookingId },
    });
    if (redemption) {
      await tx.voucherRedemption.delete({ where: { id: redemption.id } });
      await tx.voucher.update({
        where: { id: redemption.voucherId },
        data: { usedCount: { decrement: 1 } },
      });
    }

    // Release seats (R2-BE-006 fix)
    const passengers = await tx.bookingPassenger.findMany({ where: { bookingId } });
    const seatIds = passengers.map(p => p.seatId).filter(Boolean);
    if (seatIds.length > 0) {
      await tx.flightSeat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'AVAILABLE', version: { increment: 1 } },
      });
    }

    // Record history
    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        fromStatus: booking.status,
        toStatus: 'CANCELLED',
        reason: 'Booking expired',
      },
    });
  });
}
```

#### Fix 14: OtpCode userId nullable (R2-DB-005)

```prisma
// schema.prisma
model OtpCode {
  id         BigInt     @id @default(autoincrement())
  userId     BigInt?    // Nullable — null for pre-registration OTPs
  user       User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  email      String     // NOT NULL — always store email for lookup
  codeHash    String
  purpose    OtpPurpose
  expiresAt  DateTime
  consumedAt DateTime?
  attempts   Int        @default(0)

  @@index([email, purpose, consumedAt, expiresAt])
  @@index([userId, purpose, consumedAt, expiresAt])
}
```

```typescript
// auth/auth.service.ts
async generateOtp(email: string, purpose: OtpPurpose) {
  // ... existing code ...
  const userId = user ? user.id : null;  // null instead of BigInt(0)
  await this.prisma.otpCode.create({
    data: { userId, email, codeHash: hash, purpose, expiresAt },
  });
}
```

#### Fix 15: Add CHECK constraints (R2-DB-010)

```sql
-- prisma/migrations/20260715000001_add_check_constraints/migration.sql

ALTER TABLE `Booking` ADD CONSTRAINT `chk_booking_totalAmount` CHECK (`totalAmount` >= 0);
ALTER TABLE `Payment` ADD CONSTRAINT `chk_payment_amount` CHECK (`amount` > 0);
ALTER TABLE `Review` ADD CONSTRAINT `chk_review_rating` CHECK (`rating` BETWEEN 1 AND 5);
ALTER TABLE `FlightSeat` ADD CONSTRAINT `chk_flightSeat_version` CHECK (`version` >= 0);
ALTER TABLE `OtpCode` ADD CONSTRAINT `chk_otpCode_attempts` CHECK (`attempts` BETWEEN 0 AND 5);
ALTER TABLE `Tour` ADD CONSTRAINT `chk_tour_discountPercent` CHECK (`discountPercent` BETWEEN 0 AND 100);
ALTER TABLE `Tour` ADD CONSTRAINT `chk_tour_ratingAvg` CHECK (`ratingAvg` BETWEEN 0 AND 5);
ALTER TABLE `Voucher` ADD CONSTRAINT `chk_voucher_discountValue` CHECK (`discountValue` > 0);
ALTER TABLE `Voucher` ADD CONSTRAINT `chk_voucher_dates` CHECK (`validTo` > `validFrom`);
ALTER TABLE `UserPoints` ADD CONSTRAINT `chk_userPoints_pointsBalance` CHECK (`pointsBalance` >= 0);
ALTER TABLE `Flight` ADD CONSTRAINT `chk_flight_times` CHECK (`arrivalTime` > `departureTime`);
ALTER TABLE `Aircraft` ADD CONSTRAINT `chk_aircraft_totalSeats` CHECK (`totalSeats` > 0);
ALTER TABLE `FlightFareClass` ADD CONSTRAINT `chk_flightFareClass_availableSeats` CHECK (`availableSeats` >= 0);
ALTER TABLE `FlightFareClass` ADD CONSTRAINT `chk_flightFareClass_baggageAllowanceKg` CHECK (`baggageAllowanceKg` >= 0);
ALTER TABLE `Tour` ADD CONSTRAINT `chk_tour_durationDays` CHECK (`durationDays` > 0);
```

---

## 8. Roadmap Fix Round 3 (Đề xuất)

### Phase 0 — Showstopper Hotfix (must do ngay, ~8h)

| ID                                | Task                                         | Effort |
| --------------------------------- | -------------------------------------------- | ------ |
| R2-BE-001                         | Migrate `PrismaService.$use` → `$extends`    | 4h     |
| R2-BE-002/003/004                 | Add `imports`/`providers` to 3 modules       | 0.5h   |
| R2-DB-001                         | Create Migration #3 OR squash migrations     | 2h     |
| R2-BE-005 + R2-DB-003 + R2-BE-013 | Throw on missing `ENCRYPTION_KEY`/`APP_SALT` | 1h     |
| R2-BE-008/009                     | Fix booking + payment spec mocks             | 1h     |

**Verification**: `npm run start:dev` phải chạy được mà không throw error. `npm test` phải pass.

### Phase 1 — Critical Security + Routing (~24h)

| ID                    | Task                                                     | Effort |
| --------------------- | -------------------------------------------------------- | ------ |
| R2-FE-001             | Logout clear cookie + authStore.hydrateFromCookie        | 2h     |
| R2-FE-002             | Delete duplicate layouts, merge into segment layouts     | 4h     |
| R2-FE-003             | Single UserRole enum, no transform at login              | 2h     |
| R2-FE-004/005/006/007 | Fix all wrong routes via `routes.ts` helper              | 2h     |
| R2-FE-009             | Centralize cookie management in `lib/auth.ts`            | 2h     |
| R2-FE-010 + R2-FE-011 | Rehydrate token from cookie + use env var in refresh URL | 3h     |
| R2-BE-006 + R2-BE-015 | Wire `selectSeatForPassenger` to controller              | 2h     |
| R2-BE-007             | Use `ForbiddenException` instead of raw Error            | 0.5h   |
| R2-BE-011             | Encrypt PII in createMany/updateMany                     | 2h     |
| R2-DB-002             | Fix VoucherRedemption conflict                           | 2h     |
| R2-DB-005             | OtpCode.userId nullable + FK                             | 1h     |
| R2-DB-009             | Booking→User `onDelete: Restrict`                        | 1h     |

### Phase 2 — High Priority Functional (~40h)

| ID                | Task                                                                       | Effort |
| ----------------- | -------------------------------------------------------------------------- | ------ |
| R2-BE-017/018     | `updatePassengers` in transaction + call `recalculateTotal`                | 2h     |
| R2-BE-019         | `initiatePayment` wrap in transaction                                      | 1h     |
| R2-BE-020         | Payment callback use `updateBookingStatusWithTx`                           | 3h     |
| R2-BE-026/027/028 | Complete global exception filter (Prisma error map, all messages, logging) | 3h     |
| R2-BE-029         | Invalidate RBAC cache on mutation                                          | 2h     |
| R2-BE-037         | Admin `updateBookingStatus` use service method                             | 1h     |
| R2-BE-038         | OTP atomic claim via `updateMany`                                          | 2h     |
| R2-BE-040/041     | Expiry job conditional cancel + record history                             | 2h     |
| R2-BE-023/024     | JwtStrategy filter soft-deleted + select fields                            | 1h     |
| R2-BE-025         | Upload use memoryStorage + validate before write                           | 2h     |
| R2-FE-019         | Add `error.tsx`/`loading.tsx`/`not-found.tsx`/`global-error.tsx`           | 3h     |
| R2-FE-021         | Split `Header.tsx` into 6 components                                       | 4h     |
| R2-FE-017/018/023 | Wire FAQ + checklist + admin views to real API                             | 8h     |
| R2-FE-016         | Fix Register password visibility bug                                       | 0.5h   |
| R2-FE-052         | `VerifyOTP.tsx` call API to verify OTP                                     | 2h     |
| R2-DB-010         | Add CHECK constraints migration                                            | 2h     |
| R2-DB-015         | Make seed idempotent via upsert                                            | 3h     |

### Phase 3 — Medium Priority Polish (~60h)

- R2-BE-044: Type `@CurrentUser() user: AuthenticatedUser` everywhere
- R2-BE-045: Move DTOs to `dto/` files
- R2-BE-046: Map services to response DTOs
- R2-BE-048/049: Use Decimal.js for money calc
- R2-BE-050/051/052: Fix flight service TypeScript + cache serialization + IATA→ID
- R2-BE-053: Push tag filter to DB
- R2-BE-054: Dedup blog view count by IP
- R2-BE-061: Read 32 bytes for magic byte sniff
- R2-BE-062: Resolve symlinks in deleteMedia
- R2-BE-063/064: Validate `permissionId` + move seed to CLI
- R2-BE-065: Hash sessionToken in DB
- R2-BE-074: Extract BookingStateMachine
- R2-DB-013: Update schema.test.prisma to match production
- R2-DB-014: Use enum for BookingStatusHistory
- R2-DB-016: Encrypt PII in WHERE clause
- R2-DB-017: Validate polymorphic refs
- R2-DB-018: `FlightSeat @@unique([flightId, seatCode])`
- R2-DB-019: Add FULLTEXT indexes for search
- R2-DB-025: Add createdAt/updatedAt to all models
- R2-FE-010/SSR: Convert page.tsx to Server Components, export metadata
- R2-FE-013/015: DataTable + AirportAutocomplete performance
- R2-FE-025: Migrate `<img>` to `next/image`
- R2-FE-027: Replace `: any` with proper types
- R2-FE-040/041/042: Header dropdown keyboard accessible
- R2-FE-078: Remove unused dependencies

**Total Round 3 effort: ~132h** (~3.5 weeks for 1 dev, ~1 week for 4 dev)

---

## 9. Thống kê tổng Round 2

### Theo tầng

| Tầng     | File reviewed           | NEW findings | Critical | High   | Medium  | Low    | Info   |
| -------- | ----------------------- | ------------ | -------- | ------ | ------- | ------ | ------ |
| FE       | 190                     | 114          | 7        | 23     | 53      | 27     | 4      |
| BE       | 67                      | 115          | 14       | 28     | 38      | 21     | 14     |
| DB       | 42 model + 2 mig + seed | 101          | 3        | 13     | 35      | 35     | 15     |
| **Tổng** | **321 file**            | **330**      | **24**   | **64** | **126** | **83** | **33** |

### Round 1 → Round 2 verification

| Layer    | R1 Critical | FIXED        | PARTIAL      | NOT FIXED   | NEW BUG |
| -------- | ----------- | ------------ | ------------ | ----------- | ------- |
| FE       | 12          | 6 (50%)      | 3 (25%)      | 3 (25%)     | 7       |
| BE       | 14          | 9 (64%)      | 4 (29%)      | 1 (7%)      | 14      |
| DB       | 7           | 2 (29%)      | 5 (71%)      | 0 (0%)      | 3       |
| **Tổng** | **33**      | **17 (52%)** | **12 (36%)** | **4 (12%)** | **24**  |

### Theo category

| Category                | Count | Tầng chính |
| ----------------------- | ----- | ---------- |
| Security                | 42    | BE, FE, DB |
| Bug (functional)        | 56    | FE, BE     |
| Routing                 | 12    | FE         |
| Architecture/SRP        | 28    | FE, BE     |
| Concurrency             | 14    | BE, DB     |
| Migration/Drift         | 8     | DB         |
| Index                   | 11    | DB         |
| Constraint              | 16    | DB         |
| TypeScript strictness   | 22    | FE, BE     |
| Clean Code (DRY/naming) | 35    | FE, BE     |
| Performance             | 18    | FE, BE     |
| A11y                    | 12    | FE         |
| Test                    | 8     | BE         |
| Config                  | 14    | BE, FE     |

### Top 15 Critical Round 2 (xếp theo impact)

| #   | ID                    | Tầng  | One-liner                                                                                |
| --- | --------------------- | ----- | ---------------------------------------------------------------------------------------- |
| 1   | R2-BE-001             | BE    | `PrismaService.$use()` removed trong Prisma 6 → app crash tại boot, PII encryption no-op |
| 2   | R2-BE-002/003/004     | BE    | 3 module thiếu DI config → Nest không bootstrap được                                     |
| 3   | R2-DB-001             | DB    | Migration #1 không sync với schema fix → `prisma migrate deploy` tạo broken schema       |
| 4   | R2-FE-001             | FE    | Logout không clear `token` cookie → cookie persist 24h, middleware vẫn pass              |
| 5   | R2-FE-002             | FE    | Dual AdminLayout/UserLayout → double chrome, triple auth check                           |
| 6   | R2-FE-003             | FE    | Role casing mismatch → STAFF users silently denied admin access                          |
| 7   | R2-FE-004/005         | FE    | Tour cards `/trip/${id}` + booking ticket segment reversed → 404 everywhere              |
| 8   | R2-BE-005 + R2-DB-003 | BE+DB | `ENCRYPTION_KEY` hardcode fallback `'1234...'` → PII leak nếu env thiếu                  |
| 9   | R2-BE-006             | BE    | `selectSeatForPassenger` dead code → seats permanently locked, never released            |
| 10  | R2-DB-002             | DB    | VoucherRedemption 2 UKs conflict → user không re-dùng voucher sau booking CANCELLED      |
| 11  | R2-BE-013             | BE    | `APP_SALT` fallback random → data undecryptable sau restart                              |
| 12  | R2-BE-008/009         | BE    | Booking + payment spec crash tại module creation → test suite broken                     |
| 13  | R2-BE-010             | BE    | Decrypt return ciphertext on error → silent data corruption                              |
| 14  | R2-BE-011             | BE    | Prisma middleware không handle createMany/updateMany → bulk write plaintext PII          |
| 15  | R2-FE-007             | FE    | Middleware redirect `/auth/login` non-existent → infinite loop/404                       |

---

## 10. Phụ lục

### 10.1 Files mới trong commit `0d0bd1a`

| File                                          | LOC         | Purpose                               | Round 1 fix addressed          |
| --------------------------------------------- | ----------- | ------------------------------------- | ------------------------------ |
| `frontend/src/middleware.ts`                  | 54          | Edge auth gate cho /admin, /user      | FE-001, FE-002                 |
| `frontend/src/lib/api.ts`                     | 49          | axios instance + interceptors         | FE-S-003                       |
| `frontend/src/hooks/useMounted.ts`            | 12          | mounted hook (cho SSR-safe rendering) | FE-S-019                       |
| `frontend/src/app/admin/layout.tsx`           | 37          | admin segment layout                  | FE-S-007 (nhưng tạo R2-FE-002) |
| `frontend/src/app/user/layout.tsx`            | 37          | user segment layout                   | FE-S-007 (nhưng tạo R2-FE-002) |
| `backend/src/common/utils/encryption.util.ts` | 32          | AES-256-GCM encrypt/decrypt           | DB-030 (nhưng tạo R2-DB-003)   |
| `backend/src/prisma/prisma.service.ts`        | 75 (extend) | Prisma + PII encryption middleware    | DB-030 (nhưng tạo R2-BE-001)   |

### 10.2 Round 1 → Round 2 file changes summary

- **191 file changed** (+5.415 LOC, -3.492 LOC)
- 7 file mới (liệt kê trên)
- 0 file xóa (figma_summary.md, spec.md đã xóa — không ảnh hưởng code)
- ~80% thay đổi là minor (thêm `verifyOwnership`, đổi endpoint, thêm DTO, etc.)

### 10.3 Verification commands cần chạy

```bash
# 1. Verify app boot
cd backend && npm run start:dev
# MUST: no error in first 30 seconds, "Nest application successfully started"

# 2. Verify FE boot
cd frontend && npm run dev
# MUST: no error, page loads at localhost:3000

# 3. Verify tests
cd backend && npm test
# MUST: all specs pass (currently broken — R2-BE-008/009)

# 4. Verify migration sync
cd backend && npx prisma migrate diff \
  --from-migrations ./prisma/migrations \
  --to-schema-datamodel ./prisma/schema.prisma \
  --shadow-database-url $SHADOW_DB_URL
# MUST: empty diff (currently 50+ diffs — R2-DB-001)

# 5. Verify lint
cd backend && npm run lint
cd frontend && npm run lint
# MUST: no errors
```

### 10.4 References

- **Round 1 report:** `/home/z/my-project/download/Trip_Planer/REVIEW_REPORT.md` (2.068 dòng, 138 KB)
- **Round 2 worklog:** `/home/z/my-project/worklog.md` (append mode, 3 section R2-FE/R2-BE/R2-DB)
- **Repo:** https://github.com/tvthien-ktmt/Trip_Planer
- **Commit:** `0d0bd1a` ("Fix all issues from review report Phase 1 to Phase 3")

---

## Kết luận

Commit `0d0bd1a` đã thể hiện nỗ lực fix lớn — 17/33 Round 1 Critical được FIXED hoàn toàn, 12/33 PARTIAL. Tuy nhiên:

1. **App không boot được** do 4 lỗi nghiêm trọng (R2-BE-001/002/003/004) — đây là showstopper tuyệt đối.
2. **Migration drift nghiêm trọng** (R2-DB-001) — schema fix nhưng migration #1 không sync, fresh DB deploy sẽ broken.
3. **24 NEW Critical findings** được introduce, đặc biệt:
   - Prisma 5 `$use` removal (R2-BE-001)
   - 3 module DI break (R2-BE-002/003/004)
   - Cookie không clear trên logout (R2-FE-001)
   - Dual layout (R2-FE-002)
   - Role casing chaos (R2-FE-003)
   - VoucherRedemption UK conflict (R2-DB-002)
4. **Clean Code/SOLID/Design Patterns**: Nhiều violation quan trọng — God Service (BookingService 348 LOC, AuthService 515 LOC), God Component (Header 455 LOC), thiếu Repository Pattern, thiếu Strategy Pattern cho payment, anti-patterns (Fat Controller, Primitive Obsession, Shotgun Surgery).

**Khuyến nghị**: Trước khi báo cáo "fix done", phải:

1. Verify `npm run start:dev` chạy được mà không throw error (Phase 0)
2. Verify `npm test` pass (Phase 0)
3. Verify `prisma migrate diff` empty (Phase 0)
4. Fix toàn bộ 24 NEW Critical + 64 NEW High (Phase 1 + 2)

Round 3 nếu tiến hành, đề xuất bắt đầu với **Phase 0 Showstopper Hotfix** (~8h) để app boot được trước, sau đó mới đến Phase 1 Critical Security + Routing (~24h).

---

**Báo cáo hoàn thành. Round 2 review-only, không fix.**

> **Repo:** https://github.com/tvthien-ktmt/Trip_Planer
> **Commit:** `0d0bd1a`
> **Report file:** `/home/z/my-project/download/Trip_Planer/REVIEW_REPORT_V2.md`
> **Worklog:** `/home/z/my-project/worklog.md` (3 section R2-FE/R2-BE/R2-DB appended)
> **Next:** Round 3 (fix phase) — đề xuất bắt đầu với Phase 0 Showstopper Hotfix (~8h) để app boot được.
