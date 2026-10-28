/**
 * Before/After Intervention Simulation Engine
 * EcoTech PU - Presidency University Bengaluru
 * 
 * STRICT COMPLIANCE REQUIREMENT:
 * Labeled explicitly as a HYPOTHETICAL SCENARIO.
 * Demonstrates the projected resource recovery if specific physical or
 * operational campus policies are deployed.
 */

import {
  InterventionScenario,
  EnergyReading,
  WaterReading,
  WasteReading
} from '../types/resource';

export const DEFAULT_INTERVENTIONS: InterventionScenario[] = [
  {
    id: 'int-eng-afterhours',
    title: 'Automated After-Hours BMS Power Isolation',
    resource: 'energy',
    targetLocations: ['Academic Block 1', 'Academic Block 2', 'Central Library & Admin'],
    description: 'Configurable illustrative assumption: Install scheduled contactors on air conditioning sub-mains and laboratory benches in Academic Blocks & Library to isolate idle non-essential loads between 21:00 and 06:00 (applies to eligible after-hours excess).',
    expectedReductionPercent: 75,
    isActive: true,
    estimatedRecoveryUnits: 0,
    unit: 'kWh/day',
    feasibility: 'Immediate'
  },
  {
    id: 'int-eng-hvac',
    title: 'Auditorium & Lab Chiller Staging Protocol',
    resource: 'energy',
    targetLocations: ['Academic Block 1', 'Academic Block 2', 'Sports Complex & Auditorium'],
    description: 'Configurable illustrative assumption: Enforce BEE-recommended 24°C indoor thermostat setpoint and stagger heavy compressor start sequences during campus peak hours in Academic Blocks & Auditorium (applies to eligible daytime peak excess).',
    expectedReductionPercent: 40,
    isActive: false,
    estimatedRecoveryUnits: 0,
    unit: 'kWh/day',
    feasibility: 'Short-Term'
  },
  {
    id: 'int-wat-nightvalve',
    title: 'Controlled Nocturnal Branch Isolation & Acoustic Surveillance',
    resource: 'water',
    targetLocations: ['Academic Block 1', 'Academic Block 2', 'University Food Court'],
    description: 'Controlled, facility-approved night-time isolation on suitable noncritical washroom branch lines with operational safeguards (automated bypasses, fire/safety line exemptions, and acoustic leak surveillance during 01:00-05:00), rather than unconditional riser shutdown (applies strictly to eligible nocturnal excess).',
    expectedReductionPercent: 80,
    isActive: true,
    estimatedRecoveryUnits: 0,
    unit: 'Litres/day',
    feasibility: 'Immediate'
  },
  {
    id: 'int-wat-aerators',
    title: 'Food Court Low-Flow Pre-Rinse Sprayers & Aerators',
    resource: 'water',
    targetLocations: ['University Food Court', 'Hostel Cluster A & B'],
    description: 'Configurable illustrative assumption: Retrofit standard washroom faucets with 1.9 LPM pressure-compensating aerators and replace commercial wash sinks with high-efficiency triggers (applies to eligible daytime flow).',
    expectedReductionPercent: 35,
    isActive: false,
    estimatedRecoveryUnits: 0,
    unit: 'Litres/day',
    feasibility: 'Immediate'
  },
  {
    id: 'int-wst-segregation',
    title: 'Four-Stream Source Segregation & Green Marshal Deployment (MoEF&CC SWM Rules 2026)',
    resource: 'waste',
    targetLocations: [
      'University Food Court',
      'Hostel Cluster A & B',
      'Academic Block 1',
      'Academic Block 2',
      'Central Library & Admin',
      'Sports Complex & Auditorium'
    ],
    description: 'Deploy standardized 4-stream receptacles (Wet Organic, Dry Recyclable, Sanitary, and Special-Care/Hazardous Waste) guided by student marshals and clear sorting signage in alignment with MoEF&CC Solid Waste Management Rules, 2026. Models ~55% diversion of eligible mixed/residual waste into clean resource streams.',
    expectedReductionPercent: 55, // 55% reduction in unsegregated mixed waste
    isActive: true,
    estimatedRecoveryUnits: 0,
    unit: 'kg/day',
    feasibility: 'Immediate'
  },
  {
    id: 'int-wst-composting',
    title: 'Mess Portion Forecasting & Composting Feed Expansion',
    resource: 'waste',
    targetLocations: ['University Food Court', 'Hostel Cluster A & B'],
    description: 'Configurable illustrative assumption: Integrate hostel meal sign-in count for demand forecasting and route clean kitchen prep scrap to on-site aerobic compost beds (~30% diversion of eligible organic food waste).',
    expectedReductionPercent: 30, // 30% reduction in avoidable organic prep surplus
    isActive: false,
    estimatedRecoveryUnits: 0,
    unit: 'kg/day',
    feasibility: 'Short-Term'
  }
];

export interface SimulationResult {
  isSimulatedScenario: true;
  energy: {
    beforeObservedKwh: number;
    afterSimulatedKwh: number;
    netSavedKwh: number;
    percentReduction: number;
  };
  water: {
    beforeObservedLitres: number;
    afterSimulatedLitres: number;
    netSavedLitres: number;
    percentReduction: number;
  };
  waste: {
    beforeMixedKg: number;
    afterMixedKg: number;
    beforeFoodKg: number;
    afterFoodKg: number;
    netDivertedFromLandfillKg: number;
    percentDiverted: number;
    residualReductionPercent: number;
    totalAuditedWasteKg: number;
    totalCampusDiversionPercent: number;
    divertedMixedKg: number;
    divertedFoodKg: number;
  };
}

