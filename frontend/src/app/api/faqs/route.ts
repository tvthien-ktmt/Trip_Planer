import { NextResponse } from 'next/server';

const mockFaqs = [
  {
    id: "1",
    question: "Làm thế nào để đặt vé máy bay?",
    answer: "Bạn có thể tìm kiếm chuyến bay trên trang chủ, chọn chuyến bay phù hợp và tiến hành thanh toán qua thẻ tín dụng hoặc chuyển khoản."
  },
  {
    id: "2",
    question: "Tôi có thể hoàn hủy vé không?",
    answer: "Chính sách hoàn hủy phụ thuộc vào hạng vé bạn mua. Vui lòng kiểm tra chi tiết tại phần Quản lý đặt chỗ."
  },
  {
    id: "3",
    question: "Hành lý ký gửi được tính thế nào?",
    answer: "Mỗi vé sẽ có tiêu chuẩn hành lý riêng. Bạn có thể mua thêm hành lý trong quá trình đặt vé hoặc sau khi đặt vé."
  }
];

export async function GET() {
  return NextResponse.json(mockFaqs);
}
