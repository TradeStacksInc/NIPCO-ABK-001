"use client"

import { LayoutDashboard, FileText, Truck, Fuel, Users, FileSearch, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface FuelStationSidebarProps {
  onSalesReportClick?: () => void
  onDriverOffloadClick?: () => void
  onTankOffloadClick?: () => void
  onManageStaffClick?: () => void
  onSystemLogClick?: () => void
  onDashboardClick?: () => void
  currentView?: string
}

export function FuelStationSidebar({
  onSalesReportClick,
  onDriverOffloadClick,
  onTankOffloadClick,
  onManageStaffClick,
  onSystemLogClick,
  onDashboardClick,
  currentView = "dashboard",
}: FuelStationSidebarProps) {
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      onClick: onDashboardClick,
      isActive: currentView === "dashboard",
    },
    {
      title: "Sales Report",
      icon: FileText,
      onClick: onSalesReportClick,
      isActive: currentView === "sales",
    },
    {
      title: "Driver Offload",
      icon: Truck,
      onClick: onDriverOffloadClick,
      isActive: currentView === "driver-offload",
    },
    {
      title: "Tank Offload",
      icon: Fuel,
      onClick: onTankOffloadClick,
      isActive: currentView === "tank-offload",
    },
    {
      title: "Manage Staff",
      icon: Users,
      onClick: onManageStaffClick,
      isActive: currentView === "staff",
    },
    {
      title: "System Log",
      icon: FileSearch,
      onClick: onSystemLogClick,
      isActive: currentView === "system-log",
    },
  ]

  return (
    <Sidebar className="sidebar-modern">
      <SidebarHeader className="border-b border-gray-800/50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-lime-500 text-black shadow-lg animate-pulse-glow">
            <Fuel className="h-7 w-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-lime-400">NIPCO</span>
            <span className="text-xs text-lime-300 font-medium">UYO 1-002</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-transparent p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.isActive}
                    className={`sidebar-item transition-all duration-300 rounded-2xl h-12 font-medium cursor-pointer ${
                      item.isActive
                        ? "bg-lime-400 text-black hover:bg-lime-500"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                    }`}
                    onClick={item.onClick}
                  >
                    <div className="flex items-center gap-4 rounded-2xl px-4 py-3 w-full">
                      <div className={`p-2 rounded-xl ${item.isActive ? "bg-lime-600/30" : "bg-gray-700/50"}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-800/50 p-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-black rounded-2xl h-12 font-medium transition-all duration-300"
            >
              <div className="p-2 bg-gray-700/50 rounded-xl mr-4">
                <LogOut className="h-5 w-5" />
              </div>
              <span>Log Out</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail className="hover:bg-transparent after:hidden" />
    </Sidebar>
  )
}
