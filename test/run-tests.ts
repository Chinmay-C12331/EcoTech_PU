/**
 * EcoTech PU - Test Suite
 * Automated verification of anomaly rules, CSV validation, calculation correctness,
 * and explainable prioritization scores.
 */

import {
  generateSyntheticEnergyData,
  generateSyntheticWaterData,
  generateSyntheticWasteData
} from '../src/data/syntheticData';
import { analyzeEnergyReadings } from '../src/analysis/energyAnalysis';
import { analyzeWaterReadings } from '../src/analysis/waterAnalysis';
import { analyzeWasteReadings } from '../src/analysis/wasteAnalysis';
import { calculatePrioritizationScore } from '../src/analysis/prioritization';
import {
  validateEnergyCsv,
  validateWaterCsv,
  validateWasteCsv,
  SAMPLE_ENERGY_CSV,
  SAMPLE_WATER_CSV,
  SAMPLE_WASTE_CSV
} from '../src/analysis/csvValidator';
import {
  runInterventionSimulation,
  DEFAULT_INTERVENTIONS
} from '../src/analysis/interventionSim';
import { EnergyReading } from '../src/types/resource';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('========================================================');
console.log(' EcoTech PU - Presidency University Bengaluru Test Suite');
console.log('========================================================\n');

// 1. Prioritization Scoring Tests
console.log('1. Prioritization Scoring Formula Tests:');
{
  const scoreHigh = calculatePrioritizationScore({
    resource: 'energy',
    observed: 300,
    baseline: 100,
    excess: 200,
    hoursOrDaysPersisting: 4,
    confidence: 'High',
    effort: 'Low'
  });
  assert(scoreHigh.finalScore >= 80, `High severity + high persistence + low effort yields high score (got ${scoreHigh.finalScore})`);
  assert(scoreHigh.severityScore <= 40, `Severity score capped at 40 (got ${scoreHigh.severityScore})`);
  assert(scoreHigh.persistenceScore <= 30, `Persistence score capped at 30 (got ${scoreHigh.persistenceScore})`);

  const scoreLow = calculatePrioritizationScore({
    resource: 'waste',
    observed: 110,
    baseline: 100,
    excess: 10,
    hoursOrDaysPersisting: 1,
    confidence: 'Low',
    effort: 'High'
  });
  assert(scoreLow.finalScore < 40, `Low excess + transient + high effort yields low score (got ${scoreLow.finalScore})`);
  assert(scoreHigh.finalScore > scoreLow.finalScore, 'Higher urgency issue ranks higher than lower urgency issue');
}

// 2. Normal Readings Test (No false positives on clean baselines)
console.log('\n2. Normal Baseline Readings Tests:');
{
  const nominalEnergy: EnergyReading[] = [
    {
      id: 'nom-1',
      timestamp: '2026-10-26T01:00:00Z',
      hour: 1,
      date: '2026-10-26',
      location: 'Academic Block 1',
      observedKwh: 16.0,
      baselineKwh: 16.0,
      isAfterHours: true,
      isSimulated: true
    },
    {
      id: 'nom-2',
      timestamp: '2026-10-26T02:00:00Z',
      hour: 2,
      date: '2026-10-26',
      location: 'Academic Block 1',
      observedKwh: 15.5,
      baselineKwh: 15.0,
      isAfterHours: true,
      isSimulated: true
    },
    {
      id: 'nom-3',
      timestamp: '2026-10-26T03:00:00Z',
      hour: 3,
      date: '2026-10-26',
      location: 'Academic Block 1',
      observedKwh: 15.2,
      baselineKwh: 15.0,
      isAfterHours: true,
      isSimulated: true
    }
  ];
  const nominalRes = analyzeEnergyReadings(nominalEnergy);
  assert(nominalRes.recommendations.length === 0, 'Nominal energy readings trigger zero false positive recommendations');
  assert(nominalRes.flaggedReadingsCount === 0, 'No nominal readings flagged');
}

