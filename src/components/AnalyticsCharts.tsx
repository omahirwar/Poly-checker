import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from "recharts";
import { WalletData, SimulationSettings } from "../types";
import { Calendar, TrendingUp, BarChart3, Activity, Compass, Target } from "lucide-react";
import { useState } from "react";

interface AnalyticsChartsProps {
  walletData: WalletData;
  settings: SimulationSettings;
  score: number;
}

export default function AnalyticsCharts({ walletData, settings, score }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState<"volume" | "timeline" | "radar" | "breakdown">("volume");

  // Check if trading history exists
  const hasTradingHistory = (walletData.totalTrades || 0) > 0;

  // 1. Generate Activity Timeline Data
  const timelineData = hasTradingHistory
    ? [
        { name: "First Trade", activity: 5, vol: (walletData.tradingVolume || 100) * 0.1 },
        { name: "Active Wk 3", activity: 12, vol: (walletData.tradingVolume || 100) * 0.25 },
        { name: "Active Wk 7", activity: 18, vol: (walletData.tradingVolume || 100) * 0.15 },
        { name: "Active Wk 12", activity: 28, vol: (walletData.tradingVolume || 100) * 0.3 },
        { name: "Latest Trade", activity: (walletData.totalTrades || 0), vol: (walletData.tradingVolume || 100) * 0.2 },
      ]
    : [
        { name: "Month 1", activity: 0, vol: 0 },
        { name: "Month 2", activity: 0, vol: 0 },
        { name: "Month 3", activity: 0, vol: 0 },
      ];

  // 2. Monthly Trading Volume & Predictions Data
  const monthlyData = hasTradingHistory
    ? [
        { month: "Jan", volume: (walletData.tradingVolume || 0) * 0.15, predictions: Math.ceil((walletData.totalTrades || 0) * 0.12) },
        { month: "Feb", volume: (walletData.tradingVolume || 0) * 0.2, predictions: Math.ceil((walletData.totalTrades || 0) * 0.18) },
        { month: "Mar", volume: (walletData.tradingVolume || 0) * 0.1, predictions: Math.ceil((walletData.totalTrades || 0) * 0.08) },
        { month: "Apr", volume: (walletData.tradingVolume || 0) * 0.25, predictions: Math.ceil((walletData.totalTrades || 0) * 0.28) },
        { month: "May", volume: (walletData.tradingVolume || 0) * 0.3, predictions: Math.ceil((walletData.totalTrades || 0) * 0.34) },
      ]
    : [
        { month: "Jan", volume: 0, predictions: 0 },
        { month: "Feb", volume: 0, predictions: 0 },
        { month: "Mar", volume: 0, predictions: 0 },
      ];

  // 3. Score Breakdown radar chart
  const radarData = [
    { subject: "Volume", A: Math.min(100, ((walletData.tradingVolume || 0) / 250000) * 100), fullMark: 100 },
    { subject: "Predictions", A: Math.min(100, ((walletData.totalTrades || 0) / 500) * 100), fullMark: 100 },
    { subject: "Months Active", A: Math.min(100, ((walletData.activeMonths || 0) / 7) * 100), fullMark: 100 },
    { subject: "Weeks Active", A: Math.min(100, ((walletData.activeWeeks || 0) / 20) * 100), fullMark: 100 },
    { subject: "Days Active", A: Math.min(100, ((walletData.activeDays || 0) / 50) * 100), fullMark: 100 },
  ];

  // 4. Reward Breakdown Pie Data
  const rewardBreakdown = [
    { name: "Volume Weight", value: settings.advanced.scoreWeights.volume },
    { name: "Predictions Weight", value: settings.advanced.scoreWeights.predictions },
    { name: "Months Weight", value: settings.advanced.scoreWeights.months },
    { name: "Weeks Weight", value: settings.advanced.scoreWeights.weeks },
  ];

  const COLORS = ["#0052FF", "#3b82f6", "#60a5fa", "#93c5fd"];

  // Heatmap generation: 52 weeks * 7 days
  const heatmapData = Array.from({ length: 120 }, (_, i) => {
    // Determine activity level based on total trades
    const randomFactor = Math.sin(i / 5) * 4;
    const baseVal = hasTradingHistory ? Math.max(0, Math.floor((walletData.totalTrades || 0) / 40 + randomFactor)) : 0;
    return baseVal;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="analytics-charts-grid">
      {/* Dynamic Main Chart Frame */}
      <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-sans font-bold text-gray-900 flex items-center text-lg">
              <TrendingUp className="w-4 h-4 mr-2 text-[#0052FF]" />
              Interactive Analytics Dashboard
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-sans">Explore on-chain wallet metrics and reward allocations.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl self-start text-xs font-sans font-semibold">
            <button
              onClick={() => setActiveTab("volume")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "volume" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "timeline" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab("radar")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "radar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Radar
            </button>
            <button
              onClick={() => setActiveTab("breakdown")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "breakdown" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Weights
            </button>
          </div>
        </div>

        {/* Dynamic Chart Area */}
        <div className="h-64 w-full">
          {!hasTradingHistory && activeTab !== "breakdown" ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-2">
              <Compass className="w-10 h-10 text-gray-300 animate-spin" />
              <p className="text-sm font-semibold text-gray-400">Trading Data Unavailable for Charting</p>
              <p className="text-xs text-gray-400 max-w-sm font-sans">
                No official predictions or positions are logged for this wallet yet. Recalculate or input another address.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "volume" ? (
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                    labelClassName="text-gray-900 font-sans font-bold"
                  />
                  <Bar dataKey="volume" fill="#0052FF" radius={[4, 4, 0, 0]} name="Volume (USD)" />
                  <Bar dataKey="predictions" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Predictions" />
                </BarChart>
              ) : activeTab === "timeline" ? (
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                    labelClassName="text-gray-900 font-sans font-bold"
                  />
                  <Area type="monotone" dataKey="activity" stroke="#0052FF" fillOpacity={0.1} fill="url(#colorActivity)" name="Active Predictions" />
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0052FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              ) : activeTab === "radar" ? (
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={10} />
                  <PolarRadiusAxis stroke="#e5e7eb" fontSize={10} />
                  <Radar name="Wallet Score %" dataKey="A" stroke="#0052FF" fill="#0052FF" fillOpacity={0.15} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                    labelClassName="text-gray-900 font-sans font-bold"
                  />
                </RadarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={rewardBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {rewardBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                    labelClassName="text-gray-900 font-sans font-bold"
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Side Visualizers: Gauge & Calendar Heatmap */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
        {/* Eligibility Progress Gauge */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-800 font-sans flex items-center">
              <Target className="w-3.5 h-3.5 mr-1.5 text-[#0052FF]" />
              Eligibility Progress Gauge
            </span>
            <span className="text-xs font-mono text-gray-400 font-bold">Target 100%</span>
          </div>

          <div className="flex justify-center items-center relative py-2">
            {/* Custom SVG Half Gauge */}
            <svg className="w-36 h-20" viewBox="0 0 100 50">
              {/* Background Arch */}
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
              {/* Foreground Arch */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * Math.min(100, score)) / 100}
              />
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0052FF" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute top-11 text-center">
              <span className="text-2xl font-sans font-extrabold text-gray-900 block">{Math.round(score)}%</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Completed</span>
            </div>
          </div>
        </div>

        {/* Activity Calendar Heatmap */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-800 font-sans flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#0052FF]" />
              Activity Heatmap (Past 120 Days)
            </span>
            <span className="text-[10px] font-mono text-gray-400 font-bold">More Active ➔</span>
          </div>

          <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1" id="calendar-heatmap-grid">
            {heatmapData.map((val, idx) => {
              let bg = "bg-gray-100";
              if (val > 0) {
                if (val <= 2) bg = "bg-blue-100 border border-blue-200/10";
                else if (val <= 5) bg = "bg-blue-300";
                else if (val <= 8) bg = "bg-blue-500";
                else bg = "bg-emerald-500";
              }
              return (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-sm transition-colors ${bg}`}
                  title={`${val} transactions/trades`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
