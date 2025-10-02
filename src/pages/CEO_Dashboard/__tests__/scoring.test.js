import { normalizeMetric, scoreSystem, computeOrgHealth, explain } from "../lib/scoring";

describe("scoring module", () => {
  test("scoring with full metrics returns 0..100", () => {
    const metrics = { a: 80, b: 60, c: 40 };
    const { score, coverage } = scoreSystem(metrics, { a: 1, b: 1, c: 1 }, ["a", "b", "c"]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(coverage).toBeCloseTo(1, 5);
  });

  test("scoring with missing metrics lowers coverage and confidence", () => {
    const metrics = { a: 80 };
    const { score, coverage } = scoreSystem(metrics, { a: 1, b: 1, c: 1 }, ["a", "b", "c"]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(coverage).toBeCloseTo(1 / 3, 5);

    const { orgHealth, confidence } = computeOrgHealth([
      { key: "sys1", score, coverage },
      { key: "sys2", score: 50, coverage: 0.5 },
    ]);
    expect(orgHealth).toBeGreaterThanOrEqual(0);
    expect(orgHealth).toBeLessThanOrEqual(100);
    expect(confidence).toBeGreaterThan(0.5);
    expect(confidence).toBeLessThanOrEqual(1);
  });

  test("explain returns top contributors", () => {
    const metrics = { a: 80, b: 20, c: 60 };
    const { top, deltas } = explain(metrics, { a: 2, b: 1, c: 1 });
    expect(top.length).toBeGreaterThan(0);
    expect(deltas.find((d) => d.key === "a")).toBeTruthy();
  });
});