// 3. Energy Anomaly Detection Tests
console.log('\n3. Energy Anomaly Detection Tests:');
{
  const energyData = generateSyntheticEnergyData();
  const res = analyzeEnergyReadings(energyData);
  assert(res.totalObservedKwh > 0, `Total observed energy computed (${res.totalObservedKwh} kWh)`);
  assert(res.recommendations.length > 0, `Identified ${res.recommendations.length} actionable energy recommendations`);
  
  const afterHoursRec = res.recommendations.find(r => r.finding.includes('after-hours'));
  assert(!!afterHoursRec, 'Detected after-hours inefficiency recommendation');
  if (afterHoursRec) {
    assert(afterHoursRec.unit === 'kWh', 'Recommendation unit is kWh');
    assert(afterHoursRec.confidence === 'High', 'After-hours high contrast confidence is High');
    assert(afterHoursRec.estimatedExcess > 0, `Estimated excess calculated (+${afterHoursRec.estimatedExcess} kWh)`);
  }
}

// 4. Water Overnight Flow Tests
console.log('\n4. Water Overnight Anomaly Tests (Investigation Trigger):');
{
  const waterData = generateSyntheticWaterData();
  const res = analyzeWaterReadings(waterData);
  assert(res.totalObservedLitres > 0, `Total water computed (${res.totalObservedLitres} Litres)`);
  assert(res.recommendations.length > 0, `Identified ${res.recommendations.length} water recommendations`);

  const overnightRec = res.recommendations.find(r => r.finding.includes('overnight'));
  assert(!!overnightRec, 'Flagged overnight water flow anomaly');
  if (overnightRec) {
    assert(overnightRec.finding.toLowerCase().includes('inspection trigger') || overnightRec.suggestedAction.toLowerCase().includes('investigation trigger'),
      'Complies with requirement: overnight flow framed as investigation trigger, not proof of leak');
    assert(overnightRec.unit === 'Litres', 'Unit is Litres');
  }
}

// 5. Waste Analysis & Segregation Tests
console.log('\n5. Waste Analysis & Segregation Tests:');
{
  const wasteData = generateSyntheticWasteData();
  const res = analyzeWasteReadings(wasteData);
  assert(res.totalWasteKg > 0, `Total waste calculated (${res.totalWasteKg} kg)`);
  assert(res.recommendations.length > 0, `Generated ${res.recommendations.length} waste recommendations`);
  assert(res.averageDailyFoodWasteKg > 0, `Calculated average daily food waste (${res.averageDailyFoodWasteKg} kg/day)`);

  const foodRec = res.recommendations.find(r => r.resource === 'waste' && r.finding.includes('food'));
  assert(!!foodRec, 'Detected food waste surge recommendation');
  if (foodRec) {
    assert(foodRec.unit === 'kg', 'Waste unit is kg');
    assert(foodRec.suggestedAction.toLowerCase().includes('composting') || foodRec.suggestedAction.toLowerCase().includes('batch-cooking'),
      'Recommends composting or portioning reduction');
  }
}

// 6. CSV Validation & Edge Cases Tests
console.log('\n6. CSV Parsing & Validation Tests:');
{
  // Test Valid Energy CSV
  const validEnergy = validateEnergyCsv(SAMPLE_ENERGY_CSV);
  assert(validEnergy.isValid, 'Sample Energy CSV parses validly');
  assert(validEnergy.validRowCount >= 5, `Parsed ${validEnergy.validRowCount} valid rows from sample`);

  // Test Malformed Energy CSV (missing headers)
  const malformedHeader = validateEnergyCsv('foo,bar,baz\n1,2,3');
  assert(!malformedHeader.isValid, 'Rejects CSV with missing required headers');
  assert(malformedHeader.errors.length > 0, 'Provides clear error message for missing headers');

  // Test Negative values
  const negativeObserved = validateEnergyCsv('timestamp,location,observed_kwh,baseline_kwh\n2026-10-26T01:00:00Z,Academic Block 1,-45,20');
  assert(!negativeObserved.isValid, 'Rejects negative observed consumption values');
  assert(negativeObserved.errors[0].includes('positive number'), 'Error specifically flags non-positive number');

  // Test Invalid timestamp format
  const badDate = validateEnergyCsv('timestamp,location,observed_kwh,baseline_kwh\nnot-a-date,Academic Block 1,50,20');
  assert(!badDate.isValid, 'Rejects invalid timestamp string');

  // Test Valid Water CSV
  const validWater = validateWaterCsv(SAMPLE_WATER_CSV);
  assert(validWater.isValid, 'Sample Water CSV parses validly');

  // Test Valid Waste CSV
  const validWaste = validateWasteCsv(SAMPLE_WASTE_CSV);
  assert(validWaste.isValid, 'Sample Waste CSV parses validly');
}

