/**
 * Robust CSV Parsing and Schema Validation Engine
 * EcoTech PU - Presidency University Bengaluru
 */

import {
  EnergyReading,
  WaterReading,
  WasteReading,
  CampusLocation,
  CsvValidationResult
} from '../types/resource';

const VALID_LOCATIONS: CampusLocation[] = [
  'Academic Block 1',
  'Academic Block 2',
  'Hostel Cluster A & B',
  'University Food Court',
  'Central Library & Admin',
  'Sports Complex & Auditorium'
];

/**
 * Match a raw string to the closest valid CampusLocation, or default safely.
 */
function normalizeLocation(raw: string): CampusLocation {
  const clean = raw.trim().toLowerCase();
  for (const loc of VALID_LOCATIONS) {
    if (loc.toLowerCase() === clean) return loc;
  }
  if (clean.includes('academic 1') || clean.includes('ab1') || clean.includes('block 1')) return 'Academic Block 1';
  if (clean.includes('academic 2') || clean.includes('ab2') || clean.includes('block 2')) return 'Academic Block 2';
  if (clean.includes('hostel')) return 'Hostel Cluster A & B';
  if (clean.includes('food') || clean.includes('cafe') || clean.includes('canteen')) return 'University Food Court';
  if (clean.includes('library') || clean.includes('admin')) return 'Central Library & Admin';
  if (clean.includes('sports') || clean.includes('audi')) return 'Sports Complex & Auditorium';

  return 'Academic Block 1';
}

/**
 * Parse CSV text into array of string arrays (rows and cells)
 */
export function parseCsvRows(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let insideQuotes = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          entry += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    rows.push(row);
  }

  return rows;
}

/**
 * Validate and parse Energy CSV
 * Expected schema: timestamp, location, observed_kwh, baseline_kwh, [notes]
 */
