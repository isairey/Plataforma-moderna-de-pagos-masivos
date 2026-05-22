"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, ChevronRight, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

export function AppHeader() {
  const pathname = usePathname()
  const isDashboard = pathname === "/dashboard"

  // Simple breadcrumb logic based on path
  const pathsegments = pathname.split("/").filter(Boolean)
  
  return (
    <header className="sticky top-0 z-30 flex h-[75px] w-full items-center justify-between border-b border-[#1F2937] bg-[#121827] px-4 md:px-8 transition-all duration-200">
      <div className="flex flex-1 items-center gap-4">
        <SidebarTrigger className="md:hidden text-gray-400" />
        {isDashboard ? (
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="h-10 w-full border-[#1F2937] bg-[#1F293780]/30 pl-10 text-white placeholder-gray-500 focus:border-[#00D98B] focus:ring-[#00D98B]/20"
            />
          </div>
        ) : (
          <Breadcrumb className="max-w-[200px] sm:max-w-none">
            <BreadcrumbList className="flex-nowrap overflow-hidden">
              <BreadcrumbItem className="hidden sm:inline-flex">
                <BreadcrumbLink href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:inline-flex text-gray-600" />
              {pathsegments.slice(1).map((segment, index) => {
                const href = `/${pathsegments.slice(0, index + 2).join("/")}`
                const isLast = index === pathsegments.length - 2
                const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ")

                // On mobile, only show the last segment if it's deep
                const showOnMobile = isLast || pathsegments.length <= 2

                return (
                  <React.Fragment key={href}>
                    <BreadcrumbItem className={cn(!showOnMobile && "hidden sm:inline-flex")}>
                      {isLast ? (
                        <BreadcrumbPage className="text-white font-medium truncate max-w-[120px] sm:max-w-none">
                          {title}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={href} className="text-gray-400 hover:text-white transition-colors truncate max-w-[100px] sm:max-w-none">
                          {title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator className={cn("text-gray-600", !showOnMobile && "hidden sm:inline-flex")} />}
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/docs"
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg border border-transparent hover:border-[#2d4a4f]"
        >
          Documentation
        </Link>

        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D98B] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00D98B]"></span>
          </span>
        </button>

        <div className="flex h-9 items-center rounded-full border border-[#1F2937] bg-[#1F293780]/30 px-4 py-1">
          <div className="mr-2 h-2 w-2 rounded-full bg-[#00D98B]"></div>
          <span className="text-sm font-medium text-white">Mainnet</span>
        </div>
      </div>
    </header>
  )
}
