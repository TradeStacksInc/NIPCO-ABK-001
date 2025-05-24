"use client"

import { useState } from "react"
import { Bell, AlertTriangle, CheckCircle, Info, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Notification {
  id: string
  type: "alert" | "success" | "info" | "warning"
  title: string
  message: string
  timestamp: string
  read: boolean
  category: "sales" | "inventory" | "staff" | "system" | "driver"
}

const mockNotifications: Notification[] = []

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "alert":
      return <AlertTriangle className="h-5 w-5 text-red-400" />
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-400" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />
    case "info":
      return <Info className="h-5 w-5 text-blue-400" />
    default:
      return <Bell className="h-5 w-5 text-gray-400" />
  }
}

const getNotificationBadgeColor = (type: string) => {
  switch (type) {
    case "alert":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "success":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "warning":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "info":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

export function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState("all")

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const filterNotifications = (category: string) => {
    if (category === "all") return notifications
    return notifications.filter((notif) => notif.category === category)
  }

  const getUnreadCount = (category: string) => {
    const filtered = filterNotifications(category)
    return filtered.filter((notif) => !notif.read).length
  }

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card
      className={`glass-card border-gray-700/50 transition-all duration-300 hover:border-gray-600/50 ${
        !notification.read ? "bg-gray-800/40" : "bg-gray-900/20"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className={`font-semibold ${!notification.read ? "text-gray-300" : "text-gray-400"}`}>
                  {notification.title}
                </h4>
                <Badge className={`text-xs ${getNotificationBadgeColor(notification.type)}`}>{notification.type}</Badge>
                {!notification.read && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{notification.message}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{notification.timestamp}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(notification.id)}
                className="text-gray-400 hover:text-gray-300 h-8 px-2"
              >
                Mark Read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteNotification(notification.id)}
              className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-300 mb-2">Notifications</h1>
            <p className="text-gray-400">Stay updated with all platform activities</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {notifications.filter((n) => !n.read).length} Unread
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-700/50">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gray-400 data-[state=active]:text-black text-gray-400"
            >
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="data-[state=active]:bg-gray-400 data-[state=active]:text-black text-gray-400"
            >
              Sales ({getUnreadCount("sales")})
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-gray-400 data-[state=active]:text-black text-gray-400"
            >
              Inventory ({getUnreadCount("inventory")})
            </TabsTrigger>
            <TabsTrigger
              value="staff"
              className="data-[state=active]:bg-gray-400 data-[state=active]:text-black text-gray-400"
            >
              Staff ({getUnreadCount("staff")})
            </TabsTrigger>
            <TabsTrigger
              value="driver"
              className="data-[state=active]:bg-gray-400 data-[state=active]:text-black text-gray-400"
            >
              Drivers ({getUnreadCount("driver")})
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-gray-400 data-[state=active]:text-black text-gray-400"
            >
              System ({getUnreadCount("system")})
            </TabsTrigger>
          </TabsList>

          {["all", "sales", "inventory", "staff", "driver", "system"].map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="space-y-4">
                {filterNotifications(category).length === 0 ? (
                  <Card className="glass-card border-gray-700/50">
                    <CardContent className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">No Notifications</h3>
                      <p className="text-gray-500">No notifications available at this time.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filterNotifications(category).map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
