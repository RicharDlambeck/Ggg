import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { MicIcon, SaveIcon, WandIcon, UploadIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VoiceRecorder from './VoiceRecorder';
import { apiRequest } from '@/lib/queryClient';
import { InsertVoiceModel } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

export default function VoiceModelCreator() {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('custom');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [audioSamples, setAudioSamples] = useState<Blob[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle recording
  const handleSaveRecording = useCallback((audioBlob: Blob) => {
    setAudioSamples(prev => [...prev, audioBlob]);
    toast({
      title: 'Sample added',
      description: `Sample ${audioSamples.length + 1} added successfully!`,
    });
  }, [audioSamples.length, toast]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      if (file.type.includes('audio')) {
        setAudioSamples(prev => [...prev, file]);
        toast({
          title: 'Sample added',
          description: `Sample ${audioSamples.length + 1} added from file: ${file.name}`,
        });
      } else {
        toast({
          title: 'Invalid file',
          description: 'Please upload an audio file.',
          variant: 'destructive',
        });
      }
    }
  }, [audioSamples.length, toast]);

  // Remove a sample
  const removeSample = useCallback((index: number) => {
    setAudioSamples(prev => prev.filter((_, i) => i !== index));
    toast({
      title: 'Sample removed',
      description: `Sample ${index + 1} has been removed.`,
    });
  }, [toast]);

  // Create voice model
  const createVoiceModel = useCallback(async () => {
    if (audioSamples.length < 3) {
      toast({
        title: 'Not enough samples',
        description: 'Please provide at least 3 audio samples for better voice modeling.',
        variant: 'destructive',
      });
      return;
    }

    if (!name) {
      toast({
        title: 'Missing name',
        description: 'Please provide a name for your voice model.',
        variant: 'destructive',
      });
      return;
    }

    setIsTraining(true);
    setProgress(0);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('type', type);
      formData.append('isPublic', isPublic.toString());
      
      audioSamples.forEach((blob, index) => {
        formData.append('audioSamples', blob, `sample-${index + 1}.webm`);
      });
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
      
      // Upload to server
      const response = await fetch('/api/voice-models', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      setProgress(100);
      
      // Get response
      const data = await response.json();
      
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ['/api/voice-models'] });
      
      toast({
        title: 'Voice model created',
        description: `Your voice model "${name}" has been created successfully!`,
      });
      
      // Reset form
      setName('');
      setType('custom');
      setIsPublic(false);
      setAudioSamples([]);
      setCurrentStep(1);
      
    } catch (error) {
      console.error('Error creating voice model:', error);
      toast({
        title: 'Error',
        description: 'Failed to create voice model. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTraining(false);
      setProgress(0);
    }
  }, [name, type, isPublic, audioSamples, toast]);

  // Advance to next step
  const goToNextStep = useCallback(() => {
    if (currentStep === 1 && !name) {
      toast({
        title: 'Missing name',
        description: 'Please provide a name for your voice model.',
        variant: 'destructive',
      });
      return;
    }
    
    if (currentStep === 2 && audioSamples.length < 1) {
      toast({
        title: 'No samples',
        description: 'Please add at least one voice sample.',
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  }, [currentStep, name, audioSamples.length, toast]);

  // Go back to previous step
  const goToPreviousStep = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, []);

  // Render step 1: Basic information
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voice-name">Voice Model Name</Label>
        <Input
          id="voice-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. My Rap Voice"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="voice-type">Voice Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select voice type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom Voice</SelectItem>
            <SelectItem value="rap">Rap Voice</SelectItem>
            <SelectItem value="singing">Singing Voice</SelectItem>
            <SelectItem value="narration">Narration Voice</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is-public"
          checked={isPublic}
          onChange={e => setIsPublic(e.target.checked)}
          className="w-4 h-4"
        />
        <Label htmlFor="is-public" className="text-sm text-muted-foreground">
          Make this voice model public and available to others
        </Label>
      </div>
    </div>
  );

  // Render step 2: Voice samples
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Voice Samples ({audioSamples.length}/5)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Record or upload at least 3 samples of your voice for best results. 
          Try to vary your tone and speaking style to create a more versatile model.
        </p>
        
        {audioSamples.length > 0 && (
          <div className="space-y-2 mb-4 border rounded-md p-3">
            {audioSamples.map((sample, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Sample {index + 1}</span>
                  <audio controls src={URL.createObjectURL(sample)} className="h-8 w-40" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSample(index)}
                  className="h-8 w-8"
                >
                  <TrashIcon size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {audioSamples.length < 5 && (
          <div className="space-y-4">
            <VoiceRecorder onSaveRecording={handleSaveRecording} maxRecordingTime={15000} />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Or</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <UploadIcon size={16} className="mr-2" />
                Upload Audio File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render step 3: Review and train
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="border rounded-md p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium">Name:</p>
            <p className="text-sm">{name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Type:</p>
            <p className="text-sm capitalize">{type}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Visibility:</p>
            <p className="text-sm">{isPublic ? 'Public' : 'Private'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Samples:</p>
            <p className="text-sm">{audioSamples.length}</p>
          </div>
        </div>
      </div>
      
      {isTraining && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Training Progress</p>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}% complete</p>
        </div>
      )}
      
      <div className="space-y-2">
        <Button
          onClick={createVoiceModel}
          disabled={isTraining}
          className="w-full"
        >
          <WandIcon size={16} className="mr-2" />
          {isTraining ? 'Training...' : 'Create Voice Model'}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          This process may take a few minutes depending on the number of samples.
        </p>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create Voice Model</CardTitle>
        <CardDescription>
          Train an AI model that sounds like your voice for rap or singing.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isTraining}
          >
            Back
          </Button>
        )}
        
        {currentStep < 3 && (
          <Button
            onClick={goToNextStep}
            className={currentStep === 1 ? 'ml-auto' : ''}
          >
            Next
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}