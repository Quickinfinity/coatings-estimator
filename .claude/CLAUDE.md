# Project: Coatings Estimator

- **Created:** 2026-02-27
- **Owner:** Joe Quick
- **Repo:** https://github.com/Quickinfinity/coatings-estimator
- **Description:** TCP Coatings Estimator — Lead-to-completion pipeline with built-in product pricing for decorative concrete contractors

## Objectives
- Rebuild the original Coatings Estimator app (2015) as a modern web tool
- Full CRM pipeline: Lead → Estimate → Project → Completed (+ Inactive for each)
- Built-in TCP product pricing engine with instant quoting and ingredient calculations
- Dealer-facing tool for the TCP contractor network
- Phase 1: Single-file HTML with localStorage (prove UX), then scale to multi-user

## Tech Stack
- **Phase 1:** Single-file HTML/CSS/JS with localStorage (like SCP/TCP calculators)
- **Future:** Backend TBD (auth, database, multi-user) when scaling to dealers

## Architecture
- Data model designed for multi-user from day one (so backend is a swap, not a rewrite)
- Pipeline: Lead → Estimate → Project → Completed (Active + Inactive for each)
- Each Lead can have multiple Estimates
- Each Estimate can have multiple Systems (areas: driveway, patio, garage, etc.)
- Each System selects a TCP product system + calculates pricing + ingredients

## Product Data Source
- TCP Sales Tool (TCP-Sales-Tool-Standalone.html) contains all current pricing:
  - 35 product systems (C/M/G/E/I series) with cost + sell ranges
  - 6 top coats, 5 repairs, 7 add-ons
  - All costs per sqft/lnft/each

## Design Heritage
- Original app: Cordova 3.7.0 hybrid (AngularJS, Bootstrap, PostgreSQL backend)
- Original branding: Red shield with calculator icons, space/earth background
- New branding: TCP gold/dark theme consistent with TCP Sales Tool and SCP Calculator

## Project-Specific Rules
- Follow global CLAUDE.md defaults
- Single-file HTML for Phase 1 — no build tools, no dependencies except CDN fonts
- localStorage for persistence until backend phase
- All pricing data embedded in the file (no external API calls in Phase 1)
