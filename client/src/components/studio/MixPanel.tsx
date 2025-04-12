import { useState, useRef, useEffect } from "react";
import { Track, ProjectWithTracks } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  PlayCircle, 
  PauseCircle, 
  Save, 
  Download, 
  Volume2, 
  VolumeX, 
  Music,
  Mic
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initiateDownload } from "@/lib/audio-processing";

interface MixPanelProps {
  project: ProjectWithTracks;
}

export default function MixPanel({ project }: MixPanelProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackVolumes, setTrackVolumes] = useState<Record<number, number>>({});
  const [trackMutes, setTrackMutes] = useState<Record<number, boolean>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourcesRef = useRef<Record<number, MediaElementAudioSourceNode>>({});
  const gainNodesRef = useRef<Record<number, GainNode>>({});
  const audioElementsRef = useRef<Record<number, HTMLAudioElement>>({});
  
  // Initialize audio context and track settings
  useEffect(() => {
    // Set default volumes
    const volumes: Record<number, number> = {};
    const mutes: Record<number, boolean> = {};
    
    project.tracks.forEach(track => {
      volumes[track.id] = 80; // 80% default volume
      mutes[track.id] = false;
    });
    
    setTrackVolumes(volumes);
    setTrackMutes(mutes);
    
    // Clean up on unmount
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // Clean up audio elements
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.pause();
        audio.src = "";
      });
    };
  }, [project.tracks]);
  
  const setupAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const context = audioContextRef.current;
    
    project.tracks.forEach(track => {
      if (!track.audioUrl) return;
      
      // Create audio element if it doesn't exist
      if (!audioElementsRef.current[track.id]) {
        const audioElement = new Audio(track.audioUrl);
        audioElement.crossOrigin = "anonymous";
        audioElement.loop = true;
        audioElementsRef.current[track.id] = audioElement;
        
        // Create source and gain nodes
        const source = context.createMediaElementSource(audioElement);
        const gainNode = context.createGain();
        
        source.connect(gainNode);
        gainNode.connect(context.destination);
        
        audioSourcesRef.current[track.id] = source;
        gainNodesRef.current[track.id] = gainNode;
      }
      
      // Set volume
      if (gainNodesRef.current[track.id]) {
        const volume = trackMutes[track.id] ? 0 : trackVolumes[track.id] / 100;
        gainNodesRef.current[track.id].gain.value = volume;
      }
    });
  };
  
  const togglePlayback = () => {
    setupAudio();
    
    if (isPlaying) {
      // Stop all tracks
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.pause();
      });
    } else {
      // Play all tracks
      Object.values(audioElementsRef.current).forEach(audio => {
        audio.currentTime = 0;
        audio.play();
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleVolumeChange = (trackId: number, volume: number) => {
    setTrackVolumes(prev => ({ ...prev, [trackId]: volume }));
    
    if (gainNodesRef.current[trackId]) {
      const actualVolume = trackMutes[trackId] ? 0 : volume / 100;
      gainNodesRef.current[trackId].gain.value = actualVolume;
    }
  };
  
  const toggleMute = (trackId: number) => {
    const newMuteState = !trackMutes[trackId];
    setTrackMutes(prev => ({ ...prev, [trackId]: newMuteState }));
    
    if (gainNodesRef.current[trackId]) {
      gainNodesRef.current[trackId].gain.value = newMuteState ? 0 : trackVolumes[trackId] / 100;
    }
  };
  
  const handleExport = async () => {
    try {
      toast({
        title: "Exporting project",
        description: "Preparing your song for download...",
      });
      
      // In a real implementation, this would mix the audio tracks server-side
      // and return a downloadable file
      setTimeout(() => {
        initiateDownload(`${project.name.replace(/\s+/g, '_')}.mp3`);
        
        toast({
          title: "Export complete",
          description: "Your song has been downloaded successfully.",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your song. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-semibold">Mix Panel - {project.name}</h2>
        <div className="flex gap-3">
          <Button variant="secondary" className="bg-neutral-700 hover:bg-neutral-600">
            <Save className="h-4 w-4 mr-2" /> Save Mix
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export Song
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-6">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg flex items-center">
              Master Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="w-1/3">
                <div className="bg-neutral-700/50 h-32 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{project.tracks.length}</div>
                    <div className="text-sm text-neutral-400">Tracks</div>
                  </div>
                </div>
              </div>
              <div className="w-2/3 pl-6">
                <Button 
                  className={`w-full py-3 mb-4 ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'}`}
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <><PauseCircle className="h-5 w-5 mr-2" /> Stop Playback</>
                  ) : (
                    <><PlayCircle className="h-5 w-5 mr-2" /> Play All Tracks</>
                  )}
                </Button>
                
                <div className="text-sm text-neutral-400 mb-1">Master Volume</div>
                <Slider
                  defaultValue={[80]}
                  max={100}
                  step={1}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.tracks.map((track) => (
            <Card key={track.id} className="bg-neutral-800 border-neutral-700">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-base flex items-center">
                  {track.type === "instrumental" ? (
                    <Music className="h-4 w-4 mr-2 text-primary" />
                  ) : (
                    <Mic className="h-4 w-4 mr-2 text-accent" />
                  )}
                  {track.name}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${trackMutes[track.id] ? 'text-red-500' : 'text-neutral-400'}`}
                  onClick={() => toggleMute(track.id)}
                >
                  {trackMutes[track.id] ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center text-sm">
                    {trackVolumes[track.id] || 0}%
                  </div>
                  <Slider
                    value={[trackVolumes[track.id] || 80]}
                    onValueChange={(values) => handleVolumeChange(track.id, values[0])}
                    max={100}
                    step={1}
                    className="h-2 flex-1"
                  />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${track.type === "instrumental" ? 'bg-primary/20' : 'bg-accent/20'}`}>
                    {track.type === "instrumental" ? (
                      <Music className="h-4 w-4 text-primary" />
                    ) : (
                      <Mic className="h-4 w-4 text-accent" />
                    )}
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="text-xs bg-neutral-700/50 rounded px-2 py-1">
                    {track.type === "instrumental" ? (
                      <span className="capitalize">{track.settings?.genre || "pop"}</span>
                    ) : (
                      <span>Character: {track.settings?.character || 70}%</span>
                    )}
                  </div>
                  <div className="text-xs bg-neutral-700/50 rounded px-2 py-1">
                    {track.type === "instrumental" ? (
                      <span>{track.settings?.tempo || 120} BPM</span>
                    ) : (
                      <span>Clarity: {track.settings?.clarity || 85}%</span>
                    )}
                  </div>
                  <div className="text-xs bg-neutral-700/50 rounded px-2 py-1">
                    {track.type === "instrumental" ? (
                      <span>Key: {track.settings?.key || "C"}</span>
                    ) : (
                      <span>Emotion: {track.settings?.emotion || 60}%</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
