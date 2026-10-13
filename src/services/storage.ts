import * as XLSX from 'xlsx';
import {
  MasterItem,
  UnitOption,
  WithdrawalSubmission,
  IncomingSubmission,
  StockSummaryItem,
  SheetSettings
} from '../types/inventory';

const STORAGE_KEYS = {
  MASTER_ITEMS: 'kmi_master_items_v1',
  UNITS: 'kmi_units_v1',
  WITHDRAWALS: 'kmi_withdrawals_v1',
  INCOMING: 'kmi_incoming_v1',
  STOCK_ADJUSTMENTS: 'kmi_stock_adjustments_v1',
  SETTINGS: 'kmi_sheet_settings_v1',
};

export const DEFAULT_UNITS: UnitOption[] = [
  { value: 'PCS', label: 'PCS (Pieces)' },
  { value: 'KG', label: 'KG (Kilogram)' },
  { value: 'LITER', label: 'LITER' },
  { value: 'ROLL', label: 'ROLL' },
  { value: 'BOX', label: 'BOX' },
  { value: 'PASANG', label: 'PASANG' },
  { value: 'CAN', label: 'CAN / KALENG' },
  { value: 'METER', label: 'METER' },
  { value: 'DRUM', label: 'DRUM' },
  { value: 'SET', label: 'SET' },
];

export const DEFAULT_MACHINES: string[] = [
  'EXTRUDER EX-01 (Sheathing)',
  'EXTRUDER EX-02 (Insulation)',
  'CABLING CB-01 (Multi-core)',
  'STRANDING ST-01 (Conductor)',
  'WIRE DRAWING DW-01 (Rod to Wire)',
  'WIRE DRAWING DW-02 (Intermediate)',
  'ARMORING AR-01 (Steel Tape/Wire)',
  'REWINDING RW-01 (Take-up)',
  'LAB & QUALITY TESTING',
  'WORKSHOP & UTILITY',
];

export const INITIAL_MASTER_ITEMS: MasterItem[] = [
  {
    id: 'itm-01',
    code: 'RM-CU-001',
    name: 'Tembaga Rod 8mm Cu-ETP',
    category: 'Raw Material',
    defaultUnit: 'KG',
    minStock: 500,
    initialStock: 1250,
  },
  {
    id: 'itm-02',
    code: 'RM-AL-002',
    name: 'Kawat Aluminium 2.5mm EC Grade',
    category: 'Raw Material',
    defaultUnit: 'KG',
    minStock: 300,
    initialStock: 800,
  },
  {
    id: 'itm-03',
    code: 'RM-PVC-003',
    name: 'PVC Compound Jacket Hitam T-70',
    category: 'Polimer / Kimia',
    defaultUnit: 'KG',
    minStock: 400,
    initialStock: 950,
  },
  {
    id: 'itm-04',
    code: 'RM-XLPE-004',
    name: 'XLPE Insulation Compound Natural 90C',
    category: 'Polimer / Kimia',
    defaultUnit: 'KG',
    minStock: 350,
    initialStock: 620,
  },
  {
    id: 'itm-05',
    code: 'SP-DIE-005',
    name: 'Dies Tungsten Carbide Wire Drawing 1.35mm',
    category: 'Sparepart Mesin',
    defaultUnit: 'PCS',
    minStock: 5,
    initialStock: 18,
  },
  {
    id: 'itm-06',
    code: 'SP-BLD-006',
    name: 'Cutter Blade Rotary Mesin Extruder',
    category: 'Sparepart Mesin',
    defaultUnit: 'PCS',
    minStock: 10,
    initialStock: 24,
  },
  {
    id: 'itm-07',
    code: 'MN-OIL-007',
    name: 'Oli Hidrolik Shell Tellus S2 MX 68',
    category: 'Minyak & Pelumas',
    defaultUnit: 'LITER',
    minStock: 50,
    initialStock: 180,
  },
  {
    id: 'itm-08',
    code: 'MN-GRS-008',
    name: 'Grease Bearing High Temp EP-2',
    category: 'Minyak & Pelumas',
    defaultUnit: 'CAN',
    minStock: 4,
    initialStock: 12,
  },
  {
    id: 'itm-09',
    code: 'PC-TAPE-009',
    name: 'Pita Tembaga / Copper Screening Tape 0.1x20mm',
    category: 'Material Pembantu',
    defaultUnit: 'ROLL',
    minStock: 20,
    initialStock: 45,
  },
  {
    id: 'itm-10',
    code: 'PC-MICA-010',
    name: 'Mica Glass Tape Fire Resistant 0.14mm',
    category: 'Material Pembantu',
    defaultUnit: 'ROLL',
    minStock: 15,
    initialStock: 38,
  },
  {
    id: 'itm-11',
    code: 'K3-GLV-011',
    name: 'Sarung Tangan Bintik Katun 7-Benang K3',
    category: 'Perlengkapan K3',
    defaultUnit: 'PASANG',
    minStock: 30,
    initialStock: 85,
  },
  {
    id: 'itm-12',
    code: 'K3-MSK-012',
    name: 'Masker Partikulat N95 Dust Protection',
    category: 'Perlengkapan K3',
    defaultUnit: 'BOX',
    minStock: 8,
    initialStock: 22,
  },
  {
    id: 'itm-13',
    code: 'UT-MJN-013',
    name: 'Kain Majun Pembersih Mesin Putih Bersih',
    category: 'Kebersihan Pabrik',
    defaultUnit: 'KG',
    minStock: 25,
    initialStock: 65,
  },
  {
    id: 'itm-14',
    code: 'UT-LAK-014',
    name: 'Lakban Bening Packaging 2 Inch Daimaru',
    category: 'Packing & Logistik',
    defaultUnit: 'ROLL',
    minStock: 12,
    initialStock: 34,
  },
  {
    id: 'itm-15',
    code: 'SP-RLR-015',
    name: 'Ceramic Guide Pulley Wire 80mm',
    category: 'Sparepart Mesin',
    defaultUnit: 'PCS',
    minStock: 6,
    initialStock: 14,
  },
  {
    id: 'itm-16',
    code: 'PK-BOB-016',
    name: 'Wooden Spool Bobbin Flange 630mm',
    category: 'Packing & Logistik',
    defaultUnit: 'PCS',
    minStock: 10,
    initialStock: 20,
  },
];

