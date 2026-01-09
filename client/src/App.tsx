import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/hooks/use-wallet";
import { CurrencyProvider } from "@/contexts/currency-context";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <div className="dark">
              <Router />
            </div>
          </TooltipProvider>
        </CurrencyProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
