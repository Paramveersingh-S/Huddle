'use client';

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import PixelCard from '@/components/ui/PixelCard';
import html2canvas from 'html2canvas';

interface ShareableRecapProps {
  displayName: string;
  totalSpend: number;
  topCategory: string;
  currentStreak: number;
}

export function ShareableRecap({ displayName, totalSpend, topCategory, currentStreak }: ShareableRecapProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      // Create canvas from the card
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0B0B14', // Match bg-base from design
      });

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], 'huddle-recap.png', { type: 'image/png' });

        // Try to share via Web Share API if available and supports files
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'My Huddle Vibe',
              text: 'Check out my weekly money recap on Huddle!',
              files: [file],
            });
            return;
          } catch (error: any) {
            if (error.name !== 'AbortError') {
              console.error('Error sharing:', error);
            }
          }
        }

        // Fallback: Download the image
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'huddle-recap.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to generate shareable image.');
    }
  };

  return (
    <>
      <div className="relative group w-full max-w-sm mx-auto" ref={cardRef}>
        <PixelCard variant="huddle" gap={8} speed={40}>
          {/* Shareable Card Area */}
          <Card className="w-full h-full bg-gradient-to-br from-surface to-background border-none overflow-hidden relative shadow-2xl z-10 flex flex-col justify-between" style={{ aspectRatio: '4/5' }}>
            <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -z-10 -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 p-32 bg-secondary/10 rounded-full blur-3xl -z-10 -ml-16 -mb-16"></div>
            
            <CardHeader className="text-center pb-2 pt-8">
              <div className="font-heading font-bold text-xl tracking-widest text-primary/80 mb-4 uppercase">HUDDLE</div>
              <CardTitle className="text-2xl">{displayName}'s Vibe</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col justify-center space-y-8 py-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Total Splurged</div>
                <div className="text-5xl font-bold font-heading text-primary">₹{totalSpend.toFixed(0)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 px-2">
                <div className="bg-background/80 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                  <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Top Category</div>
                  <div className="text-lg font-bold font-heading capitalize text-secondary break-words">{topCategory || 'None'}</div>
                </div>
                <div className="bg-background/80 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                  <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Current Streak</div>
                  <div className="text-lg font-bold font-heading text-warning flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5" color="currentColor" fill="currentColor" /> {currentStreak}
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="justify-center border-t border-border/20 pt-4 pb-6 mt-auto">
              <div className="text-xs font-medium text-muted-foreground opacity-50">huddle.app/recap</div>
            </CardFooter>
          </Card>
        </PixelCard>
      </div>

      <Button onClick={handleShare} className="w-full font-bold text-lg h-14 shadow-lg shadow-primary/20 active:scale-95 transition-transform rounded-2xl max-w-sm mx-auto flex items-center justify-center">
        Share to Instagram Story
      </Button>
    </>
  );
}
