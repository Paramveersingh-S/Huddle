'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, PenTool } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addTransaction } from '@/app/(app)/dashboard/actions'

const CATEGORIES = [
  'food', 'transport', 'subscriptions', 'shopping', 'entertainment', 'bills', 'health', 'education', 'other'
]

export function TransactionEntryDialog({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form State
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().split('T')[0])
  const [source, setSource] = useState('manual')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    const formData = new FormData()
    formData.append('receipt', file)

    try {
      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMerchant(data.merchant || '')
        setAmount(data.amount ? data.amount.toString() : '')
        setCategory(data.category?.toLowerCase() || 'other')
        if (data.occurred_at) {
          setOccurredAt(data.occurred_at)
        }
        setSource('ai_scan')
      } else {
        alert(data.error || 'Failed to scan receipt')
      }
    } catch (err) {
      alert('An error occurred during scanning.')
    } finally {
      setIsScanning(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('merchant', merchant)
      formData.append('amount', amount)
      formData.append('category', category)
      formData.append('occurred_at', occurredAt)
      formData.append('source', source)
      
      await addTransaction(formData)
      setIsOpen(false)
      // Reset form
      setMerchant('')
      setAmount('')
      setCategory('')
      setSource('manual')
    } catch (err) {
      alert('Failed to save transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && React.isValidElement(children) ? (
        <DialogTrigger render={children} />
      ) : children ? (
        <DialogTrigger>{children}</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="font-semibold shadow-lg shadow-primary/20" />}>
          Add Expense
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl tracking-tight">Add Expense</DialogTitle>
          <DialogDescription>
            Scan a receipt with AI or enter it manually.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="scan" className="flex items-center gap-2"><Camera className="w-4 h-4" /> AI Scan</TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2"><PenTool className="w-4 h-4" /> Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan" className="space-y-4">
            <div 
              className="group border-2 border-dashed border-border rounded-lg p-8 text-center bg-surface hover:bg-surface/80 transition-colors cursor-pointer flex flex-col items-center justify-center" 
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
              <Camera className="w-12 h-12 mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
              {isScanning ? (
                <p className="text-sm font-medium animate-pulse text-primary">Scanning receipt with Gemini 1.5 Flash...</p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">Click to upload a receipt or screenshot</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manual">
            {/* The form acts as manual entry */}
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 col-span-2">
               <Label htmlFor="merchant">Merchant</Label>
               <Input id="merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. Starbucks" required className="bg-surface" />
             </div>
             <div className="space-y-2">
               <Label htmlFor="amount">Amount (₹)</Label>
               <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="bg-surface" />
             </div>
             <div className="space-y-2">
               <Label htmlFor="category">Category</Label>
               <Select value={category} onValueChange={setCategory} required>
                 <SelectTrigger className="bg-surface">
                   <SelectValue placeholder="Category" />
                 </SelectTrigger>
                 <SelectContent>
                   {CATEGORIES.map(cat => (
                     <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2 col-span-2">
               <Label htmlFor="occurredAt">Date</Label>
               <Input id="occurredAt" type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} required className="bg-surface" />
             </div>
          </div>
          <Button type="submit" disabled={isScanning || isSubmitting} className="w-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform mt-4 text-base">
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
