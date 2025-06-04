import express from "express";
import passport from "passport";

const router = express.Router();
// http://localhost:6000/payments
router.get(
    "/", 
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // req.user is populated by passport after successful authentication
        res.json({
            message: "You have a total of: $2400",
            // user: req.user ? { id: req.user.id, name: req.user.name, email: req.user.email } : null
        });
    }
);

export default router;