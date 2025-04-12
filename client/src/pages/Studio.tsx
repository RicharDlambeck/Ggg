import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProjectWithTracks, Track } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/layout/Sidebar";
import VoiceModelSection from "@/components/studio/VoiceModelSection";
import LyricsEditor from "@/components/studio/LyricsEditor";
import VocalPreview from "@/components/studio/VocalPreview";
import InstrumentalLab from "@/components/studio/InstrumentalLab";
import MixPanel from "@/components/studio/MixPanel";
import VoiceCloneStudio from "@/components/studio/VoiceCloneStudio";
import { Play, Save, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

export default function Studio() {
  const [selectedTab, setSelectedTab] = useState("vocal-studio");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  
  // Fetch the current project (in a real app, this would be based on route params)
  const { data: project, isLoading } = useQuery<ProjectWithTracks>({
    queryKey: ["/api/projects/1"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Select the first track when the project loads
  useEffect(() => {
    if (project && project.tracks.length > 0 && !selectedTrack) {
      setSelectedTrack(project.tracks[0]);
    }
  }, [project, selectedTrack]);

  const handleAddTrack = () => {
    // This would open a dialog to create a new track
    console.log("Add track");
  };

  if (isLoading || !project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <Sidebar 
        project={project} 
        selectedTrack={selectedTrack} 
        onSelectTrack={setSelectedTrack}
        onAddTrack={handleAddTrack}
      />
      
      <div className="flex-1 flex flex-col bg-neutral-900 overflow-hidden">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
          <div className="bg-neutral-800 border-b border-neutral-700">
            <TabsList className="bg-transparent border-b border-transparent">
              <TabsTrigger 
                value="vocal-studio" 
                className="py-3 px-4 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=inactive]:text-neutral-400 rounded-none"
              >
                Vocal Studio
              </TabsTrigger>
              <TabsTrigger 
                value="instrumental-lab"
                className="py-3 px-4 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=inactive]:text-neutral-400 rounded-none"
              >
                Instrumental Lab
              </TabsTrigger>
              <TabsTrigger 
                value="mix-panel"
                className="py-3 px-4 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=inactive]:text-neutral-400 rounded-none"
              >
                Mix Panel
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="vocal-studio" className="h-full mt-0 border-none p-0">
              <VoiceCloneStudio />
            </TabsContent>
            
            <TabsContent value="instrumental-lab" className="h-full mt-0 border-none p-0">
              <InstrumentalLab 
                projectId={project.id} 
                track={selectedTrack?.type === "instrumental" ? selectedTrack : null} 
              />
            </TabsContent>
            
            <TabsContent value="mix-panel" className="h-full mt-0 border-none p-0">
              <MixPanel project={project} />
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="border-t border-neutral-700 bg-neutral-800 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Button size="icon" variant="secondary" className="w-8 h-8 mr-2 bg-neutral-700 hover:bg-neutral-600">
                <Play className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                <div className="font-medium">{project.name}</div>
                <div className="text-xs text-neutral-400">
                  {project.tracks.length} tracks • {new Date(project.lastModified).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Button variant="secondary" size="sm" className="mr-2 bg-neutral-700 hover:bg-neutral-600">
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
