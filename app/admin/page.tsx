"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Bell,
  Crown,
  Fuel,
  Users,
  AlertTriangle,
  DollarSign,
  BarChart3,
  MapPin,
  Clock,
  Plus,
  Package,
  Activity,
  Building,
  ServerCog,
  Store,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ModernDatePicker } from "@/components/modern-date-picker"

// Mock data for all stations
const stationsData = [
  {
    id: "abk-001",
    name: "NIPCO ABK-001",
    location: "Abak, Akwa Ibom State",
    manager: "John Doe",
    status: "Active",
    color: "blue",
    revenue: 2450000,
    expectedRevenue: 3000000,
    tanks: [
      { name: "Tank 1", fuel: "AGO", current: 8500, capacity: 10000, percentage: 85 },
      { name: "Tank 2", fuel: "PMS", current: 7200, capacity: 10000, percentage: 72 },
      { name: "Tank 3", fuel: "AGO", current: 6800, capacity: 10000, percentage: 68 },
      { name: "Tank 4", fuel: "PMS", current: 9100, capacity: 10000, percentage: 91 },
    ],
    staff: 12,
    lastActivity: "2 mins ago",
    alerts: 1,
  },
  {
    id: "uyo-1-002",
    name: "NIPCO Uyo 1-002",
    location: "Uyo, Akwa Ibom State",
    manager: "Jane Smith",
    status: "Active",
    color: "teal",
    revenue: 1890000,
    expectedRevenue: 2500000,
    tanks: [
      { name: "Tank 1", fuel: "AGO", current: 5400, capacity: 10000, percentage: 54 },
      { name: "Tank 2", fuel: "PMS", current: 8900, capacity: 10000, percentage: 89 },
      { name: "Tank 3", fuel: "AGO", current: 7600, capacity: 10000, percentage: 76 },
      { name: "Tank 4", fuel: "PMS", current: 4200, capacity: 10000, percentage: 42 },
    ],
    staff: 10,
    lastActivity: "5 mins ago",
    alerts: 2,
  },
  {
    id: "uyo-2-003",
    name: "NIPCO Uyo 2-003",
    location: "Uyo, Akwa Ibom State",
    manager: "Mike Johnson",
    status: "Active",
    color: "green",
    revenue: 2100000,
    expectedRevenue: 2800000,
    tanks: [
      { name: "Tank 1", fuel: "AGO", current: 1800, capacity: 10000, percentage: 18 }, // Low tank alert
      { name: "Tank 2", fuel: "PMS", current: 6700, capacity: 10000, percentage: 67 },
      { name: "Tank 3", fuel: "AGO", current: 800, capacity: 10000, percentage: 8 }, // Critical alert
      { name: "Tank 4", fuel: "PMS", current: 8400, capacity: 10000, percentage: 84 },
    ],
    staff: 11,
    lastActivity: "8 mins ago",
    alerts: 2,
  },
  {
    id: "ik-004",
    name: "NIPCO Ik-004",
    location: "Ikot Ekpene, Akwa Ibom State",
    manager: "Sarah Wilson",
    status: "Active",
    color: "purple",
    revenue: 1750000,
    expectedRevenue: 2200000,
    tanks: [
      { name: "Tank 1", fuel: "AGO", current: 4500, capacity: 10000, percentage: 45 },
      { name: "Tank 2", fuel: "PMS", current: 7800, capacity: 10000, percentage: 78 },
      { name: "Tank 3", fuel: "AGO", current: 6200, capacity: 10000, percentage: 62 },
      { name: "Tank 4", fuel: "PMS", current: 500, capacity: 10000, percentage: 5 }, // Critical alert
    ],
    staff: 9,
    lastActivity: "12 mins ago",
    alerts: 1,
  },
  {
    id: "ib-005",
    name: "NIPCO Ib-005",
    location: "Ibibio, Akwa Ibom State",
    manager: "David Brown",
    status: "Active",
    color: "orange",
    revenue: 2200000,
    expectedRevenue: 2900000,
    tanks: [
      { name: "Tank 1", fuel: "AGO", current: 8800, capacity: 10000, percentage: 88 },
      { name: "Tank 2", fuel: "PMS", current: 5600, capacity: 10000, percentage: 56 },
      { name: "Tank 3", fuel: "AGO", current: 7400, capacity: 10000, percentage: 74 },
      { name: "Tank 4", fuel: "PMS", current: 9300, capacity: 10000, percentage: 93 },
    ],
    staff: 13,
    lastActivity: "15 mins ago",
    alerts: 0,
  },
]

