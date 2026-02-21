"use client";

import Card from "@/components/ui/Card";

export default function ReviewPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review</h1>
        <p className="text-gray-500 mt-1">
          Review your past attempts and learn from mistakes
        </p>
      </div>

      <Card className="text-center py-12">
        <p className="text-gray-500">
          No attempts to review yet. Start practicing to see your history here.
        </p>
      </Card>
    </div>
  );
}
