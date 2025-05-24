"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Fuel, Save, X, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import jsPDF from "jspdf"

interface TankOffloadFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (offload: any) => void
}

// Sample approved purchase orders with driver offload records
const approvedPurchaseOrders = [
  {
    id: "PO-2024-001",
    supplier: "NNPC Lagos",
    fuelType: "PMS",
    expectedVolume: 33000,
    arrivedVolume: 32950,
    driverName: "Ahmed Musa",
    arrivalDate: "2024-01-15T14:30",
    status: "driver-offloaded",
  },
  {
    id: "PO-2024-002",
    supplier: "Total Nigeria",
    fuelType: "AGO",
    expectedVolume: 33000,
    arrivedVolume: 33000,
    driverName: "John Okafor",
    arrivalDate: "2024-01-15T16:45",
    status: "driver-offloaded",
  },
  {
    id: "PO-2024-004",
    supplier: "Conoil Plc",
    fuelType: "AGO",
    expectedVolume: 33000,
    arrivedVolume: 32800,
    driverName: "Ibrahim Suleiman",
    arrivalDate: "2024-01-16T09:15",
    status: "driver-offloaded",
  },
]

// Available tanks
const tanks = [
  { id: "tank-1", name: "Tank 1", fuelType: "AGO", capacity: 10000, currentLevel: 0, status: "empty" },
  { id: "tank-2", name: "Tank 2", fuelType: "PMS", capacity: 10000, currentLevel: 0, status: "empty" },
  { id: "tank-3", name: "Tank 3", fuelType: "AGO", capacity: 10000, currentLevel: 0, status: "empty" },
  { id: "tank-4", name: "Tank 4", fuelType: "PMS", capacity: 10000, currentLevel: 0, status: "empty" },
]

