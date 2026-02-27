# Coatings Estimator

**TCP Coatings Estimator** — Lead-to-completion pipeline with built-in product pricing for decorative concrete contractors.

A rebuild of the original Coatings Estimator app (2015) by Incredible Products, LLC. Designed for The Concrete Protector dealer network.

## Build Phases

### Phase 1: Pipeline + Estimating Engine (Single-File HTML)
- **Home screen** with 4 active folders (Lead, Estimate, Project, Completed) + 4 inactive
- **Lead management** — name, company, phone, email, address, notes
- **Multi-area estimates** — multiple systems per client (driveway, patio, garage)
- **Product system selector** — 35 TCP systems with instant pricing
- **On-the-fly price adjustment** — change $/sqft during quoting
- **Material cost visibility** — see product cost vs. charge price instantly
- **Save/Load** via localStorage + JSON export/import
- **Search** across all leads and estimates

### Phase 2: Ingredient Intelligence
- Per-system ingredient breakdowns (exact products, units, quantities)
- Order list generation (what to buy for the job)
- Approximate contractor cost per ingredient

### Phase 3: Proposals & Contracts
- PDF proposal generation
- Contract template with signature capture
- Email/share functionality

### Phase 4: Multi-User Backend
- Authentication (dealer accounts)
- Cloud database (data syncs across devices)
- Admin panel (manage systems, pricing, users)
- Team sharing (multiple users per dealer)

### Phase 5: Advanced Features
- Purchase order generation (group by vendor)
- Job photos (camera integration)
- Reporting & analytics (completed jobs, revenue tracking)
- Mobile PWA (installable on phone)

## Product Systems (from TCP Sales Tool)

| Series | Category | Systems | Cost Range | Sell Range |
|--------|----------|---------|------------|------------|
| C-Series | Rustic & Stone | 6 | $1.15–$1.43/sqft | $8–$14/sqft |
| M-Series | Metallic & Marble | 6 | $2.73–$3.25/sqft | $8.50–$15/sqft |
| G-Series | Graniflex | 11 | $2.06–$3.54/sqft | $7–$12/sqft |
| E-Series | Protector (Epoxy) | 4 | $1.05–$2.10/sqft | $3–$7.50/sqft |
| I-Series | Specialty | 3 | $0.31–$3.06/sqft | $2.50–$16/sqft |

Plus 6 top coats, 5 repairs, 7 add-ons.

---

*Built by Joe Quick — Incredible Products, LLC*
*The Concrete Protector | scientificpolishing.com*
