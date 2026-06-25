import type { ReceiptData } from '../types/receipt'

export const validateReceipt = (data: ReceiptData) => {
  const errors: string[] = []

  if (!data.store.name.trim()) errors.push('Enter a store name.')
  if (data.items.length === 0) errors.push('Add at least one receipt item.')

  data.items.forEach((item, index) => {
    const label = `Item ${index + 1}`
    if (!item.description.trim()) errors.push(`${label}: enter a description.`)
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      errors.push(`${label}: quantity must be greater than zero.`)
    }
    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      errors.push(`${label}: price must be a valid number.`)
    }
    if (!Number.isFinite(item.discount) || item.discount < 0) {
      errors.push(`${label}: discount cannot be negative.`)
    }
  })

  if (data.settings.taxEnabled) {
    if (
      !Number.isFinite(data.settings.taxRate) ||
      data.settings.taxRate < 0 ||
      data.settings.taxRate > 100
    ) {
      errors.push('Tax rate must be between 0 and 100.')
    }
  }

  return errors
}

export const validateLogoFile = (file: File) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  const maxBytes = 1_000_000

  if (!allowedTypes.includes(file.type)) {
    return 'Logo must be a PNG, JPEG, or WebP image.'
  }

  if (file.size > maxBytes) {
    return 'Logo image must be under 1 MB.'
  }

  return ''
}
