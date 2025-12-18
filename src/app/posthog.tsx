"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      posthog.init("phc_AZVRPzibKcskelSLrjNY2VwuYIRHmHC9KRndUFfC1Di", {
        api_host: "https://us.i.posthog.com",
        person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
        defaults: "2025-11-30",
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
