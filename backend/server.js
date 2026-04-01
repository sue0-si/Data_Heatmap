// server.js
// Simple Express server to serve the completeness data to the D3 frontend.
// TODO: Compute completeness by querying GraphQL API.

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
const GRAPHQL_AUTH_HEADER = process.env.GRAPHQL_AUTH_HEADER;
const GRAPHQL_AUTH_TOKEN = process.env.GRAPHQL_AUTH_TOKEN;

// Small helper to call GraphQL
async function callGraphQL(query, variables = {}) {
  const headers = {
    "Content-Type": "application/json"
  };
  if (GRAPHQL_AUTH_HEADER && GRAPHQL_AUTH_TOKEN) {
    headers[GRAPHQL_AUTH_HEADER] = GRAPHQL_AUTH_TOKEN;
  }

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL HTTP error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

async function sampleCompleteness() {
  const query = `
    query SampleCompletenessData {
      countries {
        code
        name
        native
        phone
        capital
        currency
        emoji
        emojiU
      }
      continents {
        code
        name
      }
      languages {
        code
        name
        native
        rtl
      }
    }
  `;

  const data = await callGraphQL(query);

  function computeCompleteness(typeName, items, fields) {
    const sampleCount = Array.isArray(items) ? items.length : 0;

    return fields.map((field) => {
      if (sampleCount === 0) {
        return {
          type: typeName,
          field,
          value: null,
          sampleCount: 0,
          nonNullCount: 0
        };
      }

      const nonNullCount = items.filter(
        (item) => item && item[field] !== null && item[field] !== undefined
      ).length;

      return {
        type: typeName,
        field,
        value: nonNullCount / sampleCount,
        sampleCount,
        nonNullCount
      };
    });
  }

  const countryMetrics = computeCompleteness("Country", data.countries, [
    "code",
    "name",
    "native",
    "phone",
    "capital",
    "currency",
    "emoji",
    "emojiU"
  ]);

  const continentMetrics = computeCompleteness("Continent", data.continents, [
    "code",
    "name"
  ]);

  const languageMetrics = computeCompleteness("Language", data.languages, [
    "code",
    "name",
    "native",
    "rtl"
  ]);

  return [...countryMetrics, ...continentMetrics, ...languageMetrics];
}

// Allow CORS from frontend for now (dev-friendly)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // tighten for production
  res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Main endpoint for the D3 frontend
app.get("/completeness", async (req, res) => {
  try {
    const data = await sampleCompleteness();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute completeness" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint: ${GRAPHQL_ENDPOINT}`);
});
