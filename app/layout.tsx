import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// Type is SF Pro + SF Mono (Bright UI v2, see globals.css): system fonts, SF Mono from public/fonts.

export const metadata: Metadata = {
  title: "Deploy Assistant",
  description: "The same chat built twice: bare useChat, then assistant-ui on the AI SDK v7.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="h-dvh">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
