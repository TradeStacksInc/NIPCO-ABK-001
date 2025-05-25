"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  DollarSign,
  Fuel,
  Users,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ModernDatePicker } from "@/components/modern-date-picker"

// Mock data for staff sales
const mockStaffSales = [
  {
    id: "staff-001",
    name: "John Attendant",
    shift: "Morning",
    dispenser: "Dispenser 1",
    nozzle: "Nozzle A",
    fuelType: "PMS",
    volumeSold: 2500,
    pricePerLiter: 830,
    totalSales: 2075000,
    moneySubmitted: 2075000,
    timestamp: "2024-01-15 08:30:00",
    status: "Complete",
  },
  {
    id: "staff-002",
    name: "Jane Operator",
    shift: "Morning",
    dispenser: "Dispenser 2",
    nozzle: "Nozzle B",
    fuelType: "AGO",
    volumeSold: 1800,
    pricePerLiter: 830,
    totalSales: 1494000,
    moneySubmitted: 1490000,
    timestamp: "2024-01-15 09:15:00",
    status: "Discrepancy",
  },
  {
    id: "staff-003",
    name: "Mike Cashier",
    shift: "Afternoon",
    dispenser: "Dispenser 3",
    nozzle: "Nozzle C",
    fuelType: "PMS",
    volumeSold: 3200,
    pricePerLiter: 830,
    totalSales: 2656000,
    moneySubmitted: 2656000,
    timestamp: "2024-01-15 14:20:00",
    status: "Complete",
  },
  {
    id: "staff-004",
    name: "Sarah Attendant",
    shift: "Afternoon",
    dispenser: "Dispenser 1",
    nozzle: "Nozzle A",
    fuelType: "AGO",
    volumeSold: 2100,
    pricePerLiter: 830,
    totalSales: 1743000,
    moneySubmitted: 1740000,
    timestamp: "2024-01-15 15:45:00",
    status: "Discrepancy",
  },
  {
    id: "staff-005",
    name: "David Operator",
    shift: "Morning",
    dispenser: "Dispenser 4",
    nozzle: "Nozzle D",
    fuelType: "DPK",
    volumeSold: 800,
    pricePerLiter: 830,
    totalSales: 664000,
    moneySubmitted: 664000,
    timestamp: "2024-01-15 10:30:00",
    status: "Complete",
  },
]

const stationsData = {
  "abk-001": {
    name: "NIPCO ABK-001",
    manager: "John Doe",
    expectedRevenue: 3000000,
    color: "blue",
  },
  "uyo-1-002": {
    name: "NIPCO Uyo 1-002",
    manager: "Jane Smith",
    expectedRevenue: 2500000,
    color: "teal",
  },
  "uyo-2-003": {
    name: "NIPCO Uyo 2-003",
    manager: "Mike Johnson",
    expectedRevenue: 2800000,
    color: "green",
  },
  "ik-004": {
    name: "NIPCO Ik-004",
    manager: "Sarah Wilson",
    expectedRevenue: 2200000,
    color: "purple",
  },
  "ib-005": {
    name: "NIPCO Ib-005",
    manager: "David Brown",
    expectedRevenue: 2900000,
    color: "orange",
  },
}

