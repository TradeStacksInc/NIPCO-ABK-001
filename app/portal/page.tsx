"use client"
import {
  Bell,
  Fuel,
  AlertTriangle,
  ShoppingCart,
  Shield,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calculator,
  User,
  Phone,
  MapPin,
  Edit,
  Save,
  Upload,
  X,
  ArrowLeft,
} from "lucide-react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FuelStationSidebar } from "@/components/fuel-station-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SalesForm } from "@/components/sales-form"
import { DriverOffloadForm } from "@/components/driver-offload-form"
import { TankOffloadForm } from "@/components/tank-offload-form"
import { DatePicker } from "@/components/date-picker"
import { useState, useRef } from "react"
import { TotalSalesModal } from "@/components/total-sales-modal"
import { StaffPage } from "@/components/staff-page"
import { NotificationPage } from "@/components/notification-page"
import { SystemLogPage } from "@/components/system-log-page"
import { useRouter } from "next/navigation"

// Empty tanks with basic structure
const tankData = [
  {
    name: "Tank 1",
    fuel: "AGO",
    current: 0,
    capacity: 10000,
    percentage: 0,
    pricePerLiter: 830,
    status: "empty",
    lastOffload: "N/A",
    unitPrice: "NGN 830/L",
  },
  {
    name: "Tank 2",
    fuel: "PMS",
    current: 0,
    capacity: 10000,
    percentage: 0,
    pricePerLiter: 830,
    status: "empty",
    lastOffload: "N/A",
    unitPrice: "NGN 830/L",
  },
  {
    name: "Tank 3",
    fuel: "AGO",
    current: 0,
    capacity: 10000,
    percentage: 0,
    pricePerLiter: 830,
    status: "empty",
    lastOffload: "N/A",
    unitPrice: "NGN 830/L",
  },
  {
    name: "Tank 4",
    fuel: "PMS",
    current: 0,
    capacity: 10000,
    percentage: 0,
    pricePerLiter: 830,
    status: "empty",
    lastOffload: "N/A",
    unitPrice: "NGN 830/L",
  },
]

// Replace revenueData with empty object
const revenueData: Record<string, any> = {}

// Replace initialSalesHistory with empty array
const initialSalesHistory: any[] = []

