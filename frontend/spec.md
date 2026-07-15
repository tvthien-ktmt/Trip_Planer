<USER_REQUEST>
# TÀI LIỆU ĐẶC TẢ DỰ ÁN — Trip Planer OTA (Quy mô ~50 trang)

> Dùng tài liệu này làm prompt/spec đưa cho AI coding agent (Gemini/Antigravity/GLM) để triển khai. Tài liệu chia theo **Phase** để agent làm dần, tránh tình trạng báo cáo "hoàn thành" ảo khi ôm quá nhiều việc cùng lúc.

---

## 0. TỔNG QUAN & PHẠM VI

- **Loại dự án:** Web đặt vé máy bay + du lịch (OTA), lấy cảm hứng luồng nghiệp vụ từ Vietnam Airlines, kết hợp thêm phần Tour/Trip Planner đã có.
- **Quy mô:** ~50 trang, chia 3 khối: **Public (16)**, **User/Authenticated (12)**, **Admin (18)**, + Error pages (4) + Reusable components.
- **Mục tiêu:** Đủ độ phức tạp để đưa vào CV/phỏng vấn — thể hiện kiến trúc rõ ràng, phân quyền, luồng nghiệp vụ đầy đủ (search → book → pay → manage), không cần làm y hệt 100+ trang của hệ thống thật.
- **Tech stack (giữ nguyên, không đổi):** React 18 + TypeScript + Vite + Zustand + React Query (TanStack Query) + React Router.
- **Backend:** Dùng mock data (TypeScript, có type) cho Phase 1–3. Nếu sau này nối Spring Boot thật (theo mô hình VietJourney), chỉ cần thay lớp gọi API trong React Query hooks — không đổi UI.
- **Dữ liệu:** Text mô tả dùng lorem ipsum; tên sân bay/thành phố/hãng bay/giá vé dùng dữ liệu thực tế hợp lý (SGN, HAN, DAD, Vietnam Airlines/Vietjet/Bamboo kiểu tên giả định, hoặc dùng tên hãng bay hư cấu để tránh liên quan thương hiệu thật nếu cần).

---

## 1. NGUYÊN TẮC TRIỂN KHAI THEO PHASE

**Không giao cả 50 trang trong 1 lần cho AI agent.** Thực hiện theo thứ tự Phase dưới đây, mỗi Phase xong phải verify độc lập trước khi sang Phase tiếp theo.

| Phase | Nội dung | Số trang |
|---|---|---|
| Phase 1 | Kiến trúc nền tảng + Public core (Home, Auth, Search/Result/Detail) | ~10 trang + hạ tầng |
| Phase 2 | Luồng đặt vé hoàn chỉnh (Booking flow) | ~10 trang |
| Phase 3 | User Dashboard (cần đăng nhập) | ~12 trang |
| Phase 4 | Nội dung tĩnh + hỗ trợ (Blog, FAQ, Contact, Legal...) | ~10 trang |
| Phase 5 | Admin Panel | ~18 trang |
| Phase 6 | Error pages + polish (responsive, a11y, loading/error states toàn cục) | 4 trang + QA |

---

## 2. KIẾN TRÚC THƯ MỤC ĐỀ XUẤT (quy mô 50 trang cần tổ chức lại, không để phẳng trong `pages/`)

```
src/
  pages/
    public/
    booking/
    user/
    admin/
    errors/
  features/              # logic theo domain, mỗi feature tự chứa component con + hooks + store riêng nếu cần
    flight-search/
    booking/
    auth/
    user-profile/
    admin-flight/
    admin-user/
    ...
  components/
    common/               # Button, Modal, Toast, Skeleton, EmptyState...
    layout/               # Header, Footer, Sidebar, AdminLayout, Breadcrumb
    form/                 # TextField, PasswordField, PhoneInput, CountrySelect, AirportAutocomplete
    charts/               # LineChart, BarChart, PieChart, AreaChart (dùng cho Admin Report/Analytics)
  hooks/
    queries/              # React Query hooks, 1 file/domain
    mutations/
  stores/                 # Zustand stores, 1 file/domain
  types/                  # TypeScript interfaces, 1 file/domain
  mocks/
    data/
    handlers/             # nếu dùng MSW (Mock Service Worker) để giả lập API thật hơn — khuyến nghị dùng MSW thay vì mock trực tiếp trong hook, để dễ chuyển sang API thật sau này
  routes/
    PublicRoute.tsx
    PrivateRoute.tsx        # redirect /login nếu chưa auth
    AdminRoute.tsx          # redirect 403 nếu không phải role admin
    routes.config.tsx       # khai báo toàn bộ route tập trung 1 chỗ, dễ maintain khi có 50 trang
```

