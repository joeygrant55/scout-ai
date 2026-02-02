import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    organization: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  savedSearches: defineTable({
    userId: v.id("users"),
    name: v.string(),
    queryText: v.string(),
    isAlert: v.boolean(),
    alertFrequency: v.optional(v.string()),
    lastResultCount: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
