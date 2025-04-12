import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Wand,
  Music,
  BookText,
  Sparkles,
  SquarePen,
  Save,
  FileText,
  Trash,
  HelpCircle,
  RotateCw,
  Download,
  SlidersHorizontal,
  Undo2,
  Repeat,
  Star,
  ArrowRightCircle,
  Replace,
  CornerDownLeft,
  PenSquare
} from 'lucide-react';

// Types for lyrics generation
interface LyricsGenerationOptions {
  prompt?: string;
  style: string;
  mood: string;
  theme?: string;
  advancedOptions?: {
    creativity: number; // 0-1
    rhymeLevel: number; // 0-1
    verseCount?: number;
    includePreChorus?: boolean;
    includeBridge?: boolean;
    rhymePattern?: string;
  };
}

// Response types for structured lyrics
interface LyricsStructure {
  intro?: string;
  verse1: string;
  preChorus1?: string;
  chorus: string;
  verse2?: string;
  preChorus2?: string;
  bridge?: string;
  outro?: string;
}

interface LyricsMetadata {
  theme: string;
  mood: string;
  style: string;
  estimatedDuration: string;
  rhymeScheme: string;
  suggestedChords?: string[];
}

interface LyricsStructureResponse {
  title: string;
  structure: LyricsStructure;
  fullLyrics: string;
  metadata: LyricsMetadata;
}

// Response type for lyric suggestions
interface LyricsSuggestion {
  original: string;
  suggestions: string[];
  explanation: string;
}

// Response type for rhyme suggestions
interface RhymeResponse {
  words: string[];
  soundsLike: string[];
  explanation: string;
}

interface EnhancedLyricsGeneratorProps {
  initialLyrics?: string;
  onSaveLyrics?: (lyrics: string) => void;
}

