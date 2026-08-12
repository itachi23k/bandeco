import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MealList } from '../types';

export const generateMealListPDF = (mealList: MealList) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Clean Header - No filled backgrounds, minimal ink consumption
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('CONTROLE DE REFEIÇÕES - TERRAPLANAGEM', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Relatório de Consumo de Marmitas', 14, 21);

  // Top Separator Line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(14, 25, pageWidth - 14, 25);

  // Document Info Table Box (Minimalist Outline)
  let startY = 30;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Lista: ${mealList.title}`, 14, startY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(`Data: ${mealList.date}`, 14, startY + 11);
  doc.text(`Turno: ${mealList.shift}`, 14, startY + 17);

  if (mealList.worksiteLocation) {
    doc.text(`Local / Frente: ${mealList.worksiteLocation}`, 80, startY + 11);
  }
  doc.text(`Responsável: ${mealList.createdByName}`, 80, startY + 17);

  // Lean Total Callout Box (Clean 1px Outline)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(pageWidth - 55, startY + 1, 41, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL MARMITAS', pageWidth - 34.5, startY + 7, { align: 'center' });

  doc.setFontSize(14);
  doc.text(`${mealList.totalMarmitas}`, pageWidth - 34.5, startY + 16, { align: 'center' });

  startY += 26;

  // Items Table (Lean & Crisp Grayscale Grid)
  const tableData = mealList.items
    .filter(item => item.quantity > 0)
    .sort((a, b) => a.workerName.localeCompare(b.workerName, 'pt-BR'))
    .map((item, index) => [
      (index + 1).toString().padStart(2, '0'),
      item.workerName,
      item.sector || 'Geral',
      item.quantity.toString(),
      item.notes || '-'
    ]);

  autoTable(doc, {
    startY: startY,
    head: [['#', 'Nome do Consumidor (A-Z)', 'Setor / Função', 'Qtd', 'Observações']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      lineWidth: 0.3,
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 75, fontStyle: 'bold' },
      2: { cellWidth: 45 },
      3: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 'auto' }
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [0, 0, 0],
      lineWidth: 0.2,
      lineColor: [200, 200, 200]
    }
  });

  // Notes if available
  // @ts-expect-error autotable lastAutoTable property
  let finalY = doc.lastAutoTable.finalY || startY + 50;

  if (mealList.notes) {
    finalY += 6;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Observações:', 14, finalY);

    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(mealList.notes, pageWidth - 28);
    doc.text(splitNotes, 14, finalY + 4);
    finalY += (splitNotes.length * 3.5) + 4;
  } else {
    finalY += 8;
  }

  // Signatures Area
  if (finalY + 28 < doc.internal.pageSize.getHeight()) {
    const sigY = Math.max(finalY + 12, doc.internal.pageSize.getHeight() - 30);
    const colWidth = (pageWidth - 40) / 2;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(20, sigY, 20 + colWidth, sigY);
    doc.line(pageWidth - 20 - colWidth, sigY, pageWidth - 20, sigY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Responsável pela Obra', 20 + (colWidth / 2), sigY + 4, { align: 'center' });
    doc.text('Fornecedor de Refeições', pageWidth - 20 - (colWidth / 2), sigY + 4, { align: 'center' });
  }

  // Footer Page Number
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Emissão: ${new Date().toLocaleString('pt-BR')}`,
      14,
      doc.internal.pageSize.getHeight() - 6
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'right' }
    );
  }

  // Save PDF
  const filename = `Marmitas_${mealList.date}_${mealList.shift.replace(/[^a-zA-Z0-9]/g, '')}.pdf`;
  
  try {
    // Gera o PDF como base64
    const pdfBase64 = doc.output('datauristring');
    const base64Data = pdfBase64.split(',')[1]; // Remove o prefixo "data:application/pdf;base64,"

    // Salva no dispositivo
    await Filesystem.writeFile({
      path: filename,
      data: base64Data,
      directory: Directory.Documents,
    });

    console.log('PDF salvo em: Documents/' + filename);
    alert(`PDF salvo com sucesso!\n${filename}`);
    
  } catch (error) {
    console.error('Erro ao salvar PDF:', error);
    
    // Fallback: tenta abrir em nova aba
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
};

