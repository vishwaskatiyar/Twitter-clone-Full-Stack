import User from "../model/user.model.js";
import jwt from "jsonwebtoken"

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "Not authenticated" });

        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ error: "Not authenticated:Invalid Token" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ error: " User not found" });
        }
        req.user = user;
        next();

    } catch (e) {
        console.error("Error in protectRoute middleware", e.message);
        return res.status(500).json({
            error: "Internal Server Error"
        });

    }
}