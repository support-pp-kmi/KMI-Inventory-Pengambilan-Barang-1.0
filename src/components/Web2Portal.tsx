import React, { useState } from 'react';
import { PackagePlus, BarChart3, FileSpreadsheet } from 'lucide-react';
import { Web2IncomingForm } from './Web2IncomingForm';
import { Web2StockTable } from './Web2StockTable';
import { Web2POPRManager } from './Web2POPRManager';
import { MasterItem, UnitOption, StockSummaryItem } from '../types/inventory';

interface Web2PortalProps {
  masterItems: MasterItem[];
  units: UnitOption[];
  stockSummary: StockSummaryItem[];
  onDataChanged: () => void;
}

export type Web2Menu = 'INCOMING' | 'STOCK' | 'PO_PR';

export const Web2Portal: React.FC<Web2PortalProps> = ({
  masterItems,
  units,
  stockSummary,
  onDataChanged,
}) => {
  const [activeMenu, setActiveMenu] = useState<Web2Menu>('STOCK');

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-4">
      {/* Top Navigation Tabs for Web 2 (Menu 1, Menu 2, Menu 3) */}
      <div className="bg-[#fbf7ee] border-2 border-stone-800 rounded-2xl p-1.5 shadow-sm">
        <div className="grid grid-cols-3 gap-1">
          {/* Menu 1 */}
          <button
            type="button"
            onClick={() => setActiveMenu('INCOMING')}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMenu === 'INCOMING'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200/70'
            }`}
          >
            <PackagePlus className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Input Barang</span>
          </button>

          {/* Menu 2 */}
          <button
            type="button"
            onClick={() => setActiveMenu('STOCK')}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMenu === 'STOCK'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200/70'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Stok Qty Barang</span>
          </button>

          {/* Menu 3 */}
          <button
            type="button"
            onClick={() => setActiveMenu('PO_PR')}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMenu === 'PO_PR'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200/70'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Update PO & PR</span>
          </button>
        </div>
      </div>

      {/* Content Rendering based on Menu */}
      <div className="animate-in fade-in duration-150">
        {activeMenu === 'INCOMING' && (
          <Web2IncomingForm
            masterItems={masterItems}
            units={units}
            onDataChanged={onDataChanged}
          />
        )}

        {activeMenu === 'STOCK' && (
          <Web2StockTable
            stockSummary={stockSummary}
            onDataChanged={onDataChanged}
          />
        )}

        {activeMenu === 'PO_PR' && (
          <Web2POPRManager onDataChanged={onDataChanged} />
        )}
      </div>
    </div>
  );
};
