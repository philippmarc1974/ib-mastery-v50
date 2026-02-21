"use client";

import Card from "@/components/ui/Card";
import Link from "next/link";

const subjects = [
  { id: "mathematics", name: "Mathematics AA", level: "HL", group: 5, color: "blue" },
  { id: "physics", name: "Physics", level: "HL", group: 4, color: "purple" },
  { id: "chemistry", name: "Chemistry", level: "SL", group: 4, color: "green" },
  { id: "english-a", name: "English A", level: "HL", group: 1, color: "red" },
  { id: "economics", name: "Economics", level: "SL", group: 3, color: "amber" },
  { id: "spanish-b", name: "Spanish B", level: "SL", group: 2, color: "orange" },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  orange: "bg-orange-100 text-orange-700",
};

export default function PracticePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Practice</h1>
        <p className="text-gray-500 mt-1">Choose a subject to start practicing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Link key={subject.id} href={`/practice/${subject.id}`}>
            <Card hover>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                  <p className="text-sm text-gray-500">Group {subject.group}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${colorMap[subject.color]}`}
                >
                  {subject.level}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