const mockNotifications = [
  {
    id: "1",
    stationId: "abk-001",
    stationName: "NIPCO ABK-001",
    type: "sale",
    title: "New Sale Recorded",
    message: "Sale of ₦45,000 recorded by John Attendant",
    timestamp: "2 mins ago",
    read: false,
  },
  {
    id: "2",
    stationId: "uyo-1-002",
    stationName: "NIPCO Uyo 1-002",
    type: "alert",
    title: "Low Tank Level",
    message: "Tank 4 PMS level below 50%",
    timestamp: "5 mins ago",
    read: false,
  },
  {
    id: "3",
    stationId: "ik-004",
    stationName: "NIPCO Ik-004",
    type: "offload",
    title: "Tank Offload Completed",
    message: "Tank 2 refilled with 8,000L PMS",
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: "4",
    stationId: "uyo-2-003",
    stationName: "NIPCO Uyo 2-003",
    type: "tank_alert",
    title: "🚨 Critical Tank Level",
    message: "Tank 3 AGO at 8% - Immediate refill required!",
    timestamp: "Just now",
    read: false,
  },
  {
    id: "5",
    stationId: "ik-004",
    stationName: "NIPCO Ik-004",
    type: "tank_alert",
    title: "🚨 Critical Tank Level",
    message: "Tank 4 PMS at 5% - Emergency refill needed!",
    timestamp: "2 mins ago",
    read: false,
  },
]

