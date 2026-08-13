import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { MealList } from '../types';

export const generateMealListPDF = async (list: MealList) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho limpo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('CONTROLE DE REFEIÇÕES - TERRAPLANAGEM', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Relatório de Consumo de Marmitas', 14, 21);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(14, 25, pageWidth - 14, 25);

  let startY = 30;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Lista: ${list.title}`, 14, startY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(`Data: ${list.date}`, 14, startY + 11);
  doc.text(`Turno: ${list.shift}`, 14, startY + 17);
  if (list.worksiteLocation) {
    doc.text(`Local / Frente: ${list.worksiteLocation}`, 80, startY + 11);
  }
  if (list.restaurant) {
    doc.text(`Restaurante: ${list.restaurant}`, 80, startY + 17);
  }
  doc.text(`Responsável: ${list.createdByName}`, 14, startY + 23);
  if (list.worksiteLocation && !list.restaurant) {
    doc.text(`Responsável: ${list.createdByName}`, 80, startY + 17);
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(pageWidth - 55, startY + 1, 41, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('TOTAL MARMITAS', pageWidth - 34.5, startY + 7, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`${list.totalMarmitas}`, pageWidth - 34.5, startY + 16, { align: 'center' });
  startY += 26;

  const tableData = list.items
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
    head: [['#', 'Nome do Colaborador (A-Z)', 'Setor / Função', 'Qtd', 'Observações']],
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

  // @ts-expect-error
  let finalY = doc.lastAutoTable.finalY || startY + 50;

  if (list.notes) {
    finalY += 6;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(list.notes, pageWidth - 28);
    doc.text(splitNotes, 14, finalY + 4);
    finalY += (splitNotes.length * 3.5) + 4;
  } else {
    finalY += 8;
  }

  if (finalY + 28 < doc.internal.pageSize.getHeight()) {
    const sigY = Math.max(finalY + 12, doc.internal.pageSize.getHeight() - 30);
    const colWidth = (pageWidth - 40) / 2;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(20, sigY, 20 + colWidth, sigY);
    doc.line(pageWidth - 20 - colWidth, sigY, pageWidth - 20, sigY);
    doc.setFontSize(8);
    doc.text('Responsável pela Obra', 20 + (colWidth / 2), sigY + 4, { align: 'center' });
    doc.text('Fornecedor de Refeições', pageWidth - 20 - (colWidth / 2), sigY + 4, { align: 'center' });
  }

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`Emissão: ${new Date().toLocaleString('pt-BR')}`, 14, doc.internal.pageSize.getHeight() - 6);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 6, { align: 'right' });
  }

  const filename = `Marmitas_${list.date}_${list.shift.replace(/[^a-zA-Z0-9]/g, '')}.pdf`;

  try {
    const pdfBase64 = doc.output('datauristring');
    const base64Data = pdfBase64.split(',')[1];

    const cacheFile = await Filesystem.writeFile({
      path: filename,
      data: base64Data,
      directory: Directory.Cache,
    });

    await Share.share({
      title: 'Relatório de Marmitas',
      text: `Relatório: ${list.title} - ${list.date}`,
      url: cacheFile.uri,
      dialogTitle: 'Salvar ou compartilhar PDF',
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    if (Capacitor.getPlatform() === 'web') {
      doc.save(filename);
    } else {
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  }
};