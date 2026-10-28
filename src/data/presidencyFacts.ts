/**
 * Presidency University Bengaluru - Published Sustainability Reference Facts
 * 
 * IMPORTANT:
 * These figures are curated reference benchmarks sourced from Presidency University's
 * published institutional sustainability reports and green campus documentation.
 * They are NOT live sensor readings, independently verified measurements,
 * or continuous historical time-series telemetry.
 */

import { UniversityReferenceFact, TariffAssumptions } from '../types/resource';

export const PRESIDENCY_UNIVERSITY_FACTS: UniversityReferenceFact[] = [
  {
    metric: 'Rooftop Solar Photovoltaic Generation',
    figure: '800',
    unit: 'units/day (kWh/day)',
    context: 'Rooftop solar PV installations across academic campus buildings feeding clean captive energy.',
    provenance: "Presidency University Bengaluru Institutional Sustainability & Green Campus Documentation",
    officialSourceUrl: 'https://presidencyuniversity.in/sustainability/',
    disclaimer: 'Reported institutional capacity benchmark. Not a live inverter telemetric feed or real-time grid export log.'
  },
  {
    metric: 'Wastewater Treatment & Campus Reuse',
    figure: '300,000',
    unit: 'litres/day (300 kL/day)',
    context: 'State-of-the-art on-site Sewage Treatment Plant (STP) reclaiming greywater and blackwater for campus landscaping and flushing.',
    provenance: "Presidency University Water Conservation & Campus Environmental Management Policy",
    officialSourceUrl: 'https://presidencyuniversity.in/sustainability/water-conservation/',
    disclaimer: 'Reported design capacity and operational average. Not live ultrasonic meter telemetry.'
  },
  {
    metric: 'Campus Food Waste Generation',
    figure: '120 – 150',
    unit: 'kg/day',
    context: 'Daily organic waste generated across university cafeterias, hostel mess halls, and food kiosks.',
    provenance: "Presidency University Waste Management & Composting Initiative Guidelines",
    officialSourceUrl: 'https://presidencyuniversity.in/sustainability/waste-management/',
    disclaimer: 'Institutional survey benchmark. Not an automated weigh-scale time series.'
  }
];

/**
 * Default Tariff Assumptions.
 * As explicitly required: We do not invent campus electricity tariffs, water tariffs,
 * or savings. If unconfigured, the UI clearly displays that financial impact cannot
 * yet be calculated reliably without verified commercial agreements.
 */
export const DEFAULT_TARIFF_ASSUMPTIONS: TariffAssumptions = {
  electricityRateInrPerKwh: null, // Unset by default to prevent fictitious financial claims
  waterRateInrPerKl: null,
  wasteDisposalRateInrPerKg: null,
  co2FactorKgPerKwh: null,
  isConfigured: false,
  notes: 'Actual tariffs are subject to commercial agreements (e.g. BESCOM HT-2c tariff for electricity and BWSSB bulk commercial rates for water). Configure rates to preview hypothetical cost figures.'
};

/**
 * Optional preset tariffs for user demonstration with clear disclosure.
 */
export const DEMO_PRESET_TARIFFS: TariffAssumptions = {
  electricityRateInrPerKwh: 8.50, // Typical Karnataka BESCOM commercial rate
  waterRateInrPerKl: 60.00,       // ₹60 per 1,000 litres
  wasteDisposalRateInrPerKg: 4.00,// Municipal tipping/handling fee
  co2FactorKgPerKwh: 0.82,        // CEA CO2 baseline database for Indian Grid
  isConfigured: true,
  notes: 'Illustrative modeling assumptions based on estimated Karnataka commercial schedules (BESCOM HT-2c & BWSSB bulk estimates); not independently verified campus contract tariffs.'
};
