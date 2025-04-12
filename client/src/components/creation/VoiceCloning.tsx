import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Vocal } from "@shared/schema";

interface VoiceCloningProps {
  trackId: number;
  onVocalsAdded?: (vocal: Vocal) => void;
}

export default function VoiceCloning({ trackId, onVocalsAdded }: VoiceCloningProps) {
  const { toast } = useToast();
  
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [voiceModelName, setVoiceModelName] = useState("");
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [samples, setSamples] = useState<{ id: number; name: string; duration: number }[]>([
    { id: 1, name: "Sample 1", duration: 12 },
    { id: 2, name: "Sample 2", duration: 18 }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const handleOpenTrainingModal = () => {
    setIsTrainingModalOpen(true);
    setVoiceModelName("");
  };
  
  const handleCloseTrainingModal = () => {
    setIsTrainingModalOpen(false);
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    setIsRecording(false);
    setRecordingTime(0);
  };
  
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    setRecordingInterval(interval);
    
    // In a real implementation, we would start recording using the Web Audio API
    toast({
      title: "Recording started",
      description: "Speak clearly into your microphone.",
    });
  };
  
  const handleStopRecording = () => {
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    
    setIsRecording(false);
    
    // In a real implementation, we would stop recording and process the audio
    const newSample = {
      id: samples.length + 1,
      name: `Sample ${samples.length + 1}`,
      duration: recordingTime
    };
    
    setSamples([...samples, newSample]);
    
    toast({
      title: "Recording stopped",
      description: `Sample ${samples.length + 1} saved (${recordingTime} seconds).`,
    });
  };
  
  const handleDeleteSample = (id: number) => {
    setSamples(samples.filter(sample => sample.id !== id));
  };
  
  const handlePlaySample = (id: number) => {
    // In a real implementation, we would play the sample
    toast({
      title: "Playing sample",
      description: `Sample ${id} is playing.`,
    });
  };
  
  const handleUploadAudio = () => {
    // In a real implementation, we would show a file picker
    toast({
      title: "File upload",
      description: "File upload functionality coming soon.",
    });
  };
  
  const handleCreateVoiceModel = async () => {
    try {
      if (!voiceModelName || voiceModelName.trim() === "") {
        toast({
          variant: "destructive",
          title: "Name required",
          description: "Please provide a name for your voice model.",
        });
        return;
      }
      
      if (samples.length < 2) {
        toast({
          variant: "destructive",
          title: "More samples needed",
          description: "Please record at least 2 voice samples.",
        });
        return;
      }
      
      setIsCreatingModel(true);
      
      // Create the voice model
      const res = await apiRequest('POST', '/api/voice-models', {
        name: voiceModelName,
        sampleCount: samples.length,
        userId: 1 // Using default user
      });
      
      const data = await res.json();
      const voiceModelId = data.voiceModel.id;
      
      // Create voice samples
      for (const sample of samples) {
        await apiRequest('POST', '/api/voice-samples', {
          duration: sample.duration,
          voiceModelId: voiceModelId
        });
      }
      
      // Refresh voice models
      queryClient.invalidateQueries({ queryKey: ['/api/voice-models'] });
      
      toast({
        title: "Voice model created",
        description: "Your voice model is ready to use.",
      });
      
      handleCloseTrainingModal();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create voice model",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsCreatingModel(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voice Cloning</CardTitle>
          <CardDescription>Create and manage your voice models</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center p-6 space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-primary">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            
            <h3 className="text-lg font-medium">Train Your Voice Model</h3>
            <p className="text-sm text-muted-foreground">
              Record or upload voice samples to create a model that sounds like you.
            </p>
            
            <Button onClick={handleOpenTrainingModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create New Voice Model
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Voice Instructions</CardTitle>
          <CardDescription>Tips for creating high-quality voice models</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/30 rounded-md p-4">
              <h4 className="font-medium text-primary mb-2">Best Practices</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Record in a quiet environment with minimal background noise</li>
                <li>Use consistent volume and speaking style across samples</li>
                <li>Record at least 3-5 samples for better quality</li>
                <li>Speak clearly and at a natural pace</li>
              </ul>
            </div>
            
            <div className="bg-background rounded-md p-4 border">
              <h4 className="font-medium mb-2">Sample Script Ideas</h4>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>The quick brown fox jumps over the lazy dog</li>
                <li>Today is a wonderful day to create music</li>
                <li>I love the sound of my voice in a song</li>
                <li>Music brings joy and happiness to everyone</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Voice Training Modal */}
      <Dialog open={isTrainingModalOpen} onOpenChange={setIsTrainingModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Train Your Voice Model</DialogTitle>
            <DialogDescription>
              Record or upload at least 2 voice samples to create your voice model.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div className="space-y-2">
              <label htmlFor="voice-name" className="text-sm font-medium">
                Voice Model Name
              </label>
              <Input
                id="voice-name"
                placeholder="e.g., My Singing Voice"
                value={voiceModelName}
                onChange={(e) => setVoiceModelName(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              {/* Voice samples */}
              {samples.map((sample) => (
                <div key={sample.id} className="bg-muted rounded-md p-3 flex items-center justify-between">
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
                      <h3 className="text-sm font-medium">{sample.name}</h3>
                      <p className="text-xs text-muted-foreground">{sample.duration} seconds</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePlaySample(sample.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteSample(sample.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Add Sample */}
              <div className="border border-dashed border-border rounded-md p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground mb-2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                <p className="text-sm text-muted-foreground mb-3">
                  {isRecording 
                    ? `Recording... ${recordingTime} seconds` 
                    : "Record a new sample or upload audio"}
                </p>
                <div className="flex space-x-2 justify-center">
                  {isRecording ? (
                    <Button 
                      variant="destructive" 
                      onClick={handleStopRecording}
                      className="flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <rect x="6" y="6" width="12" height="12"></rect>
                      </svg>
                      Stop
                    </Button>
                  ) : (
                    <Button 
                      variant="destructive" 
                      onClick={handleStartRecording}
                      className="flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Record
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleUploadAudio}>
                    Upload Audio
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseTrainingModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateVoiceModel} 
              disabled={isCreatingModel || samples.length < 2 || !voiceModelName}
            >
              {isCreatingModel ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                    <path d="M19 10c0 3.976-7 9-7 9s-7-5.024-7-9c0-3.865 3.135-7 7-7s7 3.135 7 7z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Train Voice Model
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