function TankGauge({ tank }: { tank: (typeof tankData)[0] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
      case "low":
        return "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
      case "critical":
        return "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
      case "empty":
        return "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
      default:
        return "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="tank-gauge rounded-3xl p-6 animate-float group cursor-pointer">
            <div className="text-sm font-medium text-gray-400 mb-4 text-center">{tank.name}</div>
            <div className="relative w-16 h-48 bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-full overflow-hidden mx-auto border border-gray-700/50">
              <div
                className="absolute bottom-0 w-full transition-all duration-700 ease-out rounded-full"
                style={{
                  height: `${tank.percentage}%`,
                  background: getStatusColor(tank.status),
                  boxShadow: tank.percentage > 0 ? `0 0 20px rgba(16, 185, 129, 0.3)` : "none",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 rounded-full"></div>
            </div>
            <div className="text-center space-y-2 mt-4">
              <div className="text-xl font-bold text-gray-300">{tank.percentage}%</div>
              <div className="text-sm text-gray-400">{tank.current.toLocaleString()}L</div>
              <div className="text-xs text-gray-400 font-medium">{tank.fuel}</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Last: {tank.lastOffload}</div>
                <div>Cap: {tank.capacity.toLocaleString()}L</div>
                <div className="text-gray-400 font-medium">{tank.unitPrice}</div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="glass-card border-gray-700/50 text-white">
          <div className="text-sm">
            <p className="font-semibold text-gray-300">{tank.name}</p>
            <p>Fuel: {tank.fuel}</p>
            <p>Current: {tank.current.toLocaleString()}L</p>
            <p>Capacity: {tank.capacity.toLocaleString()}L</p>
            <p>Price: NGN {tank.pricePerLiter}/L</p>
            <p>Last Offload: {tank.lastOffload}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function FuelStationPortal() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFilter, setDateFilter] = useState("")
  const [shiftFilter, setShiftFilter] = useState("")
  const [revenueDateFilter, setRevenueDateFilter] = useState("")
  const [salesHistory, setSalesHistory] = useState(initialSalesHistory)
  const [showSalesForm, setShowSalesForm] = useState(false)
  const [showDriverOffloadForm, setShowDriverOffloadForm] = useState(false)
  const [showTankOffloadForm, setShowTankOffloadForm] = useState(false)
  const [showTotalSalesModal, setShowTotalSalesModal] = useState(false)
  const [isEditingManager, setIsEditingManager] = useState(false)
  const [managerPhoto, setManagerPhoto] = useState<string | null>(null)
  const [managerInfo, setManagerInfo] = useState({
    name: "Manager Name",
    phone: "+234 XXX XXX XXXX",
    address: "Station Address, City, State",
  })
  const [tempManagerInfo, setTempManagerInfo] = useState(managerInfo)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const itemsPerPage = 5
  const [currentView, setCurrentView] = useState<"dashboard" | "staff" | "notifications" | "system-log">("dashboard")
  const [staffList, setStaffList] = useState<any[]>([])

  const getRevenueData = () => {
    const selectedDate = revenueDateFilter || new Date().toISOString().split("T")[0]
    return revenueData[selectedDate] || { today: 0, week: 0, month: 0, margin: 0 }
  }

  // Filter sales history
  const filteredSalesHistory = salesHistory.filter((sale) => {
    const matchesDate = !dateFilter || sale.date === dateFilter
    const matchesShift = !shiftFilter || sale.shift === shiftFilter
    return matchesDate && matchesShift
  })

  // Paginate filtered results
  const totalPages = Math.ceil(filteredSalesHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSalesHistory = filteredSalesHistory.slice(startIndex, startIndex + itemsPerPage)

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const handleAddSale = (newSale: any) => {
    const saleWithId = {
      ...newSale,
      id: salesHistory.length + 1,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      status: "paid",
    }
    setSalesHistory([saleWithId, ...salesHistory])
    setShowSalesForm(false)
  }

  const handleDriverOffload = (offloadData: any) => {
    console.log("Driver Offload Recorded:", offloadData)
    setShowDriverOffloadForm(false)
  }

  const handleTankOffload = (offloadData: any) => {
    console.log("Tank Offload Completed:", offloadData)
    setShowTankOffloadForm(false)
  }

  const calculateRevenueFromSales = () => {
    const today = new Date().toISOString().split("T")[0]
    const todaySales = salesHistory.filter((sale) => sale.date === today)

    const morningTotal = todaySales
      .filter((sale) => sale.shift === "Morning")
      .reduce((sum, sale) => sum + sale.amount, 0)

    const afternoonTotal = todaySales
      .filter((sale) => sale.shift === "Afternoon")
      .reduce((sum, sale) => sum + sale.amount, 0)

    return {
      today: morningTotal + afternoonTotal,
      morning: morningTotal,
      afternoon: afternoonTotal,
    }
  }

  const realtimeRevenue = calculateRevenueFromSales()

  // Calculate expected revenue based on tank capacity and current prices
  const calculateExpectedRevenue = () => {
    const totalCapacity = tankData.reduce((sum, tank) => sum + tank.capacity, 0)
    const averagePrice = tankData.reduce((sum, tank) => sum + tank.pricePerLiter, 0) / tankData.length
    return totalCapacity * averagePrice
  }

  const expectedRevenue = calculateExpectedRevenue()
  const currentRevenue = realtimeRevenue.today
  const revenuePercentage = expectedRevenue > 0 ? Math.min((currentRevenue / expectedRevenue) * 100, 100) : 50

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setManagerPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditManager = () => {
    setTempManagerInfo(managerInfo)
    setIsEditingManager(true)
  }

  const handleSaveManager = () => {
    setManagerInfo(tempManagerInfo)
    setIsEditingManager(false)
  }

  const handleCancelEdit = () => {
    setTempManagerInfo(managerInfo)
    setIsEditingManager(false)
  }

  const handleStaffUpdate = (updatedStaff: any[]) => {
    setStaffList(updatedStaff)
  }

  // Navigation handlers
  const handleDashboardClick = () => {
    setCurrentView("dashboard")
  }

  const handleManageStaffClick = () => {
    setCurrentView("staff")
  }

  const handleNotificationsClick = () => {
    setCurrentView("notifications")
  }

  const handleSystemLogClick = () => {
    setCurrentView("system-log")
  }

  const handleSalesReportClick = () => {
    setShowSalesForm(true)
  }

  const handleDriverOffloadClick = () => {
    setShowDriverOffloadForm(true)
  }

  const handleTankOffloadClick = () => {
    setShowTankOffloadForm(true)
  }

  const handleBackToHome = () => {
    router.push("/home")
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "staff":
        return <StaffPage onStaffUpdate={handleStaffUpdate} />
      case "notifications":
        return <NotificationPage />
      case "system-log":
        return <SystemLogPage />
      default:
        return (
          <div className="flex-1 mobile-spacing md:space-y-8 md:p-6 min-h-screen">
            {/* Mobile-Optimized Manager Information Card */}
            <Card className="glass-card glass-card-hover rounded-2xl md:rounded-3xl border-gray-700/50 overflow-hidden">
              <CardContent className="mobile-card-spacing md:p-8">
                <div className="flex flex-col gap-4 md:gap-6">
                  {/* Mobile-optimized manager info */}
                  <div className="flex items-center gap-4 md:gap-6">
                    {/* Mobile-sized Image Placeholder with Upload */}
                    <div className="relative mobile-manager-image md:w-40 md:h-40 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl md:rounded-3xl border-2 border-gray-700/50 flex items-center justify-center overflow-hidden shimmer">
                      {managerPhoto ? (
                        <img
                          src={managerPhoto || "/placeholder.svg"}
                          alt="Manager"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 md:h-20 md:w-20 text-gray-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-1 md:p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-all duration-300"
                      >
                        <Upload className="h-3 w-3 md:h-4 md:w-4 text-gray-300" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Mobile-optimized Manager Details */}
                    <div className="space-y-2 md:space-y-4 flex-1">
                      {isEditingManager ? (
                        <>
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-gray-400/10 rounded-lg md:rounded-xl">
                              <User className="h-3 w-3 md:h-5 md:w-5 text-gray-400" />
                            </div>
                            <Input
                              value={tempManagerInfo.name}
                              onChange={(e) => setTempManagerInfo({ ...tempManagerInfo, name: e.target.value })}
                              className="text-sm md:text-xl font-semibold bg-gray-800/50 border-gray-700/50 text-gray-300"
                            />
                          </div>
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-green-400/10 rounded-lg md:rounded-xl">
                              <Phone className="h-3 w-3 md:h-5 md:w-5 text-green-400" />
                            </div>
                            <Input
                              value={tempManagerInfo.phone}
                              onChange={(e) => setTempManagerInfo({ ...tempManagerInfo, phone: e.target.value })}
                              className="text-xs md:text-base bg-gray-800/50 border-gray-700/50 text-gray-300"
                            />
                          </div>
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-blue-400/10 rounded-lg md:rounded-xl">
                              <MapPin className="h-3 w-3 md:h-5 md:w-5 text-blue-400" />
                            </div>
                            <Input
                              value={tempManagerInfo.address}
                              onChange={(e) => setTempManagerInfo({ ...tempManagerInfo, address: e.target.value })}
                              className="text-xs md:text-base bg-gray-800/50 border-gray-700/50 text-gray-300"
                            />
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={handleSaveManager}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="text-gray-400">
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-gray-400/10 rounded-lg md:rounded-xl">
                              <User className="h-3 w-3 md:h-5 md:w-5 text-gray-400" />
                            </div>
                            <span className="text-sm md:text-xl font-semibold text-gray-300">{managerInfo.name}</span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-green-400/10 rounded-lg md:rounded-xl">
                              <Phone className="h-3 w-3 md:h-5 md:w-5 text-green-400" />
                            </div>
                            <span className="text-xs md:text-base text-gray-300">{managerInfo.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-blue-400/10 rounded-lg md:rounded-xl">
                              <MapPin className="h-3 w-3 md:h-5 md:w-5 text-blue-400" />
                            </div>
                            <span className="text-xs md:text-base text-gray-300">{managerInfo.address}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleEditManager}
                            className="text-gray-400 hover:text-gray-300 mt-2"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Info
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mobile-optimized Pipe Gauge */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm md:text-lg font-semibold text-gray-300 flex items-center gap-2">
                        <span className="text-xs md:text-sm bg-gray-800/50 px-2 py-1 rounded-md border border-gray-700/50">
                          NGN
                        </span>
                        <span className="hidden sm:inline">Current Expected Revenue</span>
                        <span className="sm:hidden">Expected Revenue</span>
                      </h3>
                      <div className="text-right">
                        <p className="text-lg md:text-2xl font-bold text-gray-300">
                          NGN {expectedRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs md:text-sm text-gray-400">Full Capacity</p>
                      </div>
                    </div>

                    {/* Mobile-optimized Horizontal Pipe Gauge */}
                    <div className="pipe-gauge mobile-pipe-gauge md:h-12 rounded-xl md:rounded-2xl relative overflow-hidden">
                      <div
                        className="pipe-fill h-full rounded-xl md:rounded-2xl transition-all duration-1000 ease-out bg-gradient-to-r from-blue-400 to-blue-500"
                        style={{ width: `${revenuePercentage}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold text-xs md:text-sm mix-blend-difference">
                          <span className="hidden sm:inline">
                            NGN {currentRevenue.toLocaleString()} / NGN {expectedRevenue.toLocaleString()}
                          </span>
                          <span className="sm:hidden">{revenuePercentage.toFixed(1)}%</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                      <div className="text-center">
                        <p className="text-gray-400">Current</p>
                        <p className="text-blue-400 font-semibold text-xs md:text-base">
                          NGN {currentRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Progress</p>
                        <p className="text-gray-400 font-semibold text-xs md:text-base">
                          {revenuePercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Tanks</p>
                        <p className="text-blue-400 font-semibold text-xs md:text-base">4 Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tank Capacity Overview */}
            <Card className="glass-card glass-card-hover rounded-3xl border-gray-700/50">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-gray-400 text-xl">
                  <div className="p-2 bg-gray-400/10 rounded-xl">
                    <Fuel className="h-6 w-6" />
                  </div>
                  Total Tank Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {tankData.map((tank, index) => (
                    <div key={tank.name} style={{ animationDelay: `${index * 0.1}s` }}>
                      <TankGauge tank={tank} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mobile-Optimized Alerts and Revenue Row */}
            <div className="grid gap-4 md:gap-8 md:grid-cols-2">
              <Card className="glass-card glass-card-hover rounded-2xl md:rounded-3xl border-gray-700/50">
                <CardHeader className="mobile-card-spacing md:pb-6">
                  <CardTitle className="mobile-card-title md:text-xl flex items-center gap-2 md:gap-3 text-red-400">
                    <div className="p-1.5 md:p-2 bg-red-400/10 rounded-lg md:rounded-xl">
                      <AlertTriangle className="h-4 w-4 md:h-6 md:w-6" />
                    </div>
                    Real-time Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="mobile-card-spacing md:p-6 space-y-3 md:space-y-4">
                  <div className="mobile-alert alert-modern alert-warning rounded-xl md:rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-orange-300 font-medium text-sm md:text-base">All Tanks Empty</span>
                      </div>
                      <Badge className="badge-modern bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                        WARNING
                      </Badge>
                    </div>
                  </div>
                  <div className="mobile-alert alert-modern alert-success rounded-xl md:rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                        <span className="text-green-300 font-medium text-sm md:text-base">System Ready</span>
                      </div>
                      <Badge className="badge-modern bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        ONLINE
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover rounded-2xl md:rounded-3xl border-gray-700/50">
                <CardHeader className="mobile-card-spacing md:pb-6">
                  <div className="mobile-card-header md:flex-row md:items-center md:justify-between">
                    <CardTitle className="mobile-card-title md:text-xl flex items-center gap-2 md:gap-3 text-blue-400">
                      <div className="p-1.5 md:p-2 bg-blue-400/10 rounded-lg md:rounded-xl">
                        <span className="text-xs md:text-sm bg-blue-400/20 px-2 py-1 rounded-md border border-blue-400/30 text-blue-400">
                          NGN
                        </span>
                      </div>
                      Revenue Overview
                    </CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <DatePicker
                              value={revenueDateFilter}
                              onChange={setRevenueDateFilter}
                              placeholder="Select revenue date"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="glass-card border-gray-700/50 text-white">
                          <p>Filter revenue by date</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="mobile-card-spacing md:p-6">
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center p-3 md:p-4 bg-gradient-to-r from-gray-400/5 to-gray-400/10 rounded-xl md:rounded-2xl border border-gray-400/20">
                      <span className="text-gray-300 font-medium text-sm md:text-base">Today's Revenue</span>
                      <span className="font-bold text-xl md:text-3xl text-gray-300">
                        NGN {realtimeRevenue.today.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="p-3 md:p-4 bg-gradient-to-br from-blue-400/5 to-blue-400/10 rounded-xl md:rounded-2xl border border-blue-400/20">
                        <span className="text-gray-300 text-xs md:text-sm">Morning Shift</span>
                        <p className="font-bold text-sm md:text-lg text-blue-400">
                          NGN {realtimeRevenue.morning.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 md:p-4 bg-gradient-to-br from-blue-400/5 to-blue-400/10 rounded-xl md:rounded-2xl border border-blue-400/20">
                        <span className="text-gray-300 text-xs md:text-sm">Afternoon Shift</span>
                        <p className="font-bold text-sm md:text-lg text-blue-400">
                          NGN {realtimeRevenue.afternoon.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-sm pt-3 md:pt-4 border-t border-gray-700/50">
                      <span className="text-gray-400">Profit Margin</span>
                      <span className="text-blue-400 font-semibold">{getRevenueData().margin}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile-Optimized Sales History Table */}
            <Card className="glass-card glass-card-hover rounded-2xl md:rounded-3xl border-gray-700/50">
              <CardHeader className="mobile-card-spacing md:pb-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="mobile-card-title md:text-xl flex items-center gap-2 md:gap-3 text-gray-400">
                      <div className="p-1.5 md:p-2 bg-gray-400/10 rounded-lg md:rounded-xl">
                        <ShoppingCart className="h-4 w-4 md:h-6 md:w-6" />
                      </div>
                      Sales History
                    </CardTitle>
                    <div className="mobile-buttons-top-right md:flex md:gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowTotalSalesModal(true)}
                        className="mobile-btn bg-blue-500 text-black border-blue-500 hover:bg-blue-600 hover:border-blue-600 rounded-xl font-semibold"
                      >
                        <Calculator className="h-4 w-4 mr-2 text-black" />
                        <span className="hidden sm:inline">Total Sales</span>
                        <span className="sm:hidden">Total</span>
                      </Button>
                      <Button
                        className="mobile-btn bg-gray-400 text-black hover:bg-gray-500 rounded-xl font-semibold"
                        onClick={() => setShowSalesForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-2 text-black" />
                        <span className="hidden sm:inline">Register New Sale</span>
                        <span className="sm:hidden">New Sale</span>
                      </Button>
                    </div>
                  </div>

                  {/* Mobile-optimized Filters */}
                  <div className="mobile-filters md:flex-row md:flex-wrap md:gap-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="p-1.5 md:p-2 bg-gray-400/10 rounded-lg md:rounded-xl">
                        <Filter className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <DatePicker
                                value={dateFilter}
                                onChange={(date) => {
                                  setDateFilter(date)
                                  handleFilterChange()
                                }}
                                placeholder="Filter by date"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="glass-card border-gray-700/50 text-white">
                            <p>Filter sales by date</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      value={shiftFilter}
                      onValueChange={(value) => {
                        setShiftFilter(value)
                        handleFilterChange()
                      }}
                    >
                      <SelectTrigger className="glass-card border-gray-700/50 text-gray-300 rounded-xl h-10 md:h-auto md:w-40">
                        <SelectValue placeholder="Filter by shift" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-gray-700/50 rounded-xl">
                        <SelectItem value="all">All Shifts</SelectItem>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Afternoon">Afternoon</SelectItem>
                      </SelectContent>
                    </Select>
                    {(dateFilter || shiftFilter) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDateFilter("")
                          setShiftFilter("")
                          setCurrentPage(1)
                        }}
                        className="text-gray-400 hover:text-white hover:bg-gray-400/10 rounded-xl w-full md:w-auto"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mobile-card-spacing md:p-6">
                {paginatedSalesHistory.length > 0 ? (
                  <div className="mobile-table-container">
                    <Table className="mobile-table">
                      <TableHeader>
                        <TableRow className="border-gray-700/50">
                          <TableHead className="text-gray-400 font-semibold text-xs md:text-sm">Staff</TableHead>
                          <TableHead className="text-gray-400 font-semibold text-xs md:text-sm hidden sm:table-cell">
                            Tank
                          </TableHead>
                          <TableHead className="text-gray-400 font-semibold text-xs md:text-sm hidden md:table-cell">
                            Dispenser
                          </TableHead>
                          <TableHead className="text-gray-400 font-semibold text-xs md:text-sm hidden md:table-cell">
                            Nozzle
                          </TableHead>
                          <TableHead className="text-gray-400 font-semibold text-xs md:text-sm">Amount</TableHead>
                          <TableHead className="text-gray-400 font-semibold text-xs md:text-sm">Shift</TableHead>
                          <TableHead className="text-gray-400 font-semibold text-xs md:text-sm">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedSalesHistory.map((sale) => (
                          <TableRow key={sale.id} className="table-row-modern">
                            <TableCell className="text-gray-300 font-medium text-xs md:text-sm">
                              {sale.attendant.split(" ")[0]}
                            </TableCell>
                            <TableCell className="text-gray-300 text-xs md:text-sm hidden sm:table-cell">
                              {sale.tank}
                            </TableCell>
                            <TableCell className="text-gray-300 text-xs md:text-sm hidden md:table-cell">
                              {sale.dispenser}
                            </TableCell>
                            <TableCell className="text-gray-300 text-xs md:text-sm hidden md:table-cell">
                              {sale.nozzle}
                            </TableCell>
                            <TableCell className="text-gray-300 font-semibold text-xs md:text-sm">
                              NGN {sale.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <Badge
                                className={`mobile-status badge-modern ${
                                  sale.shift === "Morning"
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                    : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                                }`}
                              >
                                {sale.shift.substring(0, 3)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`mobile-status badge-modern ${
                                  sale.status === "paid"
                                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                                    : "bg-red-500/20 text-red-300 border-red-500/30"
                                }`}
                              >
                                {sale.status === "paid" ? "✓" : "✗"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 md:h-48 text-gray-400">
                    <div className="text-center">
                      <div className="p-3 md:p-4 bg-gray-400/5 rounded-2xl inline-block mb-3 md:mb-4">
                        <ShoppingCart className="h-8 w-8 md:h-16 md:w-16 opacity-50" />
                      </div>
                      <p className="text-sm md:text-lg font-medium text-gray-300">No sales records found</p>
                      <p className="text-xs md:text-sm text-gray-300">Start by registering your first sale</p>
                    </div>
                  </div>
                )}

                {/* Mobile-optimized Pagination */}
                <div className="mobile-pagination md:flex-row md:items-center md:justify-between mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-700/50">
                  <div className="mobile-pagination-info md:text-sm text-gray-400">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSalesHistory.length)} of{" "}
                    {filteredSalesHistory.length} entries
                  </div>
                  <div className="mobile-pagination-controls flex items-center gap-1 md:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="text-gray-400 hover:text-white disabled:opacity-50 rounded-xl flex-1 md:flex-initial"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + Math.max(1, currentPage - 2)
                        return page <= totalPages ? (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              currentPage === page
                                ? "bg-gradient-to-r from-blue-400 to-blue-500 text-black hover:from-blue-500 hover:to-blue-600 rounded-xl min-w-[32px]"
                                : "text-gray-400 hover:text-white rounded-xl min-w-[32px]"
                            }
                          >
                            {page}
                          </Button>
                        ) : null
                      })}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="text-gray-400 hover:text-white disabled:opacity-50 rounded-xl flex-1 md:flex-initial"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <FuelStationSidebar
        onSalesReportClick={handleSalesReportClick}
        onDriverOffloadClick={handleDriverOffloadClick}
        onTankOffloadClick={handleTankOffloadClick}
        onManageStaffClick={handleManageStaffClick}
        onSystemLogClick={handleSystemLogClick}
        onDashboardClick={handleDashboardClick}
        currentView={currentView}
      />
      <SidebarInset>
        {/* Mobile-Optimized Top Bar */}
        <header className="header-modern mobile-header flex shrink-0 items-center gap-2 px-4 md:px-6 md:h-20">
          <SidebarTrigger className="mobile-sidebar-trigger -ml-1 text-gray-400 hover:bg-gray-400/10 rounded-xl transition-all duration-300 md:w-auto md:h-auto" />
          <Separator orientation="vertical" className="mr-2 h-4 md:h-6 bg-gray-700/50" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Portal</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div>
                <h1 className="mobile-title md:text-2xl font-bold text-blue-400">NIPCO ABK-001</h1>
                <p className="mobile-subtitle md:text-sm text-gray-400 font-medium hidden sm:block">
                  Fuel Station Management Portal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationsClick}
                className="touch-target text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 relative rounded-xl transition-all duration-300 animate-pulse-glow"
              >
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 md:h-3 md:w-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse"></span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="touch-target text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300 hidden sm:flex"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {renderCurrentView()}

        {/* Forms */}
        <SalesForm open={showSalesForm} onClose={() => setShowSalesForm(false)} onSubmit={handleAddSale} />
        <DriverOffloadForm
          open={showDriverOffloadForm}
          onClose={() => setShowDriverOffloadForm(false)}
          onSubmit={handleDriverOffload}
        />
        <TankOffloadForm
          open={showTankOffloadForm}
          onClose={() => setShowTankOffloadForm(false)}
          onSubmit={handleTankOffload}
        />
        <TotalSalesModal
          open={showTotalSalesModal}
          onClose={() => setShowTotalSalesModal(false)}
          salesHistory={salesHistory}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
