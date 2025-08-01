"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Bell, Fuel, User, Phone, MapPin, ArrowLeft, LogOut, Plus, TrendingUp, Calendar, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FuelStationSidebar } from "@/components/fuel-station-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { StaffPage } from "@/components/staff-page"
import { NotificationPage } from "@/components/notification-page"
import { SystemLogPage } from "@/components/system-log-page"
import { SalesForm } from "@/components/sales-form"
import { DriverOffloadForm } from "@/components/driver-offload-form"
import { TankOffloadForm } from "@/components/tank-offload-form"
import { TotalSalesModal } from "@/components/total-sales-modal"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Target, Gauge } from "lucide-react"

const stationConfig = {
  name: "NIPCO IK-004",
  location: "Ikot Ekpene, Akwa Ibom State",
  stationId: "ik-004",
  color: "purple",
}

// Station-specific data storage
const stationData = {
  sales: [] as any[],
  staff: [] as any[],
  notifications: [] as any[],
  systemLogs: [] as any[],
  driverOffloads: [] as any[],
  tankOffloads: [] as any[],
  tanks: [
    { id: 1, name: "Tank 1 - PMS", capacity: 45000, current: 32000, type: "PMS" },
    { id: 2, name: "Tank 2 - AGO", capacity: 45000, current: 28000, type: "AGO" },
    { id: 3, name: "Tank 3 - DPK", capacity: 30000, current: 15000, type: "DPK" },
    { id: 4, name: "Tank 4 - PMS", capacity: 45000, current: 38000, type: "PMS" },
  ],
  alerts: [
    { id: 1, type: "warning", message: "Tank 3 - DPK level below 60%", time: "2 hours ago" },
    { id: 2, type: "info", message: "Daily sales target 75% achieved", time: "4 hours ago" },
  ],
}

