import React from 'react';
import WorkspaceLayout from '@/components/layout/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Music, Mic, Wand2, Clock } from 'lucide-react';
import { Link } from 'wouter';

export default function Hub() {
  return (
    <WorkspaceLayout>
      <div className="h-full flex flex-col overflow-y-auto">
        <header className="p-6 border-b border-border/40 bg-card/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                SoundForge AI
              </h1>
              <p className="text-muted-foreground mt-1">Create amazing music with your voice and AI</p>
            </div>
            <Link href="/new-project">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        </header>
        
        <main className="flex-1 p-6 space-y-8">
          {/* Creative Timeline */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Creative Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projectCards.map((project, index) => (
                <ProjectCard key={index} {...project} />
              ))}
              <Card className="border border-dashed border-border/70 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer group">
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <PlusCircle className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                  <p className="font-medium">Create New Project</p>
                </div>
              </Card>
            </div>
          </section>
          
          {/* Creative Spaces */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Creative Spaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <WorkspaceCard 
                title="Voice Lab"
                description="Create and manage your voice models"
                icon={<Mic className="h-8 w-8" />}
                href="/voice-lab"
                gradient="from-pink-600 to-purple-600"
              />
              <WorkspaceCard 
                title="Forge Room"
                description="Write and generate lyrics"
                icon={<Wand2 className="h-8 w-8" />}
                href="/forge-room"
                gradient="from-blue-600 to-cyan-600"
              />
              <WorkspaceCard 
                title="Mix Space"
                description="Mix, edit, and export your tracks"
                icon={<Music className="h-8 w-8" />}
                href="/mix-space"
                gradient="from-green-600 to-emerald-600"
              />
              <WorkspaceCard 
                title="Community"
                description="Explore and share creations"
                icon={<Music className="h-8 w-8" />}
                href="/community"
                gradient="from-amber-600 to-orange-600"
              />
            </div>
          </section>
          
          {/* Library Section */}
          <section>
            <Tabs defaultValue="voices" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Library</h2>
                <TabsList>
                  <TabsTrigger value="voices">Voice Models</TabsTrigger>
                  <TabsTrigger value="instrumentals">Instrumentals</TabsTrigger>
                  <TabsTrigger value="mixes">Mixes</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="voices" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {voiceModels.map((model, index) => (
                    <VoiceModelCard key={index} {...model} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="instrumentals" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {instrumentals.map((instrumental, index) => (
                    <InstrumentalCard key={index} {...instrumental} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="mixes" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {mixes.map((mix, index) => (
                    <MixCard key={index} {...mix} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </main>
      </div>
    </WorkspaceLayout>
  );
}

interface ProjectCardProps {
  title: string;
  date: string;
  type: string;
  thumbnail?: string;
}

function ProjectCard({ title, date, type, thumbnail }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 relative">
        {thumbnail && (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-2 right-2 bg-background/80 text-xs px-2 py-1 rounded-full">
          {type}
        </div>
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{date}</CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Link href={`/project/${title.toLowerCase().replace(/\s+/g, '-')}`}>
          <Button variant="ghost" size="sm">Open</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

interface WorkspaceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
}

function WorkspaceCard({ title, description, icon, href, gradient }: WorkspaceCardProps) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className={`h-20 bg-gradient-to-r ${gradient} flex items-center justify-center`}>
          <div className="bg-white/20 p-3 rounded-full">
            {icon}
          </div>
        </div>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

interface VoiceModelCardProps {
  name: string;
  type: string;
  lastUsed: string;
}

function VoiceModelCard({ name, type, lastUsed }: VoiceModelCardProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>Type: {type}</CardDescription>
          </div>
          <Mic className="h-8 w-8 text-primary/40" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground">Last used: {lastUsed}</p>
      </CardContent>
    </Card>
  );
}

interface InstrumentalCardProps {
  name: string;
  genre: string;
  duration: string;
}

function InstrumentalCard({ name, genre, duration }: InstrumentalCardProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>Genre: {genre}</CardDescription>
          </div>
          <Music className="h-8 w-8 text-primary/40" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground">Duration: {duration}</p>
      </CardContent>
    </Card>
  );
}

interface MixCardProps {
  name: string;
  tracks: number;
  duration: string;
}

function MixCard({ name, tracks, duration }: MixCardProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>Tracks: {tracks}</CardDescription>
          </div>
          <Music className="h-8 w-8 text-primary/40" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground">Duration: {duration}</p>
      </CardContent>
    </Card>
  );
}

// Sample data
const projectCards = [
  { title: "Summer Vibes", date: "Apr 10, 2025", type: "Song" },
  { title: "Night Drive", date: "Apr 8, 2025", type: "Instrumental" },
  { title: "Urban Poetry", date: "Apr 5, 2025", type: "Vocal" },
];

const voiceModels = [
  { name: "My Singing Voice", type: "Natural", lastUsed: "2 hours ago" },
  { name: "Rap Flow", type: "Modified", lastUsed: "Yesterday" },
  { name: "Smooth R&B", type: "Enhanced", lastUsed: "Apr 8, 2025" },
  { name: "Rock Voice", type: "Modified", lastUsed: "Apr 5, 2025" },
];

const instrumentals = [
  { name: "Summer Beat", genre: "Pop", duration: "3:24" },
  { name: "City Lights", genre: "Hip Hop", duration: "2:45" },
  { name: "Ocean Waves", genre: "Ambient", duration: "4:10" },
  { name: "Electric Dreams", genre: "Electronic", duration: "3:18" },
];

const mixes = [
  { name: "Summer Vibes (Final)", tracks: 4, duration: "3:45" },
  { name: "Feelings (Draft)", tracks: 3, duration: "2:30" },
  { name: "Urban Poetry (v2)", tracks: 5, duration: "4:20" },
  { name: "Night Drive (Master)", tracks: 6, duration: "3:55" },
];