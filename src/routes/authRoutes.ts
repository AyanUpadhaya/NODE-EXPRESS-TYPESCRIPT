import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import {
  registerValidation,
  loginValidation,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Private routes (require authentication)
router.use(protect); // All routes below require authentication

router.get("/profile", getProfile);

router.put(
  "/profile",
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    handleValidationErrors,
  ],
  updateProfile
);

router.put(
  "/change-password",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    handleValidationErrors,
  ],
  changePassword
);

export default router;
