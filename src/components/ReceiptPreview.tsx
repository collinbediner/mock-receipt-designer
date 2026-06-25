import type { ReceiptData } from '../types/receipt'
import { calculateReceiptTotals, formatCurrency, lineTotal } from '../utils/calculations'
import { Barcode } from './Barcode'

interface ReceiptPreviewProps {
  data: ReceiptData
  previewRef: React.RefObject<HTMLDivElement | null>
}

export function ReceiptPreview({ data, previewRef }: ReceiptPreviewProps) {
  const totals = calculateReceiptTotals(data.items, data.settings, data.transaction.amountPaid)
  const widthMm =
    data.settings.receiptWidth === 'custom'
      ? data.settings.customWidthMm
      : Number(data.settings.receiptWidth)

  return (
    <section className="preview-panel" aria-labelledby="preview-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Live preview</p>
          <h2 id="preview-heading">Receipt</h2>
        </div>
      </div>

      <div className="paper-frame">
        <div
          ref={previewRef}
          className="receipt-paper"
          style={
            {
              '--receipt-width': `${widthMm}mm`,
              '--receipt-font-size': `${data.settings.fontSize}px`,
              '--receipt-align': data.settings.textAlignment,
              '--divider-style': data.settings.dividerStyle,
            } as React.CSSProperties
          }
        >
          <div className="watermark">SAMPLE - NOT A VALID RECEIPT</div>

          <header className="receipt-header">
            {data.store.logoDataUrl && (
              <img
                src={data.store.logoDataUrl}
                alt={`${data.store.name || 'Uploaded store'} logo`}
                style={{ maxWidth: data.settings.logoSize, maxHeight: data.settings.logoSize }}
              />
            )}
            <h3>{data.store.name || 'Store name required'}</h3>
            {data.store.subtitle && <p>{data.store.subtitle}</p>}
            {data.store.street && <p>{data.store.street}</p>}
            {data.store.cityStateZip && <p>{data.store.cityStateZip}</p>}
            {data.store.phone && <p>{data.store.phone}</p>}
            {data.store.website && <p>{data.store.website}</p>}
            {data.store.headerMessage && <p className="message">{data.store.headerMessage}</p>}
          </header>

          <div className="divider" />

          <dl className="receipt-meta">
            <div>
              <dt>Receipt</dt>
              <dd>{data.transaction.receiptNumber}</dd>
            </div>
            <div>
              <dt>Register</dt>
              <dd>{data.transaction.registerNumber || '-'}</dd>
            </div>
            <div>
              <dt>Cashier</dt>
              <dd>{data.transaction.cashier || '-'}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>
                {data.transaction.date || '-'} {data.transaction.time || ''}
              </dd>
            </div>
            {data.transaction.customerName && (
              <div>
                <dt>Customer</dt>
                <dd>{data.transaction.customerName}</dd>
              </div>
            )}
            {data.transaction.loyaltyText && (
              <div>
                <dt>Member</dt>
                <dd>{data.transaction.loyaltyText}</dd>
              </div>
            )}
          </dl>

          <div className="divider" />

          <div className="receipt-items">
            {data.items.map((item) => (
              <div className="receipt-item" key={item.id}>
                <div className="item-main">
                  <span>{item.description || 'Untitled item'}</span>
                  <strong>{formatCurrency(lineTotal(item), data.settings.currencySymbol)}</strong>
                </div>
                <div className="item-extra">
                  {data.settings.showQuantity && (
                    <span>
                      {item.quantity} x {formatCurrency(item.unitPrice, data.settings.currencySymbol)}
                    </span>
                  )}
                  {data.settings.showSku && item.sku && <span>SKU {item.sku}</span>}
                  {item.discount > 0 && (
                    <span>-{formatCurrency(item.discount, data.settings.currencySymbol)} discount</span>
                  )}
                  {item.taxExempt && <span>Tax exempt</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />

          <dl className="totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatCurrency(totals.subtotal, data.settings.currencySymbol)}</dd>
            </div>
            <div>
              <dt>Discounts</dt>
              <dd>-{formatCurrency(totals.totalDiscount, data.settings.currencySymbol)}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>{formatCurrency(totals.tax, data.settings.currencySymbol)}</dd>
            </div>
            <div className="grand-total">
              <dt>Total</dt>
              <dd>{formatCurrency(totals.grandTotal, data.settings.currencySymbol)}</dd>
            </div>
            <div>
              <dt>Paid {data.transaction.paymentMethod && `(${data.transaction.paymentMethod})`}</dt>
              <dd>{formatCurrency(totals.amountPaid, data.settings.currencySymbol)}</dd>
            </div>
            <div>
              <dt>Change due</dt>
              <dd>{formatCurrency(totals.changeDue, data.settings.currencySymbol)}</dd>
            </div>
          </dl>

          {data.transaction.referenceNumber && (
            <p className="microcopy">Reference: {data.transaction.referenceNumber}</p>
          )}

          <Barcode value={data.barcodeValue} />

          {data.settings.returnPolicy && <p className="policy">{data.settings.returnPolicy}</p>}
          {data.settings.footerMessage && <p className="message">{data.settings.footerMessage}</p>}
          <p className="sample-note">Created with Mock Receipt Designer - no proof of purchase value</p>
        </div>
      </div>
    </section>
  )
}
