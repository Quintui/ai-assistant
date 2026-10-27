import type * as React from "react";
import Link from "next/link";
import { ArrowUpRightIcon, ChevronsUpIcon } from "lucide-react";
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
      <SidebarHeader className="aui-sidebar-header h-12 justify-center border-b py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-9">
              <Link href="/">
                <div className="aui-sidebar-header-icon-wrapper bg-signal text-signal-foreground flex aspect-square size-6 items-center justify-center rounded-[5px] shadow-[0_0_14px] shadow-signal/35">
                  <ChevronsUpIcon className="aui-sidebar-header-icon size-4" strokeWidth={2.5} />
                </div>
                <span className="aui-sidebar-header-title text-[14px] font-semibold tracking-tight">
                  Deploy Assistant
                </span>
                <span className="text-muted-foreground ms-auto rounded border px-1 py-px font-mono text-[10px]">
                  v7
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="aui-sidebar-content px-2 pt-2">
        <ThreadList />
      </SidebarContent>
      {props.collapsible !== "none" && <SidebarRail />}
      <SidebarFooter className="aui-sidebar-footer border-t">
        <Link
          href="/demos"
          className="group text-muted-foreground hover:text-foreground hover:bg-sidebar-accent flex items-center justify-between rounded-md px-2 py-2 text-xs transition-colors"
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-foreground font-medium">Video demos</span>
            <span className="font-mono text-[11px]">useChat vs assistant-ui</span>
          </span>
          <ArrowUpRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