**Lưu ý bắt buộc:** Với quy mô 50 trang, **không khai báo route rải rác trong `App.tsx`**. Phải tách `routes.config.tsx` dùng `useRoutes()` hoặc mảng route object, nhóm theo Public/Private/Admin, để dễ maintain và để agent không bị lẫn lộn khi thêm trang mới.

---

## 3. ZUSTAND STORES CẦN CÓ (mở rộng so với bản Trip Planer cũ)

- `useAuthStore` — user, role (`user` | `admin`), token, isAuthenticated, login/logout actions
- `useSearchFlightStore` — điểm đi/đến, ngày đi/về, số hành khách (người lớn/trẻ em/em bé), hạng vé, loại chuyến (1 chiều/khứ hồi)
- `useBookingFlowStore` — state xuyên suốt luồng đặt vé nhiều bước: chuyến bay đã chọn → hạng vé → ghế → hành lý → suất ăn → dịch vụ thêm → thông tin hành khách → tổng tiền (đây là store quan trọng nhất, dùng wizard pattern nhiều bước)
- `useWishlistStore`
- `useUIStore` — theme, ngôn ngữ, tiền tệ, toast queue, modal state toàn cục
- `useNotificationStore` — danh sách thông báo trong app (khác với toast — đây là notification center)
- `useAdminUIStore` — sidebar collapse, admin filter state (tách riêng để không phình `useUIStore`)

---

## 4. ĐẶC TẢ CHI TIẾT THEO PHASE

### PHASE 1 — Nền tảng + Public Core

**1.1 Trang chủ (`/`)**
- Hero với thanh tìm chuyến bay: chọn Điểm đi/Điểm đến (Airport Autocomplete component — gõ mã sân bay hoặc tên thành phố), Date Picker (1 chiều/khứ hồi), chọn số hành khách + hạng vé (dropdown dạng popover)
- Section khuyến mãi, điểm đến nổi bật, tin tức/blog preview (tái dùng từ bản Trip Planer cũ)

**1.2 Đăng nhập / Đăng ký / Quên mật khẩu / Đặt lại mật khẩu / Xác minh Email / Xác minh OTP**
- Đây là **luồng 6 trang liên tiếp**, cần thiết kế state xuyên suốt (VD: sau khi "Quên mật khẩu" nhập email → chuyển "Xác minh OTP" → verify xong mới cho vào "Đặt lại mật khẩu")
- OTP input: 6 ô số riêng biệt, tự động nhảy ô, có nút gửi lại mã (countdown 60s)
- Email verification: trang dạng "Vui lòng kiểm tra email", giả lập nút "Tôi đã xác minh" để test luồng

**1.3 Search Flight (`/flights/search`)**
- Form tương tự Home nhưng full-page, có thêm: chọn hãng bay ưu tiên, giờ bay ưu tiên (sáng/chiều/tối)
- Nút "Tìm kiếm nâng cao" mở rộng thêm filter

**1.4 Flight Result (`/flights/results`)**
- Danh sách chuyến bay dạng card: giờ đi/đến, thời gian bay, số điểm dừng, hãng bay, giá theo từng hạng vé (hiện nhiều mức giá trên 1 card như UI thật của các hãng)
- **Sidebar filter**: giờ bay, hãng bay, số điểm dừng, khoảng giá (slider)
- Sort: giá thấp-cao, thời gian bay ngắn nhất, giờ khởi hành sớm nhất
- Nếu khứ hồi: hiện 2 cột chọn chuyến đi + chuyến về song song, hoặc luồng 2 bước tuần tự

