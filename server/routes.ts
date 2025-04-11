import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { InsertGallery } from "@shared/schema";
import { analyzeImage, getCreativityLevelDescription, getExcitementLevelDescription } from "./services/anthropic";
import { resizeImage, createThumbnail, ensureDirectoryExists } from "./services/image";

// Setup directories
const uploadsDir = path.join(process.cwd(), "uploads");
const galleryDir = path.join(uploadsDir, "gallery");
const thumbnailsDir = path.join(uploadsDir, "thumbnails");

// Ensure directories exist
ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(galleryDir);
ensureDirectoryExists(thumbnailsDir);

// Configure multer for gallery image uploads
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, galleryDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const user = req.user as Express.User; // Type assertion for TypeScript
    cb(null, `${user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const galleryUpload = multer({
  storage: galleryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Kun bildefiler er tillatt (JPG, PNG, GIF)"));
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Protected route middleware
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Ikke autentisert" });
  };

  // Get all gallery items (for a user or all)
  app.get("/api/gallery", async (req, res, next) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const gallery = await storage.getGalleryItems(userId);
      res.json(gallery);
    } catch (error) {
      next(error);
    }
  });

  // Get a specific gallery item
  app.get("/api/gallery/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const galleryItem = await storage.getGalleryItem(id);
      
      if (!galleryItem) {
        return res.status(404).json({ message: "Galleribildet ble ikke funnet" });
      }
      
      res.json(galleryItem);
    } catch (error) {
      next(error);
    }
  });

  // Upload and analyze new gallery image
  app.post("/api/gallery/upload", isAuthenticated, galleryUpload.single("image"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Ingen fil ble lastet opp" });
      }

      const userId = (req.user as Express.User).id;
      const { creativityValue, excitementValue, jinnification } = req.body;
      
      // Validate input
      const creativity = parseInt(creativityValue);
      const excitement = parseInt(excitementValue);
      const useJinnification = jinnification === "true";
      
      if (isNaN(creativity) || creativity < 0 || creativity > 100) {
        return res.status(400).json({ message: "Kreativitetsverdien må være mellom 0 og 100" });
      }
      
      if (isNaN(excitement) || excitement < 0 || excitement > 100) {
        return res.status(400).json({ message: "Spenningsverdien må være mellom 0 og 100" });
      }

      // Generate filenames
      const originalFilename = req.file.filename;
      const filenameWithoutExt = path.basename(originalFilename, path.extname(originalFilename));
      const resizedFilename = `${filenameWithoutExt}-resized${path.extname(originalFilename)}`;
      const thumbnailFilename = `${filenameWithoutExt}-thumb${path.extname(originalFilename)}`;
      
      const originalPath = req.file.path;
      const resizedPath = path.join(galleryDir, resizedFilename);
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

      // Resize image and create thumbnail
      await resizeImage(originalPath, resizedPath);
      await createThumbnail(originalPath, thumbnailPath);

      // Remove original if it's different from resized
      if (originalPath !== resizedPath) {
        fs.unlinkSync(originalPath);
      }

      // Determine creativity and excitement level descriptions
      const creativityLevel = getCreativityLevelDescription(creativity);
      const excitementLevel = getExcitementLevelDescription(excitement);

      // Analyze image with Anthropic Claude
      const description = await analyzeImage({
        imagePath: resizedPath,
        creativityLevel,
        excitementLevel,
        jinnification: useJinnification
      });

      // Create gallery item in storage
      const galleryItem: InsertGallery = {
        userId,
        image: `/uploads/gallery/${resizedFilename}`,
        thumbnail: `/uploads/thumbnails/${thumbnailFilename}`,
        creativityValue: creativity,
        excitementValue: excitement,
        jinnification: useJinnification,
        description
      };

      const newGalleryItem = await storage.createGalleryItem(galleryItem);
      res.status(201).json(newGalleryItem);
    } catch (error) {
      next(error);
    }
  });

  // Serve static files from uploads directory
  app.use("/uploads", express.static(uploadsDir));

  const httpServer = createServer(app);

  return httpServer;
}
