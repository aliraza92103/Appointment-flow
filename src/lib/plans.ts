export const PLANS = {
  free: {
    id: "free",
    name: "Starter",
    price: 0,
    limits: {
      remindersPerMonth: 50,
      staffMembers: 1,
      branches: 1,
      aiMessagesPerDay: 0,
      appointmentsPerMonth: 30,
      analyticsHistoryDays: 7,
    },
    features: {
      aiMessageGenerator: false,
      fullAnalytics: false,
      exportCSV: false,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false,
      bulkReminders: false,
      customTemplates: false,
      multipleBarbers: false,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 20,
    },
  },

  pro: {
    id: "pro",
    name: "Pro",
    price: 20,
    limits: {
      remindersPerMonth: -1,      // -1 = unlimited
      staffMembers: 10,
      branches: 3,
      aiMessagesPerDay: 50,
      appointmentsPerMonth: -1,
      analyticsHistoryDays: 90,
    },
    features: {
      aiMessageGenerator: true,
      fullAnalytics: true,
      exportCSV: true,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: true,
      bulkReminders: true,
      customTemplates: true,
      multipleBarbers: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
    },
  },

  agency: {
    id: "agency",
    name: "Agency",
    price: 49,
    limits: {
      remindersPerMonth: -1,
      staffMembers: -1,
      branches: -1,
      aiMessagesPerDay: 200,
      appointmentsPerMonth: -1,
      analyticsHistoryDays: 365,
    },
    features: {
      aiMessageGenerator: true,
      fullAnalytics: true,
      exportCSV: true,
      apiAccess: true,
      whiteLabel: true,
      prioritySupport: true,
      bulkReminders: true,
      customTemplates: true,
      multipleBarbers: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 500,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = typeof PLANS[PlanId];

// Helper: check if limit is reached
export function isLimitReached(
  current: number,
  limit: number
): boolean {
  if (limit === -1) return false; // unlimited
  return current >= limit;
}

// Helper: get plan by id
export function getPlan(planId: string): Plan {
  return PLANS[planId as PlanId] || PLANS.free;
}

// Helper: check if plan has feature
export function hasFeature(
  planId: string,
  feature: keyof Plan["features"]
): boolean {
  const plan = getPlan(planId);
  return plan.features[feature];
}

// Helper: get limit value
export function getLimit(
  planId: string,
  limitKey: keyof Plan["limits"]
): number {
  const plan = getPlan(planId);
  return plan.limits[limitKey];
}