export function validateEnergyCsv(csvText: string): CsvValidationResult<EnergyReading> {
  const rows = parseCsvRows(csvText);
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: EnergyReading[] = [];

  if (rows.length < 2) {
    return {
      isValid: false,
      data: [],
      errors: ['CSV file is empty or missing data rows.'],
      warnings: [],
      rowCount: 0,
      validRowCount: 0
    };
  }

  const header = rows[0].map(h => h.toLowerCase().replace(/[\s_-]+/g, ''));
  const tsIdx = header.findIndex(h => h.includes('time') || h.includes('date'));
  const locIdx = header.findIndex(h => h.includes('loc') || h.includes('block') || h.includes('building'));
  const obsIdx = header.findIndex(h => h.includes('obs') || h.includes('kwh') || h.includes('reading') || h.includes('val'));
  const baseIdx = header.findIndex(h => h.includes('base') || h.includes('expected'));

  if (tsIdx === -1 || obsIdx === -1) {
    errors.push('Missing required column headers: Expected "timestamp" and "observed_kwh" (or "reading").');
    return {
      isValid: false,
      data: [],
      errors,
      warnings,
      rowCount: rows.length - 1,
      validRowCount: 0
    };
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (row.length <= 1 && !row[0]) continue;

    const rawTs = row[tsIdx] || '';
    const parsedDate = new Date(rawTs);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Row ${rowNum}: Invalid timestamp format "${rawTs}". Use ISO format (e.g. 2026-10-26T14:00:00Z).`);
      continue;
    }

    const rawObs = row[obsIdx];
    const observed = parseFloat(rawObs);
    if (isNaN(observed) || observed < 0) {
      errors.push(`Row ${rowNum}: "observed_kwh" must be a positive number. Got "${rawObs}".`);
      continue;
    }

    let baseline = 30;
    if (baseIdx !== -1 && row[baseIdx]) {
      const parsedBase = parseFloat(row[baseIdx]);
      if (!isNaN(parsedBase) && parsedBase >= 0) {
        baseline = parsedBase;
      } else {
        warnings.push(`Row ${rowNum}: Invalid baseline "${row[baseIdx]}", defaulted to 30 kWh.`);
      }
    }

    const locRaw = locIdx !== -1 && row[locIdx] ? row[locIdx] : 'Academic Block 1';
    const location = normalizeLocation(locRaw);
    const hour = parsedDate.getUTCHours();
    const isAfterHours = hour >= 21 || hour < 6;

    data.push({
      id: `custom-eng-${i}-${Date.now()}`,
      timestamp: parsedDate.toISOString(),
      hour,
      date: parsedDate.toISOString().split('T')[0],
      location,
      observedKwh: Math.round(observed * 10) / 10,
      baselineKwh: Math.round(baseline * 10) / 10,
      isAfterHours,
      isSimulated: true,
      notes: row[4] || 'User uploaded CSV record'
    });
  }

  return {
    isValid: errors.length === 0 && data.length > 0,
    data,
    errors,
    warnings,
    rowCount: rows.length - 1,
    validRowCount: data.length
  };
}

/**
 * Validate and parse Water CSV
 * Expected schema: timestamp, location, observed_litres, baseline_litres, [notes]
 */
export function validateWaterCsv(csvText: string): CsvValidationResult<WaterReading> {
  const rows = parseCsvRows(csvText);
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: WaterReading[] = [];

  if (rows.length < 2) {
    return {
      isValid: false,
      data: [],
      errors: ['CSV file is empty or missing data rows.'],
      warnings: [],
      rowCount: 0,
      validRowCount: 0
    };
  }

  const header = rows[0].map(h => h.toLowerCase().replace(/[\s_-]+/g, ''));
  const tsIdx = header.findIndex(h => h.includes('time') || h.includes('date'));
  const locIdx = header.findIndex(h => h.includes('loc') || h.includes('block') || h.includes('building'));
  const obsIdx = header.findIndex(h => h.includes('obs') || h.includes('lit') || h.includes('reading') || h.includes('val'));
  const baseIdx = header.findIndex(h => h.includes('base') || h.includes('expected'));

  if (tsIdx === -1 || obsIdx === -1) {
    errors.push('Missing required column headers: Expected "timestamp" and "observed_litres".');
    return {
      isValid: false,
      data: [],
      errors,
      warnings,
      rowCount: rows.length - 1,
      validRowCount: 0
    };
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (row.length <= 1 && !row[0]) continue;

    const rawTs = row[tsIdx] || '';
    const parsedDate = new Date(rawTs);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Row ${rowNum}: Invalid timestamp format "${rawTs}". Use ISO format (e.g. 2026-10-26T03:00:00Z).`);
      continue;
    }

    const rawObs = row[obsIdx];
    const observed = parseFloat(rawObs);
    if (isNaN(observed) || observed < 0) {
      errors.push(`Row ${rowNum}: "observed_litres" must be a positive number. Got "${rawObs}".`);
      continue;
    }

    let baseline = 100;
    if (baseIdx !== -1 && row[baseIdx]) {
      const parsedBase = parseFloat(row[baseIdx]);
      if (!isNaN(parsedBase) && parsedBase >= 0) {
        baseline = parsedBase;
      } else {
        warnings.push(`Row ${rowNum}: Invalid baseline "${row[baseIdx]}", defaulted to 100 L.`);
      }
    }

    const locRaw = locIdx !== -1 && row[locIdx] ? row[locIdx] : 'Academic Block 1';
    const location = normalizeLocation(locRaw);
    const hour = parsedDate.getUTCHours();
    const isOvernightWindow = hour >= 1 && hour <= 5;

    data.push({
      id: `custom-wat-${i}-${Date.now()}`,
      timestamp: parsedDate.toISOString(),
      hour,
      date: parsedDate.toISOString().split('T')[0],
      location,
      observedLitres: Math.round(observed),
      baselineLitres: Math.round(baseline),
      isOvernightWindow,
      isSimulated: true,
      notes: row[4] || 'User uploaded CSV record'
    });
  }

  return {
    isValid: errors.length === 0 && data.length > 0,
    data,
    errors,
    warnings,
    rowCount: rows.length - 1,
    validRowCount: data.length
  };
}

/**
 * Validate and parse Waste CSV
 * Expected schema: date, location, food_waste_kg, recyclable_waste_kg, mixed_waste_kg, [baseline_total_kg]
 */
