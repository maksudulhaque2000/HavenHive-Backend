import { Router } from "express";
import {
  addWishlistItem,
  deleteUser,
  getDashboardStats,
  getUser,
  getUsers,
  getWishlist,
  removeWishlistItem,
  toggleWishlist,
  updateMyProfile,
  updateUser
} from "../controllers/userController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updateProfileSchema, userAdminUpdateSchema } from "../validations/schemas";

const router = Router();

router.get("/stats", protect, getDashboardStats);
router.get("/dashboard/stats", protect, getDashboardStats);
router.get("/", protect, restrictTo("admin"), getUsers);
router.get("/:id", protect, getUser);
router.get("/:id/wishlist", protect, getWishlist);
router.patch("/me", protect, validateBody(updateProfileSchema), updateMyProfile);
router.patch("/:id", protect, restrictTo("admin"), validateBody(userAdminUpdateSchema), updateUser);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);
router.post("/wishlist/:propertyId", protect, toggleWishlist);
router.post("/:id/wishlist/:propertyId", protect, addWishlistItem);
router.delete("/:id/wishlist/:propertyId", protect, removeWishlistItem);

export default router;
