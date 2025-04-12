import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Track, VoiceModel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { formatTime } from "@/lib/audio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("library");
  const { toast } = useToast();
  
  // Fetch tracks
  const { data: tracksData, isLoading: tracksLoading } = useQuery({
    queryKey: ['/api/tracks'],
    staleTime: 30000,
  });
  
  // Fetch voice models
  const { data: voiceModelsData, isLoading: voiceModelsLoading } = useQuery({
    queryKey: ['/api/voice-models'],
    staleTime: 30000,
  });
  
  const tracks = tracksData?.tracks || [];
  const voiceModels = voiceModelsData?.voiceModels || [];
  
  const handleCreateNew = async () => {
    try {
      const res = await apiRequest('POST', '/api/tracks', {
        title: 'Untitled Track',
        genre: 'Pop',
        duration: 180,
        userId: 1, // Using the default user
      });
      
      const data = await res.json();
      setLocation(`/editor/${data.track.id}`);
      
      toast({
        title: "New track created",
        description: "Start creating your masterpiece!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create track",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  
  return (
    <aside className="w-56 bg-background border-r border-border flex flex-col">
      <Tabs defaultValue="library" className="flex flex-col h-full">
        <TabsList className="w-full grid grid-cols-2 h-auto">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>
        
        <TabsContent value="library" className="flex-1 overflow-y-auto p-0">
          <div className="p-4">
            <h2 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">Your Tracks</h2>
            
            {/* Track List */}
            <div className="space-y-2">
              {tracksLoading ? (
                <div className="text-sm text-muted-foreground">Loading tracks...</div>
              ) : tracks.length === 0 ? (
                <div className="text-sm text-muted-foreground">No tracks yet</div>
              ) : (
                tracks.map((track: Track) => (
                  <Link key={track.id} href={`/editor/${track.id}`}>
                    <div className={`bg-card rounded-md p-2.5 cursor-pointer hover:bg-muted ${location === `/editor/${track.id}` ? 'border-l-2 border-accent' : ''}`}>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-sm">{track.title}</h3>
                        <span className="text-xs text-muted-foreground">{formatTime(track.duration)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{track.genre} • {getTimeElapsed(track.createdAt)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <h2 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3 mt-6">Your Voice Models</h2>
            
            {/* Voice Models */}
            <div className="space-y-2">
              {voiceModelsLoading ? (
                <div className="text-sm text-muted-foreground">Loading voice models...</div>
              ) : voiceModels.length === 0 ? (
                <div className="text-sm text-muted-foreground">No voice models yet</div>
              ) : (
                voiceModels.map((model: VoiceModel) => (
                  <div key={model.id} className="bg-card rounded-md p-2.5 cursor-pointer hover:bg-muted">
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
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="search" className="flex-1 overflow-y-auto p-0">
          <div className="p-4">
            <div className="text-sm text-muted-foreground">
              Search functionality coming soon...
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* New Creation Button */}
      <div className="p-3 border-t border-border">
        <Button className="w-full" onClick={handleCreateNew}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Creation
        </Button>
      </div>
    </aside>
  );
}

// Helper function to format time elapsed since creation
function getTimeElapsed(createdAt: Date | string | undefined): string {
  if (!createdAt) return 'Just now';
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 24) return `${diffHrs}h ago`;
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return `${diffDays}d ago`;
}
