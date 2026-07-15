import { PrismaClient } from '@prisma/client';
import { BookingService } from './src/modules/booking/booking.service';
import { Queue } from 'bullmq';

const prisma = new PrismaClient();

async function runTest() {
  console.log('--- BẮT ĐẦU TEST CONCURRENCY (CHỌN GHẾ) ---');
  
  // 1. Setup dummy user
  const user = await prisma.user.create({
    data: {
      email: 'test_concurrency_' + Date.now() + '@example.com',
      passwordHash: 'dummy',
      fullName: 'Test User'
    }
  });

  // 2. Setup dummy data
  const airport = await prisma.airport.create({
    data: { iataCode: 'TST' + Date.now().toString().slice(-4), name: 'Test', city: 'Test', country: 'Test', timezone: 'UTC' }
  });
  
  const aircraft = await prisma.aircraft.create({
    data: { model: 'A320', manufacturer: 'Airbus', totalSeats: 180, seatMapConfig: {} }
  });

  const flight = await prisma.flight.create({
    data: {
      flightNumber: 'VN999',
      airlineName: 'Test Airline',
      aircraftId: aircraft.id,
      departureAirportId: airport.id,
      arrivalAirportId: airport.id,
      departureTime: new Date(),
      arrivalTime: new Date()
    }
  });

  const fareClass = await prisma.flightFareClass.create({
    data: { flightId: flight.id, className: 'ECONOMY', basePrice: 1000000, availableSeats: 100, baggageAllowanceKg: 7 }
  });

  const seat = await prisma.flightSeat.create({
    data: { flightId: flight.id, seatCode: '1A', fareClassId: fareClass.id, status: 'AVAILABLE', version: 0 }
  });

  // 3. Create Draft Booking
  const fakeQueue = {
    add: async () => {}
  } as unknown as Queue;

  const bookingService = new BookingService(prisma as any, fakeQueue);
  
  const booking = await bookingService.createDraftBooking(user.id, 'FLIGHT');

  console.log(`> Tạo thành công Ghế 1A (ID: ${seat.id}) với version = 0`);
  console.log(`> Tạo thành công Booking DRAFT (ID: ${booking.id})`);

  // 4. Simulate Concurrent Requests
  console.log('\n--- THỰC THI Promise.all 2 REQUEST ĐỒNG THỜI ---');
  
  // Cả 2 request đều thử lock cùng 1 ghế, truyền cùng 1 version hiện tại là 0
  const req1 = bookingService.selectSeat(booking.id, seat.id, 0)
    .then(() => 'Request 1: THÀNH CÔNG (Giữ ghế thành công)')
    .catch(e => `Request 1: THẤT BẠI - Lỗi: ${e.message}`);
    
  const req2 = bookingService.selectSeat(booking.id, seat.id, 0)
    .then(() => 'Request 2: THÀNH CÔNG (Giữ ghế thành công)')
    .catch(e => `Request 2: THẤT BẠI - Lỗi: ${e.message}`);

  const results = await Promise.all([req1, req2]);
  
  console.log('\n--- KẾT QUẢ TEST ---');
  results.forEach(res => console.log(res));

  const successCount = results.filter(r => r.includes('THÀNH CÔNG')).length;
  const failCount = results.filter(r => r.includes('THẤT BẠI')).length;

  if (successCount === 1 && failCount === 1) {
    console.log('\n✅ TEST PASSED: Concurrency (Optimistic Locking) hoạt động hoàn hảo!');
    console.log('   -> Request đến sau đã bị block thành công nhờ version mismatch.');
  } else {
    console.log('\n❌ TEST FAILED: Locking không hoạt động!');
  }
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
