import { PrismaClient, BlogCategory } from "@prisma/client";

const prisma = new PrismaClient();

const blogPosts = [
  {
    title: "10 Essential Tips for First-Time Caregivers",
    slug: "10-essential-tips-first-time-caregivers",
    excerpt:
      "Starting your caregiving journey? These ten practical tips will help you provide better care while taking care of yourself.",
    content: `Starting your journey as a caregiver can feel overwhelming. Whether you're caring for an aging parent, a spouse, or another loved one, these essential tips will help you navigate this important role with confidence and compassion.

## 1. Educate Yourself About Their Condition
Understanding your loved one's specific health conditions is crucial. Research their diagnosis, treatment options, and what to expect as the condition progresses. This knowledge will help you provide better care and communicate more effectively with healthcare providers.

## 2. Build a Support Network
Don't try to do everything alone. Connect with other caregivers through support groups, online forums, or local community centers. These connections provide emotional support and practical advice from people who understand your challenges.

## 3. Organize Medical Information
Create a comprehensive file with all medical records, medication lists, insurance information, and doctor contact details. Keep both physical and digital copies readily accessible for emergencies.

## 4. Take Care of Your Own Health
Remember: you can't pour from an empty cup. Schedule regular check-ups, maintain a healthy diet, exercise regularly, and get enough sleep. Your health directly impacts your ability to provide quality care.

## 5. Learn to Ask for and Accept Help
Many people want to help but don't know how. Be specific about what you need—whether it's meal preparation, grocery shopping, or just spending time with your loved one so you can take a break.

## 6. Set Realistic Expectations
You won't be perfect, and that's okay. Some days will be harder than others. Focus on doing your best and be gentle with yourself when things don't go as planned.

## 7. Create a Daily Routine
Establishing consistent routines provides structure and can make care tasks more manageable. Regular schedules for meals, medications, and activities help both you and your loved one.

## 8. Practice Patience and Communication
Illness can change personalities and behaviors. Maintain open, honest communication and remember that challenging behaviors often stem from frustration or fear, not from who your loved one truly is.

## 9. Plan for Respite Care
Schedule regular breaks from caregiving. Whether it's hiring professional help, utilizing adult day care, or arranging for family members to step in, respite care is essential for preventing burnout.

## 10. Stay Organized with Technology
Use apps and tools designed for caregivers. From medication reminders to communication platforms for coordinating with family members, technology can significantly reduce your stress and workload.

Remember, being a caregiver is one of the most challenging yet rewarding roles you can take on. Be patient with yourself, celebrate small victories, and don't hesitate to seek help when you need it.`,
    category: BlogCategory.CAREGIVING_TIPS,
    author: "Dr. Sarah Mitchell",
    authorTitle: "Senior Care Specialist",
    coverImage:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1920&q=80",
    readTime: 8,
    published: true,
    publishedAt: new Date("2025-09-15"),
  },
  {
    title:
      "How One Family United to Care for Their Mother: A Story of Love and Coordination",
    slug: "family-united-care-mother-story",
    excerpt:
      "The Johnson family shares their journey of coming together across three states to coordinate care for their mother with Alzheimer's.",
    content: `When Martha Johnson was diagnosed with early-onset Alzheimer's at age 68, her four adult children faced a challenge that millions of families encounter: how to provide quality care when family members live hundreds of miles apart.

## The Challenge

The Johnson siblings—Sarah in Seattle, Michael in Miami, Jennifer in Denver, and David in Boston—each wanted to help their mother, but coordination was difficult. Phone calls were missed, medical updates were lost in email chains, and nobody had a complete picture of their mother's daily care needs.

## Finding a Solution

"We needed a central hub where everyone could stay informed and contribute," says Sarah, the eldest daughter. The family turned to digital tools to coordinate care, share updates, and manage their mother's complex schedule of medications, appointments, and daily activities.

## Dividing Responsibilities

Rather than putting all the burden on one person, the Johnsons created a system:
- Sarah handled medical appointments and doctor communication
- Michael managed financial aspects and insurance
- Jennifer coordinated the care schedule and medication management
- David organized social activities and handled legal documents

## The Power of Regular Communication

The family implemented weekly video calls where everyone could see Martha and discuss any concerns. They also used a shared calendar for appointments and a messaging system for quick updates.

## Lessons Learned

"The most important thing we learned," Jennifer reflects, "is that caregiving doesn't have to fall on one person's shoulders. When family members can contribute based on their strengths and availability, everyone benefits—especially Mom."

## The Impact

Two years into their coordinated care approach, Martha remains in her own home with daily support from a part-time aide, and the family feels connected and informed about her care. The siblings report feeling less stressed and more confident in their caregiving roles.

## Advice for Other Families

The Johnsons offer this advice to families in similar situations:
- Start the conversation early, before a crisis
- Use technology to stay connected and organized
- Be flexible and patient with each other
- Celebrate the good days
- Remember that asking for help is a sign of strength, not weakness

Their story reminds us that with love, communication, and the right tools, families can overcome geographic distance to provide compassionate care for their loved ones.`,
    category: BlogCategory.FAMILY_STORIES,
    author: "Emma Rodriguez",
    authorTitle: "Family Care Coordinator",
    coverImage:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1920&q=80",
    readTime: 6,
    published: true,
    publishedAt: new Date("2025-09-20"),
  },
  {
    title:
      "Understanding Medicare vs. Medicaid: A Complete Guide for Caregivers",
    slug: "medicare-vs-medicaid-complete-guide",
    excerpt:
      "Navigate the complex world of healthcare coverage with this comprehensive breakdown of Medicare and Medicaid benefits.",
    content: `Navigating healthcare coverage for elderly loved ones can be confusing, especially when trying to understand the difference between Medicare and Medicaid. This guide breaks down everything you need to know.

## What is Medicare?

Medicare is a federal health insurance program primarily for people 65 and older. It has four parts:

### Part A (Hospital Insurance)
- Covers inpatient hospital stays
- Skilled nursing facility care
- Hospice care
- Some home health care

### Part B (Medical Insurance)
- Doctor visits
- Outpatient care
- Medical supplies
- Preventive services

### Part C (Medicare Advantage)
- Alternative way to get Medicare benefits
- Provided by private insurance companies
- Often includes additional benefits

### Part D (Prescription Drug Coverage)
- Helps cover prescription medication costs
- Provided by private insurance companies

## What is Medicaid?

Medicaid is a state and federal program providing health coverage for people with limited income and resources. Benefits vary by state but typically include:
- Hospital and doctor visits
- Long-term care
- Prescription drugs
- Medical equipment

## Key Differences

| Feature | Medicare | Medicaid |
|---------|----------|----------|
| Eligibility | Age 65+ or disabled | Low income/resources |
| Coverage | Standardized nationally | Varies by state |
| Cost | Premiums, deductibles | Little to no cost |
| Long-term care | Limited coverage | Comprehensive coverage |

## Can You Have Both?

Yes! People who qualify for both programs are called "dual eligible." This combination can provide comprehensive coverage with minimal out-of-pocket costs.

## Planning Tips

1. **Apply Early**: Don't wait until you urgently need coverage
2. **Document Everything**: Keep detailed records of income, assets, and expenses
3. **Understand Your State's Rules**: Medicaid eligibility varies significantly by state
4. **Consider Long-Term Care**: Plan for potential nursing home or in-home care needs
5. **Seek Professional Help**: Consider consulting with an elder law attorney or benefits specialist

## Resources

- Medicare.gov - Official Medicare website
- Medicaid.gov - Federal Medicaid information
- State Health Insurance Assistance Program (SHIP) - Free Medicare counseling
- National Council on Aging - Benefits screening tools

Understanding these programs empowers you to make informed decisions about your loved one's healthcare coverage and plan for future needs.`,
    category: BlogCategory.FINANCIAL_PLANNING,
    author: "Robert Chen, CFP",
    authorTitle: "Elder Care Financial Planner",
    readTime: 10,
    published: true,
    publishedAt: new Date("2025-09-10"),
  },
  {
    title: "The Best Apps and Tools for Family Caregivers in 2025",
    slug: "best-apps-tools-family-caregivers-2025",
    excerpt:
      "Discover the top-rated apps and digital tools that make coordinating care easier, from medication reminders to family communication.",
    content: `Technology has revolutionized family caregiving. Here are the best apps and tools helping families coordinate care in 2025.

## Communication & Coordination

### CareShare (That's us!)
**Best for:** Complete family care coordination
**Features:** Task management, calendar sharing, financial tracking, secure messaging, document storage

### Caring Village
**Best for:** Large family coordination
**Features:** Community support, volunteer scheduling, meal planning

## Medication Management

### Medisafe
**Best for:** Multiple medication tracking
**Features:** Pill reminders, refill alerts, drug interaction warnings, family notifications

### MediSafe Caregiver
**Best for:** Managing medications for someone else
**Features:** Remote monitoring, dosage tracking, pharmacy integration

## Health Tracking

### CareZone
**Best for:** Comprehensive health management
**Features:** Medication lists, symptom tracking, appointment scheduling, journal

### MyChart
**Best for:** Medical record access
**Features:** Lab results, visit summaries, direct messaging with doctors

## Financial Management

### CaringBridge
**Best for:** Crowdfunding medical expenses
**Features:** Fundraising, update pages, guest book

### Mint
**Best for:** Budget tracking
**Features:** Expense categorization, bill reminders, budget planning

## Safety & Monitoring

### Life Alert
**Best for:** Emergency response
**Features:** 24/7 monitoring, fall detection, two-way communication

### Lively (formerly GreatCall)
**Best for:** Wearable safety device
**Features:** GPS tracking, urgent care access, daily check-ins

## Document Management

### Everplans
**Best for:** End-of-life planning
**Features:** Digital vault, document storage, estate planning guides

### Dropbox/Google Drive
**Best for:** File sharing
**Features:** Cloud storage, easy sharing, mobile access

## Choosing the Right Tools

Consider these factors:
1. **Ease of Use**: Will your family actually use it?
2. **Cost**: Free vs. paid features
3. **Integration**: Does it work with other tools you use?
4. **Privacy**: How is your data protected?
5. **Support**: Is customer service available?

## Tips for Implementation

- Start with one or two tools, not everything at once
- Get all family members on board before launching
- Provide training and support for less tech-savvy family members
- Regularly review and adjust your tool selection

The right combination of apps can dramatically reduce caregiver stress and improve care coordination. Start small, be patient with the learning curve, and remember that any step toward better organization is progress.`,
    category: BlogCategory.TECHNOLOGY,
    author: "Alex Thompson",
    authorTitle: "Technology Specialist",
    readTime: 7,
    published: true,
    publishedAt: new Date("2025-09-25"),
  },
  {
    title: "5 Warning Signs Your Loved One Needs More Help at Home",
    slug: "warning-signs-loved-one-needs-more-help",
    excerpt:
      "Learn to recognize the subtle and not-so-subtle signs that it might be time to increase care support for your aging family member.",
    content: `As our loved ones age, it can be challenging to know when they need additional help. Here are five key warning signs to watch for.

## 1. Changes in Personal Hygiene

Notice if your loved one is:
- Wearing the same clothes multiple days in a row
- Skipping showers or baths
- Not brushing their teeth or hair
- Having unexplained stains on clothing

These changes might indicate difficulty with daily tasks or cognitive decline.

## 2. Decline in Home Maintenance

Look around their living space for:
- Piles of unopened mail
- Expired food in the refrigerator
- Unusual clutter or hoarding
- Dirty dishes stacking up
- Neglected yard work or home repairs

A once-tidy person letting things slide may be struggling more than they admit.

## 3. Medication Mismanagement

Warning signs include:
- Missed doses or double-dosing
- Expired medications in the medicine cabinet
- Unfilled prescriptions
- Confusion about what medications to take and when

Proper medication management is crucial for health and safety.

## 4. Weight Loss or Poor Nutrition

Be concerned if you notice:
- Significant unintended weight loss
- Empty refrigerator or expired food
- Reliance on junk food or sweets
- Skipped meals
- Difficulty using kitchen appliances

Proper nutrition is essential for maintaining health and independence.

## 5. Social Withdrawal

Watch for signs like:
- Canceling plans they previously enjoyed
- Losing interest in hobbies
- Not answering the phone
- Seeming depressed or anxious
- Decreased interaction with friends and family

Isolation can lead to depression and accelerate cognitive decline.

## What to Do Next

If you're seeing these warning signs:

1. **Have an honest conversation** with your loved one about your concerns
2. **Schedule a medical evaluation** to rule out treatable conditions
3. **Assess their needs** and determine what level of support would help
4. **Explore care options** from part-time help to full-time in-home care
5. **Involve the whole family** in decision-making and care coordination

## Remember

Needing help doesn't mean losing independence. The right support can actually help your loved one maintain their quality of life and stay in their home longer.

Early intervention is key. Trust your instincts—if something seems off, it probably is. Taking action sooner rather than later can prevent crises and ensure your loved one gets the support they need.`,
    category: BlogCategory.CAREGIVING_TIPS,
    author: "Dr. Linda Patterson",
    authorTitle: "Geriatric Care Manager",
    readTime: 6,
    published: true,
    publishedAt: new Date("2025-09-05"),
  },
];

