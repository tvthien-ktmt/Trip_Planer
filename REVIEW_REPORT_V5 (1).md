# BÁO CÁO RÀ SOÁT CODE — ROUND 5 (V5)
## TRIP_PLANER OTA — FE → BE → DB, verify thực nghiệm trên commit mới nhất

> **Repository:** https://github.com/tvthien-ktmt/Trip_Planer
> **Commit reviewed:** `9602f37` — "feat: integrate SePay and resolve all V4 review issues"
> **Commit trước đó (baseline V4):** `2e65f0d`
> **Review date:** 2026-07-20
> **Phương pháp:** Đọc trực tiếp source code trên container (không dựa vào self-report của agent fix), grep + trace call-chain FE→BE→DTO→DB cho từng finding V4, cộng thêm 1 vòng quét mới độc lập cho mock/fake data, Clean Code, SOLID.
> **Giới hạn môi trường:** `npx prisma generate` bị chặn bởi sandbox network (không truy cập được `binaries.prisma.sh`) → không chạy được `tsc --noEmit` / `next build` thật trong phiên này. Mọi finding dưới đây là **static review + trace logic**, có file:line cụ thể, bạn cần tự chạy các lệnh verify ở Phụ lục để xác nhận runtime.

---

## MỤC LỤC

1. [Executive Summary](#1-executive-summary)
2. [Đối chiếu V4 → V5: cái gì đã fix thật](#2-đối-chiếu-v4--v5-cái-gì-đã-fix-thật)
3. [P0 — NEW Blocker (V5)](#3-p0--new-blocker-v5)
4. [P1 — NEW Critical (V5)](#4-p1--new-critical-v5)
5. [Frontend Review chi tiết](#5-frontend-review-chi-tiết)
6. [Backend Review chi tiết](#6-backend-review-chi-tiết)
7. [Database Review chi tiết](#7-database-review-chi-tiết)
8. [Clean Code / SOLID / Design Pattern Assessment](#8-clean-code--solid--design-pattern-assessment)
9. [Kiểm kê Mock/Fake — Đề xuất loại bỏ 100%](#9-kiểm-kê-mockfake--đề-xuất-loại-bỏ-100)
10. [Roadmap Fix (V5)](#10-roadmap-fix-v5)
11. [Phụ lục — Lệnh verify](#11-phụ-lục--lệnh-verify)

---

## 1. Executive Summary

Commit `9602f37` sửa **thật** phần lớn 4 P0 + 15 P1 của V4 (đã verify trực tiếp bằng code, không chỉ tin message commit). Tuy nhiên, quá trình fix đã **tạo ra 2 lỗi mới nghiêm trọng hơn cả những gì nó sửa**: luồng đặt vé chính (booking flow) hiện **không thể tạo booking được** (HTTP 400 chắc chắn xảy ra), và **admin dashboard không thể đăng nhập được** (401 luôn luôn). Đây là hệ quả kinh điển của việc fix từng finding riêng lẻ mà không test tích hợp end-to-end sau khi fix.

| Tier | V4 (round trước) | V5 (round này) |
|---|---|---|
| P0 fixed thật (verify code) | — | 4/4 P0 cũ đã fix đúng |
| P1 fixed thật (sample verify ~12/15) | — | Đa số fix đúng, 1 fix nửa vời (session logout) |
| P0 MỚI phát sinh từ lần fix này | 0 | **2** |
| P1 MỚI phát sinh | 0 | **3** |
| Mock/fake còn sót lại vi phạm yêu cầu "0 mock" | — | **3 điểm** (faqs BFF, admin dashboard fallback, geo-ip session) |
| Production readiness | CHƯA SẴN SÀNG | **VẪN CHƯA SẴN SÀNG** — lỗi khác nhưng mức độ tương đương |

**Điểm mấu chốt cần hiểu:** V4 nói đúng là "FE không gọi API backend nào" (V4-INT-001). Fix lần này đã khiến FE **có gọi** API — nhưng contract giữa FE và BE (DTO whitelist, tên field, thứ tự bước) không khớp, nên lời gọi đó **sẽ fail ngay bước đầu tiên**. Nói cách khác: từ "chưa nối dây điện" chuyển sang "nối dây điện nhưng sai cực" — về mặt người dùng cuối, kết quả vẫn là **không đặt được vé**, nhưng lỗi bây giờ khó phát hiện hơn vì code "trông như" đã hoàn chỉnh.

### Đánh giá tổng quan

| Tier | V5 |
|---|---|
| Architecture design | ★★★★☆ — concept đúng, RBAC/OCC/idempotency/BullMQ thiết kế tốt |
| DB schema | ★★★★☆ — CHECK constraints, index, encryption WHERE đã đầy đủ (V4-DB-001/002/003 fixed thật) |
| BE implementation | ★★★☆☆ — hầu hết P0/P1 cũ fixed đúng, nhưng DTO whitelist bug mới chặn luôn booking; session logout hash-mismatch |
| FE implementation | ★★☆☆☆ — auth flow (cookie/refresh/middleware) fixed tốt, nhưng booking flow **vẫn chưa bao giờ chạy thành công end-to-end** qua 5 round review liên tiếp |
| Mock elimination | ★★★☆☆ — đã giảm mạnh so với V4, nhưng còn 3 điểm mock thật sự (1 route BFF 100% mock, 1 fallback-mock nguy hiểm che giấu lỗi backend, 1 mock geo-ip) |
| **Production readiness** | **CHƯA SẴN SÀNG** — booking flow (chức năng lõi của OTA) vẫn 0% chạy được thật |

---

## 2. Đối chiếu V4 → V5: cái gì đã fix thật

Đã verify trực tiếp bằng code (không tin theo message commit) — mỗi dòng dưới là kết quả đọc file thật, kèm file:line.

### P0 (4/4 — FIXED THẬT)

| ID | Verify | File:line |
|---|---|---|
| V4-BE-001 | User chỉ được transition sang `CANCELLED`, mọi status khác bị `ForbiddenException` | `booking.controller.ts:137-158` |
| V4-BE-002 | Không còn gọi `encrypt()` thủ công trong `booking.service.ts` (import còn tồn tại nhưng dead — xem mục 6.5) | `booking.service.ts:15,388` |
| V4-BE-003 | Đổi `<` → `.lessThan()` (Decimal method đúng) | `booking.service.ts:171` |
| V4-INT-001 | FE có gọi `bookingApi` thật (không còn dead code) — **nhưng xem P0 mới #1, luồng gọi này sẽ fail** | `bookingFlowStore.ts:48-90` |

### P1 (sample-verified 12/15 — hầu hết FIXED THẬT)

| ID | Kết quả | Ghi chú |
|---|---|---|
| V4-FE-001 refresh token | ✅ Fixed — BFF route `/api/auth/refresh` đọc `refresh_token` từ HttpOnly cookie, gọi BE đúng field | `frontend/src/app/api/auth/refresh/route.ts` |
| V4-FE-002 XSS token | ✅ Fixed — `refresh_token` chỉ tồn tại trong HttpOnly cookie; `access_token` không persist vào sessionStorage (`partialize` loại `token`) | `authStore.ts:47-52` |
| V4-FE-003 middleware JWT | ✅ Fixed — dùng `jose.jwtVerify` thay vì decode base64 không verify | `middleware.ts:4` |
| V4-FE-004 `/admin/login` | ✅ Route tồn tại và có page riêng | `app/admin/login/page.tsx` |
| V4-BE-007 JwtStrategy leak PII | ✅ Fixed — `select` chỉ 7 field cần thiết, không có `passwordHash` | `jwt.strategy.ts:38-46` |
| V4-BE-009 RBAC cache key mismatch | Không re-verify sâu lần này (đã fix ở V4→giữ nguyên theo diff, khuyến nghị double-check thủ công) | — |
| V4-BE-010 VNPay amount-check | ✅ Fixed — so sánh `vnp_Amount` với `payment.amount * 100`, throw nếu lệch | `payment.service.ts:132-136` |
| V4-BE-011 login throttle | ✅ Fixed — `@Throttle({limit:5, ttl:60000})` riêng cho login | `auth.controller.ts:68` |
| V4-BE-012 Swagger prod | ✅ Fixed — bọc trong `if (NODE_ENV !== 'production')` | `main.ts:71` |
| V4-BE-013 sessionToken hash | ⚠️ **Fixed nửa vời** — xem P1 mới #3 | `session.service.ts:20` vs `auth.service.ts:437` |
| V4-BE-016 initiatePayment OCC | ✅ Fixed — `updateMany({where:{id, status:'PENDING'}})` | `payment.service.ts:54-56,139-155` |
| V4-BE-017 auto-unlock AUTO vs ADMIN | ✅ Fixed — check `lockReason !== 'AUTO_FAILED_LOGIN'` trước khi auto-unlock | `auth.service.ts:176,289` |
| V4-BE-019 BookingController SRP | ✅ Fixed — không còn inject `PrismaService` trực tiếp vào controller | `booking.controller.ts` |
| V4-BE-021 review upvote race | ✅ Fixed — model `ReviewVote` riêng đã có trong schema, không còn dùng `ActivityLog` làm vote table | `schema.prisma:529` |
| V4-BE-022 exception filter double register | ✅ Fixed — chỉ đăng ký qua `APP_FILTER`, comment giải thích rõ | `main.ts:67-68` |
| V4-BE-026 upload OOM | ✅ Fixed — dùng `diskStorage` thay vì memory storage | `upload.controller.ts:15,39` |

### DB (5/5 — FIXED THẬT)

| ID | Verify |
|---|---|
| V4-DB-001 | 3 migration riêng thêm CHECK constraints (`20260718091048`, `132832`, `140639`) |
| V4-DB-002 | `TourItinerary`, `TourImage`, `BookingPassenger`, `BookingItem` đều có `@@index` |
| V4-DB-003 | `prisma.service.ts:67-74,89-94` — WHERE clause của `nationalId`/`passportNo` đã được encrypt trước khi query |
| V4-DB-005 | `Payment.transactionRef String? @unique` + `@@index([transactionRef])` |

---

## 3. P0 — NEW Blocker (V5)

### V5-BE-001 · `POST /api/bookings` sẽ luôn trả 400 khi gọi từ FE thật (P0)

- **File:** `backend/src/modules/booking/booking.controller.ts:23-27` (DTO) + `backend/src/main.ts:60-62` (ValidationPipe)
- **File liên quan FE:** `frontend/src/lib/api.ts:51`, `frontend/src/stores/bookingFlowStore.ts:55-60`
- **Category:** Integration / Contract mismatch

**Mô tả:**

```typescript
// backend/src/main.ts:60-62
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,   // ← reject request nếu có field lạ
  ...
})

// backend/src/modules/booking/booking.controller.ts:23-27
class CreateBookingDto {
  @IsEnum(BookingType)
  @IsNotEmpty()
  type: BookingType;   // ← DTO CHỈ có 1 field
}
```

```typescript
// frontend/src/lib/api.ts:51
createDraftBooking: (data: { type; typeId; pax; totalAmount }) =>
  api.post('/bookings', data),   // ← gửi 4 field
```

**Impact:** `forbidNonWhitelisted: true` khiến NestJS **reject toàn bộ request** với `400 Bad Request` ngay khi thấy field lạ (`typeId`, `pax`, `totalAmount`) không nằm trong DTO. Đây không phải lỗi lý thuyết — đây là hành vi mặc định bắt buộc của `ValidationPipe` khi bật cờ này. **Bước đầu tiên của luồng đặt vé (tạo draft booking) sẽ luôn thất bại** khi người dùng bấm "Thanh toán ngay".

**Cách verify (không cần chạy full app):**
```bash
cd backend && npm run start:dev
# Ở terminal khác, giả lập đúng payload FE gửi:
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer <valid_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"type":"FLIGHT","typeId":"1","pax":{"adults":1,"children":0,"infants":0},"totalAmount":1500000}'
# Kỳ vọng theo bug: HTTP 400 "property typeId should not exist" (hoặc tương tự)
```

**Fix Guidance:**

Vấn đề gốc sâu hơn cả "thêm field vào DTO" — kiến trúc hiện tại **không có chỗ lưu `typeId`/`pax` vào Booking**. Cần quyết định 1 trong 2 hướng:

*Hướng A (khuyến nghị — khớp với model `BookingItem`/`BookingPassenger` đã có sẵn):*
1. `createDraftBooking` chỉ nhận `type` — **đúng như hiện tại, KHÔNG đổi backend**.
2. Sửa FE: `createDraftBooking` chỉ gửi `{type}`. Sau khi có `bookingId`, gọi tiếp `selectSeat()` cho từng passenger (endpoint `PATCH :id/seats` đã tồn tại, chỉ chưa được gọi — xem V5-BE-002) để backend tự tính `totalAmount` qua `recalculateTotal()` đã có sẵn.
3. Xoá field `typeId`, `pax`, `totalAmount` khỏi `bookingApi.createDraftBooking()` type signature ở FE.

*Hướng B (nếu muốn giữ nguyên luồng FE hiện tại):*
1. Mở rộng `CreateBookingDto` thêm `typeId`, `pax` (không thêm `totalAmount` — không bao giờ tin giá từ client).
2. Sửa `createDraftBooking()` backend nhận thêm `typeId`, tạo `BookingItem` hoặc gán trực tiếp seat/flight ngay từ bước tạo draft.
3. **Tuyệt đối không thêm `totalAmount` vào DTO** — giữ nguyên nguyên tắc "giá luôn tính server-side" đang có ở `recalculateTotal()`.

Hướng A tốn ít effort hơn và tận dụng đúng cơ chế `recalculateTotal()` đã viết sẵn (`booking.service.ts:245-292`) — **khuyến nghị chọn A**.

---

### V5-BE-002 · Luồng đặt vé không bao giờ gọi API chọn ghế → không booking nào có `seatId` (P0)

- **File:** `frontend/src/stores/bookingFlowStore.ts:41-101` (toàn bộ `submitBooking`)
- **File liên quan:** `frontend/src/lib/api.ts:52` (`selectSeat` tồn tại), `frontend/src/views/booking/SeatSelection.tsx` (UI chọn ghế tồn tại, chỉ lưu vào Zustand state cục bộ)
- **Category:** Integration / Business logic gap

**Mô tả:** `SeatSelection.tsx` cho người dùng chọn ghế và lưu vào `selectedSeats: Record<passengerId, seatId>` trong `bookingFlowStore`. Nhưng `submitBooking()` — hàm duy nhất gọi API thật khi bấm "Thanh toán" — **không đọc `selectedSeats` và không bao giờ gọi `bookingApi.selectSeat()`**. Trace toàn bộ `submitBooking()` chỉ có 3 lời gọi API: `createDraftBooking` → `addPassengers` → `initiatePayment`/`initiateSepay`. Không có bước nào gọi `PATCH :id/seats`.

**Impact liên hoàn (rất nghiêm trọng vì đây là lỗi dây chuyền):**
1. `BookingPassenger.seatId` luôn `null` cho mọi booking tạo qua FE.
2. `recalculateTotalWithTx()` (`booking.service.ts:263-280`) lọc `seatIds = booking.passengers.map(p => p.seatId).filter(id => id != null)` → mảng rỗng → **`total` luôn = 0**.
3. Vé máy bay không có cách nào biết đã đặt **chuyến bay nào** — `Booking` model không có `flightId` trực tiếp, việc liên kết chuyến bay hoàn toàn phụ thuộc vào `seat → FlightSeat → Flight`. Không set `seatId` = **booking mất luôn thông tin chuyến bay đã chọn**.
4. Ngay cả khi V5-BE-001 được fix, luồng vẫn tạo ra booking "ma": có `bookingCode`, có `passengers`, `totalAmount = 0`, không rõ bay chuyến nào.

**Fix Guidance:**

```typescript
// frontend/src/stores/bookingFlowStore.ts — trong submitBooking(), sau bước addPassengers
const { bookingApi } = await import('../lib/api');
// Cần backend trả về passenger.id sau addPassengers để map đúng passengerId
const addRes = await bookingApi.addPassengers(bookingId, { passengers: state.passengerInfo });
const createdPassengers = addRes.data.passengers; // giả định BE trả về danh sách kèm id

for (const passenger of createdPassengers) {
  const seatId = state.selectedSeats[passenger.tempId]; // cần cơ chế map tempId <-> id thật
  if (seatId) {
    await bookingApi.selectSeat(bookingId, {
      passengerId: passenger.id,
      seatId,
      version: 0, // lấy version thật từ seat data
    });
  }
}
```

Lưu ý: cần backend `updatePassengers`/`addPassengers` trả về `id` thật của từng passenger vừa tạo (hiện response trả gì cần kiểm tra thêm — xem V5-BE-003), vì FE cần `passengerId` (id trong DB) để gọi `selectSeat`, không phải id tạm trong state cục bộ.

---

## 4. P1 — NEW Critical (V5)

### V5-FE-001 · `/api/faqs` là route BFF nhưng 100% mock, chưa từng gọi backend (P1)

- **File:** `frontend/src/app/api/faqs/route.ts` (toàn bộ 19 dòng)
- **Category:** Mock elimination (vi phạm trực tiếp yêu cầu "0 mock" của bạn)

```typescript
const mockFaqs = [ /* 3 câu hỏi hard-code */ ];
export async function GET() {
  return NextResponse.json(mockFaqs);
}
```

Route này không có bất kỳ `fetch()` nào tới `NEXT_PUBLIC_API_URL`. Đây là route API thật (`/api/faqs`) nhưng thân hàm chỉ trả về mảng tĩnh — không đọc DB, không gọi BE.

**Fix Guidance:**
```typescript
export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const res = await fetch(`${apiUrl}/faqs`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
```
Điều kiện tiên quyết: backend cần có `GET /api/faqs` thật (kiểm tra xem `FaqModule` đã tồn tại ở backend chưa — nếu chưa, đây là việc cần làm trước, không chỉ sửa FE).

---

### V5-FE-002 · `/api/admin/dashboard` luôn 401 vì check sai tên cookie + fallback mock nguy hiểm (P1)

- **File:** `frontend/src/app/api/admin/dashboard/route.ts` (toàn bộ)
- **Category:** Broken auth + Mock elimination

**Mô tả — 2 lỗi cộng dồn trong cùng 1 file:**

**(a) Cookie không tồn tại:**
```typescript
const token = cookieStore.get('token')?.value;   // ← cookie tên 'token'
```
Toàn repo chỉ set cookie tên `refresh_token` (HttpOnly, trong `login/route.ts` và `refresh/route.ts`) và `access_token` (chỉ khi logout, để xoá — `logout/route.ts:29`). **Không có nơi nào set cookie tên `token`.** → `cookieStore.get('token')` luôn `undefined` → route luôn trả `401 Unauthorized`, kể cả với admin đã đăng nhập hợp lệ. Đây là bug do V4-FE-009 (thêm auth check cho route này) dùng nhầm tên cookie so với kiến trúc auth thật của FE (access_token nằm trong Zustand memory + header `Authorization`, không phải cookie).

**(b) Fallback mock che giấu lỗi backend thật:**
```typescript
try {
  const response = await fetch(`${apiUrl}/admin/dashboard`, {...});
  if (response.ok) return NextResponse.json(await response.json());
} catch (e) {
  // Fallback to mock data if backend fails
}
return NextResponse.json(mockDashboardData);  // ← luôn fallback nếu BE lỗi/timeout
```
Nếu backend down, timeout, hoặc trả lỗi 500 — thay vì báo lỗi cho FE, route **âm thầm trả dữ liệu doanh thu/booking giả** ("Doanh thu hôm nay: 124,500,000₫", "432 vé đã bán"...) trông y hệt dữ liệu thật. Admin sẽ **không biết backend đang lỗi**, có thể ra quyết định kinh doanh dựa trên số liệu bịa.

**Impact:** Vì (a) chặn ở tầng auth trước, nên (b) hiện tại **không bao giờ chạy tới được** trong điều kiện thường — nhưng đây vẫn là code path nguy hiểm cần xoá triệt để, không chỉ vì bạn yêu cầu 0-mock mà vì nó là anti-pattern bảo mật/vận hành (silent failure che số liệu).

**Fix Guidance:**
```typescript
// (a) Sửa tên cookie — dùng đúng access_token qua header Authorization thay vì cookie,
// vì kiến trúc hiện tại lưu access_token ở client (Zustand), không phải cookie:
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.slice(7);
  // verify bằng jose như middleware.ts đã làm, giữ nhất quán
  ...
  // (b) Xoá hoàn toàn mockDashboardData và nhánh fallback:
  const response = await fetch(`${apiUrl}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
  return NextResponse.json(await response.json());
}
```
Và ở FE client gọi route này, phải đính kèm `Authorization: Bearer <access_token>` từ Zustand store thay vì dựa vào cookie.

---

### V5-BE-003 · Logout không deactivate đúng session — so sánh raw token với hash đã lưu (P1)

- **File:** `backend/src/modules/auth/auth.service.ts:435-440` vs `backend/src/modules/auth/session.service.ts:20,33-36`
- **Category:** Security / Logic bug (fix nửa vời của V4-BE-013)

**Mô tả:**
```typescript
// session.service.ts:19-36 — LƯU: hash SHA-256 của rawToken vào field `sessionToken`
const rawToken = crypto.randomBytes(32).toString('hex');
const sessionTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
await this.prisma.extended.userSession.create({
  data: { ..., sessionToken: sessionTokenHash, ... },  // field lưu HASH
});
return rawToken;  // trả về RAW cho client dùng

// auth.service.ts:435-439 — LOOKUP: so sánh trực tiếp bằng RAW token nhận từ client
if (sessionToken) {
  await this.prisma.extended.userSession.updateMany({
    where: { userId, sessionToken },  // ← sessionToken ở đây là RAW, nhưng DB lưu HASH
    data: { isActive: false },
  });
}
```

**Impact:** `WHERE userId = ? AND sessionToken = <raw>` sẽ **không bao giờ match** bất kỳ record nào (vì DB lưu hash, không phải raw) → `updateMany` trả về 0 rows affected, không có exception, không có log lỗi. Kết quả: **khi user logout, session của họ trong bảng "Thiết bị đang đăng nhập" (`UserSession`) không bao giờ được đánh dấu `isActive: false`**. Nếu FE có màn hình "quản lý phiên đăng nhập" hiển thị từ `UserSession`, phiên vừa logout vẫn hiện "đang hoạt động" cho tới khi hết hạn tự nhiên (30 ngày).

**Fix Guidance:**
```typescript
// auth.service.ts — hash trước khi query, thống nhất với session.service.ts
if (sessionToken) {
  const sessionTokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
  await this.prisma.extended.userSession.updateMany({
    where: { userId, sessionToken: sessionTokenHash },
    data: { isActive: false },
  });
}
```
Khuyến nghị thêm: chuyển logic hash vào 1 method dùng chung trong `SessionService` (ví dụ `hashToken(raw)`) để tránh lặp lại lỗi tương tự ở nơi khác — hiện `sha256` được implement rời rạc ở 2 file (`session.service.ts` và `auth.service.ts:422` cho blacklist token, may mắn chỗ đó đúng logic).

---

## 5. Frontend Review chi tiết

**Stack:** Next.js (App Router) + TypeScript + Zustand + Tailwind. 257 file `.ts`/`.tsx`.

### 5.1 Auth flow — ĐÃ ỔN ĐỊNH
Kiến trúc BFF pattern (`/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`) + HttpOnly cookie cho `refresh_token` + `access_token` giữ trong Zustand memory (không persist) là pattern đúng chuẩn cho SPA/SSR hybrid, đã fix đúng cả V4-FE-001/002/003. Đây là điểm sáng nhất của lần fix này.

### 5.2 Booking flow — VẪN CHƯA CHẠY ĐƯỢC END-TO-END (xem mục 3)
Đây là lần review thứ 5 liên tiếp mà luồng đặt vé — chức năng lõi của một OTA — chưa từng verify được chạy thành công thật từ đầu đến cuối. V1-V3: FE hard-code hoàn toàn. V4: phát hiện `bookingApi` là dead code. V5: `bookingApi` đã được gọi, nhưng do lỗi hợp đồng DTO (V5-BE-001) và thiếu bước chọn ghế (V5-BE-002), luồng vẫn fail. **Khuyến nghị mạnh: trước khi review round 6, hãy tự chạy thử 1 lần đặt vé thật từ UI đến khi thấy `Booking` record trong DB với `totalAmount > 0` và `seatId` khác null — đây nên là gate bắt buộc trước khi merge, không phải việc để reviewer phát hiện lần thứ 5.**

### 5.3 Dead code còn sót (không blocking nhưng ảnh hưởng maintainability)
- `frontend/src/mocks/data/` còn 7/8 file mock (`destinations`, `flights`, `tours`, `airports`, `reviews`, `blogPosts`) không còn consumer nào trong FE (chỉ `checklistTemplates.mock.ts` còn được `Checklist.tsx` dùng thật). Khuyến nghị xoá 7 file này hoặc archive ra khỏi `src/` — để trong `src/mocks/` dễ khiến dev sau này tưởng nhầm là data source hợp lệ.

### 5.4 SePayModal / thanh toán QR
Đã kiểm tra `payment.service.ts` (BE) dùng URL thật `https://qr.sepay.vn/img` và VNPay sandbox thật (`https://sandbox.vnpayment.vn`) — **đây là tích hợp thật, không phải mock**, ghi nhận tích cực cho yêu cầu "0 mock" của bạn.

---

## 6. Backend Review chi tiết

**Stack:** NestJS + Prisma + MySQL + Redis + BullMQ. 68 file `.ts` trong `src/`.

### 6.1 DTO / Validation contract — điểm yếu lớn nhất round này
`forbidNonWhitelisted: true` là lựa chọn đúng về bảo mật (chặn mass-assignment), nhưng đòi hỏi kỷ luật: **mọi lần đổi field ở FE payload phải đồng bộ ngay DTO tương ứng ở BE trong cùng 1 PR**. V5-BE-001 là hệ quả trực tiếp của việc thiếu kỷ luật này. Khuyến nghị quy trình: sinh OpenAPI/Swagger schema từ DTO, generate FE API client tự động từ schema đó (dùng `openapi-typescript` hoặc tương tự) thay vì viết tay `lib/api.ts` — sẽ khiến lỗi kiểu này bị bắt ở compile-time thay vì runtime.

### 6.2 God Service — `BookingService` (404 dòng)
Vẫn giữ nguyên vấn đề V4-BE-033 nêu: 1 class đảm nhiệm tạo draft, chọn ghế, cập nhật hành khách, áp voucher, tính tổng tiền, chuyển trạng thái, tích điểm membership — 7 trách nhiệm. Không phải blocker nhưng nên tách trước khi thêm tính năng mới (ví dụ: `BookingPricingService`, `BookingStateMachineService`, `BookingService` chỉ điều phối).

### 6.3 Dead import — `encrypt` trong `booking.service.ts`
`import { encrypt } from '../../common/utils/encryption.util'` (dòng 15) không còn được gọi ở đâu trong file sau khi fix V4-BE-002. TypeScript/ESLint với `noUnusedLocals` sẽ cảnh báo — nên dọn để tránh nhầm lẫn khi đọc code sau này.

### 6.4 Dead code — `CryptoService` (AES-256-CBC)
Từ V4-BE-028, chưa thấy đổi: `common/utils/crypto.service.ts` vẫn tồn tại song song với `encryption.util.ts` (AES-256-GCM, đang dùng thật). GCM an toàn hơn CBC (có authentication tag). Khuyến nghị xoá `CryptoService` để tránh dev sau import nhầm phiên bản kém an toàn hơn.

### 6.5 Test đã real hơn nhưng vẫn còn mock config đáng ngờ
`payment.service.spec.ts` mock `VNPAY_URL` bằng URL sandbox thật (`https://sandbox.vnpayment.vn/...`) thay vì chuỗi giả `'secret'` như trước — cải thiện tốt so với V4-BE-035, nhưng đây vẫn là **unit test mock**, không phải sản phẩm — không tính vào "mock production code". Giữ nguyên, không cần đổi.

---

## 7. Database Review chi tiết

### 7.1 Schema integrity — TỐT
42 model, quan hệ FK rõ ràng, `Decimal(18,2)` cho mọi field tiền tệ (đúng chuẩn tài chính — không dùng `Float`), CHECK constraints đã bổ sung qua 3 migration riêng biệt. Không phát hiện field tiền dùng sai kiểu dữ liệu trong lần review này.

### 7.2 Index coverage — TỐT sau V4 fix
Toàn bộ bảng con hay bị `include` (BookingItem, BookingPassenger, TourItinerary, TourImage) đã có `@@index([parentId])`. `Payment.transactionRef` đã `@unique` + index — tránh trùng giao dịch VNPay/SePay và tăng tốc reconciliation.

### 7.3 Encryption — WHERE clause đã fix, nhưng cần lưu ý biên
`prisma.service.ts` đã transform `args.where.nationalId`/`passportNo` trước khi query (fix V4-DB-003). Tuy nhiên nếu sau này có thêm field PII mới (ví dụ thêm `phoneNumber` mã hoá), cần nhớ thêm cả nhánh WHERE cho field đó ở **4 chỗ** (`findUnique`, `findMany`, `findFirst`, và bất kỳ extension nào khác) — đây là kiểu code dễ quên khi field tăng lên, nên cân nhắc refactor sang 1 danh sách `ENCRYPTED_FIELDS = ['nationalId', 'passportNo']` dùng chung thay vì hard-code từng field ở từng chỗ.

### 7.4 `UserSession.sessionToken` — bug logic đã nêu ở V5-BE-003
Về schema thì field này ổn (String, unique, indexed) — vấn đề nằm ở tầng application logic (lookup dùng raw thay vì hash), không phải lỗi DB schema.

### 7.5 Điểm chưa kiểm tra sâu (khuyến nghị round sau)
- Chưa chạy `EXPLAIN` thật trên các query `include` lồng nhiều cấp (booking → passengers → seat → fareClass) vì không generate được Prisma client trong sandbox này.
- Chưa audit lại toàn bộ 15+ CHECK constraint đã thêm có đúng business rule không (chỉ xác nhận migration tồn tại, chưa đọc từng constraint).

---

## 8. Clean Code / SOLID / Design Pattern Assessment

| Nguyên tắc | Đánh giá | Ví dụ cụ thể |
|---|---|---|
| **S**ingle Responsibility | ⚠️ Vi phạm ở `BookingService` (404 LOC, 7 trách nhiệm — mục 6.2), `Header.tsx` FE trước đó ghi nhận 309 LOC (chưa re-check lần này) |
| **O**pen/Closed | ⚠️ `canTransition()` hardcode map trạng thái (`BOOKING_TRANSITIONS` object literal) — thêm trạng thái mới phải sửa trực tiếp source thay vì extend |
| **L**iskov | Không phát hiện vi phạm mới trong sample lần này |
| **I**nterface Segregation | Không có vấn đề nổi bật — NestJS module structure theo chuẩn interface nhỏ qua DI |
| **D**ependency Inversion | ✅ Tốt hơn V4 — `BookingController` không còn phụ thuộc trực tiếp `PrismaService` (V4-BE-019 fixed), đi qua `BookingService` đúng layer |
| DRY | ⚠️ Logic hash SHA-256 lặp lại rời rạc ở 2 nơi (`session.service.ts`, `auth.service.ts`) — chính là nguồn gốc bug V5-BE-003 |
| Fail-safe vs Fail-open | ⚠️ `/api/admin/dashboard` fallback về mock khi lỗi là **fail-open dưới vỏ bọc fail-safe** (trông như graceful degradation nhưng thực chất che giấu lỗi) — nên fail loudly (502/503) cho các API hiển thị số liệu kinh doanh |

**Nhận xét chung:** Chất lượng kiến trúc tổng thể (RBAC, OCC optimistic locking, idempotency key cho payment, BullMQ cho expiry) thuộc dạng khá tốt so với một dự án học tập/portfolio — vấn đề chính không nằm ở "không biết pattern đúng" mà nằm ở **thiếu integration test end-to-end sau mỗi lần fix**, khiến các lỗi tích hợp (contract mismatch, thứ tự gọi API) liên tục lọt qua 5 vòng review liền.

---

## 9. Kiểm kê Mock/Fake — Đề xuất loại bỏ 100%

Bạn yêu cầu dự án **không có mock/fake gì hết**. Dưới đây là kiểm kê đầy đủ mọi điểm còn mock tìm được trong lần quét này, xếp theo mức độ nghiêm trọng:

| # | Vị trí | Loại | Mức độ | Đề xuất |
|---|---|---|---|---|
| 1 | `frontend/src/app/api/faqs/route.ts` | Route thật nhưng trả data tĩnh, không gọi BE | 🔴 Cao — route production trả fake data cho user thật | Viết `FaqModule` thật ở backend (model `Faq` đơn giản: `id, question, answer, order`), FE fetch qua BE. Nếu chưa có model, đây là backlog cần làm, không chỉ "sửa FE" |
| 2 | `frontend/src/app/api/admin/dashboard/route.ts` | Fallback mock khi BE lỗi (`mockDashboardData`) | 🔴 Cao — che giấu lỗi backend bằng số liệu giả trông như thật, admin có thể quyết định sai | Xoá hoàn toàn `mockDashboardData` + nhánh fallback, trả lỗi 502 thay vì data giả (xem V5-FE-002) |
| 3 | `backend/src/modules/auth/session.service.ts` — `mockGeoLocation()` | Giả lập vị trí địa lý từ IP | 🟡 Trung bình — chỉ ảnh hưởng tính năng phụ ("thiết bị đăng nhập từ đâu"), không ảnh hưởng nghiệp vụ lõi | Tích hợp geo-IP thật: `ip-api.com` (free, không cần key, phù hợp dự án học tập) hoặc `MaxMind GeoLite2` (chạy local, không phụ thuộc mạng ngoài — phù hợp hơn nếu muốn tự chủ) |
| 4 | `frontend/src/mocks/data/*.mock.ts` (7 file: destinations, flights, tours, airports, reviews, blogPosts, faq) | Dead code — không còn consumer thật (trừ `checklistTemplates.mock.ts`) | 🟢 Thấp — không chạy trong production, nhưng gây nhầm lẫn | Xoá thẳng, hoặc nếu cần giữ cho Storybook/test thì chuyển vào `__tests__/fixtures/` để tách bạch rõ "đây là test fixture, không phải data source" |
| 5 | `backend/src/modules/user/user.service.ts:34` | Comment "placeholder for actual implementation" cho resize ảnh | 🟢 Thấp — chưa xác nhận có ảnh hưởng chức năng thật hay chỉ là TODO chưa dọn | Kiểm tra lại: nếu tính năng resize ảnh avatar chưa làm thật, cần làm bằng `sharp` (đã có trong nhiều dependency Node phổ biến) trước khi coi là hoàn thành |

**Xác nhận KHÔNG phải mock (để bạn yên tâm):** VNPay (`sandbox.vnpayment.vn` — sandbox thật của VNPay, không phải mock tự viết), SePay (`qr.sepay.vn` — API thật tạo QR chuyển khoản). Đây là 2 cổng thanh toán **tích hợp thật**, chỉ đang trỏ vào môi trường sandbox/test của chính nhà cung cấp — việc dùng sandbox trước khi lên production là chuẩn ngành, không tính là "mock" theo nghĩa bạn lo ngại (mock là tự viết code giả lập, sandbox là môi trường test do bên thứ 3 cung cấp thật).

---

## 10. Roadmap Fix (V5)

### Phase 0 — Blocker chặn luồng lõi (~10h)
| # | ID | Task | Effort |
|---|---|---|---|
| 1 | V5-BE-001 | Quyết định hướng A/B cho contract `POST /api/bookings`, đồng bộ DTO ↔ FE | 4h |
| 2 | V5-BE-002 | Wire `selectSeat()` vào `submitBooking()` flow, xác nhận `totalAmount` tính đúng server-side | 4h |
| 3 | — | **Test thủ công 1 lần đặt vé thật từ UI → DB**, xác nhận `totalAmount > 0` và `seatId` không null | 2h |

### Phase 1 — Fix P1 mới (~6h)
| # | ID | Task | Effort |
|---|---|---|---|
| 4 | V5-FE-001 | Backend làm `FaqModule` thật (nếu chưa có) + FE gọi qua BFF | 3h |
| 5 | V5-FE-002 | Sửa tên cookie / auth mechanism cho `/api/admin/dashboard`, xoá mock fallback | 2h |
| 6 | V5-BE-003 | Hash session token trước khi lookup ở `logout()` | 1h |

### Phase 2 — Mock elimination còn lại (~4h)
| # | Task | Effort |
|---|---|---|
| 7 | Thay `mockGeoLocation()` bằng geo-IP thật | 2h |
| 8 | Xoá 7 file mock FE không dùng | 0.5h |
| 9 | Kiểm tra + hoàn thiện resize ảnh avatar (`user.service.ts:34`) | 1.5h |

### Phase 3 — Clean Code / Technical Debt (~10h, không blocking)
| # | Task | Effort |
|---|---|---|
| 10 | Tách `BookingService` (404 LOC) thành các service nhỏ hơn theo trách nhiệm | 6h |
| 11 | Xoá dead code: `encrypt` import thừa, `CryptoService` (AES-CBC) | 1h |
| 12 | Gộp logic hash SHA-256 vào 1 helper dùng chung (tránh lặp bug như V5-BE-003) | 1h |
| 13 | Cân nhắc generate FE API client tự động từ Swagger/OpenAPI thay vì viết tay `lib/api.ts` | 2h (setup ban đầu) |

**Tổng effort ước tính:** ~30h cho toàn bộ Phase 0-3.

---

## 11. Phụ lục — Lệnh verify

```bash
# 1. Verify V5-BE-001 (DTO whitelist reject)
cd backend && npm run start:dev
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer <valid_jwt>" -H "Content-Type: application/json" \
  -d '{"type":"FLIGHT","typeId":"1","pax":{"adults":1},"totalAmount":1500000}'
# Kỳ vọng: 400 Bad Request nếu bug còn tồn tại

# 2. Verify V5-BE-002 (seat never linked)
# Sau khi tạo 1 booking thật qua UI, query DB:
# mysql> SELECT id, seatId FROM BookingPassenger WHERE bookingId = <id>;
# Kỳ vọng nếu bug còn tồn tại: seatId luôn NULL

# 3. Verify V5-FE-002 (cookie 'token' never set)
grep -rn "cookies.set" frontend/src/app/api | grep -v "refresh_token\|access_token"
# Kỳ vọng: không có kết quả nào set cookie tên 'token'

# 4. Verify V5-BE-003 (session hash mismatch)
node -e "
const crypto = require('crypto');
const raw = 'abc123';
const hash = crypto.createHash('sha256').update(raw).digest('hex');
console.log('raw:', raw, '!== hash:', hash);
"
# Minh hoạ: raw token client gửi lên KHÔNG BAO GIỜ bằng hash lưu trong DB

# 5. Build check (cần chạy trên máy có mạng đầy đủ, sandbox review này bị chặn)
cd backend && npx prisma generate && npx tsc --noEmit
cd frontend && npm run build
```

---

**Kết luận:** Đội ngũ fix (AI agent) đã xử lý đúng phần lớn các finding V4 khi nhìn từng finding riêng lẻ — đây là tín hiệu tốt về khả năng đọc-hiểu-sửa lỗi cụ thể. Nhưng **chưa có bước kiểm tra tích hợp end-to-end sau khi fix**, nên 2 lỗi mới (V5-BE-001, V5-BE-002) nghiêm trọng hơn cả finding cũ chúng thay thế đã lọt qua. Khuyến nghị bắt buộc trước khi tính là "xong": **tự tay đặt 1 vé từ UI thật, xem tiền trong DB có đúng và không phải 0**, đừng dựa vào review code tĩnh (kể cả review này) để xác nhận chức năng lõi hoạt động.
