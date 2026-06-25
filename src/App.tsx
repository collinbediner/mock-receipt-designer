import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import './App.css'

type TextAlign = 'left' | 'center' | 'right'
type ElementType = 'text' | 'image'
type ReceiptWidth = '58' | '80' | 'custom'

interface CanvasSettings {
  widthPreset: ReceiptWidth
  customWidthMm: number
  minHeight: number
  backgroundColor: string
  paperColor: string
  borderColor: string
  borderWidth: number
  padding: number
  sampleFooter: string
}

interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  rotation: number
  opacity: number
}

interface TextElement extends BaseElement {
  type: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  color: string
  lineHeight: number
  letterSpacing: number
  align: TextAlign
}

interface ImageElement extends BaseElement {
  type: 'image'
  imageUrl: string
  height: number
  objectFit: 'contain' | 'cover'
  borderRadius: number
}

type CanvasElement = TextElement | ImageElement

interface EditorState {
  settings: CanvasSettings
  elements: CanvasElement[]
}

const STORAGE_KEY = 'mock-receipt-designer-freeform'
const FONT_OPTIONS = [
  'Courier New',
  'Arial',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
]

const DEFAULT_SETTINGS: CanvasSettings = {
  widthPreset: '80',
  customWidthMm: 76,
  minHeight: 880,
  backgroundColor: '#d9e1e5',
  paperColor: '#fffdf7',
  borderColor: '#d4d7da',
  borderWidth: 1,
  padding: 20,
  sampleFooter: 'Created with Mock Receipt Designer - no proof of purchase value',
}

const defaultTextElement = (): TextElement => ({
  id: crypto.randomUUID(),
  type: 'text',
  text: 'New text',
  x: 20,
  y: 20,
  width: 220,
  rotation: 0,
  opacity: 1,
  fontFamily: 'Courier New',
  fontSize: 18,
  fontWeight: 500,
  color: '#111827',
  lineHeight: 1.25,
  letterSpacing: 0,
  align: 'left',
})

const demoTextElements = (): CanvasElement[] => [
  {
    ...defaultTextElement(),
    text: 'DEMO STORE',
    x: 20,
    y: 24,
    width: 240,
    fontSize: 28,
    fontWeight: 800,
    align: 'center',
  },
  {
    ...defaultTextElement(),
    text: '123 Example Street\nSpringfield, ST 12345\n(555) 010-2040',
    x: 20,
    y: 82,
    width: 240,
    fontSize: 14,
    align: 'center',
  },
  {
    ...defaultTextElement(),
    text: 'Item A        $12.99\nItem B         $4.50\nTax            $1.05\nTotal         $18.54',
    x: 22,
    y: 190,
    width: 240,
    fontSize: 16,
  },
]

const defaultState = (): EditorState => ({
  settings: DEFAULT_SETTINGS,
  elements: demoTextElements(),
})

const loadInitialState = (): EditorState => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return defaultState()

  try {
    return JSON.parse(saved) as EditorState
  } catch {
    return defaultState()
  }
}

