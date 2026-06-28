import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wallet, Search, Clipboard, AlertCircle, RotateCcw, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { WalletData, SimulationSettings } from "./types";
import AirdropHeader from "./components/AirdropHeader";
import SkeletonLoader from "./components/SkeletonLoader";
import EligibilityBanner from "./components/EligibilityBanner";
import RequirementCard from "./components/RequirementCard";
import RewardSimulator from "./components/RewardSimulator";
import AnalyticsCharts from "./components/AnalyticsCharts";
import ApiInspector from "./components/ApiInspector";

const DEFAULT_SETTINGS: SimulationSettings = {
  totalTokenSupply: 1_000_000_000,
  fdv: 2_000_000_000,
  allocationPct: 5,
  eligibleWalletsCount: 100_000,
  tierDistribution: {
    tier1: 40,
    tier2: 30,
    tier3: 20,
    tier4: 10,
  },
  advanced: {
    scoreWeights: {
      volume: 40,
      predictions: 30,
      months: 20,
      weeks: 10,
    },
    minScore: 15,
    lpBonus: 1.25,
    sportsBonus: 1.10,
    sybilPenalty: false,
    whalePenalty: false,
    profitableTraderPenalty: false,
    maxWalletAllocation: 100_000,
    rewardFormula: "standard",
  },
};

