import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useParams } from "wouter";

interface HeaderProps {
  trackTitle?: string;
}

export default function Header({ trackTitle = "Untitled Track" }: HeaderProps) {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const handleExport = async () => {
    try {
      if (!id) return;
      
      const res = await apiRequest('POST', `/api/tracks/${id}/export`, {});
      const data = await res.json();
      
      toast({
        title: "Track exported successfully!",
        description: "Your audio file is ready for download.",
      });
      
      // In a real implementation, we would trigger a download
      // For now, just show a success message
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  
  const handleShare = () => {
    // Copy to clipboard
    if (navigator.clipboard && window.location.href) {
      navigator.clipboard.writeText(window.location.href);
      
      toast({
        title: "Link copied to clipboard",
        description: "Share this link with others to let them see your track.",
      });
    }
  };
  
  return (
    <header className="bg-background border-b border-border px-4 py-2 flex items-center justify-between">
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
        <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
          Share
        </Button>
        
        <Button size="sm" onClick={handleExport} className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export
        </Button>
        
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <span className="text-white font-medium">JS</span>
        </div>
      </div>
    </header>
  );
}
