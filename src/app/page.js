// src/app/page.js

'use-client';
import React from 'react';
import { 
  Package, 

  TrendingUp, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  RefreshCw 
} from 'lucide-react'; // Standard icons to keep it clean

export default function DashboardHome() {
  // Mock data - in production, fetch this from your database/API route
  const stats = [
    { label: 'Total Pairs in Stock', value: '1,248', icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Low Stock Alerts', value: '14', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: 'Monthly Turnover', value: '+18.5%', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
  ];

  const lowStockShoes = [
    { id: 1, name: 'Air Max 90', brand: 'Nike', size: '10.5', color: 'White/Black', remaining: 2 },
    { id: 2, name: 'Classic Leather', brand: 'Reebok', size: '9', color: 'White', remaining: 1 },
    { id: 3, name: 'Ultraboost Light', brand: 'Adidas', size: '11', color: 'Core Black', remaining: 3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 md:p-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KicksControl</h1>
          <p className="text-gray-500 mt-1">Welcome back. Here is your current inventory status.</p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition shadow-sm">
            <RefreshCw size={18} />
            <span>Sync Stock</span>
          </button>
          <button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm">
            <PlusCircle size={18} />
            <span>Add New Shoe</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Content Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Center: Quick Search & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Stock Lookup</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by shoe model, brand, SKU, or size..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
              />
            </div>
            
            {/* Filter tags for convenience */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200">Nike</span>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200">Adidas</span>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200">Jordan</span>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200">Running</span>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200">Basketball</span>
            </div>
          </div>

          {/* Place for a recent activity or general navigation links */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Stock Management Modules</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="/inventory" className="p-4 border border-gray-100 hover:border-black rounded-lg transition text-left group">
                <h3 className="font-medium group-hover:underline">View Full Inventory →</h3>
                <p className="text-sm text-gray-500 mt-1">Browse, filter, and edit your entire shoe catalog details.</p>
              </a>
              <a href="/intake" className="p-4 border border-gray-100 hover:border-black rounded-lg transition text-left group">
                <h3 className="font-medium group-hover:underline">Bulk Intake Log →</h3>
                <p className="text-sm text-gray-500 mt-1">Record new batch deliveries and update multiple sizes at once.</p>
              </a>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Critical Alerts */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <AlertTriangle className="text-amber-500" size={20} />
            <h2 className="text-lg font-semibold">Priority Restock Urgent</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {lowStockShoes.map((shoe) => (
              <div key={shoe.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-sm text-gray-900">{shoe.name}</h3>
                  <p className="text-xs text-gray-500">{shoe.brand} • Size {shoe.size} • {shoe.color}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded bg-rose-50 text-rose-700">
                    {shoe.remaining} left
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 text-center text-sm font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-lg border border-gray-200 transition">
            View All Low Stock
          </button>
        </div>

      </div>
    </div>
  );
}