# Coatings Estimator — User Guide

**The Concrete Protector Dealer CRM & Estimating Tool**
Version 1.0 | February 2026

---

## Getting Started

The Coatings Estimator is a CRM and quoting tool built for TCP dealers. It runs entirely in your browser — no login required. All data is saved locally on your device.

**Access it at:** [joequick.com/coatings-estimator](https://joequick.com/coatings-estimator/)

---

## The Pipeline (Home Screen)

When you open the tool, you'll see your **Pipeline** — a dashboard of all your jobs organized by status:

| Status | What It Means |
|--------|---------------|
| **Lead** | New contact or inquiry — hasn't been quoted yet |
| **Estimate** | Lead with at least one estimate/quote created |
| **Project** | Sold job — on the calendar, ready to install |
| **Completed** | Finished job |

Each status has **Active** and **Archived** folders. Use the Active toggle on any record to archive it without deleting.

The **Pipeline Summary** cards at the top show total dollar value in each stage.

---

## Creating a Lead

1. Click any **Leads** folder on the home screen
2. Click **+ New Lead** (top right)
3. Fill in the contact info:
   - First/Last Name, Company
   - Email, Phone (cell/home/office), Best Time to Call
   - Full address (Street, City, State, Zip)
   - Notes
4. Click **Save**

> **Tip:** The lead will automatically move to "Estimate" status when you create your first estimate.

---

## Building an Estimate

### Create the Estimate
1. Open a lead/record
2. Scroll to the **Estimates** card
3. Click **+ New Estimate**
4. Name your estimate (click the title to edit it inline)

### Add Areas
Each estimate can have multiple areas (e.g., Garage, Patio, Driveway). For each area:

1. Click **+ Add Area**
2. Enter the **Area Name** (e.g., "2-Car Garage")
3. Enter dimensions:
   - **Length x Width** — square footage calculates automatically
   - Or type **Square Feet** directly (overrides L x W)
4. Select a **Product System** from the 30 TCP systems:
   - Use the series filter tabs (C-Series, M-Series, G-Series, E-Series, I-Series) to narrow down
   - Click a product to select it — the suggested sell rate auto-fills
5. Set your **Sell Rate** ($/sqft) — the system price updates in real-time
6. Optionally select a **Top Coat** (7 options available)
7. Add any **Repairs** (toggle on, set quantity and sell rate):
   - Quick Patch, Joint Fill, MPP 80, LRB/TAV Patch
8. Add any **Add-ons** (toggle on, set quantity and sell rate):
   - Surface Prep, LRB Flood Coat, Hydrophobic Sealer, Hydro-Polish, Easy Cove (4" or 6"), Flooring Logo
9. Click **Save**

### Understanding the Numbers
For every area, you'll see real-time stats:
- **Total Price** — what the customer pays
- **Material Cost** — your cost based on TCP product data
- **Gross Profit** — price minus cost
- **Margin %** — color-coded: green (50%+), gold (30-50%), red (below 30%)

The **Estimate Total Bar** at the top sums all areas.

---

## Product Systems Reference

| Series | Products | Typical Sell Range |
|--------|----------|-------------------|
| **C-Series** (Rustic & Stone) | Rustic Concrete Wood, Grand Flagstone, Tuscan Slate (Interior & Exterior) | $8.00 – $14.00/sqft |
| **M-Series** (Metallic & Marble) | Metallic Marble Stain, Italian Marble Epoxy (Gloss, Satin, Finish) | $8.50 – $15.00/sqft |
| **G-Series** (Graniflex) | Flake Broadcast, Quartz Broadcast, Marble-Flex (multiple topcoat options) | $7.00 – $12.00/sqft |
| **E-Series** (Protector) | Protector-Flake, Resinous 123 Floor | $3.00 – $7.50/sqft |
| **I-Series** (Specialty) | SCP Polish, Poly-Hard Super-Nova, Poly-Hard Quartz | $2.50 – $16.00/sqft |

---

## Order List (Materials Tab)

Once you've built an estimate with areas and products, switch to the **Order List** tab to see:

1. **By Area** — every material needed for each area, with quantities calculated from coverage rates
2. **Consolidated Purchase List** — all materials combined and de-duplicated across areas

This tells you exactly what to order from TCP and how much it will cost.

---

## Generating a PDF Proposal

1. Open an estimate
2. Click **PDF Proposal** (top right)
3. A branded TCP proposal downloads automatically with:
   - Client name, company, and address
   - Area-by-area breakdown with systems, sqft, and pricing
   - Repairs and add-ons as line items
   - Total price
   - Terms & conditions
   - Signature lines for contractor and customer

> **File name format:** `TCP-Proposal-[ClientName]-[Date].pdf`

---

## Contracts & Signatures

1. Open an estimate → click the **Contract** tab
2. Edit the **Terms & Conditions** text (pre-filled with standard TCP terms)
3. Collect signatures:
   - **Contractor Signature** — draw with mouse or finger (touch-enabled)
   - **Customer Signature** — have the customer sign on screen
   - Click **Clear** under either pad to redo
4. Click **Download Contract PDF**

The contract PDF includes the scope of work table, terms, and embedded signature images.

---

## Reports & Analytics

Click **Reports** in the header to see:

- **Completed Revenue** — total from all completed jobs
- **Active Pipeline** — total value of all active records
- **Average Job Size** — based on completed jobs
- **Total Sqft Quoted** — across all estimates
- **Top Systems** — bar chart of most-used product systems
- **Pipeline Breakdown** — visual of records in each stage
- **Recent Activity** — last 6 updated records

---

## Managing Records

### Moving Through the Pipeline
- Open a record → click a **status pill** (Lead, Estimate, Project, Completed) to move it
- The record automatically becomes Active when you change status

### Archiving
- Toggle **Active** off on any record to archive it
- Archived records appear in the "Archived" folders on the home screen
- Toggle Active back on to restore

### Deleting
- Open a record → click **Delete** → confirm
- This permanently removes the record and all its estimates

---

## Data Backup & Transfer

### Export
1. Click **Export** in the header
2. Click **Download** — saves a JSON file with all your data
3. Store this file safely as a backup

### Import
1. Click **Import** in the header
2. Select a previously exported JSON file
3. Click **Import**

> **Warning:** Importing replaces ALL current data. Export first if you want to keep existing records.

---

## Tips for Dealers

1. **Start with the sell rate range** — each product shows a low-mid range. New dealers should start at the mid range and adjust based on your market.

2. **Don't forget repairs and add-ons** — joint fill, surface prep, and cove base are common upsells that add significant revenue.

3. **Use the margin indicator** — if your margin is red (below 30%), consider raising your sell rate or reviewing material costs.

4. **Name your estimates clearly** — use descriptive names like "Garage Only" or "Full Exterior Package" so you can compare options for the same client.

5. **Export regularly** — since data is stored in your browser, export a backup weekly. Clearing browser data will erase your records.

6. **Works on mobile** — the tool is fully responsive. Add it to your home screen for app-like access on job sites.

---

## Keyboard Shortcuts

- Click the **CE** logo or header title at any time to return Home
- Use the **breadcrumb trail** below the header to navigate back to any level
- The **Search bar** in list views filters by name, company, or address

---

## Support

Questions or issues? Contact Joe Quick or the TCP support team.

*Built for The Concrete Protector dealer network.*
