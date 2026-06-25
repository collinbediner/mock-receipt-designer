export type ReceiptWidth = '58' | '80' | 'custom'
export type TextAlignment = 'left' | 'center' | 'right'
export type DividerStyle = 'solid' | 'dashed' | 'dotted'

export interface StoreInfo {
  name: string
  subtitle: string
  street: string
  cityStateZip: string
  phone: string
  website: string
  logoDataUrl: string
  headerMessage: string
}

export interface TransactionInfo {
  receiptNumber: string
  registerNumber: string
  cashier: string
  date: string
  time: string
  paymentMethod: string
  amountPaid: number
  referenceNumber: string
  customerName: string
  loyaltyText: string
}

export interface ReceiptItem {
  id: string
  description: string
  sku: string
  quantity: number
  unitPrice: number
  discount: number
  taxExempt: boolean
}

export interface ReceiptSettings {
  currencySymbol: string
  receiptWidth: ReceiptWidth
  customWidthMm: number
  fontSize: number
  textAlignment: TextAlignment
  logoSize: number
  dividerStyle: DividerStyle
  showSku: boolean
  showQuantity: boolean
  footerMessage: string
  returnPolicy: string
  taxEnabled: boolean
  taxRate: number
}

export interface ReceiptData {
  store: StoreInfo
  transaction: TransactionInfo
  items: ReceiptItem[]
  settings: ReceiptSettings
  barcodeValue: string
}

export interface ReceiptTotals {
  subtotal: number
  totalDiscount: number
  taxableSubtotal: number
  tax: number
  grandTotal: number
  amountPaid: number
  changeDue: number
}
