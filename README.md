<div align="center">

# ✈️ Trip Planner OTA

**An enterprise-grade Online Travel Agency platform built with NestJS + Next.js**

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-Alpine-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5.x-FF4500?style=flat-square)](https://docs.bullmq.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

[Live Demo](#) · [API Docs](http://localhost:3000/api/docs) · [ERD](./docs/ERD.md)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Database Design](#-database-design)
- [API Documentation](#-api-documentation)
- [Docker Setup](#-docker-setup)
- [Environment Variables](#-environment-variables)
- [Seed Data & Test Accounts](#-seed-data--test-accounts)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)

---

## 📌 Project Overview

Trip Planner OTA is a **full-stack Online Travel Agency (OTA) platform** designed with enterprise-grade architecture patterns. Users can search and book flights & tours, manage bookings, process payments via VNPay, earn membership points, and interact with a rich travel blog. Admins have a full-featured CMS and analytics dashboard.

**Key highlights:**
- 🔐 JWT + Refresh Token Rotation with token theft detection
- 🪑 Optimistic locking for concurrent seat booking
- 💳 VNPay payment integration with idempotency
- 📧 Async email queue via BullMQ
- 🔒 Fine-grained RBAC with Permission-based access control
- 📊 Real-time analytics dashboard
- 🗂️ Session management with device tracking
- 📝 Activity & Audit logging for full traceability
- 🐳 Docker Compose for one-command infrastructure

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend Framework** | NestJS 11 (TypeScript) | Modular, dependency-injected REST API |
| **Frontend** | Next.js 16 (React 19) | SSR + CSR travel booking UI |
| **ORM** | Prisma 5 | Type-safe database access |
| **Database** | MySQL 8.0 | Primary relational data store |
| **Cache / Session** | Redis (via ioredis) | Token blacklist, cache, rate limiting |
| **Queue** | BullMQ | Async jobs: email, booking expiry |
| **Auth** | JWT + Passport.js | Access & Refresh token strategy |
| **Validation** | class-validator + Joi | DTO & env validation |
| **API Docs** | Swagger (OpenAPI 3) | Auto-generated API documentation |
| **Rate Limiting** | @nestjs/throttler | Per-route & global throttling |
| **UI** | Tailwind CSS + Framer Motion | Responsive, animated UI |
| **State** | Zustand + React Query | Client state + server cache |
| **Styling** | TailwindCSS 4 | Utility-first CSS |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│   Next.js 16 (App Router) — React 19 — Zustand — React Query   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP / REST
┌─────────────────────────▼───────────────────────────────────────┐
│                        API LAYER                                │
│   NestJS 11 — Swagger — JWT Guard — RBAC Guard — Throttler     │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │   Auth   │ │ Booking  │ │ Payment  │ │ Admin / Analytics│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Flight  │ │   Tour   │ │   Blog   │ │  Upload / Media  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
└──────┬──────────────────────────────────┬───────────────────────┘
       │ Prisma ORM                       │ BullMQ (Redis)
┌──────▼──────┐                  ┌────────▼───────┐
│   MySQL 8   │                  │  Redis (Queue) │
│  (Primary)  │                  │  (Cache/Jobs)  │
└─────────────┘                  └────────────────┘
```

### Key Design Patterns
- **Repository Pattern** via Prisma Service (injected globally)
- **CQRS-lite**: Controllers → Services → Prisma (no direct DB in controllers)
- **Optimistic Locking**: `version` field on `FlightSeat` for concurrency
- **Idempotency**: Payment records have `idempotencyKey` to prevent double-charge
- **Token Rotation**: Every refresh generates new access + refresh token, old one revoked
- **Token Theft Detection**: Reuse of revoked refresh token → all user sessions invalidated

---

## ✨ Features

### 🧑‍💼 User Features
| Feature | Status |
|---|---|
| OTP Email Verification on Register | ✅ |
| JWT Login + Refresh Token Rotation | ✅ |
| 2FA (OTP via email) | ✅ |
| Account lock after 5 failed attempts | ✅ |
| Session management (view/logout devices) | ✅ |
| Flight search & booking | ✅ |
| Seat selection with optimistic locking | ✅ |
| Tour booking | ✅ |
| VNPay payment integration | ✅ |
| Voucher / discount codes | ✅ |
| Booking history & management | ✅ |
| Membership points & tiers | ✅ |
| Wishlist (tours & destinations) | ✅ |
| Reviews & ratings | ✅ |
| Activity log (login, booking, payment) | ✅ |
| Email notifications (queue-based) | ✅ |

### 🔧 Admin Features
| Feature | Status |
|---|---|
| Admin dashboard with KPI cards | ✅ |
| Revenue & booking analytics charts | ✅ |
| User management (list, lock, delete) | ✅ |
| Flight & tour management | ✅ |
| Booking management & status updates | ✅ |
| Refund processing | ✅ |
| Voucher/promo management | ✅ |
| Blog CMS (draft, publish, schedule) | ✅ |
| File upload & media library | ✅ |
| RBAC permission management | ✅ |
| Audit logs (who did what, when) | ✅ |

---

## 🗄 Database Design

See detailed ERD: [docs/ERD.md](./docs/ERD.md)

**Core domains:**

```
AUTH            → User, RefreshToken, OtpCode, LoginHistory, UserDevice, UserSession
FLIGHT          → Airport, Aircraft, Flight, FlightFareClass, FlightSeat
TOUR            → Destination, Tour, TourItinerary, TourImage
BOOKING         → Booking, BookingPassenger, BookingItem, BookingStatusHistory
PAYMENT         → Payment, Refund, Voucher, VoucherRedemption
MEMBERSHIP      → MembershipTier, UserPoints, PointTransaction
CONTENT         → BlogPost, BlogCategory, BlogTag, MediaFile, Faq
NOTIFICATIONS   → Notification, NotificationTemplate, ContactSubmission
ADMIN           → AuditLog, ActivityLog, SystemSetting
RBAC            → Permission, RolePermission
```

**Total models: 35+**

---

## 📖 API Documentation

Swagger UI is available at: **http://localhost:3000/api/docs**

### Key Endpoints

```
POST  /api/auth/send-otp          # Request OTP (rate-limited: 3/15min)
POST  /api/auth/register          # Register with OTP verification
POST  /api/auth/login             # Login → JWT + Refresh Token
POST  /api/auth/refresh           # Refresh Token rotation
POST  /api/auth/logout            # Logout + blacklist token
GET   /api/auth/sessions          # List active sessions/devices
DELETE /api/auth/sessions/:id     # Logout specific device
DELETE /api/auth/sessions         # Logout all devices

GET   /api/flights/search         # Search flights
POST  /api/booking                # Create draft booking
POST  /api/booking/:id/seat       # Select seat (optimistic locking)
POST  /api/booking/:id/voucher    # Apply voucher
POST  /api/payments/initiate      # Initiate VNPay payment
GET   /api/payments/vnpay/callback # VNPay callback (idempotent)

GET   /api/user/profile           # Get profile
PATCH /api/user/profile           # Update profile
GET   /api/user/activity-log      # User activity history

GET   /api/admin/analytics/revenue     # Revenue analytics
GET   /api/admin/analytics/bookings    # Booking trends
GET   /api/admin/analytics/top-routes  # Popular routes
POST  /api/admin/rbac/permissions      # Create permission
POST  /api/upload/avatar               # Upload avatar

GET   /api/blog                   # List published blog posts
POST  /api/blog                   # Create blog post (BLOG_CREATE permission)
PATCH /api/blog/:id/publish       # Publish post (BLOG_PUBLISH permission)
```

---

## 🐳 Docker Setup

```bash
# Clone repo
git clone https://github.com/yourusername/trip-planner.git
cd trip-planner

# Start infrastructure (MySQL + Redis)
cd backend
docker-compose up -d

# Install dependencies & setup database
npm install
npx prisma migrate dev
npx prisma db seed

# Start backend
npm run start:dev

# In another terminal — start frontend
cd ../frontend
npm install
npm run dev
```

**Services:**
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs
- Frontend: http://localhost:3001
- MySQL: localhost:3306
- Redis: localhost:6379

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="mysql://root:root@localhost:3306/trip_planer"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET="your-access-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# VNPay (Sandbox)
VNPAY_TMN_CODE="sandbox_tmn"
VNPAY_HASH_SECRET="sandbox_hash"
VNPAY_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNPAY_RETURN_URL="http://localhost:3000/api/payments/vnpay/callback"

# App
APP_SECRET="your-app-secret"
PORT=3000

# Email (Optional - uses console.log if not set)
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT=587
SMTP_USER="your-ethereal-user"
SMTP_PASS="your-ethereal-pass"
SMTP_FROM="noreply@tripplanner.vn"
```

---

## 🌱 Seed Data & Test Accounts

After running `npx prisma db seed`, the following data is available:

### Test Accounts

| Role | Email | Password |
|---|---|---|
| **Super Admin** | admin@tripplanner.vn | Admin@123 |
| **Staff** | staff@tripplanner.vn | Staff@123 |
| **Regular User** | user@tripplanner.vn | User@123 |

### Seeded Data Volume

| Entity | Count |
|---|---|
| Users | 100 |
| Airports | 50 (VN + International) |
| Aircraft | 20 |
| Flights | 200 |
| Flight Seats | ~10,000 |
| Tours | 100 |
| Bookings | 500 |
| Payments | 450 (Success) |
| Reviews | 300 |
| Vouchers | 50 |
| Blog Posts | 20 |
| Membership Tiers | 4 (Bronze/Silver/Gold/Diamond) |

---

## 📸 Screenshots

> _Screenshots will be added after the project is fully running._

| Page | Description |
|---|---|
| Home | Landing page with flight search |
| Flight Search | Real-time seat availability |
| Booking Flow | Multi-step booking with seat map |
| Payment | VNPay integration |
| User Dashboard | Bookings, membership, activity |
| Admin Dashboard | KPIs, revenue charts, analytics |
| Blog CMS | Rich text editor with preview |

---

## 🚀 Future Improvements

- [ ] **Real-time notifications** via WebSocket (Socket.IO)
- [ ] **AI-powered trip recommendations** based on booking history
- [ ] **Multi-language support** (i18n: Vietnamese/English)
- [ ] **Progressive Web App (PWA)** support
- [ ] **CI/CD pipeline** with GitHub Actions
- [ ] **Deploy to cloud** (AWS ECS + RDS + ElastiCache)
- [ ] **Rate limiting per user** (not just per IP)
- [ ] **Webhook support** for payment providers
- [ ] **Mobile app** (React Native)
- [ ] **A/B testing** framework for pricing optimization

---

## 👨‍💻 Author

Built with ❤️ as a portfolio project demonstrating enterprise-grade backend architecture with NestJS.

**Skills demonstrated:**
- RESTful API design with NestJS + TypeScript
- Relational database modeling (Prisma + MySQL)
- Authentication: JWT, OTP, Refresh Token Rotation, Token Blacklisting
- Authorization: RBAC with fine-grained permissions
- Concurrency handling: Optimistic Locking
- Async processing: BullMQ job queues
- Caching: Redis with TTL
- Payment integration: VNPay with idempotency
- Security: Rate limiting, input validation, timing-safe comparisons
- Testing: Unit tests (Jest) + Integration tests (Supertest)

---

<div align="center">

**⭐ If this project impressed you, please give it a star!**

</div>
