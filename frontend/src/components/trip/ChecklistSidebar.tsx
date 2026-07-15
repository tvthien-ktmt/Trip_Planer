'use client';
import { useState } from 'react';
import { useChecklistStore } from '../../stores';
import { X, Check, Plus, Trash2 } from 'lucide-react';

export const ChecklistSidebar = () => {
  const { items, toggleItem, addItem, removeItem, isSidebarOpen, setSidebarOpen } = useChecklistStore();
  const [newItemText, setNewItemText] = useState('');
  
  // For simplicity, we use a global 'default' tripId for the general checklist
  const tripId = 'default';
  const checklist = items[tripId] || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    addItem(tripId, {
      id: `item-${Date.now()}`,
      category: 'Other',
      text: newItemText.trim(),
      isCompleted: false
    });
    setNewItemText('');
  };

  return (
    <>
      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Hành trang du lịch</h2>
            <p className="text-sm text-gray-500">Chuẩn bị kỹ lưỡng cho chuyến đi</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input 
              type="text" 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Thêm món đồ cần mang..."
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <button 
              type="submit"
              disabled={!newItemText.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {checklist.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Chưa có mục nào.</p>
              <p className="text-sm text-gray-400">Hãy thêm các vật dụng cần thiết nhé!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checklist.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors group ${
                    item.isCompleted 
                      ? 'bg-gray-50 border-transparent dark:bg-gray-800/50' 
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <button 
                    onClick={() => toggleItem(tripId, item.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.isCompleted ? 'bg-green-500 text-white' : 'border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                    }`}
                  >
                    {item.isCompleted && <Check className="w-4 h-4" />}
                  </button>
                  <span className={`flex-1 transition-all ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>
                    {item.text}
                  </span>
                  <button 
                    onClick={() => removeItem(tripId, item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
