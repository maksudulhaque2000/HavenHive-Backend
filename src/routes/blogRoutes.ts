import { Router } from "express";
import { createBlog, deleteBlog, getBlog, getBlogs, updateBlog } from "../controllers/blogController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { blogCreateSchema, blogUpdateSchema } from "../validations/schemas";

const router = Router();

router.get("/", getBlogs);
router.get("/:slug", getBlog);
router.post("/", protect, restrictTo("admin"), validateBody(blogCreateSchema), createBlog);
router.patch("/:id", protect, restrictTo("admin"), validateBody(blogUpdateSchema), updateBlog);
router.delete("/:id", protect, restrictTo("admin"), deleteBlog);

export default router;
