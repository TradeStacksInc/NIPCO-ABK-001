"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Calculator,
  Save,
  X,
  ArrowRight,
  ArrowLeft,
  Fuel,
  Users,
  Clock,
  Gauge,
  Zap,
  User,
  TrendingUp,
  Info,
  CheckCircle2,
} from "lucide-react"
import jsPDF from "jspdf"

interface SalesFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (sale: any) => void
}

const staffMembers = [
  "John Doe",
  "Mary Smith",
  "Peter Johnson",
  "Sarah Wilson",
  "Mike Brown",
  "Alice Cooper",
  "David Lee",
  "Emma Davis",
]

const dispensers = ["Pump 1", "Pump 2", "Pump 3", "Pump 4"]

const fuelPrices = {
  AGO: 830,
  PMS: 830,
}

const tankMapping = {
  AGO: ["Tank 1", "Tank 3"],
  PMS: ["Tank 2", "Tank 4"],
}

export function SalesForm({ open, onClose, onSubmit }: SalesFormProps) {
  const [currentSection, setCurrentSection] = useState(1)
  const [formData, setFormData] = useState({
    fuelType: "",
    staffMember: "",
    shift: "",
    dispenser: "",
    nozzle: "",
    openingReading: "",
    closingReading: "",
    customerName: "",
    vehicleNumber: "",
    paymentMethod: "",
  })

  const [calculatedData, setCalculatedData] = useState({
    volume: 0,
    amount: 0,
    price: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get available nozzles based on selected dispenser and fuel type
  const getAvailableNozzles = () => {
    if (!formData.dispenser || !formData.fuelType) return []

    const pumpNumber = formData.dispenser.split(" ")[1]
    return [`${formData.fuelType} ${pumpNumber}a`, `${formData.fuelType} ${pumpNumber}b`]
  }

  // Calculate volume and amount when readings change
  useEffect(() => {
    if (formData.openingReading && formData.closingReading && formData.fuelType) {
      const opening = Number.parseFloat(formData.openingReading)
      const closing = Number.parseFloat(formData.closingReading)

      if (closing > opening) {
        const volume = closing - opening
        const price = fuelPrices[formData.fuelType as keyof typeof fuelPrices]
        const amount = volume * price

        setCalculatedData({
          volume: Math.round(volume * 100) / 100,
          amount: Math.round(amount),
          price,
        })

        // Clear reading error if calculation is valid
        if (errors.readings) {
          setErrors((prev) => ({ ...prev, readings: "" }))
        }
      } else {
        setCalculatedData({ volume: 0, amount: 0, price: 0 })
        if (closing <= opening && formData.closingReading) {
          setErrors((prev) => ({ ...prev, readings: "Closing reading must be greater than opening reading" }))
        }
      }
    } else {
      setCalculatedData({ volume: 0, amount: 0, price: 0 })
    }
  }, [formData.openingReading, formData.closingReading, formData.fuelType, errors.readings])

  // Reset nozzle when dispenser or fuel type changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, nozzle: "" }))
  }, [formData.dispenser, formData.fuelType])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field-specific errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateSection1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fuelType) newErrors.fuelType = "Please select fuel type"
    if (!formData.staffMember) newErrors.staffMember = "Please select staff member"
    if (!formData.shift) newErrors.shift = "Please select shift"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSection2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.dispenser) newErrors.dispenser = "Please select dispenser"
    if (!formData.nozzle) newErrors.nozzle = "Please select nozzle"
    if (!formData.openingReading) newErrors.openingReading = "Please enter opening reading"
    if (!formData.closingReading) newErrors.closingReading = "Please enter closing reading"

    if (formData.openingReading && formData.closingReading) {
      const opening = Number.parseFloat(formData.openingReading)
      const closing = Number.parseFloat(formData.closingReading)
      if (closing <= opening) {
        newErrors.readings = "Closing reading must be greater than opening reading"
      }
    }

    if (calculatedData.volume <= 0) {
      newErrors.volume = "Volume must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentSection === 1 && validateSection1()) {
      setCurrentSection(2)
    } else if (currentSection === 2 && validateSection2()) {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1)
      setErrors({})
    }
  }

  const generateSalesRecordPDF = () => {
    const doc = new jsPDF()
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.text("NIPCO UYO 1-002", 105, 20, { align: "center" })

    doc.setFontSize(14)
    doc.text("Fuel Station Sales Record", 105, 30, { align: "center" })

    doc.setFontSize(10)
    doc.text(`Generated on: ${currentDate} at ${currentTime}`, 105, 40, { align: "center" })

    // Sale Details
    doc.setFontSize(12)
    doc.text("SALE DETAILS", 20, 60)

    const details = [
      [`Staff Member:`, formData.staffMember],
      [`Customer Name:`, formData.customerName],
      [`Vehicle Number:`, formData.vehicleNumber || "N/A"],
      [`Fuel Type:`, formData.fuelType],
      [`Shift:`, formData.shift],
      [`Dispenser:`, formData.dispenser],
      [`Nozzle:`, formData.nozzle],
      [`Opening Reading:`, `${formData.openingReading}L`],
      [`Closing Reading:`, `${formData.closingReading}L`],
      [`Volume Sold:`, `${calculatedData.volume}L`],
      [`Unit Price:`, `NGN ${calculatedData.price}`],
      [`Total Amount:`, `NGN ${calculatedData.amount.toLocaleString()}`],
      [`Payment Method:`, formData.paymentMethod],
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

    doc.save(`Sales_Record_${formData.staffMember}_${currentDate}.pdf`)
  }

  const handleSubmit = () => {
    // Get appropriate tank based on fuel type
    const availableTanks = tankMapping[formData.fuelType as keyof typeof tankMapping]
    const selectedTank = availableTanks[0] // Default to first available tank

    const saleData = {
      attendant: formData.staffMember,
      tank: selectedTank,
      dispenser: formData.dispenser,
      nozzle: formData.nozzle,
      price: calculatedData.price,
      liters: calculatedData.volume,
      amount: calculatedData.amount,
      shift: formData.shift,
      openingReading: Number.parseFloat(formData.openingReading),
      closingReading: Number.parseFloat(formData.closingReading),
      customerName: "Walk-in Customer", // Default value
      vehicleNumber: "", // Default empty
      paymentMethod: "Cash", // Default payment method
    }

    onSubmit(saleData)
    generateSalesRecordPDF()
    handleReset()
  }

  const handleReset = () => {
    setFormData({
      fuelType: "",
      staffMember: "",
      shift: "",
      dispenser: "",
      nozzle: "",
      openingReading: "",
      closingReading: "",
      customerName: "",
      vehicleNumber: "",
      paymentMethod: "",
    })
    setCalculatedData({ volume: 0, amount: 0, price: 0 })
    setErrors({})
    setCurrentSection(1)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const getSectionProgress = () => {
    return (currentSection / 2) * 100
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="mobile-modal md:max-w-3xl glass-card border-gray-800/30 text-white backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4 pb-6 border-b border-gray-800/30">
            <DialogTitle className="flex items-center gap-3 text-2xl font-light text-gray-400">
              <div className="p-3 bg-gray-400/10 rounded-2xl backdrop-blur-sm border border-gray-400/20">
                <Calculator className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-medium">Register New Sale</span>
                <span className="text-sm text-gray-400 font-normal">Section {currentSection} of 2</span>
              </div>
            </DialogTitle>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800/50 rounded-full h-2 backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-lime-400 to-lime-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getSectionProgress()}%` }}
              />
            </div>
          </DialogHeader>

          <div className="grid gap-8 py-6">
            {/* Section 1: Basic Information */}
            {currentSection === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-400/10 rounded-xl backdrop-blur-sm border border-blue-400/20">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-200">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fuel Type */}
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                          <Fuel className="h-4 w-4 text-gray-400/70" />
                          Fuel Type
                          <span className="text-red-400">*</span>
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent className="glass-card border-gray-700/50 text-white">
                        <p>Select the type of fuel being dispensed</p>
                      </TooltipContent>
                    </Tooltip>
                    <Select value={formData.fuelType} onValueChange={(value) => handleInputChange("fuelType", value)}>
                      <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20">
                        <SelectValue placeholder="Choose fuel type..." className="text-gray-500" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                        <SelectItem value="AGO" className="hover:bg-gray-400/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            AGO (Automotive Gas Oil)
                          </div>
                        </SelectItem>
                        <SelectItem value="PMS" className="hover:bg-gray-400/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            PMS (Premium Motor Spirit)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.fuelType && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.fuelType}
                      </p>
                    )}
                  </div>

                  {/* Staff Member */}
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                          <Users className="h-4 w-4 text-blue-400/70" />
                          Staff Member
                          <span className="text-red-400">*</span>
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent className="glass-card border-gray-700/50 text-white">
                        <p>Select the staff member handling this sale</p>
                      </TooltipContent>
                    </Tooltip>
                    <Select
                      value={formData.staffMember}
                      onValueChange={(value) => handleInputChange("staffMember", value)}
                    >
                      <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20">
                        <SelectValue placeholder="Select staff member..." className="text-gray-500" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                        {staffMembers.map((staff) => (
                          <SelectItem key={staff} value={staff} className="hover:bg-gray-400/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              {staff}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.staffMember && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.staffMember}
                      </p>
                    )}
                  </div>

                  {/* Shift */}
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                          <Clock className="h-4 w-4 text-orange-400/70" />
                          Shift
                          <span className="text-red-400">*</span>
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent className="glass-card border-gray-700/50 text-white">
                        <p>Select the current working shift</p>
                      </TooltipContent>
                    </Tooltip>
                    <Select value={formData.shift} onValueChange={(value) => handleInputChange("shift", value)}>
                      <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20">
                        <SelectValue placeholder="Select shift..." className="text-gray-500" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                        <SelectItem value="Morning" className="hover:bg-gray-400/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            Morning Shift
                          </div>
                        </SelectItem>
                        <SelectItem value="Afternoon" className="hover:bg-gray-400/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            Afternoon Shift
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.shift && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.shift}
                      </p>
                    )}
                  </div>

                  {/* Price Display */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                      <TrendingUp className="h-4 w-4 text-green-400/70" />
                      Price per Liter
                    </Label>
                    <div className="h-12 p-4 bg-gradient-to-r from-green-400/5 to-green-400/10 border border-green-400/20 rounded-xl backdrop-blur-sm flex items-center">
                      <span className="text-green-400 font-semibold text-lg">
                        NGN{" "}
                        {formData.fuelType
                          ? fuelPrices[formData.fuelType as keyof typeof fuelPrices].toLocaleString()
                          : "0"}
                      </span>
                      <span className="text-gray-400 ml-2 text-sm">per liter</span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-end pt-6 border-t border-gray-800/30">
                  <Button
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-lime-400 to-lime-500 text-black hover:from-lime-500 hover:to-lime-600 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-lime-400/25"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Section 2: Pump & Readings */}
            {currentSection === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-400/10 rounded-xl backdrop-blur-sm border border-purple-400/20">
                    <Gauge className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-200">Pump & Meter Readings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dispenser */}
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                          <Zap className="h-4 w-4 text-purple-400/70" />
                          Dispenser
                          <span className="text-red-400">*</span>
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent className="glass-card border-gray-700/50 text-white">
                        <p>Select the fuel dispenser pump</p>
                      </TooltipContent>
                    </Tooltip>
                    <Select value={formData.dispenser} onValueChange={(value) => handleInputChange("dispenser", value)}>
                      <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20">
                        <SelectValue placeholder="Select dispenser..." className="text-gray-500" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                        {dispensers.map((dispenser) => (
                          <SelectItem key={dispenser} value={dispenser} className="hover:bg-gray-400/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-gray-400" />
                              {dispenser}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.dispenser && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.dispenser}
                      </p>
                    )}
                  </div>

                  {/* Nozzle */}
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                          <Fuel className="h-4 w-4 text-cyan-400/70" />
                          Nozzle
                          <span className="text-red-400">*</span>
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent className="glass-card border-gray-700/50 text-white">
                        <p>Select the specific nozzle used</p>
                      </TooltipContent>
                    </Tooltip>
                    <Select
                      value={formData.nozzle}
                      onValueChange={(value) => handleInputChange("nozzle", value)}
                      disabled={!formData.dispenser || !formData.fuelType}
                    >
                      <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20 disabled:opacity-50">
                        <SelectValue placeholder="Select nozzle..." className="text-gray-500" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                        {getAvailableNozzles().map((nozzle) => (
                          <SelectItem key={nozzle} value={nozzle} className="hover:bg-gray-400/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Fuel className="h-4 w-4 text-gray-400" />
                              {nozzle}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.nozzle && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.nozzle}
                      </p>
                    )}
                  </div>

                  {/* Opening Reading */}
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                          <Gauge className="h-4 w-4 text-blue-400/70" />
                          Opening Reading
                          <span className="text-red-400">*</span>
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent className="glass-card border-gray-700/50 text-white">
                        <p>Enter the meter reading before dispensing</p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.openingReading}
                      onChange={(e) => handleInputChange("openingReading", e.target.value)}
                      className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20 placeholder:text-gray-500"
                      placeholder="0.00 liters"
                    />
                    {errors.openingReading && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.openingReading}
                      </p>
                    )}
                  </div>

                  {/* Closing Reading */}
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                          <Gauge className="h-4 w-4 text-green-400/70" />
                          Closing Reading
                          <span className="text-red-400">*</span>
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent className="glass-card border-gray-700/50 text-white">
                        <p>Enter the meter reading after dispensing</p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.closingReading}
                      onChange={(e) => handleInputChange("closingReading", e.target.value)}
                      className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20 placeholder:text-gray-500"
                      placeholder="0.00 liters"
                    />
                    {errors.closingReading && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.closingReading}
                      </p>
                    )}
                  </div>
                </div>

                {/* Error Messages */}
                {(errors.readings || errors.volume) && (
                  <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl backdrop-blur-sm">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <X className="h-4 w-4" />
                      {errors.readings || errors.volume}
                    </p>
                  </div>
                )}

                {/* Calculation Results */}
                <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/30 backdrop-blur-sm rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-green-400 text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Calculated Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gray-400/5 border border-gray-400/20 rounded-xl backdrop-blur-sm">
                        <p className="text-gray-400 text-sm mb-2">Volume Sold</p>
                        <p className="text-3xl font-bold text-gray-400">{calculatedData.volume}</p>
                        <p className="text-gray-500 text-xs">liters</p>
                      </div>
                      <div className="text-center p-4 bg-blue-400/5 border border-blue-400/20 rounded-xl backdrop-blur-sm">
                        <p className="text-gray-400 text-sm mb-2">Unit Price</p>
                        <p className="text-3xl font-bold text-blue-400">NGN {calculatedData.price}</p>
                        <p className="text-gray-500 text-xs">per liter</p>
                      </div>
                      <div className="text-center p-4 bg-green-400/5 border border-green-400/20 rounded-xl backdrop-blur-sm">
                        <p className="text-gray-400 text-sm mb-2">Total Amount</p>
                        <p className="text-3xl font-bold text-green-400">
                          NGN {calculatedData.amount.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-xs">total cost</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t border-gray-800/30">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-lime-400 to-lime-500 text-black hover:from-lime-500 hover:to-lime-600 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-lime-400/25"
                    disabled={calculatedData.volume <= 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Complete Sale
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