export const INITIAL_WITHDRAWALS: WithdrawalSubmission[] = [
  {
    id: 'OUT-2026-001',
    date: '2026-10-12',
    machine: 'EXTRUDER EX-01 (Sheathing)',
    requesterName: 'Budi Santoso',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    items: [
      {
        itemId: 'itm-03',
        itemName: 'PVC Compound Jacket Hitam T-70',
        qty: 120,
        unit: 'KG',
        notes: 'Produksi Kabel NYY 4x16mm batch #21'
      },
      {
        itemId: 'itm-07',
        itemName: 'Oli Hidrolik Shell Tellus S2 MX 68',
        qty: 10,
        unit: 'LITER',
        notes: 'Top-up oli hidrolik gearbox feeding'
      }
    ],
    syncedToSheet: true,
  },
  {
    id: 'OUT-2026-002',
    date: '2026-10-13',
    machine: 'WIRE DRAWING DW-01 (Rod to Wire)',
    requesterName: 'Agus Priyono',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    items: [
      {
        itemId: 'itm-05',
        itemName: 'Dies Tungsten Carbide Wire Drawing 1.35mm',
        qty: 2,
        unit: 'PCS',
        notes: 'Penggantian dies aus jalur 3 & 4'
      },
      {
        itemId: 'itm-11',
        itemName: 'Sarung Tangan Bintik Katun 7-Benang K3',
        qty: 5,
        unit: 'PASANG',
        notes: 'Pemakaian tim shift pagi operator'
      }
    ],
    syncedToSheet: true,
  }
];

export const INITIAL_INCOMING: IncomingSubmission[] = [
  {
    id: 'IN-2026-001',
    date: '2026-10-10',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    items: [
      {
        itemId: 'itm-01',
        itemName: 'Tembaga Rod 8mm Cu-ETP',
        qty: 500,
        unit: 'KG',
        prNumber: 'PR-2026-09-088',
        poNumber: 'PO-KMI-8812',
      },
      {
        itemId: 'itm-03',
        itemName: 'PVC Compound Jacket Hitam T-70',
        qty: 300,
        unit: 'KG',
        prNumber: 'PR-2026-09-089',
        poNumber: 'PO-KMI-8815',
      }
    ],
    syncedToSheet: true,
  },
  {
    id: 'IN-2026-002',
    date: '2026-10-12',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    items: [
      {
        itemId: 'itm-05',
        itemName: 'Dies Tungsten Carbide Wire Drawing 1.35mm',
        qty: 5,
        unit: 'PCS',
        prNumber: 'PR-2026-10-012',
        poNumber: '', // Menunggu update PO di Menu 3
      },
      {
        itemId: 'itm-08',
        itemName: 'Grease Bearing High Temp EP-2',
        qty: 4,
        unit: 'CAN',
        prNumber: '', // Menunggu PR & PO di Menu 3
        poNumber: '',
      }
    ],
    syncedToSheet: false,
  }
];

// Helper Storage Getters & Setters
export const getMasterItems = (): MasterItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER_ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MASTER_ITEMS, JSON.stringify(INITIAL_MASTER_ITEMS));
      return INITIAL_MASTER_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MASTER_ITEMS;
  }
};

