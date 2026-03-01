#!/bin/bash
# Build Coatings Estimator — concatenate src/ modules into a single index.html
set -e

OUT="index.html"
SRC="src"

echo "Building Coatings Estimator..."

# Head: DOCTYPE, meta, CDN scripts, <style> open tag
cat "$SRC/head.html" > "$OUT"

# CSS modules (order matters for cascade)
for f in \
  "$SRC/css/variables.css" \
  "$SRC/css/reset.css" \
  "$SRC/css/layout.css" \
  "$SRC/css/components.css" \
  "$SRC/css/screens.css" \
  "$SRC/css/calendar.css" \
  "$SRC/css/print.css" \
  "$SRC/css/responsive.css"; do
  [ -f "$f" ] && cat "$f" >> "$OUT"
done

# Body open: close </style>, open <body>, <div id="app">
cat "$SRC/body-open.html" >> "$OUT"

# HTML templates (order matters — mc div opens in home, closes in profiles)
for f in \
  "$SRC/templates/sidebar.html" \
  "$SRC/templates/header.html" \
  "$SRC/templates/home.html" \
  "$SRC/templates/list.html" \
  "$SRC/templates/record.html" \
  "$SRC/templates/estimate.html" \
  "$SRC/templates/invoice.html" \
  "$SRC/templates/system.html" \
  "$SRC/templates/reporting.html" \
  "$SRC/templates/invoices-all.html" \
  "$SRC/templates/settings.html" \
  "$SRC/templates/profiles.html" \
  "$SRC/templates/calendar.html" \
  "$SRC/templates/modals.html"; do
  [ -f "$f" ] && cat "$f" >> "$OUT"
done

# Static HTML (modals, toast)
cat "$SRC/body-close.html" >> "$OUT"

# JavaScript
echo '<script>' >> "$OUT"
for f in \
  "$SRC/js/data.js" \
  "$SRC/js/defaults.js" \
  "$SRC/js/utils.js" \
  "$SRC/js/profiles.js" \
  "$SRC/js/navigation.js" \
  "$SRC/js/records.js" \
  "$SRC/js/estimates.js" \
  "$SRC/js/invoicing.js" \
  "$SRC/js/pdf.js" \
  "$SRC/js/email.js" \
  "$SRC/js/settings.js" \
  "$SRC/js/calendar.js" \
  "$SRC/js/reporting.js" \
  "$SRC/js/integrations.js" \
  "$SRC/js/signatures.js" \
  "$SRC/js/portal.js" \
  "$SRC/js/app.js" \
  "$SRC/js/components.js" \
  "$SRC/js/init.js"; do
  [ -f "$f" ] && cat "$f" >> "$OUT"
done
echo '</script>' >> "$OUT"

# Footer
cat "$SRC/foot.html" >> "$OUT"

LINES=$(wc -l < "$OUT" | tr -d ' ')
SIZE=$(wc -c < "$OUT" | tr -d ' ')
echo "✓ Built $OUT ($LINES lines, $(( SIZE / 1024 )) KB)"