// 7. Before/After Intervention Simulation Tests
console.log('\n7. Before/After Intervention Simulation Tests:');
{
  const energyData = generateSyntheticEnergyData();
  const waterData = generateSyntheticWaterData();
  const wasteData = generateSyntheticWasteData();

  const simResult = runInterventionSimulation(
    energyData,
    waterData,
    wasteData,
    DEFAULT_INTERVENTIONS.map(i => i.id)
  );

  assert(simResult.isSimulatedScenario, 'Result explicitly marked as simulated scenario');
  assert(simResult.energy.netSavedKwh > 0, `Energy simulation achieved positive savings (${simResult.energy.netSavedKwh} kWh)`);
  assert(simResult.water.netSavedLitres > 0, `Water simulation achieved positive savings (${simResult.water.netSavedLitres} Litres)`);
  assert(simResult.waste.netDivertedFromLandfillKg > 0, `Waste simulation diverted material (${simResult.waste.netDivertedFromLandfillKg} kg)`);
}

// 8. Measure → Detect → Act → Verify Workflow & Calculation Tests
console.log('\n8. Action Task Workflow & Verification Engine Tests:');
{
  const { canTransition, computeVerification } = await import('../src/analysis/verificationEngine');

  // Valid and invalid state transitions
  assert(canTransition('Detected', 'Acknowledged'), 'Valid transition: Detected → Acknowledged');
  assert(canTransition('Acknowledged', 'Investigating'), 'Valid transition: Acknowledged → Investigating');
  assert(canTransition('Investigating', 'Repair Reported'), 'Valid transition: Investigating → Repair Reported');
  assert(canTransition('Repair Reported', 'Awaiting Verification'), 'Valid transition: Repair Reported → Awaiting Verification');
  assert(!canTransition('Detected', 'Verified Improvement'), 'Blocked invalid direct leap: Detected → Verified Improvement');
  assert(!canTransition('Acknowledged', 'Repair Reported'), 'Blocked invalid transition skipping Investigation');

  // Verification 1: Insufficient Data (0 measurements)
  const emptyRes = computeVerification(363, 75, 288, 'kWh', []);
  assert(emptyRes.outcome === 'Inconclusive', 'Empty measurements yields Inconclusive');
  assert(emptyRes.sampleCount === 0, 'Sample count is 0 for empty measurements');

  // Verification 2: Non-Comparable Period
  const nonCompRes = computeVerification(363, 75, 288, 'kWh', [
    {
      id: 'm1',
      timestamp: '2026-10-27T12:00:00Z',
      value: 80,
      durationHoursOrDays: 4,
      isComparablePeriod: false,
      isSimulated: true
    }
  ]);
  assert(nonCompRes.outcome === 'Inconclusive', 'Non-comparable period measurement yields Inconclusive');

  // Verification 3: Verified Improvement (Significant drop toward baseline)
  const successRes = computeVerification(363, 75, 288, 'kWh', [
    {
      id: 'm2',
      timestamp: '2026-10-27T22:00:00Z',
      value: 82,
      durationHoursOrDays: 4,
      isComparablePeriod: true,
      isSimulated: true
    }
  ]);
  assert(successRes.outcome === 'Verified Improvement', 'Drop to near-baseline yields Verified Improvement');
  assert(successRes.absoluteReduction === 281, `Calculated absolute reduction (got ${successRes.absoluteReduction} kWh)`);
  assert(successRes.percentageExcessAvoided >= 90, `Calculated percentage excess avoided (${successRes.percentageExcessAvoided}%)`);
  assert(successRes.unit === 'kWh', 'Unit is consistent (kWh)');
  assert(successRes.disclaimer.toLowerCase().includes('does not constitute permanent proof'), 'Complies with rule: does not claim proof of root cause permanence');

  // Verification 4: No Improvement (Consumption remains high)
  const failureRes = computeVerification(3570, 280, 3290, 'Litres', [
    {
      id: 'm3',
      timestamp: '2026-10-27T03:00:00Z',
      value: 3450,
      durationHoursOrDays: 4,
      isComparablePeriod: true,
      isSimulated: true
    }
  ]);
  assert(failureRes.outcome === 'No Improvement', 'Stagnant high consumption yields No Improvement');
  assert(failureRes.unit === 'Litres', 'Water unit is consistent (Litres)');
}

