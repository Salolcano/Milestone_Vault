import { createClient } from "genlayer-js";
import { chain, CONTRACT_ADDRESS } from "./config";

let client = null;

function getClient() {
  if (!client) client = createClient({ chain });
  return client;
}

export async function readAllVaults() {
  if (!CONTRACT_ADDRESS) return [];
  const result = await getClient().readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_all_vaults",
    args: [],
  });
  const text = typeof result === "string" ? result : String(result ?? "[]");
  return JSON.parse(text);
}
