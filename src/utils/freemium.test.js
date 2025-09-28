import { canRunFreemiumAction, recordFreemiumRun, resetFreemiumFor } from "./freemium";

beforeEach(() => {
  localStorage.clear();
});

test("initially allowed and shows 3 uses left", () => {
  const res = canRunFreemiumAction("org-a", new Date("2025-01-01T08:00:00Z"), 3);
  expect(res.allowed).toBe(true);
  expect(res.usesLeft).toBe(3);
});

test("recording reduces usesLeft and blocks after limit", () => {
  const org = "org-test";
  recordFreemiumRun(org, new Date("2025-01-01T08:00:00Z")); // 1
  let r = canRunFreemiumAction(org, new Date("2025-01-01T08:00:00Z"), 3);
  expect(r.usesLeft).toBe(2);
  recordFreemiumRun(org);
  recordFreemiumRun(org);
  r = canRunFreemiumAction(org);
  expect(r.allowed).toBe(false);
  expect(r.usesLeft).toBe(0);
});

test("counter resets the next day", () => {
  const org = "org-day";
  recordFreemiumRun(org, new Date("2025-02-01T08:00:00Z"));
  recordFreemiumRun(org, new Date("2025-02-01T09:00:00Z"));
  let r = canRunFreemiumAction(org, new Date("2025-02-01T10:00:00Z"), 3);
  expect(r.usesLeft).toBe(1);

  // next day:
  r = canRunFreemiumAction(org, new Date("2025-02-02T08:00:00Z"), 3);
  expect(r.usesLeft).toBe(3);
  expect(r.allowed).toBe(true);
});
