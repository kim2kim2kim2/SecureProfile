import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  darkMode: text("dark_mode").default("auto")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true
});

export const loginUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

export const updateUserSchema = createInsertSchema(users).pick({
  fullName: true,
  email: true,
  bio: true,
  profileImage: true
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters")
});

export const themeSchema = z.object({
  mode: z.enum(["light", "dark", "auto"])
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type User = typeof users.$inferSelect;
export type ThemeSetting = z.infer<typeof themeSchema>;
