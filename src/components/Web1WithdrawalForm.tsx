import React, { useState } from 'react';
import { Send, Plus, Trash2, HelpCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { SearchableSelect, SelectOption } from './SearchableSelect';
import {
  MasterItem,
  UnitOption,
  WithdrawalItem,
  WithdrawalSubmission,
  StockSummaryItem
} from '../types/inventory';
import { DEFAULT_MACHINES, saveWithdrawal, getWithdrawals } from '../services/storage';
import { syncWithdrawalToSheet } from '../services/googleSheets';

interface Web1WithdrawalFormProps {
  masterItems: MasterItem[];
  units: UnitOption[];
  stockSummary: StockSummaryItem[];
  onDataChanged: () => void;
  onOpenInstructions: () => void;
}

export const Web1WithdrawalForm: React.FC<Web1WithdrawalFormProps> = ({
  masterItems,
  units,
  stockSummary,
  onDataChanged,
  onOpenInstructions,
}) => {
  // Today's date YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(today);
  const [machine, setMachine] = useState<string>('');
  const [requesterName, setRequesterName] = useState<string>('');
  const [items, setItems] = useState<WithdrawalItem[]>([
    { itemId: '', itemName: '', qty: 1, unit: 'PCS', notes: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRecent, setShowRecent] = useState<boolean>(false);

  // Stock lookup dictionary for quick balance check
  const stockMap = React.useMemo(() => {
    const map = new Map<string, number>();
    stockSummary.forEach((s) => map.set(s.id, s.currentStock));
    return map;
  }, [stockSummary]);

  // Options for item dropdown
  const itemOptions: SelectOption[] = masterItems.map((item) => {
    const stock = stockMap.get(item.id) ?? item.initialStock;
    return {
      value: item.id,
      label: item.name,
      badge: `${stock} ${item.defaultUnit}`,
      subtext: `${item.code} • Kat: ${item.category}`,
    };
  });

  // Options for units
  const unitOptions: SelectOption[] = units.map((u) => ({
    value: u.value,
    label: u.value,
    badge: u.label.includes('(') ? u.label.split('(')[1].replace(')', '') : undefined,
  }));

  // Options for machines
  const machineOptions: SelectOption[] = DEFAULT_MACHINES.map((m) => ({
    value: m,
    label: m,
  }));

  const handleItemSelect = (index: number, itemId: string) => {
    const selected = masterItems.find((m) => m.id === itemId);
    const updated = [...items];
    if (selected) {
      updated[index] = {
        ...updated[index],
        itemId: selected.id,
        itemName: selected.name,
        unit: selected.defaultUnit,
      };
    } else {
      // Custom entered item
      updated[index] = {
        ...updated[index],
        itemId: itemId,
        itemName: itemId,
      };
    }
    setItems(updated);
  };

  const handleFieldChange = (index: number, field: keyof WithdrawalItem, val: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { itemId: '', itemName: '', qty: 1, unit: 'PCS', notes: '' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!date) {
      setErrorMessage('Tanggal wajib diisi.');
      return;
    }
    if (!machine.trim()) {
      setErrorMessage('Mesin / Lokasi wajib diisi.');
      return;
    }
    if (!requesterName.trim()) {
      setErrorMessage('Nama Pengambil wajib diisi.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const itm = items[i];
      if (!itm.itemName.trim()) {
        setErrorMessage(`Barang ke-${i + 1} belum dipilih.`);
        return;
      }
      if (!itm.qty || itm.qty <= 0) {
        setErrorMessage(`Qty untuk barang ke-${i + 1} harus lebih dari 0.`);
        return;
      }
      if (!itm.unit) {
        setErrorMessage(`Satuan untuk barang ke-${i + 1} belum ditentukan.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const newSubmission: WithdrawalSubmission = {
        id: `OUT-${Date.now().toString().slice(-6)}`,
        date,
        machine: machine.trim(),
        requesterName: requesterName.trim(),
        items: items.map((it) => ({
          ...it,
          qty: Number(it.qty),
        })),
        createdAt: new Date().toISOString(),
      };

      // 1. Save locally
      saveWithdrawal(newSubmission);

      // 2. Sync to Spreadsheet
      const syncResult = await syncWithdrawalToSheet(newSubmission);

      setSuccessMessage(
        `Pengambilan barang berhasil disimpan! ID: ${newSubmission.id} (${syncResult.message})`
      );

      // Reset items back to 1 empty item, keep date & requester for fast repeated entries
      setItems([{ itemId: '', itemName: '', qty: 1, unit: 'PCS', notes: '' }]);
      onDataChanged();
    } catch (err: any) {
      setErrorMessage('Gagal menyimpan: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentWithdrawals = getWithdrawals().slice(0, 5);

  return (
    <div className="max-w-xl mx-auto px-2 sm:px-4 py-3 sm:py-6 animate-in fade-in duration-200">
      {/* Outer Card Styled to match uploaded design */}
      <div className="bg-[#fbf7ee] border-2 border-stone-800 rounded-3xl p-4 sm:p-7 shadow-lg relative">
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-300/80 mb-4">
          <div className="font-bold text-stone-900 tracking-tight text-sm sm:text-base">
            PT KMI Wire and Cable Tbk
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenInstructions}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-stone-800 bg-white border border-stone-800 rounded-full hover:bg-stone-50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Petunjuk Isi</span>
            </button>
            <span className="font-bold text-xs sm:text-sm text-stone-900 bg-stone-200/80 px-2.5 py-0.5 rounded-md border border-stone-400">
              KMI1
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-3 sm:my-5">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-wide">
            FORM
          </h2>
          <h3 className="text-base sm:text-xl font-extrabold text-stone-900 uppercase tracking-tight mt-0.5">
            PENGAMBILAN DAN PEMAKAIAN BARANG
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            Form khusus operator pabrik untuk mutasi keluar material & sparepart
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-900 rounded-xl text-xs sm:text-sm flex items-start gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-400 text-emerald-950 rounded-xl text-xs sm:text-sm flex items-start gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="font-medium">{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-stone-900 mb-1">
              Tanggal :
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-800 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
              required
            />
          </div>

          {/* Mesin */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-stone-900 mb-1">
              Mesin :
            </label>
            <SearchableSelect
              options={machineOptions}
              value={machine}
              onChange={setMachine}
              placeholder="Pilih atau ketik nama/nomor mesin..."
              searchPlaceholder="Cari nama mesin (mis: Extruder, Cabling)..."
              allowCustom={true}
              className="font-medium"
            />
          </div>

          {/* Nama Pengambil */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-stone-900 mb-1">
              Nama Pengambil :
            </label>
            <input
              type="text"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              placeholder="Nama pengambil barang..."
              className="w-full px-3.5 py-2.5 bg-white border border-stone-800 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
              required
            />
          </div>

          {/* Items Container */}
          <div className="space-y-3 pt-2">
            {items.map((item, index) => {
              const currentStock = stockMap.get(item.itemId) ?? null;
              const isLowStock = currentStock !== null && currentStock <= item.qty;

              return (
                <div
                  key={index}
                  className="bg-white border-2 border-stone-800 rounded-2xl p-3 sm:p-4 shadow-xs relative"
                >
                  {/* Item Badge & Delete */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-3 py-1 bg-[#fed7aa] border border-stone-800 text-stone-900 text-xs font-bold rounded-lg shadow-2xs">
                      Barang {index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus barang ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Cari / Pilih Barang */}
                  <div className="mb-2.5">
                    <SearchableSelect
                      options={itemOptions}
                      value={item.itemId}
                      onChange={(val) => handleItemSelect(index, val)}
                      placeholder="Cari / Pilih barang"
                      searchPlaceholder="Ketik nama atau kode barang..."
                      allowCustom={true}
                    />
                    {currentStock !== null && (
                      <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500 px-1">
                        <span>Sisa stok di gudang:</span>
                        <span
                          className={`font-bold ${
                            isLowStock ? 'text-amber-600 font-extrabold' : 'text-emerald-700'
                          }`}
                        >
                          {currentStock} {item.unit} {isLowStock ? '(Mendekati habis!)' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Qty & Satuan Row */}
                  <div className="grid grid-cols-2 gap-2 mb-2.5">
                    <div>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0.1"
                        step="any"
                        value={item.qty}
                        onChange={(e) =>
                          handleFieldChange(index, 'qty', parseFloat(e.target.value) || 0)
                        }
                        placeholder="Qty"
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-800 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                        required
                      />
                    </div>
                    <div>
                      <SearchableSelect
                        options={unitOptions}
                        value={item.unit}
                        onChange={(val) => handleFieldChange(index, 'unit', val)}
                        placeholder="Satuan"
                        searchPlaceholder="Cari satuan..."
                        allowCustom={true}
                      />
                    </div>
                  </div>

                  {/* Keterangan Pemakaian */}
                  <div>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleFieldChange(index, 'notes', e.target.value)}
                      placeholder="Keterangan pemakaian"
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons Box (Matches the tan background box in screenshot) */}
          <div className="bg-[#f2dec4]/70 border border-stone-400/80 rounded-2xl p-3 sm:p-4 space-y-3 mt-4">
            {/* + Tambah Barang Button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 sm:py-3 bg-[#a3d9a5] hover:bg-[#8ee091] text-stone-900 font-extrabold text-sm sm:text-base border-2 border-stone-800 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>+ Tambah barang</span>
            </button>

            {/* SIMPAN Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 bg-[#93c5fd] hover:bg-[#7bc0fc] text-stone-950 font-black text-sm sm:text-base tracking-wider uppercase border-2 border-stone-800 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <Send className="w-4 h-4 stroke-[2.5] -rotate-12" />
              <span>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN'}</span>
            </button>
          </div>
        </form>

        {/* Toggle Recent Submissions */}
        <div className="mt-5 pt-3 border-t border-stone-300 text-center">
          <button
            type="button"
            onClick={() => setShowRecent(!showRecent)}
            className="text-xs font-semibold text-stone-700 hover:text-stone-900 inline-flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{showRecent ? 'Sembunyikan Riwayat Hari Ini' : 'Lihat Riwayat Pengambilan Terakhir'}</span>
          </button>

          {showRecent && (
            <div className="mt-3 text-left bg-white border border-stone-300 rounded-xl p-3 max-h-64 overflow-y-auto divide-y divide-stone-100">
              {recentWithdrawals.length === 0 ? (
                <div className="text-xs text-stone-500 py-2 text-center">Belum ada data pengambilan</div>
              ) : (
                recentWithdrawals.map((rec) => (
                  <div key={rec.id} className="py-2 first:pt-0 last:pb-0 text-xs">
                    <div className="flex justify-between items-center font-bold text-stone-900">
                      <span>{rec.machine} ({rec.requesterName})</span>
                      <span className="text-[11px] text-stone-500">{rec.date}</span>
                    </div>
                    <ul className="mt-1 space-y-0.5 text-stone-600 pl-3 list-disc">
                      {rec.items.map((it, i) => (
                        <li key={i}>
                          <span className="font-medium text-stone-800">{it.itemName}</span>: {it.qty} {it.unit}
                          {it.notes ? ` (${it.notes})` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
