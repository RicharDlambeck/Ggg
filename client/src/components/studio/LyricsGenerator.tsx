import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, RefreshCw, Save, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface LyricsGeneratorProps {
  onSaveLyrics: (lyrics: string) => void;
  initialLyrics?: string;
}

export default function LyricsGenerator({
  onSaveLyrics,
  initialLyrics = ''
}: LyricsGeneratorProps) {
  const [lyrics, setLyrics] = useState<string>(initialLyrics);
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [style, setStyle] = useState<string>('rap');
  const [mood, setMood] = useState<string>('energetic');
  const [theme, setTheme] = useState<string>('');
  const [advancedOptions, setAdvancedOptions] = useState<boolean>(false);
  const [creativity, setCreativity] = useState<number>(70);
  const [rhymeLevel, setRhymeLevel] = useState<number>(80);
  
  const { toast } = useToast();

  // Generate lyrics using OpenAI (we already have the key)
  const generateLyrics = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Prepare request body
      const requestData = {
        prompt: prompt || `Generate ${style} lyrics with a ${mood} mood${theme ? ' about ' + theme : ''}`,
        style,
        mood,
        theme,
        advancedOptions: advancedOptions ? {
          creativity: creativity / 100,
          rhymeLevel: rhymeLevel / 100
        } : undefined
      };
      
      // Use our OpenAI API key
      const response = await axios.post('/api/generate/lyrics', requestData);
      
      // Set generated lyrics
      if (response.data && response.data.lyrics) {
        setLyrics(response.data.lyrics);
        toast({
          title: 'Lyrics generated',
          description: 'Your lyrics have been generated successfully!',
        });
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Error generating lyrics:', error);
      
      // Fallback to local generation in case OpenAI API fails
      generateLocalLyrics();
      
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, style, mood, theme, advancedOptions, creativity, rhymeLevel, toast]);

  // Local lyrics generation (fallback)
  const generateLocalLyrics = () => {
    // Simple templates for different styles
    const rapTemplates = [
      "Yeah, I'm on the mic, feeling the vibe\nDroppin' these rhymes, taking you on a ride\nStay with me now, we're going all night\nThis is how we do, we're doing it right",
      "Streets talking, I'm walking through fire\nAiming higher, never tire\nBeat drops, my flow never stops\nTaking it to the top, yeah, to the top",
      "Listen up, this is how it goes\nFlow like water, everybody knows\nKeep it real, that's the only way\nIn the game to stay, day after day"
    ];
    
    const popTemplates = [
      "Baby, you're the one I've been waiting for\nYou're everything I need and so much more\nWhen we're together, feels like forever\nLet's make this moment last, now or never",
      "Lights flash, music's playing\nHearts race, no delaying\nThrough the night, we're staying\nThis feeling, we're all craving",
      "I remember when we first met\nA moment I'll never forget\nYou smiled at me across the room\nAnd my heart went boom, boom, boom"
    ];
    
    const soulTemplates = [
      "Deep in my heart, I feel your love\nSent from the stars, from up above\nHolding on tight, through darkest night\nYour love's my light, guiding me right",
      "Soulful melody, touching my heart\nBeen this way from the very start\nCan't let you go, don't want to try\nOur love will grow, reaching the sky",
      "Time stands still when you're in my arms\nCaptivated by all of your charms\nSweet harmony, pure symphony\nYou're everything, everything to me"
    ];
    
    // Select template based on style
    let templates;
    switch (style) {
      case 'pop':
        templates = popTemplates;
        break;
      case 'soul':
      case 'rnb':
        templates = soulTemplates;
        break;
      case 'rap':
      default:
        templates = rapTemplates;
        break;
    }
    
    // Randomly select a template
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Use the template for fallback lyrics
    setLyrics(randomTemplate);
    
    toast({
      title: 'Lyrics generated locally',
      description: 'Using our built-in lyrics templates. Connect to OpenAI for more personalized results.',
    });
  };

  // Save the lyrics
  const saveLyrics = useCallback(() => {
    if (!lyrics.trim()) {
      toast({
        title: 'Empty lyrics',
        description: 'Please generate or write some lyrics first.',
        variant: 'destructive',
      });
      return;
    }
    
    onSaveLyrics(lyrics);
    
    toast({
      title: 'Lyrics saved',
      description: 'Your lyrics have been saved successfully!',
    });
  }, [lyrics, onSaveLyrics, toast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music size={18} />
          Lyrics Generator
        </CardTitle>
        <CardDescription>
          Create custom lyrics for your track using AI assistance
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt (Optional)</Label>
                <Input
                  id="prompt"
                  placeholder="What do you want to write about?"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rap">Rap</SelectItem>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="rnb">R&B</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="edm">EDM</SelectItem>
                      <SelectItem value="soul">Soul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger id="mood">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="chill">Chill</SelectItem>
                      <SelectItem value="emotional">Emotional</SelectItem>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme">Theme (Optional)</Label>
                <Input
                  id="theme"
                  placeholder="e.g., love, success, struggle"
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="advanced"
                  checked={advancedOptions}
                  onCheckedChange={setAdvancedOptions}
                />
                <Label htmlFor="advanced">Advanced Options</Label>
              </div>
              
              {advancedOptions && (
                <div className="space-y-4 border rounded-md p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="creativity">Creativity</Label>
                      <span className="text-sm text-muted-foreground">{creativity}%</span>
                    </div>
                    <Slider
                      id="creativity"
                      min={0}
                      max={100}
                      step={5}
                      value={[creativity]}
                      onValueChange={(value) => setCreativity(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values produce more creative but less predictable results
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="rhyme-level">Rhyme Intensity</Label>
                      <span className="text-sm text-muted-foreground">{rhymeLevel}%</span>
                    </div>
                    <Slider
                      id="rhyme-level"
                      min={0}
                      max={100}
                      step={5}
                      value={[rhymeLevel]}
                      onValueChange={(value) => setRhymeLevel(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values prioritize stronger rhyme schemes
                    </p>
                  </div>
                </div>
              )}
              
              <Button
                onClick={generateLyrics}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Generate Lyrics
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4">
            <Textarea
              placeholder="Write or paste your lyrics here..."
              className="min-h-[200px]"
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="justify-between">
        <p className="text-xs text-muted-foreground">
          {lyrics ? lyrics.split('\n').length : 0} lines, {lyrics.length} characters
        </p>
        
        <Button onClick={saveLyrics} disabled={!lyrics.trim()}>
          <Save size={16} className="mr-2" />
          Save Lyrics
        </Button>
      </CardFooter>
    </Card>
  );
}