'use client';
import { useState } from 'react';
import { useChecklistStore } from '../../stores';
import { CheckCircle2, Circle, Plus, Trash2, FolderPlus } from 'lucide-react';

import { ChecklistItem } from '../../types';

type TemplateItem = Omit<ChecklistItem, "id" | "isCompleted">;

const mockChecklistTemplates: { id: string; name: string; items: TemplateItem[] }[] = [
  { id: 'tpl-1', name: 'Đi biển', items: [
      { text: 'Đồ bơi', category: 'Luggage' },
      { text: 'Kem chống nắng', category: 'Health' },
      { text: 'Kính râm', category: 'Other' }
    ] 
  },
  { id: 'tpl-2', name: 'Leo núi', items: [
      { text: 'Giày leo núi', category: 'Luggage' },
      { text: 'Áo gió', category: 'Luggage' },
      { text: 'Bình nước', category: 'Other' }
    ] 
  },
  { id: 'tpl-3', name: 'Công tác', items: [
      { text: 'Laptop & Sạc', category: 'Other' },
      { text: 'Tài liệu', category: 'Documents' },
      { text: 'Trang phục lịch sự', category: 'Luggage' }
    ] 
  }
];

export default function Checklist() {
  const { items, toggleItem, addItem, removeItem, loadTemplate, clearChecklist } = useChecklistStore();
  const [tripId] = useState('default'); // Mock single trip for now
  const [newItemText, setNewItemText] = useState('');

  const tripItems = items[tripId] || [];
  const completedCount = tripItems.filter(i => i.isCompleted).length;
  const progress = tripItems.length === 0 ? 0 : Math.round((completedCount / tripItems.length) * 100);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    addItem(tripId, {
      id: `item-${crypto.randomUUID()}`,
      text: newItemText,
      isCompleted: false,
      category: 'Other'
    });
    setNewItemText('');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Checklist Hành Lý</h1>
          <p className="text-gray-500 dark:text-gray-400">Chuẩn bị kỹ lưỡng để chuyến đi trọn vẹn hơn. Không lo quên đồ!</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* Progress Bar */}
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-gray-900 dark:text-white">Tiến độ chuẩn bị</span>
              <span className="text-blue-600 font-bold text-lg">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
              {completedCount} / {tripItems.length} mục đã hoàn thành
            </div>
          </div>

          <div className="p-6">
            {/* Templates */}
            {tripItems.length === 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Gợi ý danh sách có sẵn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {mockChecklistTemplates.map(tpl => (
                    <button 
                      key={tpl.id}
                      onClick={() => loadTemplate(tripId, tpl.items)}
                      className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center group"
                    >
                      <FolderPlus className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700">{tpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* List */}
            {tripItems.length > 0 && (
              <div className="space-y-3 mb-6">
                {tripItems.map(item => (
                  <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${item.isCompleted ? 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 opacity-60' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm'}`}>
                    <label className="flex items-center gap-4 flex-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={item.isCompleted} 
                        onChange={() => toggleItem(tripId, item.id)}
                        className="hidden"
                      />
                      {item.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
                      <span className={`font-medium ${item.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {item.text}
                      </span>
                    </label>
                    <button 
                      onClick={() => removeItem(tripId, item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new */}
            <form onSubmit={handleAddItem} className="relative">
              <input 
                type="text" 
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Thêm món đồ cần mang..."
                className="w-full pl-4 pr-12 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              <button 
                type="submit" 
                disabled={!newItemText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            {tripItems.length > 0 && (
              <div className="mt-8 text-center">
                <button 
                  onClick={() => clearChecklist(tripId)}
                  className="text-sm text-red-500 font-medium hover:underline"
                >
                  Xóa tất cả danh sách
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
