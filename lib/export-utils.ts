"use client";

interface ExportMeta {
  viewName: string;
  customerName: string;
  date: string;
}

export async function exportVisualSnapshot(gridElement: HTMLElement, meta: ExportMeta) {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");

  const canvas = await html2canvas(gridElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Branded header
  pdf.setFontSize(20);
  pdf.setTextColor(226, 0, 116); // magenta
  pdf.text("All Is Well", 15, 15);
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`${meta.viewName} Dashboard — ${meta.customerName}`, 15, 22);
  pdf.text(`Generated: ${meta.date}`, 15, 28);

  // Add captured image
  const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 15, 35, pdfWidth, Math.min(pdfHeight, 170));

  pdf.save(`all-is-well-${meta.viewName.toLowerCase()}-snapshot.pdf`);
}

export function exportDataReport() {
  window.print();
}
