/**
 * Pre-seeded Sample Corrective Action Tasks
 * EcoTech PU - Presidency University Bengaluru
 * 
 * Provides immediate demonstrable "Measure → Detect → Act → Verify" workflow state.
 */

import { ActionTask } from '../types/resource';

export const INITIAL_ACTION_TASKS: ActionTask[] = [
  {
    id: 'task-eng-chiller-01',
    recommendationId: 'rec-eng-afterhours-academic-block-2',
    resource: 'energy',
    location: 'Academic Block 2',
    title: 'After-Hours Chiller & Benchtop Automation Cutoff',
    finding: 'Sustained after-hours power draw detected between 01:00 and 05:00 (5 consecutive hours).',
    originalEvidence: 'Observed 448 kWh vs expected baseline 85 kWh (+363 kWh excess, +427%) during scheduled un-occupied hours (01:00–05:00 window on 2026-10-27).',
    originalObservedValue: 448,
    originalBaseline: 85,
    originalExcess: 363,
    unit: 'kWh',
    correctiveAction: 'Configure BMS contactor timers to automate shutoff after 21:00 and isolate idle lab test benches.',
    owner: 'P. Sharma (Campus Electrical BMS Lead)',
    priority: 'High',
    dueDate: '2026-10-28',
    notes: 'Contactor relay replaced in panel DB-AB2-N4; automated timer curfew active.',
    status: 'Verified Improvement',
    history: [
      {
        fromStatus: 'Detected',
        toStatus: 'Acknowledged',
        timestamp: '2026-10-27T08:30:00Z',
        changedBy: 'Facility Ops Desk',
        note: 'Anomaly reviewed from morning intelligence report.'
      },
      {
        fromStatus: 'Acknowledged',
        toStatus: 'Investigating',
        timestamp: '2026-10-27T09:15:00Z',
        changedBy: 'P. Sharma',
        note: 'On-site panel inspection verified split AC override switch stuck on manual.'
      },
      {
        fromStatus: 'Investigating',
        toStatus: 'Repair Reported',
        timestamp: '2026-10-27T14:00:00Z',
        changedBy: 'P. Sharma',
        note: 'Auxiliary timer relay installed. 21:00 hard cutoff engaged.'
      },
      {
        fromStatus: 'Repair Reported',
        toStatus: 'Awaiting Verification',
        timestamp: '2026-10-27T15:30:00Z',
        changedBy: 'Energy Auditor',
        note: 'Scheduled 01:00-05:00 follow-up clamp meter audit.'
      },
      {
        fromStatus: 'Awaiting Verification',
        toStatus: 'Verified Improvement',
        timestamp: '2026-10-27T22:15:00Z',
        changedBy: 'Audit System',
        note: 'Follow-up nocturnal audit recorded 88 kWh vs prior 448 kWh (-99.2% excess avoided).'
      }
    ],
    followUpMeasurements: [
      {
        id: 'fm-eng-01',
        timestamp: '2026-10-27T21:00:00Z',
        value: 88,
        durationHoursOrDays: 5,
        isComparablePeriod: true,
        notes: '[SIMULATED DEMO DATA] Post-fix nocturnal clamp audit across 01:00–05:00 window (5 hours). Contactor timer held draw to 88 kWh (near 85 kWh baseline).',
        isSimulated: true
      }
    ],
    verification: {
      outcome: 'Verified Improvement',
      beforeValue: 448,
      baselineValue: 85,
      followUpValue: 88,
      absoluteReduction: 360,
      percentageExcessAvoided: 99.2,
      unit: 'kWh',
      isComparable: true,
      sampleCount: 1,
      explanation: 'Follow-up consumption dropped from 448 kWh to 88 kWh (reduction: -360 kWh, eliminating ~99% of prior excess) under comparable operational conditions across 1 audit log(s).',
      disclaimer: 'Demonstrates algorithmic workflow recovery in a simulated test scenario with synthetic telemetry; does not constitute permanent proof that root causes will not recur. In compliance with data integrity standards, simulated results are excluded from real-world campus savings totals.',
      isSimulated: true
    },
    createdAt: '2026-10-27T08:00:00Z',
    updatedAt: '2026-10-27T22:15:00Z'
  },
  {
    id: 'task-wat-flush-02',
    recommendationId: 'rec-wat-overnight-academic-block-1',
    resource: 'water',
    location: 'Academic Block 1',
    title: 'Nocturnal Water Flow Investigation & Fixture Audit',
    finding: 'Unusual sustained overnight water flow detected (4 hours between 01:00 and 05:00). Flagged as a priority inspection trigger.',
    originalEvidence: 'Observed continuous draw of 3,570 Litres vs expected baseline of 280 Litres (+3,290 Litres deviation).',
    originalObservedValue: 3570,
    originalBaseline: 280,
    originalExcess: 3290,
    unit: 'Litres',
    correctiveAction: 'Dispatch plumbing maintenance team to inspect overhead tank float valves and dual-flush toilet seals in AB1 restrooms.',
    owner: 'B. Gowda (Campus Plumbing Supervisor)',
    priority: 'High',
    dueDate: '2026-10-28',
    notes: 'Inspected 2nd floor restroom; replaced 2 unseated siphon flapper seals on cistern block C.',
    status: 'Awaiting Verification',
    history: [
      {
        fromStatus: 'Detected',
        toStatus: 'Acknowledged',
        timestamp: '2026-10-27T09:00:00Z',
        changedBy: 'B. Gowda',
        note: 'Acknowledged water deviation alert.'
      },
      {
        fromStatus: 'Acknowledged',
        toStatus: 'Investigating',
        timestamp: '2026-10-27T10:30:00Z',
        changedBy: 'B. Gowda',
        note: 'Physical walkthrough identified continuous trickle in 2nd floor West wing.'
      },
      {
        fromStatus: 'Investigating',
        toStatus: 'Repair Reported',
        timestamp: '2026-10-27T13:45:00Z',
        changedBy: 'B. Gowda',
        note: 'Flapper valve diaphragms replaced; isolation valves verified.'
      },
      {
        fromStatus: 'Repair Reported',
        toStatus: 'Awaiting Verification',
        timestamp: '2026-10-27T14:30:00Z',
        changedBy: 'B. Gowda',
        note: 'Ready for nocturnal ultrasonic sub-meter follow-up audit.'
      }
    ],
    followUpMeasurements: [],
    createdAt: '2026-10-27T08:15:00Z',
    updatedAt: '2026-10-27T14:30:00Z'
  },
  {
    id: 'task-wst-segregation-03',
    recommendationId: 'rec-wst-segregation-academic-block-1',
    resource: 'waste',
    location: 'Academic Block 1',
    title: 'Corridor Waste Segregation & Signage Rectification',
    finding: 'Source segregation deficit: mixed unsegregated waste exceeds 50% across 2 consecutive audit days.',
    originalEvidence: 'Mixed waste logged at 58 kg vs 18 kg baseline (+40 kg deviation); recyclables contaminated by wet food waste.',
    originalObservedValue: 58,
    originalBaseline: 18,
    originalExcess: 40,
    unit: 'kg',
    correctiveAction: 'Deploy color-coded bin signage, install separate food disposal caddies, and brief custodial floor staff on MoEF&CC Solid Waste Management Rules, 2026 compliance.',
    owner: 'M. Anand (Campus Sustainability & Housekeeping Lead)',
    priority: 'Medium',
    dueDate: '2026-10-29',
    notes: 'Dual-bin stations inspected on floors 1–3; new bilingual instructional vinyl decals ordered.',
    status: 'Investigating',
    history: [
      {
        fromStatus: 'Detected',
        toStatus: 'Acknowledged',
        timestamp: '2026-10-27T10:00:00Z',
        changedBy: 'M. Anand',
        note: 'Noted segregation deficit in daily waste dispatch log.'
      },
      {
        fromStatus: 'Acknowledged',
        toStatus: 'Investigating',
        timestamp: '2026-10-27T11:30:00Z',
        changedBy: 'M. Anand',
        note: 'Audit identified missing wet-waste caddies near faculty common lounge.'
      }
    ],
    followUpMeasurements: [],
    createdAt: '2026-10-27T09:30:00Z',
    updatedAt: '2026-10-27T11:30:00Z'
  }
];
