import PDFDocument from "pdfkit/js/pdfkit.standalone";
import { readFileSync } from "fs";
import { NextResponse } from "next/server";
import { formatDuration } from "@/lib/duration";
import { asArray } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import { resolveReportFont } from "@/lib/report-font";
import {
  normalizeImportantNotes,
  resultEvaluationNotes,
  type DimensionScore,
  type SurveyResult,
} from "@/lib/satir";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { survey: true },
  });

  if (!submission) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const result = submission.result as unknown as SurveyResult;
  const scores = asArray<DimensionScore>(result.scores);
  const notes = normalizeImportantNotes(asArray<string>(result.notes));
  const dominantLabel = result.dominantLabel ?? "主导应对姿态";
  const evaluationNotes = result.evaluationNotes?.length ? result.evaluationNotes : resultEvaluationNotes;
  const pdfBuffer = await createReportPdf({
    title: submission.survey.title,
    respondent: submission.respondent,
    createdAt: submission.createdAt,
    durationSeconds: submission.durationSeconds,
    dominant: result.dominant,
    dominantLabel,
    scores,
    notes,
    evaluationNotes,
  });

  const body = new ArrayBuffer(pdfBuffer.byteLength);
  new Uint8Array(body).set(pdfBuffer);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        `${submission.survey.title}-${submission.respondent}.pdf`,
      )}"`,
    },
  });
}

type ReportData = {
  title: string;
  respondent: string;
  createdAt: Date;
  durationSeconds?: number | null;
  dominant: string;
  dominantLabel: string;
  scores: DimensionScore[];
  notes: string[];
  evaluationNotes: string[];
};

function createReportPdf(data: ReportData) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];
    const reportFont = resolveReportFont();

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (reportFont?.path) {
      const fontData = readFileSync(reportFont.path);
      if (reportFont.face) {
        doc.font(fontData, reportFont.face);
      } else {
        doc.font(fontData);
      }
    }

    drawReport(doc, data);
    doc.end();
  });
}

function drawReport(doc: PDFKit.PDFDocument, data: ReportData) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;

  doc.fillColor("#111827").fontSize(22).text(data.title, { align: "center" });
  doc.moveDown(0.8);
  doc.fontSize(11).fillColor("#4b5563").text(`姓名：${data.respondent}`, left);
  doc.text(`完成时间：${formatDate(data.createdAt)}`);
  doc.text(`测评用时：${formatDuration(data.durationSeconds)}`);
  doc.moveDown(0.8);

  drawDominantBox(doc, left, pageWidth, data.dominantLabel, data.dominant);

  ensureSpace(doc, 230);
  drawSectionTitle(doc, "得分明细");
  drawScoreTable(doc, data.scores);

  doc.moveDown(0.8);
  ensureSpace(doc, 230);
  drawSectionTitle(doc, "维度柱状图");
  drawBarChart(doc, data.scores);

  doc.moveDown(0.8);
  ensureSpace(doc, 130);
  drawSectionTitle(doc, "结果评定");
  data.evaluationNotes.forEach((note) => {
    doc.fontSize(11).fillColor("#374151").text(note, {
      lineGap: 4,
    });
  });

  doc.moveDown(0.8);
  ensureSpace(doc, 150);
  drawSectionTitle(doc, "重要说明");
  data.notes.forEach((note, index) => {
    doc.fontSize(11).fillColor("#374151").text(`${index + 1}. ${note}`, {
      lineGap: 4,
    });
  });

  doc.moveDown(1.2);
  doc.fontSize(9).fillColor("#6b7280").text("本测评为自评工具，仅供个人成长参考。", {
    align: "center",
  });
}

function drawDominantBox(doc: PDFKit.PDFDocument, left: number, width: number, label: string, dominant: string) {
  const top = doc.y;
  const height = 46;

  doc.roundedRect(left, top, width, height, 8).fill("#e8f4ff");
  doc.fillColor("#0b70d8").fontSize(12).text(label, left + 16, top + 16, {
    width: 160,
  });
  doc.fontSize(20).text(dominant, left + width - 120, top + 12, {
    width: 104,
    align: "right",
  });
  doc.y = top + height + 28;
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(15).fillColor("#111827").text(title);
  doc.moveDown(0.5);
}

function ensureSpace(doc: PDFKit.PDFDocument, requiredHeight: number) {
  const bottom = doc.page.height - doc.page.margins.bottom;

  if (doc.y + requiredHeight > bottom) {
    doc.addPage();
  }
}

function drawScoreTable(doc: PDFKit.PDFDocument, scores: DimensionScore[]) {
  const left = doc.page.margins.left;
  const startY = doc.y;
  const widths = [110, 96, 306];
  const rowHeight = 30;
  const headers = ["维度", "得分", "结果评定"];

  drawTableRow(doc, left, startY, widths, rowHeight, headers, true);

  scores.forEach((score, index) => {
    drawTableRow(
      doc,
      left,
      startY + rowHeight * (index + 1),
      widths,
      rowHeight,
      [score.name, score.average.toFixed(2), score.band],
      false,
    );
  });

  doc.y = startY + rowHeight * (scores.length + 1) + 8;
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  widths: number[],
  height: number,
  cells: string[],
  isHeader: boolean,
) {
  let currentX = x;
  doc.fontSize(10).fillColor(isHeader ? "#111827" : "#374151");

  cells.forEach((cell, index) => {
    doc.rect(currentX, y, widths[index], height).fillAndStroke(isHeader ? "#cdeaff" : "#ffffff", "#dbeafe");
    doc.fillColor(isHeader ? "#111827" : "#374151").text(cell, currentX + 6, y + 8, {
      width: widths[index] - 12,
      height: height - 8,
      ellipsis: true,
    });
    currentX += widths[index];
  });
}

function drawBarChart(doc: PDFKit.PDFDocument, scores: DimensionScore[]) {
  const left = doc.page.margins.left + 14;
  const top = doc.y + 8;
  const chartWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right - 28;
  const chartHeight = 140;
  const baseline = top + chartHeight;
  const barAreaWidth = chartWidth / scores.length;

  doc.strokeColor("#e5e7eb").lineWidth(1);
  for (let tick = 0; tick <= 5; tick += 1) {
    const y = baseline - (tick / 5) * chartHeight;
    doc.moveTo(left, y).lineTo(left + chartWidth, y).stroke();
    doc.fontSize(8).fillColor("#6b7280").text(String(tick), left - 12, y - 5, { width: 10, align: "right" });
  }

  scores.forEach((score, index) => {
    const barHeight = (score.average / 5) * chartHeight;
    const barWidth = Math.min(42, barAreaWidth * 0.52);
    const x = left + index * barAreaWidth + (barAreaWidth - barWidth) / 2;
    const y = baseline - barHeight;

    doc.fillColor("#1689f9").rect(x, y, barWidth, barHeight).fill();
    doc.fillColor("#111827").fontSize(9).text(score.average.toFixed(2), x - 8, y - 14, {
      width: barWidth + 16,
      align: "center",
    });
    doc.fillColor("#4b5563").fontSize(9).text(score.name, left + index * barAreaWidth, baseline + 8, {
      width: barAreaWidth,
      align: "center",
    });
  });

  doc.y = baseline + 30;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
