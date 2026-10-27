import { ChatApp } from "@/components/chat-app";
import { Suspense } from "react";

export default function Home() {
  // ChatApp reads ?thread= with useSearchParams, which needs a Suspense boundary.
  return (
    <Suspense>
      <ChatApp />
    </Suspense>
  );
}
