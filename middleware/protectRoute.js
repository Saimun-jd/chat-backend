import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Unauthorized - No Token Provided" });
        }

        const decodedToken = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);

        if (!decodedToken) {
            return res.status(401).json({ error: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decodedToken.userID).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protected route middleware", error.message);
        res.status(500).json({ error: error.message });
    }
}

export default protectRoute;
