import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Music, Wand2 } from 'lucide-react';
import axios from 'axios';

interface InstrumentalGeneratorProps {
  onGenerated: (audioUrl: string) => void;
}

export default function InstrumentalGenerator({ onGenerated }: InstrumentalGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [genre, setGenre] = useState('pop');
  const [tempo, setTempo] = useState(120);
  const [key, setKey] = useState('C');
  const [mood, setMood] = useState('upbeat');
  const [duration, setDuration] = useState(30);
  
  const { toast } = useToast();
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Make an API request to generate an instrumental track
      const response = await axios.post('/api/generate/instrumental', {
        genre,
        tempo,
        key,
        mood,
        duration
      });
      
      if (response.data && response.data.audioUrl) {
        onGenerated(response.data.audioUrl);
        toast({
          title: 'Instrumental Generated',
          description: 'Your instrumental track has been generated successfully!'
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating instrumental:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate instrumental track. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Options</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                      <SelectItem value="electronic">Electronic</SelectItem>
                      <SelectItem value="jazz">Jazz</SelectItem>
                      <SelectItem value="acoustic">Acoustic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="mood">Mood</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upbeat">Upbeat</SelectItem>
                      <SelectItem value="chill">Chill</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="emotional">Emotional</SelectItem>
                      <SelectItem value="happy">Happy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key">Key</Label>
                  <Select value={key} onValueChange={setKey}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a key" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C">C Major</SelectItem>
                      <SelectItem value="C#">C# Major</SelectItem>
                      <SelectItem value="D">D Major</SelectItem>
                      <SelectItem value="D#">D# Major</SelectItem>
                      <SelectItem value="E">E Major</SelectItem>
                      <SelectItem value="F">F Major</SelectItem>
                      <SelectItem value="F#">F# Major</SelectItem>
                      <SelectItem value="G">G Major</SelectItem>
                      <SelectItem value="G#">G# Major</SelectItem>
                      <SelectItem value="A">A Major</SelectItem>
                      <SelectItem value="A#">A# Major</SelectItem>
                      <SelectItem value="B">B Major</SelectItem>
                      <SelectItem value="Am">A Minor</SelectItem>
                      <SelectItem value="Em">E Minor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="flex justify-between">
                    <Label>Tempo: {tempo} BPM</Label>
                  </div>
                  <Slider
                    value={[tempo]}
                    min={60}
                    max={180}
                    step={1}
                    onValueChange={(value) => setTempo(value[0])}
                    className="my-4"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <Label>Duration: {duration} seconds</Label>
                </div>
                <Slider
                  value={[duration]}
                  min={20}
                  max={180}
                  step={10}
                  onValueChange={(value) => setDuration(value[0])}
                  className="my-4"
                />
              </div>
              
              {/* Add more advanced options in the future */}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Instrumental
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}