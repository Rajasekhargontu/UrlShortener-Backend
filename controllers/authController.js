import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function register(req, res) {
    try {
        const errors = validationResult(req);
        //console.log(errors);
        if (errors.isEmpty() === false) {
            return res.status(400).json({ status:"error",errors: errors.array(), message: "Invalid input" });
        }
        const { email, password } = req.body;
        let exists =await User.findOne({ email });
        if (exists!==null) {
            return res.status(400).json({ status:"error",message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ email, password: hashedPassword });
        let u = await User.create(user);
        return res.json({ status: "success", message: "User registered successfully" });
    }
    catch (error) {
        //console.log(error);
        return res.status(500).json({ status:"error",message: "Internal Server error" });
    }
}
export async function login(req, res) {
    try {
        const errors = validationResult(req);
        if (errors.isEmpty() === false) {
            return res.status(400).json({ status:"error",errors: errors.array(), message: "Invalid data" });
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user === null)
            return res.status(400).json({status:"error", message: "Invalid credentials" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({status:"error", message: "Invalid credentials" });
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
        return res.json({status:"success",token,message:"Login successful"});
    }
    catch(error){
        //console.log(error);
        return res.status(500).json({status:"error", message: "Internal Server error" });
    }
}