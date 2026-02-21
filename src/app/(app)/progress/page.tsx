"use client";

import Card from "@/components/ui/Card";

export default function ProgressPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
        <p className="text-gray-500 mt-1">
          Track your improvement across all subjects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Score Trend</h3>
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            Chart will appear after you complete some practice sessions
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Subject Breakdown</h3>
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            Subject-by-subject stats will appear here
          </div>
        </Card>
      </div>
    </div>
  );
}
