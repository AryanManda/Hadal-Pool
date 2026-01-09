// Utility to get MetaMask provider specifically, avoiding Phantom and other wallets

export function getMetaMaskProvider() {
  if (typeof window.ethereum === "undefined") {
    return null;
  }

  // Check if it's MetaMask specifically
  if (window.ethereum.isMetaMask) {
    return window.ethereum;
  }

  // If multiple providers exist (EIP-6963), try to find MetaMask
  if ((window.ethereum as any).providers) {
    const providers = (window.ethereum as any).providers;
    const metaMaskProvider = providers.find((p: any) => p.isMetaMask);
    if (metaMaskProvider) return metaMaskProvider;
  }

  // Fallback: if only one provider and it's not explicitly Phantom, use it
  // (Phantom usually sets isPhantom flag)
  if (!(window.ethereum as any).isPhantom) {
    return window.ethereum;
  }

  return null;
}











