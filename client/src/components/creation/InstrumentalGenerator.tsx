import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Instrumental } from "@shared/schema";

interface InstrumentalGeneratorProps {
  trackId: number;
  existingInstrumental?: Instrumental;
  onInstrumentalGenerated?: (instrumental: Instrumental) => void;
}

export default function InstrumentalGenerator({ 
  trackId, 
  existingInstrumental,
  onInstrumentalGenerated
}: InstrumentalGeneratorProps) {
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState(existingInstrumental?.prompt || "");
  const [genre, setGenre] = useState(existingInstrumental?.genre || "Pop");
  const [mood, setMood] = useState(existingInstrumental?.mood || "Upbeat");
  const [length, setLength] = useState(existingInstrumental?.duration ? 
    existingInstrumental.duration <= 120 ? "short" : 
    existingInstrumental.duration <= 180 ? "medium" : "long" 
    : "medium");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      // Convert length to duration in seconds
      const duration = length === "short" ? 120 : length === "medium" ? 180 : 240;
      
      const res = await apiRequest('POST', '/api/instrumentals', {
        prompt,
        genre,
        mood,
        duration,
        bpm: 120, // Default BPM
        key: "C Major", // Default key
        trackId
      });
      
      const data = await res.json();
      
      toast({
        title: "Instrumental generated successfully!",
        description: "Your instrumental is ready to use.",
      });
      
      if (onInstrumentalGenerated) {
        onInstrumentalGenerated(data.instrumental);
      }
      
      // Invalidate queries that might need to be refreshed
      queryClient.invalidateQueries({ queryKey: [`/api/tracks/${trackId}`] });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to generate instrumental",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instrumental Generation</CardTitle>
        <CardDescription>Create the musical backing for your song</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Describe your instrumental</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full"
            rows={3}
            placeholder="E.g. 'Upbeat electronic track with synth pads, driving bass line, and moderate drums'"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Genre</label>
            <Select value={genre} onValueChange={(value) => setGenre(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pop">Pop</SelectItem>
                <SelectItem value="Electronic">Electronic</SelectItem>
                <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                <SelectItem value="Rock">Rock</SelectItem>
                <SelectItem value="Jazz">Jazz</SelectItem>
                <SelectItem value="Classical">Classical</SelectItem>
                <SelectItem value="R&B">R&B</SelectItem>
                <SelectItem value="Folk">Folk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Mood</label>
            <Select value={mood} onValueChange={(value) => setMood(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Upbeat">Upbeat</SelectItem>
                <SelectItem value="Chill">Chill</SelectItem>
                <SelectItem value="Energetic">Energetic</SelectItem>
                <SelectItem value="Melancholic">Melancholic</SelectItem>
                <SelectItem value="Dramatic">Dramatic</SelectItem>
                <SelectItem value="Happy">Happy</SelectItem>
                <SelectItem value="Sad">Sad</SelectItem>
                <SelectItem value="Dreamy">Dreamy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Length</label>
            <Select value={length} onValueChange={(value) => setLength(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (1-2 min)</SelectItem>
                <SelectItem value="medium">Medium (2-3 min)</SelectItem>
                <SelectItem value="long">Long (3-4 min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt || prompt.trim() === ''}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M10.5 14.5c1.7-0.5 2-1.5 2-2.5"></path>
                  <path d="M14.5 17c-1 1-4 2-6.5-0.5s-1.5-5.5-0.5-6.5"></path>
                  <path d="M8.5 11c-0.5-1.5 0-3 2.5-3s3 3 3 5"></path>
                  <circle cx="9" cy="7" r="1"></circle>
                  <circle cx="13" cy="14" r="1"></circle>
                  <circle cx="9" cy="10" r="1"></circle>
                  <circle cx="12" cy="12" r="7"></circle>
                </svg>
                Generate Instrumental
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
