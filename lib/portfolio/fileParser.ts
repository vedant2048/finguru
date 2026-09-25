import Papa from "papaparse";
import * as XLSX from "xlsx";
import { PortfolioError } from "./errors";
import type { ParsedFile } from "./types";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const SUPPORTED_EXTENSIONS = [".csv", ".xlsx", ".xls"] as const;

type Grid = unknown[][];

/** Scores how likely a row is to be the header row. Supplied by the normalizer. */
export type HeaderScorer = (cells: string[]) => number;

const HEADER_SEARCH_ROWS = 25;

export function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx).toLowerCase();
}

export function assertSupportedUpload(fileName: string, size: number): void {
  const ext = getFileExtension(fileName);
  if (!(SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)) {
    throw new PortfolioError(
      "UNSUPPORTED_FILE",
      `"${fileName}" is not a supported file. Please upload a .csv, .xlsx or .xls file.`
    );
  }
  if (size === 0) {
    throw new PortfolioError("EMPTY_FILE", "The uploaded file is empty.");
  }
  if (size > MAX_UPLOAD_BYTES) {
    throw new PortfolioError(
      "FILE_TOO_LARGE",
      `The file is larger than ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB. Please upload a smaller file.`
    );
  }
}

/**
 * Parses a CSV / Excel file into structured rows keyed by the original header text.
 * Header detection tolerates broker exports that have title/preamble lines above the table.
 */
export function parsePortfolioFile(
  buffer: Buffer,
  fileName: string,
  scoreHeader: HeaderScorer
): ParsedFile {
  assertSupportedUpload(fileName, buffer.length);
  const ext = getFileExtension(fileName);

  if (ext === ".csv") {
    return gridToParsedFile(parseCsvGrid(buffer), fileName, scoreHeader);
  }

  const { grids } = parseWorkbookGrids(buffer);
  // Prefer the sheet whose best header row scores highest.
  let best: { parsed: ParsedFile; score: number } | null = null;
  for (const { sheetName, grid } of grids) {
    const header = findHeaderRow(grid, scoreHeader);
    if (header && (!best || header.score > best.score)) {
      best = { parsed: gridToParsedFile(grid, fileName, scoreHeader, sheetName), score: header.score };
    }
  }
  if (!best) {
    throw new PortfolioError(
      "MISSING_COLUMNS",
      "We couldn't find a holdings table in this workbook. Make sure one sheet has a header row with the company name, quantity and average price."
    );
  }
  return best.parsed;
}

function parseCsvGrid(buffer: Buffer): Grid {
  const text = buffer.toString("utf8").replace(/^﻿/, "");
  if (text.includes("\u0000")) {
    throw new PortfolioError("INVALID_CSV", "This file doesn't look like a valid CSV (it contains binary data).");
  }

  const result = Papa.parse<string[]>(text, { skipEmptyLines: "greedy" });
  const fatal = result.errors.filter((e) => e.type === "Quotes");
  if (fatal.length > 0) {
    throw new PortfolioError(
      "INVALID_CSV",
      "The CSV file is malformed (unbalanced quotes).",
      fatal.slice(0, 5).map((e) => `Row ${(e.row ?? 0) + 1}: ${e.message}`)
    );
  }
  if (result.data.length < 2) {
    throw new PortfolioError("INVALID_CSV", "The CSV file needs a header row and at least one holding.");
  }
  return result.data;
}

function parseWorkbookGrids(buffer: Buffer): { grids: { sheetName: string; grid: Grid }[] } {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  } catch {
    throw new PortfolioError("INVALID_EXCEL", "We couldn't read this Excel file. It may be corrupted or password-protected.");
  }
  if (!workbook.SheetNames?.length) {
    throw new PortfolioError("INVALID_EXCEL", "The Excel workbook has no sheets.");
  }

  const grids = workbook.SheetNames.map((sheetName) => ({
    sheetName,
    grid: XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
      header: 1,
      defval: "",
      blankrows: false,
      raw: true,
    }),
  })).filter((g) => g.grid.length > 0);

  if (grids.length === 0) {
    throw new PortfolioError("INVALID_EXCEL", "Every sheet in the workbook is empty.");
  }
  return { grids };
}

function findHeaderRow(grid: Grid, scoreHeader: HeaderScorer): { index: number; score: number } | null {
  let best: { index: number; score: number } | null = null;
  for (let i = 0; i < Math.min(grid.length, HEADER_SEARCH_ROWS); i++) {
    const cells = (grid[i] ?? []).map((c) => String(c ?? "").trim());
    const score = scoreHeader(cells);
    if (score > 0 && (!best || score > best.score)) best = { index: i, score };
  }
  return best;
}

function gridToParsedFile(grid: Grid, fileName: string, scoreHeader: HeaderScorer, sheetName?: string): ParsedFile {
  const header = findHeaderRow(grid, scoreHeader);
  // Fall back to the first row so the normalizer can report exactly which columns are missing.
  const headerIndex = header?.index ?? 0;
  const headers = (grid[headerIndex] ?? []).map((c) => String(c ?? "").trim());

  const rows: Record<string, unknown>[] = [];
  for (let r = headerIndex + 1; r < grid.length; r++) {
    const cells = grid[r] ?? [];
    if (cells.every((c) => String(c ?? "").trim() === "")) continue;
    const row: Record<string, unknown> = { __rowNumber: r + 1 };
    headers.forEach((h, c) => {
      if (h) row[h] = cells[c];
    });
    rows.push(row);
  }

  return { fileName, headers, rows, headerRowNumber: headerIndex + 1, sheetName };
}
