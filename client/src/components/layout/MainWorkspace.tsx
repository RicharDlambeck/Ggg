import { useState, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import { formatTime } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InstrumentalGenerator from "@/components/creation/InstrumentalGenerator";
import TrackAssembly from "@/components/creation/TrackAssembly";
import VoiceCloning from "@/components/creation/VoiceCloning";
import { Instrumental, Vocal } from "@shared/schema";

interface MainWorkspaceProps {
  instrumental?: Instrumental;
  vocals?: Vocal[];
  trackId: number;
  onInstrumentalGenerated?: (instrumental: Instrumental) => void;
  onVocalsAdded?: (vocal: Vocal) => void;
}

export default function MainWorkspace({
  instrumental,
  vocals,
  trackId,
  onInstrumentalGenerated,
  onVocalsAdded
}: MainWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("compose");
  const [bpm, setBpm] = useState(instrumental?.bpm || 120);
  const [key, setKey] = useState(instrumental?.key || "C Major");
  
  const {
    isPlaying,
    playPause,
    stop,
    currentTime,
    duration,
    loadInstrumental
  } = useAudio();
  
  // Load dummy audio for demonstration
  useEffect(() => {
    // In a real implementation, we would load the actual audio files
    // For now, we can use a sample audio file
    const loadAudio = async () => {
      try {
        // Sample audio URL (replace with actual URL in production)
        await loadInstrumental('https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1dcd.mp3?filename=electronic-future-beats-117997.mp3');
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };
    
    loadAudio();
  }, []);
  
  const handleBpmChange = (value: string) => {
    setBpm(parseInt(value));
  };
  
  const handleKeyChange = (value: string) => {
    setKey(value);
  };
  
  return (
    <main className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Creation Controls */}
      <div className="bg-card border-b border-border p-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </Button>
          
          <Button variant={isPlaying ? "outline" : "default"} size="icon" onClick={playPause}>
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </Button>
          
          <Button variant="ghost" size="icon" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </Button>
          
          <div className="font-mono text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-muted px-3 py-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground">
              <path d="M12 10V2h-1a4 4 0 0 0-4 4v14"></path>
              <path d="M8 18v-4"></path>
              <circle cx="6" cy="18" r="2"></circle>
              <path d="M16 14v4"></path>
              <circle cx="18" cy="14" r="2"></circle>
            </svg>
            <Select defaultValue={bpm.toString()} onValueChange={handleBpmChange}>
              <SelectTrigger className="border-0 bg-transparent p-0">
                <SelectValue placeholder="BPM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80">80 BPM</SelectItem>
                <SelectItem value="100">100 BPM</SelectItem>
                <SelectItem value="120">120 BPM</SelectItem>
                <SelectItem value="140">140 BPM</SelectItem>
                <SelectItem value="160">160 BPM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center bg-muted px-3 py-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            <Select defaultValue={key} onValueChange={handleKeyChange}>
              <SelectTrigger className="border-0 bg-transparent p-0">
                <SelectValue placeholder="Key" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C Major">C Major</SelectItem>
                <SelectItem value="A Minor">A Minor</SelectItem>
                <SelectItem value="G Major">G Major</SelectItem>
                <SelectItem value="E Minor">E Minor</SelectItem>
                <SelectItem value="F Major">F Major</SelectItem>
                <SelectItem value="D Minor">D Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Settings
          </Button>
        </div>
      </div>
      
      {/* Track Creation Area */}
      <div className="flex-1 overflow-auto p-4">
        {/* Creation Tabs */}
        <Tabs defaultValue="compose" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="voice-cloning">Voice Cloning</TabsTrigger>
            <TabsTrigger value="mix-edit">Mix & Edit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose">
            <InstrumentalGenerator 
              trackId={trackId} 
              existingInstrumental={instrumental}
              onInstrumentalGenerated={onInstrumentalGenerated}
            />
            
            <div className="h-6"></div>
            
            <TrackAssembly 
              instrumentalData={instrumental} 
              vocalsData={vocals}
              currentTime={currentTime}
              isPlaying={isPlaying}
            />
          </TabsContent>
          
          <TabsContent value="voice-cloning">
            <VoiceCloning trackId={trackId} onVocalsAdded={onVocalsAdded} />
          </TabsContent>
          
          <TabsContent value="mix-edit">
            <div className="bg-card rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Mix & Edit Coming Soon</h3>
              <p className="text-muted-foreground">Advanced mixing and editing features will be available in a future update.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
