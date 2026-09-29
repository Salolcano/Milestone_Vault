import { studioDevnet } from "genlayer-js/chains";

// Studio Next / studio-dev: chain ID 61997 (the SDK preset already carries it)
export const chain = studioDevnet;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://studio-next.genlayer.com/api";
export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL || "https://explorer-studio-dev.genlayer.com";
export const KIT_NETWORK = process.env.NEXT_PUBLIC_KIT_NETWORK || "studio-dev";

export const CHAIN_ID = 61997;
export const CHAIN_ID_HEX = "0xf22d";
export const MAX_ATTEMPTS = 3;
