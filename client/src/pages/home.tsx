import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { formatTime } from "@/lib/audio";
import { useToast } from "@/hooks/use-toast";
import { Track } from "@shared/schema";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fetch tracks
  const { data: tracksData, isLoading, error } = useQuery({
    queryKey: ['/api/tracks'],
    staleTime: 30000,
  });
  
  const tracks = tracksData?.tracks || [];
  
  // If there's an error, show a toast
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading tracks",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [error, toast]);
  
  const handleCreateNew = async () => {
    try {
      const res = await apiRequest('POST', '/api/tracks', {
        title: 'Untitled Track',
        genre: 'Pop',
        duration: 180,
        userId: 1, // Using the default user
      });
      
      const data = await res.json();
      setLocation(`/editor/${data.track.id}`);
      
      toast({
        title: "New track created",
        description: "Start creating your masterpiece!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create track",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-foreground flex items-center">
            <span className="text-accent mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </span>
            SoundCraft Studio
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button size="sm" onClick={handleCreateNew} className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Creation
          </Button>
          
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white font-medium">JS</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to SoundCraft Studio</h2>
          <p className="text-muted-foreground text-lg">Create amazing songs with AI-powered instrumentals and voice cloning</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
                Create Instrumentals
              </CardTitle>
              <CardDescription>
                Generate unique backing tracks in any genre or style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Describe the sound you want, choose a genre and mood, and let our AI create a professional instrumental track for your song.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleCreateNew}>
                Start Creating
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-accent/10 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-accent">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                Clone Your Voice
              </CardTitle>
              <CardDescription>
                Create a digital version of your voice for singing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Record a few samples of your voice, and our AI will create a voice model that can sing any lyrics you write in your unique vocal style.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleCreateNew}>
                Clone My Voice
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Tracks</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 bg-muted rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No tracks yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first track to get started with SoundCraft Studio
              </p>
              <Button onClick={handleCreateNew}>Create Your First Track</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tracks.map((track: Track) => (
                <Card key={track.id} className="overflow-hidden border hover:shadow-md transition-shadow duration-200">
                  <div className="h-2 bg-primary"></div>
                  <CardHeader>
                    <CardTitle>{track.title}</CardTitle>
                    <CardDescription>{track.genre} • {formatTime(track.duration)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded-md flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <path d="M10 13l8 3-8 3"></path>
                      </svg>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => setLocation(`/editor/${track.id}`)}
                    >
                      Open Project
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <Card className="border border-dashed hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-muted-foreground">New Project</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center pt-0">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full h-full py-8"
                    onClick={handleCreateNew}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center">
              <span className="text-accent mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </span>
              <span className="text-sm font-medium">SoundCraft Studio</span>
            </div>
            <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
              AI-powered music creation platform
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
