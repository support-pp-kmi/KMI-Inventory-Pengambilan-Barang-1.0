/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Web1WithdrawalForm } from './components/Web1WithdrawalForm';
import { Web2Portal } from './components/Web2Portal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { InstructionsModal } from './components/InstructionsModal';
import { ShareLinksModal } from './components/ShareLinksModal';
import {
  getMasterItems,
  getUnits,
  getStockSummary,
  getSheetSettings,
} from './services/storage';
import {
  MasterItem,
  UnitOption,
  StockSummaryItem,
  SheetSettings,
} from './types/inventory';
import { Smartphone, Boxes, FileSpreadsheet, Share2 } from 'lucide-react';

export default function App() {
  // Support deep links via query param ?app=web1 / ?app=web2 OR hash #web1 / #web2
  const getInitialApp = (): 'web1' | 'web2' => {
    if (typeof window !== 'undefined') {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (search.includes('app=web2') || hash.includes('web2')) return 'web2';
      if (search.includes('app=web1') || hash.includes('web1')) return 'web1';
    }
    return 'web1';
  };

  const [currentApp, setCurrentApp] = useState<'web1' | 'web2'>(getInitialApp);
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummaryItem[]>([]);
  const [sheetSettings, setSheetSettings] = useState<SheetSettings>(getSheetSettings());

  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Refresh all reactive data
  const loadData = useCallback(() => {
    setMasterItems(getMasterItems());
    setUnits(getUnits());
    setStockSummary(getStockSummary());
    setSheetSettings(getSheetSettings());
  }, []);

  useEffect(() => {
    loadData();

    // Listen to hash changes for deep linking
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('web2')) setCurrentApp('web2');
      else if (hash.includes('web1')) setCurrentApp('web1');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [loadData]);

  const handleSelectApp = (app: 'web1' | 'web2') => {
    setCurrentApp(app);
    window.location.hash = app;
  };

  return (
    <div className="min-h-screen bg-[#faf7f0] text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Top Navbar with App Switcher & Status */}
      <Navbar
        currentApp={currentApp}
        onSelectApp={handleSelectApp}
        onOpenSpreadsheetModal={() => setIsSheetModalOpen(true)}
        onOpenInstructions={() => setIsInstructionsOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        sheetSettings={sheetSettings}
      />

      {/* Main Container */}
      <main className="flex-1 pb-20 sm:pb-12">
        {currentApp === 'web1' ? (
          <Web1WithdrawalForm
            masterItems={masterItems}
            units={units}
            stockSummary={stockSummary}
            onDataChanged={loadData}
            onOpenInstructions={() => setIsInstructionsOpen(true)}
          />
        ) : (
          <Web2Portal
            masterItems={masterItems}
            units={units}
            stockSummary={stockSummary}
            onDataChanged={loadData}
          />
        )}
      </main>

      {/* Floating Bottom Bar for Mobile Devices */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#fbf7ee]/95 backdrop-blur-md border-t-2 border-stone-800 p-2 sm:hidden flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => handleSelectApp('web1')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            currentApp === 'web1'
              ? 'bg-sky-100 text-sky-950 border border-stone-800'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Smartphone className="w-4 h-4 text-sky-600" />
          <span>Web 1: Pengambilan</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectApp('web2')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            currentApp === 'web2'
              ? 'bg-stone-900 text-white border border-stone-900'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Boxes className="w-4 h-4 text-emerald-400" />
          <span>Web 2: Stok & PO/PR</span>
        </button>

        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="py-1.5 px-3 text-stone-700 hover:text-stone-900 flex flex-col items-center gap-1 cursor-pointer"
          title="Dapatkan link terpisah Web 1 dan 2"
        >
          <Share2 className="w-4 h-4 text-amber-700" />
          <span className="text-[10px] font-bold">Bagi Link</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSheetModalOpen(true)}
          className="py-1.5 px-3 text-stone-700 hover:text-stone-900 flex flex-col items-center gap-1 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span className="text-[10px] font-bold">Sheet</span>
        </button>
      </div>

      {/* Share Links Modal */}
      <ShareLinksModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        baseUrl={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Spreadsheet Integration & Master Item Modal */}
      <GoogleSheetsModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        settings={sheetSettings}
        masterItems={masterItems}
        units={units}
        onSettingsSaved={(newSettings) => {
          setSheetSettings(newSettings);
          loadData();
        }}
        onDataChanged={loadData}
      />

      {/* Instructions Modal ("Petunjuk Isi") */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </div>
  );
}
