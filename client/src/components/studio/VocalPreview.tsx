import { useState, useEffect, useRef } from "react";
import { Track } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Rewind, 
  PlayCircle, 
  PauseCircle, 
  LaptopMinimal, 
  Repeat1, 
  MoveUp, 
  AudioLines, 
  Download, 
  X
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useWaveform } from "@/hooks/useWaveform";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";

interface VocalPreviewProps {
  track: Track | null;
}

export default function VocalPreview({ track }: VocalPreviewProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState("00:00");
  const [currentTime, setCurrentTime] = useState("00:00");
  const [volume, setVolume] = useState(75);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["pop"]);
  
  const { waveform, isReady } = useWaveform(waveformRef, track?.audioUrl);
  const { 
    isPlaying, 
    togglePlayback, 
    seekBackward, 
    setAudioVolume 
  } = useAudioPlayback(waveform);

  // Update audio volume when slider changes
  useEffect(() => {
    setAudioVolume(volume / 100);
  }, [volume, setAudioVolume]);

  // Function to format time in MM:SS format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Update time displays when waveform progresses
  useEffect(() => {
    if (!waveform) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(formatTime(waveform.getCurrentTime()));
    };
    
    const handleReady = () => {
      setDuration(formatTime(waveform.getDuration()));
    };
    
    waveform.on('audioprocess', handleTimeUpdate);
    waveform.on('ready', handleReady);
    
    return () => {
      waveform.un('audioprocess', handleTimeUpdate);
      waveform.un('ready', handleReady);
    };
  }, [waveform]);

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  return (
    <div className="bg-neutral-800 rounded-xl overflow-hidden flex-1">
      <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
        <h3 className="font-heading font-semibold">Vocal Preview</h3>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-neutral-400">{currentTime} / {duration}</span>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-200 transition h-7 w-7">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="h-32 bg-neutral-700 rounded-lg p-3 mb-4 relative">
          {/* Waveform visualization */}
          <div ref={waveformRef} className="h-full w-full"></div>
          
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-neutral-400">Loading waveform...</div>
            </div>
          )}
        </div>
        
        {/* Audio Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              size="icon" 
              className="w-10 h-10 rounded-full bg-neutral-700 hover:bg-neutral-600 transition"
              onClick={seekBackward}
            >
              <Rewind className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 transition"
              onClick={togglePlayback}
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
                onValueChange={(value) => setVolume(value[0])}
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
        
        {/* Vocal Styles */}
        <div className="mt-5 flex flex-wrap gap-2">
          <h4 className="w-full text-sm text-neutral-400 mb-1">Vocal Styles</h4>
          
          {selectedStyles.map(style => (
            <Button
              key={style}
              variant="outline"
              size="sm"
              className="px-3 py-1.5 bg-primary bg-opacity-20 border border-primary rounded-full text-sm flex items-center text-primary"
              onClick={() => toggleStyle(style)}
            >
              {style} <X className="h-3 w-3 ml-1" />
            </Button>
          ))}
          
          {!selectedStyles.includes("soft") && (
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 transition rounded-full text-sm border-transparent"
              onClick={() => toggleStyle("soft")}
            >
              Soft
            </Button>
          )}
          
          {!selectedStyles.includes("ethereal") && (
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 transition rounded-full text-sm border-transparent"
              onClick={() => toggleStyle("ethereal")}
            >
              Ethereal
            </Button>
          )}
          
          {!selectedStyles.includes("powerful") && (
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 transition rounded-full text-sm border-transparent"
              onClick={() => toggleStyle("powerful")}
            >
              Powerful
            </Button>
          )}
          
          {!selectedStyles.includes("raspy") && (
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 transition rounded-full text-sm border-transparent"
              onClick={() => toggleStyle("raspy")}
            >
              Raspy
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 transition rounded-full text-sm flex items-center border-transparent"
          >
            <span className="mr-0.5">+</span> Add Style
          </Button>
        </div>
      </div>
    </div>
  );
}
