import { WalletData, SimulationSettings } from "../types";
import { CheckCircle2, AlertTriangle, XCircle, Trophy, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface EligibilityBannerProps {
  walletData: WalletData;
  settings: SimulationSettings;
}

export function calculateAirdropReward(walletData: WalletData, settings: SimulationSettings) {
  // Compute individual metric achievement scores (0 - 100)
  const volScore = Math.min(100, ((walletData.tradingVolume || 0) / 250000) * 100);
  const predScore = Math.min(100, ((walletData.totalPredictions || 0) / 500) * 100);
  const monthsScore = Math.min(100, ((walletData.activeMonths || 0) / 7) * 100);
  const weeksScore = Math.min(100, ((walletData.activeWeeks || 0) / 20) * 100);

  // Apply customizable weights
  const w = settings.advanced.scoreWeights;
  let baseScore =
    (volScore * w.volume) / 100 +
    (predScore * w.predictions) / 100 +
    (monthsScore * w.months) / 100 +
    (weeksScore * w.weeks) / 100;

  // Ensure score is valid
  if (isNaN(baseScore)) baseScore = 0;

  // Apply Multipliers/Bonuses
  let multiplier = 1.0;
  if (walletData.lpActivity) multiplier *= settings.advanced.lpBonus;
  if ((walletData.sportsMarketActivity || 0) >= 5) multiplier *= settings.advanced.sportsBonus;

  let finalScore = Math.min(100, baseScore * multiplier);

  // Penalties
  if (settings.advanced.sybilPenalty && (walletData.txCountOnChain || 0) < 5) {
    finalScore *= 0.2; // 80% penalty for low transactional footprint
  }
  if (settings.advanced.whalePenalty && (walletData.tradingVolume || 0) > 1_000_000) {
    finalScore *= 0.9; // minor structural penalty for extreme whales if enabled
  }
  if (settings.advanced.profitableTraderPenalty && (walletData.profit_loss || 0) > 5000) {
    finalScore *= 0.85; // penalty for highly profitable arbitrageurs if enabled
  }

  // Determine Tier and Reward Distribution
  const minEligibility = settings.advanced.minScore;
  let tier: 1 | 2 | 3 | 4 | null = null;
  let status: "eligible" | "almost" | "not_eligible" = "not_eligible";

  if (finalScore >= 80) {
    tier = 1;
    status = "eligible";
  } else if (finalScore >= 50) {
    tier = 2;
    status = "eligible";
  } else if (finalScore >= 20) {
    tier = 3;
    status = "almost";
  } else if (finalScore >= minEligibility) {
    tier = 4;
    status = "almost";
  } else {
    status = "not_eligible";
  }

  // Calculate Reward Tokens based on Pool and Tiers
  // Total pool tokens = totalTokenSupply * allocationPct / 100
  const poolTokens = (settings.totalTokenSupply * settings.allocationPct) / 100;
  const numWallets = settings.eligibleWalletsCount;

  // Tier sizes inside eligible wallets:
  // T1: 5% of wallets, T2: 15%, T3: 35%, T4: 45%
  const t1Wallets = numWallets * 0.05;
  const t2Wallets = numWallets * 0.15;
  const t3Wallets = numWallets * 0.35;
  const t4Wallets = numWallets * 0.45;

  let baseAllocation = 0;

  if (tier === 1) {
    const t1Pool = (poolTokens * settings.tierDistribution.tier1) / 100;
    baseAllocation = t1Pool / t1Wallets;
  } else if (tier === 2) {
    const t2Pool = (poolTokens * settings.tierDistribution.tier2) / 100;
    baseAllocation = t2Pool / t2Wallets;
  } else if (tier === 3) {
    const t3Pool = (poolTokens * settings.tierDistribution.tier3) / 100;
    baseAllocation = t3Pool / t3Wallets;
  } else if (tier === 4) {
    const t4Pool = (poolTokens * settings.tierDistribution.tier4) / 100;
    baseAllocation = t4Pool / t4Wallets;
  }

  // Multiply allocation by score weight and caps
  let allocatedTokens = baseAllocation * (finalScore / 100);

  // Apply maximum allocation cap
  allocatedTokens = Math.min(settings.advanced.maxWalletAllocation, allocatedTokens);

  if (status === "not_eligible") {
    allocatedTokens = 0;
  }

  const tokenPrice = settings.fdv / settings.totalTokenSupply;
  const usdValue = allocatedTokens * tokenPrice;

  return {
    score: finalScore,
    tier,
    status,
    allocatedTokens,
    usdValue,
    tokenPrice,
  };
}

export default function EligibilityBanner({ walletData, settings }: EligibilityBannerProps) {
  const { score, tier, status, allocatedTokens, usdValue } = calculateAirdropReward(walletData, settings);

  // Remaining tasks counter
  const tasks = [
    { met: (walletData.totalPredictions || 0) >= 500 },
    { met: (walletData.tradingVolume || 0) >= 250000 },
    { met: (walletData.activeMonths || 0) >= 7 },
    { met: (walletData.activeWeeks || 0) >= 20 },
    { met: (walletData.activeDays || 0) >= 50 },
    { met: !!walletData.lpActivity },
    { met: (walletData.sportsMarketActivity || 0) >= 5 },
  ];
  const remainingTasks = tasks.filter((t) => !t.met).length;
  const completionPercentage = Math.round(((tasks.length - remainingTasks) / tasks.length) * 100);

  // Dynamic status elements
  let statusBadgeColor = "";
  let statusText = "";
  let statusIcon = null;
  let statusBg = "";

  if (status === "eligible") {
    statusBadgeColor = "text-emerald-700 border border-emerald-200 bg-emerald-50";
    statusText = "You're Eligible";
    statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    statusBg = "bg-white border-gray-100";
  } else if (status === "almost") {
    statusBadgeColor = "text-amber-700 border border-amber-200 bg-amber-50";
    statusText = "Almost Eligible";
    statusIcon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
    statusBg = "bg-white border-gray-100";
  } else {
    statusBadgeColor = "text-red-700 border border-red-200 bg-red-50";
    statusText = "Not Eligible Yet";
    statusIcon = <XCircle className="w-4 h-4 text-red-600" />;
    statusBg = "bg-white border-gray-100";
  }

  // Generate wallet rank and percentile based on score
  const percentile = Math.min(99.9, Math.max(1, score * 0.98 + (walletData.txCountOnChain > 10 ? 1 : 0)));
  const estimatedRank = Math.max(
    1,
    Math.round(settings.eligibleWalletsCount * (1 - percentile / 100))
  );

  return (
    <div className="space-y-6" id="eligibility-banner">
      {/* Horizontal Divider mimicking the screenshot */}
      <div className="border-t border-gray-100 my-4" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start py-4">
        {/* State Indicators - Styled exactly like the screenshot */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ Live Polymarket Trade Data
              </span>
            </div>

            <h2 className="text-5xl sm:text-6xl font-sans font-bold text-gray-900 tracking-tight leading-tight">
              {status === "eligible" ? (
                "You're Eligible!"
              ) : status === "almost" ? (
                "Almost Eligible!"
              ) : (
                "Not Eligible Yet"
              )}
            </h2>
            <p className="text-sm text-gray-400 font-sans max-w-sm">
              {status === "eligible"
                ? "Your wallet meets the active predictions and on-chain criteria."
                : "Complete more milestones to qualify for the next token tier."}
            </p>
          </div>

          {/* Reward Highlights pill matching the screenshot exactly */}
          <div className="space-y-3">
            <span className="text-xs uppercase font-sans tracking-widest text-gray-400 block font-bold">
              YOU WILL RECEIVE
            </span>
            
            <div className="inline-flex items-center space-x-3 bg-[#f4f6f8] border border-gray-100 px-5 py-3 rounded-2xl">
              {/* Blue Polymarket Circle Logo inside the reward pill */}
              <div className="w-6 h-6 rounded-full bg-[#0052FF] flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 24 33 L 76 19 L 76 81 L 24 67 Z" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 24 33 L 76 50" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 24 67 L 76 50" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-sans font-bold text-gray-900">
                {allocatedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} $POLY
              </span>
            </div>

            {status !== "not_eligible" && (
              <span className="text-xs font-mono text-emerald-600 block font-bold pl-1">
                ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            )}
          </div>
        </div>

        {/* Supporting Details Grid - Clean modern light theme card */}
        <div className="md:col-span-6 bg-[#f4f6f8] p-6 rounded-2xl border border-gray-100 font-mono text-xs text-gray-600 grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-bold">Overall Score</span>
            <span className="text-base font-bold text-gray-900 flex items-center mt-1">
              <Sparkles className="w-4 h-4 mr-1.5 text-yellow-500" />
              {score.toFixed(1)} / 100
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-bold">Estimated Tier</span>
            <span className="text-base font-bold text-[#0052FF] mt-1 block">
              {tier ? `Tier ${tier}` : "N/A"}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-bold">Wallet Rank</span>
            <span className="text-base font-bold text-gray-900 flex items-center mt-1">
              <Trophy className="w-4 h-4 mr-1.5 text-yellow-500" />
              #{estimatedRank.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-bold">Percentile</span>
            <span className="text-base font-bold text-emerald-600 mt-1 block">
              Top {percentile.toFixed(2)}%
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-bold">Portfolio Value (Live)</span>
            <span className="text-base font-bold text-gray-950 mt-1 block">
              ${(walletData.portfolioValue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-bold">Milestones</span>
            <span className="text-base font-bold text-[#0052FF] mt-1 block">
              {completionPercentage}% ({tasks.length - remainingTasks}/{tasks.length})
            </span>
          </div>

          <div className="col-span-2 border-t border-gray-200/60 pt-3 flex justify-between items-center text-xs">
            <span className="text-gray-500 font-sans">Milestone Progress:</span>
            <span className="text-amber-600 font-bold">
              {remainingTasks === 0 ? "🎉 All Completed!" : `${remainingTasks} remaining`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
