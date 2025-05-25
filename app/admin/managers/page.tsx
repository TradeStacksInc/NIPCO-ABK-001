"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Target,
  Clock,
  Filter,
  Crown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ModernDatePicker } from "@/components/modern-date-picker"

// Mock data for manager performance
const managersData = [
  {
    id: "abk-001",
    name: "John Doe",
    stationName: "NIPCO ABK-001",
    expectedRevenue: 3000000,
    color: "blue",
    dailyData: [
      {
        date: "2024-01-15",
        morningShift: 1200000,
        afternoonShift: 1250000,
        totalDaily: 2450000,
        expectedDaily: 100000, // Expected daily revenue (monthly/30)
        status: "Exceeded",
      },
      {
        date: "2024-01-14",
        morningShift: 800000,
        afternoonShift: 900000,
        totalDaily: 1700000,
        expectedDaily: 100000,
        status: "Exceeded",
      },
      {
        date: "2024-01-13",
        morningShift: 600000,
        afternoonShift: 750000,
        totalDaily: 1350000,
        expectedDaily: 100000,
        status: "Exceeded",
      },
    ],
  },
  {
    id: "uyo-1-002",
    name: "Jane Smith",
    stationName: "NIPCO Uyo 1-002",
    expectedRevenue: 2500000,
    color: "teal",
    dailyData: [
      {
        date: "2024-01-15",
        morningShift: 700000,
        afternoonShift: 600000,
        totalDaily: 1300000,
        expectedDaily: 83333,
        status: "Exceeded",
      },
      {
        date: "2024-01-14",
        morningShift: 500000,
        afternoonShift: 450000,
        totalDaily: 950000,
        expectedDaily: 83333,
        status: "Exceeded",
      },
      {
        date: "2024-01-13",
        morningShift: 400000,
        afternoonShift: 350000,
        totalDaily: 750000,
        expectedDaily: 83333,
        status: "Exceeded",
      },
    ],
  },
  {
    id: "uyo-2-003",
    name: "Mike Johnson",
    stationName: "NIPCO Uyo 2-003",
    expectedRevenue: 2800000,
    color: "green",
    dailyData: [
      {
        date: "2024-01-15",
        morningShift: 800000,
        afternoonShift: 750000,
        totalDaily: 1550000,
        expectedDaily: 93333,
        status: "Exceeded",
      },
      {
        date: "2024-01-14",
        morningShift: 600000,
        afternoonShift: 550000,
        totalDaily: 1150000,
        expectedDaily: 93333,
        status: "Exceeded",
      },
      {
        date: "2024-01-13",
        morningShift: 450000,
        afternoonShift: 400000,
        totalDaily: 850000,
        expectedDaily: 93333,
        status: "Exceeded",
      },
    ],
  },
  {
    id: "ik-004",
    name: "Sarah Wilson",
    stationName: "NIPCO Ik-004",
    expectedRevenue: 2200000,
    color: "purple",
    dailyData: [
      {
        date: "2024-01-15",
        morningShift: 500000,
        afternoonShift: 450000,
        totalDaily: 950000,
        expectedDaily: 73333,
        status: "Exceeded",
      },
      {
        date: "2024-01-14",
        morningShift: 400000,
        afternoonShift: 350000,
        totalDaily: 750000,
        expectedDaily: 73333,
        status: "Exceeded",
      },
      {
        date: "2024-01-13",
        morningShift: 300000,
        afternoonShift: 250000,
        totalDaily: 550000,
        expectedDaily: 73333,
        status: "Exceeded",
      },
    ],
  },
  {
    id: "ib-005",
    name: "David Brown",
    stationName: "NIPCO Ib-005",
    expectedRevenue: 2900000,
    color: "orange",
    dailyData: [
      {
        date: "2024-01-15",
        morningShift: 600000,
        afternoonShift: 550000,
        totalDaily: 1150000,
        expectedDaily: 96667,
        status: "Exceeded",
      },
      {
        date: "2024-01-14",
        morningShift: 500000,
        afternoonShift: 450000,
        totalDaily: 950000,
        expectedDaily: 96667,
        status: "Exceeded",
      },
      {
        date: "2024-01-13",
        morningShift: 400000,
        afternoonShift: 350000,
        totalDaily: 750000,
        expectedDaily: 96667,
        status: "Exceeded",
      },
    ],
  },
]

