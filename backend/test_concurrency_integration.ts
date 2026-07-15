import { PrismaClient } from './prisma/test-client';

const prisma = new PrismaClient();

async function runIntegrationTest() {
  console.log('--- STARTING CONCURRENCY INTEGRATION TEST (REAL SQLITE DB) ---');

  // Clean DB
  await prisma.flightSeat.deleteMany();

  const seat = await prisma.flightSeat.create({
    data: {
      status: 'AVAILABLE',
      version: 0
    }
  });

  console.log(`> Created test seat ID: ${seat.id} with version: 0`);

  // Simulate selectSeat Logic exactly as in BookingService (without mock)
  async function selectSeat(seatId: number, currentVersion: number, reqName: string) {
    try {
      // Simulate real-world network latency (0-50ms) to force a race condition
      await new Promise(r => setTimeout(r, Math.random() * 50));
      
      const result = await prisma.flightSeat.updateMany({
        where: { id: seatId, version: currentVersion, status: 'AVAILABLE' },
        data: { status: 'LOCKED', version: { increment: 1 } },
      });

      if (result.count === 0) {
        throw new Error('Ghế đã được người khác chọn, vui lòng chọn ghế khác');
      }

      return `${reqName}: THÀNH CÔNG`;
    } catch (e: any) {
      return `${reqName}: THẤT BẠI - ${e.message}`;
    }
  }

  // Concurrent Execution hitting the REAL SQLite Database engine
  console.log('\n> Bắn 2 request ĐỒNG THỜI (Promise.all) vào Database engine thật...');
  const p1 = selectSeat(seat.id, 0, 'Request 1');
  const p2 = selectSeat(seat.id, 0, 'Request 2');

  const results = await Promise.all([p1, p2]);

  console.log('\n--- KẾT QUẢ TEST TỪ REAL DATABASE ---');
  results.forEach(r => console.log(r));

  const successCount = results.filter(r => r.includes('THÀNH CÔNG')).length;
  const failCount = results.filter(r => r.includes('THẤT BẠI')).length;

  if (successCount === 1 && failCount === 1) {
    console.log('\n✅ INTEGRATION TEST PASSED: Database Engine đã xử lý chính xác!');
    console.log('   Chỉ 1 request được update thành công nhờ WHERE version = 0.');
    console.log('   Request còn lại bị engine DB từ chối do version lệch (count: 0).');
  } else {
    console.log('\n❌ INTEGRATION TEST FAILED: Locking did not work at DB level!');
  }
}

runIntegrationTest()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
  });
