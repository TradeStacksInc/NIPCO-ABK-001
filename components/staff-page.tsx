"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Truck, Plus, Search, Filter, User, Phone, MapPin, Calendar, Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffModal } from "@/components/staff-modal"

interface Staff {
  id: string
  name: string
  position: string
  phone: string
  address: string
  email: string
  employmentDate: string
  photo: string | null
  status: "active" | "inactive" | "on-leave"
  guarantor: {
    name: string
    phone: string
    address: string
    relationship: string
  }
  salary: number
  department: string
}

interface Driver {
  id: string
  name: string
  licenseNumber: string
  licenseExpiry: string
  phone: string
  address: string
  email: string
  employmentDate: string
  photo: string | null
  status: "active" | "inactive" | "on-leave"
  guarantor: {
    name: string
    phone: string
    address: string
    relationship: string
  }
  vehicleAssigned: string
  experienceYears: number
}

// Sample staff data
const initialStaffData: Staff[] = [
  {
    id: "staff-001",
    name: "John Doe",
    position: "Pump Attendant",
    phone: "+234 801 234 5678",
    address: "123 Lagos Street, Victoria Island, Lagos",
    email: "john.doe@nipco.com",
    employmentDate: "2023-01-15",
    photo: null,
    status: "active",
    guarantor: {
      name: "Jane Doe",
      phone: "+234 802 345 6789",
      address: "456 Ikoyi Road, Ikoyi, Lagos",
      relationship: "Sister",
    },
    salary: 80000,
    department: "Operations",
  },
  {
    id: "staff-002",
    name: "Mary Smith",
    position: "Cashier",
    phone: "+234 803 456 7890",
    address: "789 Surulere Avenue, Surulere, Lagos",
    email: "mary.smith@nipco.com",
    employmentDate: "2023-03-20",
    photo: null,
    status: "active",
    guarantor: {
      name: "Paul Smith",
      phone: "+234 804 567 8901",
      address: "321 Yaba Street, Yaba, Lagos",
      relationship: "Husband",
    },
    salary: 75000,
    department: "Finance",
  },
  {
    id: "staff-003",
    name: "Peter Johnson",
    position: "Supervisor",
    phone: "+234 805 678 9012",
    address: "654 Ikeja Road, Ikeja, Lagos",
    email: "peter.johnson@nipco.com",
    employmentDate: "2022-11-10",
    photo: null,
    status: "active",
    guarantor: {
      name: "Grace Johnson",
      phone: "+234 806 789 0123",
      address: "987 Agege Road, Agege, Lagos",
      relationship: "Wife",
    },
    salary: 120000,
    department: "Operations",
  },
  {
    id: "staff-004",
    name: "Sarah Wilson",
    position: "Pump Attendant",
    phone: "+234 807 890 1234",
    address: "147 Apapa Road, Apapa, Lagos",
    email: "sarah.wilson@nipco.com",
    employmentDate: "2023-05-08",
    photo: null,
    status: "on-leave",
    guarantor: {
      name: "Michael Wilson",
      phone: "+234 808 901 2345",
      address: "258 Festac Town, Festac, Lagos",
      relationship: "Brother",
    },
    salary: 80000,
    department: "Operations",
  },
  {
    id: "staff-005",
    name: "Mike Brown",
    position: "Security Guard",
    phone: "+234 809 012 3456",
    address: "369 Mushin Road, Mushin, Lagos",
    email: "mike.brown@nipco.com",
    employmentDate: "2022-08-22",
    photo: null,
    status: "active",
    guarantor: {
      name: "Alice Brown",
      phone: "+234 810 123 4567",
      address: "741 Alaba Market, Alaba, Lagos",
      relationship: "Wife",
    },
    salary: 70000,
    department: "Security",
  },
  {
    id: "staff-006",
    name: "Alice Cooper",
    position: "Accountant",
    phone: "+234 811 234 5678",
    address: "852 Lekki Phase 1, Lekki, Lagos",
    email: "alice.cooper@nipco.com",
    employmentDate: "2023-02-14",
    photo: null,
    status: "active",
    guarantor: {
      name: "Robert Cooper",
      phone: "+234 812 345 6789",
      address: "963 Ajah Estate, Ajah, Lagos",
      relationship: "Husband",
    },
    salary: 150000,
    department: "Finance",
  },
  {
    id: "staff-007",
    name: "David Lee",
    position: "Pump Attendant",
    phone: "+234 813 456 7890",
    address: "159 Gbagada Road, Gbagada, Lagos",
    email: "david.lee@nipco.com",
    employmentDate: "2023-07-03",
    photo: null,
    status: "active",
    guarantor: {
      name: "Susan Lee",
      phone: "+234 814 567 8901",
      address: "357 Ketu Market, Ketu, Lagos",
      relationship: "Mother",
    },
    salary: 80000,
    department: "Operations",
  },
  {
    id: "staff-008",
    name: "Emma Davis",
    position: "Maintenance",
    phone: "+234 815 678 9012",
    address: "753 Ojota Road, Ojota, Lagos",
    email: "emma.davis@nipco.com",
    employmentDate: "2022-12-05",
    photo: null,
    status: "inactive",
    guarantor: {
      name: "James Davis",
      phone: "+234 816 789 0123",
      address: "951 Maryland Estate, Maryland, Lagos",
      relationship: "Father",
    },
    salary: 90000,
    department: "Maintenance",
  },
]

