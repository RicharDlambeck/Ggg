import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Waveform } from "@/components/ui/waveform";
import { useAudio } from "@/context/AudioContext";
import { Instrumental, Vocal } from "@shared/schema";
import { formatTime } from "@/lib/audio";

interface TrackAssemblyProps {
  instrumentalData?: Instrumental;
  vocalsData?: Vocal[];
  currentTime: number;
  isPlaying: boolean;
}

export default function TrackAssembly({ 
  instrumentalData, 
  vocalsData = [],
  currentTime,
  isPlaying
}: TrackAssemblyProps) {
  const [tracks, setTracks] = useState<{id: string; name: string; type: 'instrumental' | 'vocal'; waveColor: string; volume: number; solo: boolean; mute: boolean}[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [timeMarkerPosition, setTimeMarkerPosition] = useState(0);
  
  const { 
    setInstrumentalVolume, 
    setVocalVolume,
    instrumentalVolume,
    vocalVolume,
    seek,
    duration
  } = useAudio();
  
  // Initialize tracks when data changes
  useEffect(() => {
    const newTracks = [];
    
    if (instrumentalData) {
      newTracks.push({
        id: 'instrumental',
        name: 'Instrumental',
        type: 'instrumental' as const,
        waveColor: 'rgba(139, 92, 246, 0.7)',
        volume: instrumentalVolume,
        solo: false,
        mute: false
      });
    }
    
    if (vocalsData && vocalsData.length > 0) {
      vocalsData.forEach((vocal, index) => {
        newTracks.push({
          id: `vocal-${vocal.id}`,
          name: 'Vocals',
          type: 'vocal' as const,
          waveColor: 'rgba(79, 70, 229, 0.7)',
          volume: vocalVolume,
          solo: false,
          mute: false
        });
      });
    }
    
    setTracks(newTracks);
    if (newTracks.length > 0 && !activeTrackId) {
      setActiveTrackId(newTracks[0].id);
    }
  }, [instrumentalData, vocalsData, instrumentalVolume, vocalVolume]);
  
  // Update time marker position based on current time
  useEffect(() => {
    if (duration) {
      const position = (currentTime / duration) * 100;
      setTimeMarkerPosition(position);
    }
  }, [currentTime, duration]);
  
  // Handle volume change
  const handleVolumeChange = (trackId: string, newVolume: number) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return { ...track, volume: newVolume };
      }
      return track;
    }));
    
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      if (track.type === 'instrumental') {
        setInstrumentalVolume(newVolume);
      } else if (track.type === 'vocal') {
        setVocalVolume(newVolume);
      }
    }
  };
  
  // Handle solo/mute toggle
  const handleSoloMuteToggle = (trackId: string, action: 'solo' | 'mute') => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return { 
          ...track, 
          solo: action === 'solo' ? !track.solo : track.solo,
          mute: action === 'mute' ? !track.mute : track.mute
        };
      }
      return track;
    }));
    
    // In a real implementation, we would adjust playback accordingly
  };
  
  // Handle time marker click (seek)
  const handlePositionChange = (position: number) => {
    if (duration) {
      const newTime = position * duration;
      seek(newTime);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Track Assembly</CardTitle>
          <CardDescription>Combine your instrumental and vocals</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 7h-4"></path>
              <path d="M5 7h-1"></path>
              <path d="M20 7h-1"></path>
              <path d="M14 17h-4"></path>
              <path d="M5 17h-1"></path>
              <path d="M20 17h-1"></path>
              <path d="M8 7v10"></path>
              <path d="M16 7v10"></path>
            </svg>
          </Button>
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </Button>
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </Button>
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Timeline Ruler */}
        <div className="border-b border-border bg-background h-8 flex items-end px-4 relative mb-4 ml-40">
          {/* Time markers */}
          <div className="absolute top-0 left-0 right-0 bottom-0 flex">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`flex-1 border-r border-border relative ${i === 6 ? 'border-r-0' : ''}`}>
                <span className="absolute bottom-1 left-1 text-xs text-muted-foreground font-mono">
                  {formatTime(i * 30)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tracks */}
        <div className="space-y-5">
          {tracks.map(track => (
            <div key={track.id}>
              <div className="flex items-center mb-2">
                <div className="w-40 pr-3 flex items-center">
                  {track.type === 'instrumental' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent mr-2">
                      <path d="M9 18V5l12-2v13"></path>
                      <circle cx="6" cy="18" r="3"></circle>
                      <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  )}
                  <div>
                    <h3 className="text-sm font-medium">{track.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {track.type === 'instrumental' && instrumentalData 
                        ? `${instrumentalData.genre} - ${instrumentalData.mood}` 
                        : track.type === 'vocal' && vocalsData && vocalsData.length > 0
                        ? `Style: ${vocalsData[0].style}`
                        : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`p-1 ${track.mute ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => handleSoloMuteToggle(track.id, 'mute')}
                  >
                    {track.mute ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    )}
                  </Button>
                  <Slider
                    className="w-20"
                    value={[track.volume * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleVolumeChange(track.id, value[0] / 100)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`p-1 ${track.solo ? 'text-secondary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => handleSoloMuteToggle(track.id, 'solo')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13"></path>
                      <circle cx="6" cy="18" r="3"></circle>
                    </svg>
                  </Button>
                </div>
              </div>
              
              {/* Waveform */}
              <div className="relative">
                <div className="ml-40">
                  <Waveform
                    waveformData={Array(100).fill(0).map((_, i) => Math.sin(i / 5) * 50 + 50 + (Math.random() * 20 - 10))}
                    isVocal={track.type === 'vocal'}
                    currentTime={currentTime}
                    duration={duration}
                    playing={isPlaying}
                    onPositionChange={handlePositionChange}
                  />
                </div>
                
                {/* Time marker */}
                <div
                  className="time-marker"
                  style={{ left: `calc(40px + ${timeMarkerPosition}%)` }}
                ></div>
                
                {/* Vocal segments (if available) */}
                {track.type === 'vocal' && vocalsData && vocalsData.length > 0 && (
                  <>
                    <div className="absolute top-0 left-40 ml-[5%] h-full w-[25%] border-2 border-primary/40 rounded flex items-center justify-center bg-primary/10 text-xs text-primary">
                      Verse 1
                    </div>
                    <div className="absolute top-0 left-40 ml-[37%] h-full w-[20%] border-2 border-primary/40 rounded flex items-center justify-center bg-primary/10 text-xs text-primary">
                      Chorus
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {/* Add Track Button */}
          {tracks.length > 0 && (
            <div className="flex ml-40">
              <Button variant="outline" className="w-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Track
              </Button>
            </div>
          )}
          
          {/* Empty state */}
          {tracks.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-muted-foreground">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              <h3 className="text-lg font-medium mb-2">No tracks yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by generating an instrumental or adding vocals
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
