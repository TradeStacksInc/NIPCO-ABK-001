"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Calculator,
  Download,
  Plus,
  Minus,
  Send,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react"
import jsPDF from "jspdf"

interface TotalSalesModalProps {
  open: boolean
  onClose: () => void
  salesHistory: any[]
}

interface Expense {
  id: number
  description: string
  amount: number
}

export function TotalSalesModal({ open, onClose, salesHistory }: TotalSalesModalProps) {
  const [selectedShift, setSelectedShift] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" })

  // Add safety check for salesHistory
  const safeSalesHistory = salesHistory || []

  // Get unique dates and shifts from sales history
  const availableDates = [...new Set(safeSalesHistory.map((sale) => sale.date))].sort().reverse()
  const availableShifts = ["Morning", "Afternoon"]

  // Filter sales based on selected date and shift
  const filteredSales = safeSalesHistory.filter((sale) => {
    const matchesDate = !selectedDate || sale.date === selectedDate
    const matchesShift = !selectedShift || sale.shift === selectedShift
    return matchesDate && matchesShift
  })

  // Calculate totals
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netTotal = totalSales - totalExpenses

  const addExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expense: Expense = {
        id: Date.now(),
        description: newExpense.description,
        amount: Number.parseFloat(newExpense.amount),
      }
      setExpenses([...expenses, expense])
      setNewExpense({ description: "", amount: "" })
    }
  }

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const generateTotalSalesPDF = () => {
    const doc = new jsPDF()
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.text("NIPCO UYO 1-002", 105, 20, { align: "center" })

    doc.setFontSize(16)
    doc.text("Total Sales Report", 105, 30, { align: "center" })

    doc.setFontSize(10)
    doc.text(`Generated on: ${currentDate} at ${currentTime}`, 105, 40, { align: "center" })

    // Report Details
    doc.setFontSize(12)
    doc.text("REPORT DETAILS", 20, 60)

    let yPosition = 75
    doc.text(`Date: ${selectedDate || "All Dates"}`, 20, yPosition)
    yPosition += 10
    doc.text(`Shift: ${selectedShift || "All Shifts"}`, 20, yPosition)
    yPosition += 10
    doc.text(`Number of Sales: ${filteredSales.length}`, 20, yPosition)
    yPosition += 20

    // Sales Summary
    doc.text("SALES SUMMARY", 20, yPosition)
    yPosition += 15

    doc.text(`Total Sales Amount: NGN ${totalSales.toLocaleString()}`, 20, yPosition)
    yPosition += 10
    doc.text(`Total Expenses: NGN ${totalExpenses.toLocaleString()}`, 20, yPosition)
    yPosition += 10
    doc.setFont(undefined, "bold")
    doc.text(`Net Total: NGN ${netTotal.toLocaleString()}`, 20, yPosition)
    doc.setFont(undefined, "normal")
    yPosition += 20

    // Expenses Breakdown
    if (expenses.length > 0) {
      doc.text("EXPENSES BREAKDOWN", 20, yPosition)
      yPosition += 15

      expenses.forEach((expense) => {
        doc.text(`• ${expense.description}: NGN ${expense.amount.toLocaleString()}`, 25, yPosition)
        yPosition += 8
      })
      yPosition += 10
    }

    // Sales Details
    if (filteredSales.length > 0) {
      doc.text("SALES DETAILS", 20, yPosition)
      yPosition += 15

      // Table headers
      doc.setFontSize(8)
      doc.text("Staff", 20, yPosition)
      doc.text("Fuel", 50, yPosition)
      doc.text("Liters", 70, yPosition)
      doc.text("Amount", 90, yPosition)
      doc.text("Time", 120, yPosition)
      doc.text("Shift", 150, yPosition)
      yPosition += 8

      // Draw line
      doc.line(20, yPosition, 180, yPosition)
      yPosition += 5

      // Sales data
      safeSalesHistory.forEach((sale) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        doc.text(sale.attendant?.substring(0, 12) || "N/A", 20, yPosition)
        doc.text(sale.nozzle?.split(" ")[0] || "N/A", 50, yPosition)
        doc.text(`${sale.liters || 0}L`, 70, yPosition)
        doc.text(`NGN ${(sale.amount || 0).toLocaleString()}`, 90, yPosition)
        doc.text(sale.time || "N/A", 120, yPosition)
        doc.text(sale.shift || "N/A", 150, yPosition)
        yPosition += 8
      })
    }

    // Footer
    doc.setFontSize(8)
    doc.text("This is a computer-generated document.", 105, 280, { align: "center" })

    const fileName = `Total_Sales_${selectedDate || "All"}_${selectedShift || "All"}_${currentDate}.pdf`
    doc.save(fileName)
  }

  const handleSubmit = () => {
    // Process the total sales data with expenses
    console.log("Total Sales Submitted:", {
      totalSales,
      totalExpenses,
      netTotal,
      expenses,
      filteredSales,
    })

    // Generate PDF
    generateTotalSalesPDF()

    // Close modal
    handleClose()
  }

  const handleClose = () => {
    setSelectedShift("")
    setSelectedDate("")
    setExpenses([])
    setNewExpense({ description: "", amount: "" })
    onClose()
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="mobile-modal md:max-w-5xl glass-card border-gray-800/30 text-white max-h-[90vh] overflow-y-auto mobile-scroll backdrop-blur-xl">
          <DialogHeader className="space-y-4 pb-6 border-b border-gray-800/30">
            <DialogTitle className="flex items-center gap-3 text-2xl font-light text-gray-400">
              <div className="p-3 bg-gray-400/10 rounded-2xl backdrop-blur-sm border border-gray-400/20">
                <Calculator className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-medium">Total Sales Report</span>
                <span className="text-sm text-gray-400 font-normal">Comprehensive sales analysis</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-8 py-6">
            {/* Filters Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-400/10 rounded-xl backdrop-blur-sm border border-blue-400/20">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-200">Report Filters</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                        <Calendar className="h-4 w-4 text-blue-400/70" />
                        Select Date
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="glass-card border-gray-700/50 text-white">
                      <p>Filter sales by specific date</p>
                    </TooltipContent>
                  </Tooltip>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20">
                      <SelectValue placeholder="All dates..." />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                      <SelectItem value="all" className="hover:bg-gray-400/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          All Dates
                        </div>
                      </SelectItem>
                      {availableDates.map((date) => (
                        <SelectItem key={date} value={date} className="hover:bg-gray-400/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            {new Date(date).toLocaleDateString()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                        <Clock className="h-4 w-4 text-orange-400/70" />
                        Select Shift
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="glass-card border-gray-700/50 text-white">
                      <p>Filter sales by work shift</p>
                    </TooltipContent>
                  </Tooltip>
                  <Select value={selectedShift} onValueChange={setSelectedShift}>
                    <SelectTrigger className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20">
                      <SelectValue placeholder="All shifts..." />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-gray-700/50 rounded-xl backdrop-blur-xl">
                      <SelectItem value="all" className="hover:bg-gray-400/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          All Shifts
                        </div>
                      </SelectItem>
                      {availableShifts.map((shift) => (
                        <SelectItem key={shift} value={shift} className="hover:bg-gray-400/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${shift === "Morning" ? "bg-blue-400" : "bg-orange-400"}`}
                            ></div>
                            {shift} Shift
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sales Summary */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/30 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-green-400 text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-400/5 border border-gray-400/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center mb-3">
                      <FileText className="h-8 w-8 text-gray-400/70" />
                    </div>
                    <p className="text-gray-400 text-sm mb-2">Number of Sales</p>
                    <p className="text-3xl font-bold text-gray-400">{filteredSales.length}</p>
                    <p className="text-gray-500 text-xs">transactions</p>
                  </div>
                  <div className="text-center p-6 bg-green-400/5 border border-green-400/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center mb-3">
                      <TrendingUp className="h-8 w-8 text-green-400/70" />
                    </div>
                    <p className="text-gray-400 text-sm mb-2">Total Sales</p>
                    <p className="text-3xl font-bold text-green-400">NGN {totalSales.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">gross revenue</p>
                  </div>
                  <div className="text-center p-6 bg-blue-400/5 border border-blue-400/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center mb-3">
                      {netTotal >= 0 ? (
                        <CheckCircle2 className="h-8 w-8 text-blue-400/70" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-red-400/70" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">Net Total</p>
                    <p className={`text-3xl font-bold ${netTotal >= 0 ? "text-blue-400" : "text-red-400"}`}>
                      NGN {netTotal.toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs">after expenses</p>
                  </div>
                </div>
                {totalExpenses > 0 && (
                  <div className="mt-6 p-4 bg-orange-900/20 border border-orange-800/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-orange-400" />
                        <span className="text-orange-300 font-medium">Total Expenses Deducted:</span>
                      </div>
                      <span className="text-orange-400 font-bold text-lg">NGN {totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses Section */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/30 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-orange-400 text-lg flex items-center gap-2">
                  <span className="text-xs md:text-sm bg-orange-400/20 px-2 py-1 rounded-md border border-orange-400/30 text-orange-400">
                    NGN
                  </span>
                  Expense Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Expense */}
                <div className="space-y-4">
                  <h4 className="text-gray-300 font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Expense
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                        <FileText className="h-4 w-4 text-gray-400/70" />
                        Description
                      </Label>
                      <Input
                        value={newExpense.description}
                        onChange={(e) => setNewExpense((prev) => ({ ...prev, description: e.target.value }))}
                        className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20 placeholder:text-gray-500"
                        placeholder="Enter expense description..."
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-300 tracking-wide">
                        <span className="text-xs bg-green-400/20 px-2 py-1 rounded-md border border-green-400/30 text-green-400">
                          NGN
                        </span>
                        Amount
                      </Label>
                      <Input
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense((prev) => ({ ...prev, amount: e.target.value }))}
                        className="h-12 bg-gray-900/50 border-gray-700/50 text-gray-300 rounded-xl backdrop-blur-sm hover:border-gray-400/30 transition-all duration-300 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-400/20 placeholder:text-gray-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-300 tracking-wide opacity-0">Action</Label>
                      <Button
                        onClick={addExpense}
                        className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-orange-400/25"
                        disabled={!newExpense.description || !newExpense.amount}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Expense
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expenses List */}
                {expenses.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-gray-300 font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Current Expenses
                    </h4>
                    <div className="space-y-3">
                      {expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700/30 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-400/10 rounded-lg">
                              <span className="text-xs bg-orange-400/20 px-2 py-1 rounded-md border border-orange-400/30 text-orange-400">
                                NGN
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300 font-medium">{expense.description}</span>
                              <p className="text-orange-400 font-semibold">NGN {expense.amount.toLocaleString()}</p>
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExpense(expense.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-300"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="glass-card border-gray-700/50 text-white">
                              <p>Remove this expense</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-700/30">
                        <span className="text-gray-300 font-medium">Total Expenses:</span>
                        <span className="text-orange-400 font-bold text-lg">NGN {totalExpenses.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-800/30">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="flex-1 md:flex-none px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              <div className="flex flex-col md:flex-row gap-3 flex-1 md:flex-none">
                <Button
                  onClick={generateTotalSalesPDF}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-blue-400/25"
                  disabled={filteredSales.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-black hover:from-lime-600 hover:to-lime-700 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-lime-400/25"
                  disabled={filteredSales.length === 0}
                >
                  <Send className="h-4 w-4 mr-2 text-black" />
                  Submit Report
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
