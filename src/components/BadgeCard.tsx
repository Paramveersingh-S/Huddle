'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import React from 'react'

interface BadgeCardProps {
  icon: React.ReactNode
  title: string
  desc: string
  earned: boolean
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
}

export function BadgeCard({ icon, title, desc, earned, tier }: BadgeCardProps) {
  const tierStyles = {
    bronze: 'from-orange-700 via-orange-400 to-orange-800 border-orange-500',
    silver: 'from-gray-300 via-white to-gray-400 border-gray-300',
    gold: 'from-yellow-400 via-yellow-200 to-yellow-600 border-yellow-400',
    diamond: 'from-cyan-300 via-blue-200 to-cyan-500 border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)]',
  }

  const gradient = tierStyles[tier]

  if (!earned) {
    return (
      <Card className="bg-surface/50 border-border overflow-hidden opacity-50 grayscale transition-all">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-muted">
            {icon}
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground leading-snug">{desc}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Card className={`relative overflow-hidden border-2 ${gradient} transition-all duration-300 shadow-lg shadow-black/50`}>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
        
        <CardContent className="p-6 flex items-start gap-4 relative z-10 bg-black/80 backdrop-blur-md m-[2px] rounded-[calc(var(--radius)-2px)]">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-black shadow-inner`}>
            {icon}
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-white drop-shadow-md">{title}</h3>
            <p className="text-sm text-gray-300 leading-snug">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
