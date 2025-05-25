"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Fuel, Truck } from "lucide-react"
import { useRouter } from "next/navigation"

const portalCards = [
  {
    id: "nipco-abk-001",
    title: "NIPCO ABK-001",
    description: "Complete fuel station operations, sales tracking, and inventory management",
    icon: Fuel,
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    route: "/portal/abk-001",
    isActive: true,
  },
  {
    id: "nipco-uyo-1-002",
    title: "NIPCO Uyo 1-002",
    description: "Complete fuel station operations, sales tracking, and inventory management",
    icon: Fuel,
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    route: "/portal/uyo-1-002",
    isActive: true,
  },
  {
    id: "nipco-uyo-2-003",
    title: "NIPCO Uyo 2-003",
    description: "Complete fuel station operations, sales tracking, and inventory management",
    icon: Fuel,
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    route: "/portal/uyo-2-003",
    isActive: true,
  },
  {
    id: "nipco-ik-004",
    title: "NIPCO Ik-004",
    description: "Complete fuel station operations, sales tracking, and inventory management",
    icon: Fuel,
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    route: "/portal/ik-004",
    isActive: true,
  },
  {
    id: "nipco-ib-005",
    title: "NIPCO Ib-005",
    description: "Complete fuel station operations, sales tracking, and inventory management",
    icon: Fuel,
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    route: "/portal/ib-005",
    isActive: true,
  },
  {
    id: "fleet",
    title: "Fleet Management",
    description: "Vehicle tracking, maintenance scheduling, and driver management",
    icon: Truck,
    color: "from-orange-400 to-orange-500",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    route: "/fleet",
    isActive: false,
  },
]

export default function HomePage() {
  const router = useRouter()

  const handleCardClick = (card: (typeof portalCards)[0]) => {
    if (card.isActive) {
      router.push(card.route)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 text-black shadow-lg">
                <Fuel className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-400">NIPCO Enterprise Portal</h1>
                <p className="text-sm text-gray-400">Integrated Business Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-300">Welcome back</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-300 mb-2">Business Portals</h2>
          <p className="text-gray-400">
            Select a portal to access specialized business operations and management tools
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {portalCards.map((card) => {
            const IconComponent = card.icon
            return (
              <Card
                key={card.id}
                className={`glass-card glass-card-hover rounded-2xl border-gray-700/50 overflow-hidden transition-all duration-300 cursor-pointer group ${
                  card.isActive
                    ? "hover:scale-105 hover:shadow-2xl hover:border-blue-400/50"
                    : "opacity-60 cursor-not-allowed"
                }`}
                onClick={() => handleCardClick(card)}
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl ${card.bgColor} border ${card.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className={`h-8 w-8 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-300 group-hover:text-white transition-colors duration-300">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mb-4">
                    {card.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      variant={card.isActive ? "default" : "ghost"}
                      size="sm"
                      className={`rounded-xl font-medium transition-all duration-300 ${
                        card.isActive
                          ? `bg-gradient-to-r ${card.color} text-black hover:opacity-90`
                          : "text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={!card.isActive}
                    >
                      {card.isActive ? "Access Portal" : "Coming Soon"}
                    </Button>
                    {card.isActive && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400 font-medium">Active</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card rounded-2xl border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Portals</p>
                  <p className="text-2xl font-bold text-blue-400">5</p>
                </div>
                <div className="p-3 bg-blue-400/10 rounded-xl">
                  <Fuel className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Fuel Stations</p>
                  <p className="text-2xl font-bold text-gray-300">5</p>
                </div>
                <div className="p-3 bg-gray-400/10 rounded-xl">
                  <Fuel className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">System Status</p>
                  <p className="text-2xl font-bold text-green-400">Online</p>
                </div>
                <div className="p-3 bg-green-400/10 rounded-xl">
                  <Fuel className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-black">
                <Fuel className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">NIPCO Enterprise Portal</p>
                <p className="text-xs text-gray-400">© 2024 All rights reserved</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Version 1.0.0</p>
              <p className="text-xs text-gray-400">Last updated: Today</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