**1.5 Flight Detail (`/flights/:id`)**
- Chi tiết chuyến bay: sơ đồ giờ bay, điểm dừng (nếu có), loại máy bay, hành lý bao gồm, chính sách đổi/hủy

**Yêu cầu Phase 1 xong:** routing hoạt động đầy đủ, auth flow test được (dù chưa có backend thật), search → result → detail chuyển trang mượt, dữ liệu tìm kiếm giữ nguyên qua `useSearchFlightStore`.

---

### PHASE 2 — Luồng đặt vé (Booking Flow — wizard nhiều bước)

Đây là phần **phức tạp nhất**, cần làm dạng step-wizard với progress bar hiển thị bước hiện tại (VD: Bước 2/8).

**2.1 Chọn hạng vé (`/booking/fare-class`)** — so sánh Economy/Premium Economy/Business, bảng tiện ích đi kèm mỗi hạng

**2.2 Chọn ghế (`/booking/seat-selection`)**
- **Sơ đồ ghế máy bay dạng SVG/grid** tương tác được: click chọn ghế, ghế đã bán (disabled), ghế trống, ghế đang chọn (highlight), phân biệt hạng ghế bằng màu
- Phí chọn ghế hiển thị theo từng loại ghế (cửa sổ, lối đi, hàng ghế trước)

**2.3 Chọn hành lý (`/booking/baggage`)** — dạng stepper số kg, tính phụ phí nếu vượt hạn mức miễn phí

**2.4 Chọn suất ăn (`/booking/meal`)** — card chọn món, ảnh món ăn, ghi chú ăn chay/dị ứng

**2.5 Dịch vụ bổ sung (`/booking/add-ons`)** — bảo hiểm chuyến bay, đưa đón sân bay, wifi trên máy bay, checkbox chọn nhiều

**2.6 Thông tin hành khách (`/booking/passenger-info`)** — form động theo số hành khách đã chọn ở bước search (họ tên, ngày sinh, quốc tịch, số hộ chiếu/CCCD), validate từng người

**2.7 Thanh toán (`/booking/payment`)** — tương tự Reservation cũ: chọn phương thức, nhập mã giảm giá, tóm tắt toàn bộ chi phí từ các bước trước cộng dồn

**2.8 Thanh toán thành công / thất bại (`/booking/payment-success`, `/booking/payment-failed`)**
- Thành công: hiện mã đặt chỗ (PNR code giả lập dạng 6 ký tự), nút tải vé, nút xem chi tiết booking
- Thất bại: lý do lỗi giả lập, nút thử lại / đổi phương thức thanh toán

**2.9 Booking Success (`/booking/success`)** — trang tổng kết đầy đủ, có thể gộp chung với payment-success nếu muốn giảm số trang thực tế

**2.10 Download Ticket (`/booking/ticket/:bookingId`)** — hiện vé dạng có thể in/tải PDF (dùng giả lập, có thể dùng thư viện tạo PDF phía client)

**Yêu cầu kỹ thuật quan trọng Phase 2:** Toàn bộ 8 bước phải **không cho nhảy bước** nếu bước trước chưa hoàn thành (validate ở route guard cấp booking flow, không chỉ validate UI). Dữ liệu phải giữ nguyên khi back/forward giữa các bước (dùng `useBookingFlowStore`, không dùng local state riêng từng trang).

---

### PHASE 3 — User Dashboard (yêu cầu đăng nhập, dùng `PrivateRoute`)

**3.1 Dashboard** — tổng quan: chuyến bay sắp tới, số điểm thành viên, thông báo mới, quick actions

**3.2 Profile / 3.3 Edit Profile** — xem/sửa thông tin cá nhân, avatar

**3.4 Change Password**

**3.5 Security** — bật/tắt xác thực 2 lớp (2FA) — UI only

**3.6 Login History** — bảng lịch sử đăng nhập: thời gian, thiết bị, IP (giả lập), địa điểm

**3.7 Device Management** — danh sách thiết bị đã đăng nhập, nút "Đăng xuất thiết bị này"

