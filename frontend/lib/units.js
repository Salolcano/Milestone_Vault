const DECIMALS = 18;

// "1.5" -> 1500000000000000000n  (no floating point maths, so no rounding errors)
export function parseGen(input) {
  const text = String(input ?? "").trim();
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const [whole, frac = ""] = text.split(".");
  if (frac.length > DECIMALS) return null;
  const padded = (frac + "0".repeat(DECIMALS)).slice(0, DECIMALS);
  return BigInt(whole) * 10n ** BigInt(DECIMALS) + BigInt(padded || "0");
}

export function formatGen(value) {
  let v;
  try {
    v = BigInt(value);
  } catch {
    return "0";
  }
  const base = 10n ** BigInt(DECIMALS);
  const whole = v / base;
  const frac = (v % base).toString().padStart(DECIMALS, "0").replace(/0+$/, "");
  const shown = frac.slice(0, 4);
  return shown ? `${whole}.${shown}` : `${whole}`;
}

export function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