// 9. Task Persistence & Data Provenance Integrity Tests
console.log('\n9. Task Persistence & Provenance Integrity Tests:');
{
  const { INITIAL_ACTION_TASKS } = await import('../src/data/sampleTasks');

  assert(INITIAL_ACTION_TASKS.length >= 2, 'Pre-seeded sample action tasks exist');
  
  // Serialization round-trip test
  const serialized = JSON.stringify(INITIAL_ACTION_TASKS);
  const parsed = JSON.parse(serialized);
  assert(parsed.length === INITIAL_ACTION_TASKS.length, 'Task list survives JSON serialization without record loss');
  assert(parsed[0].history.length === INITIAL_ACTION_TASKS[0].history.length, 'Audit trail history preserved intact across serialization');
  assert(parsed[0].followUpMeasurements.length === INITIAL_ACTION_TASKS[0].followUpMeasurements.length, 'Follow-up measurements preserved intact across serialization');

  // Provenance tagging test
  const demoMeasurement = parsed[0].followUpMeasurements[0];
  assert(demoMeasurement.isSimulated === true, 'Follow-up measurement is explicitly marked isSimulated: true');
  assert(demoMeasurement.notes.includes('SIMULATED DEMO DATA'), 'Notes explicitly disclose simulated demo provenance');
}

