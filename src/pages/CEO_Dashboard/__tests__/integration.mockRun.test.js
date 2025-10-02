import * as mockService from "../services/mockService";

describe("mock integration", () => {
  beforeAll(() => {
    // ensure localStorage is available in test env; jest provides jsdom
    localStorage.clear();
    mockService.loadFixtures();
  });

  test("runAssessment and dashboard summary work", async () => {
    const orgId = "org-1";
    const res = await mockService.runAssessment(orgId, "iteration");
    expect(res).toHaveProperty("id");
    expect(res).toHaveProperty("systemId", "iteration");
    expect(typeof res.score).toBe("number");
    expect(res.meta.simulated).toBe(true);
    expect(new Date(res.timestamp).getTime()).toBeGreaterThan(0);

    const summary = await mockService.getDashboardSummary(orgId);
    expect(summary).toHaveProperty("org_health");
    expect(summary.org_health).toBeGreaterThanOrEqual(0);
    expect(summary.org_health).toBeLessThanOrEqual(100);
  });
});
