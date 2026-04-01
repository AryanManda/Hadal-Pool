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
            Route your funds through private liquidity pools to separate deposit and withdrawal
            addresses.
          </p>
          <Link href="/app">
            <Button size="lg" className="text-lg px-8 py-6">
              Access Pools
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Private Settlement</h3>
            <p className="text-muted-foreground">
              Withdrawal activity is not publicly indexed. Deposits and withdrawals remain
              separated.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Shared Liquidity Pool</h3>
            <p className="text-muted-foreground">
              Funds are processed within a collective liquidity set, increasing transaction
              obfuscation.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Timed Liquidity Cycles</h3>
            <p className="text-muted-foreground">
              Select from multiple settlement windows (1 hour, 4 hours, 24 hours).
            </p>
          </div>
        </div>

        {/* Protocol Flow */}
        <div className="bg-card border border-border rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Protocol Flow</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Pool Entry</h3>
              <p className="text-muted-foreground text-sm">
                Submit funds to a selected liquidity cycle where they enter the shared pool.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Cycle Processing</h3>
              <p className="text-muted-foreground text-sm">
                Funds remain within the pool until the selected settlement window completes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Private Exit</h3>
              <p className="text-muted-foreground text-sm">
                Release funds to a new address after the cycle completes.
              </p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">About Hadal Pool</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Hadal Pool is a decentralized protocol built on Ethereum designed for private liquidity
            routing. Funds move through timed pools that separate deposit and withdrawal endpoints.
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto mt-4">
            Withdrawal activity is not publicly indexed on common explorers, adding an additional
            layer of operational privacy.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/app">
            <Button size="lg" className="text-lg px-8 py-6">
              Enter Pool
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
