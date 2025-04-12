import { Book, Video, HeadphonesIcon, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Learn() {
  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Learn Music Creation</h1>
        <p className="text-neutral-400 mt-2 max-w-2xl mx-auto">
          Discover how to create amazing songs using Harmonize's AI-powered tools for both instrumental generation and voice cloning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-neutral-800 border-neutral-700 hover:border-primary/50 transition">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-heading">Getting Started</CardTitle>
            <CardDescription className="text-neutral-400">
              Learn the basics of Harmonize
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                Introduction to the interface
              </li>
              <li className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                Creating your first project
              </li>
              <li className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                Saving and exporting songs
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-between hover:bg-primary/10 hover:text-primary">
              Start Learning <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700 hover:border-primary/50 transition">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
              <HeadphonesIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-heading">Voice Cloning</CardTitle>
            <CardDescription className="text-neutral-400">
              Master vocal generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                Recording voice samples
              </li>
              <li className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                Training your voice model
              </li>
              <li className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                Adjusting vocal characteristics
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-between hover:bg-primary/10 hover:text-primary">
              Start Learning <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-neutral-800 border-neutral-700 hover:border-primary/50 transition">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-heading">Instrumental Creation</CardTitle>
            <CardDescription className="text-neutral-400">
              Generate professional beats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                Choosing genre and style
              </li>
              <li className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                Tweaking the beat parameters
              </li>
              <li className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                Adding instrument layers
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-between hover:bg-primary/10 hover:text-primary">
              Start Learning <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-heading font-semibold mb-6">Video Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-neutral-800 border-neutral-700 overflow-hidden">
            <div className="aspect-video bg-neutral-900 flex items-center justify-center">
              <Video className="h-12 w-12 text-neutral-700" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium mb-1">Complete Song Creation Walkthrough</h3>
              <p className="text-sm text-neutral-400 mb-2">
                Learn how to create a complete song from scratch using Harmonize
              </p>
              <div className="flex items-center text-xs text-neutral-500">
                <Video className="h-3 w-3 mr-1" />
                <span>15:24</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-neutral-700 overflow-hidden">
            <div className="aspect-video bg-neutral-900 flex items-center justify-center">
              <Video className="h-12 w-12 text-neutral-700" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium mb-1">Advanced Voice Cloning Techniques</h3>
              <p className="text-sm text-neutral-400 mb-2">
                Master the art of creating realistic vocal tracks with voice cloning
              </p>
              <div className="flex items-center text-xs text-neutral-500">
                <Video className="h-3 w-3 mr-1" />
                <span>12:08</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-neutral-700">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-semibold mb-2">Ready to create your masterpiece?</h2>
            <p className="text-neutral-400">
              Head back to the studio and start creating amazing music with Harmonize.
            </p>
          </div>
          <Button className="mt-4 md:mt-0 bg-primary hover:bg-primary/90" size="lg" asChild>
            <a href="/studio">
              Go to Studio <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
