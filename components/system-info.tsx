"use client"

import { useState, useEffect } from "react"
import { Wifi, Monitor, MapPin, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SystemInfo {
  currentTime: string
  currentDate: string
  networkSpeed: string
  location: string
  browser: string
  os: string
  screenResolution: string
  timezone: string
}

export function SystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    currentTime: "",
    currentDate: "",
    networkSpeed: "Checking...",
    location: "Detecting...",
    browser: "",
    os: "",
    screenResolution: "",
    timezone: "",
  })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setSystemInfo((prev) => ({
        ...prev,
        currentTime: now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        currentDate: now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }))
    }

    // Update time immediately and then every second
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)

    // Get system information
    const getSystemInfo = () => {
      // Browser detection
      const userAgent = navigator.userAgent
      let browser = "Unknown"
      if (userAgent.includes("Chrome")) browser = "Chrome"
      else if (userAgent.includes("Firefox")) browser = "Firefox"
      else if (userAgent.includes("Safari")) browser = "Safari"
      else if (userAgent.includes("Edge")) browser = "Edge"

      // OS detection
      let os = "Unknown"
      if (userAgent.includes("Windows")) os = "Windows"
      else if (userAgent.includes("Mac")) os = "macOS"
      else if (userAgent.includes("Linux")) os = "Linux"
      else if (userAgent.includes("Android")) os = "Android"
      else if (userAgent.includes("iOS")) os = "iOS"

      // Screen resolution
      const screenResolution = `${screen.width} × ${screen.height}`

      setSystemInfo((prev) => ({
        ...prev,
        browser,
        os,
        screenResolution,
      }))
    }

    // Get location
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // In a real app, you'd use a reverse geocoding service
            setSystemInfo((prev) => ({
              ...prev,
              location: `${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°`,
            }))
          },
          () => {
            setSystemInfo((prev) => ({
              ...prev,
              location: "Location access denied",
            }))
          },
        )
      } else {
        setSystemInfo((prev) => ({
          ...prev,
          location: "Geolocation not supported",
        }))
      }
    }

    // Test network speed
    const testNetworkSpeed = async () => {
      try {
        const startTime = performance.now()
        await fetch("https://httpbin.org/bytes/1024", { cache: "no-cache" })
        const endTime = performance.now()
        const duration = (endTime - startTime) / 1000
        const speed = (1024 * 8) / (duration * 1000) // Convert to Kbps

        let speedText = ""
        if (speed > 1000) {
          speedText = `${(speed / 1000).toFixed(1)} Mbps`
        } else {
          speedText = `${speed.toFixed(0)} Kbps`
        }

        setSystemInfo((prev) => ({
          ...prev,
          networkSpeed: speedText,
        }))
      } catch (error) {
        setSystemInfo((prev) => ({
          ...prev,
          networkSpeed: "Unable to test",
        }))
      }
    }

    getSystemInfo()
    getLocation()
    testNetworkSpeed()

    return () => clearInterval(timeInterval)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Date & Time */}
      <Card className="glass-card border-gray-700/50 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{systemInfo.currentTime}</p>
              <p className="text-xs text-gray-400">{systemInfo.currentDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Speed */}
      <Card className="glass-card border-gray-700/50 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <Wifi className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{systemInfo.networkSpeed}</p>
              <p className="text-xs text-gray-400">Network Speed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="glass-card border-gray-700/50 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Monitor className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{systemInfo.browser}</p>
              <p className="text-xs text-gray-400">{systemInfo.os}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="glass-card border-gray-700/50 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <MapPin className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{systemInfo.location}</p>
              <p className="text-xs text-gray-400">{systemInfo.timezone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
