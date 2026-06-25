import type { ReceiptData, ReceiptItem } from '../types/receipt'

const today = new Date()
const pad = (value: number) => String(value).padStart(2, '0')

export const createId = () => crypto.randomUUID()

export const randomReceiptNumber = () => `MRD-${Math.floor(100000 + Math.random() * 900000)}`

export const randomBarcodeValue = () =>
  Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('')

export const emptyItem = (): ReceiptItem => ({
  id: createId(),
  description: '',
  sku: '',
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  taxExempt: false,
})

export const demoData = (): ReceiptData => ({
  store: {
    name: 'Sample Corner Market',
    subtitle: 'Downtown Branch',
    street: '123 Example Street',
    cityStateZip: 'Springfield, ST 12345',
    phone: '(555) 010-2040',
    website: 'example.test',
    logoDataUrl: '',
    headerMessage: 'Thanks for visiting our demo store',
  },
  transaction: {
    receiptNumber: randomReceiptNumber(),
    registerNumber: '04',
    cashier: 'CB-12',
    date: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    time: `${pad(today.getHours())}:${pad(today.getMinutes())}`,
    paymentMethod: 'Card',
    amountPaid: 35,
    referenceNumber: 'DEMO-AUTH-0192',
    customerName: 'Sample Customer',
    loyaltyText: 'Demo Rewards Member',
  },
  items: [
    {
      id: createId(),
      description: 'Presentation Props',
      sku: 'DEMO-100',
      quantity: 2,
      unitPrice: 7.5,
      discount: 1,
      taxExempt: false,
    },
    {
      id: createId(),
      description: 'UI Mockup Supplies',
      sku: 'DEMO-245',
      quantity: 1,
      unitPrice: 12.99,
      discount: 0,
      taxExempt: false,
    },
    {
      id: createId(),
      description: 'Tax Exempt Sample',
      sku: 'DEMO-404',
      quantity: 1,
      unitPrice: 4.25,
      discount: 0,
      taxExempt: true,
    },
  ],
  settings: {
    currencySymbol: '$',
    receiptWidth: '80',
    customWidthMm: 72,
    fontSize: 13,
    textAlignment: 'center',
    logoSize: 64,
    dividerStyle: 'dashed',
    showSku: true,
    showQuantity: true,
    footerMessage: 'This is a mock receipt for design use only.',
    returnPolicy: 'Demo return policy text. Not valid for returns or exchanges.',
    taxEnabled: true,
    taxRate: 7.5,
  },
  barcodeValue: randomBarcodeValue(),
})

export const defaultData = (): ReceiptData => ({
  ...demoData(),
  store: {
    name: '',
    subtitle: '',
    street: '',
    cityStateZip: '',
    phone: '',
    website: '',
    logoDataUrl: '',
    headerMessage: '',
  },
  transaction: {
    receiptNumber: randomReceiptNumber(),
    registerNumber: '',
    cashier: '',
    date: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    time: `${pad(today.getHours())}:${pad(today.getMinutes())}`,
    paymentMethod: '',
    amountPaid: 0,
    referenceNumber: '',
    customerName: '',
    loyaltyText: '',
  },
  items: [emptyItem()],
})
