# BÁO CÁO RÀ SOÁT CODE ROUND 4 (CONSOLIDATED) — TRIP_PLANER OTA
## Kết hợp 2 nguồn: Z.ai R3 + Claude R3 · Deduplicated · Priority-sorted · Fix-ready

> **Repository:** https://github.com/tvthien-ktmt/Trip_Planer
> **Commit reviewed:** `2e65f0d` ("Fix all issues from REVIEW_REPORT_V2")
> **Review date:** 2025-07-18
> **Sources merged:**
> - **Z.ai Round 3** (289 findings — exhaustive, 3 subagent song song)
> - **Claude Round 3** (~24 findings — chọn lọc, evidence-based, verify thực nghiệm)
> **Báo cáo này:** `/home/z/my-project/download/Trip_Planer/REVIEW_REPORT_V4.md`
> **Mục đích:** Báo cáo chuẩn DUY NHẤT để team fix — deduplicate, merge severity, cung cấp fix code cho từng P0/P1.

---

## MỤC LỤC

1. [Executive Summary](#1-executive-summary)
2. [Priority Matrix — Tổng quan P0→P4](#2-priority-matrix--tổng-quan-p0p4)
3. [P0 — Blocker (fix trước tiên)](#3-p0--blocker-fix-trước-tiên)
4. [P1 — Critical (fix ngay sau P0)](#4-p1--critical-fix-ngay-sau-p0)
5. [P2 — Major (sprint kế tiếp)](#5-p2--major-sprint-kế-tiếp)
6. [P3 — Minor (backlog)](#6-p3--minor-backlog)
7. [Cross-cutting Concerns](#7-cross-cutting-concerns)
8. [Roadmap Fix (4 Phase)](#8-roadmap-fix-4-phase)
9. [Verification Checklist](#9-verification-checklist)
10. [Thống kê tổng](#10-thống-kê-tổng)
11. [Phụ lục — Lệnh kiểm chứng](#11-phụ-lục--lệnh-kiểm-chứng)

---

## 1. Executive Summary

Báo cáo V4 này **kết hợp 2 nguồn review Round 3** (Z.ai + Claude) thành một báo cáo chuẩn duy nhất. Mỗi finding được:

- **Deduplicate** — nếu cả 2 nguồn cùng phát hiện, gộp làm 1 với source tag `[Both]`
- **Merge severity** — lấy severity cao hơn khi 2 nguồn đánh giá khác nhau
- **Đánh ID mới** `V4-{layer}-{seq}` để team reference dễ dàng
- **Cung cấp fix code** cho mọi P0 và P1

### Điểm nổi bật của việc kết hợp

| Nguồn | Số finding | Điểm mạnh | Điểm yếu |
|---|---|---|---|
| **Z.ai R3** | 289 | Exhaustive (FE+BE+DB sâu), Clean Code + SOLID + Design Pattern assessment | Bỏ sót 5 finding quan trọng |
| **Claude R3** | ~24 | Chọn lọc, verify thực nghiệm (`node -e` với decimal.js), phát hiện integration gap | Thiếu coverage DB/index/encryption WHERE |
| **V4 (kết hợp)** | **96 unique** | Coverage đầy đủ + verify thực nghiệm + fix code | — |

### 5 findings Claude có mà Z.ai bị thiếu (đã merge vào V4)

1. **V4-BE-003** — Decimal comparison via JS `<` operator (verify bằng `node -e`) — **bug tài chính**
2. **V4-BE-004** — `SeatStatus.BOOKED` never set (grep confirm 0 occurrences)
3. **V4-BE-010** — VNPay callback thiếu amount-check (defense-in-depth)
4. **V4-BE-011** — Login thiếu throttle riêng (100 req/min quá rộng)
5. **V4-BE-012** — Swagger UI lộ credentials thật, không tắt ở prod

### 4 findings Z.ai có mà Claude bị thiếu (đã merge vào V4)

1. **V4-BE-007** — `JwtStrategy.validate` return entire user row (passwordHash + PII leak trên **mọi** request)
2. **V4-DB-003** — Encryption extension không transform WHERE clause → lookup by PII silently fails
3. **V4-DB-001** — Only 1 of 15+ CHECK constraints (Claude có nhắc nhưng để P3, V4 nâng lên P2)
4. **V4-DB-002** — Missing indexes trên BookingItem/BookingPassenger/TourItinerary/TourImage

### Top 5 rủi ro nghiêm trọng nhất (P0 — fix trước tiên)

| # | ID | Vấn đề | Impact |
|---|---|---|---|
| 1 | **V4-BE-001** | `PATCH /api/bookings/:id/status` cho user tự `CONFIRMED`/`COMPLETED` booking không qua thanh toán | **Đặt vé FREE + tự cộng điểm membership gian lận** |
| 2 | **V4-BE-002** | `booking.service.ts:328` manual `encrypt(passportNo)` + Prisma extension encrypt lần nữa → double-encryption | **Mọi booking có passenger với passport → 500 error, dữ liệu corrupt vĩnh viễn** |
| 3 | **V4-BE-003** | `applyVoucher` so sánh `Prisma.Decimal` bằng `<` → JS so sánh string lexicographic → voucher áp sai điều kiện minOrderAmount | **Thất thoát doanh thu** — áp voucher cho đơn dưới ngưỡng (verify bằng `node -e`) |
| 4 | **V4-INT-001** | Toàn bộ booking flow FE **không gọi API backend nào** — `bookingApi` defined nhưng 0 callers, giá tiền hard-code | **App "trông như xong" nhưng chức năng lõi chưa chạy end-to-end** |
| 5 | **V4-INT-002** | FE refresh-token rotation broken — không lưu `refresh_token`, gọi `/auth/refresh` body rỗng → luôn 400 → **auto-logout mỗi 15 phút** | **UX gãy, user không thể dùng app quá 15 phút** |

### Đánh giá tổng quan

| Tier | Đánh giá |
|---|---|
| Architecture design | ★★★★☆ — Concept tốt (RBAC, optimistic lock, idempotency, BullMQ, audit log) |
| DB schema | ★★★★☆ — Migration drift FIXED, 42 model + 41 FK + Decimal(18,2) đúng |
| BE implementation | ★★★☆☆ — DI fix OK, nhưng P0 bypass payment + double-encrypt + Decimal bug |
| FE implementation | ★★★☆☆ — Route groups + lib/auth OK, nhưng booking flow không nối BE + refresh broken |
| Security posture | ★★★☆☆ — PII encryption working (User.nationalId), nhưng JwtStrategy leak + RBAC cache dead code |
| **Production readiness** | **CHƯA SẴN SÀNG** — Cần fix 4 P0 + 15 P1 trước production |

### Con số thống kê V4

| Metric | Value |
|---|---|
| Tổng unique findings (sau deduplicate) | **96** |
| P0 — Blocker | 4 |
| P1 — Critical | 15 |
| P2 — Major | 27 |
| P3 — Minor | 35 |
| P4 — Info | 15 |
| Source: Both (Z.ai + Claude cùng phát hiện) | 18 |
| Source: Z.ai only | 58 |
| Source: Claude only | 20 |

---

## 2. Priority Matrix — Tổng quan P0→P4

### Theo Priority

| Priority | Count | Layer | Fix khi nào |
|---|---|---|---|
| **P0 — Blocker** | 4 | BE (3), Integration (1) | **Ngay lập tức** — chặn tài chính/bảo mật |
| **P1 — Critical** | 15 | FE (9), BE (6) | **Sprint hiện tại** — app không chạy đúng |
| **P2 — Major** | 27 | FE (5), BE (17), DB (5) | **Sprint kế tiếp** — defense-in-depth + data integrity |
| **P3 — Minor** | 35 | FE (12), BE (12), DB (8), DevOps (3) | **Backlog** — code quality + a11y |
| **P4 — Info** | 15 | All | **Khi rảnh** — documentation + optimization |

### Theo Layer

| Layer | P0 | P1 | P2 | P3 | P4 | Total |
|---|---|---|---|---|---|---|
| Frontend (FE) | 0 | 9 | 5 | 12 | 5 | 31 |
| Backend (BE) | 3 | 6 | 17 | 12 | 5 | 43 |
| Database (DB) | 0 | 0 | 5 | 8 | 3 | 16 |
| Integration (INT) | 1 | 0 | 0 | 0 | 0 | 1 |
| DevOps | 0 | 0 | 0 | 3 | 2 | 5 |
| **Total** | **4** | **15** | **27** | **35** | **15** | **96** |

### Theo Source

| Source | Count | Note |
|---|---|---|
| **Both** (Z.ai + Claude cùng phát hiện) | 18 | High confidence — confirmed by 2 reviewers |
| **Z.ai only** | 58 | Exhaustive coverage — DB/index/Clean Code |
| **Claude only** | 20 | Deep business logic + integration gap + experimental verification |

---

## 3. P0 — Blocker (fix trước tiên)

> **4 P0 phải fix NGAY LẬP TỨC** trước khi làm bất kỳ gì khác. Đây là các lỗ hổng tài chính/bảo mật có thể khai thác từ xa.

---

### V4-BE-001 · User tự xác nhận booking bỏ qua thanh toán (P0)

- **Source:** Claude R3-BE-001 (P0) + Z.ai R3-BE-075 (High) — **upgrade to P0**
- **File:** `backend/src/modules/booking/booking.controller.ts:152-162`
- **Category:** Security / Business Logic

**Description:**

```ts
@Patch(':id/status')
async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: any) {
  await this.verifyOwnership(BigInt(id), user.id);   // chỉ check "có phải chủ booking"
  return this.bookingService.updateBookingStatus(BigInt(id), dto.status, user.id);
}
```

`verifyOwnership` chỉ đảm bảo `booking.userId === user.id`, hoàn toàn không giới hạn **giá trị** `dto.status` được phép truyền vào. `canTransition()` là state machine thuần theo *trạng thái hiện tại*, không quan tâm *ai* đang gọi:

```ts
DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],   // ← user tự gọi được
CONFIRMED: ['COMPLETED', 'CANCELLED'],          // ← user tự gọi được, kích hoạt cộng điểm
```

**Kịch bản khai thác:**
1. User tạo booking DRAFT → gọi `POST /api/payments/:bookingId/initiate` → booking chuyển `PENDING_PAYMENT` (không cần thật sự trả tiền).
2. Thay vì hoàn tất thanh toán qua VNPay, user gọi thẳng `PATCH /api/bookings/:id/status` với `{ "status": "CONFIRMED" }`.
3. `updateBookingStatusWithTx` không kiểm tra `Payment.status === 'SUCCESS'` trước khi cho chuyển `CONFIRMED`.
4. Vé được xác nhận **miễn phí**. Nếu tiếp tục gọi `{ "status": "COMPLETED" }`, `booking.service.ts:296-300` sẽ **tự động cộng điểm membership** (`membershipService.awardPoints`).

**Impact:** Đặt vé free + tự cộng điểm membership gian lận. Lỗ hổng tài chính trực tiếp, khai thác được từ xa bởi bất kỳ user thường nào.

**Đối chứng:** `admin.controller.ts:83-119` có route riêng `PATCH /api/admin/bookings/:id/status` được bảo vệ bởi `@Roles('ADMIN')` — đội dev **đã ý thức** được thao tác này cần giới hạn quyền, nhưng route end-user lại thiếu chốt chặn tương đương.

**Fix Guidance:**

```typescript
// backend/src/modules/booking/booking.controller.ts
@Patch(':id/status')
async updateStatus(
  @Param('id') id: string,
  @Body() dto: UpdateStatusDto,
  @CurrentUser() user: any,
) {
  await this.verifyOwnership(BigInt(id), user.id);

  // P0 FIX: User chỉ được phép CANCEL booking của mình.
  // CONFIRMED chỉ từ PaymentService.vnpayCallback (nội bộ).
  // COMPLETED chỉ từ admin hoặc scheduled job.
  const USER_ALLOWED_TRANSITIONS = ['CANCELLED'];

  if (!USER_ALLOWED_TRANSITIONS.includes(dto.status)) {
    throw new ForbiddenException(
      `Users cannot transition booking to "${dto.status}". ` +
      `Only "${USER_ALLOWED_TRANSITIONS.join(', ')}" is allowed for user-initiated transitions.`
    );
  }

  return this.bookingService.updateBookingStatus(BigInt(id), dto.status as any, user.id);
}
```

Plus thêm defense-in-depth trong `BookingService.updateBookingStatusWithTx`:

```typescript
// booking.service.ts — inside updateBookingStatusWithTx
if (newStatus === 'CONFIRMED') {
  const payment = await tx.payment.findUnique({ where: { bookingId } });
  if (!payment || payment.status !== 'SUCCESS') {
    throw new BadRequestException('Cannot confirm booking without successful payment');
  }
}
```

---

### V4-BE-002 · Double-encryption `passportNo` hành khách (P0)

- **Source:** Both — Z.ai R3-BE-001 (Critical) + Claude R3-BE-002 (P1) — **upgrade to P0** (data corruption 100% tái hiện)
- **File:** `backend/src/modules/booking/booking.service.ts:328` + `backend/src/prisma/prisma.service.ts:67-72`
- **Category:** Data Integrity / Security

**Description:**

`prisma.service.ts:67-72` định nghĩa Prisma Client Extension can thiệp **mọi** lệnh `bookingPassenger.create`:

```ts
bookingPassenger: {
  async create({ args, query }) {
    if (args.data?.passportNo) args.data.passportNo = encrypt(args.data.passportNo as string);
    ...
  }
}
```

Nhưng `booking.service.ts:328` (hàm `updatePassengers`) đã **tự tay mã hoá trước khi gọi**:

```ts
tx.bookingPassenger.create({
  data: {
    ...
    passportNo: (p.passportNo || p.passport) ? encrypt(p.passportNo || p.passport) : null,
                                  ^^^^^^^^ ← manual encrypt (lần 1)
  },
});
// → tx kế thừa extension → encrypt lần nữa (lần 2)
```

Kết quả: `passportNo` bị `encrypt()` **2 lần liên tiếp** → stored as `enc:v1:<iv2>:<tag2>:enc:v1:<iv>:<tag>:<ciphertext>`. Khi đọc, `decryptRecord` chỉ gọi `decrypt()` **1 lần** → trả về `enc:v1:<iv>:<tag>:<ciphertext>` (vẫn còn mã hoá, vô nghĩa).

**Đối chứng:** `user.service.ts:40-46` (hàm `updateProfile`) **không** tự mã hoá tay, để middleware tự lo — **đây là hành vi ĐÚNG**. Bug ở `booking.service.ts:328` là do 1 người viết code khác không biết middleware đã tự động lo.

**Impact:** Mọi booking có passenger với passportNo → `GET /api/bookings/:id` returns 500 (`DecryptionException`). Dữ liệu hộ chiếu hành khách bay quốc tế hỏng vĩnh viễn. Seat selection, payment, expiry processing all break.

**Fix Guidance:**

```typescript
// backend/src/modules/booking/booking.service.ts:328
// BEFORE (buggy):
passportNo: (p.passportNo || p.passport) ? encrypt(p.passportNo || p.passport) : null,

// AFTER (correct — let Prisma extension handle encryption):
passportNo: (p.passportNo || p.passport) || null,
```

Plus data migration script để fix existing double-encrypted rows:

```sql
-- Identify double-encrypted rows (heuristic: starts with "enc:v1:" twice)
SELECT id, passportNo FROM BookingPassenger
WHERE passportNo LIKE 'enc:v1:%enc:v1:%';
```

```typescript
// scripts/fix-double-encryption.ts
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../src/common/utils/encryption.util';

const prisma = new PrismaClient();

async function fix() {
  const passengers = await prisma.bookingPassenger.findMany({
    where: { passportNo: { startsWith: 'enc:v1:' } },
  });

  for (const p of passengers) {
    try {
      const onceDecrypted = decrypt(p.passportNo!);
      // If still starts with 'enc:', it was double-encrypted
      if (onceDecrypted.startsWith('enc:')) {
        const plaintext = decrypt(onceDecrypted); // decrypt second layer
        // Re-encrypt once (extension will handle on update — but we're using base PrismaClient)
        const correctCipher = encrypt(plaintext);
        await prisma.bookingPassenger.update({
          where: { id: p.id },
          data: { passportNo: correctCipher },
        });
        console.log(`Fixed passenger ${p.id}`);
      }
    } catch (e) {
      console.error(`Failed to fix passenger ${p.id}:`, e);
    }
  }
}

fix().then(() => prisma.$disconnect());
```

---

### V4-BE-003 · So sánh `Prisma.Decimal` bằng `<` sai logic (P0)

- **Source:** Claude R3-BE-003 (P1) — **upgrade to P0** (verify thực nghiệm bằng `node -e`)
- **File:** `backend/src/modules/booking/booking.service.ts:128`
- **Category:** Business Logic / Money

**Description:**

```ts
if (currentBooking.totalAmount < voucher.minOrderAmount) {
  throw new BadRequestException(`Đơn hàng phải từ ${voucher.minOrderAmount} để áp dụng mã này`);
}
```

`totalAmount` và `minOrderAmount` đều là instance của `Prisma.Decimal` (thư viện `decimal.js`). Object này có `valueOf()` trả về **string**, không phải number. Khi dùng toán tử `<` giữa 2 object có `valueOf()` trả string, JavaScript thực hiện **so sánh chuỗi theo thứ tự từ điển (lexicographic)**, không phải so sánh số học.

**Đã verify bằng thực nghiệm (chạy `node` với `decimal.js` thật):**

```js
const Decimal = require('decimal.js');
const total = new Decimal('900000');
const minOrder = new Decimal('1000000');
console.log(total < minOrder);    // → false   (SAI — về số học 900000 < 1000000 phải là true)
console.log(total.valueOf());      // → '900000' (kiểu string)
```

Kết quả: chuỗi `"900000"` so với `"1000000"` theo string so sánh ký tự đầu `'9' > '1'` nên `"900000" > "1000000"`, dẫn đến điều kiện chặn "phải đạt tối thiểu" bị **vô hiệu hoá ngược** — với đơn hàng có `totalAmount` bắt đầu bằng chữ số lớn hơn nhưng ít chữ số hơn `minOrderAmount`, hệ thống sẽ **cho phép** áp voucher dù đơn chưa đạt ngưỡng tối thiểu.

**Đối chứng:** Toàn bộ phép toán tiền tệ khác trong cùng file (`recalculateTotal`, tính `discount`) đều dùng đúng method của `Decimal` (`.plus()`, `.mul()`, `.div()`, `.gt()`) — chỉ riêng dòng 128 này dùng nhầm toán tử JS thuần.

**Impact:** Thất thoát doanh thu — áp voucher cho đơn dưới ngưỡng tối thiểu. Dễ xảy ra thực tế vì `totalAmount` do booking sinh ra hàng ngày với nhiều mức giá trị.

**Fix Guidance:**

```typescript
// backend/src/modules/booking/booking.service.ts:128
// BEFORE (buggy):
if (currentBooking.totalAmount < voucher.minOrderAmount) {

// AFTER (correct — use Decimal method):
if (currentBooking.totalAmount.lessThan(voucher.minOrderAmount)) {
  // or: currentBooking.totalAmount.lt(voucher.minOrderAmount)
  throw new BadRequestException(`Đơn hàng phải từ ${voucher.minOrderAmount} để áp dụng mã này`);
}
```

---

### V4-INT-001 · Booking flow FE không gọi API backend (P0)

- **Source:** Claude R3-INTEGRATION-001 (P1) — **upgrade to P0** (chức năng lõi không chạy)
- **File:** `frontend/src/lib/api.ts:53-59` (bookingApi defined) + `frontend/src/views/booking/Payment.tsx:19-22` (hardcoded prices)
- **Category:** FE↔BE Integration

**Description:**

```ts
// frontend/src/lib/api.ts:53-59
export const bookingApi = {
  createDraftBooking: (data: any) => api.post('/booking', data),
  selectSeat: (id: string, seatData: any) => api.post(`/booking/${id}/seats`, seatData),
  addPassengers: (id: string, passengers: any) => api.post(`/booking/${id}/passengers`, passengers),
  applyVoucher: (id: string, code: string) => api.post(`/booking/${id}/voucher`, { code }),
  updateStatus: (id: string, status: string) => api.patch(`/booking/${id}/status`, { status }),
};
```

Grep `grep -rln "bookingApi\." frontend/src` → **0 kết quả**. `bookingApi` được định nghĩa nhưng không một component/view/hook nào trong 253 file gọi tới nó.

Thay vào đó, `Payment.tsx` (và toàn bộ chuỗi `SeatSelection → PassengerInfo → Baggage → AddOns → FareClass → Meal → Payment`) chạy hoàn toàn local qua `bookingFlowStore` (Zustand), với giá tiền **hard-code**:

```ts
// frontend/src/views/booking/Payment.tsx:19-22
const basePricePerPax = outboundFareClass === 'Business' ? 3000000 : 1500000;
const basePrice = basePricePerPax * paxCount;
const taxes = basePrice * 0.3;
...
const handlePay = () => { navigate.push('/booking/success'); };
```

`handlePay` chỉ điều hướng trang, không gọi `bookingApi` hay `/api/payments/:id/initiate` nào cả. Toàn bộ flow đặt vé là **giả lập 100%**.

**Impact:** Ứng dụng "trông như xong" nhưng chức năng lõi (đặt vé, thanh toán) chưa thật sự chạy end-to-end. Backend có đầy đủ API nhưng FE không gọi. Đây là **khoảng cách tích hợp lớn nhất** mà 2 round trước chưa soi tới vì tập trung vào lỗi trong từng file riêng lẻ.

**Fix Guidance:** Đây là hạng mục lớn (không phải "bugfix" đơn lẻ), cần tách thành task riêng:

1. **Sửa path/verb `bookingApi`** cho đúng route BE:
   ```ts
   // lib/api.ts — verify against BE controller paths
   export const bookingApi = {
     createDraftBooking: (data: CreateBookingDto) => api.post('/booking', data),
     selectSeat: (id: string, dto: SelectSeatDto) => api.patch(`/booking/${id}/seats`, dto),  // PATCH not POST
     addPassengers: (id: string, passengers: PassengerDto[]) => api.put(`/booking/${id}/passengers`, { passengers }),  // PUT
     applyVoucher: (id: string, code: string) => api.post(`/booking/${id}/voucher`, { code }),
     initiatePayment: (bookingId: string) => api.post(`/payments/${bookingId}/initiate`),
   };
   ```

2. **Wire `bookingFlowStore` với `bookingApi`** ở mỗi step:
   - `FareClass.tsx` → `bookingApi.createDraftBooking()` sau khi chọn fare class
   - `SeatSelection.tsx` → `bookingApi.selectSeat()` với `passengerId` + `seatId` + `version`
   - `PassengerInfo.tsx` → `bookingApi.addPassengers()` với DTO đúng shape
   - `Payment.tsx` → `bookingApi.applyVoucher()` (nếu có) + `bookingApi.initiatePayment()` → redirect to VNPay URL

3. **Bỏ giá hard-code** trong `Payment.tsx` + `BookingSummarySidebar.tsx` — đọc từ `bookingFlowStore.selectedFlightPricing` (set sau khi fetch flight detail).

4. **`BookingSuccess.tsx`** — nhận `bookingId` từ URL param (sau VNPay redirect) hoặc từ store, không hardcode `'NEWPNR'`/`'VN8A2B'`.

---

## 4. P1 — Critical (fix ngay sau P0)

> **15 P1 phải fix trong sprint hiện tại** — app không chạy đúng nếu không fix.

### Frontend P1 (9 issues)

---

#### V4-FE-001 · Refresh-token rotation broken — auto-logout mỗi 15 phút (P1)

- **Source:** Both — Claude R3-FE-001 + Z.ai R3-FE-004
- **File:** `frontend/src/views/public/auth/Login.tsx:46-52`, `frontend/src/lib/api.ts:38-46`
- **Category:** Auth / UX

**Description:** 3 vấn đề cộng hưởng:

1. **BE trả `refresh_token` nhưng FE bỏ qua:**
```ts
// Login.tsx:46-52
login({ id: data.user.id, ... }, data.access_token);
setAuthCookie(data.access_token);
// ← data.refresh_token bị bỏ qua hoàn toàn
```
(y hệt ở `LoginModal.tsx` và `AdminLogin.tsx` — đã grep xác nhận cả 3 nơi đều bỏ qua `data.refresh_token`).

2. **Interceptor 401-retry gọi refresh với body rỗng:**
```ts
// lib/api.ts:38-46
await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true });
```
Backend validate `whitelist:true, forbidNonWhitelisted:true` + `@IsNotEmpty()` trên `refresh_token` → request này **luôn trả 400** vì thiếu field bắt buộc. `catch` block sau đó gọi `logout()` ngay lập tức.

3. **Refresh response không được parse:** Ngay cả khi refresh thành công, `lib/api.ts` không parse `res.data.access_token`, không `setAuthCookie(newToken)`, không `useAuthStore.setState({ token: newToken })` → retry dùng OLD expired token → 401 again → forced logout.

**Impact:** Access token JWT có `expiresIn: '15m'`. Kết hợp với refresh-flow hỏng → **user bị văng ra ngoài (auto-logout) sau đúng 15 phút sử dụng, mỗi lần**, bất kể `refresh_token` 7 ngày còn hiệu lực ở DB.

**Fix Guidance:**

```typescript
// frontend/src/views/public/auth/Login.tsx (và LoginModal, AdminLogin)
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const res = await fetch(`${API_URL}/auth/login`, { ... });
  const data = await res.json();
  if (!res.ok) { toast.error(data.message); return; }

  login({ ...data.user, role: data.user.role as UserRole }, data.access_token);
  setAuthCookie(data.access_token);
  // P1 FIX: Store refresh_token (ideally as HttpOnly cookie set by BE)
  if (data.refresh_token) {
    document.cookie = `refresh_token=${data.refresh_token}; path=/; max-age=${7*24*60*60}; samesite=lax${secure}`;
  }
};

// frontend/src/lib/api.ts — fix 401-retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        // Read refresh_token from cookie
        const refreshToken = document.cookie.match(/refresh_token=([^;]+)/)?.[1];
        const res = await axios.post(`${apiUrl}/auth/refresh`, { refresh_token: refreshToken }, { withCredentials: true });
        const newToken = res.data?.access_token;
        if (newToken) {
          setAuthCookie(newToken);
          useAuthStore.setState({ token: newToken });
        }
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

**Better long-term:** BE `POST /auth/login` set 2 httpOnly cookies: `access_token` (15min) + `refresh_token` (7d, SameSite=Strict). FE never touches tokens.

---

#### V4-FE-002 · "Fix" chống XSS cho token là ảo giác (P1)

- **Source:** Both — Claude R3-FE-002 + Z.ai R3-FE-009
- **File:** `frontend/src/stores/authStore.ts:41-42` + `frontend/src/lib/auth.ts:4-7`
- **Category:** Security

**Description:** `authStore.ts` có comment `// FE-S-001 fix: Exclude token from sessionStorage (prevents XSS leak)` và loại `token` khỏi `partialize` — đúng. Nhưng token vẫn được ghi ra **cookie thường (không HttpOnly)** ngay sau đó:

```ts
// frontend/src/lib/auth.ts:4-7
export function setAuthCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; secure" : "";
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${TOKEN_TTL_SECONDS}; samesite=lax${secure}`;
}
```

Cookie set bằng `document.cookie` (JS phía client) **không thể là HttpOnly** — bất kỳ script nào chạy được trên trang (XSS) đều đọc được y hệt như đọc `sessionStorage`. Điểm rò rỉ token qua XSS **không được giảm đi**, chỉ dời từ chỗ này sang chỗ khác.

**Vì sao cookie JS tồn tại:** Next.js Middleware (edge runtime) cần đọc token qua `request.cookies` để redirect. Nhưng middleware đọc cookie qua header, **không cần JS** — BE có thể set HttpOnly cookie, middleware vẫn đọc được.

**Fix Guidance:** Chuyển cookie management sang BE:

```typescript
// backend/src/modules/auth/auth.controller.ts — login endpoint
@Post('login')
async login(@Body() dto: LoginDto, @Res() res: Response) {
  const result = await this.authService.login(dto.email, dto.password, req);
  // Set httpOnly cookies
  res.cookie('access_token', result.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15min
  });
  res.cookie('refresh_token', result.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  });
  return res.json({ user: result.user });
}

// frontend/src/lib/auth.ts — DELETE this file, no more document.cookie
// frontend/src/middleware.ts — read cookie (middleware can read httpOnly cookies)
const token = request.cookies.get('access_token')?.value;
```

---

#### V4-FE-003 · Middleware tin payload JWT không xác thực chữ ký (P1)

- **Source:** Both — Claude R3-FE-003 + Z.ai R3-FE-028
- **File:** `frontend/src/middleware.ts:16-27`
- **Category:** Security / Privilege Escalation

**Description:**

```ts
let user = null;
if (token) {
  const parts = token.split('.');
  if (parts.length === 3) {
    const payload = JSON.parse(Buffer.from(parts[1]!, 'base64').toString('utf-8'));
    user = payload;  // ← tin payload không verify chữ ký
  }
}
```

Chỉ decode base64 phần payload, **không verify chữ ký HMAC**. Cookie giả `xxxxx.<base64 của {"role":"ADMIN"}>.yyyyy` sẽ khiến middleware coi user là ADMIN và cho qua redirect-guard vào `/admin/*`.

**Giảm nhẹ:** Đây chỉ là guard ở tầng **route/redirect** của Next.js, không phải tầng API. Toàn bộ API thật verify chữ ký ở `jwt.strategy.ts`. Forge cookie chỉ khiến trang `/admin/*` **render được (bypass redirect)**, nhưng mọi API call bên trong trả 401. Rủi ro thật: (1) lộ cấu trúc UI/bundle admin, (2) middleware không kiểm `exp` → token hết hạn thật vẫn qua được middleware.

**Fix Guidance:** Dùng `jose` (Edge-compatible):

```typescript
// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value || request.cookies.get('access_token')?.value;

  let user: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload; // verified signature + exp
    } catch {
      // Token invalid or expired — treat as unauthenticated
    }
  }

  // ... rest of middleware logic (admin/user path checks)
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
```

Add to package.json: `bun add jose`. Expose `JWT_ACCESS_SECRET` to Edge runtime via `next.config.ts`.

---

#### V4-FE-004 · `/admin/login` route unreachable (P1)

- **Source:** Z.ai R3-FE-001
- **File:** `frontend/src/app/admin/layout.tsx:19-26`
- **Category:** Bug / Architecture

**Description:** `/admin/login` ở trong `/admin/` segment → `AdminLayout` apply. Layout return `null` cho unauthenticated users, useEffect redirect to `/login`. **AdminLogin form không bao giờ render.**

**Fix Guidance:**

```typescript
// frontend/src/app/admin/layout.tsx
const pathname = usePathname();
const isLoginPage = pathname === '/admin/login';

useEffect(() => {
  if (isLoginPage) return; // Skip auth check for login page
  if (mounted && (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'STAFF'))) {
    router.push('/admin/login');
  }
}, [mounted, isAuthenticated, user, router, isLoginPage]);

if (isLoginPage) return <>{children}</>;
// ... rest of layout
```

---

#### V4-FE-005 · Double Header+Footer on all `/booking/*` pages (P1)

- **Source:** Z.ai R3-FE-002
- **File:** `frontend/src/app/(public)/layout.tsx` + `frontend/src/components/layout/BookingLayout.tsx:43,72`
- **Category:** Bug / Architecture

**Description:** `(public)/layout.tsx` wrap mọi page với `<PublicLayout>` (Header+Footer). Mỗi `/booking/*` page.tsx wrap content trong `<BookingLayout>` cũng render Header+Footer. Result: double Header+Footer.

**Fix Guidance:** Tạo segment layout `app/(public)/booking/layout.tsx` không render Header/Footer; delete `components/layout/BookingLayout.tsx`; update 9 page.tsx để không wrap.

```tsx
// frontend/src/app/(public)/booking/layout.tsx (NEW)
import { BookingProgressBar } from '@/components/booking/BookingProgressBar';
import { BookingSummarySidebar } from '@/components/booking/BookingSummarySidebar';

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col py-8 max-w-7xl mx-auto w-full px-4 gap-8">
      <BookingProgressBar />
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full">{children}</div>
        <BookingSummarySidebar />
      </div>
    </div>
  );
}

// Then update app/(public)/booking/seat/page.tsx (and 8 others):
'use client';
import dynamic from 'next/dynamic';
const PageComponent = dynamic(() => import('@/views/booking/SeatSelection'));
export default function Page() {
  return <PageComponent />;  // No <BookingLayout> wrap
}
```

---

#### V4-FE-006 · 5 routes missing `<Suspense>` → `next build` fails (P1)

- **Source:** Z.ai R3-FE-003
- **Files:** `FlightDetail.tsx:4`, `BoardingPass.tsx:2`, `ResetPassword.tsx:7`, `BlogDetail.tsx:3`
- **Category:** Bug / React

**Description:** Next.js 16 yêu cầu `useSearchParams()` wrapped trong `<Suspense>`, không thì `next build` fail với: `useSearchParams() should be wrapped in a suspense boundary at page "/path"`.

**Fix Guidance:** Wrap `<PageComponent/>` trong `<Suspense>` ở mỗi affected page.tsx:

```tsx
// frontend/src/app/(public)/flights/[id]/page.tsx (and 4 others)
'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PageComponent = dynamic(() => import('@/views/public/flights/FlightDetail'));

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    }>
      <PageComponent />
    </Suspense>
  );
}
```

---

#### V4-FE-007 · `lib/routes.ts` is dead code — R2-FE-004 fix claim bogus (P1)

- **Source:** Z.ai R3-FE-005
- **File:** `frontend/src/lib/routes.ts:1-8` (zero imports across `src/`)
- **Category:** Clean Code / Bug

**Description:** `routes.tourDetail`/`flightDetail`/`bookingTicket` defined nhưng không import ở đâu. 7 hardcoded `/tours/${id}` + `/booking/${id}/ticket` call sites remain.

**Fix Guidance:** Import `routes` từ `@/lib/routes` ở RecommendedTours, Tours, Settings, CompareModal, BookingHistory; replace all hardcoded paths:

```tsx
import { routes } from '@/lib/routes';
// RecommendedTours.tsx:110,145
<Link href={routes.tourDetail(tour.id)}>
// Tours.tsx:245
<Link href={routes.tourDetail(tour.id)}>
// Settings.tsx:149
<Link href={routes.tourDetail(tour.id)}>
// CompareModal.tsx:75
navigate.push(routes.tourDetail(tour.id));
// BookingHistory.tsx:78
navigate.push(routes.bookingTicket(booking.id));
```

---

#### V4-FE-008 · Open redirect in Login.tsx via unvalidated `redirect` param (P1)

- **Source:** Z.ai R3-FE-006
- **File:** `frontend/src/views/public/auth/Login.tsx:19,55`
- **Category:** Security

**Description:** `const redirect = searchParams?.get('redirect') || '/';` rồi `navigate.push(redirect)`. Attacker craft `https://app.com/login?redirect=https://evil.com` → phishing credential theft.

**Fix Guidance:**

```tsx
const rawRedirect = searchParams?.get('redirect') || '/';
const isInternal = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//');
const redirect = isInternal ? rawRedirect : '/';
navigate.push(redirect);
```

---

#### V4-FE-009 · `/api/admin/dashboard` no auth — anonymous can read admin KPIs (P1)

- **Source:** Z.ai R3-FE-007
- **File:** `frontend/src/app/api/admin/dashboard/route.ts:1-22`
- **Category:** Security

**Description:** `mockDashboardData` hardcoded, no `cookies()` read, no role check, no BE proxy. Anonymous `curl /api/admin/dashboard` lấy admin KPIs.

**Fix Guidance:**

```typescript
// frontend/src/app/api/admin/dashboard/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export async function GET() {
  const token = cookies().get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN' && payload.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Proxy to BE
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const res = await fetch(`${apiUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

---

### Backend P1 (6 issues)

---

#### V4-BE-004 · `SeatStatus.BOOKED` không bao giờ được gán (P1)

- **Source:** Claude R3-BE-004 (grep confirm 0 occurrences)
- **File:** `backend/src/modules/booking/booking.service.ts` + `backend/src/jobs/booking-expiry.processor.ts`
- **Category:** Business Logic / Data Integrity

**Description:** Enum `SeatStatus` có 3 trạng thái: `AVAILABLE | LOCKED | BOOKED`. Grep `grep -rn "'BOOKED'" backend/src` → **0 kết quả** ngoài enum definition. Ghế chỉ có 2 transition:
- `AVAILABLE → LOCKED` (chọn ghế, `booking.service.ts:72`)
- `LOCKED → AVAILABLE` (booking hết hạn, `booking-expiry.processor.ts:52`)

**Không có code nào** chuyển ghế sang `BOOKED` khi thanh toán thành công / booking `CONFIRMED`.

**Impact:** Ghế đã thanh toán vẫn mãi ở `LOCKED` — không phân biệt được với ghế đang tạm giữ 15 phút. Tính năng "sơ đồ ghế" hiển thị ghế đã bán **không thể triển khai đúng**.

**Fix Guidance:** Thêm transition `LOCKED → BOOKED` trong `updateBookingStatusWithTx` khi `newStatus === 'CONFIRMED'`:

```typescript
// backend/src/modules/booking/booking.service.ts — inside updateBookingStatusWithTx
if (newStatus === 'CONFIRMED') {
  // P1 FIX: Transition seats from LOCKED to BOOKED
  const passengers = await tx.bookingPassenger.findMany({
    where: { bookingId },
    select: { seatId: true },
  });
  const seatIds = passengers.map(p => p.seatId).filter(Boolean) as bigint[];
  if (seatIds.length > 0) {
    await tx.flightSeat.updateMany({
      where: { id: { in: seatIds }, status: 'LOCKED' },
      data: { status: 'BOOKED', version: { increment: 1 } },
    });
  }
}

// Also add to canTransition or state machine:
// LOCKED → BOOKED (when booking CONFIRMED)
// BOOKED → AVAILABLE (when booking CANCELLED after confirmation — refund flow)
```

---

#### V4-BE-005 · TOCTOU race in `initiatePayment` reverts completed payments (P1)

- **Source:** Z.ai R3-BE-002
- **File:** `backend/src/modules/payment/payment.service.ts:35-79`
- **Category:** Concurrency / Security

**Description:** `existingPayment` fetched OUTSIDE tx (line 35-37). Inside tx (line 64), stale reference used: `tx.payment.update({ where: { id: existingPayment.id }, data: { status: 'PENDING' } })`. If VNPay callback completes payment (SUCCESS) between line 38 and 42, tx overwrites SUCCESS → PENDING.

**Impact:** Successfully paid booking reset to PENDING → double-payment, double-confirmation, double-points-award.

**Fix Guidance:**

```typescript
// backend/src/modules/payment/payment.service.ts
return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
  if (existingPayment) {
    // P1 FIX: Conditional update — only succeed if PENDING
    const r = await tx.payment.updateMany({
      where: { id: existingPayment.id, status: 'PENDING' },
      data: { status: 'PENDING', idempotencyKey },
    });
    if (r.count === 0) {
      throw new BadRequestException('Payment already completed for this booking');
    }
  } else {
    await tx.payment.create({ data: { ... } });
  }
  // ... rest of logic
});
```

---

#### V4-BE-006 · Failed payment leaves seats LOCKED forever + no history (P1)

- **Source:** Z.ai R3-BE-003
- **File:** `backend/src/modules/payment/payment.service.ts:153-170`
- **Category:** Bug / Data Integrity

**Description:** Failure path (responseCode !== '00'): `tx.booking.update({ status: 'CANCELLED' })` directly — bypasses `updateBookingStatusWithTx` (no OCC, no history). No seat release. No voucher release. Inconsistent with success path.

**Impact:** Inventory leak — every failed payment permanently removes seats from saleable inventory.

**Fix Guidance:**

```typescript
// backend/src/modules/payment/payment.service.ts — failure path
} else {
  const updateResult = await tx.payment.updateMany({
    where: { id: payment.id, status: 'PENDING' },
    data: { status: 'FAILED' },
  });
  if (updateResult.count === 0) return { RspCode: '00', Message: 'Confirm Success' };

  // P1 FIX: Reuse state machine (handles history + can throw ConflictException)
  await this.bookingService.updateBookingStatusWithTx(tx, bookingId, 'CANCELLED', null);

  // P1 FIX: Release seats (same logic as booking-expiry.processor.ts)
  const passengers = await tx.bookingPassenger.findMany({
    where: { bookingId }, select: { seatId: true },
  });
  const seatIds = passengers.map(p => p.seatId).filter(Boolean) as bigint[];
  if (seatIds.length) {
    await tx.flightSeat.updateMany({
      where: { id: { in: seatIds }, status: 'LOCKED' },
      data: { status: 'AVAILABLE', version: { increment: 1 } },
    });
  }
}
```

---

#### V4-BE-007 · JwtStrategy returns `passwordHash` + decrypted PII on every request (P1)

- **Source:** Z.ai R3-BE-005 (Claude chỉ cover `updateProfile` R3-BE-006, không cover JwtStrategy)
- **File:** `backend/src/modules/auth/strategies/jwt.strategy.ts:38-47`
- **Category:** Security / Privacy

**Description:** `return user` attaches entire user object to `request.user`. Includes `passwordHash`, decrypted `nationalId`/`passportNo` (Prisma extension decrypts on read). Every `@CurrentUser() user: any` in controllers has access to all PII.

**Impact:** PII + password hash leak on **every** authenticated request. Any `console.log(user)`, error response, or Pino serializer leaks it.

**Fix Guidance:**

```typescript
// backend/src/modules/auth/strategies/jwt.strategy.ts:38-47
async validate(req: any, payload: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing or malformed Authorization header');
  }
  const token = authHeader.split(' ')[1];
  const isBlacklisted = await this.authService.isTokenBlacklisted(token);
  if (isBlacklisted) {
    throw new UnauthorizedException('Token has been revoked');
  }

  // P1 FIX: Use select to return only what's needed
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      deletedAt: true,
      fullName: true,
      avatarUrl: true,
      // Exclude: passwordHash, nationalId, passportNo, phone, dateOfBirth
    },
  });
  if (!user || user.deletedAt) {
    throw new UnauthorizedException('User account has been deleted');
  }
  if (user.status === 'LOCKED') {
    throw new UnauthorizedException('User account is locked');
  }
  return user;
}
```

---

#### V4-BE-008 · `updateProfile` returns full user record with decrypted PII (P1)

- **Source:** Both — Claude R3-BE-006 + Z.ai R3-BE-014
- **File:** `backend/src/modules/user/user.service.ts:31-45`
- **Category:** Security / Privacy

**Description:** `updateProfile` returns `prisma.user.update(...)` without `select` — returns entire user row including `passwordHash` + decrypted `nationalId`/`passportNo`. `getProfile` (dòng 8-27) has `select` tường minh — inconsistent.

```ts
async updateProfile(userId: bigint, data: any) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { fullName: data.fullName, phone: data.phone, ... },
  });   // ← returns TOÀN BỘ record User
}
```

**Fix Guidance:**

```typescript
// backend/src/modules/user/user.service.ts
async updateProfile(userId: bigint, data: any) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { fullName: data.fullName, phone: data.phone, ... },
    select: {
      id: true, email: true, fullName: true, phone: true,
      avatarUrl: true, dateOfBirth: true, role: true, status: true, createdAt: true,
      // Exclude: passwordHash, nationalId, passportNo
    },
  });
}
```

---

#### V4-BE-009 · RBAC cache invalidation is DEAD CODE — key mismatch (P1)

- **Source:** Both — Z.ai R3-BE-004 + Claude R3-BE-005
- **File:** `backend/src/common/guards/authorization.guard.ts:93` vs `backend/src/modules/rbac/rbac.controller.ts:201,219,273-275`
- **Category:** Security

**Description:** Guard reads `role_permissions_${role}`. Controller invalidates `rbac_permissions_${role}`. Keys NEVER match.

**Impact:** After admin revokes permission, user retains revoked permission for full 5-min TTL. Security policy change có 5-minute lag.

**Fix Guidance:**

```typescript
// backend/src/common/constants/cache-keys.ts (NEW file)
export const rolePermissionsCacheKey = (role: string) => `role_permissions_${role}`;

// backend/src/common/guards/authorization.guard.ts:93
import { rolePermissionsCacheKey } from '../constants/cache-keys';
const cacheKey = rolePermissionsCacheKey(role);

// backend/src/modules/rbac/rbac.controller.ts:201,219,273-275
import { rolePermissionsCacheKey } from '../../common/constants/cache-keys';
await this.cacheManager.del(rolePermissionsCacheKey(dto.role));
await this.cacheManager.del(rolePermissionsCacheKey('ADMIN'));
await this.cacheManager.del(rolePermissionsCacheKey('STAFF'));
await this.cacheManager.del(rolePermissionsCacheKey('USER'));
```

---

## 5. P2 — Major (sprint kế tiếp)

> **27 P2** — defense-in-depth + data integrity. Fix sau khi P0/P1 xong.

### Backend P2 (17 issues)

| ID | Source | File:line | Vấn đề | Fix Guidance (tóm tắt) |
|---|---|---|---|---|
| V4-BE-010 | Claude R3-BE-008 | `payment.service.ts:87-172` | VNPay callback thiếu amount-check (không đối chiếu `vnp_Amount` với `payment.amount` trong DB) | Thêm `if (Number(vnpayParams['vnp_Amount']) !== Number(payment.amount) * 100) return { RspCode: '99' }` |
| V4-BE-011 | Claude R3-BE-009 | `auth.controller.ts:66-94` | Login thiếu throttle riêng (100 req/min quá rộng so với send-otp 3/15min) | `@Throttle({ default: { limit: 10, ttl: 60000 } })` trên login endpoint |
| V4-BE-012 | Claude R3-BE-010 | `main.ts:68-105` | Swagger UI lộ `admin@tripplanner.vn / Admin@123`, không tắt ở prod | `if (process.env.NODE_ENV !== 'production') { SwaggerModule.setup(...) }` + remove credentials from description |
| V4-BE-013 | Both | `schema.prisma:147` + `session.service.ts:19` | `UserSession.sessionToken` lưu plaintext (không hash như RefreshToken) | Hash SHA-256 + store `sessionTokenHash`, lookup by hash |
| V4-BE-014 | Z.ai R3-BE-006 | `prisma.service.ts:152-155` | `PrismaService` constructor `return extendedClient as any` fragile | Refactor sang composition over inheritance (xem V4 fix code appendix) |
| V4-BE-015 | Z.ai R3-BE-007 | `booking-expiry.processor.ts:50-53` | Seat release missing `status: 'LOCKED'` filter → có thể release ghế của booking khác | `where: { id: { in: seatIds }, status: 'LOCKED' }` |
| V4-BE-016 | Z.ai R3-BE-008 | `payment.service.ts:44-58` | `initiatePayment` booking transition lacks OCC (uses `tx.booking.update` not `updateMany where status=...`) | `await this.bookingService.updateBookingStatusWithTx(tx, bookingId, 'PENDING_PAYMENT', userId)` |
| V4-BE-017 | Z.ai R3-BE-009 | `auth.service.ts:175-196` | Login auto-unlock bypasses admin manual lock (no distinction AUTO vs ADMIN) | Add `lockReason` enum field on User, only auto-unlock `AUTO_FAILED_LOGIN` |
| V4-BE-018 | Z.ai R3-BE-011 | `prisma.service.ts:129-141` | Nested relation decryption only 1 level deep (`record.passengers`, `record.user`) | Recursive deep decrypt (5 levels) — walk all object properties |
| V4-BE-019 | Z.ai R3-BE-012 | `booking.controller.ts:20,92,97-104` | `BookingController` injects `PrismaService` directly + does data access (SRP violation) | Move `verifyOwnership` + `getBooking` query to `BookingService` |
| V4-BE-020 | Z.ai R3-BE-013 | `admin.controller.ts:102-116` | Admin `updateBookingStatus` uses batch `$transaction` without OCC | Call `this.bookingService.updateBookingStatus(id, status, userId)` directly |
| V4-BE-021 | Z.ai R3-BE-015 | `review.service.ts:114-132` | `upvoteReview` abuses ActivityLog as vote table (TOCTOU race, pollutes activity feed) | Create `ReviewVote` model with `@@unique([reviewId, userId])` |
| V4-BE-022 | Z.ai R3-BE-016 | `main.ts:66` + `app.module.ts:103-106` | `GlobalExceptionFilter` registered TWICE (main.ts + APP_FILTER) | Keep ONLY `APP_FILTER` registration (DI-friendly), remove `app.useGlobalFilters` |
| V4-BE-023 | Z.ai R3-BE-017 | `payment.service.ts:186` | `requestRefund` throws `UnauthorizedException` (401) for ownership violation — should be `ForbiddenException` (403) | `throw new ForbiddenException(...)` |
| V4-BE-024 | Z.ai R3-BE-018 | 10+ controllers | `BigInt(id)` no try/catch — invalid input throws raw `SyntaxError` → 500 | Use `ParseBigIntPipe` or wrap in try/catch → `BadRequestException` |
| V4-BE-025 | Z.ai R3-BE-019 | `payment.controller.ts:32-36` | `vnpayCallback` accepts GET with `@Query() vnpayParams: any` (no DTO, no IP whitelist) | Create `VnpayCallbackDto`, add `@Public()`, consider POST, add IP whitelist |
| V4-BE-026 | Z.ai R3-BE-022 | `upload.controller.ts:217-274` | Gallery processes 10×5MB in memory (OOM risk — 100 concurrent = 5GB) | Use disk storage for gallery, reduce max files to 5 + max size to 2MB |

### Frontend P2 (5 issues)

| ID | Source | File:line | Vấn đề | Fix Guidance (tóm tắt) |
|---|---|---|---|---|
| V4-FE-010 | Z.ai R3-FE-010 | `LoginModal.tsx:48` | `role: data.user.role === 'ADMIN' ? 'ADMIN' : 'USER'` → STAFF users get role='USER' | `role: data.user.role` (trust BE enum) |
| V4-FE-011 | Z.ai R3-FE-012 | `components/common/ProtectedRoute.tsx` | Dead code (180 LOC orphaned since AdminLayout/UserLayout took over) | Delete file |
| V4-FE-012 | Z.ai R3-FE-013 | `stores/notificationStore.ts` + `Header.tsx:200-208` | Dead code — Header uses hardcoded array instead of store | Wire Header to `useNotificationStore` + fetch from BE |
| V4-FE-013 | Both | `stores/authStore.ts:27` | `logout()` calls `fetch('/api/auth/logout')` — route doesn't exist → 404 silent | Implement `app/api/auth/logout/route.ts` OR remove fetch (BE blacklist via /auth/logout already) |
| V4-FE-014 | Claude R3-FE-004 | `stores/wishlistStore.ts` + `bookingCartStore.ts` + `checklistStore.ts` | Stores not synced multi-device (BE has WishlistModule but FE doesn't call) | Wire stores to BE API (part of V4-INT-001) |

### Database P2 (5 issues)

| ID | Source | File:line | Vấn đề | Fix Guidance (tóm tắt) |
|---|---|---|---|---|
| V4-DB-001 | Both | migration `20260718091048` (1 line) | Only 1 of 15+ CHECK constraints added (R2-DB-010 fix claim partial) | Create migration adding 18 missing CHECKs (SQL in appendix) |
| V4-DB-002 | Z.ai R3-DB-026 | schema.prisma BookingItem/BookingPassenger/TourItinerary/TourImage | Missing `@@index([bookingId])` / `@@index([tourId])` → full table scan on every `include` | Add 4 indexes + migration |
| V4-DB-003 | Z.ai R3-DB-126 | `prisma.service.ts:14-127` | Encryption extension doesn't transform WHERE clause → lookup by PII silently fails | Extend interceptor to encrypt `args.where.nationalId`/`args.where.passportNo` |
| V4-DB-004 | Z.ai R3-DB-115 | `VoucherRedemption` + `booking.service.ts:135-144` | No DB-level constraint for one-per-user (TOCTOU race on concurrent CONFIRMED bookings) | Add partial unique index via generated column |
| V4-DB-005 | Both | `schema.prisma:410` Payment.transactionRef | No `@@index` or `@unique` — full scan on VNPay reconciliation + duplicate transactionRef possible | `transactionRef String? @unique` + `@@index([transactionRef])` |

---

## 6. P3 — Minor (backlog)

> **35 P3** — code quality, a11y, DRY violations. Fix khi rảnh.

### Backend P3 (12 issues)

| ID | Source | File | Vấn đề |
|---|---|---|---|
| V4-BE-027 | Claude R3-BE-011 | `common/guards/roles.guard.ts` | `RolesGuard` vs `AuthorizationGuard` duplicate — 3 cách check ADMIN khác nhau |
| V4-BE-028 | Claude R3-BE-012 | `common/utils/crypto.service.ts` | `CryptoService` (AES-256-CBC) dead code — không ai import, kém an toàn hơn `encryption.util.ts` (GCM) |
| V4-BE-029 | Claude R3-BE-013 | `app.module.ts:49` | `APP_SECRET: Joi.string().optional().default('app-secret-default')` — secret có default công khai |
| V4-BE-030 | Claude R3-BE-015 | `admin.controller.ts:40-70` | `getBookings` no `limit` cap (unlike `getAuditLogs` has `Math.min(limit, 200)`) |
| V4-BE-031 | Claude R3-BE-016 | `prisma.service.ts:111-125` | Extension đăng ký decrypt cho `flight`, `tour`, `booking` dù không có field mã hoá — overhead |
| V4-BE-032 | Z.ai R3-BE-023 | `booking.service.ts:246-255` | `canTransition` hardcoded state-transition map (OCP violation) |
| V4-BE-033 | Z.ai R3-BE-024 | `booking.service.ts:1-341` | `BookingService` God Service (341 LOC, 7 responsibilities) |
| V4-BE-034 | Z.ai R3-BE-025 | `jwt.strategy.ts:30-35` | `JwtStrategy.validate` blacklist check on every request (latency) + no null check on auth header |
| V4-BE-035 | Z.ai R3-BE-020 | `payment.service.spec.ts:36-38` | Mock `ConfigService.get` returns 'secret' for all keys — tests pass but don't reflect reality |
| V4-BE-036 | Z.ai R3-BE-021 | `auth.service.spec.ts:254-262` | Test data uses `password` not `passwordHash` field name |
| V4-BE-037 | Z.ai R3-BE-026 | `encryption.util.ts:26-34` | Backward-compat parsing brittle (no v2 detection, no migration script) |
| V4-BE-038 | Z.ai R3-BE-030 | `audit-log.interceptor.ts:20` | Only logs ADMIN mutations, ignores STAFF |

### Frontend P3 (12 issues)

| ID | Source | File | Vấn đề |
|---|---|---|---|
| V4-FE-015 | Z.ai R3-FE-011 | 8 booking views | `setStep(N)` magic numbers (1-8) across 8 files — extract `BookingStep` enum |
| V4-FE-016 | Z.ai R3-FE-014 | `common/EmptyState` vs `ui/EmptyState` | Two EmptyState + three ErrorState coexist (DRY explosion) |
| V4-FE-017 | Z.ai R3-FE-015 | `mocks/destinations.ts` + `mocks/data/destinations.mock.ts` | Two destination mock files with inconsistent data |
| V4-FE-018 | Z.ai R3-FE-016 | `app/api/faqs/route.ts:3-19` | BFF duplicates `mocks/data/faq.mock.ts` with different content (3 items vs 5 items) |
| V4-FE-019 | Z.ai R3-FE-017 | `VerifyOTP.tsx:42` | Passes OTP via URL query string — OTP leaks in browser history, server logs, Referer |
| V4-FE-020 | Z.ai R3-FE-018 | `app/admin/layout.tsx:1` + `app/user/layout.tsx:1` | Still `'use client'` — defeats SSR/metadata |
| V4-FE-021 | Z.ai R3-FE-019 | `Header.tsx:1-309` | Still 309 LOC with 11 responsibilities (SRP violation) — split further |
| V4-FE-022 | Z.ai R3-FE-020 | `Button.tsx:4-14` | `as`/`to`/`href` props broken with `Link` (Liskov violation) |
| V4-FE-023 | Z.ai R3-FE-021 | 9 dynamic route views | `params?.id as string` unsafe cast bypasses `noUncheckedIndexedAccess` |
| V4-FE-024 | Z.ai R3-FE-022 | `useTourDetailQuery.ts:5` | Calls `/tour/:id` (singular) but `useToursQuery` calls `/tours` (plural) — inconsistent |
| V4-FE-025 | Z.ai R3-FE-023 | `Skeleton.tsx:88-93` | Injects `<style>` via DOM mutation at module load |
| V4-FE-026 | Z.ai R3-FE-024 | `ForgotPassword.tsx:17` | Still hardcodes `http://localhost:3000/api` (R2-FE-011 partial) |

### Database P3 (8 issues)

| ID | Source | File | Vấn đề |
|---|---|---|---|
| V4-DB-006 | Z.ai R3-DB-068 | `schema.prisma:335,336,469` | PascalCase relation field names (`VoucherRedemption`, `PointTransaction`) violate camelCase convention |
| V4-DB-007 | Z.ai R3-DB-099 | `seed.ts:247` | Creates 5 LOCKED users with no `USER_ACCOUNT_LOCKED` activity log → auto-unlock broken forever |
| V4-DB-008 | Z.ai R3-DB-103 | `seed.ts:514-522` | BookingStatusHistory with invalid transitions (`DRAFT → CONFIRMED`) violates state machine |
| V4-DB-009 | Z.ai R3-DB-119 | `audit-log.interceptor.ts:27-28` | AuditLog stores HTTP method as action + URL as targetType — index `@@index([targetType, targetId])` wasted |
| V4-DB-010 | Z.ai R3-DB-004 | `FlightSeat` | Missing `@@unique([flightId, seatCode])` — duplicate seat codes possible |
| V4-DB-011 | Z.ai R3-DB-007 | `RefreshToken.tokenHint` | `@@index([tokenHint])` not `@unique` — still `findMany` + bcrypt loop (should be O(1) `findUnique`) |
| V4-DB-012 | Z.ai R3-DB-010 | `Tour.title`, `BlogPost.title/content` | No FULLTEXT index — `contains` search = full table scan |
| V4-DB-013 | Z.ai R3-DB-076 | 28 of 42 models | Missing `createdAt`/`updatedAt` — audit impossible for 67% of tables |

### DevOps P3 (3 issues)

| ID | Source | File | Vấn đề |
|---|---|---|---|
| V4-DEV-001 | Claude R3-BE-017 | (missing) | No `.github/workflows/*` — no CI pipeline (lint/test/build on PR) |
| V4-DEV-002 | Z.ai R3-BE-096 | `main.ts` | No `app.enableShutdownHooks()` — BullMQ/Prisma/Redis not gracefully closed on SIGTERM |
| V4-DEV-003 | Z.ai R3-BE-098 | `docker-compose.yml` | Weak MySQL password (`root`), Redis no password, no healthchecks, no network isolation |

---

## 7. Cross-cutting Concerns

### 7.1 Showstopper Issues (must fix trước production)

| # | ID | Issue | Verification |
|---|---|---|---|
| 1 | V4-BE-001 | User bypass payment → free booking + points | `curl -X PATCH /api/bookings/:id/status -d '{"status":"CONFIRMED"}'` với user token |
| 2 | V4-BE-002 | Double-encrypt passportNo → booking unreadable | Tạo booking với passenger có passportNo → `GET /api/bookings/:id` returns 500 |
| 3 | V4-BE-003 | Decimal `<` comparison → voucher áp sai minOrderAmount | Tạo booking 900,000 VND + voucher minOrder 1,000,000 → voucher vẫn apply được |
| 4 | V4-INT-001 | Booking flow FE không gọi BE | `grep -rln "bookingApi\." frontend/src` → 0 results |
| 5 | V4-INT-002 | Refresh broken → auto-logout 15min | Login → đợi 15min → user bị văng ra |
| 6 | V4-BE-007 | JwtStrategy leak passwordHash+PII | `console.log(user)` trong bất kỳ controller → thấy passwordHash |
| 7 | V4-BE-009 | RBAC cache dead code | Revoke permission STAFF → user vẫn dùng được 5 phút |
| 8 | V4-FE-001 | `/admin/login` unreachable | Visit `/admin/login` → redirect to `/login` |
| 9 | V4-FE-005 | Double Header/Footer | Visit `/booking/seat` → thấy 2 Header + 2 Footer |
| 10 | V4-FE-006 | `next build` fails | `cd frontend && npm run build` → error "useSearchParams should be wrapped in suspense" |
| 11 | V4-FE-003 | JWT signature not verified | Craft cookie `xxx.<base64({"role":"ADMIN"})>.yyy` → vào được `/admin/*` |
| 12 | V4-FE-009 | `/api/admin/dashboard` no auth | `curl /api/admin/dashboard` anonymous → trả KPIs |

### 7.2 Type Drift FE vs BE (still present)

| Field | FE type | BE type |
|---|---|---|
| `User.role` | `'User' \| 'Admin' \| 'Staff'` (capitalized) | enum `USER \| STAFF \| ADMIN` (uppercase) |
| `Tour.price` | `number` | `Decimal` (serialized as string) |
| `Booking.status` | `'Pending' \| 'Confirmed' \| ...` (PascalCase) | enum `DRAFT \| PENDING_PAYMENT \| ...` (uppercase) |
| `FareClass` | `'Economy' \| 'Premium Economy' \| ...` | enum `ECONOMY \| PREMIUM_ECONOMY \| BUSINESS` |

### 7.3 PII Encryption Strategy — partially working

```
Write path (User.nationalId): ✓ WORKING
  prisma.user.create → $extends encrypt → DB stores ciphertext

Write path (BookingPassenger.passportNo): ✗ BROKEN (V4-BE-002)
  booking.service.ts:328 manual encrypt + $extends encrypt = double-encrypted

Read path: ✓ WORKING (for single-level)
  prisma.user.findUnique → $extends decryptRecord → returns plaintext

Read path (nested > 1 level): ✗ BROKEN (V4-BE-018)
  prisma.payment.findUnique({include:{booking:{include:{user:true}}}})
  → decryptRecord only checks record.passengers + record.user (1 level)
  → booking.user.nationalId NOT decrypted

Lookup path (WHERE clause): ✗ BROKEN (V4-DB-003)
  prisma.user.findUnique({where:{nationalId:'123'}})
  → $extends doesn't transform WHERE
  → DB has ciphertext, query returns null
```

### 7.4 Authentication flow still broken end-to-end

```
FE Login → BE /auth/login → returns {access_token, refresh_token, user}
  → FE chỉ lưu access_token (refresh_token bị bỏ qua) ← V4-FE-001
  → setAuthCookie(access_token) via document.cookie (không HttpOnly) ← V4-FE-002

After 15min (access_token expires):
  → API call returns 401
  → lib/api.ts 401-retry calls /auth/refresh với body rỗng ← V4-FE-001
  → BE requires refresh_token field → returns 400
  → catch block → logout() → user văng ra

Middleware (Edge):
  → reads cookie, decode base64 payload KHÔNG verify signature ← V4-FE-003
  → cookie giả role:ADMIN → bypass redirect-guard (API vẫn chặn)
```

### 7.5 Booking flow still broken end-to-end

```
FE booking flow (9 step): passenger → fare-class → seat → ... → payment → success → ticket

BE booking flow (real, nhưng FE không gọi):
  POST /api/booking (create draft)
  → PATCH /:id/seats (selectSeatForPassenger — links passenger ✓)
  → PUT /:id/passengers (updatePassengers — tx ✓, but double-encrypt V4-BE-002)
  → PATCH /:id/voucher (applyVoucher — Decimal bug V4-BE-003)
  → POST /api/payments/:bookingId/initiate (TOCTOU V4-BE-005)
  → VNPay callback (success: state machine ✓; failure: no seat release V4-BE-006)
  → PATCH /:id/status (USER CAN BYPASS TO CONFIRMED V4-BE-001)

Gaps:
  - FE không gọi BE API (V4-INT-001) — bookingApi dead code
  - FE giá tiền hard-code
  - FE BookingSuccess navigate hardcoded 'NEWPNR'/'VN8A2B'
  - BE double-encrypt passportNo → booking unreadable
  - BE user bypass payment → free booking
  - BE Decimal bug → voucher áp sai
  - BE failed payment → seats LOCKED forever
  - BE SeatStatus.BOOKED never set → không phân biệt ghế đã bán vs đang giữ
```

---

## 8. Roadmap Fix (4 Phase)

### Phase 0 — Showstopper Hotfix (must do ngay, ~20h)

> **Mục tiêu:** Chặn tài chính/bảo mật + app boot + build pass

| # | ID | Task | Effort | Verification |
|---|---|---|---|---|
| 1 | V4-BE-001 | Lock user-facing booking status transitions to CANCELLED only | 2h | `curl PATCH /api/bookings/:id/status -d '{"status":"CONFIRMED"}'` → 403 |
| 2 | V4-BE-002 | Remove manual `encrypt()` in `booking.service.ts:328` + data migration | 3h | Tạo booking với passport → `GET /api/bookings/:id` returns 200 với plaintext passport |
| 3 | V4-BE-003 | Fix Decimal comparison: `<` → `.lessThan()` | 0.5h | Booking 900K + voucher minOrder 1M → voucher bị reject |
| 4 | V4-BE-007 | JwtStrategy `select` fields | 1h | `console.log(user)` không có passwordHash |
| 5 | V4-BE-009 | Shared `rolePermissionsCacheKey` constant | 1h | Revoke permission → immediate effect |
| 6 | V4-FE-001 | Store refresh_token + fix 401-retry persist new token | 3h | Login → đợi 15min → vẫn logged in |
| 7 | V4-FE-004 | `/admin/login` exclusion in AdminLayout | 1h | Visit `/admin/login` → form renders |
| 8 | V4-FE-005 | BookingLayout → segment layout, delete component | 2h | Visit `/booking/seat` → 1 Header + 1 Footer |
| 9 | V4-FE-006 | Add Suspense to 5 routes | 1h | `next build` pass |
| 10 | V4-FE-007 | Import `lib/routes.ts` in 7 call sites | 1h | `grep -rln "lib/routes" frontend/src` → 7 results |
| 11 | V4-FE-008 | Open redirect validation | 0.5h | `?redirect=https://evil.com` → redirect to `/` |
| 12 | V4-FE-009 | `/api/admin/dashboard` auth + BE proxy | 1h | `curl /api/admin/dashboard` anonymous → 401 |
| 13 | V4-FE-003 | Middleware verify JWT with `jose` | 2h | Craft fake JWT → middleware reject |

**Verification commands:**
```bash
cd backend && npm run start:dev    # MUST: no error, "Nest application successfully started"
cd frontend && npm run build       # MUST: no Suspense error
cd backend && npm test             # MUST: all specs pass
```

### Phase 1 — Critical Functional (~30h)

> **Mục tiêu:** App chạy đúng end-to-end

| # | ID | Task | Effort |
|---|---|---|---|
| 14 | V4-INT-001 | Wire bookingFlowStore với bookingApi (sửa path/verb trước) | 16h |
| 15 | V4-BE-004 | Thêm transition `LOCKED → BOOKED` khi CONFIRMED | 2h |
| 16 | V4-BE-005 | initiatePayment conditional `updateMany where status='PENDING'` | 2h |
| 17 | V4-BE-006 | Failed payment release seats via `updateBookingStatusWithTx` | 2h |
| 18 | V4-BE-008 | UserService.updateProfile `select` fields | 1h |
| 19 | V4-FE-002 | HttpOnly cookie set từ BE (xóa `lib/auth.ts`) | 4h |
| 20 | V4-BE-014 | PrismaService composition over inheritance | 3h |

### Phase 2 — Defense-in-Depth (~40h)

> **Mục tiêu:** Củng cố bảo mật + data integrity

| # | ID | Task | Effort |
|---|---|---|---|
| 21 | V4-BE-010 | VNPay callback amount-check | 1h |
| 22 | V4-BE-011 | Login throttle riêng (10 req/min) | 1h |
| 23 | V4-BE-012 | Swagger disable ở prod + remove credentials | 1h |
| 24 | V4-BE-013 | Hash UserSession.sessionToken | 2h |
| 25 | V4-BE-015 | booking-expiry seat release `where status='LOCKED'` | 1h |
| 26 | V4-BE-016 | initiatePayment use `updateBookingStatusWithTx` | 2h |
| 27 | V4-BE-017 | Login auto-unlock distinguish AUTO vs ADMIN | 3h |
| 28 | V4-BE-018 | Deep recursive decrypt (5 levels) | 2h |
| 29 | V4-BE-019 | Move verifyOwnership to BookingService | 2h |
| 30 | V4-BE-020 | Admin updateBookingStatus reuse service method | 1h |
| 31 | V4-BE-021 | ReviewVote table (replace ActivityLog abuse) | 3h |
| 32 | V4-BE-022 | Remove duplicate GlobalExceptionFilter | 0.5h |
| 33 | V4-BE-023 | requestRefund ForbiddenException | 0.5h |
| 34 | V4-BE-024 | ParseBigIntPipe for all `:id` params | 2h |
| 35 | V4-BE-025 | vnpayCallback DTO + IP whitelist | 2h |
| 36 | V4-BE-026 | Upload gallery disk storage | 2h |
| 37 | V4-DB-001 | Add 18 missing CHECK constraints migration | 2h |
| 38 | V4-DB-002 | Add 4 child table indexes migration | 1h |
| 39 | V4-DB-003 | Encryption WHERE clause transform | 3h |
| 40 | V4-DB-004 | VoucherRedemption partial unique index | 2h |
| 41 | V4-DB-005 | Payment.transactionRef `@unique` + `@@index` | 1h |
| 42 | V4-FE-010 | LoginModal trust BE role enum | 0.5h |
| 43 | V4-FE-011 | Delete ProtectedRoute dead code | 0.5h |
| 44 | V4-FE-012 | Wire Header to notificationStore | 2h |
| 45 | V4-FE-013 | Implement /api/auth/logout route OR remove fetch | 1h |

### Phase 3 — Code Quality Polish (~50h)

> **Mục tiêu:** Clean Code + SOLID + Design Patterns

- All P3 issues (35 items)
- TypeScript strictness (remove `any`)
- A11y (keyboard nav, focus trap)
- Performance (next/image, code splitting)
- Test coverage (E2E, integration)
- CI pipeline (GitHub Actions)
- Docker security (passwords, healthchecks)

### Total effort: ~140h (~4 weeks for 1 dev, ~1.5 weeks for 4 dev)

---

## 9. Verification Checklist

Trước khi báo cáo "fix done", verify tất cả:

### Phase 0 Verification

```bash
# 1. App boot
cd backend && npm run start:dev
# MUST: no error in 30s, "Nest application successfully started"

# 2. FE build
cd frontend && npm run build
# MUST: no "useSearchParams should be wrapped in suspense" error

# 3. Tests pass
cd backend && npm test
# MUST: all specs pass

# 4. Migration sync
cd backend && npx prisma migrate diff \
  --from-migrations ./prisma/migrations \
  --to-schema-datamodel ./prisma/schema.prisma \
  --shadow-database-url $SHADOW_DB_URL
# MUST: empty diff

# 5. V4-BE-001: bypass payment blocked
curl -X PATCH http://localhost:3000/api/bookings/1/status \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED"}'
# MUST: 403 Forbidden

# 6. V4-BE-002: double-encrypt fixed
# Tạo booking với passenger có passportNo → query DB:
mysql -e "SELECT passportNo FROM BookingPassenger ORDER BY id DESC LIMIT 1"
# MUST: passportNo starts with single 'enc:v1:' not 'enc:v1:...enc:v1:'

# 7. V4-BE-003: Decimal comparison fixed
# Tạo booking 900,000 VND + voucher minOrder 1,000,000 → apply voucher
# MUST: 400 "Đơn hàng phải từ 1000000 để áp dụng mã này"

# 8. V4-BE-007: JwtStrategy no PII leak
# Trong bất kỳ controller: console.log(user)
# MUST: no passwordHash, no nationalId, no passportNo

# 9. V4-BE-009: RBAC cache invalidation works
# Revoke permission STAFF → user vẫn có quyền? 
# MUST: immediate effect (no 5-min lag)

# 10. V4-FE-001: refresh works
# Login → đợi 15min (or set JWT_ACCESS_EXPIRATION=1m for test)
# MUST: vẫn logged in, không bị logout

# 11. V4-FE-004: /admin/login reachable
curl http://localhost:3000/admin/login
# MUST: HTML contains AdminLogin form

# 12. V4-FE-005: no double Header
curl http://localhost:3000/booking/seat | grep -c "<header"
# MUST: 1 (not 2)

# 13. V4-FE-006: build passes
cd frontend && npm run build
# MUST: ✓ Compiled successfully

# 14. V4-FE-003: JWT signature verified
# Craft fake JWT: xxx.<base64({"role":"ADMIN","exp":9999999999})>.yyy
# Set cookie: document.cookie = "token=<fake_jwt>"
# Visit /admin/dashboard
# MUST: redirect to /admin/login (not render admin page)

# 15. V4-FE-009: /api/admin/dashboard auth
curl http://localhost:3000/api/admin/dashboard
# MUST: 401 Unauthorized
```

---

## 10. Thống kê tổng

### Theo Priority

| Priority | Count | Layer | Effort ước tính |
|---|---|---|---|
| **P0 — Blocker** | 4 | BE (3), INT (1) | ~20h (Phase 0) |
| **P1 — Critical** | 15 | FE (9), BE (6) | ~30h (Phase 1) |
| **P2 — Major** | 27 | FE (5), BE (17), DB (5) | ~40h (Phase 2) |
| **P3 — Minor** | 35 | FE (12), BE (12), DB (8), DevOps (3) | ~50h (Phase 3) |
| **P4 — Info** | 15 | All | (không fix) |
| **Total** | **96** | — | **~140h** |

### Theo Layer

| Layer | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| Frontend (FE) | 0 | 9 | 5 | 12 | 26 |
| Backend (BE) | 3 | 6 | 17 | 12 | 38 |
| Database (DB) | 0 | 0 | 5 | 8 | 13 |
| Integration (INT) | 1 | 0 | 0 | 0 | 1 |
| DevOps | 0 | 0 | 0 | 3 | 3 |
| **Total** | **4** | **15** | **27** | **35** | **81** (+15 Info = 96) |

### Theo Source

| Source | Count | Note |
|---|---|---|
| **Both** (Z.ai + Claude cùng phát hiện) | 18 | High confidence |
| **Z.ai only** | 58 | Exhaustive coverage |
| **Claude only** | 20 | Deep business logic + integration gap |
| **Total** | **96** | |

### So sánh các Round

| Metric | R1 | R2 | R3 (Z.ai) | R3 (Claude) | **V4 (kết hợp)** |
|---|---|---|---|---|---|
| Tổng findings | 507 | 330 | 289 | ~24 | **96 (deduplicated)** |
| Critical (P0+P1) | 45 | 24 | 25 | 13 | **19** |
| File reviewed | 315 | 321 | 329 | 321 | **329** |
| LOC | ~20.7K | ~22.2K | ~22.5K | ~22.5K | **~22.5K** |

---

## 11. Phụ lục — Lệnh kiểm chứng

### Lệnh verify P0

```bash
# V4-BE-001: Xác nhận endpoint user có thể tự CONFIRMED booking
# (cần user token + booking ID ở trạng thái PENDING_PAYMENT)
curl -X PATCH http://localhost:3000/api/bookings/<booking_id>/status \
  -H "Authorization: Bearer <user_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED"}'
# BEFORE fix: 200 OK (booking confirmed free)
# AFTER fix: 403 Forbidden

# V4-BE-002: Xác nhận double-encryption
mysql -e "SELECT passportNo FROM BookingPassenger WHERE passportNo LIKE 'enc:v1:%enc:v1:%' LIMIT 5"
# BEFORE fix: returns rows
# AFTER fix: returns 0 rows

# V4-BE-003: Tái hiện bug Decimal comparison (chạy thật bằng decimal.js)
node -e "
const Decimal = require('decimal.js');
const total = new Decimal('900000');
const minOrder = new Decimal('1000000');
console.log('900000 < 1000000 theo Decimal object:', total < minOrder); // false — SAI
console.log('900000 < 1000000 theo number thường:', 900000 < 1000000);   // true — ĐÚNG
"
# BEFORE fix: false (bug)
# AFTER fix: dùng .lessThan() → true (correct)

# V4-INT-001: Xác nhận bookingApi không được gọi ở đâu trong FE
grep -rln "bookingApi\." frontend/src --include=*.ts --include=*.tsx
# BEFORE fix: 0 kết quả
# AFTER fix: 9+ kết quả (các booking views)

# V4-BE-004: Xác nhận SeatStatus.BOOKED không bao giờ được gán
grep -rn "'BOOKED'" backend/src --include=*.ts
# BEFORE fix: 0 kết quả (ngoài enum)
# AFTER fix: 1+ kết quả (trong updateBookingStatusWithTx khi CONFIRMED)

# V4-BE-009: Xác nhận mismatch cache key RBAC
grep -n "cacheKey" backend/src/common/guards/authorization.guard.ts
# → const cacheKey = `role_permissions_${role}`;
grep -n "cacheManager.del" backend/src/modules/rbac/rbac.controller.ts
# → await this.cacheManager.del(`rbac_permissions_${dto.role}`);
# BEFORE fix: 2 tiền tố khác nhau
# AFTER fix: cùng dùng rolePermissionsCacheKey(role)

# V4-FE-001: Xác nhận refresh_token bị bỏ qua ở cả 3 nơi đăng nhập
grep -rn "data.refresh_token\|refresh_token" frontend/src/views/public/auth/Login.tsx \
  frontend/src/components/auth/LoginModal.tsx frontend/src/views/admin/AdminLogin.tsx
# BEFORE fix: 0 kết quả (chỉ có access_token được dùng)
# AFTER fix: 3+ kết quả (lưu refresh_token)

# V4-BE-007: Xác nhận JwtStrategy return entire user
grep -A5 "async validate" backend/src/modules/auth/strategies/jwt.strategy.ts | grep "return user"
# BEFORE fix: `return user;` (entire row)
# AFTER fix: có `select: { id: true, email: true, ... }` không có passwordHash

# V4-BE-012: Xác nhận Swagger lộ credentials
grep -A3 "setDescription" backend/src/main.ts | grep -i "Admin@123\|User@123"
# BEFORE fix: returns match
# AFTER fix: no match (removed credentials)

# V4-BE-028: Xác nhận CryptoService là dead code
grep -rln "CryptoService\|cryptoService" backend/src --include=*.ts | grep -v spec
# → chỉ có định nghĩa class, không có nơi import/inject
```

### Lệnh verify Phase 0 hoàn thành

```bash
# 1. Backend boot
cd backend && timeout 30 npm run start:dev 2>&1 | grep -i "Nest application successfully started"
# MUST: match found

# 2. Frontend build
cd frontend && npm run build 2>&1 | grep -i "error\|failed"
# MUST: no match

# 3. Backend tests
cd backend && npm test 2>&1 | tail -5
# MUST: all specs pass

# 4. Migration sync
cd backend && npx prisma migrate diff \
  --from-migrations ./prisma/migrations \
  --to-schema-datamodel ./prisma/schema.prisma \
  --shadow-database-url "mysql://root:root@localhost:3306/shadow" 2>&1
# MUST: empty diff or "No changes detected"
```

---

## Kết luận

Báo cáo V4 này **kết hợp sức mạnh của 2 nguồn review** (Z.ai exhaustive + Claude evidence-based) thành một báo cáo chuẩn duy nhất để team fix:

### Điểm nổi bật

1. **96 unique findings** (sau deduplicate) — thay vì 289 + 24 = 313 findings trùng lặp
2. **Priority-sorted P0→P4** — team biết chính xác fix gì trước
3. **Fix code concrete** cho mọi P0 và P1 — copy-paste ready
4. **Verification commands** cho mỗi P0 — team có thể tự kiểm chứng fix đúng
5. **4-Phase Roadmap** với effort estimate — team có thể plan sprint

### Top 4 P0 phải fix NGAY LẬP TỨC

1. **V4-BE-001** — User bypass payment → free booking + points (lỗ hổng tài chính)
2. **V4-BE-002** — Double-encrypt passportNo → booking unreadable (data corruption)
3. **V4-BE-003** — Decimal `<` comparison → voucher áp sai minOrderAmount (thất thoát doanh thu, verify bằng `node -e`)
4. **V4-INT-001** — Booking flow FE không gọi BE API (chức năng lõi không chạy)

### Top 5 P1 phải fix trong sprint hiện tại

1. **V4-FE-001** — Refresh broken → auto-logout mỗi 15 phút
2. **V4-BE-007** — JwtStrategy leak passwordHash + PII trên mọi request
3. **V4-BE-009** — RBAC cache invalidation dead code
4. **V4-FE-004** — `/admin/login` unreachable
5. **V4-FE-006** — `next build` fails (5 routes missing Suspense)

### Giá trị của việc kết hợp 2 nguồn

- **Claude phát hiện 5 bugs mà Z.ai bị thiếu**: Decimal comparison, SeatStatus.BOOKED never set, VNPay amount-check, Login throttle, Swagger leak
- **Z.ai phát hiện 4 bugs mà Claude bị thiếu**: JwtStrategy leak, Encryption WHERE clause, CHECK constraints 1/15+, Missing child table indexes
- **18 findings cả 2 cùng phát hiện** — high confidence, confirmed by 2 reviewers

### Khuyến nghị

1. **Phase 0 (~20h)** — Fix 4 P0 + 8 P1 showstoppers → app boot + build pass
2. **Phase 1 (~30h)** — Fix 7 P1 còn lại + wire booking flow → app chạy end-to-end
3. **Phase 2 (~40h)** — Fix 27 P2 → defense-in-depth + data integrity
4. **Phase 3 (~50h)** — Fix 35 P3 → code quality + a11y + CI

**Total: ~140h** (~4 tuần 1 dev, ~1.5 tuần 4 dev)

---

**Báo cáo hoàn thành. V4 consolidated — review-only, không fix.**

> **Repo:** https://github.com/tvthien-ktmt/Trip_Planer
> **Commit:** `2e65f0d`
> **Report file:** `/home/z/my-project/download/Trip_Planer/REVIEW_REPORT_V4.md`
> **Sources:** Z.ai R3 (289 findings) + Claude R3 (~24 findings) → deduplicated to 96 unique
> **Next:** Team fix theo Phase 0 → 1 → 2 → 3, verify bằng commands ở §9 sau mỗi phase.
