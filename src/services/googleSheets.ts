import { getAccessToken } from './firebase';
import {
  WithdrawalSubmission,
  IncomingSubmission,
  SheetSettings,
  MasterItem,
} from '../types/inventory';
import { getSheetSettings, getMasterItems } from './storage';

export const APPS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT UNTUK PT KMI WIRE AND CABLE TBK - INVENTARIS SISTEM
 * =========================================================================
 * Cara Pasang:
 * 1. Di Google Spreadsheet Anda, klik menu "Extensions" (Ekstensi) > "Apps Script".
 * 2. Hapus kode default, paste seluruh kode ini.
 * 3. Klik tombol "Deploy" (Terapkan) di kanan atas > "New deployment" (Penerapan baru).
 * 4. Pilih tipe "Web app" (Aplikasi web).
 * 5. Description: "KMI Webhook V1"
 * 6. Execute as: "Me" (Saya)
 * 7. Who has access: "Anyone" (Siapa saja) -> PENTING agar form web app bisa kirim data!
 * 8. Klik "Deploy", beri izin akses Google, lalu copy URL Web App yang dihasilkan.
 * 9. Paste URL tersebut di menu "Koneksi Spreadsheet" di Web App KMI.
 */

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Master_Barang
  let sheetMaster = ss.getSheetByName("Master_Barang");
  if (!sheetMaster) {
    sheetMaster = ss.insertSheet("Master_Barang");
    sheetMaster.appendRow(["Kode Barang", "Nama Barang", "Kategori", "Satuan Standar", "Stok Awal", "Stok Minimum"]);
    sheetMaster.getRange("A1:F1").setBackground("#3b82f6").setFontColor("#ffffff").setFontWeight("bold");
    sheetMaster.setFrozenRows(1);
    sheetMaster.appendRow(["RM-CU-001", "Tembaga Rod 8mm Cu-ETP", "Raw Material", "KG", 1250, 500]);
    sheetMaster.appendRow(["RM-AL-002", "Kawat Aluminium 2.5mm EC Grade", "Raw Material", "KG", 800, 300]);
    sheetMaster.appendRow(["RM-PVC-003", "PVC Compound Jacket Hitam T-70", "Polimer / Kimia", "KG", 950, 400]);
    sheetMaster.appendRow(["SP-DIE-005", "Dies Tungsten Carbide Wire Drawing 1.35mm", "Sparepart Mesin", "PCS", 18, 5]);
    sheetMaster.appendRow(["MN-OIL-007", "Oli Hidrolik Shell Tellus S2 MX 68", "Minyak & Pelumas", "LITER", 180, 50]);
  }

  // 2. Sheet Pengambilan_Barang (Web 1)
  let sheetOut = ss.getSheetByName("Pengambilan_Barang");
  if (!sheetOut) {
    sheetOut = ss.insertSheet("Pengambilan_Barang");
    sheetOut.appendRow(["ID Transaksi", "Tanggal", "Mesin", "Nama Pengambil", "Nama Barang", "Qty", "Satuan", "Keterangan Pemakaian", "Waktu Input"]);
    sheetOut.getRange("A1:I1").setBackground("#ef4444").setFontColor("#ffffff").setFontWeight("bold");
    sheetOut.setFrozenRows(1);
  }

  // 3. Sheet Kedatangan_Barang (Web 2 Menu 1)
  let sheetIn = ss.getSheetByName("Kedatangan_Barang");
  if (!sheetIn) {
    sheetIn = ss.insertSheet("Kedatangan_Barang");
    sheetIn.appendRow(["ID Transaksi", "Tanggal", "Nama Barang", "Qty", "Satuan", "No PR", "No PO", "Waktu Input"]);
    sheetIn.getRange("A1:H1").setBackground("#10b981").setFontColor("#ffffff").setFontWeight("bold");
    sheetIn.setFrozenRows(1);
  }

  // 4. Sheet Stok_Barang (Web 2 Menu 2)
  let sheetStock = ss.getSheetByName("Stok_Barang");
  if (!sheetStock) {
    sheetStock = ss.insertSheet("Stok_Barang");
    sheetStock.appendRow(["Kode Barang", "Nama Barang", "Satuan", "Stok Awal", "Total Masuk", "Total Keluar", "Penyesuaian Fisik", "Sisa Stok Terkini", "Status Stok"]);
    sheetStock.getRange("A1:I1").setBackground("#8b5cf6").setFontColor("#ffffff").setFontWeight("bold");
    sheetStock.setFrozenRows(1);
  }
}