// Add 20 more blog posts with varied content
const additionalPosts = [
  {
    title: "Creating a Safe Home Environment for Dementia Patients",
    slug: "safe-home-environment-dementia-patients",
    excerpt:
      "Simple modifications can make a huge difference in safety and quality of life for those living with dementia.",
    category: BlogCategory.CAREGIVING_TIPS,
    author: "Maria Santos, OT",
    authorTitle: "Occupational Therapist",
    readTime: 7,
  },
  {
    title: "How We Turned Our Family Room into a Memory Care Space",
    slug: "family-room-memory-care-space",
    excerpt:
      "One family's creative approach to creating a comforting environment filled with familiar items and memories.",
    category: BlogCategory.FAMILY_STORIES,
    author: "Tom & Lisa Anderson",
    authorTitle: "Family Caregivers",
    readTime: 5,
  },
  {
    title: "Understanding Power of Attorney: What Every Caregiver Should Know",
    slug: "understanding-power-of-attorney-caregivers",
    excerpt:
      "Navigate the legal aspects of caregiving with this guide to power of attorney and healthcare directives.",
    category: BlogCategory.LEGAL_MATTERS,
    author: "Attorney James Morrison",
    authorTitle: "Elder Law Attorney",
    readTime: 9,
  },
  {
    title: "Nutrition Tips for Seniors: Making Every Bite Count",
    slug: "nutrition-tips-seniors",
    excerpt:
      "As we age, nutritional needs change. Learn how to ensure your loved one gets the nutrients they need.",
    category: BlogCategory.HEALTH_WELLNESS,
    author: "Rachel Green, RD",
    authorTitle: "Registered Dietitian",
    readTime: 6,
  },
  {
    title:
      "Preventing Caregiver Burnout: Recognizing the Signs and Finding Solutions",
    slug: "preventing-caregiver-burnout",
    excerpt:
      "Caregiver burnout is real and serious. Learn to recognize the warning signs and discover strategies for self-care.",
    category: BlogCategory.CAREGIVING_TIPS,
    author: "Dr. Michelle Park",
    authorTitle: "Clinical Psychologist",
    readTime: 8,
  },
  {
    title: "Introducing CareShare 2.0: What's New and What's Next",
    slug: "careshare-2-0-whats-new",
    excerpt:
      "We're excited to announce major updates to CareShare, including new features designed to make family care coordination even easier.",
    category: BlogCategory.COMPANY_NEWS,
    author: "CareShare Team",
    authorTitle: "Product Update",
    readTime: 4,
  },
  {
    title: "The Cost of Care: Budgeting for Long-Term Care Expenses",
    slug: "cost-of-care-budgeting-long-term",
    excerpt:
      "Understanding and planning for the financial realities of long-term care can help families avoid financial hardship.",
    category: BlogCategory.FINANCIAL_PLANNING,
    author: "David Liu, CFP",
    authorTitle: "Certified Financial Planner",
    readTime: 10,
  },
  {
    title: "Managing Difficult Behaviors in Dementia Care",
    slug: "managing-difficult-behaviors-dementia",
    excerpt:
      "Learn compassionate strategies for handling challenging behaviors that often accompany dementia and Alzheimer's.",
    category: BlogCategory.CAREGIVING_TIPS,
    author: "Dr. Patricia Williams",
    authorTitle: "Dementia Care Specialist",
    readTime: 7,
  },
  {
    title:
      "Our Journey from Resistance to Acceptance: Dad's Move to Assisted Living",
    slug: "journey-resistance-acceptance-assisted-living",
    excerpt:
      "How one family navigated the emotional process of transitioning their father to assisted living.",
    category: BlogCategory.FAMILY_STORIES,
    author: "Karen & Steve Miller",
    authorTitle: "Family Caregivers",
    readTime: 6,
  },
  {
    title: "Fall Prevention: Essential Home Modifications for Senior Safety",
    slug: "fall-prevention-home-modifications",
    excerpt:
      "Falls are the leading cause of injury for seniors. These simple home modifications can significantly reduce risk.",
    category: BlogCategory.HEALTH_WELLNESS,
    author: "John Martinez, PT",
    authorTitle: "Physical Therapist",
    readTime: 8,
  },
  {
    title: "Estate Planning Basics: Wills, Trusts, and Healthcare Directives",
    slug: "estate-planning-basics-wills-trusts",
    excerpt:
      "A straightforward guide to essential estate planning documents every family should have in place.",
    category: BlogCategory.LEGAL_MATTERS,
    author: "Attorney Susan Blake",
    authorTitle: "Estate Planning Attorney",
    readTime: 11,
  },
  {
    title: "Telehealth for Seniors: Making Virtual Doctor Visits Work",
    slug: "telehealth-seniors-virtual-doctor-visits",
    excerpt:
      "Telehealth is here to stay. Learn how to help your loved one make the most of virtual medical appointments.",
    category: BlogCategory.TECHNOLOGY,
    author: "Dr. Kevin Patel",
    authorTitle: "Telemedicine Advocate",
    readTime: 5,
  },
  {
    title: "Caring for the Caregiver: Why Self-Care Isn't Selfish",
    slug: "caring-for-caregiver-self-care",
    excerpt:
      "You can't pour from an empty cup. Discover why caregiver self-care is essential, not optional.",
    category: BlogCategory.CAREGIVING_TIPS,
    author: "Amanda Foster, LCSW",
    authorTitle: "Licensed Social Worker",
    readTime: 6,
  },
  {
    title: "Long-Distance Caregiving: Staying Involved When You're Far Away",
    slug: "long-distance-caregiving-staying-involved",
    excerpt:
      "Living far from your aging parent doesn't mean you can't play an active role in their care.",
    category: BlogCategory.CAREGIVING_TIPS,
    author: "Jennifer Walsh",
    authorTitle: "Long-Distance Care Consultant",
    readTime: 7,
  },
  {
    title: "How Meditation Helped Me Cope with Caregiving Stress",
    slug: "meditation-helped-cope-caregiving-stress",
    excerpt:
      "One caregiver's personal journey with mindfulness meditation and how it transformed her caregiving experience.",
    category: BlogCategory.FAMILY_STORIES,
    author: "Laura Martinez",
    authorTitle: "Family Caregiver",
    readTime: 5,
  },
  {
    title: "Understanding Hospice Care: What Families Need to Know",
    slug: "understanding-hospice-care-families",
    excerpt:
      "Hospice care provides comfort and support for patients and families. Learn when and how to access these services.",
    category: BlogCategory.HEALTH_WELLNESS,
    author: "Nurse Margaret O'Brien",
    authorTitle: "Hospice Care Nurse",
    readTime: 8,
  },
  {
    title: "CareShare Partners with National Alliance for Caregiving",
    slug: "careshare-partners-national-alliance-caregiving",
    excerpt:
      "We're proud to announce our partnership with NAC to support and advocate for family caregivers nationwide.",
    category: BlogCategory.COMPANY_NEWS,
    author: "CareShare Team",
    authorTitle: "Partnership Announcement",
    readTime: 3,
  },
  {
    title: "The Hidden Costs of Caregiving: What to Budget For",
    slug: "hidden-costs-caregiving-budget",
    excerpt:
      "Beyond obvious expenses, there are many hidden costs of caregiving. Here's how to plan for them.",
    category: BlogCategory.FINANCIAL_PLANNING,
    author: "Christine Brown, MBA",
    authorTitle: "Financial Advisor",
    readTime: 9,
  },
  {
    title: "Exercises for Seniors: Staying Active and Independent",
    slug: "exercises-seniors-staying-active",
    excerpt:
      "Safe, effective exercises that help seniors maintain strength, balance, and independence.",
    category: BlogCategory.HEALTH_WELLNESS,
    author: "Mike Johnson, CPT",
    authorTitle: "Senior Fitness Trainer",
    readTime: 6,
  },
  {
    title: "Smart Home Technology for Aging in Place",
    slug: "smart-home-technology-aging-in-place",
    excerpt:
      "From voice assistants to smart sensors, technology can help seniors live independently longer.",
    category: BlogCategory.TECHNOLOGY,
    author: "Ryan Cooper",
    authorTitle: "Smart Home Specialist",
    readTime: 7,
  },
  {
    title: "Navigating Family Disagreements About Care Decisions",
    slug: "navigating-family-disagreements-care-decisions",
    excerpt:
      "When family members disagree about care, emotions run high. Here's how to find common ground.",
    category: BlogCategory.CAREGIVING_TIPS,
    author: "Dr. Sarah Kim",
    authorTitle: "Family Therapist",
    readTime: 8,
  },
  {
    title: "From Guilt to Grace: My First Year as a Caregiver",
    slug: "guilt-to-grace-first-year-caregiver",
    excerpt:
      "A deeply personal reflection on the emotional journey of becoming a caregiver for a parent.",
    category: BlogCategory.FAMILY_STORIES,
    author: "Daniel White",
    authorTitle: "Family Caregiver",
    readTime: 6,
  },
  {
    title: "Medicare Open Enrollment: What Changed This Year",
    slug: "medicare-open-enrollment-changes",
    excerpt:
      "Stay informed about the latest changes to Medicare coverage and what they mean for your family.",
    category: BlogCategory.FINANCIAL_PLANNING,
    author: "Barbara Jensen",
    authorTitle: "Medicare Counselor",
    readTime: 6,
  },
  {
    title: "Creating a Care Transition Plan: Hospital to Home",
    slug: "care-transition-plan-hospital-home",
    excerpt:
      "Hospital discharges can be overwhelming. This checklist ensures a smooth transition back home.",
    category: BlogCategory.CAREGIVING_TIPS,
    author: "Nurse Practitioner Lisa Chen",
    authorTitle: "Transitional Care NP",
    readTime: 7,
  },
  {
    title: "The Complete Guide to Advance Directives and Living Wills",
    slug: "complete-guide-advance-directives-living-wills",
    excerpt:
      "Ensure your loved one's wishes are honored with properly prepared advance healthcare directives.",
    category: BlogCategory.LEGAL_MATTERS,
    author: "Attorney Robert Taylor",
    authorTitle: "Healthcare Law Specialist",
    readTime: 10,
  },
];

