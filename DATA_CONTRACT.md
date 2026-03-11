# SchemeSetu — Data Contract
**Version 1.0 | Backend Architect: Sulieman**

---

## Endpoint

```
POST http://localhost:5000/api/match-schemes
Content-Type: application/json
```

---

## Request — What Aadarsh sends (Frontend → Backend)

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

| Field           | Type    | Required | Notes                                      |
|-----------------|---------|----------|--------------------------------------------|
| `age`           | int     | ✅       | 5–100                                      |
| `income`        | int     | ✅       | Midpoint of range (auto-calculated)        |
| `income_min`    | int     | ✅       | Lower bound of selected income range       |
| `income_max`    | int     | ✅       | Upper bound — used for eligibility checks  |
| `occupation`    | string  | ✅       | lowercase: `student`, `farmer`, `salaried`, `self-employed`, `unemployed`, `business` |
| `gender`        | string  | ✅       | lowercase: `male`, `female`, `other`       |
| `category`      | string  | ✅       | lowercase: `general`, `obc`, `sc`, `st`   |
| `education_level` | string | ✅      | lowercase: `school`, `pre-matric`, `post-matric`, `undergraduate`, `diploma`, `postgraduate` |

---

## Response — What Backend sends back (Backend → Frontend)

```json
{
  "status": "success",
  "match_count": 3,
  "eligible_schemes": [
    {
      "scheme_name": "Post Matric Scholarship for SC Students",
      "description":  "Financial assistance for SC category students...",
      "apply_link":   "https://scholarships.gov.in/"
    }
  ]
}
```

| Field              | Type         | Notes                                      |
|--------------------|--------------|--------------------------------------------|
| `status`           | string       | `"success"` or `"error"`                  |
| `match_count`      | int          | Number of matched schemes (0 is valid)    |
| `eligible_schemes` | array        | Empty array `[]` if no match              |
| `scheme_name`      | string       | Display name of the scheme                |
| `description`      | string       | Full description                           |
| `apply_link`       | string       | Official application URL                  |

---

## Error Response

```json
{
  "status": "error",
  "message": "Missing fields: gender, category"
}
```

HTTP Status: `400 Bad Request`

---

## How to add schemes (For Aarsh)

Each scheme in `schemes.json` follows this structure:

```json
{
  "scheme_name": "Scheme Name Here",
  "description": "Full description...",
  "apply_link":  "https://official-link.gov.in/",
  "eligibility": {
    "min_age":         18,
    "max_age":         35,
    "max_income":      250000,
    "gender":          ["female"],
    "category":        ["sc", "st"],
    "occupation":      ["student", "unemployed"],
    "education_level": ["undergraduate"]
  }
}
```

> **All eligibility fields are optional.** Only include what actually applies.
> Use `"any"` in arrays to match all values. e.g. `"category": ["any"]`

---

## To activate real backend (For Aadarsh)

In `js/api.js`, change line 9:
```js
const USE_DUMMY = false;  // ← flip this
```

That's it. The response shape is identical to the dummy data.
