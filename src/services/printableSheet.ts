import jsPDF from 'jspdf';
import { PIANO_KEYS_8 } from './audioEngine';

export class PrintableSheetService {
  /**
   * Generates a high-quality PDF containing the printable paper piano sheet
   * formatted for standard A4 landscape printing with fiducial corner markers.
   */
  public generatePDF(title = 'Virtual Piano - Printable Paper Keyboard'): jsPDF {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = doc.internal.pageSize.getWidth(); // ~297 mm
    const pdfHeight = doc.internal.pageSize.getHeight(); // ~210 mm

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('VIRTUAL PIANO - COMPUTER VISION PAPER SHEET', pdfWidth / 2, 18, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Print this sheet on A4 paper and place on a flat surface under smartphone camera.', pdfWidth / 2, 24, { align: 'center' });

    // Corner Fiducial Calibration Markers (4 High Contrast Squares)
    const marginX = 20;
    const marginY = 32;
    const pianoW = pdfWidth - marginX * 2; // ~257 mm
    const pianoH = 135; // mm

    const drawFiducialMarker = (cx: number, cy: number, label: string) => {
      const size = 12;
      doc.setFillColor(15, 23, 42);
      doc.rect(cx - size / 2, cy - size / 2, size, size, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(cx - size / 4, cy - size / 4, size / 2, size / 2, 'F');
      doc.setFillColor(15, 23, 42);
      doc.circle(cx, cy, size / 6, 'F');

      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(label, cx, cy + size / 2 + 3, { align: 'center' });
    };

    // Draw 4 Corner Calibration Targets
    drawFiducialMarker(marginX, marginY, 'TL (Corner 1)');
    drawFiducialMarker(marginX + pianoW, marginY, 'TR (Corner 2)');
    drawFiducialMarker(marginX + pianoW, marginY + pianoH, 'BR (Corner 3)');
    drawFiducialMarker(marginX, marginY + pianoH, 'BL (Corner 4)');

    // Piano Keyboard Frame
    const kbX = marginX + 10;
    const kbY = marginY + 10;
    const kbW = pianoW - 20;
    const kbH = pianoH - 20;

    // Draw White Keys
    const keyWidth = kbW / PIANO_KEYS_8.length;

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1.2);

    // Outline keyboard box
    doc.rect(kbX, kbY, kbW, kbH, 'S');

    PIANO_KEYS_8.forEach((key, index) => {
      const x = kbX + index * keyWidth;

      // Vertical key division lines
      if (index > 0) {
        doc.line(x, kbY, x, kbY + kbH);
      }

      // Note Label at bottom of key
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text(key.note, x + keyWidth / 2, kbY + kbH - 12, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Key ${index + 1}`, x + keyWidth / 2, kbY + kbH - 5, { align: 'center' });
    });

    // Draw Black Keys (C#, D#, F#, G#, A#)
    const blackKeyWidth = keyWidth * 0.55;
    const blackKeyHeight = kbH * 0.58;

    const blackKeyPositions = [0, 1, 3, 4, 5]; // After C, D, F, G, A
    const blackKeyLabels = ['C#4', 'D#4', 'F#4', 'G#4', 'A#4'];

    blackKeyPositions.forEach((pos, idx) => {
      const x = kbX + (pos + 1) * keyWidth - blackKeyWidth / 2;
      doc.setFillColor(15, 23, 42);
      doc.rect(x, kbY, blackKeyWidth, blackKeyHeight, 'F');

      // Label on black key
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(blackKeyLabels[idx], x + blackKeyWidth / 2, kbY + blackKeyHeight - 6, { align: 'center' });
    });

    // Footer Info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('BE Final Year Major Project: Virtual Piano Using Computer Vision | Department of Computer Engineering', pdfWidth / 2, pdfHeight - 8, { align: 'center' });

    return doc;
  }

  public downloadPDF() {
    const doc = this.generatePDF();
    doc.save('Virtual_Piano_Printable_Keyboard_A4.pdf');
  }
}

export const printableSheetService = new PrintableSheetService();