async function seedBlog() {
  console.log("🌱 Seeding blog posts...");

  // Delete existing blog posts
  await prisma.blogPost.deleteMany({});
  console.log("✓ Cleared existing blog posts");

  // Create initial 5 detailed posts
  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: post,
    });
  }
  console.log(`✓ Created ${blogPosts.length} detailed blog posts`);

  // Create additional 20 posts with generated content
  for (const post of additionalPosts) {
    const fullContent = `${post.excerpt}

## Introduction

This article explores ${post.excerpt.toLowerCase()}

## Key Points

Understanding the nuances of this topic is essential for family caregivers. Through research and real-world experience, we've compiled comprehensive insights to help you navigate these challenges.

## Main Content

The journey of caregiving involves many facets, and this particular aspect deserves careful attention. Families across the country have shared their experiences, and common themes have emerged that can guide others facing similar situations.

### Important Considerations

When approaching this topic, consider:
- Your family's unique circumstances
- Available resources and support systems
- Long-term sustainability of care arrangements
- The physical and emotional well-being of all involved

### Practical Strategies

Based on expert recommendations and family experiences, here are effective strategies to implement:

1. **Plan Ahead**: Don't wait for a crisis to develop your approach
2. **Communicate Openly**: Keep all family members informed and involved
3. **Seek Professional Guidance**: Don't hesitate to consult with specialists
4. **Document Everything**: Keep detailed records for reference
5. **Stay Flexible**: Be willing to adjust your approach as needs change

## Conclusion

${
  post.excerpt
} By staying informed, seeking support when needed, and maintaining open communication, families can navigate these challenges successfully.

Remember, you're not alone in this journey. Millions of families face similar situations, and there are resources available to help every step of the way.`;

    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: fullContent,
        category: post.category,
        author: post.author,
        authorTitle: post.authorTitle,
        readTime: post.readTime,
        published: true,
        publishedAt: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        ), // Random date within last 90 days
      },
    });
  }
  console.log(`✓ Created ${additionalPosts.length} additional blog posts`);

  console.log(
    `\n✅ Total blog posts created: ${
      blogPosts.length + additionalPosts.length
    }`
  );
}

seedBlog()
  .catch((e) => {
    console.error("Error seeding blog:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
