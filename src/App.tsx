import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import './App.css'
import { ReceiptForm } from './components/ReceiptForm'
import { ReceiptPreview } from './components/ReceiptPreview'
import type { ReceiptData } from './types/receipt'
import { defaultData, demoData } from './utils/receiptData'
import { validateReceipt } from './utils/validation'

const STORAGE_KEY = 'mock-receipt-designer-data'

function loadInitialData() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return defaultData()

  try {
    return JSON.parse(saved) as ReceiptData
  } catch {
    return defaultData()
  }
}

function App() {
  const [receiptData, setReceiptData] = useState<ReceiptData>(() => loadInitialData())
  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const previewRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receiptData))
  }, [receiptData])

  const validate = () => {
    const nextErrors = validateReceipt(receiptData)
    setErrors(nextErrors)
    return nextErrors.length === 0
  }

  const generatePreview = () => {
    if (validate()) setStatus('Preview is up to date.')
    else setStatus('Fix the highlighted items, then generate again.')
  }

  const captureReceipt = async () => {
    if (!previewRef.current) throw new Error('Receipt preview is not ready.')
    return html2canvas(previewRef.current, {
      backgroundColor: '#ffffff',
      scale: 3,
      useCORS: true,
    })
  }

  const exportPng = async () => {
    if (!validate()) return
    const canvas = await captureReceipt()
    const link = document.createElement('a')
    link.download = 'mock-receipt-sample.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    setStatus('PNG export created.')
  }

  const exportPdf = async () => {
    if (!validate()) return
    const canvas = await captureReceipt()
    const image = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imageWidth = Math.min(canvas.width * 0.35, pageWidth - 72)
    const imageHeight = (canvas.height * imageWidth) / canvas.width
    pdf.addImage(image, 'PNG', (pageWidth - imageWidth) / 2, 36, imageWidth, Math.min(imageHeight, pageHeight - 72))
    pdf.save('mock-receipt-sample.pdf')
    setStatus('PDF export created.')
  }

  const printReceipt = () => {
    if (!validate()) return
    window.print()
  }

  const resetForm = () => {
    const next = defaultData()
    setReceiptData(next)
    setErrors([])
    setStatus('Form reset.')
  }

  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStatus('Saved browser data cleared.')
  }

  return (
    <main className="app-shell">
      <ReceiptForm
        data={receiptData}
        errors={errors}
        onChange={setReceiptData}
        onGeneratePreview={generatePreview}
        onPrint={printReceipt}
        onExportPdf={exportPdf}
        onExportPng={exportPng}
        onReset={resetForm}
        onLoadDemo={() => {
          setReceiptData(demoData())
          setErrors([])
          setStatus('Demo data loaded.')
        }}
        onClearSaved={clearSavedData}
        onLogoError={(message) => {
          if (message) setErrors([message])
          else setErrors([])
        }}
      />

      <ReceiptPreview data={receiptData} previewRef={previewRef} />

      {status && (
        <div className="status-message" role="status" aria-live="polite">
          {status}
        </div>
      )}
    </main>
  )
}

export default App
