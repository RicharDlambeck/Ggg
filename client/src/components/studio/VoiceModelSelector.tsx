import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MicIcon, UserIcon, PlusCircleIcon, PlayIcon, StarIcon as StarFilledIcon } from 'lucide-react';
import { VoiceModel } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface VoiceModelSelectorProps {
  onSelectModel: (model: VoiceModel) => void;
  selectedModelId: number | null;
  onCreateNewModel: () => void;
}

export default function VoiceModelSelector({
  onSelectModel,
  selectedModelId,
  onCreateNewModel
}: VoiceModelSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>('featured');
  const { toast } = useToast();
  
  // Fetch voice models
  const { data: voiceModels = [], isLoading, error } = useQuery<VoiceModel[]>({
    queryKey: ['/api/voice-models'],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Play audio sample
  const playSample = (sampleUrl: string) => {
    const audio = new Audio(sampleUrl);
    audio.play();
  };
  
  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Failed to load voice models
      </div>
    );
  }
  
  // Filter models by type
  const featuredModels = voiceModels.filter((model: VoiceModel) => 
    model.userId === 0 || (model.isPublic && model.userId !== 1)
  );
  
  const myModels = voiceModels.filter((model: VoiceModel) => 
    model.userId === 1
  );
  
  return (
    <div className="w-full flex flex-col h-full">
      <Tabs defaultValue="featured" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="featured" className="flex items-center gap-1">
            <StarFilledIcon size={16} />
            Featured
          </TabsTrigger>
          <TabsTrigger value="my-models" className="flex items-center gap-1">
            <UserIcon size={16} />
            My Models
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="featured" className="flex-1">
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 gap-3 p-1">
              {featuredModels.map((model: VoiceModel) => (
                <VoiceModelCard
                  key={model.id}
                  model={model}
                  isSelected={model.id === selectedModelId}
                  onSelect={() => onSelectModel(model)}
                  onPlaySample={playSample}
                />
              ))}
              
              {featuredModels.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No featured voice models available
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="my-models" className="flex-1">
          <div className="mb-4">
            <Button 
              onClick={onCreateNewModel}
              variant="outline" 
              className="w-full justify-start mb-4"
            >
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create New Voice Model
            </Button>
          </div>
          
          <ScrollArea className="h-[350px]">
            <div className="grid grid-cols-1 gap-3 p-1">
              {myModels.map((model: VoiceModel) => (
                <VoiceModelCard
                  key={model.id}
                  model={model}
                  isSelected={model.id === selectedModelId}
                  onSelect={() => onSelectModel(model)}
                  onPlaySample={playSample}
                />
              ))}
              
              {myModels.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  You haven't created any voice models yet
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface VoiceModelCardProps {
  model: VoiceModel;
  isSelected: boolean;
  onSelect: () => void;
  onPlaySample: (sampleUrl: string) => void;
}

function VoiceModelCard({
  model,
  isSelected,
  onSelect,
  onPlaySample
}: VoiceModelCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-primary ring-1 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-sm">{model.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{model.type}</p>
          </div>
          
          <div className="flex gap-1">
            {model.audioSamples && Array.isArray(model.audioSamples) && model.audioSamples.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlaySample(model.audioSamples[0] as string);
                }}
              >
                <PlayIcon size={14} />
              </Button>
            )}
            
            {model.isPublic && (
              <div className="flex items-center justify-center h-5 w-5">
                <StarFilledIcon size={14} className="text-amber-400" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}