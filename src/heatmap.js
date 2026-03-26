// src/heatmap.js
// Basic D3 heatmap that expects data in long format.

export function renderHeatmap({ d3, containerSelector, data, width = 900, height = 600 }) {
  const container = d3.select(containerSelector);
  container.selectAll("*").remove();

  const margin = { top: 80, right: 20, bottom: 120, left: 180 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const types = Array.from(new Set(data.map((d) => d.type)));
  const fields = Array.from(new Set(data.map((d) => d.field)));

  const x = d3.scaleBand().domain(fields).range([0, innerWidth]).padding(0.05);
  const y = d3.scaleBand().domain(types).range([0, innerHeight]).padding(0.05);

  const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 1]);

  const xAxis = d3.axisBottom(x).tickSize(0);
  const yAxis = d3.axisLeft(y).tickSize(0);

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-60)")
    .attr("dx", "-0.6em")
    .attr("dy", "0.1em");

  g.append("g").call(yAxis);

  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "4px 8px")
    .style("font-size", "12px")
    .style("display", "none");

  g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.field))
    .attr("y", (d) => y(d.type))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", (d) => (d.value == null ? "#f5f5f5" : color(d.value)))
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .html(
          `${d.type}.${d.field}<br/>Completeness: ${
            d.value == null ? "N/A" : (d.value * 100).toFixed(1) + "%"
          }`
        );
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  // Simple legend
  const legendWidth = 200;
  const legendHeight = 10;

  const legendScale = d3.scaleLinear().domain([0, 1]).range([0, legendWidth]);

  const legend = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top - 40})`);

  const legendGradientId = "heatmap-legend";

  const defs = svg.append("defs");
  const gradient = defs
    .append("linearGradient")
    .attr("id", legendGradientId)
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

  const steps = d3.range(0, 1.01, 0.1);
  steps.forEach((t) => {
    gradient
      .append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", color(t));
  });

  legend
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", `url(#${legendGradientId})`);

  const legendAxis = d3
    .axisBottom(legendScale)
    .ticks(5)
    .tickFormat((d) => `${Math.round(d * 100)}%`);

  legend
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);
}
