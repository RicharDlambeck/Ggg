import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Home, Mic, PenTool, Music, Settings, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function WorkspaceLayout({ children, className }: WorkspaceLayoutProps) {
  const [location] = useLocation();
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-background/90 overflow-hidden">
      {/* Left Navigation */}
      <div className="w-20 border-r border-border/40 bg-card/30 flex flex-col items-center py-6 space-y-6">
        <div className="flex-1 flex flex-col items-center space-y-4">
          <NavItem 
            href="/" 
            icon={<Home className="h-5 w-5" />} 
            label="Hub" 
            isActive={location === '/'} 
          />
          <NavItem 
            href="/voice-lab" 
            icon={<Mic className="h-5 w-5" />} 
            label="Voice Lab" 
            isActive={location === '/voice-lab'} 
          />
          <NavItem 
            href="/forge-room" 
            icon={<PenTool className="h-5 w-5" />} 
            label="Forge Room" 
            isActive={location === '/forge-room'} 
          />
          <NavItem 
            href="/mix-space" 
            icon={<Music className="h-5 w-5" />} 
            label="Mix Space" 
            isActive={location === '/mix-space'} 
          />
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <NavItem 
            href="/settings" 
            icon={<Settings className="h-5 w-5" />} 
            label="Settings" 
            isActive={location === '/settings'} 
          />
          <NavItem 
            href="/help" 
            icon={<HelpCircle className="h-5 w-5" />} 
            label="Help" 
            isActive={location === '/help'} 
          />
          <div className="mt-4 border-t border-border/40 pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-10 w-10 border-2 border-primary/20 cursor-pointer hover:border-primary/50 transition-colors">
                    <AvatarFallback className="bg-primary/20 text-primary-foreground">US</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>User Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={cn("flex-1 overflow-hidden", className)}>
        {children}
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href}>
            <Button
              variant={isActive ? "default" : "ghost"} 
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full",
                isActive && "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              )}
            >
              {icon}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}