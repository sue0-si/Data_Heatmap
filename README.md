# Data_Heatmap

This lightweight web application for visualizing GraphQL data completeness with a D3 heatmap uses a small Node/Express backend to query a GraphQL API and a vanilla JavaScript frontend to render a heatmap showing how complete each field is across node types.

## Project structure

```text
backend/
├── package.json
├── server.js
└── .env

src/
├── main.js
├── api.js
└── heatmap.js

index.html
```

## What the app does

- Connects to a GraphQL API through a Node/Express backend.
- Computes or returns completeness metrics in a flat format such as:
  - `{ type: "User", field: "email", value: 0.92 }`
- Renders a D3 heatmap where:
  - Rows represent GraphQL node types.
  - Columns represent fields/attributes.
  - Cell color represents completeness.
- Supports basic filtering from the frontend.

## Tech stack

### Frontend
- Vanilla JavaScript
- D3.js
- HTML/CSS

### Backend
- Node.js
- Express
- node-fetch
- dotenv

### Data source
- GraphQL API

## Prerequisites

Before running the project, make sure the following are available:

- Node.js 18+ recommended
- npm
- A reachable GraphQL endpoint
- A valid auth token if your GraphQL API requires authentication
- Python 3 or another simple static file server for the frontend

## Backend setup

1. Go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
GRAPHQL_ENDPOINT=https://countries.trevorblades.com/
GRAPHQL_AUTH_HEADER=Authorization
GRAPHQL_AUTH_TOKEN=Bearer your-token-here
PORT=3000
```
Right now, Countries GraphQL API is used for testing and show the code is working.

4. Start the backend:

```bash
npm run start
```

If everything starts correctly, the API should be available at:

```text
http://localhost:3000
```

### Available backend endpoints

#### `GET /health`
Returns a simple health response.

Example response:

```json
{ "status": "ok" }
```

#### `GET /completeness`
Returns completeness data for the frontend heatmap.

Example response:

```json
[
  {
    "type": "Country",
    "field": "native",
    "value": 0.996,
    "sampleCount": 250,
    "nonNullCount": 249
  },
  {
    "type": "Country",
    "field": "phone",
    "value": 1,
    "sampleCount": 250,
    "nonNullCount": 250
  },
  {
    "type": "Country",
    "field": "capital",
    "value": 0.78,
    "sampleCount": 250,
    "nonNullCount": 195
  },
]
```

## Frontend setup

The frontend is a static site made of `index.html` and the files in `src/`.

From the project root, start a simple static server.

### Option 1: Python

```bash
python -m http.server 8000
```

### Option 2: Node

```bash
npx serve .
```

Then open the app in a browser:

```text
http://localhost:8000
```

> Do not open `index.html` directly with `file://`. ES module imports work more reliably when served over HTTP.

## Frontend file overview

### `index.html`
- Defines the page layout.
- Loads D3 through an ES module CDN import.
- Calls `initApp()` from `src/main.js`.

### `src/main.js`
- Bootstraps the application.
- Loads completeness data from the backend.
- Applies UI filters.
- Re-renders the heatmap when filters change.

### `src/api.js`
- Contains frontend fetch logic.
- Calls the backend `/completeness` endpoint.
- Returns JSON data to the app.

### `src/heatmap.js`
- Contains D3 rendering logic.
- Builds axes, rectangles, tooltips, and legend.
- Maps completeness values to colors.

## How the data flows

1. The browser loads `index.html`.
2. `main.js` calls `fetchCompleteness()` from `api.js`.
3. `api.js` requests `http://localhost:3000/completeness`.
4. The backend returns completeness data.
5. `main.js` filters the data based on user input.
6. `heatmap.js` renders the filtered result with D3.


### Field meanings
- `type`: GraphQL node type name
- `field`: field or attribute name
- `value`: completeness score from `0` to `1`

## Development notes

- The current backend is using Countries GraphQL API and later be replaced with any GraphQL introspection and sampling logic.
- CORS is enabled in the sample backend for local development.
- For production use, restrict allowed origins and secure credentials appropriately.
- If the schema is large, consider adding backend caching and pagination-aware sampling.

## Example local workflow

Open two terminals.

### Terminal 1: start backend

```bash
cd backend
npm install
npm run start
```

### Terminal 2: start frontend server

From the project root:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Troubleshooting

### The frontend says “Failed to load data”
Check the following:
- The backend is running on port `3000`.
- `src/api.js` points to the correct backend base URL.
- The `/completeness` endpoint returns valid JSON.
- Browser console does not show CORS or network errors.

### The heatmap is blank
Check the following:
- The backend returned non-empty data.
- Each item includes `type`, `field`, and `value`.
- `value` is a number between `0` and `1` or `null`.

### GraphQL requests fail
Check the following:
- `GRAPHQL_ENDPOINT` is correct.
- Auth header and token are valid.
- The GraphQL API is reachable from the machine running the backend.

## Next improvements

Possible enhancements for this project include:

- Add `/schema-summary` to expose types and fields separately.
- Replace mock data with GraphQL introspection and sampled node queries.
- Add search by field name and node type.
- Add threshold highlighting for sparse fields.
- Cache results to improve performance.
- Add deployment configuration for AWS.