// Sample driver data
const initialDriverData: Driver[] = [
  {
    id: "driver-001",
    name: "Ahmed Musa",
    licenseNumber: "LGS-2023-001234",
    licenseExpiry: "2026-12-31",
    phone: "+234 817 890 1234",
    address: "456 Kano Street, Kano State",
    email: "ahmed.musa@nipco.com",
    employmentDate: "2022-06-15",
    photo: null,
    status: "active",
    guarantor: {
      name: "Fatima Musa",
      phone: "+234 818 901 2345",
      address: "789 Kaduna Road, Kaduna State",
      relationship: "Wife",
    },
    vehicleAssigned: "Tanker Truck - NGN 001",
    experienceYears: 8,
  },
  {
    id: "driver-002",
    name: "John Okafor",
    licenseNumber: "LGS-2023-005678",
    licenseExpiry: "2025-08-20",
    phone: "+234 819 012 3456",
    address: "123 Enugu Road, Enugu State",
    email: "john.okafor@nipco.com",
    employmentDate: "2023-01-10",
    photo: null,
    status: "active",
    guarantor: {
      name: "Mary Okafor",
      phone: "+234 820 123 4567",
      address: "321 Onitsha Market, Anambra State",
      relationship: "Sister",
    },
    vehicleAssigned: "Tanker Truck - NGN 002",
    experienceYears: 5,
  },
  {
    id: "driver-003",
    name: "Ibrahim Suleiman",
    licenseNumber: "LGS-2023-009012",
    licenseExpiry: "2027-03-15",
    phone: "+234 821 234 5678",
    address: "789 Sokoto Street, Sokoto State",
    email: "ibrahim.suleiman@nipco.com",
    employmentDate: "2022-09-22",
    photo: null,
    status: "on-leave",
    guarantor: {
      name: "Aisha Suleiman",
      phone: "+234 822 345 6789",
      address: "654 Kebbi Road, Kebbi State",
      relationship: "Wife",
    },
    vehicleAssigned: "Tanker Truck - NGN 003",
    experienceYears: 12,
  },
  {
    id: "driver-004",
    name: "Peter Adebayo",
    licenseNumber: "LGS-2023-003456",
    licenseExpiry: "2026-11-30",
    phone: "+234 823 456 7890",
    address: "147 Ibadan Road, Oyo State",
    email: "peter.adebayo@nipco.com",
    employmentDate: "2023-04-18",
    photo: null,
    status: "active",
    guarantor: {
      name: "Funmi Adebayo",
      phone: "+234 824 567 8901",
      address: "258 Abeokuta Street, Ogun State",
      relationship: "Wife",
    },
    vehicleAssigned: "Tanker Truck - NGN 004",
    experienceYears: 6,
  },
  {
    id: "driver-005",
    name: "Mohammed Ali",
    licenseNumber: "LGS-2023-007890",
    licenseExpiry: "2025-09-12",
    phone: "+234 825 678 9012",
    address: "369 Maiduguri Road, Borno State",
    email: "mohammed.ali@nipco.com",
    employmentDate: "2022-11-08",
    photo: null,
    status: "active",
    guarantor: {
      name: "Zainab Ali",
      phone: "+234 826 789 0123",
      address: "741 Yobe Street, Yobe State",
      relationship: "Sister",
    },
    vehicleAssigned: "Tanker Truck - NGN 005",
    experienceYears: 10,
  },
  {
    id: "driver-006",
    name: "David Okonkwo",
    licenseNumber: "LGS-2023-001122",
    licenseExpiry: "2026-07-25",
    phone: "+234 827 890 1234",
    address: "852 Aba Road, Abia State",
    email: "david.okonkwo@nipco.com",
    employmentDate: "2023-02-28",
    photo: null,
    status: "active",
    guarantor: {
      name: "Chioma Okonkwo",
      phone: "+234 828 901 2345",
      address: "963 Owerri Street, Imo State",
      relationship: "Wife",
    },
    vehicleAssigned: "Tanker Truck - NGN 006",
    experienceYears: 4,
  },
]

interface StaffPageProps {
  onStaffUpdate?: (updatedStaff: Staff[]) => void
}

