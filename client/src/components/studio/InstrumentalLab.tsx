import { useState, useRef, useEffect } from "react";
import { Track } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Music, 
  AudioWaveform, 
  RefreshCw, 
  Save, 
  Piano, 
  Guitar, 
  Drumstick, 
  Mic 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWaveform } from "@/hooks/useWaveform";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface InstrumentalLabProps {
  projectId: number;
  track: Track | null;
}

export default function InstrumentalLab({ projectId, track }: InstrumentalLabProps) {
  const { toast } = useToast();
  const waveformRef = useRef<HTMLDivElement>(null);
  
  // State for the instrumental parameters
  const [genre, setGenre] = useState(track?.settings?.genre || "pop");
  const [tempo, setTempo] = useState(track?.settings?.tempo || 120);
  const [key, setKey] = useState(track?.settings?.key || "C");
  const [mood, setMood] = useState(track?.settings?.mood || "energetic");
  const [instruments, setInstruments] = useState<string[]>(
    track?.settings?.instruments || ["piano", "guitar", "drums", "bass"]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Set up waveform and audio playback
  const { waveform, isReady } = useWaveform(waveformRef, track?.audioUrl);
  const { 
    isPlaying, 
    togglePlayback
  } = useAudioPlayback(waveform);

  // Update track data when track changes
  useEffect(() => {
    if (track && track.settings) {
      setGenre(track.settings.genre || "pop");
      setTempo(track.settings.tempo || 120);
      setKey(track.settings.key || "C");
      setMood(track.settings.mood || "energetic");
      setInstruments(track.settings.instruments || ["piano", "guitar", "drums", "bass"]);
    }
  }, [track]);

  const toggleInstrument = (instrument: string) => {
    if (instruments.includes(instrument)) {
      setInstruments(instruments.filter(i => i !== instrument));
    } else {
      setInstruments([...instruments, instrument]);
    }
  };

  const handleGenerateInstrumental = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: "Generating instrumental",
        description: "This may take a few moments...",
      });
      
      const response = await apiRequest("POST", "/api/generate/instrumental", {
        genre,
        tempo,
        key,
        mood,
        duration: 180, // 3 minutes
      });
      
      const { audioUrl } = await response.json();
      
      // If we have a track, update it; otherwise create a new one
      if (track) {
        await apiRequest("PUT", `/api/tracks/${track.id}`, {
          settings: {
            genre,
            tempo,
            key,
            mood,
            instruments
          },
          audioUrl
        });
      } else {
        await apiRequest("POST", "/api/tracks", {
          name: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Beat`,
          projectId,
          type: "instrumental",
          settings: {
            genre,
            tempo,
            key,
            mood,
            instruments
          },
          audioUrl
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      if (track) {
        queryClient.invalidateQueries({ queryKey: [`/api/tracks/${track.id}`] });
      }
      
      toast({
        title: "Instrumental generated",
        description: "Your new instrumental track is ready.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Could not generate instrumental. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrack = async () => {
    if (!track) return;
    
    try {
      await apiRequest("PUT", `/api/tracks/${track.id}`, {
        settings: {
          genre,
          tempo,
          key,
          mood,
          instruments
        }
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/tracks/${track.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      
      toast({
        title: "Settings saved",
        description: "Your instrumental settings have been saved.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      <div className="col-span-2">
        <Card className="bg-neutral-800 border-neutral-700 h-full flex flex-col">
          <CardHeader className="border-b border-neutral-700">
            <div className="flex justify-between items-center">
              <CardTitle className="font-heading flex items-center">
                <AudioWaveform className="h-5 w-5 mr-2 text-primary" />
                Instrumental Preview
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleSaveTrack} disabled={!track}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
            <CardDescription>
              Preview your generated instrumental track
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="bg-neutral-700 rounded-lg p-4 flex-1 mb-4 relative">
              <div ref={waveformRef} className="h-full w-full"></div>
              
              {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {track?.audioUrl ? (
                    <div className="animate-pulse text-neutral-400">Loading waveform...</div>
                  ) : (
                    <div className="text-neutral-400 text-center">
                      <Music className="h-12 w-12 mx-auto mb-2 text-neutral-600" />
                      <p>No instrumental track loaded</p>
                      <p className="text-sm mt-1">Generate a track to see the waveform</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <Button 
                className="px-6 py-2 bg-primary hover:bg-primary/90"
                onClick={togglePlayback}
                disabled={!isReady}
              >
                {isPlaying ? "Pause" : "Play"} Preview
              </Button>
              
              <Button 
                className="px-6 py-2 bg-accent hover:bg-accent/90"
                onClick={handleGenerateInstrumental}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg">Genre & Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button 
                variant="outline" 
                className={`${genre === "pop" ? "bg-primary/20 border-primary text-primary" : "bg-neutral-700 border-transparent"}`}
                onClick={() => setGenre("pop")}
              >
                Pop
              </Button>
              <Button 
                variant="outline" 
                className={`${genre === "rock" ? "bg-primary/20 border-primary text-primary" : "bg-neutral-700 border-transparent"}`}
                onClick={() => setGenre("rock")}
              >
                Rock
              </Button>
              <Button 
                variant="outline" 
                className={`${genre === "electronic" ? "bg-primary/20 border-primary text-primary" : "bg-neutral-700 border-transparent"}`}
                onClick={() => setGenre("electronic")}
              >
                Electronic
              </Button>
              <Button 
                variant="outline" 
                className={`${genre === "hip-hop" ? "bg-primary/20 border-primary text-primary" : "bg-neutral-700 border-transparent"}`}
                onClick={() => setGenre("hip-hop")}
              >
                Hip-Hop
              </Button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-sm text-neutral-400">Tempo (BPM)</label>
                <span className="text-sm">{tempo}</span>
              </div>
              <Slider
                value={[tempo]}
                onValueChange={(value) => setTempo(value[0])}
                min={60}
                max={180}
                step={1}
                className="h-2"
              />
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-neutral-400 block mb-1">Key</label>
              <select 
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded p-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="C">C Major</option>
                <option value="Cm">C Minor</option>
                <option value="D">D Major</option>
                <option value="Dm">D Minor</option>
                <option value="E">E Major</option>
                <option value="Em">E Minor</option>
                <option value="F">F Major</option>
                <option value="Fm">F Minor</option>
                <option value="G">G Major</option>
                <option value="Gm">G Minor</option>
                <option value="A">A Major</option>
                <option value="Am">A Minor</option>
                <option value="B">B Major</option>
                <option value="Bm">B Minor</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-neutral-400 block mb-1">Mood</label>
              <select 
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded p-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="energetic">Energetic</option>
                <option value="relaxed">Relaxed</option>
                <option value="dark">Dark</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="dreamy">Dreamy</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg">Instruments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className={`flex items-center justify-start ${instruments.includes("piano") ? "bg-primary/20 border-primary text-primary" : "bg-neutral-700 border-transparent"}`}
                onClick={() => toggleInstrument("piano")}
              >
                <Piano className="h-4 w-4 mr-2" /> Piano
              </Button>
              <Button 
                variant="outline" 
                className={`flex items-center justify-start ${instruments.includes("guitar") ? "bg-primary/20 border-primary text-primary" : "bg-neutral-700 border-transparent"}`}
                onClick={() => toggleInstrument("guitar")}
              >
                <Guitar className="h-4 w-4 mr-2" /> Guitar
              </Button>
              <Button 
                variant="outline" 
                className={`flex items-center justify-start ${instruments.includes("drums") ? "bg-primary/20 border-primary text-primary" : "bg-neutral-700 border-transparent"}`}
                onClick={() => toggleInstrument("drums")}
              >
                <Drumstick className="h-4 w-4 mr-2" /> Drums
              </Button>
              <Button 
                variant="outline" 
                className={`flex items-center justify-start ${instruments.includes("bass") ? "bg-primary/20 border-primary text-primary" : "bg-neutral-700 border-transparent"}`}
                onClick={() => toggleInstrument("bass")}
              >
                <AudioWaveform className="h-4 w-4 mr-2" /> Bass
              </Button>
              <Button 
                variant="outline" 
                className={`flex items-center justify-start ${instruments.includes("synth") ? "bg-primary/20 border-primary text-primary" : "bg-neutral-700 border-transparent"}`}
                onClick={() => toggleInstrument("synth")}
              >
                <Music className="h-4 w-4 mr-2" /> Synth
              </Button>
              <Button 
                variant="outline" 
                className={`flex items-center justify-start ${instruments.includes("strings") ? "bg-primary/20 border-primary text-primary" : "bg-neutral-700 border-transparent"}`}
                onClick={() => toggleInstrument("strings")}
              >
                <Music className="h-4 w-4 mr-2" /> Strings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
