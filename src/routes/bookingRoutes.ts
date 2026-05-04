import { Router } from "express";
import {
  getAgentBookings,
  createBooking,
  deleteBooking,
  getBooking,
  getBookings,
  getMyBookings,
  updateBooking
} from "../controllers/bookingController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { bookingCreateSchema, bookingUpdateSchema } from "../validations/schemas";

const router = Router();

router.post("/", protect, validateBody(bookingCreateSchema), createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/agent-bookings", protect, getAgentBookings);
router.get("/", protect, getBookings);
router.get("/:id", protect, getBooking);
router.patch("/:id/status", protect, restrictTo("agent", "admin"), validateBody(bookingUpdateSchema), updateBooking);
router.patch("/:id", protect, restrictTo("agent", "admin"), validateBody(bookingUpdateSchema), updateBooking);
router.delete("/:id", protect, deleteBooking);

export default router;
