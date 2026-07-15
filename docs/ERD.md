# 📊 Entity Relationship Diagram (ERD)

Trip Planner OTA Database Schema — **35+ models** across 9 domains.

---

## Full ERD

```mermaid
erDiagram
    %% ===== AUTH & USER =====
    User {
        BigInt id PK
        String email UK
        String passwordHash
        String fullName
        String phone
        String avatarUrl
        DateTime dateOfBirth
        String nationalId
        String passportNo
        Enum role "USER|ADMIN"
        Enum status "ACTIVE|LOCKED|PENDING_VERIFICATION"
        DateTime emailVerifiedAt
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
    }

    RefreshToken {
        BigInt id PK
        BigInt userId FK
        String tokenHash
        DateTime expiresAt
        DateTime revokedAt
        String deviceInfo
    }

    OtpCode {
        BigInt id PK
        BigInt userId FK
        String codeHash
        Enum purpose "REGISTER|RESET_PASSWORD|LOGIN_2FA"
        DateTime expiresAt
        DateTime consumedAt
    }

    LoginHistory {
        BigInt id PK
        BigInt userId FK
        String ipAddress
        String device
        String location
        DateTime loginAt
        Boolean success
    }

    UserDevice {
        BigInt id PK
        BigInt userId FK
        String deviceFingerprint
        String deviceName
        DateTime lastActiveAt
        Boolean isTrusted
    }

    UserSession {
        BigInt id PK
        BigInt userId FK
        String sessionToken UK
        String deviceName
        String deviceType
        String ipAddress
        String location
        String userAgent
        Boolean isActive
        DateTime lastActiveAt
        DateTime expiresAt
        DateTime createdAt
    }

    %% ===== RBAC =====
    Permission {
        BigInt id PK
        String code UK
        String description
        String module
    }

    RolePermission {
        String role FK
        BigInt permissionId FK
    }

    %% ===== FLIGHT =====
    Airport {
        BigInt id PK
        String iataCode UK
        String name
        String city
        String country
        String timezone
    }

    Aircraft {
        BigInt id PK
        String model
        String manufacturer
        Int totalSeats
        Json seatMapConfig
    }

    Flight {
        BigInt id PK
        String flightNumber
        String airlineName
        BigInt aircraftId FK
        BigInt departureAirportId FK
        BigInt arrivalAirportId FK
        DateTime departureTime
        DateTime arrivalTime
        Enum status "SCHEDULED|DELAYED|CANCELLED|LANDED"
    }

    FlightFareClass {
        BigInt id PK
        BigInt flightId FK
        Enum className "ECONOMY|PREMIUM_ECONOMY|BUSINESS"
        Decimal basePrice
        Int availableSeats
        Int baggageAllowanceKg
    }

    FlightSeat {
        BigInt id PK
        BigInt flightId FK
        String seatCode
        BigInt fareClassId FK
        Enum status "AVAILABLE|LOCKED|BOOKED"
        Decimal extraFee
        Int version "Optimistic Lock"
    }

    %% ===== TOUR =====
    Destination {
        BigInt id PK
        String name
        String region
        String country
        Enum type "VIETNAM|INTERNATIONAL"
        Json tags
        String description
        String coverImageUrl
    }

    Tour {
        BigInt id PK
        String title
        BigInt destinationId FK
        String description
        Int durationDays
        Decimal basePrice
        Int discountPercent
        Decimal ratingAvg
        Int reviewCount
    }

    TourItinerary {
        BigInt id PK
        BigInt tourId FK
        Int dayNumber
        String title
        String description
    }

    TourImage {
        BigInt id PK
        BigInt tourId FK
        String imageUrl
        Int displayOrder
    }

    %% ===== BOOKING =====
    Booking {
        BigInt id PK
        String bookingCode UK
        BigInt userId FK
        Enum type "FLIGHT|TOUR"
        Enum status "DRAFT|PENDING_PAYMENT|CONFIRMED|CANCELLED|COMPLETED"
        Decimal totalAmount
        String currency
        DateTime expiresAt
    }

    BookingPassenger {
        BigInt id PK
        BigInt bookingId FK
        String fullName
        DateTime dateOfBirth
        String nationality
        String passportNo
        BigInt seatId FK
        BigInt fareClassId FK
    }

    BookingItem {
        BigInt id PK
        BigInt bookingId FK
        Enum itemType "BAGGAGE|MEAL|ADDON|TOUR_SLOT"
        BigInt itemRefId
        Int quantity
        Decimal unitPrice
        Decimal subtotal
    }

    BookingStatusHistory {
        BigInt id PK
        BigInt bookingId FK
        String fromStatus
        String toStatus
        BigInt changedBy
        DateTime changedAt
        String reason
    }

    %% ===== PAYMENT =====
    Payment {
        BigInt id PK
        BigInt bookingId FK UK
        Enum method "CREDIT_CARD|BANK_TRANSFER|VNPAY|MOMO"
        Decimal amount
        Enum status "PENDING|SUCCESS|FAILED|REFUNDED"
        String transactionRef
        String idempotencyKey UK
    }

    Refund {
        BigInt id PK
        BigInt paymentId FK
        Decimal amount
        String reason
        Enum status "REQUESTED|PROCESSING|APPROVED|REJECTED"
        BigInt processedBy
        DateTime processedAt
    }

    Voucher {
        BigInt id PK
        String code UK
        Enum discountType "PERCENT|FIXED"
        Decimal discountValue
        Decimal minOrderAmount
        Decimal maxDiscountAmount
        DateTime validFrom
        DateTime validTo
        Int usageLimit
        Int usedCount
    }

    VoucherRedemption {
        BigInt id PK
        BigInt voucherId FK
        BigInt userId FK
        BigInt bookingId FK
        DateTime redeemedAt
    }

    %% ===== MEMBERSHIP =====
    MembershipTier {
        BigInt id PK
        String name
        Int minPoints
        Json benefits
    }

    UserPoints {
        BigInt id PK
        BigInt userId FK UK
        Int pointsBalance
        BigInt tierId FK
    }

    PointTransaction {
        BigInt id PK
        BigInt userId FK
        BigInt bookingId FK
        Int pointsChange
        String reason
        DateTime createdAt
    }

    %% ===== BLOG =====
    BlogPost {
        BigInt id PK
        String title
        String slug UK
        String content
        String coverImageUrl
        BigInt categoryId FK
        BigInt authorId FK
        Enum status "DRAFT|PUBLISHED|SCHEDULED"
        DateTime publishedAt
        DateTime scheduledAt
        String metaTitle
        String metaDescription
    }

    BlogCategory {
        BigInt id PK
        String name
        String slug UK
    }

    BlogTag {
        BigInt id PK
        String name UK
        String slug UK
    }

    BlogPostTag {
        BigInt postId FK
        BigInt tagId FK
    }

    MediaFile {
        BigInt id PK
        String fileName
        String fileUrl
        String fileType
        Int fileSize
        String folderPath
        BigInt uploadedBy FK
    }

    %% ===== ADMIN & LOGGING =====
    AuditLog {
        BigInt id PK
        BigInt adminUserId FK
        String action
        String targetType
        BigInt targetId
        Json beforeData
        Json afterData
        String ipAddress
        DateTime createdAt
    }

    ActivityLog {
        BigInt id PK
        BigInt userId FK
        String action
        String description
        Json metadata
        String ipAddress
        DateTime createdAt
    }

    SystemSetting {
        BigInt id PK
        String settingKey UK
        String settingValue
        Boolean isEncrypted
    }

    Notification {
        BigInt id PK
        BigInt userId FK
        String title
        String body
        Enum type "SYSTEM|PROMOTION|BOOKING_UPDATE"
        DateTime readAt
        DateTime createdAt
    }

    %% ===== RELATIONSHIPS =====
    User ||--o{ RefreshToken : "has"
    User ||--o{ LoginHistory : "has"
    User ||--o{ UserDevice : "has"
    User ||--o{ UserSession : "has"
    User ||--o{ Booking : "makes"
    User ||--o{ Review : "writes"
    User ||--o{ Wishlist : "has"
    User ||--o| UserPoints : "has"
    User ||--o{ ActivityLog : "generates"

    Flight ||--o{ FlightFareClass : "has"
    Flight ||--o{ FlightSeat : "has"
    Flight }o--|| Airport : "departs from"
    Flight }o--|| Airport : "arrives at"
    Flight }o--|| Aircraft : "uses"

    Tour }o--|| Destination : "is in"
    Tour ||--o{ TourItinerary : "has"
    Tour ||--o{ TourImage : "has"

    Booking ||--o{ BookingPassenger : "has"
    Booking ||--o{ BookingItem : "has"
    Booking ||--o{ BookingStatusHistory : "has"
    Booking ||--o| Payment : "has"

    Payment ||--o{ Refund : "has"
    Voucher ||--o{ VoucherRedemption : "used in"

    BlogPost }o--|| BlogCategory : "belongs to"
    BlogPost ||--o{ BlogPostTag : "has"
    BlogTag ||--o{ BlogPostTag : "has"

    RolePermission }o--|| Permission : "grants"
    UserPoints }o--|| MembershipTier : "belongs to"
```

