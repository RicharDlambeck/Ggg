import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Mic, Play, Upload, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface VoiceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Voice model name is required").max(50, "Name must be less than 50 characters"),
  isPublic: z.boolean().default(false),
  audioSamples: z.array(z.instanceof(File)).min(1, "At least one audio sample is required"),
});

export default function VoiceUploadDialog({ open, onOpenChange }: VoiceUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [recordingState, setRecordingState] = useState<'inactive' | 'recording' | 'paused'>('inactive');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      isPublic: false,
      audioSamples: [],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload audio files only (MP3, WAV, etc.).",
        variant: "destructive",
      });
      return;
    }
    
    setAudioFiles(prev => [...prev, ...audioFiles]);
    form.setValue('audioSamples', [...audioFiles, ...prev]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...audioFiles];
    newFiles.splice(index, 1);
    setAudioFiles(newFiles);
    form.setValue('audioSamples', newFiles);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        // Convert Blob to File
        const fileName = `recording-${Date.now()}.wav`;
        const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' });
        
        setAudioFiles(prev => [...prev, audioFile]);
        form.setValue('audioSamples', [...audioFiles, audioFile]);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setRecordingState('recording');
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice samples.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('inactive');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('isPublic', values.isPublic.toString());
      formData.append('type', 'custom');
      
      // Append all audio files
      values.audioSamples.forEach((file, index) => {
        formData.append('audioSamples', file);
      });
      
      // For demo, we're using a direct fetch because apiRequest doesn't support FormData
      const response = await fetch('/api/voice-models', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload voice model');
      }
      
      // Invalidate voice models query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/voice-models"] });
      
      toast({
        title: "Voice model created",
        description: `"${values.name}" has been created with ${values.audioSamples.length} samples.`,
      });
      
      // Reset form and state
      form.reset();
      setAudioFiles([]);
      setAudioUrl(null);
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload voice model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && recordingState === 'recording') {
        stopRecording();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="bg-neutral-800 border-neutral-700 text-neutral-50 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Create Voice Model</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Upload audio samples of your voice to create a custom voice model.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice Model Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My Custom Voice" 
                      className="bg-neutral-700 border-neutral-600 focus:border-primary text-neutral-100"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="audioSamples"
              render={() => (
                <FormItem className="space-y-3">
                  <FormLabel>Voice Samples</FormLabel>
                  <FormDescription className="text-neutral-400">
                    Upload or record audio samples of your voice (2-5 samples recommended).
                  </FormDescription>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('audio-upload')?.click()}
                        className="flex-1 border-dashed border-neutral-600"
                      >
                        <Upload className="h-4 w-4 mr-2" /> Upload Audio
                      </Button>
                      <Input
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      
                      <Button
                        type="button"
                        variant={recordingState === 'recording' ? "destructive" : "secondary"}
                        onClick={recordingState === 'recording' ? stopRecording : startRecording}
                        className={`flex-1 ${recordingState === 'recording' ? 'bg-red-600 hover:bg-red-700' : 'bg-accent hover:bg-accent/90'}`}
                      >
                        {recordingState === 'recording' ? (
                          <>Stop Recording</>
                        ) : (
                          <><Mic className="h-4 w-4 mr-2" /> Record Voice</>
                        )}
                      </Button>
                    </div>
                    
                    {recordingState === 'recording' && (
                      <div className="p-3 bg-red-900/20 border border-red-600 rounded-md text-center animate-pulse">
                        Recording in progress...
                      </div>
                    )}
                    
                    {audioFiles.length > 0 && (
                      <div className="border border-neutral-700 rounded-md overflow-hidden">
                        <div className="bg-neutral-700 px-3 py-2 text-sm font-medium">
                          Uploaded Samples ({audioFiles.length})
                        </div>
                        <ul className="max-h-40 overflow-y-auto">
                          {audioFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between px-3 py-2 border-t border-neutral-700">
                              <div className="flex items-center">
                                <Play className="h-4 w-4 mr-2 text-neutral-400" />
                                <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(index)}
                                className="h-6 w-6 text-neutral-400 hover:text-red-400"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-neutral-700 p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Make Public</FormLabel>
                    <FormDescription className="text-neutral-400">
                      Allow others to use your voice model
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-neutral-600"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={isUploading || audioFiles.length === 0}
              >
                {isUploading ? "Creating..." : "Create Voice Model"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
