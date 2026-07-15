import { EmptyState } from '../../components/common/EmptyState';

export default function ThingsToDo() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Hoạt động & Trải nghiệm</h1>
      <EmptyState 
        title="Đang cập nhật" 
        description="Tính năng đang trong quá trình phát triển. Vui lòng quay lại sau!" 
      />
    </div>
  );
}
