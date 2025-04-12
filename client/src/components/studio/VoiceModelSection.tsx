import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { VoiceModel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Info, Upload, Library, User, Play } from "lucide-react";
import VoiceUploadDialog from "./VoiceUploadDialog";
import { useToast } from "@/hooks/use-toast";

export default function VoiceModelSection() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceModel | null>(null);
  const [character, setCharacter] = useState(70);
  const [clarity, setClarity] = useState(85);
  const [emotion, setEmotion] = useState(60);
  const { toast } = useToast();

  const { data: voiceModels, isLoading } = useQuery<VoiceModel[]>({
    queryKey: ["/api/voice-models"],
  });

  // Set the first voice model as selected when data loads
  if (voiceModels && voiceModels.length > 0 && !selectedVoice) {
    setSelectedVoice(voiceModels[0]);
  }

  const handlePlaySample = (voiceModel: VoiceModel) => {
    // In a real implementation, this would play an audio sample
    toast({
      title: "Playing sample",
      description: `Playing a sample of ${voiceModel.name}`,
    });
  };

  return (
    <div className="w-1/3 flex flex-col">
      <div className="bg-neutral-800 rounded-xl overflow-hidden mb-5">
        <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
          <h3 className="font-heading font-semibold">Voice Model</h3>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-200 transition h-6 w-6">
            <Info className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-5">
          {/* Selected Voice Model */}
          <div className="mb-5">
            <label className="block text-sm text-neutral-400 mb-2">Selected Voice</label>
            <div className="flex items-center bg-neutral-700 rounded-lg p-2 cursor-pointer hover:bg-neutral-600 transition">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <div className="font-medium">{selectedVoice?.name || "No voice selected"}</div>
                <div className="text-xs text-neutral-400 capitalize">{selectedVoice?.type || "Custom Model"}</div>
              </div>
              <svg className="ml-auto text-neutral-400 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Voice Parameters */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-neutral-400">Character</label>
                <span className="text-sm">{character}%</span>
              </div>
              <Slider
                value={[character]}
                onValueChange={(value) => setCharacter(value[0])}
                max={100}
                step={1}
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-neutral-400">Clarity</label>
                <span className="text-sm">{clarity}%</span>
              </div>
              <Slider
                value={[clarity]}
                onValueChange={(value) => setClarity(value[0])}
                max={100}
                step={1}
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-neutral-400">Emotion</label>
                <span className="text-sm">{emotion}%</span>
              </div>
              <Slider
                value={[emotion]}
                onValueChange={(value) => setEmotion(value[0])}
                max={100}
                step={1}
                className="h-2"
              />
            </div>
          </div>
          
          <div className="mt-5">
            <Button 
              className="w-full py-2.5 bg-accent hover:bg-accent/90 transition"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" /> Upload New Voice Sample
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full mt-3 py-2.5 border-neutral-600 hover:border-neutral-500 transition"
            >
              <Library className="h-4 w-4 mr-2" /> Browse Voice Library
            </Button>
          </div>
        </div>
      </div>
      
      {/* Voice Model Browser */}
      <div className="bg-neutral-800 rounded-xl overflow-hidden flex-1">
        <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
          <h3 className="font-heading font-semibold">Voice Library</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-200 transition h-7 w-7">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-200 transition h-7 w-7">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </Button>
          </div>
        </div>
        
        <div className="p-3 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-pulse">Loading voice models...</div>
            </div>
          ) : (
            voiceModels?.map((voice) => (
              <div 
                key={voice.id}
                className={`p-2 ${selectedVoice?.id === voice.id ? 'bg-neutral-700' : 'hover:bg-neutral-700'} rounded-lg transition cursor-pointer mb-2 flex items-center`}
                onClick={() => setSelectedVoice(voice)}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: voice.type === 'custom' ? '#8B5CF6' : 
                                    voice.name === 'Rich Baritone' ? '#EC4899' : 
                                    voice.name === 'Jazz Vocals' ? '#10B981' : '#F59E0B' 
                  }}
                >
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium">{voice.name}</div>
                  <div className="text-xs text-neutral-400 capitalize">
                    {voice.type} • {voice.sampleCount} samples
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto text-neutral-400 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySample(voice);
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <VoiceUploadDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} />
    </div>
  );
}
