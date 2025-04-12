import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Mic, Music, PenTool, Wand } from 'lucide-react';
import VoiceModelSelector from './VoiceModelSelector';
import VoiceModelCreator from './VoiceModelCreator';
import LyricsGenerator from './LyricsGenerator';
import MixPanel from './MixPanel';
import InstrumentalGenerator from './InstrumentalGenerator';
import { VoiceModel as BaseVoiceModel } from '@shared/schema';
import axios from 'axios';

// Type-safe extension of VoiceModel
interface VoiceModel extends BaseVoiceModel {
  audioSamples: string[] | null;
}

export default function VoiceCloneStudio() {
  const [activeTab, setActiveTab] = useState<string>('voice-models');
  const [selectedVoiceModel, setSelectedVoiceModel] = useState<VoiceModel | null>(null);
  const [showVoiceCreator, setShowVoiceCreator] = useState<boolean>(false);
  const [lyrics, setLyrics] = useState<string>('');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [instrumentalUrl, setInstrumentalUrl] = useState<string | null>(null);
  const [showInstrumentalGenerator, setShowInstrumentalGenerator] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Select voice model
  const handleSelectVoiceModel = useCallback((model: VoiceModel) => {
    setSelectedVoiceModel(model);
    toast({
      title: 'Voice Model Selected',
      description: `Selected "${model.name}" voice model`,
    });
  }, [toast]);

  // Save lyrics
  const handleSaveLyrics = useCallback((text: string) => {
    setLyrics(text);
    if (activeTab === 'lyrics') {
      setActiveTab('generate');
    }
  }, [activeTab]);

  // Generate vocals with selected voice model and lyrics
  const generateVocals = useCallback(async () => {
    if (!selectedVoiceModel) {
      toast({
        title: 'No Voice Model Selected',
        description: 'Please select a voice model first.',
        variant: 'destructive',
      });
      return;
    }

    if (!lyrics.trim()) {
      toast({
        title: 'No Lyrics',
        description: 'Please add some lyrics first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedAudioUrl(null);

    try {
      // Default voice settings
      const settings = {
        character: 70,
        clarity: 85,
        emotion: 60,
        style: ['natural'],
      };

      const response = await axios.post('/api/generate/vocals', {
        lyrics,
        voiceModelId: selectedVoiceModel.id,
        settings,
      });

      if (response.data && response.data.audioUrl) {
        setGeneratedAudioUrl(response.data.audioUrl);
        toast({
          title: 'Vocals Generated',
          description: 'Your vocals have been generated successfully!',
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating vocals:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate vocals. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedVoiceModel, lyrics, toast]);

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Voice Clone Studio</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Voice Model Selection */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Models
              </CardTitle>
              <CardDescription>
                Select or create your voice model
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <VoiceModelSelector
                onSelectModel={handleSelectVoiceModel}
                selectedModelId={selectedVoiceModel?.id || null}
                onCreateNewModel={() => setShowVoiceCreator(true)}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="lyrics" className="flex items-center gap-1">
                    <PenTool className="h-4 w-4" />
                    <span className="hidden sm:inline">Write Lyrics</span>
                    <span className="sm:hidden">Lyrics</span>
                  </TabsTrigger>
                  <TabsTrigger value="generate" className="flex items-center gap-1">
                    <Wand className="h-4 w-4" />
                    <span className="hidden sm:inline">Generate Vocals</span>
                    <span className="sm:hidden">Vocals</span>
                  </TabsTrigger>
                  <TabsTrigger value="mix" className="flex items-center gap-1">
                    <Music className="h-4 w-4" />
                    <span className="hidden sm:inline">Mixing & Export</span>
                    <span className="sm:hidden">Mix</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="lyrics" className="mt-0">
                <LyricsGenerator 
                  onSaveLyrics={handleSaveLyrics} 
                  initialLyrics={lyrics}
                />
              </TabsContent>
              
              <TabsContent value="generate" className="mt-0">
                <div className="space-y-6">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Selected Voice Model</h3>
                    {selectedVoiceModel ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{selectedVoiceModel.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{selectedVoiceModel.type}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('voice-models')}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-muted-foreground mb-3">No voice model selected</p>
                        <Button 
                          variant="outline"
                          onClick={() => setActiveTab('voice-models')}
                        >
                          Select Voice Model
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Lyrics</h3>
                    {lyrics ? (
                      <div className="flex flex-col">
                        <div className="max-h-40 overflow-y-auto bg-muted p-3 rounded-md mb-2 whitespace-pre-line">
                          {lyrics}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="self-end"
                          onClick={() => setActiveTab('lyrics')}
                        >
                          Edit Lyrics
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-muted-foreground mb-3">No lyrics added</p>
                        <Button 
                          variant="outline"
                          onClick={() => setActiveTab('lyrics')}
                        >
                          Add Lyrics
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={generateVocals}
                      disabled={isGenerating || !selectedVoiceModel || !lyrics}
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand className="h-4 w-4" />
                          Generate Vocals
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {generatedAudioUrl && (
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Generated Vocals</h3>
                      <audio 
                        controls 
                        src={generatedAudioUrl} 
                        className="w-full"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generatedAudioUrl, '_blank')}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="mix" className="mt-0">
                {generatedAudioUrl ? (
                  <div className="space-y-6">
                    {!instrumentalUrl && (
                      <div className="flex flex-col items-center mb-6 p-4 border rounded-md">
                        <p className="mb-4">Add a backing track to your vocals for a complete song.</p>
                        <Button onClick={() => setShowInstrumentalGenerator(true)}>
                          Generate Instrumental
                        </Button>
                      </div>
                    )}
                    
                    {instrumentalUrl && (
                      <div className="mb-6 p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Instrumental Track</h3>
                        <audio 
                          controls 
                          src={instrumentalUrl} 
                          className="w-full mb-2"
                        />
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInstrumentalGenerator(true)}
                          >
                            Change Instrumental
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <MixPanel 
                      vocalTrackUrl={generatedAudioUrl} 
                      instrumentalTrackUrl={instrumentalUrl}
                      onSaveTrack={(mixedUrl) => {
                        window.open(mixedUrl, '_blank');
                        toast({
                          title: "Mix Exported",
                          description: "Your mixed track has been exported successfully!",
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <h3 className="text-lg font-medium mb-2">No Vocals Generated</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate vocals first to use the mixing features.
                    </p>
                    <Button onClick={() => setActiveTab('generate')}>
                      Go to Vocal Generation
                    </Button>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Voice Model Creator Dialog */}
      <Dialog open={showVoiceCreator} onOpenChange={setShowVoiceCreator}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Voice Model</DialogTitle>
            <DialogDescription>
              Record or upload samples of your voice to create a custom voice model.
            </DialogDescription>
          </DialogHeader>
          
          <VoiceModelCreator />
        </DialogContent>
      </Dialog>
      
      {/* Instrumental Generator Dialog */}
      <Dialog open={showInstrumentalGenerator} onOpenChange={setShowInstrumentalGenerator}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generate Instrumental</DialogTitle>
            <DialogDescription>
              Create a backing track for your vocals by customizing the genre, mood, and other properties.
            </DialogDescription>
          </DialogHeader>
          
          <InstrumentalGenerator onGenerated={(url) => {
            setInstrumentalUrl(url);
            setShowInstrumentalGenerator(false);
            toast({
              title: 'Instrumental Generated',
              description: 'Backing track has been generated successfully!'
            });
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}