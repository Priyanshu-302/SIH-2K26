import { describe, it, expect } from 'vitest';
import {
  extractStatutorySections,
  extractCaseCitations,
  extractAllCitations,
  calculateCitationMetrics,
  evaluateVerdict,
  evaluateResponse,
  aggregateBenchmarkMetrics,
  BENCHMARK_BASELINES
} from '../evaluation/metrics.js';

describe('Evaluation Metrics Engine', () => {
  it('should extract statutory citations correctly', () => {
    const text = 'Under Section 3(p) and Section 2(1)(ja) of the Patents Act, and Section 6 of the Biological Diversity Act...';
    const extracted = extractStatutorySections(text);
    expect(extracted).toContain('Patents Act s.3(p)');
    expect(extracted).toContain('Patents Act s.2(1)(ja)');
    expect(extracted).toContain('BDA s.6');
  });

  it('should extract landmark case citations correctly', () => {
    const text = 'As established in Zero Brand Zone and also the Turmeric Patent Opposition, Divya Pharmacy v. Union of India...';
    const extracted = extractCaseCitations(text);
    expect(extracted).toContain('case: M/s. The Zero Brand Zone Pvt. Ltd. v. The Controller of Patents & Designs (2024)');
    expect(extracted).toContain('case: Turmeric Patent Opposition (1997)');
    expect(extracted).toContain('case: Divya Pharmacy v. Union of India (2018)');
  });

  it('should calculate precision, recall, and F1 accurately', () => {
    const predicted = [
      'Patents Act s.3(p)',
      'case: M/s. The Zero Brand Zone Pvt. Ltd. v. The Controller of Patents & Designs (2024)',
      'Unrelated Citation'
    ];
    const required = [
      'Patents Act s.3(p)',
      'case: M/s. The Zero Brand Zone Pvt. Ltd. v. The Controller of Patents & Designs (2024)'
    ];

    const metrics = calculateCitationMetrics(predicted, required);
    expect(metrics.recall).toBe(1.0);
    expect(metrics.precision).toBeCloseTo(0.667, 2);
    expect(metrics.matched.length).toBe(2);
    expect(metrics.missing.length).toBe(0);
  });

  it('should detect US patent law hallucination flag', () => {
    const item = {
      id: 'eval_001',
      category: 'Section 3(p)',
      question: 'Can neem be patented?',
      answer: 'No under Section 3(p).',
      required_citations: ['Patents Act s.3(p)'],
      difficulty: 'basic'
    };

    const hallucinatedResponse = 'Under 35 U.S.C. 101 and Section 3(p), the neem formulation is invalid.';
    const result = evaluateResponse(item, hallucinatedResponse, 1200, { prompt: 100, completion: 50 });
    expect(result.hasUsLawHallucination).toBe(true);
    expect(result.groundednessScore).toBeLessThan(80);
  });

  it('should aggregate metrics correctly across benchmark runs', () => {
    const mockEvalResults = [
      {
        id: 'eval_001',
        citations: { recall: 1.0, precision: 1.0, f1: 1.0 },
        latencyMs: 1500,
        tokenUsage: { prompt: 200, completion: 300 },
        verdictAligned: true,
        groundednessScore: 95,
        status: 'PASSED'
      },
      {
        id: 'eval_002',
        citations: { recall: 0.8, precision: 0.8, f1: 0.8 },
        latencyMs: 2500,
        tokenUsage: { prompt: 250, completion: 350 },
        verdictAligned: true,
        groundednessScore: 90,
        status: 'PASSED'
      }
    ];

    const agg = aggregateBenchmarkMetrics(mockEvalResults);
    expect(agg.testCount).toBe(2);
    expect(agg.passRate).toBe(100);
    expect(agg.verdictAccuracy).toBe(100);
    expect(agg.meanRecall).toBe(90);
    expect(agg.averageLatencyMs).toBe(2000);
  });

  it('should provide benchmark baselines for competitive comparison', () => {
    expect(BENCHMARK_BASELINES.length).toBe(3);
    const ayur = BENCHMARK_BASELINES.find(b => b.isPrimary);
    expect(ayur).toBeDefined();
    expect(ayur.statutoryRecall).toBe('94.2%');
  });
});
