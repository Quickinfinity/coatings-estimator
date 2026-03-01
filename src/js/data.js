'use strict';

// ═══════════════════════════════════════════════════════════
// PRODUCT DATA
// ═══════════════════════════════════════════════════════════
const PRODUCTS=[
  {id:'c101',sku:'C-101',name:'Rustic Concrete Wood (Exterior)',series:'C-Series',cat:'Rustic & Stone',cost:1.15,low:8.00,mid:14.00},
  {id:'c102',sku:'C-102',name:'Rustic Concrete Wood (Interior)',series:'C-Series',cat:'Rustic & Stone',cost:1.43,low:8.00,mid:14.00},
  {id:'c103',sku:'C-103',name:'Grand Flagstone (Exterior)',series:'C-Series',cat:'Rustic & Stone',cost:1.15,low:8.00,mid:14.00},
  {id:'c104',sku:'C-104',name:'Grand Flagstone (Interior)',series:'C-Series',cat:'Rustic & Stone',cost:1.43,low:8.00,mid:14.00},
  {id:'c105',sku:'C-105',name:'Tuscan Slate (Exterior)',series:'C-Series',cat:'Rustic & Stone',cost:1.15,low:8.00,mid:14.00},
  {id:'c106',sku:'C-106',name:'Tuscan Slate (Interior)',series:'C-Series',cat:'Rustic & Stone',cost:1.43,low:8.00,mid:14.00},
  {id:'m201',sku:'M-201',name:'Metallic Marble Stain Gloss',series:'M-Series',cat:'Metallic & Marble',cost:3.13,low:8.50,mid:15.00},
  {id:'m202',sku:'M-202',name:'Metallic Marble Stain Satin',series:'M-Series',cat:'Metallic & Marble',cost:3.21,low:8.50,mid:15.00},
  {id:'m203',sku:'M-203',name:'Metallic Marble Stain Finish',series:'M-Series',cat:'Metallic & Marble',cost:2.73,low:8.50,mid:15.00},
  {id:'m204',sku:'M-204',name:'Italian Marble Epoxy Finish',series:'M-Series',cat:'Metallic & Marble',cost:2.76,low:9.00,mid:15.00},
  {id:'m205',sku:'M-205',name:'Italian Marble Epoxy Gloss',series:'M-Series',cat:'Metallic & Marble',cost:3.16,low:9.00,mid:15.00},
  {id:'m206',sku:'M-206',name:'Italian Marble Epoxy Satin',series:'M-Series',cat:'Metallic & Marble',cost:3.25,low:9.00,mid:15.00},
  {id:'g301',sku:'G-301',name:'Graniflex Flake Broadcast PP-90',series:'G-Series',cat:'Graniflex',cost:2.59,low:7.00,mid:9.00},
  {id:'g302',sku:'G-302',name:'Graniflex Flake Broadcast Graniseal',series:'G-Series',cat:'Graniflex',cost:2.55,low:7.00,mid:9.00},
  {id:'g303',sku:'G-303',name:'Graniflex Flake Neat Coat',series:'G-Series',cat:'Graniflex',cost:2.09,low:7.00,mid:9.00},
  {id:'g304',sku:'G-304',name:'Graniflex Flake P-Thane',series:'G-Series',cat:'Graniflex',cost:2.40,low:7.00,mid:9.00},
  {id:'g305',sku:'G-305',name:'Graniflex 1-Quartz Broadcast PP-90',series:'G-Series',cat:'Graniflex',cost:2.82,low:7.50,mid:10.00},
  {id:'g306',sku:'G-306',name:'Graniflex 1-Quartz Broadcast Graniseal',series:'G-Series',cat:'Graniflex',cost:2.77,low:7.50,mid:10.00},
  {id:'g307',sku:'G-307',name:'Graniflex 1-Quartz Neat Coat',series:'G-Series',cat:'Graniflex',cost:2.19,low:7.50,mid:10.00},
  {id:'g308',sku:'G-308',name:'Graniflex 1-Quartz P-Thane',series:'G-Series',cat:'Graniflex',cost:2.59,low:7.50,mid:10.00},
  {id:'g309',sku:'G-309',name:'Graniflex 2-Quartz Broadcast PP-90',series:'G-Series',cat:'Graniflex',cost:3.54,low:8.50,mid:12.00},
  {id:'g310',sku:'G-310',name:'Graniflex 2-Quartz Broadcast Graniseal',series:'G-Series',cat:'Graniflex',cost:3.08,low:8.50,mid:12.00},
  {id:'g311',sku:'G-311',name:'Marble-Flex PP-90',series:'G-Series',cat:'Graniflex',cost:2.85,low:8.50,mid:12.00},
  {id:'g312',sku:'G-312',name:'Marble-Flex w/ Solid Poly 90',series:'G-Series',cat:'Graniflex',cost:2.84,low:8.50,mid:12.00},
  {id:'e401',sku:'E-401',name:'Protector-Flake P-Thane',series:'E-Series',cat:'Protector',cost:1.94,low:5.50,mid:7.50},
  {id:'e402',sku:'E-402',name:'Protector-Flake PP-90',series:'E-Series',cat:'Protector',cost:2.13,low:5.50,mid:7.50},
  {id:'e403',sku:'E-403',name:'Protector-Flake Neat Coat',series:'E-Series',cat:'Protector',cost:1.46,low:5.50,mid:7.50},
  {id:'e404',sku:'E-404',name:'Resinous 123 Floor',series:'E-Series',cat:'Protector',cost:1.05,low:3.00,mid:5.00},
  {id:'i501',sku:'I-501',name:'SCP Polish (Chemicals)',series:'I-Series',cat:'Specialty',cost:0.31,low:2.50,mid:9.00},
  {id:'i502',sku:'I-502',name:'Poly-Hard Super-Nova',series:'I-Series',cat:'Specialty',cost:2.85,low:8.00,mid:16.00},
  {id:'i503',sku:'I-503',name:'Poly-Hard Quartz PP-90',series:'I-Series',cat:'Specialty',cost:3.06,low:8.50,mid:16.00},
];
const TOPCOATS=[
  {id:'tc-none',name:'None',cost:0,desc:'No additional top coat',unitPrice:0,coverage:1},
  {id:'ut4451',sku:'UT-4451',name:'Protectorthane (Interior)',cost:0.37,desc:'Interior polyurethane',unitPrice:110.67,coverage:300},
  {id:'tj3113',sku:'TJ-3113',name:'Acrylic Floor Finish',cost:0.02,desc:'Economical acrylic',unitPrice:36.23,coverage:2000},
  {id:'ut4501',sku:'UT-4501',name:'WB 421 Gloss Urethane',cost:0.42,desc:'Water-based high-gloss',unitPrice:126.25,coverage:300},
  {id:'ut4499',sku:'UT-4499',name:'WB 221 Satin Urethane',cost:0.50,desc:'Water-based satin',unitPrice:151.35,coverage:300},
  {id:'en6303',sku:'EN-6303',name:'Epoxy Neat Coat',cost:0.79,desc:'Smooth epoxy finish',unitPrice:78.89,coverage:100},
  {id:'ut4515',sku:'UT-4515',name:'Perfect Poly 90',cost:0.65,desc:'Premium polyaspartic',unitPrice:129.39,coverage:200},
  {id:'ut4304',sku:'UT-4304',name:'Graniseal',cost:1.25,desc:'Graniflex sealer',unitPrice:124.92,coverage:100},
  {id:'ut4463',sku:'UT-4463',name:'Grey Protectorthane',cost:0.59,desc:'Grey-tinted protectorthane',unitPrice:129.79,coverage:220},
  {id:'ut4513',sku:'UT-4513',name:'SLV 90',cost:0.85,desc:'SLV polyaspartic',unitPrice:170.13,coverage:200},
];
const REPAIRS=[
  {id:'si1652',sku:'SI-1652',name:'Quick Patch',cost:0.77,unit:'sqft'},
  {id:'em6018',sku:'EM-6018',name:'Protector-Flex Joint Fill',cost:1.06,unit:'lnft'},
  {id:'mpp2001',sku:'MPP-2001',name:'MPP 80 Joint Fill',cost:2.00,unit:'lnft'},
  {id:'mpp1019',sku:'MPP-1019',name:'Bulk: MPP 80 Joint Fill',cost:0.70,unit:'lnft'},
  {id:'r701',sku:'R-701',name:'LRB/TAV Patch & Joint Fill',cost:1.76,unit:'lnft'},
];
const ADDONS=[
  {id:'a601',sku:'A-601',name:'Surface Preparation / Removal',cost:0.25,low:1.00,mid:3.00,unit:'sqft'},
  {id:'a602',sku:'A-602',name:'LRB Flood Coat',cost:2.34,low:1.50,mid:3.00,unit:'sqft'},
  {id:'a603',sku:'A-603',name:'Penetrating Hydrophobic Sealer',cost:0.17,low:0.50,mid:1.00,unit:'sqft'},
  {id:'a604',sku:'A-604',name:'Hydro-Polish',cost:0.04,low:0.15,mid:0.50,unit:'sqft'},
  {id:'a605',sku:'EC-4203',name:'Easy Cove 4"',cost:6.41,low:13.00,mid:18.00,unit:'lnft'},
  {id:'a606',sku:'EC-4209',name:'Easy Cove 6"',cost:8.61,low:14.00,mid:18.00,unit:'lnft'},
  {id:'a607',sku:'MG-2519',name:'Flooring Logo',cost:17.00,low:40.00,mid:65.00,unit:'each'},
];
const INGREDIENTS={
  'c101':[{name:'CP Texture Mix (2 coats)',sku:'DM-3913',coverage:100,unit:'bag',costPer:29.52},{name:'HD Resin (2 coats)',sku:'DM-5406',coverage:100,unit:'gal',costPer:29.83},{name:'CP Mineral Pigment (2 coats)',sku:'DC-2022',coverage:700,unit:'qt',costPer:31.52},{name:'Acrylic Shield (2 coats)',sku:'SE-2803',coverage:75,unit:'gal',costPer:38.13}],
  'c103':[{name:'CP Texture Mix (2 coats)',sku:'DM-3913',coverage:100,unit:'bag',costPer:29.52},{name:'HD Resin (2 coats)',sku:'DM-5406',coverage:100,unit:'gal',costPer:29.83},{name:'CP Mineral Pigment (2 coats)',sku:'DC-2022',coverage:700,unit:'qt',costPer:31.52},{name:'Acrylic Shield (2 coats)',sku:'SE-2803',coverage:75,unit:'gal',costPer:38.13}],
  'c105':[{name:'CP Texture Mix (2 coats)',sku:'DM-3913',coverage:100,unit:'bag',costPer:29.52},{name:'HD Resin (2 coats)',sku:'DM-5406',coverage:100,unit:'gal',costPer:29.83},{name:'CP Mineral Pigment (2 coats)',sku:'DC-2022',coverage:700,unit:'qt',costPer:31.52},{name:'Acrylic Shield (2 coats)',sku:'SE-2803',coverage:75,unit:'gal',costPer:38.13}],
  'c102':[{name:'CP Texture Mix (2 coats)',sku:'DM-3913',coverage:100,unit:'bag',costPer:29.52},{name:'HD Resin (2 coats)',sku:'DM-5406',coverage:100,unit:'gal',costPer:29.83},{name:'CP Mineral Pigment (2 coats)',sku:'DC-2022',coverage:700,unit:'qt',costPer:31.52},{name:'Epoxy Neat Coat',sku:'EN-6303',coverage:100,unit:'gal',costPer:78.89}],
  'c104':[{name:'CP Texture Mix (2 coats)',sku:'DM-3913',coverage:100,unit:'bag',costPer:29.52},{name:'HD Resin (2 coats)',sku:'DM-5406',coverage:100,unit:'gal',costPer:29.83},{name:'CP Mineral Pigment (2 coats)',sku:'DC-2022',coverage:700,unit:'qt',costPer:31.52},{name:'Epoxy Neat Coat',sku:'EN-6303',coverage:100,unit:'gal',costPer:78.89}],
  'c106':[{name:'CP Texture Mix (2 coats)',sku:'DM-3913',coverage:100,unit:'bag',costPer:29.52},{name:'HD Resin (2 coats)',sku:'DM-5406',coverage:100,unit:'gal',costPer:29.83},{name:'CP Mineral Pigment (2 coats)',sku:'DC-2022',coverage:700,unit:'qt',costPer:31.52},{name:'Epoxy Neat Coat',sku:'EN-6303',coverage:100,unit:'gal',costPer:78.89}],
  'm201':[{name:'Epoxy Neat Coat (base)',sku:'EN-6303',coverage:60,unit:'gal',costPer:78.89},{name:'Epoxy Neat Coat (top)',sku:'EN-6303',coverage:60,unit:'gal',costPer:78.89},{name:'Marble Metallics',sku:'MQ-001',coverage:375,unit:'qt',costPer:29.96},{name:'WB 421 Gloss Urethane',sku:'UT-4501',coverage:300,unit:'gal',costPer:126.25}],
  'm202':[{name:'Epoxy Neat Coat (base)',sku:'EN-6303',coverage:60,unit:'gal',costPer:78.89},{name:'Epoxy Neat Coat (top)',sku:'EN-6303',coverage:60,unit:'gal',costPer:78.89},{name:'Marble Metallics',sku:'MQ-001',coverage:375,unit:'qt',costPer:29.96},{name:'WB 221 Satin Urethane',sku:'UT-4499',coverage:300,unit:'gal',costPer:151.35}],
  'm203':[{name:'Epoxy Neat Coat (base)',sku:'EN-6303',coverage:60,unit:'gal',costPer:78.89},{name:'Epoxy Neat Coat (top)',sku:'EN-6303',coverage:60,unit:'gal',costPer:78.89},{name:'Marble Metallics',sku:'MQ-001',coverage:375,unit:'qt',costPer:29.96},{name:'Acrylic Floor Finish',sku:'TJ-3113',coverage:2000,unit:'gal',costPer:36.23}],
  'm204':[{name:'Epoxy Neat Coat (base)',sku:'EN-6303',coverage:100,unit:'gal',costPer:78.89},{name:'Barricade Color Pak',sku:'SE-2839',coverage:450,unit:'qt',costPer:75.78},{name:'Epoxy Neat Coat (top)',sku:'EN-6303',coverage:80,unit:'gal',costPer:78.89},{name:'Marble Metallics',sku:'MQ-001',coverage:240,unit:'qt',costPer:29.96},{name:'Marble Spray',sku:'MQ-604L',coverage:100,unit:'can',costPer:14.97},{name:'Epoxy Neat Coat (clear)',sku:'EN-6303',coverage:150,unit:'gal',costPer:78.89},{name:'Acrylic Floor Finish',sku:'TJ-3113',coverage:2000,unit:'gal',costPer:36.23}],
  'm205':[{name:'Epoxy Neat Coat (base)',sku:'EN-6303',coverage:100,unit:'gal',costPer:78.89},{name:'Barricade Color Pak',sku:'SE-2839',coverage:450,unit:'qt',costPer:75.78},{name:'Epoxy Neat Coat (top)',sku:'EN-6303',coverage:80,unit:'gal',costPer:78.89},{name:'Marble Metallics',sku:'MQ-001',coverage:240,unit:'qt',costPer:29.96},{name:'Marble Spray',sku:'MQ-604L',coverage:100,unit:'can',costPer:14.97},{name:'Epoxy Neat Coat (clear)',sku:'EN-6303',coverage:150,unit:'gal',costPer:78.89},{name:'WB 421 Gloss Urethane',sku:'UT-4501',coverage:300,unit:'gal',costPer:126.25}],
  'm206':[{name:'Epoxy Neat Coat (base)',sku:'EN-6303',coverage:100,unit:'gal',costPer:78.89},{name:'Barricade Color Pak',sku:'SE-2839',coverage:450,unit:'qt',costPer:75.78},{name:'Epoxy Neat Coat (top)',sku:'EN-6303',coverage:80,unit:'gal',costPer:78.89},{name:'Marble Metallics',sku:'MQ-001',coverage:240,unit:'qt',costPer:29.96},{name:'Marble Spray',sku:'MQ-604L',coverage:100,unit:'can',costPer:14.97},{name:'Epoxy Neat Coat (clear)',sku:'EN-6303',coverage:150,unit:'gal',costPer:78.89},{name:'WB 221 Satin Urethane',sku:'UT-4499',coverage:300,unit:'gal',costPer:151.35}],
  'g301':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Stone Blend Flake',sku:'CF-STN1/4',coverage:7,unit:'lb',costPer:2.75},{name:'Perfect Poly 90',sku:'UT-4515',coverage:100,unit:'gal',costPer:129.39}],
  'g302':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Stone Blend Flake',sku:'CF-STN1/4',coverage:7,unit:'lb',costPer:2.75},{name:'Graniseal',sku:'UT-4304',coverage:100,unit:'gal',costPer:124.92}],
  'g303':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Stone Blend Flake',sku:'CF-STN1/4',coverage:7,unit:'lb',costPer:2.75},{name:'Epoxy Neat Coat',sku:'EN-6303',coverage:100,unit:'gal',costPer:78.89}],
  'g304':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Stone Blend Flake',sku:'CF-STN1/4',coverage:7,unit:'lb',costPer:2.75},{name:'Protectorthane',sku:'UT-4451',coverage:100,unit:'gal',costPer:110.67}],
  'g305':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Decorative Quartz',sku:'CQ-BLD',coverage:2,unit:'lb',costPer:0.60},{name:'Perfect Poly 90',sku:'UT-4515',coverage:80,unit:'gal',costPer:129.39}],
  'g306':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Decorative Quartz',sku:'CQ-BLD',coverage:2,unit:'lb',costPer:0.60},{name:'Graniseal',sku:'UT-4304',coverage:80,unit:'gal',costPer:124.92}],
  'g307':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Decorative Quartz',sku:'CQ-BLD',coverage:2,unit:'lb',costPer:0.60},{name:'Epoxy Neat Coat',sku:'EN-6303',coverage:80,unit:'gal',costPer:78.89}],
  'g308':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Decorative Quartz',sku:'CQ-BLD',coverage:2,unit:'lb',costPer:0.60},{name:'Protectorthane',sku:'UT-4451',coverage:80,unit:'gal',costPer:110.67}],
  'g309':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Decorative Quartz (1st)',sku:'CQ-BLD',coverage:2,unit:'lb',costPer:0.60},{name:'Perfect Poly 90 (intercoat)',sku:'UT-4515',coverage:175,unit:'gal',costPer:129.39},{name:'Decorative Quartz (2nd)',sku:'CQ-BLD',coverage:2,unit:'lb',costPer:0.60},{name:'Perfect Poly 90 (final)',sku:'UT-4515',coverage:100,unit:'gal',costPer:129.39}],
  'g310':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Decorative Quartz (1st)',sku:'CQ-BLD',coverage:2,unit:'lb',costPer:0.60},{name:'Perfect Poly 90 (intercoat)',sku:'UT-4515',coverage:175,unit:'gal',costPer:129.39},{name:'Decorative Quartz (2nd)',sku:'CQ-BLD',coverage:2,unit:'lb',costPer:0.60},{name:'Graniseal',sku:'UT-4304',coverage:150,unit:'gal',costPer:124.92}],
  'g311':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (broadcast)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Marble Spray',sku:'MQ-604L',coverage:100,unit:'can',costPer:14.97},{name:'Perfect Poly 90 (seal)',sku:'UT-4515',coverage:175,unit:'gal',costPer:129.39},{name:'Perfect Poly 90 (topcoat)',sku:'UT-4515',coverage:122,unit:'gal',costPer:129.39}],
  'g312':[{name:'Permaflex (prime)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Permaflex (flex coat)',sku:'PFA-1010',coverage:220,unit:'gal',costPer:99.55},{name:'Perfect Poly 90 (solid)',sku:'UT-4515',coverage:200,unit:'gal',costPer:129.39},{name:'Perfect Poly 90 (design)',sku:'UT-4515',coverage:400,unit:'gal',costPer:129.39},{name:'Marble Spray',sku:'MQ-604L',coverage:100,unit:'can',costPer:14.97},{name:'Perfect Poly 90 (clear)',sku:'UT-4515',coverage:200,unit:'gal',costPer:129.39},{name:'Poly Fusion Color Pak',sku:'UT-4421',coverage:450,unit:'qt',costPer:74.77}],
  'e401':[{name:'Base Coat Epoxy',sku:'EB-6127',coverage:200,unit:'gal',costPer:87.82},{name:'Stone Blend Flake',sku:'CF-STN1/4',coverage:7,unit:'lb',costPer:2.75},{name:'Protectorthane',sku:'UT-4451',coverage:100,unit:'gal',costPer:110.67}],
  'e402':[{name:'Base Coat Epoxy',sku:'EB-6127',coverage:200,unit:'gal',costPer:87.82},{name:'Stone Blend Flake',sku:'CF-STN1/4',coverage:7,unit:'lb',costPer:2.75},{name:'Perfect Poly 90',sku:'UT-4515',coverage:100,unit:'gal',costPer:129.39}],
  'e403':[{name:'Base Coat Epoxy',sku:'EB-6127',coverage:200,unit:'gal',costPer:87.82},{name:'Stone Blend Flake',sku:'CF-STN1/4',coverage:7,unit:'lb',costPer:2.75},{name:'Epoxy Neat Coat',sku:'EN-6303',coverage:125,unit:'gal',costPer:78.89}],
  'e404':[{name:'Base Coat Epoxy',sku:'EB-6127',coverage:220,unit:'gal',costPer:87.82},{name:'Grey Protectorthane (coat 1)',sku:'UT-4463',coverage:400,unit:'gal',costPer:129.79},{name:'Grey Protectorthane (coat 2)',sku:'UT-4463',coverage:400,unit:'gal',costPer:129.79}],
  'i501':[{name:'SCP Cutter',sku:'SCP-6103',coverage:300,unit:'gal',costPer:48.53},{name:'SCP Hardener',sku:'SCP-6107',coverage:400,unit:'gal',costPer:27.04},{name:'Hydro Polish',sku:'SCP-6169',coverage:750,unit:'gal',costPer:26.64},{name:'SCP Sealer',sku:'SCP-6113',coverage:2000,unit:'gal',costPer:85.57}],
  'i502':[{name:'PolyHard',sku:'IC-3018',coverage:60,unit:'kit',costPer:113.88},{name:'Super Nova',sku:'EM-4491',coverage:150,unit:'gal',costPer:143.37}],
  'i503':[{name:'PolyHard',sku:'IC-3018',coverage:60,unit:'kit',costPer:113.88},{name:'Decorative Quartz',sku:'CQ-BLD',coverage:2,unit:'lb',costPer:0.60},{name:'Perfect Poly 90',sku:'UT-4515',coverage:150,unit:'gal',costPer:129.39}],
};

