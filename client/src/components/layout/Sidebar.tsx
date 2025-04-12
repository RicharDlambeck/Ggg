import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Track, ProjectWithTracks } from "@shared/schema";
import { Mic, Music2, Album, HelpCircle, Settings, Plus, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SidebarProps {
  project: ProjectWithTracks;
  selectedTrack: Track | null;
  onSelectTrack: (track: Track) => void;
  onAddTrack: () => void;
}

export default function Sidebar({ project, selectedTrack, onSelectTrack, onAddTrack }: SidebarProps) {
  return (
    <aside className="w-64 bg-neutral-800 flex flex-col border-r border-neutral-700">
      <div className="p-4 border-b border-neutral-700">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-sm text-neutral-400">PROJECT</h2>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-200 transition h-6 w-6">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <div className="bg-neutral-700 rounded-md p-2">
          <h3 className="font-medium">{project.name}</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Last edited: {new Date(project.lastModified).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="font-medium text-sm text-neutral-400 mb-3">TRACKS</h2>
          
          {project.tracks.map((track) => (
            <div 
              key={track.id}
              className={`mb-3 rounded-md p-3 cursor-pointer transition ${
                selectedTrack?.id === track.id 
                  ? "bg-neutral-700/50 border border-primary/50" 
                  : "bg-neutral-700 hover:bg-neutral-600 border border-transparent"
              }`}
              onClick={() => onSelectTrack(track)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className={`font-medium text-sm ${
                    selectedTrack?.id === track.id ? "text-primary-light" : ""
                  }`}>
                    {track.name}
                  </h4>
                  <p className="text-xs text-neutral-400 capitalize">{track.type}</p>
                </div>
                <div className={selectedTrack?.id === track.id ? "text-primary-light" : "text-neutral-400"}>
                  <AudioLines className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full mt-2 py-2 text-neutral-400 hover:text-primary text-sm border-dashed"
            onClick={onAddTrack}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Track
          </Button>
        </div>
        
        <div className="p-4 border-t border-neutral-700 mt-2">
          <h2 className="font-medium text-sm text-neutral-400 mb-3">RESOURCES</h2>
          
          <div className="space-y-2">
            <a href="#" className="text-sm flex items-center text-neutral-300 hover:text-primary transition py-1">
              <Music2 className="h-4 w-4 mr-2" /> Instrumental Library
            </a>
            <a href="#" className="text-sm flex items-center text-neutral-300 hover:text-primary transition py-1">
              <Mic className="h-4 w-4 mr-2" /> Voice Models
            </a>
            <a href="#" className="text-sm flex items-center text-neutral-300 hover:text-primary transition py-1">
              <Album className="h-4 w-4 mr-2" /> Sound Effects
            </a>
            <a href="#" className="text-sm flex items-center text-neutral-300 hover:text-primary transition py-1">
              <HelpCircle className="h-4 w-4 mr-2" /> Tutorial Guide
            </a>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400">Storage</div>
            <div className="text-sm font-medium">1.2GB / 5GB</div>
          </div>
          <div className="text-xs bg-primary/20 text-primary-light px-2 py-1 rounded">
            Free Plan
          </div>
        </div>
        <Progress className="mt-2 bg-neutral-700 h-1.5" value={24} />
      </div>
    </aside>
  );
}
