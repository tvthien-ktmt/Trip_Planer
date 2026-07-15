export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8 text-center">Về Chúng Tôi</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Trip Planner OTA là nền tảng đặt vé máy bay và du lịch hàng đầu, mang đến cho bạn trải nghiệm đặt vé nhanh chóng, tiện lợi và an toàn nhất. Với hệ thống đối tác rộng lớn, chúng tôi cam kết mang lại mức giá tốt nhất cho mọi chuyến đi của bạn.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 my-12">
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <h3 className="text-3xl font-black text-blue-600 mb-2">1M+</h3>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Khách hàng tin dùng</p>
          </div>
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <h3 className="text-3xl font-black text-blue-600 mb-2">50+</h3>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Hãng hàng không đối tác</p>
          </div>
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <h3 className="text-3xl font-black text-blue-600 mb-2">24/7</h3>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Hỗ trợ khách hàng</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Tầm nhìn và Sứ mệnh</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Trở thành siêu ứng dụng du lịch số 1 tại khu vực, cung cấp các giải pháp di chuyển và lưu trú toàn diện chỉ với vài thao tác chạm. Sứ mệnh của chúng tôi là xóa bỏ mọi rào cản trong việc lên kế hoạch du lịch, giúp mỗi chuyến đi của bạn trở nên dễ dàng và đáng nhớ hơn.
        </p>
      </div>
    </div>
  );
}
