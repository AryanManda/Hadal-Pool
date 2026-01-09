import Header from "@/components/header";
import DepositCard from "@/components/deposit-card";
import WithdrawCard from "@/components/withdraw-card";
import PoolStats from "@/components/pool-stats";
import PrivacyFundInfo from "@/components/privacy-fund-info";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-10">
            <TabsTrigger value="deposit" className="text-base">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw" className="text-base">Withdraw</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="mt-0">
            <DepositCard />
            <PrivacyFundInfo />
          </TabsContent>
          
          <TabsContent value="withdraw" className="mt-0">
            <WithdrawCard />
          </TabsContent>
        </Tabs>

        <PoolStats />
      </main>
    </div>
  );
}