---

## Domain Summary

| Domain | Models | Key Features |
|---|---|---|
| **Auth & User** | User, RefreshToken, OtpCode, LoginHistory, UserDevice, UserSession | JWT rotation, OTP, device tracking, session management |
| **RBAC** | Permission, RolePermission | Fine-grained permission control per role |
| **Flight** | Airport, Aircraft, Flight, FlightFareClass, FlightSeat | Optimistic locking on seats (`version` field) |
| **Tour** | Destination, Tour, TourItinerary, TourImage | Multi-day itineraries with image galleries |
| **Booking** | Booking, BookingPassenger, BookingItem, BookingStatusHistory | State machine with history tracking |
| **Payment** | Payment, Refund, Voucher, VoucherRedemption | VNPay integration, idempotency key, refund workflow |
| **Membership** | MembershipTier, UserPoints, PointTransaction | Points-based tier system (Bronze→Diamond) |
| **Blog** | BlogPost, BlogCategory, BlogTag, BlogPostTag, MediaFile | CMS with draft/publish/schedule + SEO fields |
| **Logging** | AuditLog, ActivityLog, SystemSetting | Admin audit trail + user activity history |
| **Notifications** | Notification, NotificationTemplate, ContactSubmission | In-app + email notifications |

---

## Key Indexes