const numeric = (value: string, fallback: number) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function App() {
  const [editorState, setEditorState] = useState<EditorState>(() => loadInitialState())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const previewRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragRef = useRef<{
    id: string
    mode: 'move' | 'resize'
    startX: number
    startY: number
    originX: number
    originY: number
    originWidth: number
    originHeight: number
  } | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(editorState))
  }, [editorState])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current) return

      event.preventDefault()
      const interaction = dragRef.current
      const deltaX = event.clientX - interaction.startX
      const deltaY = event.clientY - interaction.startY

      if (interaction.mode === 'move') {
        updateElement(interaction.id, {
          x: Math.round(interaction.originX + deltaX),
          y: Math.round(interaction.originY + deltaY),
        })
        return
      }

      const currentElement = editorState.elements.find((element) => element.id === interaction.id)
      if (!currentElement) return

      if (currentElement.type === 'text') {
        updateElement(interaction.id, {
          width: Math.max(80, Math.round(interaction.originWidth + deltaX)),
        })
        return
      }

      updateElement(interaction.id, {
        width: Math.max(60, Math.round(interaction.originWidth + deltaX)),
        height: Math.max(40, Math.round(interaction.originHeight + deltaY)),
      })
    }

    const handlePointerUp = () => {
      dragRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [editorState.elements])

  const selectedElement = editorState.elements.find((element) => element.id === selectedId) ?? null

  const updateSettings = <K extends keyof CanvasSettings>(field: K, value: CanvasSettings[K]) => {
    setEditorState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [field]: value,
      },
    }))
  }

  const updateElement = (id: string, patch: Partial<CanvasElement>) => {
    setEditorState((current) => ({
      ...current,
      elements: current.elements.map((element) =>
        element.id === id ? ({ ...element, ...patch } as CanvasElement) : element,
      ),
    }))
  }

  const addText = () => {
    const next = defaultTextElement()
    setEditorState((current) => ({
      ...current,
      elements: [...current.elements, next],
    }))
    setSelectedId(next.id)
    setStatus('Text box added.')
  }

  const addImage = (dataUrl: string) => {
    const imageElement: ImageElement = {
      id: crypto.randomUUID(),
      type: 'image',
      imageUrl: dataUrl,
      x: 24,
      y: 24,
      width: 140,
      height: 90,
      rotation: 0,
      opacity: 1,
      objectFit: 'contain',
      borderRadius: 0,
    }

    setEditorState((current) => ({
      ...current,
      elements: [...current.elements, imageElement],
    }))
    setSelectedId(imageElement.id)
    setStatus('Image added.')
  }

  const removeSelected = () => {
    if (!selectedId) return
    setEditorState((current) => ({
      ...current,
      elements: current.elements.filter((element) => element.id !== selectedId),
    }))
    setSelectedId(null)
    setStatus('Selected element removed.')
  }

  const stopInteraction = () => {
    dragRef.current = null
  }

  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStatus('Saved browser data cleared.')
  }

  const resetCanvas = () => {
    const next = defaultState()
    setEditorState(next)
    setSelectedId(null)
    setStatus('Canvas reset.')
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
    const canvas = await captureReceipt()
    const link = document.createElement('a')
    link.download = 'mock-receipt-sample.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    setStatus('PNG export created.')
  }

  const exportPdf = async () => {
    const canvas = await captureReceipt()
    const image = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imageWidth = Math.min(canvas.width * 0.35, pageWidth - 72)
    const imageHeight = (canvas.height * imageWidth) / canvas.width
    pdf.addImage(
      image,
      'PNG',
      (pageWidth - imageWidth) / 2,
      36,
      imageWidth,
      Math.min(imageHeight, pageHeight - 72),
    )
    pdf.save('mock-receipt-sample.pdf')
    setStatus('PDF export created.')
  }

  const printReceipt = () => {
    window.print()
  }

  const widthMm =
    editorState.settings.widthPreset === 'custom'
      ? editorState.settings.customWidthMm
      : Number(editorState.settings.widthPreset)

  return (
    <main className="app-shell">
      <section className="form-panel" aria-labelledby="form-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Blank canvas editor</p>
            <h2 id="form-heading">Mock Receipt Designer</h2>
          </div>
        </div>

        <div className="actions top-actions">
          <button type="button" onClick={addText}>
            Add text
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            Add image
          </button>
          <button type="button" onClick={printReceipt}>
            Print
          </button>
          <button type="button" onClick={exportPdf}>
            Export PDF
          </button>
          <button type="button" onClick={exportPng}>
            Export PNG
          </button>
          <button type="button" className="secondary" onClick={resetCanvas}>
            Reset
          </button>
          <button type="button" className="secondary" onClick={clearSavedData}>
            Clear saved
          </button>
        </div>

        <input
          ref={fileInputRef}
          className="visually-hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
              setStatus('Use a PNG, JPEG, or WebP image.')
              return
            }
            if (file.size > 1_500_000) {
              setStatus('Image must be under 1.5 MB.')
              return
            }
            const reader = new FileReader()
            reader.onload = () => addImage(String(reader.result))
            reader.readAsDataURL(file)
            event.currentTarget.value = ''
          }}
        />

        <fieldset>
          <legend>Canvas</legend>
          <label>
            Receipt width
            <select
              value={editorState.settings.widthPreset}
              onChange={(event) =>
                updateSettings('widthPreset', event.target.value as CanvasSettings['widthPreset'])
              }
            >
              <option value="58">58 mm</option>
              <option value="80">80 mm</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          {editorState.settings.widthPreset === 'custom' && (
            <label>
              Custom width in mm
              <input
                type="number"
                value={editorState.settings.customWidthMm}
                onChange={(event) =>
                  updateSettings('customWidthMm', numeric(event.target.value, 76))
                }
              />
            </label>
          )}
          <label>
            Canvas height in px
            <input
              type="number"
              value={editorState.settings.minHeight}
              onChange={(event) =>
                updateSettings('minHeight', numeric(event.target.value, 880))
              }
            />
          </label>
          <label>
            Outer background color
            <input
              type="color"
              value={editorState.settings.backgroundColor}
              onChange={(event) => updateSettings('backgroundColor', event.target.value)}
            />
          </label>
          <label>
            Paper color
            <input
              type="color"
              value={editorState.settings.paperColor}
              onChange={(event) => updateSettings('paperColor', event.target.value)}
            />
          </label>
          <label>
            Border color
            <input
              type="color"
              value={editorState.settings.borderColor}
              onChange={(event) => updateSettings('borderColor', event.target.value)}
            />
          </label>
          <label>
            Border width
            <input
              type="number"
              value={editorState.settings.borderWidth}
              onChange={(event) =>
                updateSettings('borderWidth', numeric(event.target.value, 1))
              }
            />
          </label>
          <label>
            Inner padding
            <input
              type="number"
              value={editorState.settings.padding}
              onChange={(event) => updateSettings('padding', numeric(event.target.value, 20))}
            />
          </label>
          <label>
            Sample footer text
            <textarea
              value={editorState.settings.sampleFooter}
              onChange={(event) => updateSettings('sampleFooter', event.target.value)}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Layers</legend>
          <div className="layer-list">
            {editorState.elements.map((element, index) => (
              <button
                key={element.id}
                type="button"
                className={`layer-row ${selectedId === element.id ? 'active' : ''}`}
                onClick={() => setSelectedId(element.id)}
              >
                <span>{element.type === 'text' ? `Text ${index + 1}` : `Image ${index + 1}`}</span>
                <span className="layer-meta">
                  {element.type === 'text'
                    ? element.text.slice(0, 18) || 'Empty text'
                    : `${Math.round(element.width)} x ${Math.round(element.height)}`}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Selected element</legend>
          {!selectedElement && <p className="helper-copy">Click any text or image on the receipt to edit it.</p>}

          {selectedElement && (
            <>
              {selectedElement.type === 'text' && (
                <>
                  <label>
                    Text
                    <textarea
                      value={selectedElement.text}
                      onChange={(event) =>
                        updateElement(selectedElement.id, { text: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Font family
                    <select
                      value={selectedElement.fontFamily}
                      onChange={(event) =>
                        updateElement(selectedElement.id, { fontFamily: event.target.value })
                      }
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Text color
                    <input
                      type="color"
                      value={selectedElement.color}
                      onChange={(event) =>
                        updateElement(selectedElement.id, { color: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Font size
                    <input
                      type="number"
                      value={selectedElement.fontSize}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          fontSize: numeric(event.target.value, selectedElement.fontSize),
                        })
                      }
                    />
                  </label>
                  <label>
                    Font weight
                    <input
                      type="number"
                      min="100"
                      max="900"
                      step="100"
                      value={selectedElement.fontWeight}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          fontWeight: numeric(event.target.value, selectedElement.fontWeight),
                        })
                      }
                    />
                  </label>
                  <label>
                    Text align
                    <select
                      value={selectedElement.align}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          align: event.target.value as TextAlign,
                        })
                      }
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                  <label>
                    Line height
                    <input
                      type="number"
                      step="0.05"
                      value={selectedElement.lineHeight}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          lineHeight: numeric(event.target.value, selectedElement.lineHeight),
                        })
                      }
                    />
                  </label>
                  <label>
                    Letter spacing
                    <input
                      type="number"
                      step="0.2"
                      value={selectedElement.letterSpacing}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          letterSpacing: numeric(
                            event.target.value,
                            selectedElement.letterSpacing,
                          ),
                        })
                      }
                    />
                  </label>
                </>
              )}

              {selectedElement.type === 'image' && (
                <>
                  <label>
                    Width
                    <input
                      type="number"
                      value={selectedElement.width}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          width: numeric(event.target.value, selectedElement.width),
                        })
                      }
                    />
                  </label>
                  <label>
                    Height
                    <input
                      type="number"
                      value={selectedElement.height}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          height: numeric(event.target.value, selectedElement.height),
                        })
                      }
                    />
                  </label>
                  <label>
                    Fit
                    <select
                      value={selectedElement.objectFit}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          objectFit: event.target.value as ImageElement['objectFit'],
                        })
                      }
                    >
                      <option value="contain">Contain</option>
                      <option value="cover">Cover</option>
                    </select>
                  </label>
                  <label>
                    Corner roundness
                    <input
                      type="number"
                      value={selectedElement.borderRadius}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          borderRadius: numeric(event.target.value, selectedElement.borderRadius),
                        })
                      }
                    />
                  </label>
                </>
              )}

              <label>
                X position
                <input
                  type="number"
                  value={selectedElement.x}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      x: numeric(event.target.value, selectedElement.x),
                    })
                  }
                />
              </label>
              <label>
                Y position
                <input
                  type="number"
                  value={selectedElement.y}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      y: numeric(event.target.value, selectedElement.y),
                    })
                  }
                />
              </label>
              <label>
                Box width
                <input
                  type="number"
                  value={selectedElement.width}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      width: numeric(event.target.value, selectedElement.width),
                    })
                  }
                />
              </label>
              <label>
                Rotation
                <input
                  type="number"
                  value={selectedElement.rotation}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      rotation: numeric(event.target.value, selectedElement.rotation),
                    })
                  }
                />
              </label>
              <label>
                Opacity
                <input
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={selectedElement.opacity}
                  onChange={(event) =>
                    updateElement(selectedElement.id, {
                      opacity: numeric(event.target.value, selectedElement.opacity),
                    })
                  }
                />
              </label>
              <div className="actions">
                <button type="button" className="danger" onClick={removeSelected}>
                  Delete selected
                </button>
              </div>
            </>
          )}
        </fieldset>
      </section>

      <section className="preview-panel" aria-labelledby="preview-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Live preview</p>
            <h2 id="preview-heading">Blank sample receipt</h2>
          </div>
        </div>

        <div className="paper-frame" style={{ background: editorState.settings.backgroundColor }}>
          <div
            ref={previewRef}
            className="receipt-paper freeform-paper"
            style={
              {
                '--receipt-width': `${widthMm}mm`,
                '--paper-color': editorState.settings.paperColor,
                '--paper-border-color': editorState.settings.borderColor,
                '--paper-border-width': `${editorState.settings.borderWidth}px`,
                '--paper-padding': `${editorState.settings.padding}px`,
                minHeight: editorState.settings.minHeight,
              } as React.CSSProperties
            }
          >
            <div className="watermark">SAMPLE - NOT A VALID RECEIPT</div>

            {editorState.elements.map((element) => (
              <div
                key={element.id}
                className={`canvas-element ${selectedId === element.id ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
                style={
                  {
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    opacity: element.opacity,
                    transform: `rotate(${element.rotation}deg)`,
                  } as React.CSSProperties
                }
                onClick={() => setSelectedId(element.id)}
                onPointerDown={(event) => {
                  event.preventDefault()
                  dragRef.current = {
                    id: element.id,
                    mode: 'move',
                    startX: event.clientX,
                    startY: event.clientY,
                    originX: element.x,
                    originY: element.y,
                    originWidth: element.width,
                    originHeight: element.type === 'image' ? element.height : 0,
                  }
                  setSelectedId(element.id)
                }}
                onPointerUp={(event) => {
                  event.preventDefault()
                  stopInteraction()
                }}
                onPointerCancel={stopInteraction}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedId(element.id)
                  }
                }}
              >
                {element.type === 'text' ? (
                  <span
                    className="canvas-text"
                    style={
                      {
                        color: element.color,
                        fontFamily: element.fontFamily,
                        fontSize: element.fontSize,
                        fontWeight: element.fontWeight,
                        lineHeight: element.lineHeight,
                        letterSpacing: `${element.letterSpacing}px`,
                        textAlign: element.align,
                      } as React.CSSProperties
                    }
                  >
                    {element.text}
                  </span>
                ) : (
                  <img
                    src={element.imageUrl}
                    alt="User uploaded decoration"
                    style={{
                      width: '100%',
                      height: element.height,
                      objectFit: element.objectFit,
                      borderRadius: element.borderRadius,
                    }}
                  />
                )}
                <span
                  className="resize-handle"
                  role="presentation"
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    dragRef.current = {
                      id: element.id,
                      mode: 'resize',
                      startX: event.clientX,
                      startY: event.clientY,
                      originX: element.x,
                      originY: element.y,
                      originWidth: element.width,
                      originHeight: element.type === 'image' ? element.height : 0,
                    }
                    setSelectedId(element.id)
                  }}
                />
              </div>
            ))}

            <p className="sample-note canvas-footer">{editorState.settings.sampleFooter}</p>
          </div>
        </div>
      </section>

      {status && (
        <div className="status-message" role="status" aria-live="polite">
          {status}
        </div>
      )}
    </main>
  )
}

export default App
