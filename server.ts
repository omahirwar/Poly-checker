import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { fetchWalletData, WalletLookupError } from "./api/_lib/walletData.js";

const app = express();
const PORT = 3000;

// Initialize Gemini SDK safely with server-side API Key
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY is not defined. Gemini client is disabled.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI client:", error);
}

app.use(express.json());

// API: Check Wallet Eligibility using 100% real on-chain + Polymarket public API data.
// This uses the exact same fetchWalletData() logic as the Vercel serverless
// function in api/wallet/[address].ts, so local dev and production behave identically.
app.get("/api/wallet/:address", async (req, res) => {
  try {
    const payload = await fetchWalletData(req.params.address);
    return res.json(payload);
  } catch (error: any) {
    if (error instanceof WalletLookupError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Wallet endpoint handler crash:", error);
    return res.status(500).json({ error: "Failed to load wallet statistics. Please try again." });
  }
});

// Serve Frontend Vite files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Polymarket Airdrop server running on http://localhost:${PORT}`);
  });
}

startServer();
