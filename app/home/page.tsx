"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Fuel, Users, ChevronRight, MapPin, Clock, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SystemInfo } from "@/components/system-info"
import { AIChatWidget } from "@/components/ai-chat-widget"

const portalCards = [
  {
    id: "abk-001",
    title: "NIPCO ABK-001",
    location: "Abak, Akwa Ibom State",
    status: "Active",
    color: "blue",
    route: "/portal/abk-001",
    manager: "John Doe",
    lastActivity: "2 mins ago",
    revenue: "₦2,450,000",
    tanks: "4/4 Active",
    isActive: true,
  },
  {
    id: "uyo-1-002",
    title: "NIPCO Uyo 1-002",
    location: "Uyo, Akwa Ibom State",
    status: "Active",
    color: "teal",
    route: "/portal/uyo-1-002",
    manager: "Jane Smith",
    lastActivity: "5 mins ago",
    revenue: "₦1,890,000",
    tanks: "4/4 Active",
    isActive: true,
  },
  {
    id: "uyo-2-003",
    title: "NIPCO Uyo 2-003",
    location: "Uyo, Akwa Ibom State",
    status: "Active",
    color: "green",
    route: "/portal/uyo-2-003",
    manager: "Mike Johnson",
    lastActivity: "8 mins ago",
    revenue: "₦2,100,000",
    tanks: "4/4 Active",
    isActive: true,
  },
  {
    id: "ik-004",
    title: "NIPCO Ik-004",
    location: "Ikot Ekpene, Akwa Ibom State",
    status: "Active",
    color: "purple",
    route: "/portal/ik-004",
    manager: "Sarah Wilson",
    lastActivity: "12 mins ago",
    revenue: "₦1,750,000",
    tanks: "4/4 Active",
    isActive: true,
  },
  {
    id: "ib-005",
    title: "NIPCO Ib-005",
    location: "Ibibio, Akwa Ibom State",
    status: "Active",
    color: "orange",
    route: "/portal/ib-005",
    manager: "David Brown",
    lastActivity: "15 mins ago",
    revenue: "₦2,200,000",
    tanks: "4/4 Active",
    isActive: true,
  },
  {
    id: "eket-006",
    title: "NIPCO Eket-006",
    location: "Eket, Akwa Ibom State",
    status: "Coming Soon",
    color: "red",
    route: "#",
    manager: "TBA",
    lastActivity: "N/A",
    revenue: "₦0",
    tanks: "0/4 Active",
    isActive: false,
  },
  {
    id: "oron-007",
    title: "NIPCO Oron-007",
    location: "Oron, Akwa Ibom State",
    status: "Coming Soon",
    color: "indigo",
    route: "#",
    manager: "TBA",
    lastActivity: "N/A",
    revenue: "₦0",
    tanks: "0/4 Active",
    isActive: false,
  },
  {
    id: "calabar-008",
    title: "NIPCO Calabar-008",
    location: "Calabar, Cross River State",
    status: "Coming Soon",
    color: "pink",
    route: "#",
    manager: "TBA",
    lastActivity: "N/A",
    revenue: "₦0",
    tanks: "0/4 Active",
    isActive: false,
  },
  {
    id: "ph-009",
    title: "NIPCO Port Harcourt-009",
    location: "Port Harcourt, Rivers State",
    status: "Coming Soon",
    color: "cyan",
    route: "#",
    manager: "TBA",
    lastActivity: "N/A",
    revenue: "₦0",
    tanks: "0/4 Active",
    isActive: false,
  },
  {
    id: "warri-010",
    title: "NIPCO Warri-010",
    location: "Warri, Delta State",
    status: "Coming Soon",
    color: "yellow",
    route: "#",
    manager: "TBA",
    lastActivity: "N/A",
    revenue: "₦0",
    tanks: "0/4 Active",
    isActive: false,
  },
]

const fleetCard = {
  title: "Fleet Management",
  description: "Manage delivery trucks and logistics",
  icon: Users,
  status: "Coming Soon",
  isActive: false,
}

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleCardClick = (card: any) => {
    if (!card.isActive) return

    setIsLoading(card.id)
    setTimeout(() => {
      router.push(card.route)
    }, 1000)
  }

  const handleAdminClick = () => {
    setIsLoading("admin")
    setTimeout(() => {
      router.push("/admin")
    }, 1000)
  }

  const getColorClasses = (color: string, isActive: boolean) => {
    const activeClasses = "from-gray-900 to-black border-gray-700/50 hover:border-gray-600/70"
    const inactiveClasses = "from-gray-900/60 to-black/60 border-gray-800/30 hover:border-gray-700/50"

    return isActive ? activeClasses : inactiveClasses
  }

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  const activeStations = portalCards.filter((card) => card.isActive).length
  const totalRevenue = portalCards
    .filter((card) => card.isActive)
    .reduce((sum, card) => sum + Number.parseInt(card.revenue.replace(/[₦,]/g, "")), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 text-black shadow-lg">
                <Fuel className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">NIPCO Enterprise Portal</h1>
                <p className="text-sm text-gray-400">Fuel Station Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleAdminClick}
                disabled={isLoading === "admin"}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700 rounded-xl font-semibold transition-all duration-300 shadow-lg"
              >
                {isLoading === "admin" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* System Information */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>
          <SystemInfo />
        </div>

        {/* Portal Cards */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Fuel Station Portals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portalCards.map((card) => (
              <Card
                key={card.id}
                className={`glass-card border rounded-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-gradient-to-br ${getColorClasses(card.color, card.isActive)} ${
                  !card.isActive ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={() => handleCardClick(card)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${card.isActive ? `bg-${card.color}-500` : "bg-gray-600"}`}>
                          <Fuel className={`h-6 w-6 ${card.isActive ? "text-white" : "text-gray-300"}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{card.title}</h3>
                          <p className="text-sm text-gray-400">{card.manager}</p>
                        </div>
                      </div>
                      {isLoading === card.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{card.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Last activity: {card.lastActivity}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                      <Badge className={`${getStatusColor(card.status)} text-xs`}>{card.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Fleet Management Card */}
            <Card className="glass-card border-gray-700/50 rounded-2xl opacity-60 cursor-not-allowed bg-gradient-to-br from-gray-500/20 to-gray-600/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gray-600 rounded-xl">
                        <fleetCard.icon className="h-6 w-6 text-gray-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{fleetCard.title}</h3>
                        <p className="text-sm text-gray-400">{fleetCard.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                      {fleetCard.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              © 2025 NIPCO Enterprise Portal. All rights reserved. AI Management System.
            </p>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  )
}