**3.8 Notification** — trung tâm thông báo, đánh dấu đã đọc, filter theo loại (khuyến mãi/hệ thống/booking)

**3.9 Booking History / 3.10 Booking Detail** — danh sách vé đã đặt (sắp tới/đã bay/đã hủy), click vào xem chi tiết đầy đủ như vé thật

**3.11 Manage Booking** — đổi ngày bay, đổi tên hành khách (có phí giả lập), yêu cầu hủy vé

**3.12 Refund** — theo dõi trạng thái hoàn tiền (đang xử lý/đã hoàn/từ chối), timeline trạng thái

**3.13 Voucher / 3.14 Coupon** — danh sách mã ưu đãi đang có, hạn dùng, điều kiện áp dụng

**3.15 Membership** — hạng thành viên (Bạc/Vàng/Kim Cương), quyền lợi từng hạng, thanh tiến trình lên hạng tiếp theo

**3.16 Miles** — lịch sử tích/dùng dặm bay, dạng bảng có filter theo tháng

**3.17 Wishlist** — tái dùng từ bản cũ

**3.18 Settings** — gộp: ngôn ngữ, tiền tệ, theme, thông báo (đỡ phải tách quá nhiều trang nếu muốn gọn số trang)

> Ghi chú: danh sách gốc liệt kê 21 trang cho User, có thể gộp bớt (VD Theme/Language/Currency gộp vào Settings) để về đúng khoảng 12 trang thực tế như đề xuất "đồ án cá nhân".

---

### PHASE 4 — Nội dung tĩnh & Hỗ trợ

Tái sử dụng tối đa từ bản Trip Planer cũ, bổ sung thêm:
- Giới thiệu (`/about`)
- Điều khoản (`/terms`), Chính sách bảo mật (`/privacy`), Chính sách Cookie (`/cookie-policy`) — nội dung dài dạng legal text, dùng lorem ipsum có cấu trúc heading rõ (điều 1, điều 2...)
- Tuyển dụng (`/careers`) — danh sách vị trí tuyển dụng giả lập, form ứng tuyển
- Flight Status (`/flight-status`) — tra cứu trạng thái chuyến bay theo số hiệu, hiện: đúng giờ/trễ/hủy, giờ dự kiến
- Check-in (`/check-in`) — form nhập mã đặt chỗ + họ tên → hiện boarding pass giả lập
- Boarding Pass (`/boarding-pass/:id`) — dạng thẻ lên máy bay có QR code (giả lập bằng thư viện QR client-side)
- Airport Information / Airport Map / Lounge — trang thông tin tĩnh, có thể dùng chung 1 layout template

---

### PHASE 5 — Admin Panel

**Kiến trúc riêng:** Admin dùng layout khác hẳn (`AdminLayout` với Sidebar cố định, không dùng Header/Footer của site public). Route bọc bởi `AdminRoute` kiểm tra `role === 'admin'`.

Nhóm trang theo module quản lý (mỗi module: List → Detail/Create/Edit theo pattern CRUD thống nhất):

| Module | Các trang con |
|---|---|
| Dashboard | Tổng quan số liệu (KPI cards + chart) |
| User Management | List, Detail, Create, Edit, Role Management, Permission Management |
| Flight Management | List, Create, Edit |
| Airport / Aircraft / Route Management | 3 trang list quản lý riêng, có thể dùng chung 1 Table component |
| Booking Management | List, Detail |
| Payment Management | List |
| Refund Management | List, xử lý duyệt/từ chối |
| Promotion / Coupon / Voucher Management | 3 module CRUD tương tự nhau |
| Blog Management | List, Create, Edit, Category Management, Tag Management |
| Media Library | Upload/quản lý ảnh dùng chung toàn hệ thống |
| Banner Management | Quản lý banner trang chủ |
| FAQ Management | CRUD FAQ |
| Contact Management | Danh sách liên hệ khách gửi, đánh dấu đã xử lý |
| Feedback Management | Danh sách feedback, phản hồi |
| Email/Notification Template | Soạn mẫu email/thông báo tự động (WYSIWYG editor giả lập) |
| Report / Analytics | Biểu đồ doanh thu, booking theo thời gian (dùng recharts hoặc chart.js) |
| Audit Log / Activity Log | Bảng log hành động admin, filter theo user/module/thời gian |
| System Setting | Cấu hình chung hệ thống (tên site, logo, thông tin liên hệ...) |

