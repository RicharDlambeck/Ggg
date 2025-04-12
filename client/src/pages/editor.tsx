import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MainWorkspace from "@/components/layout/MainWorkspace";
import RightPanel from "@/components/layout/RightPanel";
import { Instrumental, Vocal } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const trackId = parseInt(id);
  const { toast } = useToast();
  
  const [instrumental, setInstrumental] = useState<Instrumental | undefined>(undefined);
  const [vocals, setVocals] = useState<Vocal[] | undefined>([]);
  
  // Fetch track data
  const { data: trackData, isLoading, error } = useQuery({
    queryKey: [`/api/tracks/${trackId}`],
    enabled: !!trackId && !isNaN(trackId),
    staleTime: 30000,
  });
  
  // Show error toast if needed
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading track",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [error, toast]);
  
  // Update state when track data changes
  useEffect(() => {
    if (trackData) {
      setInstrumental(trackData.instrumental);
      setVocals(trackData.vocals);
    }
  }, [trackData]);
  
  // Handle instrumental generation
  const handleInstrumentalGenerated = (newInstrumental: Instrumental) => {
    setInstrumental(newInstrumental);
  };
  
  // Handle vocals generation
  const handleVocalsAdded = (newVocal: Vocal) => {
    if (vocals) {
      setVocals([...vocals, newVocal]);
    } else {
      setVocals([newVocal]);
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header trackTitle={trackData?.track?.title} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <MainWorkspace 
          instrumental={instrumental}
          vocals={vocals}
          trackId={trackId}
          onInstrumentalGenerated={handleInstrumentalGenerated}
          onVocalsAdded={handleVocalsAdded}
        />
        
        <RightPanel 
          trackId={trackId}
          vocal={vocals && vocals.length > 0 ? vocals[0] : undefined}
          onVocalGenerated={handleVocalsAdded}
        />
      </div>
    </div>
  );
}
