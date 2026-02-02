import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple hash function (for demo - use bcrypt in production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// Generate a random token
function generateToken(): string {
  return Math.random().toString(36).substring(2) +
         Math.random().toString(36).substring(2) +
         Date.now().toString(36);
}

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("Email already registered");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      passwordHash: simpleHash(args.password),
      firstName: args.firstName,
      lastName: args.lastName,
      organization: args.organization,
      createdAt: Date.now(),
    });

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return {
      token,
      expiresAt,
      user: {
        id: userId,
        email: args.email.toLowerCase(),
        firstName: args.firstName,
        lastName: args.lastName,
        organization: args.organization,
      },
    };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.passwordHash !== simpleHash(args.password)) {
      throw new Error("Invalid email or password");
    }

    // Create new session
    const token = generateToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return {
      token,
      expiresAt,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
      },
    };
  },
});

export const validateSession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organization: user.organization,
    };
  },
});

export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});