**Yêu cầu bắt buộc Admin:**
- Mọi bảng danh sách (Table) phải có: search, filter, sort cột, pagination, bulk action (xóa nhiều/export)
- Form Create/Edit dùng chung 1 component, chỉ khác initial values
- Có Confirm Dialog trước mọi hành động xóa/hủy
- Toast báo kết quả sau mọi action (thành công/thất bại)

---

### PHASE 6 — Error Pages & Polish

- `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Server Error`, `Maintenance` — mỗi trang có illustration/icon riêng, nút quay về Home
- Rà soát: mọi trang có Skeleton loading, mọi query có Error state với nút "Thử lại"
- Rà soát responsive toàn bộ 50 trang ở 3 breakpoint
- Rà soát accessibility cơ bản (alt text, label, focus trap trong modal)

---

## 5. REUSABLE COMPONENTS BẮT BUỘC DÙNG CHUNG (không tạo lại nhiều bản)

- **Auth:** LoginModal, RegisterModal, OTPModal, ConfirmDialog
- **Layout:** Header, Footer, Sidebar (admin), Navbar, Breadcrumb, Pagination
- **Data:** Table (generic, dùng chung cho toàn bộ Admin), SearchBox, FilterPanel, SortDropdown, DatePicker, TimePicker
- **Upload:** UploadImage, UploadFile, DragDropUpload, CropImage, ImagePreview
- **Notification:** Toast, Snackbar, Modal, LoadingOverlay, Skeleton, EmptyState
- **Form:** TextField, PasswordField, PhoneInput, CountrySelect, CurrencySelect, AirportAutocomplete (component đặc thù cho dự án này)
- **Charts:** LineChart, BarChart, PieChart, AreaChart (dùng recharts, đã có sẵn trong stack cho phép dùng ở artifact — kiểm tra đã cài trong dự án thật chưa)

---

## 6. YÊU CẦU OUTPUT TỪ AI AGENT (áp dụng cho MỖI PHASE, không phải cuối cùng mới báo cáo)

1. Trước khi code: liệt kê danh sách file sẽ tạo/sửa trong Phase đó để review trước
2. Code đầy đủ, không dùng `// TODO` hoặc "phần còn lại tương tự"
3. Sau khi xong Phase: agent phải tự liệt kê bảng dạng:

   | Trang/Chức năng | Trạng thái | Ghi chú |
   |---|---|---|
   | Search Flight | Hoàn thành | Có validate, có mock data |
   | Seat Selection | UI only | Chưa xử lý logic disable ghế đã bán |

4. **Không tự nhận "hoàn thành toàn bộ Phase"** nếu còn bất kỳ mục nào chỉ có UI chưa có logic — phải khai báo rõ như bảng trên để tự verify bằng checklist riêng trước khi merge/sang Phase kế tiếp.

/goal 
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-07-13T15:36:34+07:00.

The user's current state is as follows:
Active Document: d:\Trip_Planer\frontend\tsconfig.app.json (LANGUAGE_JSON)
Cursor is on line: 1
Other open documents:
- d:\Trip_Planer\frontend\tsconfig.app.json (LANGUAGE_JSON)
- d:\Trip_Planer\frontend\src\components\home\BookStepsSection.tsx (LANGUAGE_TSX)
- d:\Trip_Planer\frontend\src\lib\utils.ts (LANGUAGE_TYPESCRIPT)

The user has mentioned some items in the form @[ITEM]. Here is extra information about the items that were mentioned by the user, in the order that they appear:

/goal is a [Slash Command]:
The user has marked this task with /goal, indicating that this task is intended to run for a long time without user input, e.g. overnight. You should be extra thorough and only stop when you are confident the goal has been completely fulfilled. The system will force you to continue execution, prompting you to audit your work until completion.
</ADDITIONAL_METADATA>