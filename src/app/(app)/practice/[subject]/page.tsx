"use client";

import { use } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

export default function SubjectPracticePage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = use(params);
  const subjectName = subject
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div>
      <Link
        href="/practice"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <HiArrowLeft className="w-4 h-4" />
        Back to subjects
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{subjectName}</h1>
        <p className="text-gray-500 mt-1">Select a topic or start a random practice session</p>
      </div>

      <Card className="text-center py-12">
        <p className="text-gray-500 mb-4">
          Questions will be loaded here once you provide the full feature spec and content.
        </p>
        <Button variant="outline" disabled>
          Start Practice (Coming Soon)
        </Button>
      </Card>
    </div>
  );
}
