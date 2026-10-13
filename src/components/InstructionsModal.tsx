import React from 'react';
import { X, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#fbf7ee] border-2 border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-stone-800 bg-white">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <h3 className="font-extrabold text-stone-900 text-base">
              Petunjuk Pengisian Form & Sistem
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-700">
          <div className="bg-white border border-stone-300 rounded-2xl p-3.5 space-y-2">
            <div className="font-extrabold text-stone-900 flex items-center gap-1.5 text-sm">
              <span className="w-5 h-5 rounded-full bg-stone-800 text-white text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              Form Pengambilan & Pemakaian Barang (Web 1)
            </div>
            <ul className="space-y-1.5 text-xs text-stone-600 pl-2">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Tanggal:</strong> Terisi otomatis tanggal hari ini atau sesuaikan bila diperlukan.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Mesin:</strong> Pilih atau ketik nomor mesin / line kerja yang menggunakan barang.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Nama Pengambil:</strong> Masukkan nama operator atau teknisi pengambil barang.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Nama Barang & Qty:</strong> Cari barang dari kotak pencarian. Sisa stok di gudang akan otomatis terlihat.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>+ Tambah Barang:</strong> Jika mengambil lebih dari 1 macam barang, klik tombol hijau untuk menambah baris.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>SIMPAN:</strong> Klik tombol biru untuk menyimpan data dan memperbarui stok seketika.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-stone-300 rounded-2xl p-3.5 space-y-2">
            <div className="font-extrabold text-stone-900 flex items-center gap-1.5 text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] flex items-center justify-center font-bold">
                2
              </span>
              Web 2: Kedatangan, Cek Stok, & No PO/PR
            </div>
            <ul className="space-y-1.5 text-xs text-stone-600 pl-2">
              <li className="flex items-start gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <span><strong>Menu 1 (Input Barang):</strong> Catat kedatangan barang masuk dari supplier dengan opsi nomor PR dan PO.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <span><strong>Menu 2 (Stok Qty Barang):</strong> Cek sisa stok mingguan, cari barang di kolom atas, dan edit jumlah stok langsung pada baris tabel.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <span><strong>Menu 3 (Update PO & PR):</strong> Download Excel data kedatangan, lalu unggah kembali untuk memperbarui nomor PO/PR massal.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-300 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Mengerti, Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
