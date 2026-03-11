"""
SchemeSetu — Flask Backend
Route: POST /api/match-schemes
Reads 55schemes.json and filters by user profile.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import re

app = Flask(__name__)
CORS(app)

# ─── Load schemes database ──────────────────────────────────────────────────
SCHEMES_FILE = os.path.join(os.path.dirname(__file__), "55schemes.json")

def load_schemes():
    """
    Flatten the nested 55schemes.json into a single list of scheme dicts.
    Each scheme gets an extra 'age_min' and 'age_max' from its parent group.
    """
    with open(SCHEMES_FILE, "r", encoding="utf-8-sig") as f:
        data = json.load(f)

    all_schemes = []
    for group in data["schemeSetu"]["ageGroups"]:
        # Parse group-level age range like "6-18", "18-25", "25-45"
        group_age_min, group_age_max = _parse_age_range(group.get("ageRange", ""))
        for scheme in group["schemes"]:
            scheme["_group_age_min"] = group_age_min
            scheme["_group_age_max"] = group_age_max
            all_schemes.append(scheme)
    return all_schemes


# ─── Text Parsing Helpers ────────────────────────────────────────────────────

def _parse_age_range(text):
    """Extract min and max age from text like '6-18', '6 to 14 years', 'Below 10 years'."""
    if not text:
        return 0, 100

    text = text.lower().strip()

    # Pattern: "X-Y" or "X to Y"
    m = re.search(r'(\d+)\s*(?:-|to)\s*(\d+)', text)
    if m:
        return int(m.group(1)), int(m.group(2))

    # Pattern: "below X" or "under X"
    m = re.search(r'(?:below|under|up\s*to|upto)\s*(\d+)', text)
    if m:
        return 0, int(m.group(1))

    # Pattern: "above X" or "X years or above" or "X+"
    m = re.search(r'(?:above|over)\s*(\d+)', text)
    if m:
        return int(m.group(1)), 100
    m = re.search(r'(\d+)\s*(?:years?\s*(?:or\s*)?(?:above|older|\+))', text)
    if m:
        return int(m.group(1)), 100

    # Single number
    m = re.search(r'(\d+)', text)
    if m:
        return int(m.group(1)), int(m.group(1))

    return 0, 100


def _parse_income_limit(text):
    """
    Extract maximum income from otherCriteria text.
    Looks for patterns like 'income below Rs. 2.5 lakh', 'income less than 8 lakh'.
    Returns None if no income limit found.
    """
    if not text:
        return None

    text = text.lower()

    # Pattern: "income below/less than Rs. X lakh" or "income not exceed Rs X lakh"
    m = re.search(
        r'income\s+(?:below|less\s+than|not\s+exceed|under|upto|up\s+to|limit[:\s]*|ceiling[:\s]*)'
        r'[^0-9]*?(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)',
        text
    )
    if m:
        return int(float(m.group(1)) * 100000)

    # Pattern: "Rs. X lakh per annum" after income mention
    m = re.search(r'income[^.]*?rs\.?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)', text)
    if m:
        return int(float(m.group(1)) * 100000)

    # Pattern: "BPL" (below poverty line) — assume very low income
    if "bpl" in text or "below poverty line" in text:
        return 100000

    return None


def _check_gender(scheme_gender, user_gender):
    """Check if user's gender matches the scheme's gender requirement."""
    if not scheme_gender:
        return True

    g = scheme_gender.lower().strip()

    # "All" variants → everyone qualifies
    if g.startswith("all"):
        return True

    # Female-only schemes
    if g in ("girl", "female", "women", "women (adult, aged 18+)"):
        return user_gender in ("female",)

    # Check for female keywords
    if any(kw in g for kw in ("girl", "female", "women")):
        if "sc/st" in g and user_gender == "female":
            return True
        return user_gender in ("female",)

    return True


def _check_category(other_criteria, user_category):
    """Check if user's category matches criteria mentioned in otherCriteria text."""
    if not other_criteria:
        return True  # No category restriction

    text = other_criteria.lower()

    # Look for category keywords
    categories_mentioned = []
    if "sc" in re.findall(r'\bsc\b', text):
        categories_mentioned.append("sc")
    if "st" in re.findall(r'\bst\b', text):
        categories_mentioned.append("st")
    if "obc" in text:
        categories_mentioned.append("obc")
    if "ews" in text or "economically weaker" in text:
        categories_mentioned.append("ews")
        categories_mentioned.append("general")  # EWS is a subset of general
    if "minority" in text:
        categories_mentioned.append("general")
        categories_mentioned.append("obc")
    if "bpl" in text or "below poverty" in text:
        # BPL is income-based, not category-based, so allow all
        return True

    # If no specific category is mentioned, scheme is open to all
    if not categories_mentioned:
        return True

    # If "all" or generic phrasing
    if "all" in text and "categor" in text:
        return True

    return user_category in categories_mentioned


