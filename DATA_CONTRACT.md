# SchemeSetu — Data Contract (v5.0)
**Data Source: `data/schemesetu_v5.json` | 66 schemes | 3 age groups**

---

## Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/match-schemes` | Match schemes by user profile |
| `GET` | `/api/search-schemes?q=keyword` | Keyword search |
| `GET` | `/api/schemes` | List all schemes (compact) |
| `GET` | `/api/schemes/<id>` | Full scheme detail |
| `GET` | `/api/schemes/name/<name>` | Lookup by name (partial match) |

---

## 1. POST `/api/match-schemes` — Profile Matching

### Request (Frontend → Backend)

```json
{
  "age":             25,
  "income":          150000,
  "income_min":      100000,
  "income_max":      200000,
  "occupation":      "student",
  "gender":          "female",
  "category":        "sc",
  "education_level": "undergraduate"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `age` | int | ✅ | 5–100 |
| `income` | int | ✅ | Midpoint of range |
| `income_min` | int | optional | Lower bound |
| `income_max` | int | optional | Upper bound (used for eligibility) |
| `occupation` | string | ✅ | `student`, `farmer`, `salaried`, `self-employed`, `unemployed`, `business` |
| `gender` | string | ✅ | `male`, `female`, `other` |
| `category` | string | ✅ | `general`, `obc`, `sc`, `st` |
| `education_level` | string | ✅ | `school`, `pre-matric`, `post-matric`, `undergraduate`, `diploma`, `postgraduate` |

### Response

```json
{
  "status": "success",
  "match_count": 16,
  "eligible_schemes": [
    {
      "id": "SCH_005",
      "scheme_name": "National Means-cum-Merit Scholarship (NMMS)",
      "shortName": "NMMS",
      "description": "...",
      "amount": "₹12,000/year",
      "deadline": "Annual — NSP registration opens June",
      "application_mode": "online",
      "apply_link": "https://scholarships.gov.in/fresh/newstdRegfrmInstruction",
      "category": "Scholarship",
      "govtLevel": "Central Government",
      "how_to_apply": ["Step 1: ...", "Step 2: ..."],
      "required_documents": ["Aadhaar card", "..."],
      "optional_documents": ["Caste certificate", "..."],
      "tags": ["scholarship", "merit"]
    }
  ]
}
```

---

## 2. GET `/api/schemes` — List (compact)

Returns up to 50 schemes. Supports filters: `?category=Scholarship&govt_level=Central Government`

Each item includes: `id`, `name`, `shortName`, `ministry`, `description`, `amount`, `deadline`, `application_mode`, `apply_link`, `tags`, `govt_level`

---

## 3. GET `/api/schemes/<id>` — Full Detail

Returns full scheme with all fields plus `how_to_apply_rich` (structured steps object):

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `SCH_005` |
| `name` | string | Full scheme name |
| `shortName` | string | Abbreviated name |
| `ministry` | string | Governing ministry |
| `category` | string | Scheme category |
| `launchedYear` | int | Year launched |
| `description` | string | Full description |
| `amount` | string | Benefit amount |
| `deadline` | string | Application deadline |
| `tags` | string[] | Search tags |
| `eligibility` | object | `{gender, ageLimit, residency, otherCriteria}` |
| `benefits` | object | `{financial: [...], nonFinancial: [...]}` |
| `application_mode` | string | `"online"` or `"offline"` |
| `apply_link` | string | Direct URL (online only, empty for offline) |
| `how_to_apply` | string[] | Flat step strings from data |
| `how_to_apply_rich` | object | Structured: `{steps, estimated_time_minutes, required_documents, optional_documents, application_mode, apply_link, support_phone, support_email}` |
| `required_documents` | string[] | Required documents list |
| `optional_documents` | string[] | Optional documents list |
| `helplineNumber` | string | Helpline phone or email |
| `govt_level` | string | Government level |

---

## v5.0 Key Fields

### `application_mode`
- `"online"` → 38 schemes — has a direct `apply_link` (registration/application page URL)
- `"offline"` → 28 schemes — no `apply_link`, has step-by-step physical instructions

### `apply_link` (online schemes only)
Points to direct apply/registration pages, **not** homepages. Examples:
- PM-KISAN → `/RegistrationFormNew.aspx`
- PMFBY → `/farmerRegistrationForm`
- PM SVANidhi → `/Schemes/ApplyLoan`
- PMAY-U → `/open/find_beneficiary_details.aspx`
- Stand-Up India → `/Login/SUI_Register`

### `how_to_apply` (all 66 schemes)
Array of step strings. Offline schemes name exact offices/locations (Gram Panchayat, District Social Security Office, Anganwadi Centre, BOCW office, etc.)

---

## Error Response

```json
{
  "status": "error",
  "message": "Missing fields: gender, category"
}
```

HTTP Status: `400` (bad request) or `404` (not found) or `500` (server error)

---

## Data Counts

| Age Group | Label | Schemes |
|-----------|-------|---------|
| 6–18 | Children & Students | 26 |
| 18–25 | Youth | 21 |
| 25–45 | Adults | 19 |
| **Total** | | **66** |

---

## To activate real backend

In `js/api.js`:
```js
const USE_DUMMY = false;  // ← flip this to use live API
```
