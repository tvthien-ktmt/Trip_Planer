'use client';
import { useState } from 'react';
import { useFaqQuery } from '../../hooks/queries';
import { Skeleton } from '../../components/common/Skeleton';
import { ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';
import Link from 'next/link';


export default function FAQ() {
  const { data: faqs, isLoading } = useFaqQuery();
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaqs = faqs?.filter((f: { question: string; answer: string }) => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Câu hỏi thường gặp</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm câu hỏi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm dark:text-white text-lg"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-12">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Không tìm thấy câu trả lời phù hợp.</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredFaqs.map((faq: { id: string; question: string; answer: string }) => (
                  <div key={faq.id}>
                    <button
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="font-semibold text-lg text-gray-900 dark:text-white">{faq.question}</span>
                      {openId === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {openId === faq.id && (
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white flex flex-col items-center">
          <MessageCircle className="w-12 h-12 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Vẫn cần hỗ trợ?</h2>
          <p className="mb-6 text-blue-100">Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng 24/7.</p>
          <Link href="/contact" className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
            Liên hệ ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