export const saveMasterItems = (items: MasterItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.MASTER_ITEMS, JSON.stringify(items));
};

export const getUnits = (): UnitOption[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNITS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(DEFAULT_UNITS));
      return DEFAULT_UNITS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_UNITS;
  }
};

export const saveUnits = (units: UnitOption[]): void => {
  localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
};

export const getWithdrawals = (): WithdrawalSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(INITIAL_WITHDRAWALS));
      return INITIAL_WITHDRAWALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WITHDRAWALS;
  }
};

export const saveWithdrawal = (submission: WithdrawalSubmission): void => {
  const current = getWithdrawals();
  const updated = [submission, ...current];
  localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(updated));
};

export const getIncoming = (): IncomingSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INCOMING);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INCOMING, JSON.stringify(INITIAL_INCOMING));
      return INITIAL_INCOMING;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INCOMING;
  }
};

export const saveIncoming = (submission: IncomingSubmission): void => {
  const current = getIncoming();
  const updated = [submission, ...current];
  localStorage.setItem(STORAGE_KEYS.INCOMING, JSON.stringify(updated));
};

// Stock Adjustments Map (manual row edits)
export const getStockAdjustments = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STOCK_ADJUSTMENTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setStockAdjustment = (itemId: string, adjustment: number): void => {
  const current = getStockAdjustments();
  current[itemId] = adjustment;
  localStorage.setItem(STORAGE_KEYS.STOCK_ADJUSTMENTS, JSON.stringify(current));
};

// Compute Dynamic Stock Summary
export const getStockSummary = (): StockSummaryItem[] => {
  const master = getMasterItems();
  const withdrawals = getWithdrawals();
  const incoming = getIncoming();
  const adjustments = getStockAdjustments();

  // Sum incoming per item
  const incomingMap: Record<string, number> = {};
  incoming.forEach(inc => {
    inc.items.forEach(item => {
      const key = item.itemId || item.itemName;
      incomingMap[key] = (incomingMap[key] || 0) + Number(item.qty || 0);
    });
  });

  // Sum outgoing per item
  const outgoingMap: Record<string, number> = {};
  withdrawals.forEach(w => {
    w.items.forEach(item => {
      const key = item.itemId || item.itemName;
      outgoingMap[key] = (outgoingMap[key] || 0) + Number(item.qty || 0);
    });
  });

  return master.map(item => {
    const key = item.id;
    const keyName = item.name;
    const totalInc = (incomingMap[key] || 0) + (incomingMap[keyName] || 0);
    const totalOut = (outgoingMap[key] || 0) + (outgoingMap[keyName] || 0);
    const manualAdj = adjustments[item.id] !== undefined ? adjustments[item.id] : 0;
    const calculatedCurrent = item.initialStock + totalInc - totalOut + manualAdj;

    return {
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.defaultUnit,
      initialStock: item.initialStock,
      totalIncoming: totalInc,
      totalOutgoing: totalOut,
      manualAdjustment: manualAdj,
      currentStock: Math.max(0, calculatedCurrent),
      minStock: item.minStock,
      lastUpdated: new Date().toLocaleDateString('id-ID'),
    };
  });
};

// Inline Edit: Set absolute physical stock for an item
export const setAbsoluteStock = (itemId: string, newTotalStock: number): void => {
  const master = getMasterItems();
  const withdrawals = getWithdrawals();
  const incoming = getIncoming();

  const item = master.find(m => m.id === itemId);
  if (!item) return;

  const totalInc = incoming.reduce((acc, inc) => {
    return acc + inc.items
      .filter(i => i.itemId === itemId || i.itemName === item.name)
      .reduce((sum, i) => sum + Number(i.qty || 0), 0);
  }, 0);

  const totalOut = withdrawals.reduce((acc, w) => {
    return acc + w.items
      .filter(i => i.itemId === itemId || i.itemName === item.name)
      .reduce((sum, i) => sum + Number(i.qty || 0), 0);
  }, 0);

  const baseCalculated = item.initialStock + totalInc - totalOut;
  const neededAdjustment = newTotalStock - baseCalculated;
  setStockAdjustment(itemId, neededAdjustment);
};

// Update PO and PR for incoming record item
export const updateIncomingPOPR = (
  submissionId: string,
  itemIndex: number,
  prNumber?: string,
  poNumber?: string
): void => {
  const list = getIncoming();
  const targetSub = list.find(s => s.id === submissionId);
  if (targetSub && targetSub.items[itemIndex]) {
    if (prNumber !== undefined) targetSub.items[itemIndex].prNumber = prNumber.trim();
    if (poNumber !== undefined) targetSub.items[itemIndex].poNumber = poNumber.trim();
    localStorage.setItem(STORAGE_KEYS.INCOMING, JSON.stringify(list));
  }
};

