import { useState, useEffect } from "react";
import { Track } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Underline, Text, WandSparkles, AudioWaveform, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface LyricsEditorProps {
  projectId: number;
  track: Track | null;
}

export default function LyricsEditor({ projectId, track }: LyricsEditorProps) {
  const [lyrics, setLyrics] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Load lyrics from track if available
  useEffect(() => {
    if (track && track.settings && track.settings.lyrics) {
      setLyrics(track.settings.lyrics as string);
    } else {
      setLyrics("");
    }
  }, [track]);

  const handleSaveLyrics = async () => {
    if (!track) return;

    try {
      const updatedSettings = {
        ...track.settings,
        lyrics
      };

      await apiRequest("PUT", `/api/tracks/${track.id}`, {
        settings: updatedSettings
      });

      // Invalidate track in cache
      queryClient.invalidateQueries({ queryKey: [`/api/tracks/${track.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });

      toast({
        title: "Lyrics saved",
        description: "Your lyrics have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lyrics. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateLyrics = async () => {
    try {
      setIsGenerating(true);
      
      // In a real app, this would call an API to generate lyrics with AI
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedLyrics = `Walking through the summer rain
Memories flooding back again
Your smile like sunshine after storms
In my mind, forever warm

[Chorus]
Oh, these moments we create
Time stands still, it's never late
Under skies of endless blue
Finding myself, finding you`;

      setLyrics(generatedLyrics);
      
      toast({
        title: "Lyrics generated",
        description: "AI-generated lyrics are ready for your review.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Could not generate lyrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVocals = async () => {
    if (!track || !lyrics.trim()) {
      toast({
        title: "Cannot generate vocals",
        description: "Please add lyrics first before generating vocals.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      toast({
        title: "Generating vocals",
        description: "This may take a few moments...",
      });
      
      // Get the selected voice model ID from the project settings or use default
      const voiceModelId = track.settings?.voiceModelId || 1;
      
      // Call our local generation API
      const response = await apiRequest("POST", "/api/generate/vocals", {
        lyrics,
        voiceModelId,
        settings: {
          character: 70,  // Default values
          clarity: 80,
          emotion: 60,
          style: ["natural"]
        }
      });
      
      const { audioUrl } = await response.json();
      
      // Update the track with the new vocal audio
      await apiRequest("PUT", `/api/tracks/${track.id}`, {
        settings: {
          ...track.settings,
          lyrics
        },
        audioUrl
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/tracks/${track.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      
      toast({
        title: "Vocals generated",
        description: "Your vocals have been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Could not generate vocals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-neutral-800 rounded-xl overflow-hidden mb-5">
      <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
        <h3 className="font-heading font-semibold">Lyrics Editor</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-200 transition h-7 w-7">
            <Upload className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-400 hover:text-neutral-200 transition h-7 w-7"
            onClick={handleSaveLyrics}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-5">
        <Textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          className="w-full h-40 bg-neutral-700 border border-neutral-600 rounded-lg p-4 focus:border-primary text-neutral-100 resize-none"
          placeholder="Enter your lyrics here..."
        />

        <div className="flex gap-2 mt-4">
          <Button variant="secondary" size="icon" className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 h-9">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 h-9">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 h-9">
            <Underline className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 h-9">
            <Text className="h-4 w-4" />
          </Button>
          <div className="ml-auto flex gap-2">
            <Button 
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 h-9"
              onClick={handleGenerateLyrics}
              disabled={isGenerating}
            >
              <WandSparkles className="h-4 w-4 mr-1" /> Suggest Lyrics
            </Button>
            <Button 
              className="px-3 py-1.5 bg-accent hover:bg-accent/90 h-9 font-medium"
              onClick={handleGenerateVocals}
              disabled={isGenerating || !lyrics.trim()}
            >
              <AudioWaveform className="h-4 w-4 mr-1" /> Generate Vocals
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
