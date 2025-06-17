"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SessionDebug() {
  const { data: session, status } = useSession();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-black/90 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-yellow-400">Session Debug</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>User Role:</strong> {session?.user?.role || "undefined"}
        </div>
        <div>
          <strong>User Name:</strong> {session?.user?.name || "undefined"}
        </div>
        <div>
          <strong>User Email:</strong> {session?.user?.email || "undefined"}
        </div>
        <div>
          <strong>Session exists:</strong> {session ? "Yes" : "No"}
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer text-yellow-400">Full Session</summary>
          <pre className="mt-1 text-xs overflow-auto max-h-32">
            {JSON.stringify(session, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}