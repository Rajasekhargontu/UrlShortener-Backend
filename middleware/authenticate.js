import jwt from "jsonwebtoken";
export  function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({status:"error", message: "No access token provided." });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({status:"error", message: "Authentication Token missing pleasse login again." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        //console.log("user authenticated");
        next();
    } catch (error) {
        return res.status(401).json({status:"error", message: "Invalid or expired token. Please login again." });
    }
}