import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchWalletData, WalletLookupError } from "../_lib/walletData.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const address = req.query.address;
  const addressStr = Array.isArray(address) ? address[0] : address;

  if (!addressStr) {
    res.status(400).json({ error: "Wallet address or ENS is required" });
    return;
  }

  try {
    const payload = await fetchWalletData(addressStr);
    res.status(200).json(payload);
  } catch (err: any) {
    if (err instanceof WalletLookupError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error("Wallet endpoint handler crash:", err);
    res.status(500).json({ error: "Failed to load wallet statistics. Please try again." });
  }
}
