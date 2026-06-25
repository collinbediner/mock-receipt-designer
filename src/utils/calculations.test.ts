import { describe, expect, it } from 'vitest'
import type { ReceiptItem } from '../types/receipt'
import { calculateReceiptTotals, lineTotal, roundMoney } from './calculations'

const baseItem = (patch: Partial<ReceiptItem>): ReceiptItem => ({
  id: 'item-1',
  description: 'Test item',
  sku: '',
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  taxExempt: false,
  ...patch,
})

describe('receipt calculations', () => {
  it('rounds money to two decimal places', () => {
    expect(roundMoney(1.005)).toBe(1.01)
    expect(roundMoney(10.999)).toBe(11)
  })

  it('never lets an item total go below zero after discounts', () => {
    expect(lineTotal(baseItem({ unitPrice: 5, discount: 20 }))).toBe(0)
  })

  it('calculates subtotal, discounts, tax, grand total, and change', () => {
    const items = [
      baseItem({ id: 'a', quantity: 2, unitPrice: 10, discount: 2 }),
      baseItem({ id: 'b', quantity: 1, unitPrice: 5, taxExempt: true }),
    ]

    const totals = calculateReceiptTotals(items, { taxEnabled: true, taxRate: 10 }, 30)

    expect(totals.subtotal).toBe(25)
    expect(totals.totalDiscount).toBe(2)
    expect(totals.taxableSubtotal).toBe(18)
    expect(totals.tax).toBe(1.8)
    expect(totals.grandTotal).toBe(24.8)
    expect(totals.changeDue).toBe(5.2)
  })
})
