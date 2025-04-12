import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Music, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewProjectDialog from "@/components/studio/NewProjectDialog";

export default function Header() {
  const [location] = useLocation();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  return (
    <header className="bg-neutral-800 border-b border-neutral-700 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex items-center mr-8">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mr-2">
            <Music className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Harmonize
          </h1>
        </div>
        
        <nav>
          <ul className="flex gap-6">
            <li>
              <Link href="/studio" className={`hover:text-primary transition font-medium ${location === "/" || location === "/studio" ? "text-neutral-50" : "text-neutral-400"}`}>
                Studio
              </Link>
            </li>
            <li>
              <Link href="/library" className={`hover:text-primary transition ${location === "/library" ? "text-neutral-50 font-medium" : "text-neutral-400"}`}>
                Library
              </Link>
            </li>
            <li>
              <Link href="/learn" className={`hover:text-primary transition ${location === "/learn" ? "text-neutral-50 font-medium" : "text-neutral-400"}`}>
                Learn
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => setIsNewProjectOpen(true)}
          className="bg-primary hover:bg-primary/90 transition"
        >
          <span className="mr-1">+</span> New Project
        </Button>
        <div className="w-9 h-9 bg-neutral-700 rounded-full flex items-center justify-center text-neutral-300 cursor-pointer hover:bg-neutral-600 transition">
          <User className="h-5 w-5" />
        </div>
      </div>

      <NewProjectDialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen} />
    </header>
  );
}
