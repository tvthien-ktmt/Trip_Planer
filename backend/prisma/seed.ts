import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// ===== Seed Helpers =====
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomItems = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const randomDate = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateBookingCode = () =>
  crypto.randomBytes(3).toString('hex').toUpperCase();

// ===== Data Definitions =====
const vietnamAirports = [
  { iataCode: 'SGN', name: 'Sân bay Quốc tế Tân Sơn Nhất', city: 'Hồ Chí Minh', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'HAN', name: 'Sân bay Quốc tế Nội Bài', city: 'Hà Nội', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'DAD', name: 'Sân bay Quốc tế Đà Nẵng', city: 'Đà Nẵng', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'PQC', name: 'Sân bay Quốc tế Phú Quốc', city: 'Phú Quốc', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'VII', name: 'Sân bay Vinh', city: 'Vinh', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'HUI', name: 'Sân bay Phú Bài', city: 'Huế', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'CXR', name: 'Sân bay Cam Ranh', city: 'Nha Trang', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'DLI', name: 'Sân bay Liên Khương', city: 'Đà Lạt', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'VCA', name: 'Sân bay Cần Thơ', city: 'Cần Thơ', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'VCS', name: 'Sân bay Côn Đảo', city: 'Côn Đảo', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'TBB', name: 'Sân bay Phù Cát', city: 'Quy Nhơn', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { iataCode: 'BMV', name: 'Sân bay Buôn Ma Thuột', city: 'Buôn Ma Thuột', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
];

const internationalAirports = [
  { iataCode: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok' },
  { iataCode: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
  { iataCode: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { iataCode: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul' },
  { iataCode: 'PVG', name: 'Pudong International Airport', city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai' },
  { iataCode: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'China', timezone: 'Asia/Hong_Kong' },
  { iataCode: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', timezone: 'Asia/Kuala_Lumpur' },
  { iataCode: 'DMK', name: 'Don Mueang International Airport', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok' },
  { iataCode: 'TPE', name: 'Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', timezone: 'Asia/Taipei' },
  { iataCode: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  { iataCode: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
  { iataCode: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles' },
];

const aircraftModels = [
  { model: 'Airbus A320', manufacturer: 'Airbus', totalSeats: 180 },
  { model: 'Airbus A321', manufacturer: 'Airbus', totalSeats: 220 },
  { model: 'Boeing 737-800', manufacturer: 'Boeing', totalSeats: 189 },
  { model: 'Boeing 787-9', manufacturer: 'Boeing', totalSeats: 296 },
  { model: 'Airbus A350-900', manufacturer: 'Airbus', totalSeats: 440 },
];

const airlines = ['Vietnam Airlines', 'VietJet Air', 'Bamboo Airways', 'Pacific Airlines'];

const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
const middleLastNames = [
  'Văn An', 'Thị Bích', 'Minh Châu', 'Quốc Dũng', 'Thị Linh', 'Anh Khoa',
  'Hoàng Nam', 'Bảo Ngọc', 'Thanh Phong', 'Kim Phụng', 'Quang Sơn', 'Thu Thảo',
  'Hữu Toàn', 'Thị Tuyết', 'Minh Việt', 'Thái Xuân', 'Thanh Ý', 'Thị Zin',
];

const tourDestinations = [
  { name: 'Hà Nội', region: 'Miền Bắc', country: 'Vietnam', type: 'VIETNAM' as const },
  { name: 'Hạ Long Bay', region: 'Miền Bắc', country: 'Vietnam', type: 'VIETNAM' as const },
  { name: 'Sapa', region: 'Miền Bắc', country: 'Vietnam', type: 'VIETNAM' as const },
  { name: 'Đà Nẵng', region: 'Miền Trung', country: 'Vietnam', type: 'VIETNAM' as const },
  { name: 'Hội An', region: 'Miền Trung', country: 'Vietnam', type: 'VIETNAM' as const },
  { name: 'Huế', region: 'Miền Trung', country: 'Vietnam', type: 'VIETNAM' as const },
  { name: 'Phú Quốc', region: 'Miền Nam', country: 'Vietnam', type: 'VIETNAM' as const },
  { name: 'Nha Trang', region: 'Miền Nam', country: 'Vietnam', type: 'VIETNAM' as const },
  { name: 'Bangkok', region: 'Southeast Asia', country: 'Thailand', type: 'INTERNATIONAL' as const },
  { name: 'Singapore', region: 'Southeast Asia', country: 'Singapore', type: 'INTERNATIONAL' as const },
  { name: 'Tokyo', region: 'East Asia', country: 'Japan', type: 'INTERNATIONAL' as const },
  { name: 'Seoul', region: 'East Asia', country: 'South Korea', type: 'INTERNATIONAL' as const },
  { name: 'Paris', region: 'Europe', country: 'France', type: 'INTERNATIONAL' as const },
];

// ===== MAIN SEED FUNCTION =====
async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data in reverse dependency order
  console.log('🧹 Cleaning existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.userPoints.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.voucherRedemption.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.bookingPassenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.flightSeat.deleteMany();
  await prisma.flightFareClass.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.airport.deleteMany();
  await prisma.blogPostTag.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.blogTag.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.tourImage.deleteMany();
  await prisma.tourItinerary.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.membershipTier.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.userDevice.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.loginHistory.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleaned existing data');

  // ===== 1. Permissions =====
  console.log('🔒 Seeding permissions...');
  const permissionDefs = [
    { code: 'BOOKING_READ', description: 'View bookings', module: 'BOOKING' },
    { code: 'BOOKING_CREATE', description: 'Create bookings', module: 'BOOKING' },
    { code: 'BOOKING_CANCEL', description: 'Cancel bookings', module: 'BOOKING' },
    { code: 'BOOKING_UPDATE_STATUS', description: 'Update booking status', module: 'BOOKING' },
    { code: 'PAYMENT_VIEW', description: 'View payments', module: 'PAYMENT' },
    { code: 'PAYMENT_REFUND', description: 'Process refunds', module: 'PAYMENT' },
    { code: 'USER_READ', description: 'View user profiles', module: 'USER' },
    { code: 'USER_LOCK', description: 'Lock/unlock user accounts', module: 'USER' },
    { code: 'USER_DELETE', description: 'Delete user accounts', module: 'USER' },
    { code: 'USER_EDIT', description: 'Edit user data', module: 'USER' },
    { code: 'BLOG_CREATE', description: 'Create blog posts', module: 'BLOG' },
    { code: 'BLOG_EDIT', description: 'Edit blog posts', module: 'BLOG' },
    { code: 'BLOG_PUBLISH', description: 'Publish blog posts', module: 'BLOG' },
    { code: 'BLOG_DELETE', description: 'Delete blog posts', module: 'BLOG' },
    { code: 'FLIGHT_CREATE', description: 'Create flights', module: 'FLIGHT' },
    { code: 'FLIGHT_EDIT', description: 'Edit flight details', module: 'FLIGHT' },
    { code: 'TOUR_CREATE', description: 'Create tours', module: 'TOUR' },
    { code: 'TOUR_EDIT', description: 'Edit tour details', module: 'TOUR' },
    { code: 'VOUCHER_CREATE', description: 'Create vouchers', module: 'VOUCHER' },
    { code: 'ANALYTICS_VIEW', description: 'View analytics dashboard', module: 'ANALYTICS' },
    { code: 'ANALYTICS_EXPORT', description: 'Export analytics data', module: 'ANALYTICS' },
    { code: 'RBAC_MANAGE', description: 'Manage roles and permissions', module: 'SYSTEM' },
    { code: 'AUDIT_LOG_VIEW', description: 'View audit logs', module: 'SYSTEM' },
    { code: 'SYSTEM_SETTINGS', description: 'Manage system settings', module: 'SYSTEM' },
  ];

  await prisma.permission.createMany({ data: permissionDefs, skipDuplicates: true });
  const permissions = await prisma.permission.findMany();

  // Assign all permissions to ADMIN
  await prisma.rolePermission.createMany({
    data: permissions.map((p) => ({ role: 'ADMIN', permissionId: p.id })),
    skipDuplicates: true,
  });

  // Assign subset to STAFF
  const staffPermCodes = ['BOOKING_READ', 'BOOKING_UPDATE_STATUS', 'PAYMENT_VIEW', 'USER_READ', 'BLOG_CREATE', 'BLOG_EDIT', 'BLOG_PUBLISH', 'FLIGHT_CREATE', 'FLIGHT_EDIT', 'TOUR_CREATE', 'TOUR_EDIT', 'VOUCHER_CREATE', 'ANALYTICS_VIEW'];
  const staffPerms = permissions.filter((p) => staffPermCodes.includes(p.code));
  await prisma.rolePermission.createMany({
    data: staffPerms.map((p) => ({ role: 'STAFF', permissionId: p.id })),
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${permissions.length} permissions`);

  // ===== 2. Users =====
  console.log('👥 Seeding users...');
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const userPasswordHash = await bcrypt.hash('User@123', 10);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tripplanner.vn',
      passwordHash,
      fullName: 'Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      phone: '0901234567',
    },
  });

  // Create staff user
  await prisma.user.create({
    data: {
      email: 'staff@tripplanner.vn',
      passwordHash,
      fullName: 'Staff Member',
      role: 'STAFF',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      phone: '0902345678',
    },
  });

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      email: 'user@tripplanner.vn',
      passwordHash: userPasswordHash,
      fullName: 'Nguyễn Văn Demo',
      role: 'USER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      phone: '0903456789',
      dateOfBirth: new Date('1995-05-15'),
    },
  });

  // Create 97 random users
  const regularUsers: any[] = [demoUser];
  for (let i = 0; i < 97; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(middleLastNames);
    const num = String(i).padStart(3, '0');
    const user = await prisma.user.create({
      data: {
        email: `user${num}@example.com`,
        passwordHash: userPasswordHash,
        fullName: `${firstName} ${lastName}`,
        role: 'USER',
        status: i % 20 === 0 ? 'LOCKED' : 'ACTIVE',
        emailVerifiedAt: new Date(),
        phone: `090${randomInt(1000000, 9999999)}`,
        dateOfBirth: randomDate(new Date('1980-01-01'), new Date('2000-12-31')),
        createdAt: randomDate(new Date('2024-01-01'), new Date('2026-07-01')),
      },
    });
    regularUsers.push(user);
  }
  console.log(`✅ Seeded ${regularUsers.length + 2} users`);

  // ===== 3. Airports =====
  console.log('✈️ Seeding airports...');
  await prisma.airport.createMany({
    data: [...vietnamAirports, ...internationalAirports],
    skipDuplicates: true,
  });
  const airports = await prisma.airport.findMany();
  const vnAirports = airports.filter((a) => a.country === 'Vietnam');
  const allAirports = airports;
  console.log(`✅ Seeded ${airports.length} airports`);

  // ===== 4. Aircraft =====
  console.log('🛩️ Seeding aircraft...');
  const createdAircraft: any[] = [];
  for (const ac of aircraftModels) {
    for (let i = 0; i < 4; i++) {
      const aircraft = await prisma.aircraft.create({
        data: { ...ac, seatMapConfig: { rows: 30, cols: 6, exitRows: [12, 24] } },
      });
      createdAircraft.push(aircraft);
    }
  }
  console.log(`✅ Seeded ${createdAircraft.length} aircraft`);

  // ===== 5. Flights + FareClasses + Seats =====
  console.log('🛫 Seeding flights...');
  const createdFlights: any[] = [];

  for (let i = 0; i < 200; i++) {
    const aircraft = randomItem(createdAircraft);
    const airline = randomItem(airlines);

    // Domestic vs International
    let depAirport: any, arrAirport: any;
    if (i < 140) {
      // 70% domestic
      depAirport = randomItem(vnAirports);
      arrAirport = randomItem(vnAirports.filter((a) => a.id !== depAirport.id));
    } else {
      // 30% international
      depAirport = randomItem(vnAirports);
      arrAirport = randomItem(allAirports.filter((a) => a.country !== 'Vietnam'));
    }

    const depTime = randomDate(new Date('2026-07-01'), new Date('2026-12-31'));
    const flightDuration = i < 140 ? randomInt(60, 120) : randomInt(180, 720); // minutes
    const arrTime = new Date(depTime.getTime() + flightDuration * 60 * 1000);

    const flight = await prisma.flight.create({
      data: {
        flightNumber: `${airline.substring(0, 2).toUpperCase()}${randomInt(100, 999)}`,
        airlineName: airline,
        aircraftId: aircraft.id,
        departureAirportId: depAirport.id,
        arrivalAirportId: arrAirport.id,
        departureTime: depTime,
        arrivalTime: arrTime,
        status: i % 30 === 0 ? 'DELAYED' : 'SCHEDULED',
      },
    });

    // Create fare classes
    const economyClass = await prisma.flightFareClass.create({
      data: {
        flightId: flight.id,
        className: 'ECONOMY',
        basePrice: randomInt(500000, 2000000),
        availableSeats: Math.floor(aircraft.totalSeats * 0.7),
        baggageAllowanceKg: 20,
      },
    });
    const businessClass = await prisma.flightFareClass.create({
      data: {
        flightId: flight.id,
        className: 'BUSINESS',
        basePrice: randomInt(3000000, 8000000),
        availableSeats: Math.floor(aircraft.totalSeats * 0.1),
        baggageAllowanceKg: 30,
      },
    });

    // Create seats (subset — not all 180+ for performance)
    const seats: any[] = [];
    for (let row = 1; row <= 15; row++) {
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
        const isEconomy = row > 3;
        const fareClass = isEconomy ? economyClass : businessClass;
        const status = Math.random() < 0.3 ? 'BOOKED' : 'AVAILABLE';
        const seat = await prisma.flightSeat.create({
          data: {
            flightId: flight.id,
            seatCode: `${row}${col}`,
            fareClassId: fareClass.id,
            status,
            extraFee: col === 'A' || col === 'F' ? 100000 : 0, // Window seats cost extra
          },
        });
        seats.push(seat);
      }
    }

    createdFlights.push({ flight, economyClass, businessClass, seats });
  }
  console.log(`✅ Seeded ${createdFlights.length} flights with fare classes and seats`);

  // ===== 6. Destinations + Tours =====
  console.log('🗺️ Seeding destinations and tours...');
  const createdDestinations: any[] = [];
  for (const dest of tourDestinations) {
    const d = await prisma.destination.create({
      data: {
        ...dest,
        tags: ['popular', 'recommended'],
        description: `Khám phá ${dest.name} - điểm đến hấp dẫn với nhiều trải nghiệm độc đáo.`,
        coverImageUrl: `https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800`,
      },
    });
    createdDestinations.push(d);
  }

  const tourTitles = [
    'Tour Khám phá', 'Tour Trải nghiệm', 'Tour Du lịch sinh thái', 'Tour Văn hóa',
    'Tour Nghỉ dưỡng cao cấp', 'Tour Phiêu lưu', 'Tour Gia đình', 'Tour Tuần trăng mật',
  ];

  const createdTours: any[] = [];
  for (let i = 0; i < 100; i++) {
    const dest = randomItem(createdDestinations);
    const title = `${randomItem(tourTitles)} ${dest.name} ${randomInt(3, 10)} ngày`;
    const durationDays = randomInt(3, 10);
    const basePrice = randomInt(3000000, 25000000);

    const tour = await prisma.tour.create({
      data: {
        title,
        destinationId: dest.id,
        description: `Khám phá vẻ đẹp tuyệt vời của ${dest.name} với lịch trình được thiết kế chu đáo.`,
        durationDays,
        basePrice,
        discountPercent: randomItem([0, 0, 0, 5, 10, 15, 20]),
        ratingAvg: randomInt(38, 50) / 10,
        reviewCount: randomInt(0, 200),
      },
    });

    // Add itineraries
    for (let day = 1; day <= Math.min(durationDays, 3); day++) {
      await prisma.tourItinerary.create({
        data: {
          tourId: tour.id,
          dayNumber: day,
          title: `Ngày ${day}: Tham quan ${dest.name}`,
          description: `Tham quan các điểm nổi bật của ${dest.name}, thưởng thức ẩm thực địa phương.`,
        },
      });
    }

    // Add tour image
    await prisma.tourImage.create({
      data: {
        tourId: tour.id,
        imageUrl: `https://images.unsplash.com/photo-${randomInt(1500000000, 1600000000)}?w=800`,
        displayOrder: 0,
      },
    });

    createdTours.push(tour);
  }
  console.log(`✅ Seeded ${createdTours.length} tours`);

  // ===== 7. Vouchers =====
  console.log('🎟️ Seeding vouchers...');
  const voucherCodes = ['WELCOME10', 'SUMMER20', 'FLASH15', 'VIP50', 'NEWUSER', 'HOLIDAY30', 'WEEKEND5', 'TRIPPLAN25'];
  for (const code of voucherCodes) {
    await prisma.voucher.create({
      data: {
        code,
        discountType: Math.random() > 0.5 ? 'PERCENT' : 'FIXED',
        discountValue: Math.random() > 0.5 ? randomInt(5, 30) : randomInt(50000, 500000),
        minOrderAmount: randomInt(500000, 2000000),
        maxDiscountAmount: randomInt(200000, 1000000),
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        usageLimit: randomInt(50, 500),
        usedCount: randomInt(0, 50),
      },
    });
  }

  // Add 42 more random vouchers
  for (let i = 0; i < 42; i++) {
    const code = `DEAL${String(i).padStart(3, '0')}`;
    await prisma.voucher.create({
      data: {
        code,
        discountType: Math.random() > 0.5 ? 'PERCENT' : 'FIXED',
        discountValue: Math.random() > 0.5 ? randomInt(5, 30) : randomInt(50000, 500000),
        minOrderAmount: randomInt(500000, 2000000),
        validFrom: randomDate(new Date('2025-01-01'), new Date('2026-06-01')),
        validTo: randomDate(new Date('2026-06-01'), new Date('2027-01-01')),
        usageLimit: randomInt(10, 200),
        usedCount: randomInt(0, 10),
      },
    });
  }
  console.log('✅ Seeded 50 vouchers');

  // ===== 8. Membership Tiers =====
  console.log('🏆 Seeding membership tiers...');
  const tiers = [
    { name: 'Bronze', minPoints: 0, benefits: { discount: '2%', priority: false, lounge: false } },
    { name: 'Silver', minPoints: 5000, benefits: { discount: '5%', priority: true, lounge: false, extraBaggage: '5kg' } },
    { name: 'Gold', minPoints: 15000, benefits: { discount: '10%', priority: true, lounge: true, extraBaggage: '10kg', upgrade: 'occasional' } },
    { name: 'Diamond', minPoints: 50000, benefits: { discount: '15%', priority: true, lounge: true, extraBaggage: '20kg', upgrade: 'guaranteed', concierge: true } },
  ];
  const createdTiers: any[] = [];
  for (const tier of tiers) {
    const t = await prisma.membershipTier.create({ data: tier });
    createdTiers.push(t);
  }
  console.log('✅ Seeded 4 membership tiers');

  // ===== 9. Bookings + Payments =====
  console.log('📋 Seeding bookings and payments...');
  const bookingStatuses = ['CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'COMPLETED', 'COMPLETED', 'CANCELLED', 'PENDING_PAYMENT'];
  let bookingCount = 0;

  for (let i = 0; i < 500; i++) {
    const user = randomItem(regularUsers);
    const status = randomItem(bookingStatuses);
    const type: 'FLIGHT' | 'TOUR' = Math.random() > 0.4 ? 'FLIGHT' : 'TOUR';

    const totalAmount = randomInt(500000, 15000000);
    const bookingDate = randomDate(new Date('2025-01-01'), new Date('2026-07-14'));

    let bookingCode = '';
    let isUnique = false;
    while (!isUnique) {
      bookingCode = generateBookingCode();
      const existing = await prisma.booking.findUnique({ where: { bookingCode } });
      if (!existing) isUnique = true;
    }

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        userId: user.id,
        type,
        status: status as any,
        totalAmount,
        currency: 'VND',
        createdAt: bookingDate,
      },
    });

    // Add booking status history
    await prisma.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        fromStatus: 'DRAFT',
        toStatus: status,
        changedBy: user.id,
        changedAt: bookingDate,
      },
    });

    // Add payment for confirmed/completed
    if (['CONFIRMED', 'COMPLETED'].includes(status)) {
      const methods: any[] = ['VNPAY', 'VNPAY', 'MOMO', 'BANK_TRANSFER', 'CREDIT_CARD'];
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          method: randomItem(methods),
          amount: totalAmount,
          status: 'SUCCESS',
          transactionRef: `TXN${Date.now()}${randomInt(1000, 9999)}`,
          idempotencyKey: `PAY_${booking.id}_${Date.now()}${i}`,
        },
      });

      // Award membership points
      const points = Math.floor(totalAmount / 10000);
      await prisma.userPoints.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          pointsBalance: points,
          tierId: createdTiers[0].id,
        },
        update: {
          pointsBalance: { increment: points },
        },
      });
    }

    bookingCount++;
    if (bookingCount % 50 === 0) console.log(`   Progress: ${bookingCount}/500 bookings`);
  }
  console.log(`✅ Seeded ${bookingCount} bookings with payments`);

  // ===== 10. Reviews =====
  console.log('⭐ Seeding reviews...');
  for (let i = 0; i < 300; i++) {
    const user = randomItem(regularUsers);
    const isTourReview = Math.random() > 0.4;
    const reviewableId = isTourReview
      ? randomItem(createdTours).id
      : randomItem(createdFlights).flight.id;

    await prisma.review.create({
      data: {
        userId: user.id,
        reviewableType: isTourReview ? 'TOUR' : 'FLIGHT',
        reviewableId,
        rating: randomInt(3, 5),
        comment: randomItem([
          'Trải nghiệm tuyệt vời! Rất hài lòng với dịch vụ.',
          'Chuyến đi rất thú vị, sẽ quay lại lần sau.',
          'Dịch vụ tốt, giá hợp lý. Recommended!',
          'Nhân viên nhiệt tình, chu đáo. 5 sao!',
          'Tour rất đáng giá tiền. Lịch trình hợp lý.',
          'Khá hài lòng, chỉ có một vài điểm nhỏ cần cải thiện.',
          'Sẽ giới thiệu cho bạn bè và người thân.',
        ]),
        helpfulCount: randomInt(0, 50),
        status: 'PUBLISHED',
      },
    });
  }
  console.log('✅ Seeded 300 reviews');

  // ===== 11. Blog Content =====
  console.log('📝 Seeding blog content...');
  const blogCategory = await prisma.blogCategory.create({
    data: { name: 'Du lịch trong nước', slug: 'du-lich-trong-nuoc' },
  });
  await prisma.blogCategory.createMany({
    data: [
      { name: 'Du lịch quốc tế', slug: 'du-lich-quoc-te' },
      { name: 'Mẹo du lịch', slug: 'meo-du-lich' },
      { name: 'Ẩm thực', slug: 'am-thuc' },
      { name: 'Nghỉ dưỡng', slug: 'nghi-duong' },
    ],
    skipDuplicates: true,
  });

  const blogTags = ['Việt Nam', 'Đông Nam Á', 'Mùa hè', 'Gia đình', 'Ngân sách', 'Cao cấp', 'Adventure', 'Ẩm thực'];
  for (const tagName of blogTags) {
    const slug = tagName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await prisma.blogTag.upsert({
      where: { slug },
      create: { name: tagName, slug },
      update: {},
    });
  }

  const blogPosts = [
    { title: 'Top 10 điểm du lịch đẹp nhất Việt Nam 2026', slug: 'top-10-diem-du-lich-viet-nam-2026' },
    { title: 'Kinh nghiệm du lịch Hà Nội 3 ngày 2 đêm', slug: 'kinh-nghiem-du-lich-ha-noi-3-ngay' },
    { title: 'Khám phá Hội An cổ kính và thơ mộng', slug: 'kham-pha-hoi-an' },
    { title: 'Du lịch Phú Quốc: Thiên đường biển đảo', slug: 'du-lich-phu-quoc-thien-duong-bien-dao' },
    { title: 'Hướng dẫn đặt vé máy bay giá rẻ', slug: 'huong-dan-dat-ve-may-bay-gia-re' },
    { title: 'Những điều cần biết khi du lịch Nhật Bản', slug: 'nhung-dieu-can-biet-du-lich-nhat-ban' },
    { title: 'Bangkok 5 ngày: Khám phá thành phố không ngủ', slug: 'bangkok-5-ngay-kham-pha' },
    { title: 'Ẩm thực đường phố Sài Gòn không thể bỏ qua', slug: 'am-thuc-duong-pho-sai-gon' },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: post.slug,
        content: `<h2>${post.title}</h2><p>Nội dung chi tiết về ${post.title}. Đây là một bài viết được biên soạn kỹ lưỡng về chủ đề du lịch hấp dẫn này...</p><p>Hãy cùng chúng tôi khám phá những điều thú vị đang chờ đón bạn!</p>`,
        categoryId: blogCategory.id,
        authorId: adminUser.id,
        status: 'PUBLISHED',
        publishedAt: randomDate(new Date('2025-01-01'), new Date('2026-07-01')),
        metaTitle: `${post.title} | Trip Planner`,
        metaDescription: `Khám phá ${post.title}. Thông tin hữu ích và kinh nghiệm thực tế từ Trip Planner.`,
        viewCount: randomInt(100, 5000),
      },
    });
  }
  console.log('✅ Seeded blog content (categories, tags, 8 posts)');

  // ===== 12. Activity Logs for demo user =====
  console.log('📊 Seeding activity logs...');
  const activityActions = [
    { action: 'USER_LOGIN', description: 'Đăng nhập thành công' },
    { action: 'BOOKING_CREATED', description: 'Tạo booking chuyến bay SGN→HAN' },
    { action: 'PAYMENT_SUCCESS', description: 'Thanh toán thành công - 1,500,000 VND' },
    { action: 'BOOKING_CONFIRMED', description: 'Booking được xác nhận' },
    { action: 'WISHLIST_ADDED', description: 'Thêm Tour Đà Nẵng vào yêu thích' },
    { action: 'REVIEW_SUBMITTED', description: 'Đánh giá chuyến bay 5 sao' },
    { action: 'PROFILE_UPDATED', description: 'Cập nhật thông tin cá nhân' },
  ];

  for (const act of activityActions) {
    await prisma.activityLog.create({
      data: {
        userId: demoUser.id,
        action: act.action,
        description: act.description,
        metadata: { source: 'seed' },
        ipAddress: '192.168.1.1',
        createdAt: randomDate(new Date('2026-06-01'), new Date('2026-07-14')),
      },
    });
  }
  console.log('✅ Seeded activity logs for demo user');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('='.repeat(50));
  console.log('📋 Test Accounts:');
  console.log('  Admin:  admin@tripplanner.vn / Admin@123');
  console.log('  Staff:  staff@tripplanner.vn / Admin@123');
  console.log('  User:   user@tripplanner.vn  / User@123');
  console.log('='.repeat(50));
  console.log('📊 Seeded Data Summary:');
  console.log(`  Permissions: ${permissions.length}`);
  console.log(`  Users: ${regularUsers.length + 2}`);
  console.log(`  Airports: ${airports.length}`);
  console.log(`  Aircraft: ${createdAircraft.length}`);
  console.log(`  Flights: ${createdFlights.length}`);
  console.log(`  Tours: ${createdTours.length}`);
  console.log(`  Vouchers: 50`);
  console.log(`  Bookings: ${bookingCount}`);
  console.log(`  Reviews: 300`);
  console.log(`  Blog Posts: 8`);
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