// ── Merged getters (built-in + custom) ───────────────────
function getAllProducts(){return[...PRODUCTS,...(settings&&settings.customProducts||[])]}
function getAllTopcoats(){return[...TOPCOATS,...(settings&&settings.customTopcoats||[])]}
function getAllRepairs(){return[...REPAIRS,...(settings&&settings.customRepairs||[])]}
function getAllAddons(){return[...ADDONS,...(settings&&settings.customAddons||[])]}

// ── Auto-save (debounced) ────────────────────────────────
let _autoSaveTimer=null;
function autoSave(){clearTimeout(_autoSaveTimer);_autoSaveTimer=setTimeout(()=>{saveDB(db)},800)}

const STATUSES=[{id:'lead',label:'Lead',color:'lead'},{id:'estimate',label:'Estimate',color:'est'},{id:'project',label:'Project',color:'proj'},{id:'completed',label:'Completed',color:'comp'}];
const FOLDER_ICONS={lead:'&#9993;',estimate:'&#9997;',project:'&#9874;',completed:'&#10003;'};

// ── Custom Product Categories ──────────────────────────────
let customCat='products';
const CUSTOM_CATS=[
  {id:'products',label:'Products',key:'customProducts'},
  {id:'topcoats',label:'Topcoats',key:'customTopcoats'},
  {id:'repairs',label:'Repairs',key:'customRepairs'},
  {id:'addons',label:'Add-ons',key:'customAddons'}
];

function esc(s){return String(s).replace(/"/g,'&quot;').replace(/</g,'&lt;')}
