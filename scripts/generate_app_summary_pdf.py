from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path("/Users/ericmackenzie/Documents/GitHub/careshare")
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_FILE = OUTPUT_DIR / "careshare-app-summary.pdf"


def bullet(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(f"&#8226; {text}", style)


def section(title: str, rows: list[list], width: float) -> Table:
    table = Table(rows, colWidths=[width])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8F0FE")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#153E75")),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#C7D2E6")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D9E2F2")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(OUTPUT_FILE),
        pagesize=letter,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.45 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=21,
        leading=24,
        textColor=colors.HexColor("#102A43"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#486581"),
        spaceAfter=8,
    )
    section_header_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=13,
        textColor=colors.HexColor("#153E75"),
        spaceAfter=0,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.6,
        leading=10.4,
        textColor=colors.HexColor("#243B53"),
        spaceAfter=0,
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        parent=body_style,
        leftIndent=0,
        firstLineIndent=0,
        spaceAfter=2,
    )
    small_style = ParagraphStyle(
        "Small",
        parent=body_style,
        fontSize=8,
        leading=9.6,
        textColor=colors.HexColor("#52606D"),
    )

    left_width = 3.65 * inch
    right_width = 2.85 * inch

    left_rows = [
        [Paragraph("What It Is", section_header_style)],
        [
            Paragraph(
                "CareShare is a web app for coordinating care around an elderly loved one. "
                "Repo copy and UI flows position it as one shared place for families to manage tasks, "
                "costs, events, care details, and collaboration.",
                body_style,
            )
        ],
        [Paragraph("Who It's For", section_header_style)],
        [
            Paragraph(
                "Primary persona: family caregivers coordinating responsibilities with relatives. "
                "The repo also includes an admin portal for care providers or nursing-home staff managing multiple families.",
                body_style,
            )
        ],
        [Paragraph("What It Does", section_header_style)],
        [bullet("Creates family workspaces and supports multi-step onboarding plus member invitations.", bullet_style)],
        [bullet("Tracks care tasks with assignments, due dates, priorities, and attachments.", bullet_style)],
        [bullet("Manages shared finances: bills, contributions, pending costs, exports, and dashboards.", bullet_style)],
        [bullet("Maintains a shared calendar for appointments, birthdays, visits, and deliveries.", bullet_style)],
        [bullet("Stores care-planning data such as care recipient profile, medications, notes, and documents.", bullet_style)],
        [bullet("Provides family collaboration tools including messages, life stories, and resource directories.", bullet_style)],
        [bullet("Includes admin screens for users, families, blog/content, database tools, and settings.", bullet_style)],
    ]

    right_rows = [
        [Paragraph("How It Works", section_header_style)],
        [
            Paragraph(
                "<b>Frontend:</b> Next.js App Router pages under <font name='Helvetica-Oblique'>app/</font> render the marketing site, onboarding, family pages, dashboards, and admin UI.<br/>"
                "<b>Auth:</b> NextAuth with credentials and optional Google sign-in, wrapped by a SessionProvider; middleware protects <font name='Helvetica-Oblique'>/dashboard</font>, <font name='Helvetica-Oblique'>/family</font>, and <font name='Helvetica-Oblique'>/admin</font> routes.<br/>"
                "<b>Application layer:</b> Route handlers under <font name='Helvetica-Oblique'>app/api/</font> serve family-scoped CRUD for tasks, events, costs, resources, notes, medications, documents, messages, onboarding, and admin operations.<br/>"
                "<b>Data layer:</b> Prisma talks to PostgreSQL. Schema evidence shows core models for users, families, memberships, invitations, care recipients, tasks, events, costs, messages, documents, resources, care plans, scenarios, contributions, blog posts, and audit logs.<br/>"
                "<b>Files:</b> The upload route writes image/PDF receipts to <font name='Helvetica-Oblique'>public/uploads/receipts</font> on the app server.<br/>"
                "<b>Data flow:</b> Browser page -&gt; Next.js page/client fetch -&gt; API route -&gt; auth/permission checks -&gt; Prisma -&gt; PostgreSQL -&gt; JSON/UI refresh.",
                body_style,
            )
        ],
        [Paragraph("How To Run", section_header_style)],
        [bullet("Install deps: <b>npm install</b>", bullet_style)],
        [bullet("Create <b>.env</b> with <b>DATABASE_URL</b>, <b>NEXTAUTH_URL</b>, and <b>NEXTAUTH_SECRET</b>. Google OAuth vars appear optional in code.", bullet_style)],
        [bullet("Prepare Prisma: <b>npx prisma generate</b> and <b>npx prisma db push</b>", bullet_style)],
        [bullet("Start dev server: <b>npm run dev</b>", bullet_style)],
        [bullet("Open <b>http://localhost:3000</b>", bullet_style)],
        [Paragraph("Not Found In Repo", section_header_style)],
        [bullet("Production monitoring/queueing/notification service wiring: Not found in repo.", bullet_style)],
        [bullet("A checked-in .env.example file: Not found in repo.", bullet_style)],
        [Paragraph("Evidence Basis", section_header_style)],
        [
            Paragraph(
                "Sources used: README.md, package.json, prisma/schema.prisma, lib/auth.ts, lib/auth-utils.ts, middleware.ts, app/layout.tsx, app/page.tsx, app/onboarding/page.tsx, dashboard pages, and family/admin API routes.",
                small_style,
            )
        ],
    ]

    story = [
        Paragraph("CareShare", title_style),
        Paragraph("Repo-backed one-page application summary", subtitle_style),
    ]

    content_table = Table(
        [[section("", left_rows, left_width), section("", right_rows, right_width)]],
        colWidths=[left_width, right_width],
        hAlign="LEFT",
    )
    content_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(content_table)
    doc.build(story)
    print(OUTPUT_FILE)


if __name__ == "__main__":
    main()
