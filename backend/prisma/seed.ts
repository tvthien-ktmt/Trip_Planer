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

  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ WARNING: Refusing to run seed in production environment!');
    return;
  }

  // Clean existing data in reverse dependency order
  console.log('🧹 Cleaning existing data...');
  if (process.env.NODE_ENV !== 'production') {
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
  } else {
    console.log('⚠️ Skipping destructive deleteMany in production environment');
  }

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
  // ===== Seed Admin & Demo Users =====
  console.log('👤 Seeding users...');
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;
  
  if (!adminPassword || !userPassword) {
    throw new Error('ADMIN_PASSWORD and USER_PASSWORD environment variables are required to seed users.');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const userPasswordHash = await bcrypt.hash(userPassword, 12);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tripplanner.vn' },
    update: {},
    create: {
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
  await prisma.user.upsert({
    where: { email: 'staff@tripplanner.vn' },
    update: {},
    create: {
      email: 'staff@tripplanner.vn',
      passwordHash,
      fullName: 'Staff Member',
      role: 'STAFF',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      phone: '0902345678',
    },
  });

  if (process.env.NODE_ENV === 'production') {
    console.log('✅ Essential data seeded. Skipping dummy data in production.');
    return;
  }

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@tripplanner.vn' },
    update: {},
    create: {
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
  for (const ac of aircraftModels) {
    for (let i = 0; i < 4; i++) {
      await prisma.aircraft.create({
        data: { ...ac, seatMapConfig: { rows: 30, cols: 6, exitRows: [12, 24] } },
      });
    }
  }
  console.log(`✅ Seeded aircraft`);

  // ===== 5. Flights + FareClasses + Seats =====
  console.log('🛫 Seeding flights...');

  // ===== 6. Destinations + Tours =====
  console.log('🗺️ Seeding destinations and tours...');
  for (const dest of tourDestinations) {
    await prisma.destination.create({
      data: {
        ...dest,
        tags: ['popular', 'recommended'],
        description: `Khám phá ${dest.name} - điểm đến hấp dẫn với nhiều trải nghiệm độc đáo.`,
        coverImageUrl: `https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800`,
      },
    });
  }


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

  // ===== 10. Reviews =====
  console.log('⭐ Seeding reviews...');

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



  // ===== System Settings =====
  console.log('⚙️ Seeding system settings...');
  await prisma.systemSetting.upsert({
    where: { settingKey: 'ANCILLARY_OPTIONS' },
    update: {},
    create: {
      settingKey: 'ANCILLARY_OPTIONS',
      settingValue: JSON.stringify({
        baggage: [
          { weight: 15, price: 150000 },
          { weight: 20, price: 200000 },
          { weight: 25, price: 250000 },
          { weight: 30, price: 350000 }
        ],
        meals: [
          { id: 'm1', name: 'Mì Ý Sốt Bò Băm', price: 80000 },
          { id: 'm2', name: 'Cơm Gà Hải Nam', price: 90000 },
          { id: 'm3', name: 'Sandwich Kẹp Thịt', price: 50000 },
          { id: 'm4', name: 'Salad Rau Củ Trộn', price: 60000 }
        ],
        addons: [
          { id: 'wifi', name: 'Wi-Fi Trên Máy Bay', price: 100000 },
          { id: 'insurance', name: 'Bảo Hiểm Trễ Chuyến', price: 150000 },
          { id: 'lounge', name: 'Quyền Truy Cập Phòng Chờ', price: 300000 },
          { id: 'fast_track', name: 'Thủ Tục Nhanh', price: 250000 }
        ]
      }),
      isEncrypted: false,
    },
  });
  console.log('✅ Seeded system settings');


  console.log('\n🎉 Database seeding completed successfully!');
  console.log('='.repeat(50));
  console.log('📋 Test Accounts Created');
  console.log('='.repeat(50));
  console.log('📊 Seeded Data Summary:');
  console.log(`  Users: 2`);
  console.log(`  Airports: ${airports.length}`);
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
