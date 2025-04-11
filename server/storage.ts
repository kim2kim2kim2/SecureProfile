import { users, galleries, type User, type InsertUser, type Gallery, type InsertGallery } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<void>;
  updateUserTheme(id: number, theme: string): Promise<User>;
  
  // Gallery methods
  createGalleryItem(galleryItem: InsertGallery): Promise<Gallery>;
  getGalleryItems(userId?: number): Promise<Gallery[]>;
  getGalleryItem(id: number): Promise<Gallery | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private galleryItems: Map<number, Gallery>;
  userCurrentId: number;
  galleryCurrentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.galleryItems = new Map();
    this.userCurrentId = 1;
    this.galleryCurrentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      darkMode: "auto",
      bio: "",
      profileImage: "",
      phone: "",
      socialLinks: {}
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`Bruker med ID ${id} ikke funnet`);
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`Bruker med ID ${id} ikke funnet`);
    }

    user.password = password;
    this.users.set(id, user);
  }

  async updateUserTheme(id: number, theme: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`Bruker med ID ${id} ikke funnet`);
    }

    user.darkMode = theme;
    this.users.set(id, user);
    return user;
  }

  // Gallery methods
  async createGalleryItem(galleryItem: InsertGallery): Promise<Gallery> {
    const id = this.galleryCurrentId++;
    const newItem: Gallery = {
      ...galleryItem,
      id,
      createdAt: new Date()
    };
    
    this.galleryItems.set(id, newItem);
    return newItem;
  }

  async getGalleryItems(userId?: number): Promise<Gallery[]> {
    const items = Array.from(this.galleryItems.values());
    
    if (userId) {
      return items.filter(item => item.userId === userId);
    }
    
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGalleryItem(id: number): Promise<Gallery | undefined> {
    return this.galleryItems.get(id);
  }
}

export const storage = new MemStorage();
