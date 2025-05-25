"use client"

import type React from "react"

import {
  Bell,
  Fuel,
  ShoppingCart,
  LogOut,
  User,
  Phone,
  MapPin,
  Upload,
  ArrowLeft,
  Target,
  Gauge,
  AlertTriangle,
} from "lucide-react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FuelStationSidebar } from "@/components/fuel-station-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SalesForm } from "@/components/sales-form"
import { DriverOffloadForm } from "@/components/driver-offload-form"
import { TankOffloadForm } from "@/components/tank-offload-form"
import { TotalSalesModal } from "@/components/total-sales-modal"
import { StaffPage } from "@/components/staff-page"
import { NotificationPage } from "@/components/notification-page"
import { SystemLogPage } from "@/components/system-log-page"

// Station configuration
const stationConfig = {
  name: "NIPCO UYO 1-002",
  location: "Uyo 1, Akwa Ibom State",
  color: "teal",
}

// Tank data for this station
const tankData = [
  {
    name: "Tank 1",
    fuel: "AGO",
    current: 25000,
    capacity: 45000,
    percentage: 56,
    pricePerLiter: 830,
    status: "normal",
    lastOffload: "2 days ago",
    unitPrice: "NGN 830/L",
  },
  {
    name: "Tank 2",
    fuel: "PMS",
    current: 38000,
    capacity: 45000,
    percentage: 84,
    pricePerLiter: 830,
    status: "normal",
    lastOffload: "1 day ago",
    unitPrice: "NGN 830/L",
  },
  {
    name: "Tank 3",
    fuel: "AGO",
    current: 12000,
    capacity: 30000,
    percentage: 40,
    pricePerLiter: 830,
    status: "low",
    lastOffload: "3 days ago",
    unitPrice: "NGN 830/L",
  },
  {
    name: "Tank 4",
    fuel: "PMS",
    current: 42000,
    capacity: 45000,
    percentage: 93,
    pricePerLiter: 830,
    status: "normal",
    lastOffload: "Today",
    unitPrice: "NGN 830/L",
  },
]

const stationData = {
  sales: [] as any[],
  staff: [] as any[],
  notifications: [] as any[],
  systemLogs: [] as any[],
  driverOffloads: [] as any[],
  tankOffloads: [] as any[],
  alerts: [
    { id: 1, type: "warning", message: "Tank 3 - AGO level below 50%", time: "1 hour ago" },
    { id: 2, type: "info", message: "Daily sales target 85% achieved", time: "3 hours ago" },
  ],
}

