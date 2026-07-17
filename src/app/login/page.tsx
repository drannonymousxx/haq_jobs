"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleSessionMountCheck } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    handleSessionMountCheck(router, (isAuthenticated) => {
      if (!isAuthenticated) {
        router.push("/signup?intent=login");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[#B63106]" />
      <p className="text-sm font-semibold text-brand-text-muted font-poppins">Checking authentication status...</p>
    </div>
  );
}

