"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell, Calendar } from "lucide-react";
import { QuickActions } from "./quick-actions";
import { StatsCards } from "./stats-cards";
import { PopularItems } from "./popular-items";

export function MobileDashboard() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  const stats = {
    borrowedItems: 2,
    pendingRequests: 1,
    recentlyReturned: 3,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        {showSearch ? (
          <div className="flex items-center p-4 space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาครุภัณฑ์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-0"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(false)}
            >
              ยกเลิก
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-ku-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KU</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">แดชบอร์ด</h1>
                <p className="text-xs text-gray-600">มหาวิทยาลัยเกษตรศาสตร์</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 pb-6 space-y-6">
        {/* Welcome Section */}
        <div className="pt-4">
          <div className="bg-gradient-to-r from-ku-green to-green-600 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">
              สวัสดี, {session?.user?.name?.split(' ')[0] || 'ผู้ใช้'}
            </h2>
            <p className="text-green-100 mb-4">
              ยินดีต้อนรับสู่ระบบเบิกจ่ายครุภัณฑ์ KU Asset
            </p>
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{new Date().toLocaleDateString('th-TH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Popular Items */}
        <PopularItems 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showSearch={showSearch}
          onToggleSearch={() => setShowSearch(!showSearch)}
        />
      </div>
    </div>
  );
}