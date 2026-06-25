import type { ReceiptData, ReceiptItem, ReceiptWidth, TextAlignment } from '../types/receipt'
import { emptyItem, randomBarcodeValue, randomReceiptNumber } from '../utils/receiptData'
import { validateLogoFile } from '../utils/validation'

interface ReceiptFormProps {
  data: ReceiptData
  errors: string[]
  onChange: (data: ReceiptData) => void
  onGeneratePreview: () => void
  onPrint: () => void
  onExportPdf: () => void
  onExportPng: () => void
  onReset: () => void
  onLoadDemo: () => void
  onClearSaved: () => void
  onLogoError: (message: string) => void
}

export function ReceiptForm({
  data,
  errors,
  onChange,
  onGeneratePreview,
  onPrint,
  onExportPdf,
  onExportPng,
  onReset,
  onLoadDemo,
  onClearSaved,
  onLogoError,
}: ReceiptFormProps) {
  const updateStore = (field: keyof ReceiptData['store'], value: string) => {
    onChange({ ...data, store: { ...data.store, [field]: value } })
  }

  const updateTransaction = (
    field: keyof ReceiptData['transaction'],
    value: string | number,
  ) => {
    onChange({ ...data, transaction: { ...data.transaction, [field]: value } })
  }

  const updateSettings = (field: keyof ReceiptData['settings'], value: string | number | boolean) => {
    onChange({ ...data, settings: { ...data.settings, [field]: value } })
  }

  const updateItem = (id: string, patch: Partial<ReceiptItem>) => {
    onChange({
      ...data,
      items: data.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= data.items.length) return
    const nextItems = [...data.items]
    const [item] = nextItems.splice(index, 1)
    nextItems.splice(nextIndex, 0, item)
    onChange({ ...data, items: nextItems })
  }

  const handleLogo = (file: File | undefined) => {
    if (!file) return
    const error = validateLogoFile(file)
    if (error) {
      onLogoError(error)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateStore('logoDataUrl', String(reader.result))
      onLogoError('')
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="form-panel" aria-labelledby="form-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Editable form</p>
          <h2 id="form-heading">Mock Receipt Designer</h2>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="validation-box" role="alert">
          <strong>Please fix these:</strong>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="actions top-actions">
        <button type="button" onClick={onGeneratePreview}>
          Generate preview
        </button>
        <button type="button" onClick={onPrint}>
          Print receipt
        </button>
        <button type="button" onClick={onExportPdf}>
          Export PDF
        </button>
        <button type="button" onClick={onExportPng}>
          Export PNG
        </button>
        <button type="button" className="secondary" onClick={onLoadDemo}>
          Load demo data
        </button>
        <button type="button" className="secondary" onClick={onReset}>
          Reset form
        </button>
        <button type="button" className="secondary" onClick={onClearSaved}>
          Clear saved data
        </button>
      </div>

      <fieldset>
        <legend>Store details</legend>
        <TextInput label="Store name" value={data.store.name} onChange={(value) => updateStore('name', value)} />
        <TextInput
          label="Store subtitle or branch"
          value={data.store.subtitle}
          onChange={(value) => updateStore('subtitle', value)}
        />
        <TextInput label="Street address" value={data.store.street} onChange={(value) => updateStore('street', value)} />
        <TextInput
          label="City, state, ZIP"
          value={data.store.cityStateZip}
          onChange={(value) => updateStore('cityStateZip', value)}
        />
        <TextInput label="Phone number" value={data.store.phone} onChange={(value) => updateStore('phone', value)} />
        <TextInput label="Website" value={data.store.website} onChange={(value) => updateStore('website', value)} />
        <label>
          Logo image
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleLogo(event.target.files?.[0])} />
        </label>
        <TextArea
          label="Optional header message"
          value={data.store.headerMessage}
          onChange={(value) => updateStore('headerMessage', value)}
        />
      </fieldset>

      <fieldset>
        <legend>Transaction</legend>
        <div className="inline-field">
          <TextInput
            label="Receipt number"
            value={data.transaction.receiptNumber}
            onChange={(value) => updateTransaction('receiptNumber', value)}
          />
          <button type="button" className="secondary small-button" onClick={() => updateTransaction('receiptNumber', randomReceiptNumber())}>
            Random
          </button>
        </div>
        <TextInput
          label="Register number"
          value={data.transaction.registerNumber}
          onChange={(value) => updateTransaction('registerNumber', value)}
        />
        <TextInput
          label="Cashier name or ID"
          value={data.transaction.cashier}
          onChange={(value) => updateTransaction('cashier', value)}
        />
        <TextInput type="date" label="Transaction date" value={data.transaction.date} onChange={(value) => updateTransaction('date', value)} />
        <TextInput type="time" label="Transaction time" value={data.transaction.time} onChange={(value) => updateTransaction('time', value)} />
        <TextInput
          label="Payment method"
          value={data.transaction.paymentMethod}
          onChange={(value) => updateTransaction('paymentMethod', value)}
        />
        <NumberInput
          label="Amount paid"
          value={data.transaction.amountPaid}
          onChange={(value) => updateTransaction('amountPaid', value)}
        />
        <TextInput
          label="Authorization or reference number"
          value={data.transaction.referenceNumber}
          onChange={(value) => updateTransaction('referenceNumber', value)}
        />
        <TextInput
          label="Customer name"
          value={data.transaction.customerName}
          onChange={(value) => updateTransaction('customerName', value)}
        />
        <TextInput
          label="Loyalty membership text"
          value={data.transaction.loyaltyText}
          onChange={(value) => updateTransaction('loyaltyText', value)}
        />
      </fieldset>

      <fieldset>
        <legend>Items</legend>
        <div className="actions">
          <button type="button" onClick={() => onChange({ ...data, items: [...data.items, emptyItem()] })}>
            Add item
          </button>
        </div>
        {data.items.map((item, index) => (
          <div className="item-editor" key={item.id}>
            <div className="item-editor-heading">
              <strong>Item {index + 1}</strong>
              <div className="actions compact">
                <button type="button" className="secondary" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                  Up
                </button>
                <button type="button" className="secondary" onClick={() => moveItem(index, 1)} disabled={index === data.items.length - 1}>
                  Down
                </button>
                <button type="button" className="danger" onClick={() => onChange({ ...data, items: data.items.filter((row) => row.id !== item.id) })}>
                  Remove
                </button>
              </div>
            </div>
            <TextInput label="Item description" value={item.description} onChange={(value) => updateItem(item.id, { description: value })} />
            <TextInput label="Optional SKU" value={item.sku} onChange={(value) => updateItem(item.id, { sku: value })} />
            <NumberInput label="Quantity" value={item.quantity} onChange={(value) => updateItem(item.id, { quantity: value })} />
            <NumberInput label="Unit price" value={item.unitPrice} onChange={(value) => updateItem(item.id, { unitPrice: value })} />
            <NumberInput label="Optional discount" value={item.discount} onChange={(value) => updateItem(item.id, { discount: value })} />
            <label className="checkbox-row">
              <input type="checkbox" checked={item.taxExempt} onChange={(event) => updateItem(item.id, { taxExempt: event.target.checked })} />
              Tax exempt
            </label>
          </div>
        ))}
      </fieldset>

      <fieldset>
        <legend>Receipt customization</legend>
        <TextInput
          label="Currency symbol"
          value={data.settings.currencySymbol}
          onChange={(value) => updateSettings('currencySymbol', value)}
        />
        <label>
          Receipt width
          <select value={data.settings.receiptWidth} onChange={(event) => updateSettings('receiptWidth', event.target.value as ReceiptWidth)}>
            <option value="58">58 mm</option>
            <option value="80">80 mm</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        {data.settings.receiptWidth === 'custom' && (
          <NumberInput
            label="Custom width in mm"
            value={data.settings.customWidthMm}
            onChange={(value) => updateSettings('customWidthMm', value)}
          />
        )}
        <NumberInput label="Font size" value={data.settings.fontSize} onChange={(value) => updateSettings('fontSize', value)} />
        <label>
          Text alignment
          <select value={data.settings.textAlignment} onChange={(event) => updateSettings('textAlignment', event.target.value as TextAlignment)}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
        <NumberInput label="Logo size" value={data.settings.logoSize} onChange={(value) => updateSettings('logoSize', value)} />
        <label>
          Divider style
          <select value={data.settings.dividerStyle} onChange={(event) => updateSettings('dividerStyle', event.target.value)}>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={data.settings.showSku} onChange={(event) => updateSettings('showSku', event.target.checked)} />
          Show SKU values
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={data.settings.showQuantity} onChange={(event) => updateSettings('showQuantity', event.target.checked)} />
          Show quantity columns
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={data.settings.taxEnabled} onChange={(event) => updateSettings('taxEnabled', event.target.checked)} />
          Use tax
        </label>
        {data.settings.taxEnabled && (
          <NumberInput label="Tax rate percentage" value={data.settings.taxRate} onChange={(value) => updateSettings('taxRate', value)} />
        )}
        <TextArea label="Footer message" value={data.settings.footerMessage} onChange={(value) => updateSettings('footerMessage', value)} />
        <TextArea label="Return policy text" value={data.settings.returnPolicy} onChange={(value) => updateSettings('returnPolicy', value)} />
      </fieldset>

      <fieldset>
        <legend>Barcode</legend>
        <div className="inline-field">
          <TextInput label="Demo barcode number" value={data.barcodeValue} onChange={(value) => onChange({ ...data, barcodeValue: value.replace(/\D/g, '') })} />
          <button type="button" className="secondary small-button" onClick={() => onChange({ ...data, barcodeValue: randomBarcodeValue() })}>
            Regenerate
          </button>
        </div>
      </fieldset>
    </section>
  )
}

interface TextInputProps {
  label: string
  value: string
  type?: string
  onChange: (value: string) => void
}

function TextInput({ label, value, type = 'text', onChange }: TextInputProps) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
}

function NumberInput({ label, value, onChange }: NumberInputProps) {
  return (
    <label>
      {label}
      <input type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

interface TextAreaProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function TextArea({ label, value, onChange }: TextAreaProps) {
  return (
    <label>
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
