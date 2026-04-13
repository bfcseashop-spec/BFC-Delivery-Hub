import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId || req.session.userRole !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `banner_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

router.post(
  "/admin/upload",
  requireAdmin as Parameters<typeof router.use>[0],
  upload.single("image"),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const base = process.env["API_BASE_URL"] ?? "";
    res.json({ url: `${base}/api/uploads/${req.file.filename}` });
  }
);

function requirePartnerOrAdmin(req: Request, res: Response, next: NextFunction): void {
  const isAdmin = req.session.userId && req.session.userRole === "admin";
  const partnerId = parseInt(req.params.partnerId);
  const isOwnSession = req.session.partnerId === partnerId;
  if (!isAdmin && !isOwnSession) {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  next();
}

router.post(
  "/partner/:partnerId/upload",
  requirePartnerOrAdmin as Parameters<typeof router.use>[0],
  upload.single("image"),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const base = process.env["API_BASE_URL"] ?? "";
    res.json({ url: `${base}/api/uploads/${req.file.filename}` });
  }
);

export default router;
