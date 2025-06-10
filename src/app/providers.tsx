"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/lib/uploadthing";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <NextSSRPlugin
        /**
         * The `extractRouterConfig` will extract **only** the route configs
         * from the router to prevent additional information from being
         * leaked to the client.
         */
        routerConfig={extractRouterConfig(ourFileRouter)}
      />
      {children}
    </SessionProvider>
  );
}