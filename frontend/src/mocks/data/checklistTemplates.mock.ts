import { ChecklistTemplate } from '../../types';

export const mockChecklistTemplates: ChecklistTemplate[] = [
  {
    id: 'template-1',
    name: 'Du lịch trong nước cơ bản',
    items: [
      { text: 'CCCD/CMND', category: 'Documents' },
      { text: 'Vé máy bay/Tàu xe', category: 'Documents' },
      { text: 'Tiền mặt & Thẻ ATM', category: 'Finance' },
      { text: 'Quần áo phù hợp số ngày', category: 'Luggage' },
      { text: 'Đồ vệ sinh cá nhân', category: 'Luggage' },
      { text: 'Thuốc tiêu hóa, giảm đau', category: 'Health' },
      { text: 'Sạc điện thoại, sạc dự phòng', category: 'Other' },
    ],
  },
  {
    id: 'template-2',
    name: 'Du lịch Quốc tế',
    items: [
      { text: 'Hộ chiếu (còn hạn ít nhất 6 tháng)', category: 'Documents' },
      { text: 'Visa (nếu cần)', category: 'Documents' },
      { text: 'Bảo hiểm du lịch', category: 'Documents' },
      { text: 'Thẻ tín dụng quốc tế', category: 'Finance' },
      { text: 'Tiền ngoại tệ', category: 'Finance' },
      { text: 'Adapter ổ cắm quốc tế', category: 'Other' },
      { text: 'SIM du lịch/Cục phát Wifi', category: 'Other' },
      { text: 'Thuốc cá nhân chuyên dụng', category: 'Health' },
    ],
  },
  {
    id: 'template-3',
    name: 'Đi biển',
    items: [
      { text: 'Đồ bơi (2-3 bộ)', category: 'Luggage' },
      { text: 'Kem chống nắng', category: 'Health' },
      { text: 'Kính râm, Mũ rộng vành', category: 'Luggage' },
      { text: 'Dép xỏ ngón/Sandal', category: 'Luggage' },
      { text: 'Túi chống nước điện thoại', category: 'Other' },
      { text: 'Khăn tắm biển', category: 'Luggage' },
    ],
  },
];