function TankGauge({ tank }: { tank: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "linear-gradient(135deg, #14b8a6 0%, #5eead4 100%)"
      case "low":
        return "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
      case "critical":
        return "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
      case "empty":
        return "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
      default:
        return "linear-gradient(135deg, #14b8a6 0%, #5eead4 100%)"
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
                  boxShadow: tank.percentage > 0 ? `0 0 20px rgba(20, 184, 166, 0.3)` : "none",
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

export default function UYO1002Portal() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFilter, setDateFilter] = useState("")
  const [shiftFilter, setShiftFilter] = useState("")
  const [revenueDateFilter, setRevenueDateFilter] = useState("")
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [showSalesForm, setShowSalesForm] = useState(false)
  const [showDriverOffloadForm, setShowDriverOffloadForm] = useState(false)
  const [showTankOffloadForm, setShowTankOffloadForm] = useState(false)
  const [showTotalSalesModal, setShowTotalSalesModal] = useState(false)
  const [isEditingManager, setIsEditingManager] = useState(false)
  const [managerPhoto, setManagerPhoto] = useState<string | null>(null)
  const [managerInfo, setManagerInfo] = useState({
    name: "Manager Name",
    phone: "+234 XXX XXX XXXX",
    address: stationConfig.location,
  })
  const [tempManagerInfo, setTempManagerInfo] = useState(managerInfo)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const itemsPerPage = 5
  const [currentView, setCurrentView] = useState<"dashboard" | "staff" | "notifications" | "system-log">("dashboard")
  const [staffList, setStaffList] = useState<any[]>([])

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
    console.log(`Driver Offload Recorded for ${stationConfig.name}:`, offloadData)
    setShowDriverOffloadForm(false)
  }

  const handleTankOffload = (offloadData: any) => {
    console.log(`Tank Offload Completed for ${stationConfig.name}:`, offloadData)
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

  const calculateExpectedRevenue = () => {
    const totalCapacity = tankData.reduce((sum, tank) => sum + tank.capacity, 0)
    const averagePrice = tankData.reduce((sum, tank) => sum + tank.pricePerLiter, 0) / tankData.length
    return totalCapacity * averagePrice
  }

  const expectedRevenue = calculateExpectedRevenue()
  const currentRevenue = realtimeRevenue.today
  const revenuePercentage = expectedRevenue > 0 ? Math.min((currentRevenue / expectedRevenue) * 100, 100) : 50

  const getCurrentRevenue = () => {
    const target = 500000 // Daily target
    const current = realtimeRevenue.today
    const progress = (current / target) * 100
    return { current, target, progress: Math.min(progress, 100) }
  }

  const getTotalTankCapacity = () => {
    return tankData.reduce((total, tank) => total + tank.capacity, 0)
  }

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

  const handleDashboardClick = () => setCurrentView("dashboard")
  const handleManageStaffClick = () => setCurrentView("staff")
  const handleNotificationsClick = () => setCurrentView("notifications")
  const handleSystemLogClick = () => setCurrentView("system-log")
  const handleSalesReportClick = () => setShowSalesForm(true)
  const handleDriverOffloadClick = () => setShowDriverOffloadForm(true)
  const handleTankOffloadClick = () => setShowTankOffloadForm(true)
  const handleBackToHome = () => router.push("/home")

  const renderCurrentView = () => {
    switch (currentView) {
      case "staff":
        return <StaffPage onStaffUpdate={handleStaffUpdate} />
      case "notifications":
        return <NotificationPage />
      case "system-log":
        return <SystemLogPage />
      default:
        const revenue = getCurrentRevenue()
        return (
          <div className="flex-1 space-y-8 p-6 min-h-screen">
            {/* Manager Information Card */}
            <Card className="glass-card glass-card-hover rounded-3xl border-gray-700/50 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative w-40 h-40 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl border-2 border-gray-700/50 flex items-center justify-center overflow-hidden shimmer">
                      {managerPhoto ? (
                        <img
                          src={managerPhoto || "/placeholder.svg"}
                          alt="Manager"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-20 w-20 text-gray-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-all duration-300"
                      >
                        <Upload className="h-4 w-4 text-gray-300" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-400/10 rounded-xl">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <span className="text-xl font-semibold text-gray-300">{managerInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-400/10 rounded-xl">
                          <Phone className="h-5 w-5 text-teal-400" />
                        </div>
                        <span className="text-base text-gray-300">{managerInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-400/10 rounded-xl">
                          <MapPin className="h-5 w-5 text-teal-400" />
                        </div>
                        <span className="text-base text-gray-300">{managerInfo.address}</span>
                      </div>
                    </div>

                    {/* Current Expected Revenue */}
                    <div className="bg-gray-800/30 rounded-2xl p-6 min-w-[280px]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-teal-400/10 rounded-xl">
                          <Target className="h-5 w-5 text-teal-400" />
                        </div>
                        <span className="text-lg font-semibold text-gray-300">Current Expected Revenue</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Current</span>
                          <span className="text-lg font-bold text-teal-400">₦{revenue.current.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Progress</span>
                            <span className="text-sm font-semibold text-teal-400">{revenue.progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={revenue.progress} className="h-2 bg-gray-700" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Tanks</span>
                          <span className="text-sm font-semibold text-teal-400">{tankData.length} Total</span>
                        </div>
                        <div className="text-xs text-gray-500">Target: ₦{revenue.target.toLocaleString()}</div>
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
                  <div className="p-2 bg-teal-400/10 rounded-xl">
                    <Fuel className="h-6 w-6 text-teal-400" />
                  </div>
                  Total Tank Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  {tankData.map((tank, index) => (
                    <div key={tank.name} style={{ animationDelay: `${index * 0.1}s` }}>
                      <TankGauge tank={tank} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="glass-card rounded-2xl border-gray-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Tank Capacity</p>
                      <p className="text-2xl font-bold text-teal-400">{getTotalTankCapacity().toLocaleString()}L</p>
                      <p className="text-xs text-gray-500 mt-1">Tanks: {tankData.length} Total</p>
                    </div>
                    <div className="p-3 bg-teal-400/10 rounded-xl">
                      <Gauge className="h-6 w-6 text-teal-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-2xl border-gray-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Today's Sales</p>
                      <p className="text-2xl font-bold text-teal-400">₦{realtimeRevenue.today.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-teal-400/10 rounded-xl">
                      <Fuel className="h-6 w-6 text-teal-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-2xl border-gray-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Staff</p>
                      <p className="text-2xl font-bold text-teal-400">{staffList.length}</p>
                    </div>
                    <div className="p-3 bg-teal-400/10 rounded-xl">
                      <User className="h-6 w-6 text-teal-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-2xl border-gray-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Notifications</p>
                      <p className="text-2xl font-bold text-teal-400">{stationData.notifications.length}</p>
                    </div>
                    <div className="p-3 bg-teal-400/10 rounded-xl">
                      <Bell className="h-6 w-6 text-teal-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Dashboard Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Alerts */}
              <Card className="glass-card border-gray-700/50 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-teal-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Real-time Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stationData.alerts.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No active alerts</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stationData.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-xl border ${
                            alert.type === "warning"
                              ? "bg-yellow-400/10 border-yellow-400/30"
                              : "bg-teal-400/10 border-teal-400/30"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-gray-300">{alert.message}</p>
                            <span className="text-xs text-gray-500">{alert.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Overview */}
              <Card className="glass-card border-gray-700/50 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-teal-400 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Today</span>
                      <span className="text-teal-400 font-semibold">₦{realtimeRevenue.today.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">This Week</span>
                      <span className="text-teal-400 font-semibold">
                        ₦{(realtimeRevenue.today * 7).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">This Month</span>
                      <span className="text-teal-400 font-semibold">
                        ₦{(realtimeRevenue.today * 30).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales History */}
            <Card className="glass-card border-gray-700/50 rounded-2xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-teal-400">Sales History</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowTotalSalesModal(true)}
                      variant="outline"
                      size="sm"
                      className="border-teal-400/30 text-teal-400 hover:bg-teal-400/10"
                    >
                      Total Sales
                    </Button>
                    <Button
                      onClick={() => setShowSalesForm(true)}
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Register New Sale
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {salesHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-500" />
                    <p className="text-lg font-medium text-gray-300">No sales records found</p>
                    <p className="text-sm text-gray-300">Start by registering your first sale</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {salesHistory
                      .slice(-5)
                      .reverse()
                      .map((sale, index) => (
                        <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                          <div>
                            <p className="text-gray-300 font-medium">{sale.attendant}</p>
                            <p className="text-sm text-gray-500">{sale.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-teal-400 font-semibold">₦{sale.amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{sale.liters}L</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <FuelStationSidebar
        stationName={stationConfig.name}
        stationColor={stationConfig.color}
        onSalesReportClick={handleSalesReportClick}
        onDriverOffloadClick={handleDriverOffloadClick}
        onTankOffloadClick={handleTankOffloadClick}
        onManageStaffClick={handleManageStaffClick}
        onSystemLogClick={handleSystemLogClick}
        onDashboardClick={handleDashboardClick}
        currentView={currentView}
      />
      <SidebarInset>
        <header className="header-modern flex shrink-0 items-center gap-2 px-6 h-20">
          <SidebarTrigger className="-ml-1 text-gray-400 hover:bg-gray-400/10 rounded-xl transition-all duration-300" />
          <Separator orientation="vertical" className="mr-2 h-6 bg-gray-700/50" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="text-gray-400 hover:text-teal-400 hover:bg-teal-400/10 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-teal-400">{stationConfig.name}</h1>
                <p className="text-sm text-gray-400 font-medium">Enterprise Fuel Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationsClick}
                className="text-gray-400 hover:text-teal-400 hover:bg-teal-400/10 relative rounded-xl transition-all duration-300 animate-pulse-glow"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse"></span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {renderCurrentView()}

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