// 10. Explainable Detection & Technical Defense Integrity Tests
console.log('\n10. Explainable Detection & Defense Integrity Tests:');
{
  const energyReadings = generateSyntheticEnergyData();
  const waterReadings = generateSyntheticWaterData();
  const wasteReadings = generateSyntheticWasteData();

  const energyAnalysis = analyzeEnergyReadings(energyReadings);
  const waterAnalysis = analyzeWaterReadings(waterReadings);
  const wasteAnalysis = analyzeWasteReadings(wasteReadings);

  const allRecs = [
    ...energyAnalysis.recommendations,
    ...waterAnalysis.recommendations,
    ...wasteAnalysis.recommendations
  ];

  assert(allRecs.length >= 6, `Generated at least 6 recommendations across 3 streams (got ${allRecs.length})`);

  for (const rec of allRecs) {
    assert(Boolean(rec.detectionRuleName && rec.detectionRuleName.length > 3), `Recommendation ${rec.id} exposes detectionRuleName: "${rec.detectionRuleName}"`);
    assert(Boolean(rec.ruleThresholdFormula && rec.ruleThresholdFormula.includes('>')), `Recommendation ${rec.id} exposes ruleThresholdFormula: "${rec.ruleThresholdFormula}"`);
    assert(Boolean(rec.persistenceDetails && rec.persistenceDetails.length > 5), `Recommendation ${rec.id} exposes persistenceDetails`);
    assert(Boolean(rec.dataQualityLimitations && rec.dataQualityLimitations.length > 10), `Recommendation ${rec.id} discloses dataQualityLimitations`);
    assert(Boolean(rec.actionRationale && rec.actionRationale.length > 10), `Recommendation ${rec.id} explains actionRationale`);
  }

  // Energy specific check
  const energyAfterHours = energyAnalysis.recommendations.find(r => r.finding.toLowerCase().includes('after-hours'));
  assert(Boolean(energyAfterHours && energyAfterHours.detectionRuleName?.includes('SOP-ENG-04')), 'Energy after-hours recommendation implements SOP-ENG-04 rule');
  assert(energyAfterHours?.unit === 'kWh', 'Energy recommendation unit is strictly kWh');

  // Water specific check
  const waterNight = waterAnalysis.recommendations.find(r => r.finding.toLowerCase().includes('overnight'));
  assert(Boolean(waterNight && waterNight.detectionRuleName?.includes('SOP-WAT-02')), 'Water nocturnal flow implements SOP-WAT-02');
  assert(Boolean(waterNight && waterNight.finding.toLowerCase().includes('inspection trigger')), 'Water finding explicitly uses "inspection trigger" terminology');
  assert(Boolean(waterNight && !waterNight.finding.toLowerCase().includes('confirmed leak')), 'Water finding does not make premature "confirmed leak" claim');
  assert(waterNight?.unit === 'Litres', 'Water recommendation unit is strictly Litres');

  // Waste specific check
  const wasteFood = wasteAnalysis.recommendations.find(r => r.finding.toLowerCase().includes('food waste surge'));
  assert(Boolean(wasteFood && wasteFood.detectionRuleName?.includes('CPCB')), 'Waste food surge rule references CPCB & SWM Rules 2026 context');
  assert(wasteFood?.unit === 'kg', 'Waste recommendation unit is strictly kg');
}

// 11. Campus Sustainability Impact Ledger Lineage & Isolation Tests
console.log('\n11. Campus Sustainability Impact Ledger Lineage & Isolation Tests:');
{
  const { INITIAL_ACTION_TASKS } = await import('../src/data/sampleTasks');
  
  assert(INITIAL_ACTION_TASKS.length >= 3, `Pre-seeded initial action tasks count is at least 3 (got ${INITIAL_ACTION_TASKS.length})`);
  
  // Verify that outcomes cover both in-flight and verified statuses
  const verifiedTask = INITIAL_ACTION_TASKS.find(t => t.status === 'Verified Improvement');
  assert(Boolean(verifiedTask), 'Sample tasks contain at least one Verified Improvement task');
  assert(Boolean(verifiedTask?.verification && verifiedTask.verification.outcome === 'Verified Improvement'), 'Verified task contains valid VerificationAnalysis object');
  assert(Boolean(verifiedTask && verifiedTask.verification?.percentageExcessAvoided! > 0), 'Verified task calculates positive percentage avoided');
  
  const inProgressTask = INITIAL_ACTION_TASKS.find(t => t.status === 'Investigating' || t.status === 'Acknowledged' || t.status === 'Repair Reported');
  assert(Boolean(inProgressTask), 'Sample tasks contain active in-flight task');
  
  // Verify strict physical isolation - energy unit is kWh, water is Litres, waste is kg
  const energyTasks = INITIAL_ACTION_TASKS.filter(t => t.resource === 'energy');
  const waterTasks = INITIAL_ACTION_TASKS.filter(t => t.resource === 'water');
  const wasteTasks = INITIAL_ACTION_TASKS.filter(t => t.resource === 'waste');
  
  energyTasks.forEach(t => assert(t.unit === 'kWh', `Energy task ${t.id} unit is strictly kWh`));
  waterTasks.forEach(t => assert(t.unit === 'Litres', `Water task ${t.id} unit is strictly Litres`));
  wasteTasks.forEach(t => assert(t.unit === 'kg', `Waste task ${t.id} unit is strictly kg`));
}

console.log('\n========================================================');
console.log(` Test Summary: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log('========================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
