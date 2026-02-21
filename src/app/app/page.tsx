"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Dynamically imported to avoid SSR issues with the 15k-line client component
import dynamic from "next/dynamic";

const IBApp = dynamic(
  () =>
    import("@/components/IBMasterySuite").then((mod) => {
      // Wrap in IBErrorBoundary inside the dynamic import
      const { IBMasterySuite, IBErrorBoundary } = mod as any;
      return function IBApp() {
        // Read the name injected by the page before render
        const name =
          typeof window !== "undefined"
            ? (window as any).__ibFirebaseName || ""
            : "";
        return (
          <IBErrorBoundary>
            <IBMasterySuite firebaseDisplayName={name} />
          </IBErrorBoundary>
        );
      };
    }),
  { ssr: false, loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )}
);

export default function AppPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (!loading && user) {
      // Inject Firebase displayName so IBMasterySuite can pre-fill the onboarding name
      const firstName = user.displayName?.split(" ")[0] || "";
      (window as any).__ibFirebaseName = firstName;
      setReady(true);
    }
  }, [user, loading, router]);

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return <IBApp />;
}
