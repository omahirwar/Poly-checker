import { motion } from "motion/react";
import { WalletData } from "../types";
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react";

interface RequirementCardProps {
  walletData: WalletData;
}

export default function RequirementCard({ walletData }: RequirementCardProps) {
  const specs = [
    {
      id: "req-predictions",
      title: "500+ Predictions",
      current: walletData.totalPredictions,
      required: 500,
      format: (val: number) => `${val} predictions`,
      type: "count",
    },
    {
      id: "req-volume",
      title: "$250,000+ Trading Volume",
      current: walletData.tradingVolume,
      required: 250000,
      format: (val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      type: "currency",
    },
    {
      id: "req-months",
      title: "7+ Active Months",
      current: walletData.activeMonths,
      required: 7,
      format: (val: number) => `${val} months`,
      type: "count",
    },
    {
      id: "req-weeks",
      title: "20+ Active Weeks",
      current: walletData.activeWeeks,
      required: 20,
      format: (val: number) => `${val} weeks`,
      type: "count",
    },
    {
      id: "req-days",
      title: "50+ Active Trading Days",
      current: walletData.activeDays,
      required: 50,
      format: (val: number) => `${val} days`,
      type: "count",
    },
    {
      id: "req-lp-activity",
      title: "LP Activity",
      current: walletData.lpActivity,
      required: 1, // binary active/inactive
      format: (val: any) => (val ? "Active" : "Inactive"),
      type: "binary",
    },
    {
      id: "req-lp-rewards",
      title: "LP Rewards Received",
      current: walletData.lpRewards,
      required: 1, // greater than 0
      format: (val: number) => `$${val}`,
      type: "currency",
    },
    {
      id: "req-sports",
      title: "Sports Market Activity",
      current: walletData.sportsMarketActivity,
      required: 5,
      format: (val: number) => `${val} sports trades`,
      type: "count",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="requirement-cards-grid">
      {specs.map((spec) => {
        const isUnavailable = spec.current === null;
        let progress = 0;
        let isMet = false;
        let badgeColor = "bg-gray-800 text-gray-400";
        let badgeText = "Unavailable";
        let badgeIcon = <HelpCircle className="w-4 h-4 mr-1 text-gray-400" />;
        let remainingStr = "Data Unavailable";

        if (!isUnavailable) {
          const currentVal = Number(spec.current);
          if (spec.type === "binary") {
            isMet = currentVal >= spec.required;
            progress = isMet ? 100 : 0;
            remainingStr = isMet ? "Completed" : "Not Active";
          } else {
            progress = Math.min(100, Math.max(0, (currentVal / spec.required) * 100));
            isMet = currentVal >= spec.required;
            const remaining = Math.max(0, spec.required - currentVal);
            if (spec.type === "currency") {
              remainingStr = remaining > 0 ? `$${remaining.toLocaleString()} left` : "Completed";
            } else {
              remainingStr = remaining > 0 ? `${remaining} left` : "Completed";
            }
          }

          if (isMet) {
            badgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";
            badgeText = "Eligible";
            badgeIcon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />;
          } else {
            badgeColor = "bg-amber-50 text-amber-700 border border-amber-100";
            badgeText = "In Progress";
            badgeIcon = <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />;
          }
        } else {
          badgeColor = "bg-red-50 text-red-700 border border-red-100";
          badgeText = "Unavailable";
          badgeIcon = <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />;
        }

        return (
          <motion.div
            key={spec.id}
            id={spec.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-all shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-sans font-bold text-gray-900 text-[15px]">{spec.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
                {badgeIcon}
                {badgeText}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-sans font-bold">Current Value</span>
                  <span className="font-sans text-xl font-extrabold text-gray-900">
                    {isUnavailable ? "N/A" : spec.format(Number(spec.current))}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-sans font-bold">Required</span>
                  <span className="font-sans text-sm text-gray-600 font-semibold">
                    {spec.type === "binary" ? "Active Status" : spec.format(spec.required)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  {!isUnavailable ? (
                    <motion.div
                      className={`h-full rounded-full ${
                        isMet
                          ? "bg-[#0052FF]"
                          : "bg-[#0052FF]/40"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100" />
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-mono">
                  <span>{!isUnavailable ? `${Math.round(progress)}% Complete` : "N/A"}</span>
                  <span className={isMet ? "text-emerald-600 font-bold" : "text-gray-400"}>{remainingStr}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
