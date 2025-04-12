import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Studio from "@/pages/Studio";
import Library from "@/pages/Library";
import Learn from "@/pages/Learn";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
        <Header />
        <main className="flex-1 overflow-hidden">
          <Switch>
            <Route path="/" component={Studio} />
            <Route path="/studio" component={Studio} />
            <Route path="/library" component={Library} />
            <Route path="/learn" component={Learn} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
