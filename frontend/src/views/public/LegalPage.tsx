export default function LegalPage({ title }: { title: string }) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">{title}</h1>
      <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-6">
        <p>Cập nhật lần cuối: 20/10/2026</p>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Quy định chung</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Quyền và nghĩa vụ</h2>
        <p>
          Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Xử lý khiếu nại</h2>
        <p>
          Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.
        </p>
      </div>
    </div>
  );
}
