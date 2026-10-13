import React, { useState } from 'react';
import { Send, Plus, Trash2, CheckCircle2, AlertTriangle, PackageCheck } from 'lucide-react';
import { SearchableSelect, SelectOption } from './SearchableSelect';
import {
  MasterItem,
  UnitOption,
  IncomingItem,
  IncomingSubmission,
} from '../types/inventory';
import { saveIncoming } from '../services/storage';
import { syncIncomingToSheet } from '../services/googleSheets';

interface Web2IncomingFormProps {
  masterItems: MasterItem[];
  units: UnitOption[];
  onDataChanged: () => void;
}

export const Web2IncomingForm: React.FC<Web2IncomingFormProps> = ({
  masterItems,
  units,
  onDataChanged,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(today);
  const [items, setItems] = useState<IncomingItem[]>([
    { itemId: '', itemName: '', qty: 1, unit: 'PCS', prNumber: '', poNumber: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const itemOptions: SelectOption[] = masterItems.map((item) => ({
    value: item.id,
    label: item.name,
    badge: item.defaultUnit,
    subtext: `${item.code} • ${item.category}`,
  }));

  const unitOptions: SelectOption[] = units.map((u) => ({
    value: u.value,
    label: u.value,
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
      updated[index] = {
        ...updated[index],
        itemId: itemId,
        itemName: itemId,
      };
    }
    setItems(updated);
  };

  const handleFieldChange = (index: number, field: keyof IncomingItem, val: any) => {
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
      { itemId: '', itemName: '', qty: 1, unit: 'PCS', prNumber: '', poNumber: '' },
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

    if (!date) {
      setErrorMessage('Tanggal kedatangan wajib diisi.');
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
      const newSubmission: IncomingSubmission = {
        id: `IN-${Date.now().toString().slice(-6)}`,
        date,
        items: items.map((it) => ({
          ...it,
          qty: Number(it.qty),
          prNumber: it.prNumber?.trim() || '',
          poNumber: it.poNumber?.trim() || '',
        })),
        createdAt: new Date().toISOString(),
      };

      saveIncoming(newSubmission);
      const syncResult = await syncIncomingToSheet(newSubmission);

      setSuccessMessage(
        `Kedatangan barang berhasil dicatat! ID: ${newSubmission.id} (${syncResult.message})`
      );

      // Reset items back to 1 empty item
      setItems([{ itemId: '', itemName: '', qty: 1, unit: 'PCS', prNumber: '', poNumber: '' }]);
      onDataChanged();
    } catch (err: any) {
      setErrorMessage('Gagal menyimpan: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-2">
      <div className="bg-white border-2 border-stone-800 rounded-3xl p-4 sm:p-7 shadow-lg">
        {/* Header Title */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-stone-200 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg leading-tight">
              FORM KEDATANGAN BARANG
            </h3>
            <p className="text-xs text-stone-500">
              Input material, kawat, sparepart atau barang masuk ke gudang
            </p>
          </div>
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
              Tanggal Kedatangan :
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-800 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              required
            />
          </div>

          {/* List of Incoming Items */}
          <div className="space-y-3 pt-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-stone-50/80 border-2 border-stone-800 rounded-2xl p-3.5 sm:p-4 shadow-xs relative"
              >
                {/* Header item index */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="inline-block px-3 py-0.5 bg-emerald-200 border border-stone-800 text-stone-900 text-xs font-bold rounded-lg">
                    Item Masuk {index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-stone-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Nama Barang (Search) */}
                <div className="mb-2.5">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Nama Barang :
                  </label>
                  <SearchableSelect
                    options={itemOptions}
                    value={item.itemId}
                    onChange={(val) => handleItemSelect(index, val)}
                    placeholder="Cari / Pilih nama barang..."
                    searchPlaceholder="Ketik nama atau kode barang..."
                    allowCustom={true}
                  />
                </div>

                {/* Qty & Satuan */}
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Qty Masuk :
                    </label>
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
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-800 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Satuan :
                    </label>
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

                {/* No P.R. & No P.O. (Tidak wajib isi) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-stone-200/80">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      No P.R. <span className="text-stone-400 font-normal">(tidak wajib isi)</span>
                    </label>
                    <input
                      type="text"
                      value={item.prNumber}
                      onChange={(e) => handleFieldChange(index, 'prNumber', e.target.value)}
                      placeholder="Contoh: PR-2026-10-09"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      No P.O. <span className="text-stone-400 font-normal">(tidak wajib isi)</span>
                    </label>
                    <input
                      type="text"
                      value={item.poNumber}
                      onChange={(e) => handleFieldChange(index, 'poNumber', e.target.value)}
                      placeholder="Contoh: PO-KMI-8890"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons Box */}
          <div className="bg-stone-100 border border-stone-300 rounded-2xl p-3 sm:p-4 space-y-3 mt-4">
            {/* + Tambah Barang */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 sm:py-3 bg-emerald-200 hover:bg-emerald-300 text-stone-900 font-extrabold text-sm sm:text-base border-2 border-stone-800 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>+ Tambah barang</span>
            </button>

            {/* SIMPAN */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base tracking-wider uppercase border-2 border-stone-900 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN KEDATANGAN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
