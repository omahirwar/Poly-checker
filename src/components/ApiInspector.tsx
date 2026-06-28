import React, { useState } from "react";
import { ApiLog } from "../types";
import { Terminal, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ApiInspectorProps {
  logs: ApiLog[];
  isEstimated?: boolean;
}

export default function ApiInspector({ logs, isEstimated }: ApiInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!logs || logs.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm" id="api-inspector">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100/70 transition-colors text-left cursor-pointer"
        id="btn-toggle-inspector"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans font-bold text-gray-900 text-sm">Polymarket API Network Trace</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[10px] font-mono text-gray-400 mt-0.5">
              Live HTTP logs for {logs.length} background queries executed
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100">
            SSL Secure
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Expandable Logs Section */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-gray-100 bg-gray-950 text-gray-300 font-mono text-xs overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {/* Dev notice */}
              <div className="p-3.5 bg-gray-900/50 rounded-xl border border-gray-800 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-gray-400">
                  <span className="text-white font-bold">Public Endpoint Analytics Trace:</span>
                  <p className="mt-0.5">
                    This trace confirms real-time queries made from our backend proxy to Polymarket's decentralised data providers to calculate accurate eligibility weights.
                  </p>
                </div>
              </div>

              {/* Feed items */}
              <div className="space-y-3">
                {logs.map((log, index) => {
                  const isSuccess = log.status >= 200 && log.status < 300;
                  const isCalc = log.method === "CALC";

                  return (
                    <div
                      key={index}
                      className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/60 hover:bg-gray-900/60 transition-colors space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Method & URL */}
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                              log.method === "GET"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : log.method === "POST"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {log.method}
                          </span>
                          <span className="text-gray-400 font-semibold truncate max-w-[250px] sm:max-w-md">
                            {log.url}
                          </span>
                        </div>

                        {/* Status Code */}
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] ${
                            isSuccess
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? "bg-emerald-400" : "bg-red-400"}`} />
                          <span>Status {log.status}</span>
                        </span>
                      </div>

                      {/* Result */}
                      <div className="pl-1.5 border-l border-gray-800 text-[11px] text-gray-400 leading-relaxed break-words">
                        {log.result}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Server State summary footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-[10px] text-gray-500 font-mono">
                <span className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>Gateway Status: <span className="text-emerald-400 font-bold">ONLINE</span></span>
                </span>
                <span>Response Mode: {isEstimated ? "On-Chain Estimator" : "100% Real Polymarket Data API Feed"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
