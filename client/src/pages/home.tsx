import Header from "@/components/header";
import PrivacyWarning from "@/components/privacy-warning";
import DepositCard from "@/components/deposit-card";
import WithdrawCard from "@/components/withdraw-card";
import PoolStats from "@/components/pool-stats";
import PrivacyFundInfo from "@/components/privacy-fund-info";
import WalletModal from "@/components/wallet-modal";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <PrivacyWarning />
        
        <div className="grid lg:grid-cols-2 gap-8">
          <DepositCard />
          <WithdrawCard />
        </div>
        
        <PoolStats />
        <PrivacyFundInfo />
      </main>
      
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                © 2024 Privacy Mixer. Built for financial privacy.
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Documentation</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">GitHub</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Audit</a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Support</a>
            </div>
          </div>
        </div>
      </footer>
      
      <WalletModal />
    </div>
  );
}
