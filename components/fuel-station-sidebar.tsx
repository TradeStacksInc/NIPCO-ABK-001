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
  stationName?: string
  stationColor?: string
  onSalesReportClick?: () => void
  onDriverOffloadClick?: () => void
  onTankOffloadClick?: () => void
  onManageStaffClick?: () => void
  onSystemLogClick?: () => void
  onDashboardClick?: () => void
  currentView?: string
}

export function FuelStationSidebar({
  stationName = "NIPCO Station",
  stationColor = "blue",
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
      isActive: currentView === "sales-report",
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

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return {
          primary: "text-green-400",
          bg: "bg-green-400",
          hover: "hover:bg-green-400/10 hover:text-green-300",
          active: "bg-green-400 text-black hover:bg-green-500",
          icon: "bg-green-600/30",
        }
      case "purple":
        return {
          primary: "text-purple-400",
          bg: "bg-purple-400",
          hover: "hover:bg-purple-400/10 hover:text-purple-300",
          active: "bg-purple-400 text-black hover:bg-purple-500",
          icon: "bg-purple-600/30",
        }
      case "orange":
        return {
          primary: "text-orange-400",
          bg: "bg-orange-400",
          hover: "hover:bg-orange-400/10 hover:text-orange-300",
          active: "bg-orange-400 text-black hover:bg-orange-500",
          icon: "bg-orange-600/30",
        }
      case "teal":
        return {
          primary: "text-teal-400",
          bg: "bg-teal-400",
          hover: "hover:bg-teal-400/10 hover:text-teal-300",
          active: "bg-teal-400 text-black hover:bg-teal-500",
          icon: "bg-teal-600/30",
        }
      default: // blue
        return {
          primary: "text-blue-400",
          bg: "bg-blue-400",
          hover: "hover:bg-blue-400/10 hover:text-blue-300",
          active: "bg-blue-400 text-black hover:bg-blue-500",
          icon: "bg-blue-600/30",
        }
    }
  }

  const colorClasses = getColorClasses(stationColor)

  return (
    <Sidebar className="sidebar-modern">
      <SidebarHeader className="border-b border-gray-800/50 p-6">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-${stationColor}-400 to-${stationColor}-500 text-black shadow-lg animate-pulse-glow`}
          >
            <Fuel className="h-7 w-7" />
          </div>
          <div className="flex flex-col">
            <span className={`text-xl font-bold ${colorClasses.primary}`}>NIPCO</span>
            <span className={`text-xs ${colorClasses.primary} font-medium`}>Fuel Station</span>
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
                      item.isActive ? colorClasses.active : `text-gray-400 ${colorClasses.hover}`
                    }`}
                    onClick={item.onClick}
                  >
                    <div className="flex items-center gap-4 rounded-2xl px-4 py-3 w-full">
                      <div className={`p-2 rounded-xl ${item.isActive ? colorClasses.icon : "bg-gray-700/50"}`}>
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
