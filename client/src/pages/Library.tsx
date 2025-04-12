import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProjectWithTracks } from "@shared/schema";
import { Calendar, Clock, Music, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import NewProjectDialog from "@/components/studio/NewProjectDialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function Library() {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const { toast } = useToast();

  const { data: projects, isLoading, refetch } = useQuery<ProjectWithTracks[]>({
    queryKey: ["/api/projects"],
  });

  const handleDeleteProject = async (projectId: number) => {
    try {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
        variant: "default",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Your Music Library</h1>
          <p className="text-neutral-400 mt-1">Manage your projects and creations</p>
        </div>
        <Button 
          onClick={() => setIsNewProjectOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <span className="mr-1">+</span> New Project
        </Button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-neutral-800 border-neutral-700 overflow-hidden hover:border-neutral-600 transition">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 p-4">
                <CardTitle className="font-heading flex items-center">
                  <Music className="h-5 w-5 mr-2 text-primary" />
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center text-sm text-neutral-400 mb-3">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Last modified: {new Date(project.lastModified).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-neutral-400">
                  <Music className="h-4 w-4 mr-1" />
                  <span>{project.tracks.length} Tracks</span>
                </div>
                {project.tracks.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {project.tracks.slice(0, 3).map((track) => (
                      <div key={track.id} className="text-xs bg-neutral-700/50 rounded px-2 py-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                        <span className="truncate">{track.name}</span>
                        <span className="ml-auto text-neutral-500 capitalize">{track.type}</span>
                      </div>
                    ))}
                    {project.tracks.length > 3 && (
                      <div className="text-xs text-neutral-500 pl-4">
                        + {project.tracks.length - 3} more tracks
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-neutral-800 p-3 border-t border-neutral-700">
                <div className="flex w-full justify-between">
                  <Button variant="secondary" size="sm" className="bg-neutral-700 hover:bg-neutral-600" asChild>
                    <a href={`/studio?project=${project.id}`}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </a>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="bg-red-900/30 hover:bg-red-800"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-neutral-800/50 rounded-lg border border-neutral-700">
          <Music className="h-16 w-16 text-neutral-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">No projects yet</h3>
          <p className="text-neutral-400 mb-4">Create your first project to get started</p>
          <Button 
            onClick={() => setIsNewProjectOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <span className="mr-1">+</span> New Project
          </Button>
        </div>
      )}

      <NewProjectDialog 
        open={isNewProjectOpen} 
        onOpenChange={setIsNewProjectOpen} 
        onSuccess={() => refetch()}
      />
    </div>
  );
}