def _check_occupation(scheme, user_occupation):
    """Check if user's occupation matches the scheme's target audience."""
    category_text = scheme.get("category", "").lower()
    other_criteria = (scheme.get("eligibility", {}).get("otherCriteria", "") or "").lower()
    tags = " ".join(scheme.get("tags", [])).lower()
    description = scheme.get("description", "").lower()

    combined = f"{category_text} {other_criteria} {tags} {description}"

    # Define occupation keywords
    occupation_keywords = {
        "student": ["student", "scholar", "class ", "education", "school", "college", "undergraduate",
                     "postgraduate", "diploma", "iti", "academic", "enrollment"],
        "farmer": ["farmer", "kisan", "agriculture", "farming", "crop", "rural livelihood"],
        "self-employed": ["self-employed", "self employed", "entrepreneur", "startup", "msme",
                          "micro enterprise", "small enterprise", "street vendor", "artisan"],
        "business": ["business", "enterprise", "entrepreneur", "startup", "msme",
                      "industry", "manufacturing", "trader"],
        "salaried": ["salaried", "employed", "worker", "employee", "labour", "labor",
                     "unorganised", "unorganized"],
        "unemployed": ["unemployed", "jobless", "dropout", "skill training", "skilling",
                       "placement", "internship"],
    }

    keywords = occupation_keywords.get(user_occupation, [])
    if not keywords:
        return True  # Unknown occupation → don't filter out

    # If scheme has no occupation-targeting keywords in any field, it's probably general
    all_occupation_keywords = set()
    for kws in occupation_keywords.values():
        all_occupation_keywords.update(kws)

    has_occupation_targeting = any(kw in combined for kw in all_occupation_keywords)
    if not has_occupation_targeting:
        return True  # General scheme, open to everyone

    # Check if user's occupation keywords match
    return any(kw in combined for kw in keywords)


def _check_education(scheme, user_education):
    """Check if user's education level is relevant to the scheme."""
    age_limit = (scheme.get("eligibility", {}).get("ageLimit", "") or "").lower()
    other_criteria = (scheme.get("eligibility", {}).get("otherCriteria", "") or "").lower()
    category_text = scheme.get("category", "").lower()
    description = scheme.get("description", "").lower()

    combined = f"{age_limit} {other_criteria} {category_text} {description}"

    education_keywords = {
        "school":       ["class 1", "class 2", "class 3", "class 4", "class 5",
                         "class 6", "class 7", "class 8", "primary", "elementary"],
        "pre-matric":   ["class 9", "class 10", "pre-matric", "pre matric", "secondary"],
        "post-matric":  ["class 11", "class 12", "post-matric", "post matric", "senior secondary",
                         "higher secondary"],
        "diploma":      ["diploma", "iti", "polytechnic", "vocational", "technical education"],
        "undergraduate": ["undergraduate", "graduation", "bachelor", "degree", "b.tech", "btech",
                          "b.sc", "bsc", "b.a", "b.com", "bcom", "college", "university",
                          "ug ", "first year"],
        "postgraduate": ["postgraduate", "post-graduate", "master", "m.tech", "mtech",
                         "m.sc", "msc", "m.a", "mba", "phd", "doctoral", "research",
                         "pg "],
    }

    keywords = education_keywords.get(user_education, [])
    if not keywords:
        return True

    # If scheme doesn't mention any education terms, it's general
    all_edu_keywords = set()
    for kws in education_keywords.values():
        all_edu_keywords.update(kws)

    has_edu_targeting = any(kw in combined for kw in all_edu_keywords)
    if not has_edu_targeting:
        return True  # General scheme

    return any(kw in combined for kw in keywords)


# ─── Eligibility Filter ──────────────────────────────────────────────────────