export default function App() {
  const [addressInput, setAddressInput] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States for fetched wallet data & simulation parameters
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>(() => {
    const saved = localStorage.getItem("polymarket_airdrop_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Keep cache of checked wallets in local storage
  const [checkedWalletCache, setCheckedWalletCache] = useState<string | null>(() => {
    return localStorage.getItem("polymarket_checked_address") || null;
  });

  // Auto-validate inputs
  useEffect(() => {
    const cleanInput = addressInput.trim();
    const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(cleanInput);
    const isEns = cleanInput.toLowerCase().endsWith(".eth") && cleanInput.length > 4;
    setIsValidAddress(isEthAddress || isEns);
  }, [addressInput]);

  // Load cached wallet on initial render if exists
  useEffect(() => {
    if (checkedWalletCache) {
      fetchWalletStats(checkedWalletCache);
    }
  }, []);

  // Save settings on changes
  useEffect(() => {
    localStorage.setItem("polymarket_airdrop_settings", JSON.stringify(simulationSettings));
  }, [simulationSettings]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddressInput(text);
    } catch (err) {
      setErrorMsg("Failed to read clipboard. Please paste manually.");
    }
  };

  const fetchWalletStats = async (targetAddress: string) => {
    const query = targetAddress.trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/wallet/${encodeURIComponent(query)}`);
      if (!res.ok) {
        let errMsg = `Failed to retrieve on-chain analytics (Status ${res.status}).`;
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            errMsg = errorData.error || errMsg;
          } else {
            const text = await res.text();
            if (text && text.trim().startsWith("{")) {
              const parsed = JSON.parse(text);
              errMsg = parsed.error || errMsg;
            } else if (text && text.length < 120) {
              errMsg = text;
            }
          }
        } catch (_) {
          // ignore parsing error
        }
        throw new Error(errMsg);
      }

      const data: WalletData = await res.json();
      setWalletData(data);
      setAddressInput(data.address);
      localStorage.setItem("polymarket_checked_address", data.address);
      setCheckedWalletCache(data.address);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred. Please check network connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckEligibility = () => {
    if (isValidAddress) {
      fetchWalletStats(addressInput);
    }
  };

  const handleReset = () => {
    setWalletData(null);
    setAddressInput("");
    localStorage.removeItem("polymarket_checked_address");
    setCheckedWalletCache(null);
    setErrorMsg(null);
  };

  // Inline calculation for total completion tasks
  const computeOverallScore = () => {
    if (!walletData) return 0;
    const volScore = Math.min(100, ((walletData.tradingVolume || 0) / 250000) * 100);
    const predScore = Math.min(100, ((walletData.totalPredictions || 0) / 500) * 100);
    const monthsScore = Math.min(100, ((walletData.activeMonths || 0) / 7) * 100);
    const weeksScore = Math.min(100, ((walletData.activeWeeks || 0) / 20) * 100);

    const w = simulationSettings.advanced.scoreWeights;
    const baseScore =
      (volScore * w.volume) / 100 +
      (predScore * w.predictions) / 100 +
      (monthsScore * w.months) / 100 +
      (weeksScore * w.weeks) / 100;

    let multiplier = 1.0;
    if (walletData.lpActivity) multiplier *= simulationSettings.advanced.lpBonus;
    if ((walletData.sportsMarketActivity || 0) >= 5) multiplier *= simulationSettings.advanced.sportsBonus;

    return Math.min(100, baseScore * multiplier);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#0052FF]/10 selection:text-gray-900 pb-12" id="app-root">
      <AirdropHeader />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <AnimatePresence mode="wait">
          {!walletData ? (
            /* INITIAL LANDING SECTION */
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto py-12 sm:py-20 flex flex-col items-center text-center space-y-8"
              id="landing-container"
            >
              {/* Feature highlights badge */}
              <div className="inline-flex items-center space-x-2 bg-[#0052FF]/5 border border-[#0052FF]/10 px-3.5 py-1.5 rounded-full text-xs font-mono text-[#0052FF] font-semibold select-none shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#0052FF]" />
                <span>Polymarket On-Chain Analyzer</span>
              </div>

              {/* Title Section */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl font-sans font-black tracking-tight text-gray-900 leading-none">
                  POLYMARKET <span className="text-[#0052FF]">CALCULATOR</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto font-sans">
                  Estimate your potential $POLY airdrop using real wallet activity, on-chain predictions, and a highly customizable token distribution simulator.
                </p>
              </div>

              {/* Search Engine Card */}
              <div className="w-full max-w-xl mx-auto rounded-3xl p-1 relative">
                <div className="space-y-4">
                  <div className="relative flex flex-col space-y-3">
                    <input
                      type="text"
                      placeholder="Enter Wallet Address (0x...) or ENS (.eth)"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      className="w-full bg-[#f4f6f8] border border-gray-100 rounded-2xl py-4.5 px-6 text-sm sm:text-base font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0052FF] focus:ring-4 focus:ring-[#0052FF]/10 transition-all text-center"
                      id="input-address"
                    />
                    <button
                      onClick={handlePaste}
                      className="absolute right-4 top-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors flex items-center space-x-1"
                      id="btn-paste-address"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Paste</span>
                    </button>
                  </div>

                  {/* Auto-Validation feedback */}
                  {addressInput.trim() && (
                    <div className="flex items-center justify-between px-2 font-mono text-xs">
                      <span className="text-gray-400">Auto Validation Status:</span>
                      {isValidAddress ? (
                        <span className="text-emerald-600 font-bold">✓ Valid Address Format</span>
                      ) : (
                        <span className="text-amber-600 font-bold">⚠️ Checking Address Format...</span>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleCheckEligibility}
                    disabled={!isValidAddress || isLoading}
                    className={`w-full py-4.5 rounded-2xl font-bold font-sans tracking-wide text-sm transition-all flex items-center justify-center space-x-2 ${
                      isValidAddress && !isLoading
                        ? "bg-[#0052FF] hover:bg-[#0045db] text-white shadow-lg shadow-[#0052FF]/15 cursor-pointer"
                        : "bg-[#e2e8f0] text-gray-400 cursor-not-allowed border border-transparent"
                    }`}
                    id="btn-check-eligibility"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>CHECK ELIGIBILITY</span>
                    )}
                  </button>

                  {/* Pre-configured High-Activity Wallets to Explore */}
                  <div className="pt-6 border-t border-gray-100">
                    <div className="text-left mb-3">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">
                        Explore High-Activity Wallets (Real Polymarket Data)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { label: "vitalik.eth", addr: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
                        { label: "Active Whale 1", addr: "0xa77f98553f193f9de78a2eb31be03816ba7d1591" },
                        { label: "Heavy Predictor 2", addr: "0xf45e691ec5521b21236113b2c246ca822ff9bfa8" }
                      ].map((wallet) => (
                        <button
                          key={wallet.addr}
                          onClick={() => {
                            setAddressInput(wallet.addr);
                            fetchWalletStats(wallet.addr);
                          }}
                          disabled={isLoading}
                          className="px-3.5 py-2.5 rounded-xl bg-[#f4f6f8] hover:bg-gray-100 border border-transparent hover:border-gray-200 text-xs font-mono text-gray-600 hover:text-gray-900 transition-all text-left flex items-center justify-between group cursor-pointer"
                        >
                          <span className="truncate max-w-[90px] font-semibold">{wallet.label}</span>
                          <span className="text-[10px] text-[#0052FF] group-hover:translate-x-0.5 transition-transform font-bold">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Error message card */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-start space-x-2 text-left font-sans"
                    id="error-banner"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Execution Failed:</span>
                      <p className="mt-0.5">{errorMsg}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Informational Warning */}
              <div className="flex items-start space-x-2.5 max-w-md p-4 rounded-xl bg-gray-50 border border-gray-100 text-left font-mono text-xs text-gray-500">
                <Info className="w-4 h-4 text-[#0052FF] flex-shrink-0 mt-0.5" />
                <p>
                  No official token claims or snapshots have launched. This reward simulator compiles public blockchain activity to estimate distribution weights under various tokenomics assumptions.
                </p>
              </div>
            </motion.div>
          ) : (
            /* ANALYTICS DASHBOARD FRAME */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
              id="dashboard-container"
            >
              {/* Dashboard Sub-Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0052FF]/5 border border-[#0052FF]/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#0052FF]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block font-bold">ACTIVE SCAN OBJECT</span>
                    <h3 className="font-mono text-sm sm:text-base font-bold text-gray-950 flex items-center space-x-2 break-all">
                      <span>{walletData.ensName || walletData.address}</span>
                    </h3>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center justify-center px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold font-mono text-gray-700 transition-all space-x-1.5 self-start sm:self-center cursor-pointer"
                  id="btn-scan-another"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan Another Wallet</span>
                </button>
              </div>

              {/* Loader Switch */}
              {isLoading ? (
                <SkeletonLoader />
              ) : (
                <>
                  {/* Empty Wallet Warning banner */}
                  {walletData.totalTrades === 0 && (
                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-sm">
                      <div className="space-y-1">
                        <span className="font-bold text-amber-950 flex items-center gap-1.5 font-sans">
                          <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                          No active Polymarket trade history found
                        </span>
                        <p className="text-xs text-amber-700 leading-relaxed font-sans">
                          This is a valid wallet, but Polymarket's public Data API returned <strong>0 recorded trades</strong> for it. These are 100% real, live results — not simulated.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Eligibility Dashboard Card */}
                  <EligibilityBanner walletData={walletData} settings={simulationSettings} />

                  {/* Real-time API Network Trace Inspector */}
                  {walletData.apiLogs && (
                    <ApiInspector logs={walletData.apiLogs} isEstimated={walletData.isEstimated} />
                  )}

                  {/* Main Split Interface */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Simulator Column */}
                    <div className="lg:col-span-1">
                      <RewardSimulator settings={simulationSettings} onSettingsChange={setSimulationSettings} />
                    </div>

                    {/* Requirement Cards Column */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
                          <div>
                            <h3 className="font-sans font-bold text-gray-900 text-base">Eligibility Milestones</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Check completion progress across standard airdrop filters.</p>
                          </div>
                        </div>
                        <RequirementCard walletData={walletData} />
                      </div>
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <AnalyticsCharts walletData={walletData} settings={simulationSettings} score={computeOverallScore()} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
