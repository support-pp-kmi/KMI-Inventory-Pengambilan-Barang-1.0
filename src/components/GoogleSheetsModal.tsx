import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Link2,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Download,
  Upload,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { SheetSettings, MasterItem, UnitOption } from '../types/inventory';
import {
  APPS_SCRIPT_TEMPLATE,
  fetchMasterItemsFromSheet,
} from '../services/googleSheets';
import {
  saveSheetSettings,
  saveMasterItems,
  saveUnits,
  exportMasterItemsToExcel,
} from '../services/storage';
import { googleSignIn, logoutGoogle, auth } from '../services/firebase';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SheetSettings;
  masterItems: MasterItem[];
  units: UnitOption[];
  onSettingsSaved: (settings: SheetSettings) => void;
  onDataChanged: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  settings,
  masterItems,
  units,
  onSettingsSaved,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'CONNECT' | 'MASTER_ITEMS' | 'SCRIPT'>('CONNECT');
  const [formData, setFormData] = useState<SheetSettings>({ ...settings });
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // New item modal state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Raw Material');
  const [newItemUnit, setNewItemUnit] = useState('KG');
  const [newItemStock, setNewItemStock] = useState('100');
  const [newItemMin, setNewItemMin] = useState('20');
  const [showAddForm, setShowAddForm] = useState(false);

  // New unit state
  const [newUnitVal, setNewUnitVal] = useState('');

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleSaveConnection = () => {
    saveSheetSettings(formData);
    onSettingsSaved(formData);
    setSyncStatus('Pengaturan koneksi berhasil disimpan.');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setFormData((prev) => ({ ...prev, mode: 'oauth' }));
        setSyncStatus(`Terhubung dengan Google Akun: ${res.user.email}`);
      }
    } catch (err: any) {
      alert('Login Google dibatalkan atau gagal: ' + err.message);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setSyncStatus('Berhasil logout dari akun Google.');
  };

  const handleSyncMasterFromSheet = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const items = await fetchMasterItemsFromSheet();
      if (items && items.length > 0) {
        saveMasterItems(items);
        onDataChanged();
        setSyncStatus(`Berhasil menyinkronkan ${items.length} master barang dari Google Sheet!`);
      } else {
        setSyncStatus('Belum ada data di sheet "Master_Barang" atau periksa konfigurasi.');
      }
    } catch (err: any) {
      setSyncStatus('Gagal membaca sheet: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const code = newItemCode.trim() || `KMI-${(masterItems.length + 1).toString().padStart(3, '0')}`;
    const newItem: MasterItem = {
      id: `itm-${Date.now()}`,
      code,
      name: newItemName.trim(),
      category: newItemCategory,
      defaultUnit: newItemUnit,
      initialStock: parseFloat(newItemStock) || 0,
      minStock: parseFloat(newItemMin) || 0,
    };

    const updated = [...masterItems, newItem];
    saveMasterItems(updated);
    onDataChanged();

    setNewItemName('');
    setNewItemCode('');
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Hapus barang ini dari daftar master barang?')) {
      const updated = masterItems.filter((i) => i.id !== id);
      saveMasterItems(updated);
      onDataChanged();
    }
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitVal.trim()) return;
    const val = newUnitVal.trim().toUpperCase();
    if (units.some((u) => u.value === val)) {
      alert('Satuan sudah ada di daftar.');
      return;
    }
    const updated = [...units, { value: val, label: val }];
    saveUnits(updated);
    onDataChanged();
    setNewUnitVal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#fbf7ee] border-2 border-stone-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-stone-800 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                Integrasi 1 Spreadsheet & Master Barang
              </h2>
              <p className="text-xs text-stone-500">
                PT KMI Wire and Cable Tbk — Manajemen Sinkronisasi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-300 bg-stone-100/80 px-4 pt-2 text-xs sm:text-sm font-bold gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('CONNECT')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'CONNECT'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Koneksi Google Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MASTER_ITEMS')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'MASTER_ITEMS'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Barang & Satuan ({masterItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SCRIPT')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'SCRIPT'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Kode Apps Script</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {syncStatus && (
            <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-950 rounded-xl text-xs sm:text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* TAB 1: KONEKSI SPREADSHEET */}
          {activeTab === 'CONNECT' && (
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Opsi 1: Google Apps Script Webhook (Paling Direkomendasikan untuk Pabrik) */}
              <div className="bg-white border-2 border-stone-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">
                      1
                    </span>
                    Koneksi Otomatis Google Apps Script (Web App URL)
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    Sangat Direkomendasikan
                  </span>
                </div>
                <p className="text-xs text-stone-600 mb-3">
                  Operator di lapangan bisa langsung input form dari HP tanpa perlu login akun Google berulang kali. Data langsung terisi rapi ke tab sheet: <strong>Pengambilan_Barang</strong>, <strong>Kedatangan_Barang</strong>, dan <strong>Master_Barang</strong>.
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    URL Google Apps Script Web App :
                  </label>
                  <input
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span>Belum punya URL Apps Script?</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('SCRIPT')}
                      className="text-emerald-700 font-bold underline cursor-pointer"
                    >
                      Lihat Cara Pasang & Salin Kode Script →
                    </button>
                  </div>
                </div>
              </div>

              {/* Opsi 2: Direct Google Sheets API OAuth */}
              <div className="bg-white border-2 border-stone-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] flex items-center justify-center font-bold">
                      2
                    </span>
                    Koneksi Langsung via Akun Google (OAuth Sheets API)
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="text-xs">
                      <div className="font-bold text-stone-800">Status Akun Google:</div>
                      <div className="text-stone-600">
                        {auth.currentUser ? auth.currentUser.email : 'Belum Login'}
                      </div>
                    </div>
                    {auth.currentUser ? (
                      <button
                        type="button"
                        onClick={handleGoogleLogout}
                        className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Logout
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-400 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <img
                          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                          alt="Google"
                          className="w-4 h-4"
                        />
                        <span>Sign in Google</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Spreadsheet ID :
                    </label>
                    <input
                      type="text"
                      value={formData.spreadsheetId}
                      onChange={(e) => setFormData({ ...formData, spreadsheetId: e.target.value })}
                      placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      ID ada di URL spreadsheet Anda: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveConnection}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl border border-stone-900 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Pengaturan Koneksi</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncMasterFromSheet}
                  disabled={isSyncing || (!formData.webhookUrl && !formData.spreadsheetId)}
                  className="py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs sm:text-sm rounded-xl border border-stone-800 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Tarik Master Barang dari Sheet</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MASTER BARANG & SATUAN */}
          {activeTab === 'MASTER_ITEMS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">
                    Daftar Nama Barang & Satuan
                  </h3>
                  <p className="text-xs text-stone-500">
                    Dikelola dalam sheet terpisah <strong>Master_Barang</strong> di spreadsheet Anda.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportMasterItemsToExcel}
                    className="px-3 py-1.5 bg-white border border-stone-800 hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Barang</span>
                  </button>
                </div>
              </div>

              {/* Form Tambah Barang Baru */}
              {showAddForm && (
                <form
                  onSubmit={handleAddNewItem}
                  className="bg-white border-2 border-stone-800 rounded-2xl p-3.5 space-y-3 shadow-xs animate-in fade-in"
                >
                  <div className="font-bold text-xs text-stone-900">Input Barang Baru:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-0.5">Nama Barang :</label>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Contoh: Isolasi PVC 19mm Biru"
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-0.5">Kode Barang :</label>
                      <input
                        type="text"
                        value={newItemCode}
                        onChange={(e) => setNewItemCode(e.target.value)}
                        placeholder="KMI-..."
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-0.5">Kategori :</label>
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className="w-full px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                      >
                        <option value="Raw Material">Raw Material</option>
                        <option value="Polimer / Kimia">Polimer / Kimia</option>
                        <option value="Sparepart Mesin">Sparepart Mesin</option>
                        <option value="Minyak & Pelumas">Minyak & Pelumas</option>
                        <option value="Material Pembantu">Material Pembantu</option>
                        <option value="Perlengkapan K3">Perlengkapan K3</option>
                        <option value="Packing & Logistik">Packing & Logistik</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-0.5">Satuan :</label>
                      <select
                        value={newItemUnit}
                        onChange={(e) => setNewItemUnit(e.target.value)}
                        className="w-full px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                      >
                        {units.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-0.5">Stok Awal :</label>
                      <input
                        type="number"
                        value={newItemStock}
                        onChange={(e) => setNewItemStock(e.target.value)}
                        className="w-full px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                    >
                      Simpan Barang
                    </button>
                  </div>
                </form>
              )}

              {/* Tabel Master Barang */}
              <div className="bg-white border border-stone-300 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 sticky top-0">
                    <tr>
                      <th className="p-2">Kode</th>
                      <th className="p-2">Nama Barang</th>
                      <th className="p-2">Kategori</th>
                      <th className="p-2 text-center">Satuan</th>
                      <th className="p-2 text-right">Stok Min</th>
                      <th className="p-2 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {masterItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50">
                        <td className="p-2 font-mono text-stone-600">{item.code}</td>
                        <td className="p-2 font-bold text-stone-900">{item.name}</td>
                        <td className="p-2 text-stone-600">{item.category}</td>
                        <td className="p-2 text-center font-bold text-stone-800">{item.defaultUnit}</td>
                        <td className="p-2 text-right text-stone-600">{item.minStock}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                            title="Hapus item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tambah Satuan */}
              <div className="pt-2 border-t border-stone-200">
                <form onSubmit={handleAddUnit} className="flex items-center gap-2">
                  <div className="text-xs font-bold text-stone-700 shrink-0">Tambah Satuan Baru:</div>
                  <input
                    type="text"
                    value={newUnitVal}
                    onChange={(e) => setNewUnitVal(e.target.value)}
                    placeholder="Contoh: RIM, PACK, BUNDLE"
                    className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    + Tambah
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: KODE APPS SCRIPT */}
          {activeTab === 'SCRIPT' && (
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-emerald-950 text-xs">
                  Kode ini otomatis membuat 4 Sheet di Google Spreadsheet Anda:{' '}
                  <strong>Master_Barang</strong>, <strong>Pengambilan_Barang</strong>,{' '}
                  <strong>Kedatangan_Barang</strong>, dan <strong>Stok_Barang</strong> dengan header warna profesional.
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-bold text-stone-800 text-xs">
                  Script Google Apps Script (Terapkan sebagai Web App):
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode'}</span>
                </button>
              </div>

              <pre className="bg-stone-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed">
                {APPS_SCRIPT_TEMPLATE}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-300 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
