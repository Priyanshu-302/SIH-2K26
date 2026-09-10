import request from 'supertest';
import app from '../../src/app.js';

describe('Evaluation & Benchmarks API Integration Tests', () => {
  describe('GET /api/evals/benchmark', () => {
    it('should return 200 with audit summary, comparison matrix, and 15 benchmark cases', async () => {
      const res = await request(app).get('/api/evals/benchmark');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.readOnly).toBe(true);
      
      // Summary checks (dynamically computed from gold-standard dataset)
      expect(res.body.summary).toBeDefined();
      expect(res.body.summary.statutoryRecall).toBeGreaterThanOrEqual(90);
      expect(res.body.summary.casePrecision).toBeGreaterThanOrEqual(90);
      expect(res.body.summary.tkdlGrounding).toBeGreaterThanOrEqual(90);
      expect(res.body.summary.verdictAccuracy).toBeGreaterThanOrEqual(90);
      expect(res.body.summary.speedupMultiplier).toMatch(/\d+\.?\d*x faster/);
      expect(res.body.summary.tokenReduction).toMatch(/\d+\.?\d*%/);
      expect(res.body.summary.totalCases).toBe(15);

      // Comparison matrix checks
      expect(res.body.comparisonMatrix).toBeDefined();
      expect(res.body.comparisonMatrix.length).toBe(3);
      const ayur = res.body.comparisonMatrix.find(m => m.isPrimary);
      expect(ayur).toBeDefined();
      expect(ayur.model).toContain('Ayur-IP');

      // Cases checks
      expect(res.body.cases).toBeDefined();
      expect(res.body.cases.length).toBe(15);
      expect(res.body.cases[0]).toHaveProperty('id');
      expect(res.body.cases[0]).toHaveProperty('category');
      expect(res.body.cases[0]).toHaveProperty('requiredCitations');
      expect(res.body.cases[0]).toHaveProperty('groundednessScore');
    });
  });

  describe('POST /api/evals/run', () => {
    it('should execute live benchmark runner on selected cases and return updated metrics', async () => {
      const res = await request(app)
        .post('/api/evals/run')
        .send({ caseIds: ['eval_001', 'eval_002'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.runSummary).toBeDefined();
      expect(res.body.runSummary.testCount).toBe(2);
      expect(res.body.results.length).toBe(2);
      expect(res.body.results[0].id).toBe('eval_001');
      expect(res.body.results[0].status).toBe('PASSED');
      expect(res.body.results[0].groundednessScore).toBeGreaterThanOrEqual(90);
    });

    it('should run all cases if no caseIds specified', async () => {
      const res = await request(app)
        .post('/api/evals/run')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.runSummary.testCount).toBe(15);
      expect(res.body.results.length).toBe(15);
    });
  });
});
