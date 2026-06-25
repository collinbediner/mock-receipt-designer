import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeProps {
  value: string
}

export function Barcode({ value }: BarcodeProps) {
  const barcodeRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!barcodeRef.current || !value.trim()) return

    JsBarcode(barcodeRef.current, value, {
      format: 'CODE128',
      displayValue: true,
      fontSize: 12,
      height: 48,
      margin: 4,
      width: 1.4,
    })
  }, [value])

  return (
    <div className="barcode-block" aria-label="Demo barcode">
      <p className="microcopy">DEMO BARCODE - not connected to any product database</p>
      <svg ref={barcodeRef} role="img" aria-label={`Demo barcode value ${value}`} />
    </div>
  )
}
