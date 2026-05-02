import { Router } from "express";
import {
  createBooking,
  deleteBooking,
  getBooking,
  getBookings,
  updateBooking
} from "../controllers/bookingController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { bookingCreateSchema, bookingUpdateSchema } from "../validations/schemas";

const router = Router();

router.post("/", protect, validateBody(bookingCreateSchema), createBooking);
router.get("/", protect, getBookings);
router.get("/:id", protect, getBooking);
router.patch("/:id", protect, restrictTo("agent", "admin"), validateBody(bookingUpdateSchema), updateBooking);
router.delete("/:id", protect, restrictTo("admin"), deleteBooking);

export default router;
