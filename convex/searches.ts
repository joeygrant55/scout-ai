import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveSearch = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    queryText: v.string(),
    isAlert: v.boolean(),
    alertFrequency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Not authenticated");
    }

    const searchId = await ctx.db.insert("savedSearches", {
      userId: session.userId,
      name: args.name,
      queryText: args.queryText,
      isAlert: args.isAlert,
      alertFrequency: args.alertFrequency,
      lastResultCount: 0,
      createdAt: Date.now(),
    });

    return { id: searchId };
  },
});

export const getSavedSearches = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return [];
    }

    const searches = await ctx.db
      .query("savedSearches")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    return searches.map((s) => ({
      id: s._id,
      name: s.name,
      queryText: s.queryText,
      isAlert: s.isAlert,
      alertFrequency: s.alertFrequency,
      lastResultCount: s.lastResultCount,
      createdAt: s.createdAt,
    }));
  },
});

export const deleteSearch = mutation({
  args: {
    token: v.string(),
    searchId: v.id("savedSearches"),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Not authenticated");
    }

    const search = await ctx.db.get(args.searchId);
    if (!search || search.userId !== session.userId) {
      throw new Error("Search not found");
    }

    await ctx.db.delete(args.searchId);
    return { success: true };
  },
});
