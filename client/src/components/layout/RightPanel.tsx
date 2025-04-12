import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Vocal, VoiceModel } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface RightPanelProps {
  trackId: number;
  vocal?: Vocal;
  onVocalGenerated?: (vocal: Vocal) => void;
}

export default function RightPanel({ trackId, vocal, onVocalGenerated }: RightPanelProps) {
  const { toast } = useToast();
  
  // State for form
  const [voiceModelId, setVoiceModelId] = useState<number>(vocal?.voiceModelId || 1);
  const [lyrics, setLyrics] = useState<string>(vocal?.lyrics || "");
  const [style, setStyle] = useState<string>(vocal?.style || "Happy");
  const [settings, setSettings] = useState<any>(vocal?.settings || {
    pitch: 0,
    clarity: 2,
    vibrato: -1,
    autoTune: false,
    matchRhythm: true,
    reverb: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch voice models
  const { data: voiceModelsData, isLoading: voiceModelsLoading } = useQuery({
    queryKey: ['/api/voice-models'],
    staleTime: 30000,
  });
  
  const voiceModels = voiceModelsData?.voiceModels || [];
  
  useEffect(() => {
    if (vocal) {
      setVoiceModelId(vocal.voiceModelId);
      setLyrics(vocal.lyrics);
      setStyle(vocal.style);
      setSettings(vocal.settings);
    }
  }, [vocal]);
  
  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleGenerateVocals = async () => {
    try {
      setIsGenerating(true);
      
      const res = await apiRequest('POST', '/api/vocals', {
        lyrics,
        style,
        voiceModelId,
        trackId,
        settings
      });
      
      const data = await res.json();
      
      toast({
        title: "Vocals generated successfully!",
        description: "Your vocals have been added to the track.",
      });
      
      if (onVocalGenerated) {
        onVocalGenerated(data.vocal);
      }
      
      // Invalidate queries that might need to be refreshed
      queryClient.invalidateQueries({ queryKey: [`/api/tracks/${trackId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tracks/${trackId}/vocals`] });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to generate vocals",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <aside className="w-64 bg-card border-l border-border flex flex-col">
      <Tabs defaultValue="properties" className="flex flex-col h-full">
        <TabsList className="w-full grid grid-cols-2 h-auto">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="voices">Voices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="flex-1 overflow-y-auto p-0">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Voice Properties</h2>
            
            {/* Voice Controls */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Voice Model</label>
                <Select
                  value={voiceModelId.toString()}
                  onValueChange={(value) => setVoiceModelId(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select voice model" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceModelsLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : voiceModels.length === 0 ? (
                      <SelectItem value="none" disabled>No voice models</SelectItem>
                    ) : (
                      voiceModels.map((model: VoiceModel) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name}
                        </SelectItem>
                      ))
                    )}
                    <SelectItem value="new">Create New Voice...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Lyrics</label>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Enter lyrics here..."
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Voice Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <StyleButton 
                    name="Happy" 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                      </svg>
                    } 
                    active={style === "Happy"} 
                    onClick={() => setStyle("Happy")} 
                  />
                  <StyleButton 
                    name="Calm" 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                      </svg>
                    } 
                    active={style === "Calm"} 
                    onClick={() => setStyle("Calm")} 
                  />
                  <StyleButton 
                    name="Sad" 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="8" y1="15" x2="16" y2="15"></line>
                        <line x1="9" y1="9" x2="9.01" y2="9"></line>
                        <line x1="15" y1="9" x2="15.01" y2="9"></line>
                      </svg>
                    } 
                    active={style === "Sad"} 
                    onClick={() => setStyle("Sad")} 
                  />
                  <StyleButton 
                    name="Intense" 
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
                        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
                        <circle cx="12" cy="12" r="2"></circle>
                        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
                        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path>
                      </svg>
                    } 
                    active={style === "Intense"} 
                    onClick={() => setStyle("Intense")} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Voice Adjustments</label>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Pitch</span>
                      <span className="text-xs text-muted-foreground">{settings.pitch}</span>
                    </div>
                    <Slider
                      value={[settings.pitch + 5]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(value) => handleSettingChange('pitch', value[0] - 5)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Clarity</span>
                      <span className="text-xs text-muted-foreground">{settings.clarity > 0 ? `+${settings.clarity}` : settings.clarity}</span>
                    </div>
                    <Slider
                      value={[settings.clarity + 5]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(value) => handleSettingChange('clarity', value[0] - 5)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Vibrato</span>
                      <span className="text-xs text-muted-foreground">{settings.vibrato > 0 ? `+${settings.vibrato}` : settings.vibrato}</span>
                    </div>
                    <Slider
                      value={[settings.vibrato + 5]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(value) => handleSettingChange('vibrato', value[0] - 5)}
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleGenerateVocals}
                disabled={isGenerating || !lyrics || lyrics.trim() === ''}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                      <path d="M19 10c0 3.976-7 9-7 9s-7-5.024-7-9c0-3.865 3.135-7 7-7s7 3.135 7 7z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Generate Vocals
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-8 border-t border-border pt-4">
              <h3 className="text-sm font-medium mb-3">Voice Settings</h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="auto-tune" 
                    checked={settings.autoTune}
                    onCheckedChange={(checked) => handleSettingChange('autoTune', !!checked)}
                  />
                  <label htmlFor="auto-tune" className="text-sm leading-none">
                    Auto-tune vocals
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="match-rhythm" 
                    checked={settings.matchRhythm}
                    onCheckedChange={(checked) => handleSettingChange('matchRhythm', !!checked)}
                  />
                  <label htmlFor="match-rhythm" className="text-sm leading-none">
                    Match to instrumental rhythm
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="reverb" 
                    checked={settings.reverb}
                    onCheckedChange={(checked) => handleSettingChange('reverb', !!checked)}
                  />
                  <label htmlFor="reverb" className="text-sm leading-none">
                    Apply reverb effect
                  </label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="voices" className="flex-1 overflow-y-auto p-0">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Voice Models</h2>
            
            <p className="text-sm text-muted-foreground mb-4">
              Create and manage your voice models for use in your compositions.
            </p>
            
            <Button variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              Create New Voice Model
            </Button>
            
            <div className="mt-4">
              {voiceModelsLoading ? (
                <div className="text-sm text-muted-foreground">Loading voice models...</div>
              ) : voiceModels.length === 0 ? (
                <div className="text-sm text-muted-foreground">No voice models yet</div>
              ) : (
                <div className="space-y-3">
                  {voiceModels.map((model: VoiceModel) => (
                    <div key={model.id} className="bg-muted rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                              <line x1="12" y1="19" x2="12" y2="23"></line>
                              <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{model.name}</h3>
                            <p className="text-xs text-muted-foreground">{model.sampleCount} samples</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

// Helper component for voice style buttons
interface StyleButtonProps {
  name: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function StyleButton({ name, icon, active, onClick }: StyleButtonProps) {
  return (
    <button
      className={`bg-muted border ${active ? 'border-primary' : 'border-border'} rounded-md p-2 cursor-pointer hover:bg-background flex flex-col items-center`}
      onClick={onClick}
    >
      <span className={`mb-1 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </span>
      <span className={`text-xs ${active ? 'text-primary' : ''}`}>{name}</span>
    </button>
  );
}