export default function IK004Portal() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<
    "dashboard" | "staff" | "notifications" | "system-log" | "sales-report" | "driver-offload" | "tank-offload"
  >("dashboard")

  const [showSalesForm, setShowSalesForm] = useState(false)
  const [showDriverOffloadForm, setShowDriverOffloadForm] = useState(false)
  const [showTankOffloadForm, setShowTankOffloadForm] = useState(false)
  const [showTotalSalesModal, setShowTotalSalesModal] = useState(false)
  const [salesData, setSalesData] = useState(stationData.sales)

  const [managerInfo] = useState({
    name: "Manager Name",
    phone: "+234 XXX XXX XXXX",
    address: stationConfig.location,
  })

  const handleDashboardClick = () => setCurrentView("dashboard")
  const handleManageStaffClick = () => setCurrentView("staff")
  const handleNotificationsClick = () => setCurrentView("notifications")
  const handleSystemLogClick = () => setCurrentView("system-log")
  const handleSalesReportClick = () => setCurrentView("sales-report")
  const handleDriverOffloadClick = () => setCurrentView("driver-offload")
  const handleTankOffloadClick = () => setCurrentView("tank-offload")
  const handleBackToHome = () => router.push("/home")

  const handleSalesSubmit = (sale: any) => {
    const newSale = { ...sale, id: Date.now(), timestamp: new Date().toISOString() }
    setSalesData((prev) => [...prev, newSale])
    stationData.sales.push(newSale)
    setShowSalesForm(false)
  }

  const handleDriverOffloadSubmit = (offload: any) => {
    stationData.driverOffloads.push({ ...offload, timestamp: new Date().toISOString() })
    setShowDriverOffloadForm(false)
  }

  const handleTankOffloadSubmit = (offload: any) => {
    stationData.tankOffloads.push({ ...offload, timestamp: new Date().toISOString() })
    setShowTankOffloadForm(false)
  }

  const getTodaysSales = () => {
    const today = new Date().toDateString()
    return salesData.filter((sale) => new Date(sale.timestamp).toDateString() === today)
  }

  const getTotalSalesToday = () => {
    return getTodaysSales().reduce((total, sale) => total + sale.amount, 0)
  }

  const getTotalTankCapacity = () => {
    return stationData.tanks.reduce((total, tank) => total + tank.capacity, 0)
  }

  const getCurrentRevenue = () => {
    const target = 500000 // Daily target
    const current = getTotalSalesToday()
    const progress = (current / target) * 100
    return { current, target, progress: Math.min(progress, 100) }
  }

  const renderSalesReport = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">Sales Report</h1>
            <p className="text-gray-400 mt-2">Track and manage fuel sales transactions</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowTotalSalesModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Total Sales
            </Button>
            <Button
              onClick={() => setShowSalesForm(true)}
              className="bg-gradient-to-r from-purple-400 to-purple-500 text-black hover:from-purple-500 hover:to-purple-600 rounded-xl font-medium transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card border-gray-700/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Today's Sales</p>
                  <p className="text-2xl font-bold text-purple-400">₦{getTotalSalesToday().toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Transactions</p>
                  <p className="text-2xl font-bold text-purple-400">{getTodaysSales().length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Sales</p>
                  <p className="text-2xl font-bold text-purple-400">
                    ₦{salesData.reduce((total, sale) => total + sale.amount, 0).toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">All Transactions</p>
                  <p className="text-2xl font-bold text-purple-400">{salesData.length}</p>
                </div>
                <Fuel className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-gray-700/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-purple-400">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <div className="text-center py-8">
                <Fuel className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Sales Recorded</h3>
                <p className="text-gray-500">Start by recording your first fuel sale</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Attendant</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Tank</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Liters</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData
                      .slice(-10)
                      .reverse()
                      .map((sale, index) => (
                        <tr
                          key={sale.id}
                          className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? "bg-gray-900/20" : "bg-transparent"}`}
                        >
                          <td className="p-4 text-gray-300">{new Date(sale.timestamp).toLocaleDateString()}</td>
                          <td className="p-4 text-gray-300">{sale.attendant}</td>
                          <td className="p-4 text-gray-300">{sale.tank}</td>
                          <td className="p-4 text-purple-400 font-semibold">{sale.liters}L</td>
                          <td className="p-4 text-purple-400 font-semibold">₦{sale.amount.toLocaleString()}</td>
                          <td className="p-4 text-gray-300">{sale.shift}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderDriverOffloadPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">Driver Offload</h1>
            <p className="text-gray-400 mt-2">Record fuel deliveries from drivers</p>
          </div>
          <Button
            onClick={() => setShowDriverOffloadForm(true)}
            className="bg-gradient-to-r from-purple-400 to-purple-500 text-black hover:from-purple-500 hover:to-purple-600 rounded-xl font-medium transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Offload
          </Button>
        </div>

        <Card className="glass-card border-gray-700/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-purple-400">Recent Driver Offloads</CardTitle>
          </CardHeader>
          <CardContent>
            {stationData.driverOffloads.length === 0 ? (
              <div className="text-center py-8">
                <Fuel className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Offloads Recorded</h3>
                <p className="text-gray-500">Start by recording your first driver offload</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stationData.driverOffloads
                  .slice(-5)
                  .reverse()
                  .map((offload, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-purple-400">{offload.purchaseOrder}</h3>
                          <p className="text-gray-400">Driver: {offload.driverName}</p>
                          <p className="text-gray-400">Volume: {offload.volumeArrived}L</p>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(offload.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTankOffloadPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">Tank Offload</h1>
            <p className="text-gray-400 mt-2">Transfer fuel to storage tanks</p>
          </div>
          <Button
            onClick={() => setShowTankOffloadForm(true)}
            className="bg-gradient-to-r from-purple-400 to-purple-500 text-black hover:from-purple-500 hover:to-purple-600 rounded-xl font-medium transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tank Offload
          </Button>
        </div>

        <Card className="glass-card border-gray-700/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-purple-400">Recent Tank Offloads</CardTitle>
          </CardHeader>
          <CardContent>
            {stationData.tankOffloads.length === 0 ? (
              <div className="text-center py-8">
                <Fuel className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Tank Offloads</h3>
                <p className="text-gray-500">Start by recording your first tank offload</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stationData.tankOffloads
                  .slice(-5)
                  .reverse()
                  .map((offload, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-purple-400">{offload.purchaseOrder}</h3>
                          <p className="text-gray-400">Tank: {offload.selectedTank}</p>
                          <p className="text-gray-400">Volume: {offload.volumeOffloaded}L</p>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(offload.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case "staff":
        return <StaffPage onStaffUpdate={() => {}} />
      case "notifications":
        return <NotificationPage />
      case "system-log":
        return <SystemLogPage />
      case "sales-report":
        return renderSalesReport()
      case "driver-offload":
        return renderDriverOffloadPage()
      case "tank-offload":
        return renderTankOffloadPage()
      default:
        return (
          <div className="flex-1 space-y-8 p-6 min-h-screen">
            <Card className="glass-card glass-card-hover rounded-3xl border-gray-700/50 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="relative w-40 h-40 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl border-2 border-gray-700/50 flex items-center justify-center">
                    <User className="h-20 w-20 text-gray-500" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-400/10 rounded-xl">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <span className="text-xl font-semibold text-gray-300">{managerInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-400/10 rounded-xl">
                        <Phone className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="text-base text-gray-300">{managerInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-400/10 rounded-xl">
                        <MapPin className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="text-base text-gray-300">{managerInfo.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-400/10 rounded-xl">
                        <Target className="h-5 w-5 text-green-400" />
                      </div>
                      <span className="text-base text-gray-300">
                        Current Expected Revenue: ₦{getCurrentRevenue().current.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={getCurrentRevenue().progress} className="h-2 rounded-full" />
                    <p className="text-sm text-gray-400">
                      {getCurrentRevenue().progress}% of daily target (₦{getCurrentRevenue().target.toLocaleString()})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card rounded-2xl border-gray-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Today's Sales</p>
                      <p className="text-2xl font-bold text-purple-400">₦{getTotalSalesToday().toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-purple-400/10 rounded-xl">
                      <Fuel className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-2xl border-gray-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Tank Capacity</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {getTotalTankCapacity().toLocaleString()} Liters
                      </p>
                    </div>
                    <div className="p-3 bg-purple-400/10 rounded-xl">
                      <Gauge className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-2xl border-gray-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Notifications</p>
                      <p className="text-2xl font-bold text-purple-400">{stationData.notifications.length}</p>
                    </div>
                    <div className="p-3 bg-purple-400/10 rounded-xl">
                      <Bell className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card rounded-2xl border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-purple-400">Total Tank Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stationData.tanks.map((tank) => {
                    const percentage = (tank.current / tank.capacity) * 100
                    return (
                      <div key={tank.id} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-300">{tank.name}</h3>
                          <span className="text-xs text-purple-400">{tank.type}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{tank.current.toLocaleString()}L</span>
                            <span>{tank.capacity.toLocaleString()}L</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="text-center">
                            <span className="text-sm font-semibold text-purple-400">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-purple-400">Real-time Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {stationData.alerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/20 border border-gray-700/50"
                    >
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                      <div>
                        <p className="text-gray-400">{alert.message}</p>
                        <span className="text-xs text-gray-500">{alert.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-purple-400">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">Today's Target</p>
                    <p className="text-purple-400 font-semibold">₦{getCurrentRevenue().target.toLocaleString()}</p>
                  </div>
                  <Progress value={getCurrentRevenue().progress} className="h-2 rounded-full" />
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">Current Revenue</p>
                    <p className="text-purple-400 font-semibold">₦{getCurrentRevenue().current.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-purple-400">Sales History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-400">Recent Transactions</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowTotalSalesModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      View Total Sales
                    </Button>
                    <Button
                      onClick={() => setShowSalesForm(true)}
                      className="bg-gradient-to-r from-purple-400 to-purple-500 text-black hover:from-purple-500 hover:to-purple-600 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      Register New Sale
                    </Button>
                  </div>
                </div>
                {salesData.length === 0 ? (
                  <div className="text-center py-8">
                    <Fuel className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No Sales Recorded</h3>
                    <p className="text-gray-500">Start by recording your first fuel sale</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50 border-b border-gray-700">
                        <tr>
                          <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Attendant</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Tank</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Liters</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Shift</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData
                          .slice(-5)
                          .reverse()
                          .map((sale, index) => (
                            <tr
                              key={sale.id}
                              className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? "bg-gray-900/20" : "bg-transparent"}`}
                            >
                              <td className="p-4 text-gray-300">{new Date(sale.timestamp).toLocaleDateString()}</td>
                              <td className="p-4 text-gray-300">{sale.attendant}</td>
                              <td className="p-4 text-gray-300">{sale.tank}</td>
                              <td className="p-4 text-purple-400 font-semibold">{sale.liters}L</td>
                              <td className="p-4 text-purple-400 font-semibold">₦{sale.amount.toLocaleString()}</td>
                              <td className="p-4 text-gray-300">{sale.shift}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
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
                className="text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-purple-400">{stationConfig.name}</h1>
                <p className="text-sm text-gray-400 font-medium">Enterprise Fuel Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationsClick}
                className="text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 relative rounded-xl transition-all duration-300"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        {renderCurrentView()}
      </SidebarInset>

      {/* Modals */}
      <SalesForm open={showSalesForm} onClose={() => setShowSalesForm(false)} onSubmit={handleSalesSubmit} />

      <DriverOffloadForm
        open={showDriverOffloadForm}
        onClose={() => setShowDriverOffloadForm(false)}
        onSubmit={handleDriverOffloadSubmit}
      />

      <TankOffloadForm
        open={showTankOffloadForm}
        onClose={() => setShowTankOffloadForm(false)}
        onSubmit={handleTankOffloadSubmit}
      />

      <TotalSalesModal
        open={showTotalSalesModal}
        onClose={() => setShowTotalSalesModal(false)}
        salesHistory={salesData}
      />
    </SidebarProvider>
  )
}
