"use client";

import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Link from "next/link";
import {
  HiOutlineBookOpen,
  HiOutlineChatAlt2,
  HiOutlineChartBar,
} from "react-icons/hi";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.displayName?.split(" ")[0] || "Marc"}
        </h1>
        <p className="text-gray-500 mt-1">
          IB 2026 — keep up the great work!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-sm text-gray-500 mt-1">Questions Practiced</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">—</p>
          <p className="text-sm text-gray-500 mt-1">Average Score</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-sm text-gray-500 mt-1">Study Streak (days)</p>
        </Card>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/practice">
          <Card hover>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <HiOutlineBookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Practice</p>
                <p className="text-sm text-gray-500">Start a practice session</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/ai-tutor">
          <Card hover>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <HiOutlineChatAlt2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">AI Tutor</p>
                <p className="text-sm text-gray-500">Get help with any topic</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/progress">
          <Card hover>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <HiOutlineChartBar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Progress</p>
                <p className="text-sm text-gray-500">View your stats</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
