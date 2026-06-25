import type { ReceiptItem, ReceiptSettings, ReceiptTotals } from '../types/receipt'

export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export const lineSubtotal = (item: ReceiptItem) => roundMoney(item.quantity * item.unitPrice)

export const lineTotal = (item: ReceiptItem) => {
  const discounted = lineSubtotal(item) - item.discount
  return roundMoney(Math.max(0, discounted))
}

export const calculateReceiptTotals = (
  items: ReceiptItem[],
  settings: Pick<ReceiptSettings, 'taxEnabled' | 'taxRate'>,
  amountPaid: number,
): ReceiptTotals => {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + lineSubtotal(item), 0))
  const totalDiscount = roundMoney(items.reduce((sum, item) => sum + Math.max(0, item.discount), 0))
  const taxableSubtotal = roundMoney(
    items.reduce((sum, item) => (item.taxExempt ? sum : sum + lineTotal(item)), 0),
  )
  const tax = settings.taxEnabled ? roundMoney(taxableSubtotal * (settings.taxRate / 100)) : 0
  const grandTotal = roundMoney(items.reduce((sum, item) => sum + lineTotal(item), 0) + tax)
  const paid = roundMoney(amountPaid)

  return {
    subtotal,
    totalDiscount,
    taxableSubtotal,
    tax,
    grandTotal,
    amountPaid: paid,
    changeDue: roundMoney(Math.max(0, paid - grandTotal)),
  }
}

export const formatCurrency = (value: number, symbol: string) => `${symbol}${roundMoney(value).toFixed(2)}`
