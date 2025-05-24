"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Truck, Save, X, FileText, User, Calendar, Gauge, CheckCircle2, AlertCircle } from "lucide-react"
import jsPDF from "jspdf"

interface DriverOffloadFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (offload: any) => void
}

// Sample purchase orders
const purchaseOrders = [
  { id: "PO-2024-001", supplier: "NNPC Lagos", fuelType: "PMS", expectedVolume: 33000, status: "approved" },
  { id: "PO-2024-002", supplier: "Total Nigeria", fuelType: "AGO", expectedVolume: 33000, status: "approved" },
  { id: "PO-2024-003", supplier: "Mobil Oil Nigeria", fuelType: "PMS", expectedVolume: 33000, status: "pending" },
  { id: "PO-2024-004", supplier: "Conoil Plc", fuelType: "AGO", expectedVolume: 33000, status: "approved" },
]

// Sample drivers
const drivers = [
  "Ahmed Musa",
  "John Okafor",
  "Ibrahim Suleiman",
  "Peter Adebayo",
  "Mohammed Ali",
  "David Okonkwo",
  "Fatima Hassan",
  "Grace Okoro",
]

export function DriverOffloadForm({ open, onClose, onSubmit }: DriverOffloadFormProps) {
  const [formData, setFormData] = useState({
    purchaseOrder: "",
    driverName: "",
    dateTime: "",
    volumeArrived: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field-specific errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.purchaseOrder) newErrors.purchaseOrder = "Please select a purchase order"
    if (!formData.driverName) newErrors.driverName = "Please select driver name"
    if (!formData.dateTime) newErrors.dateTime = "Please enter date and time"
    if (!formData.volumeArrived) newErrors.volumeArrived = "Please enter volume arrived"

    if (formData.volumeArrived) {
      const volume = Number.parseFloat(formData.volumeArrived)
      if (volume <= 0) {
        newErrors.volumeArrived = "Volume must be greater than 0"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getSelectedPO = () => {
    return purchaseOrders.find((po) => po.id === formData.purchaseOrder)
  }

  const generateOffloadRecordPDF = () => {
    const doc = new jsPDF()
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()
    const selectedPO = getSelectedPO()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.text("NIPCO UYO 1-002", 105, 20, { align: "center" })

    doc.setFontSize(14)
    doc.text("Driver Offload Record", 105, 30, { align: "center" })

    doc.setFontSize(10)
    doc.text(`Generated on: ${currentDate} at ${currentTime}`, 105, 40, { align: "center" })

    // Offload Details
    doc.setFontSize(12)
    doc.text("OFFLOAD DETAILS", 20, 60)

    const details = [
      [`Purchase Order:`, formData.purchaseOrder],
      [`Supplier:`, selectedPO?.supplier || "N/A"],
      [`Fuel Type:`, selectedPO?.fuelType || "N/A"],
      [`Expected Volume:`, `${selectedPO?.expectedVolume.toLocaleString()}L` || "N/A"],
      [`Driver Name:`, formData.driverName],
      [`Date & Time:`, formData.dateTime],
      [`Volume Arrived:`, `${formData.volumeArrived}L`],
      [`Status:`, "Recorded"],
    ]

    let yPosition = 75
    details.forEach(([label, value]) => {
      doc.text(label, 20, yPosition)
      doc.text(value, 100, yPosition)
      yPosition += 10
    })

    // Footer
    doc.setFontSize(8)
    doc.text("This is a computer-generated document.", 105, 280, { align: "center" })

    doc.save(`Driver_Offload_${formData.purchaseOrder}_${currentDate}.pdf`)
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const selectedPO = getSelectedPO()
    const offloadData = {
      ...formData,
      id: Date.now(),
      purchaseOrderDetails: selectedPO,
      recordedAt: new Date().toISOString(),
      status: "completed",
    }

    onSubmit(offloadData)
    generateOffloadRecordPDF()
    handleReset()
  }

  const handleReset = () => {
    setFormData({
      purchaseOrder: "",
      driverName: "",
      dateTime: "",
      volumeArrived: "",
    })
    setErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  // Set current date and time as default
  const getCurrentDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const selectedPO = getSelectedPO()

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="mobile-modal md:max-w-2xl glass-card border-gray-800/30 text-white backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4 pb-6 border-b border-gray-800/30">
            <DialogTitle className="flex items-center gap-3 text-2xl font-light text-gray-400">
              <div className="p-3 bg-gray-400/10 rounded-2xl backdrop-blur-sm border border-gray-400/20">
                <Truck className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-medium">Driver Offload</span>
                <span className="text-sm text-gray-400 font-normal">Record fuel delivery</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-400/10 rounded-xl backdrop-blur-sm border border-blue-400/20">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-200">Delivery Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Order */}
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                        <FileText className="h-4 w-4 text-gray-400/70" />
                        Purchase Order
                        <span className="text-red-400">*</span>
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="glass-card border-gray-700/50 text-white">
                      <p>Select the approved purchase order</p>
                    </TooltipContent>
                  </Tooltip>
                  <Select
                    value={formData.purchaseOrder}
                    onValueChange={(value) => handleInputChange("purchaseOrder", value)}
                  >
                    <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20">
                      <SelectValue placeholder="Select purchase order..." className="text-gray-500" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                      {purchaseOrders
                        .filter((po) => po.status === "approved")
                        .map((po) => (
                          <SelectItem key={po.id} value={po.id} className="hover:bg-gray-400/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <div className="flex flex-col">
                                <span className="font-medium">{po.id}</span>
                                <span className="text-xs text-gray-400">
                                  {po.supplier} - {po.fuelType} ({po.expectedVolume.toLocaleString()}L)
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.purchaseOrder && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.purchaseOrder}
                    </p>
                  )}
                </div>

                {/* Driver Name */}
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                        <User className="h-4 w-4 text-blue-400/70" />
                        Driver Name
                        <span className="text-red-400">*</span>
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="glass-card border-gray-700/50 text-white">
                      <p>Select the delivery driver</p>
                    </TooltipContent>
                  </Tooltip>
                  <Select value={formData.driverName} onValueChange={(value) => handleInputChange("driverName", value)}>
                    <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20">
                      <SelectValue placeholder="Select driver..." className="text-gray-500" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                      {drivers.map((driver) => (
                        <SelectItem key={driver} value={driver} className="hover:bg-gray-400/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {driver}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.driverName && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.driverName}
                    </p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                        <Calendar className="h-4 w-4 text-orange-400/70" />
                        Date & Time
                        <span className="text-red-400">*</span>
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="glass-card border-gray-700/50 text-white">
                      <p>Enter the delivery date and time</p>
                    </TooltipContent>
                  </Tooltip>
                  <Input
                    type="datetime-local"
                    value={formData.dateTime || getCurrentDateTime()}
                    onChange={(e) => handleInputChange("dateTime", e.target.value)}
                    className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20"
                  />
                  {errors.dateTime && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.dateTime}
                    </p>
                  )}
                </div>

                {/* Volume Arrived */}
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                        <Gauge className="h-4 w-4 text-green-400/70" />
                        Volume Arrived (Liters)
                        <span className="text-red-400">*</span>
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="glass-card border-gray-700/50 text-white">
                      <p>Enter the actual volume delivered</p>
                    </TooltipContent>
                  </Tooltip>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.volumeArrived}
                    onChange={(e) => handleInputChange("volumeArrived", e.target.value)}
                    className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20 placeholder:text-gray-500"
                    placeholder="0.00 liters"
                  />
                  {errors.volumeArrived && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.volumeArrived}
                    </p>
                  )}
                </div>
              </div>

              {/* Purchase Order Details */}
              {selectedPO && (
                <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/30 backdrop-blur-sm rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-green-400 text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Purchase Order Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Supplier:</span>
                          <span className="text-gray-300 font-semibold">{selectedPO.supplier}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Fuel Type:</span>
                          <span className="text-blue-400 font-semibold">{selectedPO.fuelType}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Expected Volume:</span>
                          <span className="text-gray-400 font-semibold">
                            {selectedPO.expectedVolume.toLocaleString()}L
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Status:</span>
                          <span className="text-green-400 font-semibold capitalize">{selectedPO.status}</span>
                        </div>
                      </div>
                    </div>
                    {formData.volumeArrived && (
                      <div className="mt-4 pt-4 border-t border-gray-700/30">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-medium">Volume Variance:</span>
                          <span
                            className={`font-bold text-lg ${
                              Number.parseFloat(formData.volumeArrived) === selectedPO.expectedVolume
                                ? "text-green-400"
                                : "text-orange-400"
                            }`}
                          >
                            {(Number.parseFloat(formData.volumeArrived || "0") - selectedPO.expectedVolume).toFixed(2)}L
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Validation Warning */}
              {formData.volumeArrived && selectedPO && (
                <div
                  className={`p-4 rounded-xl backdrop-blur-sm ${
                    Math.abs(Number.parseFloat(formData.volumeArrived) - selectedPO.expectedVolume) > 100
                      ? "bg-orange-900/20 border border-orange-800/50"
                      : "bg-green-900/20 border border-green-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Math.abs(Number.parseFloat(formData.volumeArrived) - selectedPO.expectedVolume) > 100 ? (
                      <AlertCircle className="h-5 w-5 text-orange-400" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    )}
                    <span
                      className={`font-medium ${
                        Math.abs(Number.parseFloat(formData.volumeArrived) - selectedPO.expectedVolume) > 100
                          ? "text-orange-300"
                          : "text-green-300"
                      }`}
                    >
                      {Math.abs(Number.parseFloat(formData.volumeArrived) - selectedPO.expectedVolume) > 100
                        ? "Volume variance exceeds 100L - Please verify"
                        : "Volume within acceptable range"}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-800/30">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-gradient-to-r from-lime-400 to-lime-500 text-black hover:from-lime-500 hover:to-lime-600 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-lime-400/25"
                  disabled={!formData.purchaseOrder || !formData.driverName || !formData.volumeArrived}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Record Offload
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
