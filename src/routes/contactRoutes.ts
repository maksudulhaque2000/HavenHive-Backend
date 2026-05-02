import { Router } from "express";
import { createContact, deleteContact, getContacts, updateContactStatus } from "../controllers/contactController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { contactCreateSchema, contactStatusSchema } from "../validations/schemas";

const router = Router();

router.post("/", validateBody(contactCreateSchema), createContact);
router.get("/", protect, restrictTo("admin"), getContacts);
router.patch("/:id/status", protect, restrictTo("admin"), validateBody(contactStatusSchema), updateContactStatus);
router.delete("/:id", protect, restrictTo("admin"), deleteContact);

export default router;
