export interface MasterItem {
  id: string;
  code: string;
  name: string;
  category: string;
  defaultUnit: string;
  minStock: number;
  initialStock: number;
}

export interface UnitOption {
  value: string;
  label: string;
}

export interface WithdrawalItem {
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
  notes: string;
}

export interface WithdrawalSubmission {
  id: string;
  date: string;
  machine: string;
  requesterName: string;
  items: WithdrawalItem[];
  createdAt: string;
  syncedToSheet?: boolean;
}

export interface IncomingItem {
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
  prNumber?: string;
  poNumber?: string;
}

export interface IncomingSubmission {
  id: string;
  date: string;
  items: IncomingItem[];
  createdAt: string;
  syncedToSheet?: boolean;
}

export interface StockSummaryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  initialStock: number;
  totalIncoming: number;
  totalOutgoing: number;
  currentStock: number;
  manualAdjustment: number;
  minStock: number;
  lastUpdated: string;
}

export interface SheetSettings {
  mode: 'oauth' | 'webhook' | 'demo';
  spreadsheetId: string;
  webhookUrl: string;
  masterSheetName: string;
  incomingSheetName: string;
  withdrawalSheetName: string;
  stockSheetName: string;
  lastSyncTime?: string;
}
