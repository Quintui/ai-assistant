import type * as React from "react";
import Link from "next/link";
import { ArrowUpRightIcon, ChevronsUpIcon, PlayIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThreadList } from "@/components/assistant-ui/elements/thread-list.aui";

export function ThreadListSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="aui-sidebar-header h-14 justify-center py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-9">
              <Link href="/">
                <ChevronsUpIcon className="aui-sidebar-header-icon text-ink size-[18px]" strokeWidth={1.9} />
                <span className="aui-sidebar-header-title text-[16px] font-semibold tracking-[-0.02em]">
                  Deploy Assistant
                </span>
                <span className="text-ink-3 ms-auto font-mono text-[13px]">v7</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="aui-sidebar-content px-2 pt-2">
        <ThreadList />
      </SidebarContent>
      {props.collapsible !== "none" && <SidebarRail />}
      <SidebarFooter className="aui-sidebar-footer border-line border-t">
        <Link
          href="/demos"
          className="group text-ink-2 hover:text-ink hover:bg-fill flex items-center gap-2.5 rounded-[8px] px-2 py-2 transition-colors"
        >
          <PlayIcon className="text-ink-2 size-4 shrink-0" strokeWidth={1.9} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-ink text-[15px] leading-5">Video demos</span>
            <span className="text-ink-2 text-[13px] leading-4">useChat vs assistant-ui</span>
          </span>
          <ArrowUpRightIcon className="text-ink-3 size-4" />
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
