'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addGoal } from '@/app/(app)/goals/actions'

export function GoalEntryDialog({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await addGoal(formData)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && React.isValidElement(children) ? (
        <DialogTrigger render={children} />
      ) : children ? (
        <DialogTrigger>{children}</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="font-semibold shadow-lg shadow-primary/20">Create Goal</Button>} />
      )}
      <DialogContent className="sm:max-w-[425px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl tracking-tight">Create New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input id="title" name="title" required placeholder="e.g. Goa Trip, New Laptop" className="bg-surface border-border text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount (₹)</Label>
            <Input id="targetAmount" name="targetAmount" type="number" required placeholder="50000" className="bg-surface border-border text-base" />
          </div>
          <Button type="submit" className="w-full font-bold h-12 text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            Save Goal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
