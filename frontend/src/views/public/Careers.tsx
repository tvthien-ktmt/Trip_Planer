import { Briefcase } from 'lucide-react';

export default function Careers() {
  const jobs = [
    { title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'Hồ Chí Minh', type: 'Full-time' },
    { title: 'Product Manager', dept: 'Product', location: 'Hà Nội', type: 'Full-time' },
    { title: 'Customer Success Specialist', dept: 'Operations', location: 'Đà Nẵng', type: 'Full-time' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Tuyển dụng</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Gia nhập đội ngũ của chúng tôi để cùng nhau kiến tạo tương lai của ngành du lịch.</p>
      </div>

      <div className="space-y-4">
        {jobs.map((job, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-500 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{job.title}</h3>
                <p className="text-sm text-gray-500">{job.dept} • {job.location} • {job.type}</p>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl w-full md:w-auto transition-colors">
              Ứng tuyển
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
