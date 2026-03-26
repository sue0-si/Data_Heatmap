// src/main.js
// Hook up API, filters, and the heatmap renderer

import { fetchCompleteness } from "./api.js";
import { renderHeatmap } from "./heatmap.js";

export function initApp({ d3 }) {
  const typeFilterInput = document.getElementById("typeFilter");
  const minCompletenessInput = document.getElementById("minCompleteness");

  let rawData = [];

  function applyFilters() {
    const typeFilter = typeFilterInput.value.trim().toLowerCase();
    const minCompleteness = Number(minCompletenessInput.value || 0) / 100;

    const filtered = rawData.filter((d) => {
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

  async function init() {
    try {
      rawData = await fetchCompleteness();
      applyFilters();
    } catch (err) {
      console.error(err);
      document.getElementById("heatmap-container").innerText =
        "Failed to load data.";
    }
  }

  typeFilterInput.addEventListener("input", () => applyFilters());
  minCompletenessInput.addEventListener("input", () => applyFilters());

  init();
}
