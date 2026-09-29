import { createTransactionKit } from "@genlayer/transaction-kit";
import { chain, CHAIN_ID_HEX, RPC_URL, EXPLORER_URL } from "./config";

export function hasWallet() {
  return typeof window !== "undefined" && !!window.ethereum;
}

async function switchToStudioNext() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (error) {
    // 4902 = the wallet does not know this network yet, so add it
    if (error && (error.code === 4902 || error.code === -32603)) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_ID_HEX,
            chainName: "GenLayer Studio Next",
            nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: [EXPLORER_URL],
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

export async function connectWallet() {
  if (!hasWallet()) {
    throw new Error("No wallet found. Install MetaMask (or another browser wallet) and reload.");
  }
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  await switchToStudioNext();
  const account = accounts[0];
  const kit = createTransactionKit({
    chain,
    provider: window.ethereum,
    account,
  });
  return { account, kit };
}
