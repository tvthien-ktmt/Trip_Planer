const fs = require('fs');

let lines = fs.readFileSync('prisma/seed.ts', 'utf-8').split('\n');

// Ranges to remove (1-indexed based on my previous view, but here we work 0-indexed)
const removes = [
  [254, 289], // 97 random users
  [317, 394], // 200 flights
  [411, 459], // 100 tours
  [480, 496], // 42 vouchers
  [515, 589], // 500 bookings
  [593, 620], // 300 reviews
  [647, 674], // blog posts
  [676, 700]  // activity logs
];

// Sort descending so splicing doesn't affect earlier indices
removes.sort((a, b) => b[0] - a[0]);

for (const [start, end] of removes) {
  lines.splice(start - 1, end - start + 1);
}

// Find line for '🎉 Database seeding completed successfully!'
const insertIdx = lines.findIndex(l => l.includes('Database seeding completed successfully!')) - 1;

const systemSettingsCode = `
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
`;

lines.splice(insertIdx, 0, systemSettingsCode);

// Also remove variables that will be unused to avoid TS errors
const toRemoveVars = [
  'const createdAircraft: any[] = [];',
  'const createdDestinations: any[] = [];',
  'const regularUsers: any[] = [demoUser];',
  'const createdFlights: any[] = [];',
  'const createdTours: any[] = [];',
  'let bookingCount = 0;'
];

lines = lines.filter(l => !toRemoveVars.some(v => l.includes(v)));

fs.writeFileSync('prisma/seed.ts', lines.join('\n'));
console.log('Done modifying seed.ts');