// Sheet Settings
export const DEFAULT_SHEET_SETTINGS: SheetSettings = {
  mode: 'demo',
  spreadsheetId: '',
  webhookUrl: '',
  masterSheetName: 'Master_Barang',
  incomingSheetName: 'Kedatangan_Barang',
  withdrawalSheetName: 'Pengambilan_Barang',
  stockSheetName: 'Stok_Barang',
};

export const getSheetSettings = (): SheetSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SHEET_SETTINGS));
      return DEFAULT_SHEET_SETTINGS;
    }
    return { ...DEFAULT_SHEET_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SHEET_SETTINGS;
  }
};

export const saveSheetSettings = (settings: SheetSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Export to Excel / CSV utilities
export const exportIncomingToExcel = () => {
  const incoming = getIncoming();
  const rows: any[] = [];

  incoming.forEach(sub => {
    sub.items.forEach((item, idx) => {
      rows.push({
        'ID Transaksi': sub.id,
        'Item Index': idx + 1,
        'Tanggal': sub.date,
        'Nama Barang': item.itemName,
        'Qty': item.qty,
        'Satuan': item.unit,
        'No PR': item.prNumber || '',
        'No PO': item.poNumber || '',
        'Status': item.poNumber ? 'Lengkap (PO Ada)' : (item.prNumber ? 'Menunggu PO' : 'Draft Belum Ada PR/PO')
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kedatangan_PO_PR');
  XLSX.writeFile(wb, `KMI_Kedatangan_PO_PR_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportStockToExcel = () => {
  const stock = getStockSummary();
  const rows = stock.map(s => ({
    'Kode Barang': s.code,
    'Nama Barang': s.name,
    'Kategori': s.category,
    'Satuan': s.unit,
    'Stok Awal': s.initialStock,
    'Total Masuk': s.totalIncoming,
    'Total Keluar': s.totalOutgoing,
    'Penyesuaian': s.manualAdjustment,
    'Sisa Stok Terkini': s.currentStock,
    'Stok Minimum': s.minStock,
    'Status': s.currentStock <= s.minStock ? 'KRITIS / PERLU ORDER' : 'AMAN',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stok_Qty_Barang');
  XLSX.writeFile(wb, `KMI_Stok_Qty_Barang_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportMasterItemsToExcel = () => {
  const master = getMasterItems();
  const rows = master.map(m => ({
    'Kode Barang': m.code,
    'Nama Barang': m.name,
    'Kategori': m.category,
    'Satuan Standar': m.defaultUnit,
    'Stok Awal': m.initialStock,
    'Stok Minimum': m.minStock,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Master_Barang');
  XLSX.writeFile(wb, `KMI_Master_Barang_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const parseIncomingImportExcel = async (file: File): Promise<{
  successCount: number;
  errors: string[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet);

        let successCount = 0;
        const errors: string[] = [];
        const incomingList = getIncoming();

        json.forEach((row, rowIdx) => {
          const transId = row['ID Transaksi'] || row['ID'] || row['id'];
          const itemIdx = (row['Item Index'] !== undefined) ? Number(row['Item Index']) - 1 : 0;
          const pr = row['No PR'] || row['PR'] || row['prNumber'];
          const po = row['No PO'] || row['PO'] || row['poNumber'];
          const itemName = row['Nama Barang'] || row['Barang'];

          if (transId) {
            const target = incomingList.find(i => i.id === transId);
            if (target && target.items[itemIdx]) {
              if (pr !== undefined) target.items[itemIdx].prNumber = String(pr).trim();
              if (po !== undefined) target.items[itemIdx].poNumber = String(po).trim();
              successCount++;
            } else if (target && itemName) {
              const matchedItem = target.items.find(i => i.itemName.toLowerCase() === String(itemName).toLowerCase());
              if (matchedItem) {
                if (pr !== undefined) matchedItem.prNumber = String(pr).trim();
                if (po !== undefined) matchedItem.poNumber = String(po).trim();
                successCount++;
              }
            } else {
              errors.push(`Baris ${rowIdx + 2}: ID Transaksi "${transId}" tidak ditemukan.`);
            }
          } else if (itemName) {
            // Match by item name in pending items without PO
            let matched = false;
            for (const sub of incomingList) {
              const item = sub.items.find(i => i.itemName.toLowerCase().includes(String(itemName).toLowerCase()) && !i.poNumber);
              if (item) {
                if (pr !== undefined) item.prNumber = String(pr).trim();
                if (po !== undefined) item.poNumber = String(po).trim();
                matched = true;
                successCount++;
                break;
              }
            }
            if (!matched) {
              errors.push(`Baris ${rowIdx + 2}: Tidak ada item "${itemName}" yang pending update PO.`);
            }
          }
        });

        localStorage.setItem(STORAGE_KEYS.INCOMING, JSON.stringify(incomingList));
        resolve({ successCount, errors });
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
