import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  bio: text("bio").notNull().default(""),
  profileImage: text("profile_image").notNull().default(""),
  socialLinks: jsonb("social_links").$type<{
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  }>().notNull().default({}),
  darkMode: text("dark_mode").notNull().default("auto")
});

export const galleries = pgTable("galleries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  image: text("image").notNull(),
  thumbnail: text("thumbnail").notNull().default(""),
  creativityValue: integer("creativity_value").notNull(),
  excitementValue: integer("excitement_value").notNull(),
  jinnification: boolean("jinnification").notNull().default(false),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow()
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
  phone: true,
  bio: true,
  profileImage: true,
  socialLinks: true
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Nåværende passord er påkrevd"),
  newPassword: z.string().min(6, "Passord må være minst 6 tegn")
});

export const themeSchema = z.object({
  mode: z.enum(["light", "dark", "auto"])
});

export const uploadImageSchema = z.object({
  creativityValue: z.number().min(0).max(100),
  excitementValue: z.number().min(0).max(100),
  jinnification: z.boolean().default(false)
});

export const imageAnalysisResponseSchema = z.object({
  description: z.string()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type User = typeof users.$inferSelect;
export type ThemeSetting = z.infer<typeof themeSchema>;
export type UploadImage = z.infer<typeof uploadImageSchema>;
export type ImageAnalysisResponse = z.infer<typeof imageAnalysisResponseSchema>;
export type Gallery = typeof galleries.$inferSelect;
export type InsertGallery = typeof galleries.$inferInsert;
