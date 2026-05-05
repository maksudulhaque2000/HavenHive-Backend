import { Router } from "express";
import {
  addWishlistItem,
  blockUser,
  deleteUser,
  getDashboardStats,
  getUser,
  getUsers,
  getWishlist,
  removeWishlistItem,
  toggleWishlist,
  unblockUser,
  updateMyProfile,
  updateUser,
  updateUserRole,
  uploadProfilePicture
} from "../controllers/userController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updateProfileSchema, userAdminUpdateSchema } from "../validations/schemas";
import { upload } from "../middleware/upload";

const router = Router();

// CRITICAL: Specific routes MUST come before dynamic :id routes
// Order matters in Express routing - first match wins

// 1. Admin-only user listing (needs to be specific)
router.get("/", protect, restrictTo("admin"), getUsers);

// 2. Profile and avatar management routes
router.get("/stats", protect, getDashboardStats);
router.get("/dashboard/stats", protect, getDashboardStats);
router.patch("/me", protect, validateBody(updateProfileSchema), updateMyProfile);
router.post("/me/avatar", protect, upload.single("avatar"), uploadProfilePicture);

// 3. User-specific wishlist operations (more specific than /:id)
router.post("/wishlist/:propertyId", protect, toggleWishlist);

// 4. User management routes (admin only)
router.post("/:id/block", protect, restrictTo("admin"), blockUser);
router.post("/:id/unblock", protect, restrictTo("admin"), unblockUser);
router.patch("/:id/role", protect, restrictTo("admin"), updateUserRole);

// 5. Wishlist operations for specific user (must be before /:id)
router.get("/:id/wishlist", protect, getWishlist);
router.post("/:id/wishlist/:propertyId", protect, addWishlistItem);
router.delete("/:id/wishlist/:propertyId", protect, removeWishlistItem);

// 6. Generic user operations (LAST - most generic pattern)
router.get("/:id", protect, getUser);
router.patch("/:id", protect, restrictTo("admin"), validateBody(userAdminUpdateSchema), updateUser);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);

export default router;
