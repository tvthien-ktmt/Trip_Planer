import { EmptyState } from '../../components/common/EmptyState';

export default function TravelGuide() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Cẩm nang du lịch</h1>
      <EmptyState 
        title="Đang cập nhật" 
        description="Nội dung cẩm nang đang được biên soạn. Vui lòng quay lại sau!" 
      />
    </div>
  );
}
