import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold text-foreground">
              Hadal Pool
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Enhance your cryptocurrency privacy by mixing your funds with others. 
            Break the link between your deposit and withdrawal addresses.
          </p>
          <Link href="/app">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Enhanced Privacy</h3>
            <p className="text-muted-foreground">
              Your withdrawals are not logged on block explorers. Break the link between 
              your deposit and withdrawal addresses for true privacy.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Anonymity Set</h3>
            <p className="text-muted-foreground">
              Mix your funds with others in the pool. The larger the anonymity set, 
              the harder it is to trace your transactions.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Time-Locked Pools</h3>
            <p className="text-muted-foreground">
              Choose from multiple time-lock durations (1 hour, 4 hours, 24 hours) 
              to maximize your privacy protection.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-card border border-border rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Deposit</h3>
              <p className="text-muted-foreground text-sm">
                Deposit your funds into one of our time-locked pools. Your funds are 
                mixed with others in the pool.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Wait</h3>
              <p className="text-muted-foreground text-sm">
                Wait for the time lock period to expire. This ensures your funds are 
                properly mixed with others in the pool.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Withdraw</h3>
              <p className="text-muted-foreground text-sm">
                Withdraw to a fresh address. Your withdrawal is not logged on block 
                explorers, maintaining your privacy.
              </p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">About Hadal Pool</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Hadal Pool is a decentralized application built on Ethereum that helps you 
            enhance your cryptocurrency privacy. By mixing your funds with others in time-locked 
            pools, you break the direct link between your deposit and withdrawal addresses.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-4">
            Unlike traditional mixers, we don't log withdrawal events on block explorers, 
            providing an additional layer of privacy protection. Your transactions remain 
            private and untraceable.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/app">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Mixing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

