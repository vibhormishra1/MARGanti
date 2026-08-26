"use client";

import React from "react";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function CommandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="command-layout-root">
      <AuthGuard>
        {children}
      </AuthGuard>
    </div>
  );
}
