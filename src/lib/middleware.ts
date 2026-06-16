import { Request, Response, NextFunction } from "express";
import { verifyToken, users, JWTPayload } from "./auth";
import { getPlan, hasFeature, isLimitReached, 
  getLimit } from "./plans";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      userPlan?: ReturnType<typeof getPlan>;
    }
  }
}

// ── MIDDLEWARE 1: Authenticate JWT ──────
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required",
      code: "NO_TOKEN",
    });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      error: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
  }

  req.user = payload;
  req.userPlan = getPlan(payload.plan);
  next();
}

// ── MIDDLEWARE 2: Optional Auth ─────────
// (Does not block, just attaches user if token exists)
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
      req.userPlan = getPlan(payload.plan);
    }
  }
  next();
}

// ── MIDDLEWARE 3: Require Feature ───────
// Usage: requireFeature("aiMessageGenerator")
export function requireFeature(
  feature: Parameters<typeof hasFeature>[1]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const plan = req.user?.plan || "free";
    
    if (!hasFeature(plan, feature)) {
      return res.status(403).json({
        error: "Feature not available on your plan",
        code: "PLAN_LIMIT",
        feature,
        currentPlan: plan,
        upgradeTo: plan === "free" ? "pro" : "agency",
        upgradeMessage: plan === "free"
          ? "Upgrade to Pro ($20/month) to unlock this feature"
          : "Upgrade to Agency ($49/month) to unlock this feature",
      });
    }
    next();
  };
}

// ── MIDDLEWARE 4: Require Plan Level ────
// Usage: requirePlan("pro")
export function requirePlan(
  minimumPlan: "free" | "pro" | "agency"
) {
  const planHierarchy = { free: 0, pro: 1, agency: 2 };
  
  return (req: Request, res: Response, next: NextFunction) => {
    const userPlan = req.user?.plan || "free";
    const userLevel = planHierarchy[userPlan];
    const requiredLevel = planHierarchy[minimumPlan];

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: `This requires ${minimumPlan} plan or higher`,
        code: "INSUFFICIENT_PLAN",
        currentPlan: userPlan,
        requiredPlan: minimumPlan,
        upgradeMessage: `Upgrade to ${
          minimumPlan === "pro" 
            ? "Pro ($20/month)" 
            : "Agency ($49/month)"
        } to access this`,
      });
    }
    next();
  };
}

// ── MIDDLEWARE 5: Check Usage Limits ────
export function checkLimit(
  limitKey: Parameters<typeof getLimit>[1],
  getCurrentUsage: (userId: string) => Promise<number>
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const plan = req.user?.plan || "free";
    const userId = req.user?.userId || "";
    const limit = getLimit(plan, limitKey);

    if (limit === -1) {
      // Unlimited — skip check
      return next();
    }

    try {
      const current = await getCurrentUsage(userId);
      
      if (isLimitReached(current, limit)) {
        return res.status(429).json({
          error: `${limitKey} limit reached for your plan`,
          code: "USAGE_LIMIT_REACHED",
          limit,
          current,
          currentPlan: plan,
          upgradeMessage: `Upgrade your plan to increase limits`,
          resetInfo: limitKey.includes("Month")
            ? "Resets on 1st of next month"
            : "Resets daily at midnight UTC",
        });
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
}

// ── MIDDLEWARE 6: Dynamic Rate Limiter ──
// Applies different rate limits per plan
import rateLimit from "express-rate-limit";
import { PLANS } from "./plans";

export function planBasedRateLimit() {
  // Pre-create limiters for each plan
  const limiters = {
    free: rateLimit({
      windowMs: PLANS.free.rateLimit.windowMs,
      max: PLANS.free.rateLimit.max,
      message: { 
        error: "Rate limit exceeded. Upgrade for higher limits.",
        code: "RATE_LIMIT",
        currentPlan: "free",
        upgradeMessage: "Pro plan gets 5x more API capacity"
      },
      keyGenerator: (req) => 
        req.user?.userId || req.ip || "unknown",
    }),
    pro: rateLimit({
      windowMs: PLANS.pro.rateLimit.windowMs,
      max: PLANS.pro.rateLimit.max,
      message: { 
        error: "Rate limit exceeded.",
        code: "RATE_LIMIT",
        currentPlan: "pro",
      },
      keyGenerator: (req) => 
        req.user?.userId || req.ip || "unknown",
    }),
    agency: rateLimit({
      windowMs: PLANS.agency.rateLimit.windowMs,
      max: PLANS.agency.rateLimit.max,
      message: { 
        error: "Rate limit exceeded.",
        code: "RATE_LIMIT",
        currentPlan: "agency",
      },
      keyGenerator: (req) => 
        req.user?.userId || req.ip || "unknown",
    }),
  };

  // Return middleware that selects correct limiter
  return (req: Request, res: Response, next: NextFunction) => {
    const plan = (req.user?.plan || "free") as keyof typeof limiters;
    return limiters[plan](req, res, next);
  };
}