export function StaffPage({ onStaffUpdate }: StaffPageProps) {
  const [staffData, setStaffData] = useState<Staff[]>(initialStaffData)
  const [driverData, setDriverData] = useState<Driver[]>(initialDriverData)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  // Filter staff based on search and filters
  const filteredStaff = staffData.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter
    const matchesDepartment = departmentFilter === "all" || staff.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  // Filter drivers based on search and filters
  const filteredDrivers = driverData.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStaffClick = (staff: Staff) => {
    setSelectedStaff(staff)
    setShowStaffModal(true)
  }

  const handleDriverClick = (driver: Driver) => {
    setSelectedDriver(driver)
    setShowDriverModal(true)
  }

  const handleStaffUpdate = (updatedStaff: Staff) => {
    const updatedStaffData = staffData.map((staff) => (staff.id === updatedStaff.id ? updatedStaff : staff))
    setStaffData(updatedStaffData)
    onStaffUpdate?.(updatedStaffData)
    setShowStaffModal(false)
  }

  const handleDriverUpdate = (updatedDriver: Driver) => {
    const updatedDriverData = driverData.map((driver) => (driver.id === updatedDriver.id ? updatedDriver : driver))
    setDriverData(updatedDriverData)
    setShowDriverModal(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "inactive":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "on-leave":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const departments = [...new Set(staffData.map((staff) => staff.department))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-300">Staff Management</h1>
            <p className="text-gray-400 mt-2">Manage your station staff and drivers</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-gradient-to-r from-lime-400 to-lime-500 text-black hover:from-lime-500 hover:to-lime-600 rounded-xl font-medium transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add New Staff
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="glass-card border-gray-700/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search staff or drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-gray-700/50 rounded-xl">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Department</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-gray-700/50 rounded-xl">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Actions</label>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setDepartmentFilter("all")
                  }}
                  className="w-full text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="staff" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-1">
            <TabsTrigger
              value="staff"
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-black text-gray-400 rounded-lg px-6 py-2 font-medium transition-all duration-200"
            >
              <Users className="h-4 w-4 mr-2" />
              Staff ({filteredStaff.length})
            </TabsTrigger>
            <TabsTrigger
              value="drivers"
              className="data-[state=active]:bg-lime-400 data-[state=active]:text-black text-gray-400 rounded-lg px-6 py-2 font-medium transition-all duration-200"
            >
              <Truck className="h-4 w-4 mr-2" />
              Drivers ({filteredDrivers.length})
            </TabsTrigger>
          </TabsList>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStaff.map((staff) => (
                <Card
                  key={staff.id}
                  className="glass-card glass-card-hover border-gray-700/50 rounded-2xl cursor-pointer group"
                  onClick={() => handleStaffClick(staff)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      {/* Photo */}
                      <div className="relative w-20 h-20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border-2 border-gray-700/50 flex items-center justify-center overflow-hidden">
                        {staff.photo ? (
                          <img
                            src={staff.photo || "/placeholder.svg"}
                            alt={staff.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-10 w-10 text-gray-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="text-center space-y-2 w-full">
                        <h3 className="font-semibold text-gray-300 text-lg group-hover:text-white transition-colors">
                          {staff.name}
                        </h3>
                        <p className="text-gray-400 text-sm">{staff.position}</p>
                        <Badge className={`badge-modern ${getStatusColor(staff.status)} text-xs`}>
                          {staff.status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </div>

                      {/* Quick Info */}
                      <div className="w-full space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{staff.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{staff.address.split(",")[0]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>Since {new Date(staff.employmentDate).getFullYear()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDrivers.map((driver) => (
                <Card
                  key={driver.id}
                  className="glass-card glass-card-hover border-gray-700/50 rounded-2xl cursor-pointer group"
                  onClick={() => handleDriverClick(driver)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      {/* Photo */}
                      <div className="relative w-20 h-20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border-2 border-gray-700/50 flex items-center justify-center overflow-hidden">
                        {driver.photo ? (
                          <img
                            src={driver.photo || "/placeholder.svg"}
                            alt={driver.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Truck className="h-10 w-10 text-gray-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="text-center space-y-2 w-full">
                        <h3 className="font-semibold text-gray-300 text-lg group-hover:text-white transition-colors">
                          {driver.name}
                        </h3>
                        <p className="text-gray-400 text-sm">Driver</p>
                        <Badge className={`badge-modern ${getStatusColor(driver.status)} text-xs`}>
                          {driver.status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </div>

                      {/* Quick Info */}
                      <div className="w-full space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{driver.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Shield className="h-3 w-3" />
                          <span className="truncate">{driver.licenseNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Truck className="h-3 w-3" />
                          <span className="truncate">{driver.vehicleAssigned}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>{driver.experienceYears} years exp.</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Staff Modal */}
      {selectedStaff && (
        <StaffModal
          open={showStaffModal}
          onClose={() => setShowStaffModal(false)}
          staff={selectedStaff}
          onUpdate={handleStaffUpdate}
          type="staff"
        />
      )}

      {/* Driver Modal */}
      {selectedDriver && (
        <StaffModal
          open={showDriverModal}
          onClose={() => setShowDriverModal(false)}
          staff={selectedDriver as any}
          onUpdate={handleDriverUpdate as any}
          type="driver"
        />
      )}
    </div>
  )
}