export function validateWasteCsv(csvText: string): CsvValidationResult<WasteReading> {
  const rows = parseCsvRows(csvText);
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: WasteReading[] = [];

  if (rows.length < 2) {
    return {
      isValid: false,
      data: [],
      errors: ['CSV file is empty or missing data rows.'],
      warnings: [],
      rowCount: 0,
      validRowCount: 0
    };
  }

  const header = rows[0].map(h => h.toLowerCase().replace(/[\s_-]+/g, ''));
  const dateIdx = header.findIndex(h => h.includes('date') || h.includes('day'));
  const locIdx = header.findIndex(h => h.includes('loc') || h.includes('block') || h.includes('area'));
  const foodIdx = header.findIndex(h => h.includes('food') || h.includes('organic'));
  const recIdx = header.findIndex(h => h.includes('rec') || h.includes('dry') || h.includes('plastic'));
  const mixedIdx = header.findIndex(h => h.includes('mix') || h.includes('residual') || h.includes('general'));
  const baseIdx = header.findIndex(h => h.includes('base') || h.includes('target'));

  if (dateIdx === -1 || foodIdx === -1 || recIdx === -1 || mixedIdx === -1) {
    errors.push('Missing required column headers: Expected "date", "food_waste_kg", "recyclable_waste_kg", and "mixed_waste_kg".');
    return {
      isValid: false,
      data: [],
      errors,
      warnings,
      rowCount: rows.length - 1,
      validRowCount: 0
    };
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (row.length <= 1 && !row[0]) continue;

    const rawDate = row[dateIdx] || '';
    if (!/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
      errors.push(`Row ${rowNum}: Invalid date format "${rawDate}". Use YYYY-MM-DD (e.g. 2026-10-26).`);
      continue;
    }

    const food = parseFloat(row[foodIdx]);
    const rec = parseFloat(row[recIdx]);
    const mixed = parseFloat(row[mixedIdx]);

    if (isNaN(food) || food < 0 || isNaN(rec) || rec < 0 || isNaN(mixed) || mixed < 0) {
      errors.push(`Row ${rowNum}: Waste weights in kg must be valid positive numbers.`);
      continue;
    }

    const total = food + rec + mixed;
    let baselineTotal = total;
    if (baseIdx !== -1 && row[baseIdx]) {
      const parsedBase = parseFloat(row[baseIdx]);
      if (!isNaN(parsedBase) && parsedBase > 0) {
        baselineTotal = parsedBase;
      }
    }

    const locRaw = locIdx !== -1 && row[locIdx] ? row[locIdx] : 'University Food Court';
    const location = normalizeLocation(locRaw);

    data.push({
      id: `custom-wst-${i}-${Date.now()}`,
      date: rawDate.slice(0, 10),
      location,
      foodWasteKg: Math.round(food * 10) / 10,
      recyclableWasteKg: Math.round(rec * 10) / 10,
      mixedWasteKg: Math.round(mixed * 10) / 10,
      totalKg: Math.round(total * 10) / 10,
      baselineTotalKg: Math.round(baselineTotal * 10) / 10,
      isSimulated: true,
      notes: 'User uploaded CSV record'
    });
  }

  return {
    isValid: errors.length === 0 && data.length > 0,
    data,
    errors,
    warnings,
    rowCount: rows.length - 1,
    validRowCount: data.length
  };
}

/**
 * Sample CSV Templates for easy copy/download
 */
export const SAMPLE_ENERGY_CSV = `timestamp,location,observed_kwh,baseline_kwh,notes
2026-10-26T00:00:00Z,Academic Block 1,18.5,18.0,Baseline night quiescent
2026-10-26T01:00:00Z,Academic Block 1,16.2,16.0,Normal after-hours
2026-10-26T02:00:00Z,Academic Block 1,78.4,15.0,Unusual after-hours high draw
2026-10-26T03:00:00Z,Academic Block 1,82.0,15.0,Unusual after-hours high draw
2026-10-26T04:00:00Z,Academic Block 1,79.5,17.0,Unusual after-hours high draw
2026-10-26T09:00:00Z,Academic Block 1,110.0,110.0,Academic morning classes
2026-10-26T12:00:00Z,Academic Block 1,185.0,118.0,Sustained peak daytime overload`;

export const SAMPLE_WATER_CSV = `timestamp,location,observed_litres,baseline_litres,notes
2026-10-26T00:00:00Z,Academic Block 1,80,80,Normal midnight baseline
2026-10-26T01:00:00Z,Academic Block 1,850,70,Overnight flow investigation trigger
2026-10-26T02:00:00Z,Academic Block 1,920,65,Overnight flow investigation trigger
2026-10-26T03:00:00Z,Academic Block 1,890,65,Overnight flow investigation trigger
2026-10-26T04:00:00Z,Academic Block 1,870,80,Overnight flow investigation trigger
2026-10-26T10:00:00Z,Academic Block 1,1350,1350,Standard daytime student usage
2026-10-26T14:00:00Z,University Food Court,4200,2400,Deep rinse cycle surge`;

export const SAMPLE_WASTE_CSV = `date,location,food_waste_kg,recyclable_waste_kg,mixed_waste_kg,baseline_total_kg,notes
2026-10-20,University Food Court,130.0,45.0,35.0,210.0,Standard weekday audit
2026-10-21,University Food Court,128.0,48.0,32.0,210.0,Standard weekday audit
2026-10-22,University Food Court,215.0,35.0,95.0,210.0,Event meal surplus and segregation drop
2026-10-23,Academic Block 1,14.0,8.0,46.0,70.0,High mixed waste ratio (>65%)
2026-10-24,Hostel Cluster A & B,92.0,52.0,38.0,185.0,Normal hostel segregation profile`;
