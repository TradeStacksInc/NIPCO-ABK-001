"use client"

import { useState } from "react"
import { Search, Download, Eye, Clock, User, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SystemLog {
  id: string
  timestamp: string
  user: string
  action: string
  module: string
  details: string
  ipAddress: string
  status: "success" | "error" | "warning"
  duration?: string
}

const mockSystemLogs: SystemLog[] = []

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "error":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "warning":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

const getModuleIcon = (module: string) => {
  switch (module) {
    case "Sales Management":
      return "💰"
    case "Staff Management":
      return "👥"
    case "Inventory Management":
      return "📦"
    case "Authentication":
      return "🔐"
    case "Driver Management":
      return "🚛"
    case "System Maintenance":
      return "⚙️"
    case "Reporting":
      return "📊"
    case "System Settings":
      return "🔧"
    case "Data Management":
      return "💾"
    default:
      return "📋"
  }
}

export function SystemLogPage() {
  const [logs, setLogs] = useState<SystemLog[]>(mockSystemLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterModule, setFilterModule] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = filterModule === "all" || log.module === filterModule
    const matchesStatus = filterStatus === "all" || log.status === filterStatus

    return matchesSearch && matchesModule && matchesStatus
  })

  const modules = Array.from(new Set(logs.map((log) => log.module)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-300 mb-2">System Activity Log</h1>
            <p className="text-gray-400">Complete audit trail of all platform activities</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{filteredLogs.length} Records</Badge>
            <Button className="bg-gray-700 hover:bg-gray-600 text-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="glass-card border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search logs by action, user, or details..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-gray-300 placeholder-gray-500"
                  />
                </div>
              </div>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-600 text-gray-300">
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600 text-gray-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="glass-card border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-gray-300 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-medium">Log ID</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Timestamp</th>
                    <th className="text-left p-4 text-gray-400 font-medium">User</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Action</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Module</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Duration</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr
                      key={log.id}
                      className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                        index % 2 === 0 ? "bg-gray-900/20" : "bg-transparent"
                      }`}
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-gray-300">{log.id}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{log.timestamp}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">{log.user}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300 font-medium">{log.action}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getModuleIcon(log.module)}</span>
                          <span className="text-gray-400 text-sm">{log.module}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`text-xs ${getStatusBadge(log.status)}`}>{log.status}</Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-400 text-sm font-mono">{log.duration}</span>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-300 h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLogs.length === 0 && (
              <div className="p-8 text-center">
                <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Activity Logs</h3>
                <p className="text-gray-500">No system activity logs available at this time.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
