/**
 * Scheme Setu — Dummy Data (dummyData.js)
 * Mock API response that exactly matches the v5.0 API contract.
 * Used when USE_DUMMY = true in api.js for frontend-only development.
 */

const dummyResponse = {
    status: "success",
    match_count: 6,
    eligible_schemes: [
        {
            scheme_name: "Post Matric Scholarship for SC Students",
            description:
                "Financial assistance for SC category students pursuing post-matric education. Covers maintenance allowance, reimbursement of compulsory non-refundable fees, and study tour charges. Available for students enrolled in recognized institutions across India.",
            apply_link: "https://scholarships.gov.in/",
            application_mode: "online",
            amount: "₹10,000/year",
            deadline: "31 Oct 2026",
            tags: ["SC Students", "Post-Matric"],
            how_to_apply: [
                "Step 1: Visit scholarships.gov.in and register",
                "Step 2: Fill application form with academic details",
                "Step 3: Upload caste and income certificates",
                "Step 4: Submit and track status online"
            ],
            required_documents: ["Aadhaar card", "Caste certificate", "Income certificate", "Mark sheet"],
            optional_documents: ["Disability certificate"],
        },
        {
            scheme_name: "Punjab State Merit Scholarship",
            description:
                "Merit-based scholarship for Punjab domicile students who scored above 60% in board examinations. Covers tuition fees and hostel charges for undergraduate programs. Renewable annually based on academic performance.",
            apply_link: "https://punjab.gov.in/scholarships/",
            application_mode: "online",
            amount: "₹2000/month",
            deadline: "15 Nov 2026",
            tags: ["Punjab", "Merit", "Undergraduate"],
            how_to_apply: [
                "Step 1: Apply on Punjab Scholarship Portal",
                "Step 2: Submit board mark sheet and domicile proof",
                "Step 3: Institution verifies and forwards application"
            ],
            required_documents: ["Board mark sheet", "Domicile certificate", "Bank details"],
            optional_documents: [],
        },
        {
            scheme_name: "Central Sector Scheme of Scholarships for College and University Students",
            description:
                "Scholarship for students from families with annual income less than ₹8 lakh. Provides ₹10,000 per annum for graduation and ₹20,000 per annum for post-graduation. Based on merit in Class 12 board exams.",
            apply_link: "https://scholarships.gov.in/",
            application_mode: "online",
            amount: "₹20,000/year",
            deadline: "30 Dec 2026",
            tags: ["All India", "Low Income"],
            how_to_apply: [
                "Step 1: Register on National Scholarship Portal (NSP)",
                "Step 2: Fill in personal, academic, and bank details",
                "Step 3: Upload Class 12 mark sheet and income certificate",
                "Step 4: Institution and district verify application"
            ],
            required_documents: ["Class 12 mark sheet", "Income certificate", "Bank account", "Aadhaar"],
            optional_documents: ["Caste certificate"],
        },
        {
            scheme_name: "Pre Matric Scholarship for OBC Students",
            description:
                "Scholarship for OBC students studying in Class 1 to 10. Family income must not exceed ₹2.5 lakh per annum. Provides admission fee, tuition fee, and maintenance allowance for day scholars and hostellers.",
            apply_link: "https://scholarships.gov.in/",
            application_mode: "online",
            amount: "₹5,000/year",
            deadline: "12 Sep 2026",
            tags: ["OBC", "Pre-Matric"],
            how_to_apply: [
                "Step 1: Apply on NSP at scholarships.gov.in",
                "Step 2: Fill personal and school details",
                "Step 3: Upload OBC and income certificates",
                "Step 4: School verifies and forwards to district"
            ],
            required_documents: ["OBC certificate", "Income certificate", "School enrollment"],
            optional_documents: ["Disability certificate"],
        },
        {
            scheme_name: "Pragati Scholarship for Girls (AICTE)",
            description:
                "AICTE scholarship for girl students admitted to first year of degree or diploma in AICTE-approved institutions. Provides ₹50,000 per annum including ₹2,000 per month as incidental charges. Up to 5,000 scholarships awarded annually.",
            apply_link: "https://www.aicte-india.org/schemes/students-development-schemes/Pragati",
            application_mode: "online",
            amount: "₹50,000/year",
            deadline: "25 Jan 2027",
            tags: ["Girls Only", "AICTE"],
            how_to_apply: [
                "Step 1: Apply through AICTE portal at aicte-india.org",
                "Step 2: Fill Pragati Scholarship form with admission letter",
                "Step 3: Upload required documents",
                "Step 4: AICTE releases scholarship after verification"
            ],
            required_documents: ["Admission letter", "Aadhaar card", "Income certificate", "Bank details"],
            optional_documents: [],
        },
        {
            scheme_name: "Ashirwad Scheme — Punjab Government",
            description:
                "Financial assistance of ₹51,000 to families of SC girls at the time of marriage. Applicable for Punjab domicile families with annual income below ₹3 lakh. One-time benefit for up to two daughters per family.",
            apply_link: "",
            application_mode: "offline",
            amount: "₹51,000 one-time",
            deadline: "Rolling",
            tags: ["Punjab", "SC", "Marriage"],
            how_to_apply: [
                "Step 1: Visit District Social Security Office in Punjab",
                "Step 2: Fill Ashirwad Scheme application form",
                "Step 3: Submit documents before marriage date",
                "Step 4: Amount deposited directly in applicant's account"
            ],
            required_documents: ["Caste certificate", "Income certificate", "Aadhaar", "Punjab domicile"],
            optional_documents: ["Marriage invitation card"],
        },
    ],
};
