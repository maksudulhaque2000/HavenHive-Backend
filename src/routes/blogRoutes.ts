import { Router } from "express";
import { createBlog, deleteBlog, getBlog, getBlogById, getBlogs, updateBlog } from "../controllers/blogController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { upload } from "../middleware/upload";
import { blogCreateSchema, blogUpdateSchema } from "../validations/schemas";

const router = Router();

router.get("/", getBlogs);
// Get by ID (for editing - requires auth)
router.get("/:id", protect, restrictTo("admin", "agent"), getBlogById);
// Get by slug (public)
router.get("/:slug", getBlog);
router.post("/", protect, restrictTo("admin", "agent"), upload.single("coverImage"), validateBody(blogCreateSchema), createBlog);
router.patch("/:id", protect, restrictTo("admin", "agent"), upload.single("coverImage"), validateBody(blogUpdateSchema), updateBlog);
router.delete("/:id", protect, restrictTo("admin", "agent"), deleteBlog);

export default router;
