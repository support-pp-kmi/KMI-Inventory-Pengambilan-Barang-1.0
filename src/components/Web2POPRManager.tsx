import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Save,
  Check,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { IncomingSubmission } from '../types/inventory';
import {
  getIncoming,
  updateIncomingPOPR,
  exportIncomingToExcel,
  parseIncomingImportExcel,
} from '../services/storage';

interface Web2POPRManagerProps {
  onDataChanged: () => void;
}

interface FlatIncomingRow {
  submissionId: string;
  itemIndex: number;
  date: string;
  itemName: string;
  qty: number;
  unit: string;
  prNumber: string;
  poNumber: string;
}

export const Web2POPRManager: React.FC<Web2POPRManagerProps> = ({ onDataChanged }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'MISSING_PO' | 'MISSING_PR' | 'COMPLETE'>('ALL');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; errors: string[] } | null>(null);
  const [inlineSavedRow, setInlineSavedRow] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flatten submissions into individual items
  const incomingList = getIncoming();
  const rows: FlatIncomingRow[] = [];
  incomingList.forEach((sub) => {
    sub.items.forEach((item, idx) => {
      rows.push({
        submissionId: sub.id,
        itemIndex: idx,
        date: sub.date,
        itemName: item.itemName,
        qty: item.qty,
        unit: item.unit,
        prNumber: item.prNumber || '',
        poNumber: item.poNumber || '',
      });
    });
  });

  // Local draft state for quick inline typing
  const [draftPOPR, setDraftPOPR] = useState<Record<string, { pr: string; po: string }>>({});

  const getRowKey = (r: FlatIncomingRow) => `${r.submissionId}_${r.itemIndex}`;

  const getDraftValue = (r: FlatIncomingRow) => {
    const key = getRowKey(r);
    return draftPOPR[key] || { pr: r.prNumber, po: r.poNumber };
  };

  const handleDraftChange = (r: FlatIncomingRow, field: 'pr' | 'po', val: string) => {
    const key = getRowKey(r);
    const current = getDraftValue(r);
    setDraftPOPR({
      ...draftPOPR,
      [key]: {
        ...current,
        [field]: val,
      },
    });
  };

  const handleSaveSingleRow = (r: FlatIncomingRow) => {
    const current = getDraftValue(r);
    updateIncomingPOPR(r.submissionId, r.itemIndex, current.pr, current.po);
    const key = getRowKey(r);
    setInlineSavedRow(key);
    setTimeout(() => setInlineSavedRow(null), 2500);
    onDataChanged();
  };

  // Filter rows
  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.submissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.poNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const hasPO = Boolean(r.poNumber && r.poNumber.trim() !== '');
    const hasPR = Boolean(r.prNumber && r.prNumber.trim() !== '');

    if (filterStatus === 'MISSING_PO') return matchesSearch && !hasPO;
    if (filterStatus === 'MISSING_PR') return matchesSearch && !hasPR;
    if (filterStatus === 'COMPLETE') return matchesSearch && hasPO && hasPR;

    return matchesSearch;
  });

  // File import handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await parseIncomingImportExcel(file);
      setImportResult({ count: result.successCount, errors: result.errors });
      onDataChanged();
    } catch (err: any) {
      alert('Gagal memproses file: ' + (err.message || 'Format tidak didukung'));
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Metrics
  const missingPOCount = rows.filter((r) => !r.poNumber).length;
  const missingPRCount = rows.filter((r) => !r.prNumber).length;
  const completeCount = rows.filter((r) => r.poNumber && r.prNumber).length;

  return (
    <div className="space-y-4">
      {/* Top Banner & Action Buttons */}
      <div className="bg-white border-2 border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              MANAJEMEN UPDATE NO PO & PR KEDATANGAN
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola nomor Purchase Request (PR) dan Purchase Order (PO) via Excel/CSV atau edit langsung.
            </p>
          </div>

          {/* Import & Export CTA Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Export Button */}
            <button
              type="button"
              onClick={exportIncomingToExcel}
              className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs sm:text-sm border border-stone-800 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
              title="Download format Excel untuk diisi nomor PO & PR"
            >
              <Download className="w-4 h-4 text-emerald-800" />
              <span>Export Excel</span>
            </button>

            {/* Import Button */}
            <label className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm border border-stone-900 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{isImporting ? 'Mengimpor...' : 'Import Excel / CSV'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-3 gap-2 pt-3">
          <div
            onClick={() => setFilterStatus('MISSING_PO')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filterStatus === 'MISSING_PO'
                ? 'bg-amber-100 border-amber-500 font-bold'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <div className="text-[11px] text-stone-600">Belum Ada PO</div>
            <div className="text-lg font-black text-amber-700">{missingPOCount}</div>
          </div>

          <div
            onClick={() => setFilterStatus('MISSING_PR')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filterStatus === 'MISSING_PR'
                ? 'bg-amber-100 border-amber-500 font-bold'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <div className="text-[11px] text-stone-600">Belum Ada PR</div>
            <div className="text-lg font-black text-amber-700">{missingPRCount}</div>
          </div>

          <div
            onClick={() => setFilterStatus('COMPLETE')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filterStatus === 'COMPLETE'
                ? 'bg-emerald-100 border-emerald-500 font-bold'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <div className="text-[11px] text-stone-600">Lengkap (PO+PR)</div>
            <div className="text-lg font-black text-emerald-800">{completeCount}</div>
          </div>
        </div>
      </div>

      {/* Import Result Notification */}
      {importResult && (
        <div
          className={`p-3.5 rounded-2xl border-2 border-stone-800 shadow-xs ${
            importResult.count > 0 ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Berhasil memperbarui {importResult.count} nomor PO/PR dari file Excel!</span>
          </div>
          {importResult.errors.length > 0 && (
            <div className="mt-2 text-xs text-amber-800">
              <div className="font-semibold mb-1">Catatan verifikasi baris:</div>
              <ul className="list-disc pl-4 space-y-0.5">
                {importResult.errors.slice(0, 4).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border-2 border-stone-800 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID transaksi, nama barang, nomor PR, atau PO..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Semua ({rows.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('MISSING_PO')}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'MISSING_PO'
                ? 'bg-amber-500 text-white'
                : 'bg-stone-100 text-amber-800 hover:bg-stone-200'
            }`}
          >
            Belum PO ({missingPOCount})
          </button>
        </div>
      </div>

      {/* Table of Rows */}
      <div className="bg-white border-2 border-stone-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-100 border-b-2 border-stone-800 text-stone-800 font-extrabold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3">ID & Tgl</th>
                <th className="py-3 px-3">Nama Barang</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-3 min-w-[140px]">No P.R.</th>
                <th className="py-3 px-3 min-w-[140px]">No P.O.</th>
                <th className="py-3 px-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    Tidak ada data kedatangan barang yang cocok.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => {
                  const key = getRowKey(r);
                  const draft = getDraftValue(r);
                  const isSaved = inlineSavedRow === key;
                  const isChanged =
                    draft.pr !== r.prNumber || draft.po !== r.poNumber;

                  return (
                    <tr key={key} className="hover:bg-stone-50/70 transition-colors">
                      {/* ID Transaksi & Tgl */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-stone-900">{r.submissionId}</div>
                        <div className="text-[11px] text-stone-500">{r.date}</div>
                      </td>

                      {/* Nama Barang */}
                      <td className="py-3 px-3 font-semibold text-stone-900">
                        {r.itemName}
                      </td>

                      {/* Qty & Satuan */}
                      <td className="py-3 px-2 text-center whitespace-nowrap font-bold text-stone-800">
                        {r.qty} {r.unit}
                      </td>

                      {/* Input No PR */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={draft.pr}
                          onChange={(e) => handleDraftChange(r, 'pr', e.target.value)}
                          placeholder="Ketik No PR..."
                          className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none transition-colors ${
                            draft.pr
                              ? 'bg-stone-50 border-stone-300 text-stone-900'
                              : 'bg-amber-50/40 border-amber-300 placeholder:text-amber-500'
                          }`}
                        />
                      </td>

                      {/* Input No PO */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={draft.po}
                          onChange={(e) => handleDraftChange(r, 'po', e.target.value)}
                          placeholder="Ketik No PO..."
                          className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none transition-colors ${
                            draft.po
                              ? 'bg-emerald-50/30 border-emerald-400 font-medium text-emerald-950'
                              : 'bg-amber-50/60 border-amber-400 font-medium placeholder:text-amber-600'
                          }`}
                        />
                      </td>

                      {/* Aksi Simpan */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        {isSaved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-300 animate-in fade-in">
                            <Check className="w-3.5 h-3.5" /> Tersimpan
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSaveSingleRow(r)}
                            disabled={!isChanged}
                            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
                              isChanged
                                ? 'bg-sky-600 text-white border-sky-700 hover:bg-sky-700 shadow-xs'
                                : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                            }`}
                            title="Simpan perubahan No PO/PR"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Simpan</span>
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

        {/* Bottom Guide */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px]">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>
              File Excel hasil <strong>Export</strong> dapat diisi oleh bagian purchasing lalu langsung diunggah lewat tombol <strong>Import Excel</strong> untuk pembaruan massal.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
