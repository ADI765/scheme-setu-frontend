/**
 * Scheme Setu — Dummy Data (dummyData.js)
 * Mock API response that exactly matches the API contract.
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
            amount: "₹10,000/year",
            deadline: "31 Oct 2026",
            tags: ["SC Students", "Post-Matric"],
        },
        {
            scheme_name: "Punjab State Merit Scholarship",
            description:
                "Merit-based scholarship for Punjab domicile students who scored above 60% in board examinations. Covers tuition fees and hostel charges for undergraduate programs. Renewable annually based on academic performance.",
            apply_link: "https://punjab.gov.in/scholarships/",
            amount: "₹2000/month",
            deadline: "15 Nov 2026",
            tags: ["Punjab", "Merit", "Undergraduate"],
        },
        {
            scheme_name: "Central Sector Scheme of Scholarships for College and University Students",
            description:
                "Scholarship for students from families with annual income less than ₹8 lakh. Provides ₹10,000 per annum for graduation and ₹20,000 per annum for post-graduation. Based on merit in Class 12 board exams.",
            apply_link: "https://scholarships.gov.in/",
            amount: "₹20,000/year",
            deadline: "30 Dec 2026",
            tags: ["All India", "Low Income"],
        },
        {
            scheme_name: "Pre Matric Scholarship for OBC Students",
            description:
                "Scholarship for OBC students studying in Class 1 to 10. Family income must not exceed ₹2.5 lakh per annum. Provides admission fee, tuition fee, and maintenance allowance for day scholars and hostellers.",
            apply_link: "https://scholarships.gov.in/",
            amount: "₹5,000/year",
            deadline: "12 Sep 2026",
            tags: ["OBC", "Pre-Matric"],
        },
        {
            scheme_name: "Pragati Scholarship for Girls (AICTE)",
            description:
                "AICTE scholarship for girl students admitted to first year of degree or diploma in AICTE-approved institutions. Provides ₹50,000 per annum including ₹2,000 per month as incidental charges. Up to 5,000 scholarships awarded annually.",
            apply_link: "https://www.aicte-india.org/schemes/students-development-schemes/Pragati",
            amount: "₹50,000/year",
            deadline: "25 Jan 2027",
            tags: ["Girls Only", "AICTE"],
        },
        {
            scheme_name: "Ashirwad Scheme — Punjab Government",
            description:
                "Financial assistance of ₹51,000 to families of SC girls at the time of marriage. Applicable for Punjab domicile families with annual income below ₹3 lakh. One-time benefit for up to two daughters per family.",
            apply_link: "https://punjab.gov.in/welfare-schemes/",
            amount: "₹51,000 one-time",
            deadline: "Rolling",
            tags: ["Punjab", "SC", "Marriage"],
        },
    ],
};