export function TankOffloadForm({ open, onClose, onSubmit }: TankOffloadFormProps) {
  const [formData, setFormData] = useState({
    purchaseOrder: "",
    selectedTank: "",
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
    if (!formData.selectedTank) newErrors.selectedTank = "Please select a tank"

    // Validate fuel type compatibility
    const selectedPO = getSelectedPO()
    const selectedTankData = getSelectedTank()

    if (selectedPO && selectedTankData && selectedPO.fuelType !== selectedTankData.fuelType) {
      newErrors.compatibility = "Selected tank fuel type does not match purchase order fuel type"
    }

    // Validate tank capacity
    if (selectedPO && selectedTankData) {
      const availableCapacity = selectedTankData.capacity - selectedTankData.currentLevel
      if (selectedPO.arrivedVolume > availableCapacity) {
        newErrors.capacity = "Tank does not have sufficient capacity for this volume"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getSelectedPO = () => {
    return approvedPurchaseOrders.find((po) => po.id === formData.purchaseOrder)
  }

  const getSelectedTank = () => {
    return tanks.find((tank) => tank.id === formData.selectedTank)
  }

  const getCompatibleTanks = () => {
    const selectedPO = getSelectedPO()
    if (!selectedPO) return tanks

    return tanks.filter((tank) => tank.fuelType === selectedPO.fuelType)
  }

  const generateTankOffloadPDF = () => {
    const doc = new jsPDF()
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()
    const selectedPO = getSelectedPO()
    const selectedTankData = getSelectedTank()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.text("NIPCO UYO 1-002", 105, 20, { align: "center" })

    doc.setFontSize(14)
    doc.text("Tank Offload Record", 105, 30, { align: "center" })

    doc.setFontSize(10)
    doc.text(`Generated on: ${currentDate} at ${currentTime}`, 105, 40, { align: "center" })

    // Offload Details
    doc.setFontSize(12)
    doc.text("TANK OFFLOAD DETAILS", 20, 60)

    const details = [
      [`Purchase Order:`, selectedPO?.id || "N/A"],
      [`Supplier:`, selectedPO?.supplier || "N/A"],
      [`Driver:`, selectedPO?.driverName || "N/A"],
      [`Fuel Type:`, selectedPO?.fuelType || "N/A"],
      [`Volume Offloaded:`, `${selectedPO?.arrivedVolume.toLocaleString()}L` || "N/A"],
      [`Selected Tank:`, selectedTankData?.name || "N/A"],
      [`Tank Capacity:`, `${selectedTankData?.capacity.toLocaleString()}L` || "N/A"],
      [`Previous Level:`, `${selectedTankData?.currentLevel.toLocaleString()}L` || "N/A"],
      [`New Level:`, `${((selectedTankData?.currentLevel || 0) + (selectedPO?.arrivedVolume || 0)).toLocaleString()}L`],
      [`Offload Date:`, currentDate],
      [`Status:`, "Completed"],
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

    doc.save(`Tank_Offload_${selectedPO?.id}_${selectedTankData?.name}_${currentDate}.pdf`)
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const selectedPO = getSelectedPO()
    const selectedTankData = getSelectedTank()

    const offloadData = {
      ...formData,
      id: Date.now(),
      purchaseOrderDetails: selectedPO,
      tankDetails: selectedTankData,
      offloadedAt: new Date().toISOString(),
      status: "completed",
      volumeOffloaded: selectedPO?.arrivedVolume || 0,
    }

    onSubmit(offloadData)
    generateTankOffloadPDF()
    handleReset()
  }

  const handleReset = () => {
    setFormData({
      purchaseOrder: "",
      selectedTank: "",
    })
    setErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const selectedPO = getSelectedPO()
  const selectedTankData = getSelectedTank()
  const compatibleTanks = getCompatibleTanks()

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="mobile-modal md:max-w-2xl glass-card border-gray-800/30 text-white backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4 pb-6 border-b border-gray-800/30">
            <DialogTitle className="flex items-center gap-3 text-2xl font-light text-gray-400">
              <div className="p-3 bg-gray-400/10 rounded-2xl backdrop-blur-sm border border-gray-400/20">
                <Fuel className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-medium">Tank Offload</span>
                <span className="text-sm text-gray-400 font-normal">Transfer fuel to storage tank</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-400/10 rounded-xl backdrop-blur-sm border border-blue-400/20">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-200">Tank Assignment</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Approved Purchase Order */}
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                        <FileText className="h-4 w-4 text-gray-400/70" />
                        Approved Purchase Order
                        <span className="text-red-400">*</span>
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="glass-card border-gray-700/50 text-white">
                      <p>Select purchase order with completed driver offload</p>
                    </TooltipContent>
                  </Tooltip>
                  <Select
                    value={formData.purchaseOrder}
                    onValueChange={(value) => handleInputChange("purchaseOrder", value)}
                  >
                    <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20">
                      <SelectValue placeholder="Select approved purchase order..." className="text-gray-500" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                      {approvedPurchaseOrders.map((po) => (
                        <SelectItem key={po.id} value={po.id} className="hover:bg-gray-400/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <div className="flex flex-col">
                              <span className="font-medium">{po.id}</span>
                              <span className="text-xs text-gray-400">
                                {po.fuelType} - {po.arrivedVolume.toLocaleString()}L - {po.driverName}
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

                {/* Select Tank */}
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                        <Fuel className="h-4 w-4 text-blue-400/70" />
                        Select Tank
                        <span className="text-red-400">*</span>
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="glass-card border-gray-700/50 text-white">
                      <p>Select compatible storage tank</p>
                    </TooltipContent>
                  </Tooltip>
                  <Select
                    value={formData.selectedTank}
                    onValueChange={(value) => handleInputChange("selectedTank", value)}
                    disabled={!formData.purchaseOrder}
                  >
                    <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20 disabled:opacity-50">
                      <SelectValue placeholder="Select tank..." className="text-gray-500" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                      {compatibleTanks.map((tank) => {
                        const availableCapacity = tank.capacity - tank.currentLevel
                        const isCompatible = !selectedPO || tank.fuelType === selectedPO.fuelType
                        const hasCapacity = !selectedPO || selectedPO.arrivedVolume <= availableCapacity

                        return (
                          <SelectItem
                            key={tank.id}
                            value={tank.id}
                            className="hover:bg-gray-400/10 rounded-lg"
                            disabled={!isCompatible || !hasCapacity}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isCompatible && hasCapacity ? "bg-green-400" : "bg-red-400"
                                }`}
                              ></div>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {tank.name} ({tank.fuelType})
                                </span>
                                <span className="text-xs text-gray-400">
                                  Available: {availableCapacity.toLocaleString()}L / {tank.capacity.toLocaleString()}L
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {errors.selectedTank && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.selectedTank}
                    </p>
                  )}
                </div>
              </div>

              {/* Compatibility Errors */}
              {(errors.compatibility || errors.capacity) && (
                <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="text-red-400 font-medium">{errors.compatibility || errors.capacity}</span>
                  </div>
                </div>
              )}

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
                          <span className="text-gray-400 text-sm">Driver:</span>
                          <span className="text-blue-400 font-semibold">{selectedPO.driverName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Fuel Type:</span>
                          <span className="text-gray-400 font-semibold">{selectedPO.fuelType}</span>
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
                          <span className="text-gray-400 text-sm">Arrived Volume:</span>
                          <span className="text-green-400 font-semibold">
                            {selectedPO.arrivedVolume.toLocaleString()}L
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Arrival Date:</span>
                          <span className="text-gray-400 font-semibold">
                            {new Date(selectedPO.arrivalDate).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tank Details */}
              {selectedTankData && selectedPO && (
                <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/30 backdrop-blur-sm rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                      <Fuel className="h-5 w-5" />
                      Tank Assignment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-400/5 border border-gray-400/20 rounded-xl">
                          <p className="text-gray-400 text-sm mb-2">Current Level</p>
                          <p className="text-2xl font-bold text-gray-400">
                            {selectedTankData.currentLevel.toLocaleString()}L
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-400/5 border border-green-400/20 rounded-xl">
                          <p className="text-gray-400 text-sm mb-2">Adding Volume</p>
                          <p className="text-2xl font-bold text-green-400">
                            +{selectedPO.arrivedVolume.toLocaleString()}L
                          </p>
                        </div>
                        <div className="text-center p-4 bg-blue-400/5 border border-blue-400/20 rounded-xl">
                          <p className="text-gray-400 text-sm mb-2">New Level</p>
                          <p className="text-2xl font-bold text-blue-400">
                            {(selectedTankData.currentLevel + selectedPO.arrivedVolume).toLocaleString()}L
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-4 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-400 text-sm">Current</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          <span className="text-blue-400 text-sm">After Offload</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700/30">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-medium">Tank Utilization:</span>
                          <span className="text-gray-400 font-bold text-lg">
                            {(
                              ((selectedTankData.currentLevel + selectedPO.arrivedVolume) / selectedTankData.capacity) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                  disabled={!formData.purchaseOrder || !formData.selectedTank || Object.keys(errors).length > 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Complete Tank Offload
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
