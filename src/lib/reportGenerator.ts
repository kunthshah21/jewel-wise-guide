import { generateCategoryPDF, type CategoryReportData } from "./pdfReportGenerator";

// Individual category report generators using the PDF generator
export async function generateBraceletReport(data: CategoryReportData) {
  await generateCategoryPDF("Bracelet", data);
}

export async function generateRingReport(data: CategoryReportData) {
  await generateCategoryPDF("Ring", data);
}

export async function generateNecklaceReport(data: CategoryReportData) {
  await generateCategoryPDF("Necklace", data);
}

export async function generateBangleReport(data: CategoryReportData) {
  await generateCategoryPDF("Bangle", data);
}

export async function generateEarringReport(data: CategoryReportData) {
  await generateCategoryPDF("Earring", data);
}

export async function generatePendantReport(data: CategoryReportData) {
  await generateCategoryPDF("Pendant", data);
}

// Re-export the comprehensive report generator
export { generateComprehensivePDF } from "./pdfReportGenerator";
