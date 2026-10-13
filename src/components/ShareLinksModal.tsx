import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Boxes,
  QrCode,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface ShareLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
}

export const ShareLinksModal: React.FC<ShareLinksModalProps> = ({
  isOpen,
  onClose,
  baseUrl,
}) => {
  const [copiedWeb1, setCopiedWeb1] = useState(false);
  const [copiedWeb2, setCopiedWeb2] = useState(false);
  const [activeQr, setActiveQr] = useState<'web1' | 'web2' | null>(null);

  if (!isOpen) return null;

  // Clean base URL without existing hash or query
  const cleanBase = baseUrl.split('#')[0].split('?')[0];
  const web1Url = `${cleanBase}?app=web1#web1`;
  const web2Url = `${cleanBase}?app=web2#web2`;

  const copyToClipboard = (text: string, type: 'web1' | 'web2') => {
    navigator.clipboard.writeText(text);
    if (type === 'web1') {
      setCopiedWeb1(true);
      setTimeout(() => setCopiedWeb1(false), 2500);
    } else {
      setCopiedWeb2(true);
      setTimeout(() => setCopiedWeb2(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#fbf7ee] border-2 border-stone-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-stone-800 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 border border-amber-300 rounded-xl text-amber-800">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                Tautan / Link Terpisah Web 1 & Web 2
              </h2>
              <p className="text-xs text-stone-500">
                1 Database Spreadsheet yang sama, 2 Tautan khusus untuk kebutuhan berbeda
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="bg-sky-50 border border-sky-300 rounded-2xl p-3 text-xs text-sky-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <strong>Ya, Anda dapat membagikan 2 link terpisah!</strong> Link Web 1 dapat dibagikan khusus ke operator HP di area produksi, sedangkan Link Web 2 disimpan oleh admin/gudang untuk kontrol stok dan PO/PR.
            </div>
          </div>

          {/* CARD 1: LINK WEB 1 (Form Pengambilan) */}
          <div className="bg-white border-2 border-stone-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 font-bold">
                  <Smartphone className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">
                    Link Web 1: Form Pengambilan Barang (KMI1)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Khusus operator pabrik & teknisi mesin (tampilan ramah HP)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                KMI1
              </span>
            </div>

            {/* URL Box */}
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-300 font-mono text-xs text-stone-700 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{web1Url}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => copyToClipboard(web1Url, 'web1')}
                className="flex-1 py-2 px-3 bg-[#93c5fd] hover:bg-[#7bc0fc] text-stone-950 font-bold text-xs rounded-xl border border-stone-800 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedWeb1 ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                <span>{copiedWeb1 ? 'Link Tersalin!' : 'Salin Link Web 1'}</span>
              </button>

              <a
                href={web1Url}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di Tab Baru</span>
              </a>

              <button
                type="button"
                onClick={() => setActiveQr(activeQr === 'web1' ? null : 'web1')}
                className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
            </div>

            {/* QR Code Display */}
            {activeQr === 'web1' && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-300 text-center space-y-2 animate-in fade-in">
                <div className="text-xs font-bold text-stone-700">Scan QR Code dengan Kamera HP:</div>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(web1Url)}`}
                  alt="QR Web 1"
                  className="mx-auto w-36 h-36 bg-white p-2 rounded-lg border border-stone-200 shadow-xs"
                />
                <p className="text-[11px] text-stone-500">
                  Dapat dicetak dan ditempel di dekat mesin produksi atau pintu gudang.
                </p>
              </div>
            )}
          </div>

          {/* CARD 2: LINK WEB 2 (Portal Gudang & Stok) */}
          <div className="bg-white border-2 border-stone-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold">
                  <Boxes className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">
                    Link Web 2: Kedatangan, Stok Qty & PO/PR (KMI2)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Khusus admin logistik, kepala gudang, dan tim purchasing
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                KMI2
              </span>
            </div>

            {/* URL Box */}
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-300 font-mono text-xs text-stone-700 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{web2Url}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => copyToClipboard(web2Url, 'web2')}
                className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl border border-stone-900 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedWeb2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedWeb2 ? 'Link Tersalin!' : 'Salin Link Web 2'}</span>
              </button>

              <a
                href={web2Url}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di Tab Baru</span>
              </a>

              <button
                type="button"
                onClick={() => setActiveQr(activeQr === 'web2' ? null : 'web2')}
                className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
            </div>

            {/* QR Code Display */}
            {activeQr === 'web2' && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-300 text-center space-y-2 animate-in fade-in">
                <div className="text-xs font-bold text-stone-700">Scan QR Code Web 2:</div>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(web2Url)}`}
                  alt="QR Web 2"
                  className="mx-auto w-36 h-36 bg-white p-2 rounded-lg border border-stone-200 shadow-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-300 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
