import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Rewind, 
  PlayCircle, 
  PauseCircle, 
  LaptopMinimal, 
  Repeat1, 
  MoveUp, 
  AudioLines 
} from "lucide-react";

interface AudioControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeekBackward: () => void;
  onVolumeChange: (value: number) => void;
  volume: number;
  duration: string;
  currentTime: string;
}

export default function AudioControls({
  isPlaying,
  onTogglePlay,
  onSeekBackward,
  onVolumeChange,
  volume,
  duration,
  currentTime
}: AudioControlsProps) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-end mb-2">
        <span className="text-sm text-neutral-400">{currentTime} / {duration}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="secondary" 
            size="icon" 
            className="w-10 h-10 rounded-full bg-neutral-700 hover:bg-neutral-600 transition"
            onClick={onSeekBackward}
          >
            <Rewind className="h-5 w-5" />
          </Button>
          
          <Button 
            size="icon" 
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 transition"
            onClick={onTogglePlay}
          >
            {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
          </Button>
          
          <Button 
            variant="secondary" 
            size="icon" 
            className="w-10 h-10 rounded-full bg-neutral-700 hover:bg-neutral-600 transition"
          >
            <LaptopMinimal className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-200 transition">
            <Repeat1 className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <MoveUp className="h-4 w-4 text-neutral-400" />
            <Slider
              value={[volume]}
              onValueChange={(value) => onVolumeChange(value[0])}
              max={100}
              step={1}
              className="w-24 h-1.5"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-200 transition">
            <AudioLines className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
