import jsPDF from 'jspdf'

export function openRecipePdf(recipe) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const margin = 56
  const pageWidth = doc.internal.pageSize.getWidth()
  const maxWidth = pageWidth - margin * 2
  let y = margin

  function ensureSpace(lineHeight) {
    if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      y = margin
    }
  }

  function heading(text) {
    ensureSpace(24)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor('#2E7A70')
    doc.text(text, margin, y)
    y += 18
    doc.setTextColor('#000000')
  }

  function bodyLines(text, { bullet = false, numbered = false } = {}) {
    const lines = text.split('\n').filter((l) => l.trim())
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    lines.forEach((line, i) => {
      const prefix = numbered ? `${i + 1}. ` : bullet ? '• ' : ''
      const wrapped = doc.splitTextToSize(prefix + line.trim(), maxWidth - 10)
      wrapped.forEach((w) => {
        ensureSpace(16)
        doc.text(w, margin + 4, y)
        y += 15
      })
    })
    y += 6
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.setTextColor('#1F3A38')
  const titleLines = doc.splitTextToSize(recipe.title, maxWidth)
  titleLines.forEach((l) => { doc.text(l, margin, y); y += 22 })
  doc.setTextColor('#000000')
  y += 4

  if (recipe.yield_text) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(11)
    doc.text(`Yield: ${recipe.yield_text}`, margin, y)
    y += 22
  }

  heading('Ingredients')
  bodyLines(recipe.ingredients, { bullet: true })

  heading('Procedure')
  bodyLines(recipe.procedure, { numbered: true })

  if (recipe.notes && recipe.notes.trim()) {
    heading('Notes')
    bodyLines(recipe.notes)
  }

  const blobUrl = doc.output('bloburl')
  window.open(blobUrl, '_blank')
}