export function runInterventionSimulation(
  energyReadings: EnergyReading[],
  waterReadings: WaterReading[],
  wasteReadings: WasteReading[],
  activeScenarioIds: string[]
): SimulationResult {
  // 1. Energy Simulation
  let beforeEnergy = 0;
  let afterEnergy = 0;

  const afterHoursIntActive = activeScenarioIds.includes('int-eng-afterhours');
  const hvacIntActive = activeScenarioIds.includes('int-eng-hvac');

  energyReadings.forEach(r => {
    beforeEnergy += r.observedKwh;
    let simObs = r.observedKwh;
    const excess = Math.max(0, r.observedKwh - r.baselineKwh);

    if (r.isAfterHours && afterHoursIntActive && excess > 0) {
      simObs = r.baselineKwh + excess * (1 - 0.75); // 75% reduction of eligible after-hours excess
    } else if (!r.isAfterHours && hvacIntActive && excess > 0) {
      simObs = r.baselineKwh + excess * (1 - 0.40); // 40% reduction of eligible peak excess
    }

    afterEnergy += simObs;
  });

  const netSavedKwh = Math.max(0, Math.round((beforeEnergy - afterEnergy) * 10) / 10);
  const energyPercent = beforeEnergy > 0 ? Math.round((netSavedKwh / beforeEnergy) * 1000) / 10 : 0;

  // 2. Water Simulation
  let beforeWater = 0;
  let afterWater = 0;

  const nightValveActive = activeScenarioIds.includes('int-wat-nightvalve');
  const aeratorsActive = activeScenarioIds.includes('int-wat-aerators');

  waterReadings.forEach(r => {
    beforeWater += r.observedLitres;
    let simObs = r.observedLitres;
    const excess = Math.max(0, r.observedLitres - r.baselineLitres);

    if (r.isOvernightWindow && nightValveActive && excess > 0) {
      simObs = r.baselineLitres + excess * (1 - 0.80); // 80% overnight excess recovery
    } else if (!r.isOvernightWindow && aeratorsActive && excess > 0) {
      simObs = r.baselineLitres + excess * (1 - 0.35); // 35% daytime surge mitigation
    }

    afterWater += simObs;
  });

  const netSavedLitres = Math.max(0, Math.round(beforeWater - afterWater));
  const waterPercent = beforeWater > 0 ? Math.round((netSavedLitres / beforeWater) * 1000) / 10 : 0;

  // 3. Waste Simulation
  let beforeMixed = 0;
  let afterMixed = 0;
  let beforeFood = 0;
  let afterFood = 0;
  let totalAuditedWaste = 0;

  const segregationActive = activeScenarioIds.includes('int-wst-segregation');
  const compostingActive = activeScenarioIds.includes('int-wst-composting');

  wasteReadings.forEach(r => {
    beforeMixed += r.mixedWasteKg;
    beforeFood += r.foodWasteKg;
    totalAuditedWaste += r.totalKg;

    let simMixed = r.mixedWasteKg;
    let simFood = r.foodWasteKg;

    if (segregationActive) {
      // 55% of mixed waste successfully segregated into recyclables & organics
      simMixed = r.mixedWasteKg * (1 - 0.55);
    }

    if (compostingActive) {
      // 30% reduction in prep waste via portion forecasting
      simFood = r.foodWasteKg * (1 - 0.30);
    }

    afterMixed += Math.max(0, simMixed);
    afterFood += Math.max(0, simFood);
  });

  const netMixedSaved = Math.max(0, Math.round((beforeMixed - afterMixed) * 10) / 10);
  const netFoodSaved = Math.max(0, Math.round((beforeFood - afterFood) * 10) / 10);
  const netDiverted = Math.round((netMixedSaved + netFoodSaved) * 10) / 10;
  
  // Explicit denominators:
  // 1. Residual reduction %: relative to initial unsegregated mixed waste (e.g. 55%)
  const residualReductionPercent = beforeMixed > 0
    ? Math.round((netMixedSaved / beforeMixed) * 1000) / 10
    : 0;

  // 2. Share of total campus audited waste diverted (e.g. 15.3%)
  const totalCampusDiversionPercent = totalAuditedWaste > 0
    ? Math.round((netDiverted / totalAuditedWaste) * 1000) / 10
    : 0;

  // Retain percentDiverted as the residual reduction percent (55%) for clear UI presentation
  const wastePercent = residualReductionPercent;

  return {
    isSimulatedScenario: true,
    energy: {
      beforeObservedKwh: Math.round(beforeEnergy * 10) / 10,
      afterSimulatedKwh: Math.round(afterEnergy * 10) / 10,
      netSavedKwh,
      percentReduction: energyPercent
    },
    water: {
      beforeObservedLitres: Math.round(beforeWater),
      afterSimulatedLitres: Math.round(afterWater),
      netSavedLitres,
      percentReduction: waterPercent
    },
    waste: {
      beforeMixedKg: Math.round(beforeMixed * 10) / 10,
      afterMixedKg: Math.round(afterMixed * 10) / 10,
      beforeFoodKg: Math.round(beforeFood * 10) / 10,
      afterFoodKg: Math.round(afterFood * 10) / 10,
      netDivertedFromLandfillKg: netDiverted,
      percentDiverted: wastePercent,
      residualReductionPercent,
      totalAuditedWasteKg: Math.round(totalAuditedWaste),
      totalCampusDiversionPercent,
      divertedMixedKg: netMixedSaved,
      divertedFoodKg: netFoodSaved
    }
  };
}
