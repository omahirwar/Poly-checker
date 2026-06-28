import { ShieldCheck } from "lucide-react";

export default function AirdropHeader() {
  return (
    <>
      {/* Developer Credit Strip - sits above everything, full width */}
      <div className="w-full bg-[#0052FF] py-2 px-4 text-center select-none">
        <a
          href="https://x.com/hi_vecna"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-sans font-bold text-sm sm:text-base tracking-wide hover:underline"
          id="developer-credit"
        >
          Developed by @hi_vecna
        </a>
      </div>

      <header className="border-b border-gray-100 bg-white sticky top-0 z-50 py-4.5 px-6 flex justify-between items-center" id="airdrop-header">
        {/* Brand Logo inspired exactly by the Polymarket design in the screenshot */}
        <div className="flex items-center space-x-3 select-none">
          <div className="w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center relative">
            <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 24 33 L 76 19 L 76 81 L 24 67 Z" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 24 33 L 76 50" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 24 67 L 76 50" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-sans font-bold text-gray-900 text-sm sm:text-base tracking-wide uppercase">
            POLY AIRDROP CALCULATOR
          </span>
        </div>

        {/* Navigation utilities */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-[#0052FF]/5 border border-[#0052FF]/10 px-2.5 py-1 rounded-full text-[10px] font-mono text-[#0052FF] font-bold select-none">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Scanner</span>
          </div>
        </div>
      </header>
    </>
  );
}
