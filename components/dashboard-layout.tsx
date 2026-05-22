"use client"

import * as React from "react"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#0B0F1A]">
        <AppSidebar />
        <SidebarInset className="flex flex-col bg-transparent">
          <AppHeader />
          <main className="flex-1 px-4 md:px-8 py-8">
            <div className="mx-auto w-full max-w-[1200px]">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
