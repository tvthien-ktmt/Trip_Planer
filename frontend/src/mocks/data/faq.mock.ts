import { FAQItem } from '../../types';

export const mockFaqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Làm thế nào để tôi đặt tour trên Trip Planner?',
    answer: 'Bạn chỉ cần tìm kiếm điểm đến hoặc tour trên thanh công cụ, chọn tour ưng ý, chọn ngày và số lượng người, sau đó ấn "Đặt ngay" và hoàn thành các bước thanh toán trên trang Đặt chỗ.',
    category: 'Booking',
  },
  {
    id: 'faq-2',
    question: 'Trip Planner hỗ trợ những phương thức thanh toán nào?',
    answer: 'Chúng tôi hỗ trợ thanh toán qua Thẻ tín dụng/Ghi nợ (Visa, MasterCard, JCB), Chuyển khoản ngân hàng nội địa, và các Ví điện tử phổ biến như MoMo, ZaloPay.',
    category: 'Payment',
  },
  {
    id: 'faq-3',
    question: 'Chính sách hoàn hủy tour của công ty như thế nào?',
    answer: 'Tùy thuộc vào từng tour cụ thể sẽ có chính sách khác nhau. Thông thường bạn sẽ được miễn phí hủy nếu hủy trước 7 ngày. Bạn có thể xem chi tiết trong phần "Chính sách hủy" tại trang thông tin của mỗi tour.',
    category: 'Cancellation',
  },
  {
    id: 'faq-4',
    question: 'Tôi có thể thay đổi thông tin người đi sau khi đã đặt tour không?',
    answer: 'Có, bạn có thể thay đổi thông tin người tham gia miễn là thông báo cho chúng tôi trước thời điểm khởi hành 48 giờ. Vui lòng liên hệ Hotline để được hỗ trợ.',
    category: 'Account',
  },
  {
    id: 'faq-5',
    question: 'Làm thế nào để lấy hóa đơn điện tử VAT?',
    answer: 'Sau khi thanh toán thành công và hoàn thành tour, hóa đơn điện tử sẽ tự động được gửi vào email bạn đã dùng để đặt chỗ trong vòng 3-5 ngày làm việc.',
    category: 'Payment',
  },
];
