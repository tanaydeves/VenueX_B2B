# VenueX: B2B Hospitality Resource Marketplace
> **HackCelestial 3.0 Hackathon Project**  
> *Peer-to-Peer Hospitality Capacity & Asset Sharing with Nugen Domain-Aligned Intelligence*

---

## 🌟 Nugen Intelligence Domain Alignment Pipeline

Per the mandatory hackathon rules, VenueX does **not** make generic AI API calls. Instead, we customize and fine-tune a base open-weights model on our proprietary hospitality marketplace domain corpus using **Nugen's Domain Alignment API**, producing a specialized, domain-aligned model used for real-time inference in production.

```
┌────────────────────────────────────────┐
│               Base Model               │
│   (meta-llama/Meta-Llama-3-8B-Instruct) │
└───────────────────┬────────────────────┘
                    │
                    ▼  [Corpus Ingestion: /nugen-corpus/]
┌────────────────────────────────────────┐
│        Nugen Alignment Engine          │
│   - Category taxonomy & idle dynamics  │
│   - 6-D deterministic match scoring   │
│   - B2B deal negotiation mechanics    │
│   - Weather Digital Twin risk vectors │
│   - Hospitality SLAs & Porter tokens  │
└───────────────────┬────────────────────┘
                    │
                    ▼  [POST /api/v3/alignment-projects/create]
┌────────────────────────────────────────┐
│          Domain-Aligned Model          │
│  (venuex-domain-aligned-meta-llama-3)  │
└───────────────────┬────────────────────┘
                    │
                    ▼  [Inference Service: NugenAlignedInferenceService]
┌────────────────────────────────────────────────────────────────────────┐
│                   VenueX Real-Time App Features                        │
│  1. AI Domain Match Reasoning (6-D Compatibility Explanations)         │
│  2. Weather Digital Twin What-If Simulation & Environmental Narration  │
│  3. B2B Negotiation Proposal Assistant & Dispute Guardrails            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Domain Corpus Ingestion (`/nugen-corpus/`)

Our alignment corpus consists of 5 structured domain documents covering real-world hospitality logistics in coastal hubs (Navi Mumbai / Panvel / Mumbai):

1. [`01_resource_categories_and_use_cases.md`](file:///d:/VenueX/nugen-corpus/01_resource_categories_and_use_cases.md) — Asset classes (banquet spaces, Chiavari seating, combi-ovens, IP65 AV trussing, reefer transport vans) and idling monetization dynamics.
2. [`02_match_scoring_and_compatibility_logic.md`](file:///d:/VenueX/nugen-corpus/02_match_scoring_and_compatibility_logic.md) — 6-dimension weighted compatibility scoring mathematics and B2B procurement reasoning guidelines.
3. [`03_negotiation_deal_mechanics_and_tone.md`](file:///d:/VenueX/nugen-corpus/03_negotiation_deal_mechanics_and_tone.md) — Commercial deal lifecycles, structured proposals, refundable deposit escrow (10–25%), and negotiation etiquette.
4. [`04_weather_impact_and_digital_twin_simulation.md`](file:///d:/VenueX/nugen-corpus/04_weather_impact_and_digital_twin_simulation.md) — Environmental shock modeling for Monsoon downpours (>65mm/hr), cyclonic storms (>50km/h), heatwaves (>40°C), and low-lying flash flooding.
5. [`05_hospitality_sla_and_contingency_protocols.md`](file:///d:/VenueX/nugen-corpus/05_hospitality_sla_and_contingency_protocols.md) — Pre-dispatch inspection, automated 7km radius emergency asset swaps, Porter logistics buffers, and Delivery Token (D.T.) economics.

---

## 🚀 One-Time Setup & Alignment Execution

Run the automated, idempotent alignment setup script:

```bash
npm run setup:nugen
```

### What the Setup Script Does:
1. **Checks Idempotency**: Reads `.nugen-alignment-cache.json` and `.env` to prevent redundant training runs.
2. **Uploads Corpus Documents**: Ingests all markdown files under `/nugen-corpus/` to Nugen's document storage via `uploadDocument()`.
3. **Creates Alignment Project**: Calls `POST /api/v3/alignment-projects/create` targeting `meta-llama/Meta-Llama-3-8B-Instruct`.
4. **Polls Alignment Status**: Monitors alignment progress until `COMPLETED` and extracts the final `aligned_model_id`.
5. **Auto-Configures Environment**: Writes `NUGEN_ALIGNED_MODEL_ID` and `VITE_NUGEN_ALIGNED_MODEL_ID` to `.env` / `.env.local`.

---

## ⚙️ Environment Configuration (`.env` / `.env.local`)

```env
# Nugen Intelligence Credentials
NUGEN_API_KEY="your_nugen_api_key_here"
VITE_NUGEN_API_KEY="your_nugen_api_key_here"

# Targeted Base Model & Resulting Domain Model
NUGEN_BASE_MODEL_ID="meta-llama/Meta-Llama-3-8B-Instruct"
NUGEN_ALIGNED_MODEL_ID="venuex-domain-aligned-meta-llama-3-8b-instruct-v1"
VITE_NUGEN_ALIGNED_MODEL_ID="venuex-domain-aligned-meta-llama-3-8b-instruct-v1"
```

*Sign up at https://nugen.in/signup?invite=PILLAIUNIV2026 and get your API key from https://platform.nugen.in.*

---

## 💡 Application Features Powered by Aligned Model

### 1. Nugen Domain Match Explainer (`AiMatchExplanationModal`)
- Breaks down 6 compatibility dimensions (Category 25%, Quantity 20%, Dates 20%, Distance 15%, Price 10%, Delivery 10%).
- Calls `aiService.explainMatch()` on the domain-aligned model to provide quantitative, risk-managed procurement reasons with alignment provenance badges.

### 2. Weather Digital Twin What-If Simulator (`WeatherDigitalTwinModal`)
- Interactive synthetic weather simulator (Monsoon Rain >65mm/hr, Cyclonic Gale Winds >50km/h, Extreme Heat >42°C, Flash Flood).
- Calculates real-time operational telemetry deltas:
  - Effective Asset Availability (%)
  - Road Transit Risk Score (0–100)
  - Indoor Demand Surge (+%)
  - Logistics Buffer (+ mins)
- Generates live AI hazard assessments and automated mitigation recommendations via `aiService.explainWeatherImpact()`.

### 3. Domain-Aligned Negotiation Assistant (`ChatNegotiationModal`)
- Real-time "✨ Nugen AI Negotiation Assist" that formulates professional B2B counter-offers based on asset category, rental duration, deposit percent, and logistics SLAs.

---

## 🛠️ Development Server

```bash
# Run alignment setup
npm run setup:nugen

# Start local Vite development server
npm run dev
```
