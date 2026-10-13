import React, { useState } from 'react';
import {
  Search,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { StockSummaryItem } from '../types/inventory';
import { setAbsoluteStock, exportStockToExcel } from '../services/storage';

interface Web2StockTableProps {
  stockSummary: StockSummaryItem[];
  onDataChanged: () => void;
}

export const Web2StockTable: React.FC<Web2StockTableProps> = ({
  stockSummary,
  onDataChanged,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  // Inline editing state: record of { [itemId]: number }
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Extract unique categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    stockSummary.forEach((s) => set.add(s.category));
    return ['ALL', ...Array.from(set)];
  }, [stockSummary]);

  // Filtered rows
  const filteredList = stockSummary.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    const matchesLowStock = !onlyLowStock || item.currentStock <= item.minStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Calculate summary counts
  const totalItems = stockSummary.length;
  const criticalItems = stockSummary.filter((s) => s.currentStock <= s.minStock).length;
  const totalOutgoingQty = stockSummary.reduce((acc, s) => acc + s.totalOutgoing, 0);
  const totalIncomingQty = stockSummary.reduce((acc, s) => acc + s.totalIncoming, 0);

  const startEdit = (item: StockSummaryItem) => {
    setEditingId(item.id);
    setEditingValue(String(item.currentStock));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleSaveStock = (itemId: string, itemName: string) => {
    const num = parseFloat(editingValue);
    if (isNaN(num) || num < 0) {
      alert('Masukkan angka stok yang valid (>= 0)');
      return;
    }

    setAbsoluteStock(itemId, num);
    setEditingId(null);
    setEditingValue('');
    onDataChanged();

    setSaveToast(`Stok "${itemName}" berhasil diupdate menjadi ${num}`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white border-2 border-stone-800 rounded-2xl p-3 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1">
            <Boxes className="w-3.5 h-3.5 text-stone-700" />
            Total Item
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            {totalItems} <span className="text-xs font-normal text-stone-500">Barang</span>
          </div>
        </div>

        <div className={`border-2 border-stone-800 rounded-2xl p-3 shadow-xs ${
          criticalItems > 0 ? 'bg-amber-50' : 'bg-white'
        }`}>
          <div className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Stok Kritis
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-900 mt-1">
            {criticalItems} <span className="text-xs font-normal text-amber-700">Perlu Order</span>
          </div>
        </div>

        <div className="bg-white border-2 border-stone-800 rounded-2xl p-3 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Total Masuk
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-850 mt-1">
            {totalIncomingQty}
          </div>
        </div>

        <div className="bg-white border-2 border-stone-800 rounded-2xl p-3 shadow-xs">
          <div className="text-[11px] font-bold text-red-600 uppercase flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            Total Keluar
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-800 mt-1">
            {totalOutgoingQty}
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {saveToast && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-950 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveToast}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white border-2 border-stone-800 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        {/* Search Input Bar (Fitur Search Barang di Bagian Atas) */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama barang, kode (RM-CU...), atau kategori..."
              className="w-full pl-9 pr-8 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border border-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer ${
                onlyLowStock
                  ? 'bg-amber-400 text-stone-900'
                  : 'bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Stok Kritis</span>
            </button>

            <button
              type="button"
              onClick={exportStockToExcel}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-stone-800 bg-sky-100 hover:bg-sky-200 text-sky-950 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download Stok ke Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-stone-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stock Table Container */}
      <div className="bg-white border-2 border-stone-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Table for Desktop / Tablet */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-100 border-b-2 border-stone-800 text-stone-800 font-extrabold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3 sm:px-4">Barang & Kode</th>
                <th className="py-3 px-2 sm:px-3">Kategori</th>
                <th className="py-3 px-2 text-center">Satuan</th>
                <th className="py-3 px-2 text-right">Awal</th>
                <th className="py-3 px-2 text-right text-emerald-700">Masuk</th>
                <th className="py-3 px-2 text-right text-red-600">Keluar</th>
                <th className="py-3 px-3 text-center bg-sky-50/60 font-black">Sisa Stok</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Edit Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-500">
                    Tidak ditemukan data barang yang cocok dengan pencarian "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isEditing = editingId === item.id;
                  const isCritical = item.currentStock <= item.minStock;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        isCritical ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Nama & Kode Barang */}
                      <td className="py-3 px-3 sm:px-4 font-semibold text-stone-900">
                        <div className="font-bold text-stone-900">{item.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{item.code}</div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-2 sm:px-3 text-stone-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[11px] font-medium border border-stone-200">
                          {item.category}
                        </span>
                      </td>

                      {/* Satuan */}
                      <td className="py-3 px-2 text-center font-bold text-stone-700">
                        {item.unit}
                      </td>

                      {/* Stok Awal */}
                      <td className="py-3 px-2 text-right font-medium text-stone-600">
                        {item.initialStock}
                      </td>

                      {/* Total Masuk */}
                      <td className="py-3 px-2 text-right font-bold text-emerald-700">
                        +{item.totalIncoming}
                      </td>

                      {/* Total Keluar */}
                      <td className="py-3 px-2 text-right font-bold text-red-600">
                        -{item.totalOutgoing}
                      </td>

                      {/* Sisa Stok Terkini */}
                      <td className="py-3 px-3 text-center bg-sky-50/40 font-black">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="w-20 px-2 py-1 bg-white border-2 border-sky-600 rounded-lg text-center font-black text-stone-900 focus:outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span
                            className={`text-base font-black px-2.5 py-1 rounded-lg ${
                              isCritical
                                ? 'text-amber-950 bg-amber-200 border border-amber-400'
                                : 'text-stone-900 bg-sky-100 border border-sky-300'
                            }`}
                          >
                            {item.currentStock}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-300">
                            <AlertTriangle className="w-3 h-3" /> Kritis (Min {item.minStock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                            Aman
                          </span>
                        )}
                      </td>

                      {/* Aksi Edit Stok Langsung */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveStock(item.id, item.name)}
                              className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-xs cursor-pointer"
                              title="Simpan Stok"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="p-1.5 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold transition-colors cursor-pointer"
                            title="Edit langsung stok di baris ini"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            Menampilkan <span className="font-bold text-stone-800">{filteredList.length}</span> dari{' '}
            <span className="font-bold text-stone-800">{stockSummary.length}</span> item barang.
          </div>
          <div className="italic">
            Tip: Klik tombol <strong>"Edit"</strong> di baris barang untuk mengubah jumlah stok fisik langsung.
          </div>
        </div>
      </div>
    </div>
  );
};
