"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Fuel, Users, Shield, BarChart3, ChevronRight, MapPin, Clock, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-400/50",
      teal: "from-teal-500/20 to-teal-600/20 border-teal-500/30 hover:border-teal-400/50",
      green: "from-green-500/20 to-green-600/20 border-green-500/30 hover:border-green-400/50",
      purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-400/50",
      orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30 hover:border-orange-400/50",
      red: "from-red-500/20 to-red-600/20 border-red-500/30 hover:border-red-400/50",
      indigo: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 hover:border-indigo-400/50",
      pink: "from-pink-500/20 to-pink-600/20 border-pink-500/30 hover:border-pink-400/50",
      cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 hover:border-cyan-400/50",
      yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 hover:border-yellow-400/50",
    }
    return colorMap[color] || colorMap.blue
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card border-gray-700/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Fuel className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Stations</p>
                  <p className="text-2xl font-bold text-white">10</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Portals</p>
                  <p className="text-2xl font-bold text-white">{activeStations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">₦{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-gray-700/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Shield className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">System Status</p>
                  <p className="text-2xl font-bold text-green-400">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portal Cards */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Fuel Station Portals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portalCards.map((card) => (
              <Card
                key={card.id}
                className={`glass-card border rounded-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-gradient-to-br ${getColorClasses(card.color)} ${
                  !card.isActive ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={() => handleCardClick(card)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${card.color}-500/30 rounded-xl`}>
                          <Fuel className={`h-5 w-5 text-${card.color}-400`} />
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
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Revenue</p>
                        <p className="font-semibold text-white">{card.revenue}</p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">Tanks: {card.tanks}</div>
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
                      <div className="p-2 bg-gray-500/30 rounded-xl">
                        <fleetCard.icon className="h-5 w-5 text-gray-400" />
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
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Vehicles</p>
                      <p className="font-semibold text-white">0</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
