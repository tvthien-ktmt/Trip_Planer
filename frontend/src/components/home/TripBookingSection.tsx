'use client';
import { useState } from 'react';
import { MapPin, Calendar as CalendarIcon, Users, Search } from 'lucide-react';
import { Button } from '../ui/Button';

export const TripBookingSection = () => {
  const [activeTab, setActiveTab] = useState('hotel');

  const tabs = [
    { id: 'hotel', label: 'Hotel' },
    { id: 'flight', label: 'Flight' },
    { id: 'car', label: 'Car Rental' },
  ];

  return (
    <div className="relative -mt-24 z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-4 sm:p-8 shadow-2xl dark:shadow-gray-900/50 transition-custom border border-gray-100 dark:border-gray-700">
        
        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-lg font-bold pb-4 -mb-[17px] transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'text-primary border-primary' 
                  : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          
          {/* Location */}
          <div className="flex flex-col gap-1 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
            <label className="text-gray-500 font-medium text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location
            </label>
            <input 
              type="text" 
              placeholder="Where are you going?" 
              className="bg-transparent border-none text-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-0 placeholder:text-gray-400"
            />
          </div>

          {/* Check in */}
          <div className="flex flex-col gap-1 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
            <label className="text-gray-500 font-medium text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Check in
            </label>
            <input 
              type="text" 
              placeholder="Add date" 
              className="bg-transparent border-none text-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-0 placeholder:text-gray-400"
            />
          </div>

          {/* Check out */}
          <div className="flex flex-col gap-1 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
            <label className="text-gray-500 font-medium text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Check out
            </label>
            <input 
              type="text" 
              placeholder="Add date" 
              className="bg-transparent border-none text-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-0 placeholder:text-gray-400"
            />
          </div>

          {/* Travelers & Search Button */}
          <div className="flex items-center gap-4 p-3 pl-0">
            <div className="flex-1 flex flex-col gap-1 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
              <label className="text-gray-500 font-medium text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Travelers
              </label>
              <input 
                type="text" 
                placeholder="Add guests" 
                className="bg-transparent border-none text-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-0 placeholder:text-gray-400 w-full"
              />
            </div>
            <button className="w-16 h-16 shrink-0 bg-primary hover:bg-primary-hover text-white rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-primary/30">
              <Search className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