const mockPurchaseOrders = [
  {
    id: "PO-001",
    stationId: "abk-001",
    stationName: "NIPCO ABK-001",
    fuelType: "AGO",
    quantity: 40000,
    unitPrice: 830,
    totalValue: 33200000,
    status: "Pending",
    dateCreated: "2024-01-15",
    expectedDelivery: "2024-01-18",
  },
  {
    id: "PO-002",
    stationId: "uyo-1-002",
    stationName: "NIPCO Uyo 1-002",
    fuelType: "PMS",
    quantity: 30000,
    unitPrice: 830,
    totalValue: 24900000,
    status: "Delivered",
    dateCreated: "2024-01-14",
    expectedDelivery: "2024-01-17",
  },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [showCreatePO, setShowCreatePO] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedStation, setSelectedStation] = useState("")
  const [notifications, setNotifications] = useState(mockNotifications)
  const [purchaseOrders, setPurchaseOrders] = useState(mockPurchaseOrders)
  const [tankAlerts, setTankAlerts] = useState<any[]>([])
  const [newPO, setNewPO] = useState({
    stationId: "",
    fuelType: "",
    quantity: "",
    unitPrice: "830",
    expectedDelivery: "",
  })
  const [purchaseOrderDateFilter, setPurchaseOrderDateFilter] = useState("")

  // Tank monitoring system
  useEffect(() => {
    const checkTankLevels = () => {
      const alerts: any[] = []

      stationsData.forEach((station) => {
        station.tanks.forEach((tank) => {
          if (tank.percentage <= 5) {
            alerts.push({
              id: `${station.id}-${tank.name}-critical`,
              stationId: station.id,
              stationName: station.name,
              type: "tank_critical",
              title: "🚨 CRITICAL: Tank Almost Empty",
              message: `${tank.name} ${tank.fuel} at ${tank.percentage}% - Emergency refill required!`,
              timestamp: "Just now",
              read: false,
              severity: "critical",
            })
          } else if (tank.percentage <= 10) {
            alerts.push({
              id: `${station.id}-${tank.name}-low`,
              stationId: station.id,
              stationName: station.name,
              type: "tank_low",
              title: "⚠️ LOW: Tank Level Warning",
              message: `${tank.name} ${tank.fuel} at ${tank.percentage}% - Refill recommended`,
              timestamp: "Just now",
              read: false,
              severity: "high",
            })
          } else if (tank.percentage <= 20) {
            alerts.push({
              id: `${station.id}-${tank.name}-warning`,
              stationId: station.id,
              stationName: station.name,
              type: "tank_warning",
              title: "⚡ WARNING: Tank Level Low",
              message: `${tank.name} ${tank.fuel} at ${tank.percentage}% - Monitor closely`,
              timestamp: "Just now",
              read: false,
              severity: "medium",
            })
          }
        })
      })

      setTankAlerts(alerts)

      // Add new alerts to notifications
      const newAlerts = alerts.filter((alert) => !notifications.some((notif) => notif.id === alert.id))

      if (newAlerts.length > 0) {
        setNotifications((prev) => [...newAlerts, ...prev])
      }
    }

    // Check tank levels immediately and then every 30 seconds
    checkTankLevels()
    const interval = setInterval(checkTankLevels, 30000)

    return () => clearInterval(interval)
  }, [notifications])

  // Calculate totals
  const totalRevenue = stationsData.reduce((sum, station) => sum + station.revenue, 0)
  const totalExpectedRevenue = stationsData.reduce((sum, station) => sum + station.expectedRevenue, 0)
  const totalStaff = stationsData.reduce((sum, station) => sum + station.staff, 0)
  const totalAlerts = stationsData.reduce((sum, station) => sum + station.alerts, 0) + tankAlerts.length
  const revenueProgress = (totalRevenue / totalExpectedRevenue) * 100
  const totalStations = stationsData.length
  const activePortals = 5

  const handleCreatePO = () => {
    const station = stationsData.find((s) => s.id === newPO.stationId)
    if (!station) return

    const totalValue = Number.parseInt(newPO.quantity) * Number.parseInt(newPO.unitPrice)
    const po = {
      id: `PO-${String(purchaseOrders.length + 1).padStart(3, "0")}`,
      stationId: newPO.stationId,
      stationName: station.name,
      fuelType: newPO.fuelType,
      quantity: Number.parseInt(newPO.quantity),
      unitPrice: Number.parseInt(newPO.unitPrice),
      totalValue,
      status: "Pending",
      dateCreated: new Date().toISOString().split("T")[0],
      expectedDelivery: newPO.expectedDelivery,
    }

    setPurchaseOrders([po, ...purchaseOrders])
    setNewPO({
      stationId: "",
      fuelType: "",
      quantity: "",
      unitPrice: "830",
      expectedDelivery: "",
    })
    setShowCreatePO(false)

    const notification = {
      id: String(notifications.length + 1),
      stationId: newPO.stationId,
      stationName: station.name,
      type: "purchase_order",
      title: "New Purchase Order",
      message: `Purchase order ${po.id} created for ${newPO.quantity}L ${newPO.fuelType}`,
      timestamp: "Just now",
      read: false,
    }
    setNotifications([notification, ...notifications])
  }

  const handleStationClick = (stationId: string) => {
    router.push(`/admin/sales-analysis/${stationId}`)
  }

  const getStationColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "text-blue-400",
      teal: "text-teal-400",
      green: "text-green-400",
      purple: "text-purple-400",
      orange: "text-orange-400",
    }
    return colorMap[color] || "text-blue-400"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Delivered":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTankAlertColor = (percentage: number) => {
    if (percentage <= 5) return "border-red-500/50 bg-red-500/10"
    if (percentage <= 10) return "border-orange-500/50 bg-orange-500/10"
    if (percentage <= 20) return "border-yellow-500/50 bg-yellow-500/10"
    return "border-gray-700/50 bg-gray-800/30"
  }

  const filteredNotifications = selectedStation
    ? notifications.filter((n) => n.stationId === selectedStation)
    : notifications

  const criticalAlerts = tankAlerts.filter((alert) => alert.severity === "critical").length
  const unreadNotifications = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/home")}
                className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-lg">
                  <Crown className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-yellow-400">Admin Dashboard</h1>
                  <p className="text-sm text-gray-400">Enterprise Management Center</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/admin/managers")}
                className="bg-blue-500 text-white hover:bg-blue-600 rounded-xl font-semibold"
              >
                <Users className="h-4 w-4 mr-2" />
                Manager Performance
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(true)}
                className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 relative rounded-xl transition-all duration-300"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Critical Alerts Banner */}
      {criticalAlerts > 0 && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
            <span className="text-red-400 font-semibold">
              🚨 {criticalAlerts} Critical Tank Alert{criticalAlerts > 1 ? "s" : ""} - Immediate Action Required!
            </span>
            <Button
              size="sm"
              onClick={() => setShowNotifications(true)}
              className="bg-red-500 text-white hover:bg-red-600 ml-auto"
            >
              View Alerts
            </Button>
          </div>
        </div>
      )}

      {/* Stats Overview Cards */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-gray-700/50 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-400 text-xl">
              <Store className="h-6 w-6 mr-2" />
              Total Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{totalStations}</p>
            <p className="text-sm text-gray-400">All Stations</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-gray-700/50 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-400 text-xl">
              <Activity className="h-6 w-6 mr-2" />
              Active Portals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{activePortals}</p>
            <p className="text-sm text-gray-400">Currently Online</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-gray-700/50 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
              <DollarSign className="h-6 w-6 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">₦{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Combined Revenue</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-gray-700/50 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-teal-400 text-xl">
              <ServerCog className="h-6 w-6 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">Online</p>
            <p className="text-sm text-gray-400">
              {totalAlerts > 0 ? `${totalAlerts} Alert${totalAlerts > 1 ? "s" : ""}` : "Operational"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <div className="p-2 bg-yellow-400/10 rounded-xl">
                  <DollarSign className="h-6 w-6" />
                </div>
                Total Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-white">₦{totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Current Revenue</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-gray-300">₦{totalExpectedRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Expected Revenue</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-yellow-400 font-semibold">{revenueProgress.toFixed(1)}%</span>
                </div>
                <Progress value={revenueProgress} className="h-3 bg-gray-800" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <div className="p-2 bg-yellow-400/10 rounded-xl">
                  <Activity className="h-6 w-6" />
                </div>
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <Building className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">5</p>
                  <p className="text-sm text-gray-400">Active Stations</p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                  <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{totalStaff}</p>
                  <p className="text-sm text-gray-400">Total Staff</p>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{totalAlerts}</p>
                  <p className="text-sm text-gray-400">Active Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Performance */}
        <Card className="glass-card border-gray-700/50 rounded-3xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <div className="p-2 bg-yellow-400/10 rounded-xl">
                  <BarChart3 className="h-6 w-6" />
                </div>
                Station Performance
                <span className="text-sm text-gray-400 font-normal">(Click station to view sales analysis)</span>
              </CardTitle>
              <Button
                onClick={() => setShowCreatePO(true)}
                className="bg-yellow-500 text-black hover:bg-yellow-600 rounded-xl font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stationsData.map((station) => (
                <div
                  key={station.id}
                  className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:bg-gray-800/50 cursor-pointer transition-all duration-300 hover:border-yellow-400/30"
                  onClick={() => handleStationClick(station.id)}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Station Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${station.color}-500/20 rounded-xl`}>
                          <Fuel className={`h-5 w-5 text-${station.color}-400`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-lg ${getStationColor(station.color)}`}>{station.name}</h3>
                          <p className="text-sm text-gray-400">{station.manager}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{station.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>Last activity: {station.lastActivity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>{station.staff} Staff Members</span>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Progress */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Revenue Progress</span>
                          <span className="text-sm font-semibold text-white">
                            {((station.revenue / station.expectedRevenue) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={(station.revenue / station.expectedRevenue) * 100}
                          className="h-2 bg-gray-700"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Current</p>
                          <p className="font-semibold text-white">₦{station.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Expected</p>
                          <p className="font-semibold text-white">₦{station.expectedRevenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tank Status with Alerts */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-300">Tank Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {station.tanks.map((tank) => (
                          <div key={tank.name} className={`p-3 rounded-xl ${getTankAlertColor(tank.percentage)}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-400">{tank.name}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-semibold text-white">{tank.percentage}%</span>
                                {tank.percentage <= 20 && (
                                  <AlertTriangle
                                    className={`h-3 w-3 ${
                                      tank.percentage <= 5
                                        ? "text-red-400 animate-pulse"
                                        : tank.percentage <= 10
                                          ? "text-orange-400"
                                          : "text-yellow-400"
                                    }`}
                                  />
                                )}
                              </div>
                            </div>
                            <Progress
                              value={tank.percentage}
                              className={`h-1 ${
                                tank.percentage <= 5
                                  ? "bg-red-900"
                                  : tank.percentage <= 10
                                    ? "bg-orange-900"
                                    : tank.percentage <= 20
                                      ? "bg-yellow-900"
                                      : "bg-gray-800"
                              }`}
                            />
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-500">{tank.fuel}</span>
                              <span className="text-xs text-gray-500">{tank.current.toLocaleString()}L</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Purchase Orders */}
        <Card className="glass-card border-gray-700/50 rounded-3xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <div className="p-2 bg-yellow-400/10 rounded-xl">
                  <Package className="h-6 w-6" />
                </div>
                Purchase Orders
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="w-64">
                  <ModernDatePicker
                    value={purchaseOrderDateFilter}
                    onChange={setPurchaseOrderDateFilter}
                    placeholder="Filter by date"
                  />
                </div>
                <Button
                  onClick={() => setShowCreatePO(true)}
                  className="bg-yellow-500 text-black hover:bg-yellow-600 rounded-xl font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Purchase Order
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50">
                    <TableHead className="text-gray-400">PO ID</TableHead>
                    <TableHead className="text-gray-400">Station</TableHead>
                    <TableHead className="text-gray-400">Fuel Type</TableHead>
                    <TableHead className="text-gray-400">Quantity</TableHead>
                    <TableHead className="text-gray-400">Total Value</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Expected Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id} className="border-gray-700/50">
                      <TableCell className="text-white font-medium">{po.id}</TableCell>
                      <TableCell className="text-gray-300">{po.stationName}</TableCell>
                      <TableCell className="text-gray-300">{po.fuelType}</TableCell>
                      <TableCell className="text-gray-300">{po.quantity.toLocaleString()}L</TableCell>
                      <TableCell className="text-gray-300">₦{po.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{po.expectedDelivery}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Purchase Order Modal */}
      <Dialog open={showCreatePO} onOpenChange={setShowCreatePO}>
        <DialogContent className="glass-card border-gray-700/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-xl">Create Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Station</label>
                <Select value={newPO.stationId} onValueChange={(value) => setNewPO({ ...newPO, stationId: value })}>
                  <SelectTrigger className="glass-card border-gray-700/50 text-white h-12 rounded-xl">
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-gray-700/50">
                    {stationsData.map((station) => (
                      <SelectItem key={station.id} value={station.id || "null"}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Fuel Type</label>
                <Select value={newPO.fuelType} onValueChange={(value) => setNewPO({ ...newPO, fuelType: value })}>
                  <SelectTrigger className="glass-card border-gray-700/50 text-white h-12 rounded-xl">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-gray-700/50">
                    <SelectItem value="AGO">AGO (Diesel)</SelectItem>
                    <SelectItem value="PMS">PMS (Petrol)</SelectItem>
                    <SelectItem value="DPK">DPK (Kerosene)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Quantity (Liters)</label>
                <Input
                  type="number"
                  value={newPO.quantity}
                  onChange={(e) => setNewPO({ ...newPO, quantity: e.target.value })}
                  className="glass-card border-gray-700/50 text-white h-12 rounded-xl"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Unit Price (₦)</label>
                <Input
                  type="number"
                  value={newPO.unitPrice}
                  onChange={(e) => setNewPO({ ...newPO, unitPrice: e.target.value })}
                  className="glass-card border-gray-700/50 text-white h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <ModernDatePicker
                label="Expected Delivery Date"
                value={newPO.expectedDelivery}
                onChange={(date) => setNewPO({ ...newPO, expectedDelivery: date })}
                placeholder="Select delivery date"
              />
            </div>

            {/* Supplier Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-yellow-400">Supplier Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Supplier Company</label>
                  <Select>
                    <SelectTrigger className="glass-card border-gray-700/50 text-white h-12 rounded-xl">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-gray-700/50">
                      <SelectItem value="nnpc">NNPC Lagos Terminal</SelectItem>
                      <SelectItem value="total">Total Nigeria Plc</SelectItem>
                      <SelectItem value="conoil">Conoil Plc</SelectItem>
                      <SelectItem value="oando">Oando Plc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Supplier Contact</label>
                  <Input
                    className="glass-card border-gray-700/50 text-white h-12 rounded-xl"
                    placeholder="Contact person"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Supplier Address</label>
                <Input
                  className="glass-card border-gray-700/50 text-white h-12 rounded-xl"
                  placeholder="Supplier address"
                />
              </div>
            </div>

            {/* Driver Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-yellow-400">Driver Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Driver Name</label>
                  <Input
                    className="glass-card border-gray-700/50 text-white h-12 rounded-xl"
                    placeholder="Driver full name"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Driver License</label>
                  <Input
                    className="glass-card border-gray-700/50 text-white h-12 rounded-xl"
                    placeholder="License number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Vehicle Plate Number</label>
                  <Input
                    className="glass-card border-gray-700/50 text-white h-12 rounded-xl"
                    placeholder="Vehicle registration"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Driver Phone</label>
                  <Input
                    className="glass-card border-gray-700/50 text-white h-12 rounded-xl"
                    placeholder="Contact number"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-yellow-400">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Payment Method</label>
                  <Select>
                    <SelectTrigger className="glass-card border-gray-700/50 text-white h-12 rounded-xl">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-gray-700/50">
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash Payment</SelectItem>
                      <SelectItem value="credit">Credit Terms</SelectItem>
                      <SelectItem value="check">Bank Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Payment Terms</label>
                  <Select>
                    <SelectTrigger className="glass-card border-gray-700/50 text-white h-12 rounded-xl">
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-gray-700/50">
                      <SelectItem value="immediate">Immediate Payment</SelectItem>
                      <SelectItem value="net30">Net 30 Days</SelectItem>
                      <SelectItem value="net60">Net 60 Days</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {newPO.quantity && newPO.unitPrice && (
              <div className="p-6 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                <h4 className="text-lg font-semibold text-yellow-400 mb-4">Order Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Quantity</p>
                    <p className="text-xl font-bold text-white">
                      {Number.parseInt(newPO.quantity || "0").toLocaleString()}L
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Unit Price</p>
                    <p className="text-xl font-bold text-white">
                      ₦{Number.parseInt(newPO.unitPrice || "0").toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Total Value</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      ₦
                      {(
                        Number.parseInt(newPO.quantity || "0") * Number.parseInt(newPO.unitPrice || "0")
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreatePO(false)}
                className="flex-1 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 h-12 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePO}
                disabled={!newPO.stationId || !newPO.fuelType || !newPO.quantity || !newPO.expectedDelivery}
                className="flex-1 bg-yellow-500 text-black hover:bg-yellow-600 h-12 rounded-xl font-semibold"
              >
                Create Purchase Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="glass-card border-gray-700/50 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">Admin Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger className="glass-card border-gray-700/50 text-white">
                  <SelectValue placeholder="Filter by station" />
                </SelectTrigger>
                <SelectContent className="glass-card border-gray-700/50">
                  <SelectItem value="all">All Stations</SelectItem>
                  {stationsData.map((station) => (
                    <SelectItem key={station.id} value={station.id || "null"}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border ${
                    notification.read
                      ? "bg-gray-800/30 border-gray-700/50"
                      : notification.type?.includes("tank")
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-yellow-500/10 border-yellow-500/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{notification.title}</h4>
                        <Badge className="text-xs bg-gray-700/50 text-gray-300">{notification.stationName}</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.timestamp}</p>
                    </div>
                    {!notification.read && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
