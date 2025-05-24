"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Phone,
  MapPin,
  Mail,
  Calendar,
  Shield,
  Upload,
  Save,
  X,
  Edit,
  Truck,
  CreditCard,
  Building,
  Users,
  FileText,
} from "lucide-react"

interface Staff {
  id: string
  name: string
  position?: string
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
  salary?: number
  department?: string
  // Driver specific fields
  licenseNumber?: string
  licenseExpiry?: string
  vehicleAssigned?: string
  experienceYears?: number
}

interface StaffModalProps {
  open: boolean
  onClose: () => void
  staff: Staff
  onUpdate: (updatedStaff: Staff) => void
  type: "staff" | "driver"
}

export function StaffModal({ open, onClose, staff, onUpdate, type }: StaffModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Staff>(staff)
  const [tempPhoto, setTempPhoto] = useState<string | null>(staff.photo)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith("guarantor.")) {
      const guarantorField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        guarantor: {
          ...prev.guarantor,
          [guarantorField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string
        setTempPhoto(photoUrl)
        setFormData((prev) => ({ ...prev, photo: photoUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(staff)
    setTempPhoto(staff.photo)
    setIsEditing(false)
  }

  const handleClose = () => {
    if (isEditing) {
      handleCancel()
    }
    onClose()
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

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="mobile-modal md:max-w-4xl glass-card border-gray-800/30 text-white max-h-[90vh] overflow-y-auto mobile-scroll backdrop-blur-xl">
          <DialogHeader className="space-y-4 pb-6 border-b border-gray-800/30">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-2xl font-light text-gray-400">
                <div className="p-3 bg-gray-400/10 rounded-2xl backdrop-blur-sm border border-gray-400/20">
                  {type === "driver" ? <Truck className="h-6 w-6" /> : <User className="h-6 w-6" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-medium">{formData.name}</span>
                  <span className="text-sm text-gray-400 font-normal">
                    {type === "driver" ? "Driver Details" : formData.position}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-8 py-6">
            {/* Personal Information */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/30 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-32 h-32 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border-2 border-gray-700/50 flex items-center justify-center overflow-hidden">
                      {tempPhoto ? (
                        <img
                          src={tempPhoto || "/placeholder.svg"}
                          alt={formData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-gray-500" />
                      )}
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-2 right-2 p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg"
                        >
                          <Upload className="h-4 w-4 text-gray-300" />
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <div
                      className={`badge-modern ${getStatusColor(formData.status)} px-3 py-1 rounded-lg text-sm font-medium`}
                    >
                      {formData.status.replace("-", " ").toUpperCase()}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <User className="h-4 w-4 text-gray-400/70" />
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                        />
                      ) : (
                        <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.name}</p>
                      )}
                    </div>

                    {/* Position/Role */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Building className="h-4 w-4 text-gray-400/70" />
                        {type === "driver" ? "Role" : "Position"}
                      </Label>
                      {isEditing && type === "staff" ? (
                        <Input
                          value={formData.position || ""}
                          onChange={(e) => handleInputChange("position", e.target.value)}
                          className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                        />
                      ) : (
                        <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">
                          {type === "driver" ? "Driver" : formData.position}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Phone className="h-4 w-4 text-green-400/70" />
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                        />
                      ) : (
                        <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.phone}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Mail className="h-4 w-4 text-blue-400/70" />
                        Email Address
                      </Label>
                      {isEditing ? (
                        <Input
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                        />
                      ) : (
                        <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.email}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="space-y-3 md:col-span-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <MapPin className="h-4 w-4 text-purple-400/70" />
                        Address
                      </Label>
                      {isEditing ? (
                        <Textarea
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                          rows={2}
                        />
                      ) : (
                        <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.address}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Shield className="h-4 w-4 text-orange-400/70" />
                        Status
                      </Label>
                      {isEditing ? (
                        <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                          <SelectTrigger className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-gray-700/50 rounded-xl">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="on-leave">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl capitalize">
                          {formData.status.replace("-", " ")}
                        </p>
                      )}
                    </div>

                    {/* Employment Date */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Calendar className="h-4 w-4 text-cyan-400/70" />
                        Employment Date
                      </Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={formData.employmentDate}
                          onChange={(e) => handleInputChange("employmentDate", e.target.value)}
                          className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                        />
                      ) : (
                        <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">
                          {new Date(formData.employmentDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/30 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-green-400 text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {type === "driver" ? "Driver Details" : "Employment Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {type === "staff" ? (
                    <>
                      {/* Department */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                          <Building className="h-4 w-4 text-blue-400/70" />
                          Department
                        </Label>
                        {isEditing ? (
                          <Select
                            value={formData.department || ""}
                            onValueChange={(value) => handleInputChange("department", value)}
                          >
                            <SelectTrigger className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-gray-700/50 rounded-xl">
                              <SelectItem value="Operations">Operations</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Security">Security</SelectItem>
                              <SelectItem value="Maintenance">Maintenance</SelectItem>
                              <SelectItem value="Administration">Administration</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.department}</p>
                        )}
                      </div>

                      {/* Salary */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                          <CreditCard className="h-4 w-4 text-green-400/70" />
                          Monthly Salary
                        </Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={formData.salary || ""}
                            onChange={(e) => handleInputChange("salary", Number.parseFloat(e.target.value))}
                            className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                            placeholder="0"
                          />
                        ) : (
                          <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">
                            NGN {formData.salary?.toLocaleString() || "N/A"}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* License Number */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                          <Shield className="h-4 w-4 text-blue-400/70" />
                          License Number
                        </Label>
                        {isEditing ? (
                          <Input
                            value={formData.licenseNumber || ""}
                            onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                            className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                          />
                        ) : (
                          <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.licenseNumber}</p>
                        )}
                      </div>

                      {/* License Expiry */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                          <Calendar className="h-4 w-4 text-orange-400/70" />
                          License Expiry
                        </Label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={formData.licenseExpiry || ""}
                            onChange={(e) => handleInputChange("licenseExpiry", e.target.value)}
                            className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                          />
                        ) : (
                          <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">
                            {formData.licenseExpiry ? new Date(formData.licenseExpiry).toLocaleDateString() : "N/A"}
                          </p>
                        )}
                      </div>

                      {/* Vehicle Assigned */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                          <Truck className="h-4 w-4 text-purple-400/70" />
                          Vehicle Assigned
                        </Label>
                        {isEditing ? (
                          <Input
                            value={formData.vehicleAssigned || ""}
                            onChange={(e) => handleInputChange("vehicleAssigned", e.target.value)}
                            className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                          />
                        ) : (
                          <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.vehicleAssigned}</p>
                        )}
                      </div>

                      {/* Experience Years */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                          <FileText className="h-4 w-4 text-cyan-400/70" />
                          Experience (Years)
                        </Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={formData.experienceYears || ""}
                            onChange={(e) => handleInputChange("experienceYears", Number.parseInt(e.target.value))}
                            className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                          />
                        ) : (
                          <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">
                            {formData.experienceYears} years
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Guarantor Information */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/30 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-orange-400 text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Guarantor Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Guarantor Name */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <User className="h-4 w-4 text-gray-400/70" />
                      Guarantor Name
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.guarantor.name}
                        onChange={(e) => handleInputChange("guarantor.name", e.target.value)}
                        className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                      />
                    ) : (
                      <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.guarantor.name}</p>
                    )}
                  </div>

                  {/* Guarantor Phone */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Phone className="h-4 w-4 text-green-400/70" />
                      Guarantor Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.guarantor.phone}
                        onChange={(e) => handleInputChange("guarantor.phone", e.target.value)}
                        className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                      />
                    ) : (
                      <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.guarantor.phone}</p>
                    )}
                  </div>

                  {/* Relationship */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Users className="h-4 w-4 text-purple-400/70" />
                      Relationship
                    </Label>
                    {isEditing ? (
                      <Select
                        value={formData.guarantor.relationship}
                        onValueChange={(value) => handleInputChange("guarantor.relationship", value)}
                      >
                        <SelectTrigger className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-gray-700/50 rounded-xl">
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Brother">Brother</SelectItem>
                          <SelectItem value="Sister">Sister</SelectItem>
                          <SelectItem value="Husband">Husband</SelectItem>
                          <SelectItem value="Wife">Wife</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Colleague">Colleague</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.guarantor.relationship}</p>
                    )}
                  </div>

                  {/* Guarantor Address */}
                  <div className="space-y-3 md:col-span-1">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <MapPin className="h-4 w-4 text-blue-400/70" />
                      Guarantor Address
                    </Label>
                    {isEditing ? (
                      <Textarea
                        value={formData.guarantor.address}
                        onChange={(e) => handleInputChange("guarantor.address", e.target.value)}
                        className="bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl"
                        rows={2}
                      />
                    ) : (
                      <p className="text-gray-300 p-3 bg-gray-800/30 rounded-xl">{formData.guarantor.address}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-800/30">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-lime-400 to-lime-500 text-black hover:from-lime-500 hover:to-lime-600 rounded-xl font-medium"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