export default function ManagerPerformancePage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState("2024-01-15")
  const [selectedManager, setSelectedManager] = useState("All")
  const [managerPerformanceDateFilter, setManagerPerformanceDateFilter] = useState("")

  // Filter data based on selected date and manager
  const filteredData = managersData
    .filter((manager) => {
      const managerMatch = selectedManager === "All" || manager.name === selectedManager
      return managerMatch
    })
    .map((manager) => {
      const dayData = manager.dailyData.find((day) => day.date === selectedDate)
      return {
        ...manager,
        currentDay: dayData || {
          date: selectedDate,
          morningShift: 0,
          afternoonShift: 0,
          totalDaily: 0,
          expectedDaily: manager.expectedRevenue / 30,
          status: "No Data",
        },
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Exceeded":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Met":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Below":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "No Data":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
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

  // Calculate totals for the selected date
  const totalRevenue = filteredData.reduce((sum, manager) => sum + manager.currentDay.totalDaily, 0)
  const totalExpected = filteredData.reduce((sum, manager) => sum + manager.currentDay.expectedDaily, 0)
  const totalMorning = filteredData.reduce((sum, manager) => sum + manager.currentDay.morningShift, 0)
  const totalAfternoon = filteredData.reduce((sum, manager) => sum + manager.currentDay.afternoonShift, 0)
  const overallProgress = totalExpected > 0 ? (totalRevenue / totalExpected) * 100 : 0

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
                onClick={() => router.push("/admin")}
                className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-lg">
                  <Crown className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-400">Manager Performance</h1>
                  <p className="text-sm text-gray-400">Station Manager Analytics & Revenue Tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Filters */}
        <Card className="glass-card border-gray-700/50 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
              <Filter className="h-6 w-6" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <ModernDatePicker
                  label="Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  placeholder="Select date"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Manager</label>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger className="glass-card border-gray-700/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-gray-700/50">
                    <SelectItem value="All">All Managers</SelectItem>
                    {managersData.map((manager) => (
                      <SelectItem key={manager.id} value={manager.name}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSelectedDate("2024-01-15")
                    setSelectedManager("All")
                  }}
                  variant="outline"
                  className="w-full border-gray-700/50 text-gray-300 hover:bg-gray-800/50"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-400 text-lg">
                <DollarSign className="h-5 w-5" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">₦{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Daily Combined</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-400 text-lg">
                <Target className="h-5 w-5" />
                Expected Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">₦{totalExpected.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Daily Target</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-lg">
                <TrendingUp className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{overallProgress.toFixed(1)}%</p>
              <Progress value={overallProgress} className="h-2 bg-gray-800 mt-2" />
              <p className="text-sm text-gray-400 mt-1">vs Target</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-400 text-lg">
                <Users className="h-5 w-5" />
                Active Managers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{filteredData.length}</p>
              <p className="text-sm text-gray-400">Station Managers</p>
            </CardContent>
          </Card>
        </div>

        {/* Shift Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <Clock className="h-6 w-6" />
                Morning Shift Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Revenue</span>
                  <span className="text-white font-semibold text-2xl">₦{totalMorning.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average per Station</span>
                  <span className="text-white font-semibold">
                    ₦{filteredData.length > 0 ? (totalMorning / filteredData.length).toLocaleString() : "0"}
                  </span>
                </div>
                <Progress
                  value={totalExpected > 0 ? (totalMorning / (totalExpected / 2)) * 100 : 0}
                  className="h-3 bg-gray-800"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <Clock className="h-6 w-6" />
                Afternoon Shift Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Revenue</span>
                  <span className="text-white font-semibold text-2xl">₦{totalAfternoon.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average per Station</span>
                  <span className="text-white font-semibold">
                    ₦{filteredData.length > 0 ? (totalAfternoon / filteredData.length).toLocaleString() : "0"}
                  </span>
                </div>
                <Progress
                  value={totalExpected > 0 ? (totalAfternoon / (totalExpected / 2)) * 100 : 0}
                  className="h-3 bg-gray-800"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manager Performance Table */}
        <Card className="glass-card border-gray-700/50 rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <Users className="h-6 w-6" />
                Manager Performance Details
              </CardTitle>
              <div className="w-64">
                <ModernDatePicker
                  value={managerPerformanceDateFilter}
                  onChange={setManagerPerformanceDateFilter}
                  placeholder="Filter by date"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50">
                    <TableHead className="text-gray-400">Manager</TableHead>
                    <TableHead className="text-gray-400">Station</TableHead>
                    <TableHead className="text-gray-400">Morning Shift</TableHead>
                    <TableHead className="text-gray-400">Afternoon Shift</TableHead>
                    <TableHead className="text-gray-400">Daily Total</TableHead>
                    <TableHead className="text-gray-400">Expected Daily</TableHead>
                    <TableHead className="text-gray-400">Performance</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((manager) => {
                    const performancePercent =
                      manager.currentDay.expectedDaily > 0
                        ? (manager.currentDay.totalDaily / manager.currentDay.expectedDaily) * 100
                        : 0

                    return (
                      <TableRow key={manager.id} className="border-gray-700/50">
                        <TableCell className="text-white font-medium">{manager.name}</TableCell>
                        <TableCell className={`font-medium ${getStationColor(manager.color)}`}>
                          {manager.stationName}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          ₦{manager.currentDay.morningShift.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          ₦{manager.currentDay.afternoonShift.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white font-semibold">
                          ₦{manager.currentDay.totalDaily.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          ₦{manager.currentDay.expectedDaily.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{performancePercent.toFixed(1)}%</span>
                            <Progress value={Math.min(performancePercent, 100)} className="h-2 bg-gray-800 w-16" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {performancePercent >= 100 ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                            )}
                            <Badge className={getStatusColor(manager.currentDay.status)}>
                              {manager.currentDay.status}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
