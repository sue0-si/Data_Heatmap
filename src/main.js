// Read CSV and render heatmap using D3.js

import { renderHeatmap } from "./heatmap.js";

export function initApp({ d3 }) {
  const typeFilterInput = document.getElementById("typeFilter");
  const minCompletenessInput = document.getElementById("minCompleteness");
  const fileInput = document.getElementById("fileInput");
  const dropZone = document.getElementById("dropZone");

  let rawCells = []; // [{ type, field, value }, completeness is computed later]

  function parseCsvText(text) {
    const rows = d3.csvParse(text);

    if (!rows.length) {
      alert("CSV has no rows.");
      return [];
    }

    const columns = rows.columns; // header names
    const cells = [];

    rows.forEach((row) => {
      columns.forEach((col) => {
        const raw = row[col];
        // Simple convention: if column name contains '.', treat part before dot as type.
        // Example: "User.email" => type="User", field="email".
        let type = "Default";
        let field = col;
        if (col.includes(".")) {
          const [t, f] = col.split(".");
          type = t;
          field = f;
        }
        cells.push({
          type,
          field,
          value: raw === undefined || raw === null ? "" : String(raw).trim()
        });
      });
    });

    return cells;
  }

  function computeCompleteness(cells) {
    // Group by (type, field) and compute % non-empty. [web:73][web:78]
    const statsMap = new Map();

    for (const cell of cells) {
      const key = `${cell.type}||${cell.field}`;
      let s = statsMap.get(key);
      if (!s) {
        s = { type: cell.type, field: cell.field, count: 0, nonEmpty: 0 };
        statsMap.set(key, s);
      }
      s.count += 1;
      if (cell.value !== "" && cell.value !== "null" && cell.value !== "undefined") {
        s.nonEmpty += 1;
      }
    }

    const summary = [];
    for (const s of statsMap.values()) {
      const value = s.count === 0 ? null : s.nonEmpty / s.count;
      summary.push({
        type: s.type,
        field: s.field,
        value
      });
    }
    return summary;
  }

  function applyFilters() {
    const typeFilter = typeFilterInput.value.trim().toLowerCase();
    const minCompleteness = Number(minCompletenessInput.value || 0) / 100;

    const completenessSummary = computeCompleteness(rawCells);

    const filtered = rawCells.filter((d) => {
      const matchesType = !typeFilter || d.type.toLowerCase().includes(typeFilter);
      const meetsThreshold =
        isNaN(minCompleteness) || d.value == null || d.value >= minCompleteness;
      return matchesType && meetsThreshold;
    });

    renderHeatmap({
      d3,
      containerSelector: "#heatmap-container",
      data: filtered,
    });
  }

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        rawCells = parseCsvText(text);
        if (!rawCells.length) {
          document.getElementById("heatmap-container").innerText =
            "No data parsed from CSV.";
          return;
        }
        applyFilters();
      } catch (err) {
        console.error(err);
        alert("Failed to parse CSV.");
      }
    };
    reader.readAsText(file);
  }

  // File input
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    handleFile(file);
  });

  // Drag & drop
  ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = "#007bff";
    });
  });
  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = "#ccc";
    });
  });
  dropZone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
  });

  typeFilterInput.addEventListener("input", () => applyFilters());
  minCompletenessInput.addEventListener("input", () => applyFilters());

  init();
}
