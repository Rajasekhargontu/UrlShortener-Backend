import { validationResult } from "express-validator";
import Link from "../models/Link.js";
import Click from "../models/Clicks.js";
import { nanoid } from "nanoid";
/*
Create a short code for the given url
*/
export async function shorten(req, res) {
    try {
        const errors = validationResult(req);
        if (errors.isEmpty()===false)
            return res.status(500).json({status:"error", errors: errors.array(), message: "Invalid Input" });
        var { url, custom, expires_in } = req.body;
        if (url.startsWith('http://')) {
             url = url.replace('http://', 'https://');
        } 
    // 2. If the URL does not start with https:// (and it wasn't http://, 
    //    meaning it has no protocol), prepend https://
    else if (!url.startsWith('https://')) {
        url = 'https://' + url;
    }
        //console.log(url);
        var expires_at = null;
        if (expires_in) {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(expires_in));
            expires_at = date;
        }
        if (custom) {
            const existing = await Link.findOne({ code: custom });
            if (existing)
                return res.status(400).json({status:"error", message: "Custom short code already in use" });
            const link = new Link({ code: custom, destination: url, ownerId: req.user.id, isCustom: true, expiresAt: expires_at });
            await link.save();
            return res.status(200).json({status:"success", url_code: custom, message: "Short URL created successfully" });
        }
        else {
            try {
                for (let i = 0; i < 10; i++) {
                    const code = nanoid(process.env.CODE_LENGTH);
                    const existing = await Link.findOne({ code: code });
                    if (!existing) {
                        const link = new Link({ code: code, destination: url, ownerId: req.user.id, isCustom: false, expiresAt: expires_at });
                        await link.save();
                        return res.status(200).json({status:"success", url_code: code, message: "Short URL created successfully" });
                    }
                }
                return res.status(500).json({ status:"error",message: "Could not generate unique code. Please try again." });
            }
            catch (error) {
                //console.log(error);
                return res.status(500).json({ status:"error",message: "Url generator Error" });
            }
        }
    }
    catch (error) {
        //console.log(error);
        return res.status(500).json({status:"error", message: "Internal Server Error" });
    }
}

export async function redirect(req, res) {
    try {
        //console.log("redirect initiated");
        const code = req.params.code;
        //console.log(code);
        const link = await Link.findOne({ code: code });
        //console.log(link);
        if (link === null)
            return res.status(404).json({status:"error", message: "Link not found" });
        if (link.expiresAt && link.expiresAt < Date.now()) {
            return res.status(410).json({status:"error", message: "Link has expired" });
        }
        
        res.redirect(link.destination);
        (async () => {
            try {
                let ip = req.headers['x-forwarded-for']?.split(',')[0];
                //console.log(req.headers);
                const ua = req.get('User-Agent') || null;
                const ref = req.get('Referer') || req.get('Referrer') || null;
                await Click.create({
                    linkId: link._id,
                    code: link.code,
                    ts: new Date(),
                    ip: ip,
                    ua,
                    referrer: ref
                });
                await Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } });
            }
            catch (error) {
                console.error("Error logging click:", error);
            }
        })();
    }
    catch(error){
        //console.log(error);
        return res.status(500).json({status:"error", message: "Server Error" });
    }
}
export async function getUserLinks(req,res){
    try{
        const links=await Link.find({ownerId:req.user.id}).lean();
        return res.json({links});
    }
    catch(error){
        return res.status(500).json({status:"error", message: "Unable to fetch past links." });
    }
}
export async function deleteLink(req,res){
    try{
        const code=req.params.code;
        var link=await Link.findOne({code:code});
        if(link===null){
            return res.status(404).json({status:"error",message:"Link not found"});
        }
        if(link.ownerId.toString()!==req.user.id){
            return res.status(403).json({status:"error",message:"Access denied"});
        }
        const result=await link.deleteOne({code});
        const clickResult=await Click.deleteMany({linkId:link._id});
        //console.log(result);
        //console.log(clickResult);
        return res.json({status:"success",message:"Link deleted successfully"});
    }
    catch(error){
        return res.json({status:"error",message:"Unable to delete link.please try again later."});
    }
    
}