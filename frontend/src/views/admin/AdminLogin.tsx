'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlaneTakeoff, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@tripplanner.com');
  const [password, setPassword] = useState('admin123');
  const { login } = useAuthStore();
  const navigate = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate admin login
    login({ id: '999', name: 'Super Admin', email: 'admin@tripplanner.com', role: 'Admin' }, 'fake-admin-jwt-token');
    navigate.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PlaneTakeoff className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white">Admin Portal</h1>
          <p className="text-gray-400 mt-2">Đăng nhập để quản lý hệ thống</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Admin</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required 
            />
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <Lock className="w-5 h-5" /> Đăng nhập hệ thống
          </button>
        </form>
      </div>
    </div>
  );
}