export default function EnhancedLyricsGenerator({ 
  initialLyrics = '', 
  onSaveLyrics 
}: EnhancedLyricsGeneratorProps) {
  const { toast } = useToast();
  
  // Main states
  const [activeTab, setActiveTab] = useState('write');
  const [lyrics, setLyrics] = useState(initialLyrics);
  const [originalLyrics, setOriginalLyrics] = useState(initialLyrics);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [lineSuggestions, setLineSuggestions] = useState<LyricsSuggestion | null>(null);
  const [rhymes, setRhymes] = useState<RhymeResponse | null>(null);
  const [rhymeWord, setRhymeWord] = useState<string>('');
  const [structuredLyrics, setStructuredLyrics] = useState<LyricsStructureResponse | null>(null);
  
  // Generation options
  const [style, setStyle] = useState<string>('pop');
  const [mood, setMood] = useState<string>('uplifting');
  const [theme, setTheme] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [advancedOptions, setAdvancedOptions] = useState({
    creativity: 0.7,
    rhymeLevel: 0.6,
    verseCount: 2,
    includePreChorus: true,
    includeBridge: true,
    rhymePattern: 'AABB'
  });
  
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Ref for text selection
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update original lyrics when initial lyrics change
  useEffect(() => {
    if (initialLyrics && initialLyrics !== lyrics) {
      setLyrics(initialLyrics);
      setOriginalLyrics(initialLyrics);
    }
  }, [initialLyrics]);
  
  // Handle generation of lyrics
  const generateLyrics = async (useStructured: boolean = false) => {
    if (!style || !mood) {
      toast({
        title: "Missing Information",
        description: "Style and mood are required to generate lyrics",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Prepare options for lyrics generation
      const options: LyricsGenerationOptions = {
        style,
        mood,
        theme: theme || undefined,
        prompt: prompt || undefined,
        advancedOptions: showAdvancedOptions ? {
          creativity: advancedOptions.creativity,
          rhymeLevel: advancedOptions.rhymeLevel,
          verseCount: advancedOptions.verseCount,
          includePreChorus: advancedOptions.includePreChorus,
          includeBridge: advancedOptions.includeBridge,
          rhymePattern: advancedOptions.rhymePattern
        } : undefined
      };
      
      if (useStructured) {
        // Generate structured lyrics with sections
        const response = await axios.post<LyricsStructureResponse>(
          '/api/generate/structured-lyrics',
          options
        );
        
        setStructuredLyrics(response.data);
        setLyrics(response.data.fullLyrics);
        setOriginalLyrics(response.data.fullLyrics);
        
        toast({
          title: "Lyrics Generated",
          description: `Created "${response.data.title}" with structured sections`,
        });
      } else {
        // Generate standard lyrics
        const response = await axios.post<{ lyrics: string }>(
          '/api/generate/lyrics',
          options
        );
        
        setLyrics(response.data.lyrics);
        setOriginalLyrics(response.data.lyrics);
        setStructuredLyrics(null);
        
        toast({
          title: "Lyrics Generated",
          description: "New lyrics have been created",
        });
      }
    } catch (error) {
      console.error('Error generating lyrics:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating lyrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle saving lyrics
  const handleSaveLyrics = useCallback(() => {
    if (onSaveLyrics) {
      onSaveLyrics(lyrics);
      toast({
        title: "Lyrics Saved",
        description: "Your lyrics have been saved successfully",
      });
    }
  }, [lyrics, onSaveLyrics, toast]);
  
  // Handle reverting to original lyrics
  const handleRevertLyrics = useCallback(() => {
    setLyrics(originalLyrics);
    toast({
      title: "Lyrics Reverted",
      description: "Lyrics have been reverted to original version",
    });
  }, [originalLyrics, toast]);
  
  // Handle text selection for getting suggestions or rhymes
  const handleTextSelect = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      if (selectionStart !== selectionEnd) {
        const selected = lyrics.substring(selectionStart, selectionEnd);
        if (selected.trim()) {
          setSelectedLine(selected.trim());
        }
      }
    }
  };
  
  // Get suggestions for a specific line
  const getSuggestions = async (line: string) => {
    if (!line.trim() || !lyrics || !style) {
      toast({
        title: "Missing Information",
        description: "Please select a line to get suggestions",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await axios.post<LyricsSuggestion>(
        '/api/lyrics/suggestions',
        {
          line,
          fullLyrics: lyrics,
          style,
          count: 3
        }
      );
      
      setLineSuggestions(response.data);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: "Suggestions Failed",
        description: "Failed to get suggestions. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Replace the selected line with a suggestion
  const replaceLine = (original: string, replacement: string) => {
    if (!lyrics.includes(original)) {
      toast({
        title: "Replacement Failed",
        description: "The original line could not be found.",
        variant: "destructive",
      });
      return;
    }
    
    // Replace with new suggestion
    const updatedLyrics = lyrics.replace(original, replacement);
    setLyrics(updatedLyrics);
    
    toast({
      title: "Line Replaced",
      description: "The line has been replaced with your selection.",
    });
  };
  
  // Get rhymes for a word
  const getRhymes = async (word: string) => {
    if (!word.trim() || !style) {
      toast({
        title: "Missing Information",
        description: "Please enter a word to find rhymes",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await axios.post<RhymeResponse>(
        '/api/lyrics/rhymes',
        {
          word,
          style
        }
      );
      
      setRhymes(response.data);
    } catch (error) {
      console.error('Error getting rhymes:', error);
      toast({
        title: "Rhyme Search Failed",
        description: "Failed to find rhymes. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Download lyrics as a text file
  const downloadLyrics = () => {
    if (!lyrics.trim()) {
      toast({
        title: "No Lyrics",
        description: "There are no lyrics to download",
        variant: "destructive",
      });
      return;
    }
    
    const title = structuredLyrics?.title || "lyrics";
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    
    // Create a blob and download it
    const blob = new Blob([lyrics], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Lyrics Downloaded",
      description: `Saved as "${filename}"`,
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lyrics Generator</h2>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadLyrics}
            disabled={!lyrics.trim()}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveLyrics}
            disabled={!lyrics.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Lyrics
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="write" className="flex items-center gap-1">
            <SquarePen className="h-4 w-4" />
            Write & Edit
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-1">
            <Wand className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-1">
            <BookText className="h-4 w-4" />
            Structure
          </TabsTrigger>
          <TabsTrigger value="assist" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            AI Assist
          </TabsTrigger>
        </TabsList>
        
        {/* Write & Edit Tab */}
        <TabsContent value="write" className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Start writing lyrics here or generate them using AI..."
              className="min-h-[400px] font-mono"
              value={lyrics}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLyrics(e.target.value)}
              onMouseUp={handleTextSelect}
              onKeyUp={handleTextSelect}
            />
            
            {lyrics !== originalLyrics && (
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-3 right-3"
                onClick={handleRevertLyrics}
              >
                <Undo2 className="w-4 h-4 mr-1" />
                Revert Changes
              </Button>
            )}
          </div>
          
          {selectedLine && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <PenSquare className="h-4 w-4 mr-2" />
                  Selection Options
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    getSuggestions(selectedLine);
                    setActiveTab('assist');
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Get Suggestions
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setRhymeWord(selectedLine.split(' ').pop() || '');
                    getRhymes(selectedLine.split(' ').pop() || '');
                    setActiveTab('assist');
                  }}
                >
                  <Repeat className="h-4 w-4 mr-1" />
                  Find Rhymes
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Lyrics</CardTitle>
              <CardDescription>
                Configure options for AI-generated lyrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="rap">Rap/Hip-Hop</SelectItem>
                      <SelectItem value="rnb">R&B</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="edm">EDM</SelectItem>
                      <SelectItem value="folk">Folk</SelectItem>
                      <SelectItem value="soul">Soul</SelectItem>
                      <SelectItem value="indie">Indie</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
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
                      <SelectItem value="uplifting">Uplifting</SelectItem>
                      <SelectItem value="melancholic">Melancholic</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                      <SelectItem value="angry">Angry</SelectItem>
                      <SelectItem value="reflective">Reflective</SelectItem>
                      <SelectItem value="hopeful">Hopeful</SelectItem>
                      <SelectItem value="nostalgic">Nostalgic</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="joyful">Joyful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme">Theme (Optional)</Label>
                <Input
                  id="theme"
                  placeholder="e.g., summer love, overcoming challenges, city life"
                  value={theme}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTheme(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt">Custom Prompt (Optional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="Specific instructions for the AI, e.g., 'Write lyrics about a road trip with friends that emphasizes freedom and adventure'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced-options"
                    checked={showAdvancedOptions}
                    onCheckedChange={setShowAdvancedOptions}
                  />
                  <Label htmlFor="advanced-options" className="cursor-pointer">Advanced Options</Label>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Lyrics Generation Help</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose a style and mood, optionally set a theme, and click Generate.
                        Advanced options allow fine control over creativity, rhyme patterns,
                        verse counts, and song structure.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {showAdvancedOptions && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Creativity</Label>
                      <span className="text-sm text-muted-foreground">
                        {advancedOptions.creativity < 0.3 
                          ? "Conservative" 
                          : advancedOptions.creativity < 0.7 
                            ? "Balanced" 
                            : "Experimental"}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[advancedOptions.creativity]}
                      onValueChange={(value) => setAdvancedOptions({
                        ...advancedOptions,
                        creativity: value[0]
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Rhyme Intensity</Label>
                      <span className="text-sm text-muted-foreground">
                        {advancedOptions.rhymeLevel < 0.3 
                          ? "Subtle" 
                          : advancedOptions.rhymeLevel < 0.7 
                            ? "Moderate" 
                            : "Strong"}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[advancedOptions.rhymeLevel]}
                      onValueChange={(value) => setAdvancedOptions({
                        ...advancedOptions,
                        rhymeLevel: value[0]
                      })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="verseCount">Number of Verses</Label>
                      <Select 
                        value={advancedOptions.verseCount.toString()}
                        onValueChange={(value) => setAdvancedOptions({
                          ...advancedOptions,
                          verseCount: parseInt(value)
                        })}
                      >
                        <SelectTrigger id="verseCount">
                          <SelectValue placeholder="Number of verses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Verse</SelectItem>
                          <SelectItem value="2">2 Verses</SelectItem>
                          <SelectItem value="3">3 Verses</SelectItem>
                          <SelectItem value="4">4 Verses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rhymePattern">Rhyme Pattern</Label>
                      <Select 
                        value={advancedOptions.rhymePattern}
                        onValueChange={(value) => setAdvancedOptions({
                          ...advancedOptions,
                          rhymePattern: value
                        })}
                      >
                        <SelectTrigger id="rhymePattern">
                          <SelectValue placeholder="Rhyme pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AABB">AABB (pairs)</SelectItem>
                          <SelectItem value="ABAB">ABAB (alternating)</SelectItem>
                          <SelectItem value="AAAA">AAAA (monorhyme)</SelectItem>
                          <SelectItem value="ABBA">ABBA (enclosed)</SelectItem>
                          <SelectItem value="ABCB">ABCB (ballad)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <Label>Song Structure</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includePreChorus"
                          checked={advancedOptions.includePreChorus}
                          onCheckedChange={(checked) => setAdvancedOptions({
                            ...advancedOptions,
                            includePreChorus: checked === true
                          })}
                        />
                        <Label htmlFor="includePreChorus" className="cursor-pointer">
                          Include Pre-Chorus
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeBridge"
                          checked={advancedOptions.includeBridge}
                          onCheckedChange={(checked) => setAdvancedOptions({
                            ...advancedOptions,
                            includeBridge: checked === true
                          })}
                        />
                        <Label htmlFor="includeBridge" className="cursor-pointer">
                          Include Bridge
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex items-center">
                <Button
                  variant="default"
                  onClick={() => generateLyrics(true)}
                  disabled={isGenerating}
                  className="mr-2"
                >
                  {isGenerating ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BookText className="w-4 h-4 mr-2" />
                      Generate Structured
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => generateLyrics(false)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand className="w-4 h-4 mr-2" />
                      Generate Simple
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Structure Tab */}
        <TabsContent value="structure" className="flex-1 overflow-auto">
          {structuredLyrics ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{structuredLyrics.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('write')}
                    >
                      <ArrowRightCircle className="h-4 w-4 mr-1" />
                      Edit Lyrics
                    </Button>
                  </div>
                  <CardDescription>
                    {structuredLyrics.metadata.style} • {structuredLyrics.metadata.mood} • 
                    Est. Duration: {structuredLyrics.metadata.estimatedDuration}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {structuredLyrics.structure.intro && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Intro</h3>
                          <div className="p-3 bg-muted rounded-md whitespace-pre-line">
                            {structuredLyrics.structure.intro}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Verse 1</h3>
                        <div className="p-3 bg-muted rounded-md whitespace-pre-line">
                          {structuredLyrics.structure.verse1}
                        </div>
                      </div>
                      
                      {structuredLyrics.structure.preChorus1 && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Pre-Chorus 1</h3>
                          <div className="p-3 bg-muted rounded-md whitespace-pre-line">
                            {structuredLyrics.structure.preChorus1}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">Chorus</h3>
                        <div className="p-3 bg-muted rounded-md whitespace-pre-line">
                          {structuredLyrics.structure.chorus}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {structuredLyrics.structure.verse2 && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Verse 2</h3>
                          <div className="p-3 bg-muted rounded-md whitespace-pre-line">
                            {structuredLyrics.structure.verse2}
                          </div>
                        </div>
                      )}
                      
                      {structuredLyrics.structure.preChorus2 && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Pre-Chorus 2</h3>
                          <div className="p-3 bg-muted rounded-md whitespace-pre-line">
                            {structuredLyrics.structure.preChorus2}
                          </div>
                        </div>
                      )}
                      
                      {structuredLyrics.structure.bridge && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Bridge</h3>
                          <div className="p-3 bg-muted rounded-md whitespace-pre-line">
                            {structuredLyrics.structure.bridge}
                          </div>
                        </div>
                      )}
                      
                      {structuredLyrics.structure.outro && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Outro</h3>
                          <div className="p-3 bg-muted rounded-md whitespace-pre-line">
                            {structuredLyrics.structure.outro}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Metadata</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Theme:</span> {structuredLyrics.metadata.theme}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rhyme Scheme:</span> {structuredLyrics.metadata.rhymeScheme}
                      </div>
                    </div>
                    
                    {structuredLyrics.metadata.suggestedChords && (
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">Suggested Chords: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {structuredLyrics.metadata.suggestedChords.map((chord, index) => (
                            <span key={index} className="px-2 py-1 bg-secondary rounded-md text-xs">{chord}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <BookText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Structured Lyrics</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Generate structured lyrics with distinct sections like verses, 
                chorus, and bridge to see them displayed here.
              </p>
              <Button onClick={() => setActiveTab('generate')}>
                <Wand className="w-4 h-4 mr-2" />
                Go to Generator
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* AI Assist Tab */}
        <TabsContent value="assist" className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Line Suggestions
                </CardTitle>
                <CardDescription>
                  Get AI suggestions for improving specific lines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedLine ? (
                  <div>
                    <div className="p-3 bg-muted rounded-md mb-3">
                      <p className="font-medium text-sm">Selected line:</p>
                      <p className="mt-1 italic">"{selectedLine}"</p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => getSuggestions(selectedLine)}
                      disabled={!selectedLine}
                      className="w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Suggestions
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-3">
                      Select a line in the editor to get suggestions
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('write')}
                    >
                      Go to Editor
                    </Button>
                  </div>
                )}
                
                {lineSuggestions && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {lineSuggestions.explanation}
                    </p>
                    
                    <div className="space-y-3">
                      {lineSuggestions.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => replaceLine(selectedLine || lineSuggestions.original, suggestion)}
                          >
                            <Replace className="h-4 w-4" />
                          </Button>
                          <div className="p-2 bg-secondary rounded-md flex-1">
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Rhyme Finder */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Repeat className="h-4 w-4 mr-2" />
                  Rhyme Finder
                </CardTitle>
                <CardDescription>
                  Find words that rhyme with your selection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a word to find rhymes"
                    value={rhymeWord}
                    onChange={(e) => setRhymeWord(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => getRhymes(rhymeWord)}
                    disabled={!rhymeWord.trim()}
                  >
                    <CornerDownLeft className="h-4 w-4" />
                  </Button>
                </div>
                
                {rhymes && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {rhymes.explanation}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Perfect/Near Rhymes</h4>
                        <div className="flex flex-wrap gap-2">
                          {rhymes.words.map((word, index) => (
                            <span key={index} className="px-2 py-1 bg-secondary rounded-md text-sm">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Similar Sounds</h4>
                        <div className="flex flex-wrap gap-2">
                          {rhymes.soundsLike.map((word, index) => (
                            <span key={index} className="px-2 py-1 bg-muted rounded-md text-sm">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}