```sql
-- Flight search performance
CREATE INDEX idx_flight_search ON Flight(departureAirportId, arrivalAirportId, departureTime);

-- Booking queries
CREATE INDEX idx_booking_userId ON Booking(userId);
CREATE INDEX idx_booking_status ON Booking(status);

-- Activity log (user history)
CREATE INDEX idx_activity_userId_createdAt ON ActivityLog(userId, createdAt);

-- Session management
CREATE INDEX idx_session_userId ON UserSession(userId);
```

---

## Concurrency & Safety Patterns

### Optimistic Locking (FlightSeat)

```typescript
// Only update if version matches — prevents double-booking
await prisma.flightSeat.updateMany({
  where: { id: seatId, version: currentVersion, status: 'AVAILABLE' },
  data: { status: 'LOCKED', version: { increment: 1 } }
});
// result.count === 0 means someone else booked it first
```

### Idempotency (Payment)

```typescript
// idempotencyKey is UNIQUE in DB — prevents duplicate payments
await prisma.payment.create({
  data: { bookingId, idempotencyKey: `PAY_${bookingId}_${Date.now()}`, ... }
});
```

### Token Rotation (RefreshToken)

```
Login → generate accessToken + refreshToken
Refresh → revoke old refreshToken → generate new pair
Detect reuse of revoked token → revoke ALL user tokens
```