def is_eligible(scheme, profile):
    """
    Check if a user profile is eligible for a scheme.
    Uses text-matching heuristics on the 55schemes.json format.
    """
    eligibility = scheme.get("eligibility", {})

    # 1. Age check — use scheme-level ageLimit first, fallback to group-level range
    age_text = eligibility.get("ageLimit", "")
    scheme_age_min, scheme_age_max = _parse_age_range(age_text)

    # Also consider the group-level age range
    group_min = scheme.get("_group_age_min", 0)
    group_max = scheme.get("_group_age_max", 100)

    # Use scheme-level parsed ages if they seem valid, else fall back to group
    if scheme_age_min == 0 and scheme_age_max == 100:
        # ageLimit text didn't parse — use group range
        effective_min = group_min
        effective_max = group_max
    else:
        effective_min = scheme_age_min
        effective_max = scheme_age_max

    user_age = profile["age"]
    # Allow ±2 year tolerance for edge cases
    if user_age < effective_min - 2 or user_age > effective_max + 2:
        return False

    # 2. Gender check
    if not _check_gender(eligibility.get("gender"), profile["gender"]):
        return False

    # 3. Income check (from otherCriteria)
    other_criteria = eligibility.get("otherCriteria", "")
    income_limit = _parse_income_limit(other_criteria)
    if income_limit is not None:
        user_income = profile.get("income_max", profile.get("income", 0))
        if user_income > income_limit:
            return False

    # 4. Category check
    if not _check_category(other_criteria, profile["category"]):
        return False

    # 5. Occupation check (smart keyword matching)
    if not _check_occupation(scheme, profile["occupation"]):
        return False

    # 6. Education level check (smart keyword matching)
    if not _check_education(scheme, profile["education_level"]):
        return False

    return True


# ─── Route ───────────────────────────────────────────────────────────────────

@app.route("/api/match-schemes", methods=["POST"])
def match_schemes():
    data = request.get_json()

    # Validate required fields
    required = ["age", "income", "occupation", "gender", "category", "education_level"]
    missing = [field for field in required if field not in data]
    if missing:
        return jsonify({
            "status": "error",
            "message": f"Missing fields: {', '.join(missing)}"
        }), 400

    # Build clean profile
    profile = {
        "age":             int(data["age"]),
        "income":          int(data["income"]),
        "income_min":      int(data.get("income_min", 0)),
        "income_max":      int(data.get("income_max", data["income"])),
        "occupation":      data["occupation"].strip().lower(),
        "gender":          data["gender"].strip().lower(),
        "category":        data["category"].strip().lower(),
        "education_level": data["education_level"].strip().lower(),
    }

    # Run filter
    schemes = load_schemes()
    matched = [
        {
            "scheme_name":        s["name"],
            "description":        s["description"],
            "apply_link":         s.get("officialWebsite", "#"),
            "category":           s.get("category", ""),
            "govtLevel":          s.get("govtLevel", ""),
            "howToApply":         s.get("howToApply", []),
            "documentsRequired":  s.get("documentsRequired", []),
        }
        for s in schemes
        if is_eligible(s, profile)
    ]

    return jsonify({
        "status":           "success",
        "match_count":      len(matched),
        "eligible_schemes": matched,
    })


# ─── Search Route ────────────────────────────────────────────────────────────

@app.route("/api/search-schemes", methods=["GET"])
def search_schemes():
    query = request.args.get("q", "").strip().lower()

    if not query or len(query) < 2:
        return jsonify({
            "status": "error",
            "message": "Search query must be at least 2 characters."
        }), 400

    schemes = load_schemes()
    keywords = query.split()

    matched = []
    for s in schemes:
        # Build searchable text from multiple fields
        searchable = " ".join([
            s.get("name", ""),
            s.get("shortName", ""),
            s.get("description", ""),
            s.get("category", ""),
            s.get("ministry", ""),
            s.get("govtLevel", ""),
            " ".join(s.get("tags", [])),
            s.get("eligibility", {}).get("otherCriteria", "") or "",
        ]).lower()

        # All keywords must match (AND logic for multi-word queries)
        if all(kw in searchable for kw in keywords):
            matched.append({
                "scheme_name":        s["name"],
                "description":        s["description"],
                "apply_link":         s.get("officialWebsite", "#"),
                "category":           s.get("category", ""),
                "govtLevel":          s.get("govtLevel", ""),
            })

    return jsonify({
        "status":       "success",
        "match_count":  len(matched),
        "results":      matched,
    })


# ─── Run ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
