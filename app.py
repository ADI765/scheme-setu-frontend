"""
SchemeSetu — Flask Backend (v5.0)
Routes:
  POST /api/match-schemes     — Match schemes by user profile
  GET  /api/search-schemes    — Keyword search
  GET  /api/schemes            — List all schemes (compact)
  GET  /api/schemes/<id>       — Single scheme detail (full)
  GET  /api/schemes/name/<name>— Lookup by name
Reads data/schemesetu_v5.json and filters by user profile.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import re

app = Flask(__name__)
CORS(app)


# ─── Custom Error Handling ───────────────────────────────────────────────────

class SchemeAPIError(Exception):
    """Custom exception for API error responses."""
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code


@app.errorhandler(SchemeAPIError)
def handle_scheme_error(error):
    return jsonify({'error': error.message}), error.status_code


@app.errorhandler(404)
def handle_not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def handle_server_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ─── Data Validation ────────────────────────────────────────────────────────

def validate_scheme(scheme):
    """Ensure required fields exist and have correct types."""

    # Required fields that must exist
    required = ['id', 'name', 'ministry']
    for field in required:
        if field not in scheme or not scheme[field]:
            raise ValueError(f"Missing required field: {field}")

    # Amount: should be a string like "₹2,500/month"
    amount = scheme.get('amount', 'N/A')
    if amount and not isinstance(amount, str):
        scheme['amount'] = str(amount)

    # Deadline: should be a date string like "31 Dec 2026"
    deadline = scheme.get('deadline', 'Ongoing')
    if deadline and not isinstance(deadline, str):
        scheme['deadline'] = str(deadline)

    # Tags: should be a list of strings
    tags = scheme.get('tags', [])
    if not isinstance(tags, list):
        scheme['tags'] = []
    else:
        scheme['tags'] = [str(tag) for tag in tags]

    # How-to-apply: in v5, this is a flat list of step strings
    how_to = scheme.get('how_to_apply', [])
    if not isinstance(how_to, list):
        scheme['how_to_apply'] = []

    # Required documents: top-level list in v5
    req_docs = scheme.get('required_documents', [])
    if not isinstance(req_docs, list):
        scheme['required_documents'] = []

    # Optional documents: top-level list in v5
    opt_docs = scheme.get('optional_documents', [])
    if not isinstance(opt_docs, list):
        scheme['optional_documents'] = []

    # application_mode: "online" or "offline"
    app_mode = scheme.get('application_mode', 'offline')
    if app_mode not in ('online', 'offline'):
        scheme['application_mode'] = 'offline'

    return scheme


# ─── How-To-Apply Transformer ───────────────────────────────────────────────

def format_how_to_apply(scheme):
    """
    Convert the flat how_to_apply array from v5 JSON into a rich object.

    Input  (v5 JSON):  "how_to_apply": ["Step 1: Visit...", "Step 2: Fill..."]
    Output (API):      { "steps": [{step_number, title, instruction}, ...], ... }
    """
    raw_steps = scheme.get('how_to_apply', [])
    if not isinstance(raw_steps, list):
        raw_steps = []

    docs = scheme.get('required_documents', [])
    opt_docs = scheme.get('optional_documents', [])
    helpline = scheme.get('helplineNumber', '')

    steps = []
    for i, step_text in enumerate(raw_steps, start=1):
        # Strip "Step N: " prefix if present
        cleaned = re.sub(r'^Step\s*\d+\s*[:\-–—]\s*', '', step_text, flags=re.IGNORECASE)
        steps.append({
            'step_number': i,
            'title': cleaned.split('.')[0].strip() if '.' in cleaned else cleaned.strip(),
            'instruction': cleaned.strip(),
            'screenshot_url': ''
        })

    # Estimate time: ~5 minutes per step, minimum 10
    est_time = max(10, len(steps) * 5)

    # Extract support email from helpline if it looks like email
    support_email = ''
    support_phone = ''
    if helpline:
        if '@' in helpline:
            support_email = helpline
        else:
            support_phone = helpline

    return {
        'steps': steps,
        'estimated_time_minutes': est_time,
        'required_documents': docs if isinstance(docs, list) else [],
        'optional_documents': opt_docs if isinstance(opt_docs, list) else [],
        'application_mode': scheme.get('application_mode', 'offline'),
        'apply_link': scheme.get('apply_link', ''),
        'support_email': support_email,
        'support_phone': support_phone
    }


# ─── Load schemes database ──────────────────────────────────────────────────
SCHEMES_FILE = os.path.join(os.path.dirname(__file__), "data", "schemesetu_v5.json")

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
            "id":                 s.get("id", ""),
            "scheme_name":        s["name"],
            "shortName":          s.get("shortName", ""),
            "description":        s["description"],
            "amount":             s.get("amount", "N/A"),
            "deadline":           s.get("deadline", "Ongoing"),
            "application_mode":   s.get("application_mode", "offline"),
            "apply_link":         s.get("apply_link", ""),
            "category":           s.get("category", ""),
            "govtLevel":          s.get("govtLevel", ""),
            "how_to_apply":       s.get("how_to_apply", []),
            "required_documents": s.get("required_documents", []),
            "optional_documents": s.get("optional_documents", []),
            "tags":               s.get("tags", []),
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
                "id":                 s.get("id", ""),
                "scheme_name":        s["name"],
                "shortName":          s.get("shortName", ""),
                "description":        s["description"],
                "amount":             s.get("amount", "N/A"),
                "deadline":           s.get("deadline", "Ongoing"),
                "application_mode":   s.get("application_mode", "offline"),
                "apply_link":         s.get("apply_link", ""),
                "category":           s.get("category", ""),
                "govtLevel":          s.get("govtLevel", ""),
                "tags":               s.get("tags", []),
            })

    return jsonify({
        "status":       "success",
        "match_count":  len(matched),
        "results":      matched,
    })



# ─── Scheme Routes ───────────────────────────────────────────────────────────

@app.route("/api/schemes", methods=["GET"])
def list_schemes():
    category_filter = request.args.get('category')
    govt_level_filter = request.args.get('govt_level')
    
    schemes = load_schemes()
    filtered_schemes = []
    
    for scheme in schemes:
        if category_filter and scheme.get('category') != category_filter:
            continue
            
        scheme_govt_level = scheme.get('govt_level') or scheme.get('govtLevel', 'Central')
        if govt_level_filter and scheme_govt_level != govt_level_filter:
            continue
            
        filtered_schemes.append(scheme)
    
    filtered_schemes = filtered_schemes[:50]
    
    response = []
    for scheme in filtered_schemes:
        amount = scheme.get('amount', 'N/A')
        if amount and not isinstance(amount, str): amount = str(amount)
        
        deadline = scheme.get('deadline', 'Ongoing')
        if deadline and not isinstance(deadline, str): deadline = str(deadline)
        
        tags = scheme.get('tags', [])
        if not isinstance(tags, list): tags = []
        
        ministry = scheme.get('ministry') or scheme.get('ministryName', '')
        
        response.append({
            'id': scheme.get('id'),
            'name': scheme.get('name'),
            'shortName': scheme.get('shortName', ''),
            'ministry': ministry,
            'description': scheme.get('description'),
            'amount': amount,
            'deadline': deadline,
            'application_mode': scheme.get('application_mode', 'offline'),
            'apply_link': scheme.get('apply_link', ''),
            'tags': [str(t) for t in tags],
            'govt_level': scheme.get('govt_level') or scheme.get('govtLevel', 'Central')
        })
            
    return jsonify(response)


@app.route('/api/schemes/<scheme_id>', methods=['GET'])
def get_scheme(scheme_id):
    if not scheme_id:
        raise SchemeAPIError('Scheme ID required', 400)
    
    schemes = load_schemes()
    scheme = next((s for s in schemes if s.get('id') == scheme_id), None)
    
    if not scheme:
        raise SchemeAPIError(f'Scheme {scheme_id} not found', 404)
        
    # Map fields for validation if missing
    if 'ministry' not in scheme and 'ministryName' in scheme:
        scheme['ministry'] = scheme['ministryName']

    try:
        scheme = validate_scheme(scheme)
    except ValueError as e:
        raise SchemeAPIError(f'Data validation failed: {str(e)}', 500)

    # Build the rich how_to_apply object from v5 flat data
    how_to_apply_rich = format_how_to_apply(scheme)

    response = {
        'id': scheme.get('id'),
        'name': scheme.get('name'),
        'shortName': scheme.get('shortName', ''),
        'ministry': scheme.get('ministry'),
        'category': scheme.get('category', ''),
        'launchedYear': scheme.get('launchedYear'),
        'description': scheme.get('description'),
        'amount': scheme.get('amount', 'N/A'),
        'deadline': scheme.get('deadline', 'Ongoing'),
        'tags': scheme.get('tags', []),
        'eligibility': scheme.get('eligibility', {}),
        'benefits': scheme.get('benefits', {}),
        'application_mode': scheme.get('application_mode', 'offline'),
        'apply_link': scheme.get('apply_link', ''),
        'how_to_apply': scheme.get('how_to_apply', []),
        'how_to_apply_rich': how_to_apply_rich,
        'required_documents': scheme.get('required_documents', []),
        'optional_documents': scheme.get('optional_documents', []),
        'helplineNumber': scheme.get('helplineNumber', ''),
        'govt_level': scheme.get('govt_level') or scheme.get('govtLevel', 'Central')
    }

    return jsonify(response)


@app.route('/api/schemes/name/<scheme_name>', methods=['GET'])
def get_scheme_by_name(scheme_name):
    """Look up a scheme by its name (case-insensitive partial match)."""
    if not scheme_name or len(scheme_name) < 2:
        raise SchemeAPIError('Scheme name must be at least 2 characters', 400)

    schemes = load_schemes()
    query = scheme_name.strip().lower()

    # Try exact match first, then partial
    scheme = next((s for s in schemes if s.get('name', '').lower() == query), None)
    if not scheme:
        scheme = next((s for s in schemes if query in s.get('name', '').lower()), None)
    if not scheme:
        scheme = next((s for s in schemes if query in s.get('shortName', '').lower()), None)

    if not scheme:
        raise SchemeAPIError(f'Scheme matching "{scheme_name}" not found', 404)

    # Map fields for validation if missing
    if 'ministry' not in scheme and 'ministryName' in scheme:
        scheme['ministry'] = scheme['ministryName']

    try:
        scheme = validate_scheme(scheme)
    except ValueError as e:
        raise SchemeAPIError(f'Data validation failed: {str(e)}', 500)

    how_to_apply_rich = format_how_to_apply(scheme)

    response = {
        'id': scheme.get('id'),
        'name': scheme.get('name'),
        'shortName': scheme.get('shortName', ''),
        'ministry': scheme.get('ministry'),
        'category': scheme.get('category', ''),
        'launchedYear': scheme.get('launchedYear'),
        'description': scheme.get('description'),
        'amount': scheme.get('amount', 'N/A'),
        'deadline': scheme.get('deadline', 'Ongoing'),
        'tags': scheme.get('tags', []),
        'eligibility': scheme.get('eligibility', {}),
        'benefits': scheme.get('benefits', {}),
        'application_mode': scheme.get('application_mode', 'offline'),
        'apply_link': scheme.get('apply_link', ''),
        'how_to_apply': scheme.get('how_to_apply', []),
        'how_to_apply_rich': how_to_apply_rich,
        'required_documents': scheme.get('required_documents', []),
        'optional_documents': scheme.get('optional_documents', []),
        'helplineNumber': scheme.get('helplineNumber', ''),
        'govt_level': scheme.get('govt_level') or scheme.get('govtLevel', 'Central')
    }

    return jsonify(response)


# ─── Run ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
