import { useState } from "react";
import { SimulationSettings } from "../types";
import { Settings, Sliders, Info, ShieldAlert, Award, Zap } from "lucide-react";

interface RewardSimulatorProps {
  settings: SimulationSettings;
  onSettingsChange: (newSettings: SimulationSettings) => void;
}

export default function RewardSimulator({ settings, onSettingsChange }: RewardSimulatorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSetting = (key: keyof SimulationSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const updateAdvanced = (key: string, value: any) => {
    onSettingsChange({
      ...settings,
      advanced: {
        ...settings.advanced,
        [key]: value,
      },
    });
  };

  const updateTier = (tier: "tier1" | "tier2" | "tier3" | "tier4", value: number) => {
    const updatedTiers = {
      ...settings.tierDistribution,
      [tier]: value,
    };
    onSettingsChange({
      ...settings,
      tierDistribution: updatedTiers,
    });
  };

  const updateScoreWeight = (metric: "volume" | "predictions" | "months" | "weeks", value: number) => {
    onSettingsChange({
      ...settings,
      advanced: {
        ...settings.advanced,
        scoreWeights: {
          ...settings.advanced.scoreWeights,
          [metric]: value,
        },
      },
    });
  };

  // Preset options
  const supplyOptions = [
    { label: "500M", value: 500_000_000 },
    { label: "1B", value: 1_000_000_000 },
    { label: "2B", value: 2_000_000_000 },
    { label: "5B", value: 5_000_000_000 },
    { label: "10B", value: 10_000_000_000 },
  ];

  const fdvOptions = [
    { label: "$500M", value: 500_000_000 },
    { label: "$1B", value: 1_000_000_000 },
    { label: "$2B", value: 2_000_000_000 },
    { label: "$3B", value: 3_000_000_000 },
    { label: "$5B", value: 5_000_000_000 },
    { label: "$7.5B", value: 7_500_000_000 },
    { label: "$10B", value: 10_000_000_000 },
  ];

  const walletOptions = [
    { label: "10K", value: 10_000 },
    { label: "25K", value: 25_000 },
    { label: "50K", value: 50_000 },
    { label: "100K", value: 100_000 },
    { label: "250K", value: 250_000 },
    { label: "500K", value: 500_000 },
    { label: "1M", value: 1_000_000 },
  ];

  const totalPoolTokens = (settings.totalTokenSupply * settings.allocationPct) / 100;
  const tokenPrice = settings.fdv / settings.totalTokenSupply;
  const totalPoolUSD = totalPoolTokens * tokenPrice;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6" id="reward-simulator-container">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-gray-900 flex items-center">
            <Sliders className="w-5 h-5 mr-2 text-[#0052FF]" />
            Airdrop Simulator Mode
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-sans">Configure launch metrics and distribution tokenomics assumptions.</p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
            showAdvanced
              ? "bg-[#0052FF]/10 text-[#0052FF] border border-[#0052FF]/10"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          id="btn-toggle-advanced"
        >
          <Settings className="w-3.5 h-3.5 mr-1.5" />
          {showAdvanced ? "Hide Advanced" : "Advanced"}
        </button>
      </div>

      {/* Simulator Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#f4f6f8] p-4 rounded-xl font-mono">
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Estimated Token Price</span>
          <span className="text-lg font-bold text-gray-900">${tokenPrice.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Airdrop Pool Size</span>
          <span className="text-lg font-bold text-[#0052FF]">
            {totalPoolTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} $POLY
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Total Allocation Value</span>
          <span className="text-lg font-bold text-emerald-600">
            ${totalPoolUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Primary Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Token Supply */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800 font-sans flex items-center justify-between">
            <span>Total Token Supply</span>
            <span className="text-xs text-[#0052FF] font-mono font-bold">
              {(settings.totalTokenSupply / 1_000_000_000).toFixed(1)}B Tokens
            </span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {supplyOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => updateSetting("totalTokenSupply", opt.value)}
                className={`py-1.5 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${
                  settings.totalTokenSupply === opt.value
                    ? "bg-[#0052FF] border-[#0052FF] text-white shadow-sm"
                    : "bg-[#f4f6f8] border-transparent text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={settings.totalTokenSupply}
            onChange={(e) => updateSetting("totalTokenSupply", Number(e.target.value))}
            className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 font-mono text-xs text-gray-900 focus:outline-none focus:border-[#0052FF]"
            placeholder="Custom Supply"
          />
        </div>

        {/* FDV */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800 font-sans flex items-center justify-between">
            <span>Fully Diluted Valuation (FDV)</span>
            <span className="text-xs text-[#0052FF] font-mono font-bold">
              ${(settings.fdv / 1_000_000_000).toFixed(2)}B USD
            </span>
          </label>
          <div className="grid grid-cols-7 gap-1">
            {fdvOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => updateSetting("fdv", opt.value)}
                className={`py-1 rounded-lg text-[10px] font-bold font-mono border transition-all cursor-pointer ${
                  settings.fdv === opt.value
                    ? "bg-[#0052FF] border-[#0052FF] text-white shadow-sm"
                    : "bg-[#f4f6f8] border-transparent text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={settings.fdv}
            onChange={(e) => updateSetting("fdv", Number(e.target.value))}
            className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 font-mono text-xs text-gray-900 focus:outline-none focus:border-[#0052FF]"
            placeholder="Custom FDV USD"
          />
        </div>

        {/* Airdrop Allocation Slider */}
        <div className="space-y-3 md:col-span-2 bg-[#f4f6f8] p-4 rounded-xl border border-transparent">
          <div className="flex justify-between items-center font-sans">
            <span className="text-sm font-semibold text-gray-800">Airdrop Allocation</span>
            <span className="text-sm font-mono font-bold text-[#0052FF]">{settings.allocationPct}% of Supply</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="30"
            step="0.5"
            value={settings.allocationPct}
            onChange={(e) => updateSetting("allocationPct", Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0052FF]"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>0.5%</span>
            <span>5%</span>
            <span>10%</span>
            <span>15%</span>
            <span>20%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Eligible Wallets */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800 font-sans flex items-center justify-between">
            <span>Eligible Wallets</span>
            <span className="text-xs text-[#0052FF] font-mono font-bold">
              {settings.eligibleWalletsCount.toLocaleString()} Wallets
            </span>
          </label>
          <div className="grid grid-cols-7 gap-1">
            {walletOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => updateSetting("eligibleWalletsCount", opt.value)}
                className={`py-1 rounded-lg text-[10px] font-bold font-mono border transition-all cursor-pointer ${
                  settings.eligibleWalletsCount === opt.value
                    ? "bg-[#0052FF] border-[#0052FF] text-white shadow-sm"
                    : "bg-[#f4f6f8] border-transparent text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={settings.eligibleWalletsCount}
            onChange={(e) => updateSetting("eligibleWalletsCount", Number(e.target.value))}
            className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 font-mono text-xs text-gray-900 focus:outline-none focus:border-[#0052FF]"
            placeholder="Custom Wallets Count"
          />
        </div>

        {/* Tier Distribution % */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800 font-sans flex items-center justify-between">
            <span>Tier Distribution (Pool %)</span>
            <span className="text-xs text-amber-600 font-mono font-bold flex items-center">
              <Award className="w-3.5 h-3.5 mr-1" />
              Total: {settings.tierDistribution.tier1 + settings.tierDistribution.tier2 + settings.tierDistribution.tier3 + settings.tierDistribution.tier4}%
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2 font-mono">
            <div>
              <span className="text-[10px] text-gray-400 block text-center mb-1 font-bold">T1 (Whale)</span>
              <input
                type="number"
                value={settings.tierDistribution.tier1}
                onChange={(e) => updateTier("tier1", Number(e.target.value))}
                className="w-full text-center bg-white border border-gray-200 rounded-lg py-1 text-xs text-gray-900 focus:outline-none focus:border-[#0052FF]"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block text-center mb-1 font-bold">T2 (Heavy)</span>
              <input
                type="number"
                value={settings.tierDistribution.tier2}
                onChange={(e) => updateTier("tier2", Number(e.target.value))}
                className="w-full text-center bg-white border border-gray-200 rounded-lg py-1 text-xs text-gray-900 focus:outline-none focus:border-[#0052FF]"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block text-center mb-1 font-bold">T3 (Active)</span>
              <input
                type="number"
                value={settings.tierDistribution.tier3}
                onChange={(e) => updateTier("tier3", Number(e.target.value))}
                className="w-full text-center bg-white border border-gray-200 rounded-lg py-1 text-xs text-gray-900 focus:outline-none focus:border-[#0052FF]"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block text-center mb-1 font-bold">T4 (Lite)</span>
              <input
                type="number"
                value={settings.tierDistribution.tier4}
                onChange={(e) => updateTier("tier4", Number(e.target.value))}
                className="w-full text-center bg-white border border-gray-200 rounded-lg py-1 text-xs text-gray-900 focus:outline-none focus:border-[#0052FF]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Panel (Collapsible) */}
      {showAdvanced && (
        <div className="border-t border-gray-100 pt-6 space-y-6 animate-fadeIn" id="advanced-settings-panel">
          <div className="flex items-center space-x-2 text-[#0052FF]">
            <Zap className="w-4 h-4" />
            <h3 className="font-sans font-bold text-sm uppercase tracking-wide">Hidden Advanced Parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Weights */}
            <div className="space-y-4 bg-[#f4f6f8] p-4 rounded-xl border border-transparent">
              <span className="text-xs font-bold font-sans text-gray-700 block mb-2 flex items-center">
                <Sliders className="w-3.5 h-3.5 mr-1 text-[#0052FF]" />
                Eligibility Score Weights (Total: 100%)
              </span>
              <div className="space-y-3 font-mono text-xs">
                {/* Volume Weight */}
                <div className="space-y-1">
                  <div className="flex justify-between text-gray-500 font-bold">
                    <span>Trading Volume Weight</span>
                    <span className="text-[#0052FF]">{settings.advanced.scoreWeights.volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.advanced.scoreWeights.volume}
                    onChange={(e) => updateScoreWeight("volume", Number(e.target.value))}
                    className="w-full accent-[#0052FF]"
                  />
                </div>

                {/* Predictions Weight */}
                <div className="space-y-1">
                  <div className="flex justify-between text-gray-500 font-bold">
                    <span>Prediction Count Weight</span>
                    <span className="text-[#0052FF]">{settings.advanced.scoreWeights.predictions}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.advanced.scoreWeights.predictions}
                    onChange={(e) => updateScoreWeight("predictions", Number(e.target.value))}
                    className="w-full accent-[#0052FF]"
                  />
                </div>

                {/* Months Weight */}
                <div className="space-y-1">
                  <div className="flex justify-between text-gray-500 font-bold">
                    <span>Active Months Weight</span>
                    <span className="text-[#0052FF]">{settings.advanced.scoreWeights.months}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.advanced.scoreWeights.months}
                    onChange={(e) => updateScoreWeight("months", Number(e.target.value))}
                    className="w-full accent-[#0052FF]"
                  />
                </div>

                {/* Weeks Weight */}
                <div className="space-y-1">
                  <div className="flex justify-between text-gray-500 font-bold">
                    <span>Active Weeks Weight</span>
                    <span className="text-[#0052FF]">{settings.advanced.scoreWeights.weeks}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.advanced.scoreWeights.weeks}
                    onChange={(e) => updateScoreWeight("weeks", Number(e.target.value))}
                    className="w-full accent-[#0052FF]"
                  />
                </div>
              </div>
            </div>

            {/* Bonuses, Caps & Formula */}
            <div className="space-y-4">
              {/* Formula & Minimum Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 font-sans">Reward Formula</label>
                  <select
                    value={settings.advanced.rewardFormula}
                    onChange={(e) => updateAdvanced("rewardFormula", e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs text-gray-900 focus:outline-none focus:border-[#0052FF]"
                  >
                    <option value="standard">Standard Linear</option>
                    <option value="exponential">Exponential (Whale Favored)</option>
                    <option value="linear">Pure Rank-Based</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 font-sans">Min Eligibility Score</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.advanced.minScore}
                    onChange={(e) => updateAdvanced("minScore", Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs text-gray-900 focus:outline-none focus:border-[#0052FF] font-mono"
                  />
                </div>
              </div>

              {/* Multipliers & Caps */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[9px] text-gray-400 block mb-1 font-bold">LP Multiplier</span>
                  <input
                    type="number"
                    step="0.05"
                    value={settings.advanced.lpBonus}
                    onChange={(e) => updateAdvanced("lpBonus", Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg py-1 px-2 text-center text-gray-900 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block mb-1 font-bold">Sports Multiplier</span>
                  <input
                    type="number"
                    step="0.05"
                    value={settings.advanced.sportsBonus}
                    onChange={(e) => updateAdvanced("sportsBonus", Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg py-1 px-2 text-center text-gray-900 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>
              </div>

              {/* Penalty Toggles */}
              <div className="bg-[#f4f6f8] border border-transparent p-3.5 rounded-xl space-y-3">
                <span className="text-xs font-bold font-sans text-gray-700 block flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  Anti-Sybil & Penalty Settings
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.advanced.sybilPenalty}
                      onChange={(e) => updateAdvanced("sybilPenalty", e.target.checked)}
                      className="rounded border-gray-200 bg-white text-[#0052FF] focus:ring-0"
                    />
                    <span className="text-gray-600 font-sans font-semibold">Sybil Penalty</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.advanced.whalePenalty}
                      onChange={(e) => updateAdvanced("whalePenalty", e.target.checked)}
                      className="rounded border-gray-200 bg-white text-[#0052FF] focus:ring-0"
                    />
                    <span className="text-gray-600 font-sans font-semibold">Whale Penalty</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.advanced.profitableTraderPenalty}
                      onChange={(e) => updateAdvanced("profitableTraderPenalty", e.target.checked)}
                      className="rounded border-gray-200 bg-white text-[#0052FF] focus:ring-0"
                    />
                    <span className="text-gray-600 font-sans font-semibold">P&amp;L Penalty</span>
                  </label>
                </div>
              </div>

              {/* Maximum Allocation Cap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 font-sans flex justify-between">
                  <span>Maximum Wallet Allocation Cap</span>
                  <span className="font-mono text-[#0052FF] text-xs font-bold">
                    {settings.advanced.maxWalletAllocation.toLocaleString()} POLY
                  </span>
                </label>
                <input
                  type="number"
                  step="5000"
                  value={settings.advanced.maxWalletAllocation}
                  onChange={(e) => updateAdvanced("maxWalletAllocation", Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs text-gray-900 focus:outline-none focus:border-[#0052FF] font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
