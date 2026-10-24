import type * as React from "react";
import Link from "next/link";
import { MessagesSquare, PlayIcon } from "lucide-react";
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
      <SidebarHeader className="aui-sidebar-header mb-2 border-b">
        <div className="aui-sidebar-header-content flex items-center justify-between">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="aui-sidebar-header-icon-wrapper bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <MessagesSquare className="aui-sidebar-header-icon size-4" />
                  </div>
                  <div className="aui-sidebar-header-heading me-6 flex flex-col gap-0.5 leading-none">
                    <span className="aui-sidebar-header-title font-semibold">
                      Deploy Assistant
                    </span>
                    <span className="text-muted-foreground text-xs">
                      AI SDK v7 + assistant-ui
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarHeader>
      <SidebarContent className="aui-sidebar-content px-2">
        <ThreadList />
      </SidebarContent>
      {props.collapsible !== "none" && <SidebarRail />}
      <SidebarFooter className="aui-sidebar-footer border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/demos">
                <div className="aui-sidebar-footer-icon-wrapper bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <PlayIcon className="aui-sidebar-footer-icon size-4" />
                </div>
                <div className="aui-sidebar-footer-heading flex flex-col gap-0.5 leading-none">
                  <span className="aui-sidebar-footer-title font-semibold">
                    Video demos
                  </span>
                  <span>useChat vs assistant-ui</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