function doPost(e) {
  try {
    setupSheets();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "ADD_WITHDRAWAL") {
      const sheet = ss.getSheetByName("Pengambilan_Barang");
      const sub = data.payload;
      const now = new Date().toLocaleString("id-ID");
      sub.items.forEach(item => {
        sheet.appendRow([
          sub.id,
          sub.date,
          sub.machine,
          sub.requesterName,
          item.itemName,
          item.qty,
          item.unit,
          item.notes || "-",
          now
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Pengambilan tersimpan di Sheet" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "ADD_INCOMING") {
      const sheet = ss.getSheetByName("Kedatangan_Barang");
      const sub = data.payload;
      const now = new Date().toLocaleString("id-ID");
      sub.items.forEach(item => {
        sheet.appendRow([
          sub.id,
          sub.date,
          item.itemName,
          item.qty,
          item.unit,
          item.prNumber || "-",
          item.poNumber || "-",
          now
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Kedatangan barang tersimpan di Sheet" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "UPDATE_PO_PR") {
      const sheet = ss.getSheetByName("Kedatangan_Barang");
      const rows = sheet.getDataRange().getValues();
      const updates = data.payload.updates; // array of { id, itemIndex, prNumber, poNumber }
      let updatedCount = 0;
      updates.forEach(u => {
        for (let r = 1; r < rows.length; r++) {
          if (rows[r][0] === u.id) {
            if (u.prNumber !== undefined) sheet.getRange(r + 1, 6).setValue(u.prNumber);
            if (u.poNumber !== undefined) sheet.getRange(r + 1, 7).setValue(u.poNumber);
            updatedCount++;
            break;
          }
        }
      });
      return ContentService.createTextOutput(JSON.stringify({ success: true, updatedCount }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: "Unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    setupSheets();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetMaster = ss.getSheetByName("Master_Barang");
    const masterRows = sheetMaster.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < masterRows.length; i++) {
      if (masterRows[i][1]) {
        items.push({
          code: masterRows[i][0] || ("KMI-" + i),
          name: masterRows[i][1],
          category: masterRows[i][2] || "Umum",
          defaultUnit: masterRows[i][3] || "PCS",
          initialStock: Number(masterRows[i][4]) || 0,
          minStock: Number(masterRows[i][5]) || 0,
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, items }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

/**
 * Send withdrawal to Google Sheets via Apps Script Webhook or Google Sheets API
 */
export const syncWithdrawalToSheet = async (sub: WithdrawalSubmission): Promise<{ success: boolean; message: string }> => {
  const settings = getSheetSettings();

  // Mode 1: Webhook
  if (settings.webhookUrl) {
    try {
      await fetch(settings.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // standard Apps Script redirect handling
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_WITHDRAWAL',
          payload: sub,
        }),
      });
      return { success: true, message: 'Tersinkron ke Google Sheet (Webhook)' };
    } catch (err: any) {
      console.warn('Webhook sync failed:', err);
      return { success: false, message: 'Gagal kirim ke webhook: ' + err.message };
    }
  }

  // Mode 2: Direct Google Sheets API via OAuth Access Token
  const token = await getAccessToken();
  if (token && settings.spreadsheetId) {
    try {
      const range = `${settings.withdrawalSheetName || 'Pengambilan_Barang'}!A:I`;
      const rows = sub.items.map(item => [
        sub.id,
        sub.date,
        sub.machine,
        sub.requesterName,
        item.itemName,
        item.qty,
        item.unit,
        item.notes || '-',
        new Date().toLocaleString('id-ID'),
      ]);

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${settings.spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: rows }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Gagal append Google Sheets API');
      }

      return { success: true, message: 'Tersinkron ke Google Sheet via API OAuth' };
    } catch (err: any) {
      console.warn('OAuth sync failed:', err);
      return { success: false, message: 'Gagal OAuth: ' + err.message };
    }
  }

  return { success: true, message: 'Tersimpan lokal di memori aplikasi' };
};

/**
 * Send incoming goods to Google Sheets via Apps Script Webhook or Google Sheets API
 */
export const syncIncomingToSheet = async (sub: IncomingSubmission): Promise<{ success: boolean; message: string }> => {
  const settings = getSheetSettings();

  if (settings.webhookUrl) {
    try {
      await fetch(settings.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_INCOMING',
          payload: sub,
        }),
      });
      return { success: true, message: 'Tersinkron ke Google Sheet (Webhook)' };
    } catch (err: any) {
      console.warn('Webhook sync failed:', err);
      return { success: false, message: 'Gagal kirim ke webhook: ' + err.message };
    }
  }

  const token = await getAccessToken();
  if (token && settings.spreadsheetId) {
    try {
      const range = `${settings.incomingSheetName || 'Kedatangan_Barang'}!A:H`;
      const rows = sub.items.map(item => [
        sub.id,
        sub.date,
        item.itemName,
        item.qty,
        item.unit,
        item.prNumber || '-',
        item.poNumber || '-',
        new Date().toLocaleString('id-ID'),
      ]);

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${settings.spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: rows }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Gagal append Google Sheets API');
      }

      return { success: true, message: 'Tersinkron ke Google Sheet via API OAuth' };
    } catch (err: any) {
      console.warn('OAuth sync failed:', err);
      return { success: false, message: 'Gagal OAuth: ' + err.message };
    }
  }

  return { success: true, message: 'Tersimpan lokal di memori aplikasi' };
};

/**
 * Fetch Master Items from Google Spreadsheet (if configured)
 */
export const fetchMasterItemsFromSheet = async (): Promise<MasterItem[] | null> => {
  const settings = getSheetSettings();

  if (settings.webhookUrl) {
    try {
      const res = await fetch(settings.webhookUrl);
      const data = await res.json();
      if (data && data.items && Array.isArray(data.items)) {
        return data.items.map((item: any, idx: number) => ({
          id: 'sheet-itm-' + (idx + 1),
          code: item.code || `KMI-${idx + 1}`,
          name: item.name,
          category: item.category || 'Umum',
          defaultUnit: item.defaultUnit || 'PCS',
          initialStock: Number(item.initialStock) || 0,
          minStock: Number(item.minStock) || 0,
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch master items from webhook:', err);
    }
  }

  const token = await getAccessToken();
  if (token && settings.spreadsheetId) {
    try {
      const range = `${settings.masterSheetName || 'Master_Barang'}!A2:F`;
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${settings.spreadsheetId}/values/${range}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const rows = data.values || [];
        return rows.map((r: any[], idx: number) => ({
          id: 'sheet-itm-' + (idx + 1),
          code: r[0] || `KMI-${idx + 1}`,
          name: r[1] || 'Barang ' + (idx + 1),
          category: r[2] || 'Umum',
          defaultUnit: r[3] || 'PCS',
          initialStock: Number(r[4]) || 0,
          minStock: Number(r[5]) || 0,
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch master items from OAuth Sheet:', err);
    }
  }

  return null;
};