export default function SalesAnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const stationId = params.stationId as string

  const [selectedDate, setSelectedDate] = useState("2024-01-15")
  const [selectedShift, setSelectedShift] = useState("All")
  const [selectedStaff, setSelectedStaff] = useState("All")

  const [staffPerformanceDateFilter, setStaffPerformanceDateFilter] = useState("")
  const [salesLogDateFilter, setSalesLogDateFilter] = useState("")

  const station = stationsData[stationId as keyof typeof stationsData]

  if (!station) {
    return <div>Station not found</div>
  }

  // Filter sales data
  const filteredSales = mockStaffSales.filter((sale) => {
    const dateMatch = sale.timestamp.startsWith(selectedDate)
    const shiftMatch = selectedShift === "All" || sale.shift === selectedShift
    const staffMatch = selectedStaff === "All" || sale.name === selectedStaff
    return dateMatch && shiftMatch && staffMatch
  })

  // Calculate totals
  const totalVolume = filteredSales.reduce((sum, sale) => sum + sale.volumeSold, 0)
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalSales, 0)
  const totalSubmitted = filteredSales.reduce((sum, sale) => sum + sale.moneySubmitted, 0)
  const discrepancy = totalSales - totalSubmitted
  const revenueProgress = (totalSales / station.expectedRevenue) * 100

  // Shift analysis
  const morningShift = filteredSales.filter((sale) => sale.shift === "Morning")
  const afternoonShift = filteredSales.filter((sale) => sale.shift === "Afternoon")

  const morningTotal = morningShift.reduce((sum, sale) => sum + sale.totalSales, 0)
  const afternoonTotal = afternoonShift.reduce((sum, sale) => sum + sale.totalSales, 0)

  // Staff performance
  const staffPerformance = filteredSales.reduce((acc, sale) => {
    if (!acc[sale.name]) {
      acc[sale.name] = {
        name: sale.name,
        totalSales: 0,
        totalSubmitted: 0,
        volumeSold: 0,
        transactions: 0,
        discrepancies: 0,
      }
    }
    acc[sale.name].totalSales += sale.totalSales
    acc[sale.name].totalSubmitted += sale.moneySubmitted
    acc[sale.name].volumeSold += sale.volumeSold
    acc[sale.name].transactions += 1
    if (sale.status === "Discrepancy") {
      acc[sale.name].discrepancies += 1
    }
    return acc
  }, {} as any)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Discrepancy":
        return "bg-red-500/20 text-red-400 border-red-500/30"
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
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${station.color}-500/20`}>
                  <BarChart3 className={`h-7 w-7 text-${station.color}-400`} />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${getStationColor(station.color)}`}>Sales Analysis</h1>
                  <p className="text-sm text-gray-400">
                    {station.name} - {station.manager}
                  </p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <ModernDatePicker
                  label="Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  placeholder="Select date"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Shift</label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger className="glass-card border-gray-700/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-gray-700/50">
                    <SelectItem value="All">All Shifts</SelectItem>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Afternoon">Afternoon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Staff Member</label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger className="glass-card border-gray-700/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-gray-700/50">
                    <SelectItem value="All">All Staff</SelectItem>
                    {Array.from(new Set(mockStaffSales.map((sale) => sale.name))).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSelectedDate("2024-01-15")
                    setSelectedShift("All")
                    setSelectedStaff("All")
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
              <CardTitle className="flex items-center gap-3 text-blue-400 text-lg">
                <Fuel className="h-5 w-5" />
                Total Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{totalVolume.toLocaleString()}L</p>
              <p className="text-sm text-gray-400">Fuel Dispensed</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-400 text-lg">
                <DollarSign className="h-5 w-5" />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">₦{totalSales.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Revenue Generated</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-lg">
                <Target className="h-5 w-5" />
                Revenue Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{revenueProgress.toFixed(1)}%</p>
              <Progress value={revenueProgress} className="h-2 bg-gray-800 mt-2" />
              <p className="text-sm text-gray-400 mt-1">vs Expected ₦{station.expectedRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-400 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Discrepancy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${discrepancy === 0 ? "text-green-400" : "text-red-400"}`}>
                ₦{Math.abs(discrepancy).toLocaleString()}
              </p>
              <p className="text-sm text-gray-400">{discrepancy === 0 ? "No Issues" : "Amount Missing"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Shift Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <Clock className="h-6 w-6" />
                Morning Shift Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Sales</span>
                  <span className="text-white font-semibold">₦{morningTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Transactions</span>
                  <span className="text-white font-semibold">{morningShift.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Volume Sold</span>
                  <span className="text-white font-semibold">
                    {morningShift.reduce((sum, sale) => sum + sale.volumeSold, 0).toLocaleString()}L
                  </span>
                </div>
                <Progress value={(morningTotal / station.expectedRevenue) * 100} className="h-2 bg-gray-800" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <Clock className="h-6 w-6" />
                Afternoon Shift Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Sales</span>
                  <span className="text-white font-semibold">₦{afternoonTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Transactions</span>
                  <span className="text-white font-semibold">{afternoonShift.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Volume Sold</span>
                  <span className="text-white font-semibold">
                    {afternoonShift.reduce((sum, sale) => sum + sale.volumeSold, 0).toLocaleString()}L
                  </span>
                </div>
                <Progress value={(afternoonTotal / station.expectedRevenue) * 100} className="h-2 bg-gray-800" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Performance Summary */}
        <Card className="glass-card border-gray-700/50 rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <Users className="h-6 w-6" />
                Staff Performance Summary
              </CardTitle>
              <div className="w-64">
                <ModernDatePicker
                  value={staffPerformanceDateFilter}
                  onChange={setStaffPerformanceDateFilter}
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
                    <TableHead className="text-gray-400">Staff Member</TableHead>
                    <TableHead className="text-gray-400">Total Sales</TableHead>
                    <TableHead className="text-gray-400">Money Submitted</TableHead>
                    <TableHead className="text-gray-400">Volume Sold</TableHead>
                    <TableHead className="text-gray-400">Transactions</TableHead>
                    <TableHead className="text-gray-400">Discrepancies</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(staffPerformance).map((staff: any) => (
                    <TableRow key={staff.name} className="border-gray-700/50">
                      <TableCell className="text-white font-medium">{staff.name}</TableCell>
                      <TableCell className="text-gray-300">₦{staff.totalSales.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-300">₦{staff.totalSubmitted.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-300">{staff.volumeSold.toLocaleString()}L</TableCell>
                      <TableCell className="text-gray-300">{staff.transactions}</TableCell>
                      <TableCell className="text-gray-300">{staff.discrepancies}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {staff.discrepancies === 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                          )}
                          <Badge
                            className={
                              staff.discrepancies === 0 ? getStatusColor("Complete") : getStatusColor("Discrepancy")
                            }
                          >
                            {staff.discrepancies === 0 ? "Perfect" : "Issues"}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sales Log */}
        <Card className="glass-card border-gray-700/50 rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-yellow-400 text-xl">
                <TrendingUp className="h-6 w-6" />
                Detailed Sales Log
              </CardTitle>
              <div className="w-64">
                <ModernDatePicker
                  value={salesLogDateFilter}
                  onChange={setSalesLogDateFilter}
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
                    <TableHead className="text-gray-400">Time</TableHead>
                    <TableHead className="text-gray-400">Staff</TableHead>
                    <TableHead className="text-gray-400">Shift</TableHead>
                    <TableHead className="text-gray-400">Dispenser</TableHead>
                    <TableHead className="text-gray-400">Nozzle</TableHead>
                    <TableHead className="text-gray-400">Fuel Type</TableHead>
                    <TableHead className="text-gray-400">Volume (L)</TableHead>
                    <TableHead className="text-gray-400">Price/L</TableHead>
                    <TableHead className="text-gray-400">Total Sales</TableHead>
                    <TableHead className="text-gray-400">Submitted</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="border-gray-700/50">
                      <TableCell className="text-gray-300">{new Date(sale.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell className="text-white font-medium">{sale.name}</TableCell>
                      <TableCell className="text-gray-300">{sale.shift}</TableCell>
                      <TableCell className="text-gray-300">{sale.dispenser}</TableCell>
                      <TableCell className="text-gray-300">{sale.nozzle}</TableCell>
                      <TableCell className="text-gray-300">{sale.fuelType}</TableCell>
                      <TableCell className="text-gray-300">{sale.volumeSold.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-300">₦{sale.pricePerLiter}</TableCell>
                      <TableCell className="text-gray-300">₦{sale.totalSales.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-300">₦{sale.moneySubmitted.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
