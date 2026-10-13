import React from 'react';
import {
  FileText,
  Boxes,
  FileSpreadsheet,
  HelpCircle,
  Smartphone,
  Layers,
  Share2
} from 'lucide-react';
import { SheetSettings } from '../types/inventory';

interface NavbarProps {
  currentApp: 'web1' | 'web2';
  onSelectApp: (app: 'web1' | 'web2') => void;
  onOpenSpreadsheetModal: () => void;
  onOpenInstructions: () => void;
  onOpenShareModal: () => void;
  sheetSettings: SheetSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentApp,
  onSelectApp,
  onOpenSpreadsheetModal,
  onOpenInstructions,
  onOpenShareModal,
  sheetSettings,
}) => {
  const isConnected = Boolean(sheetSettings.webhookUrl || sheetSettings.spreadsheetId);

  return (
    <header className="sticky top-0 z-40 bg-[#fbf7ee] border-b-2 border-stone-800 shadow-xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Title */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 font-black text-sm flex items-center justify-center border-2 border-stone-800 shadow-2xs shrink-0">
            KMI
          </div>
          <div>
            <h1 className="font-black text-stone-900 text-xs sm:text-sm tracking-tight leading-tight">
              PT KMI Wire and Cable Tbk
            </h1>
            <p className="text-[10px] text-stone-600 font-semibold leading-none">
              Sistem Pengambilan, Kedatangan & Stok Barang
            </p>
          </div>
        </div>

        {/* Central Switcher for Web 1 vs Web 2 */}
        <div className="flex items-center bg-stone-200/90 p-1 rounded-2xl border border-stone-400/80 shadow-2xs">
          <button
            type="button"
            onClick={() => onSelectApp('web1')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              currentApp === 'web1'
                ? 'bg-white text-stone-950 border border-stone-800 shadow-xs'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden xs:inline">Web 1:</span>
            <span>Pengambilan</span>
            <span className="text-[10px] bg-stone-100 text-stone-600 px-1 py-0.2 rounded border border-stone-300">
              KMI1
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectApp('web2')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              currentApp === 'web2'
                ? 'bg-stone-900 text-white border border-stone-900 shadow-xs'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">Web 2:</span>
            <span>Kedatangan & Stok</span>
            <span className="text-[10px] bg-stone-800 text-stone-200 px-1 py-0.2 rounded border border-stone-700">
              KMI2
            </span>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Spreadsheet Sync Button */}
          <button
            type="button"
            onClick={onOpenSpreadsheetModal}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isConnected
                ? 'bg-emerald-100 border-emerald-500 text-emerald-950 hover:bg-emerald-200'
                : 'bg-white border-stone-800 text-stone-800 hover:bg-stone-100'
            }`}
            title="Pengaturan Koneksi Spreadsheet & Master Barang"
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-700' : 'text-stone-600'}`} />
            <span className="hidden sm:inline">Spreadsheet</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
              }`}
            />
          </button>

          {/* Share Links Button */}
          <button
            type="button"
            onClick={onOpenShareModal}
            className="px-2.5 py-1.5 rounded-xl border border-stone-800 bg-amber-200 hover:bg-amber-300 text-stone-950 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Dapatkan Link Terpisah Web 1 dan Web 2"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-900" />
            <span className="hidden md:inline">Bagi Link</span>
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={onOpenInstructions}
            className="p-1.5 rounded-xl border border-stone-800 bg-white hover:bg-stone-100 text-stone-800 cursor-pointer shadow-xs"
            title="Petunjuk Pengisian"
          >
            <HelpCircle className="w-4 h-4 text-sky-700" />
          </button>
        </div>
      </div>
    </header>
  );
};
