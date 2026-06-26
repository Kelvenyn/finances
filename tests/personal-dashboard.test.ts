import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildDailyBalanceSeries,
  parsePersonalDashboardPeriod,
  periodStartDate,
} from "@/lib/data/personal-dashboard-calculations";

test("parsePersonalDashboardPeriod defaults to 90 days", () => {
  assert.equal(parsePersonalDashboardPeriod(undefined), "90d");
  assert.equal(parsePersonalDashboardPeriod("unknown"), "90d");
  assert.equal(parsePersonalDashboardPeriod("30d"), "30d");
  assert.equal(parsePersonalDashboardPeriod("ytd"), "ytd");
  assert.equal(parsePersonalDashboardPeriod("all"), "all");
});

test("periodStartDate returns the expected start date", () => {
  assert.equal(periodStartDate("30d", new Date("2026-06-26T12:00:00Z")), "2026-05-28");
  assert.equal(periodStartDate("90d", new Date("2026-06-26T12:00:00Z")), "2026-03-29");
  assert.equal(periodStartDate("ytd", new Date("2026-06-26T12:00:00Z")), "2026-01-01");
  assert.equal(periodStartDate("all", new Date("2026-06-26T12:00:00Z"), "2022-01-01"), "2022-01-01");
});

test("buildDailyBalanceSeries walks backward from current balance", () => {
  const points = buildDailyBalanceSeries({
    currentBalance: 1000,
    startDate: "2026-06-24",
    endDate: "2026-06-26",
    transactions: [
      { date: "2026-06-25", amount: 100, flow: "income" },
      { date: "2026-06-26", amount: 40, flow: "expense" },
      { date: "2026-06-26", amount: 10, flow: "investment" },
    ],
  });

  assert.deepEqual(points, [
    { date: "2026-06-24", balance: 950 },
    { date: "2026-06-25", balance: 1050 },
    { date: "2026-06-26", balance: 1000 },
  ]);
});
