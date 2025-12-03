import Link from "../models/Link.js";
import Click from "../models/Clicks.js";
import mongoose from "mongoose";
export async function getAnalytics(req, res) {
    try {
        const code = req.params.code;
        const link = await Link.findOne({ code: code });
        if (link === null) {
            return res.status(404).json({status:"error", message: "Link not found" });
        }
        if (link.ownerId.toString() !== req.user.id) {
            return res.status(403).json({status:"error", message: "Access denied" });
        }
        const total = link.clicks;
        const recent = await Click.find({ linkId: link._id }).sort({ ts: -1 }).limit(20).lean();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const daily = await Click.aggregate([
            { $match: { linkId: new mongoose.Types.ObjectId(link._id), ts: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$ts" },
                        month: { $month: "$ts" },
                        day: { $dayOfMonth: "$ts" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);
        return res.json({status:"success",url: link.destination, createdAt: link.createdAt, totalClicks: total, recentClicks: recent, dailyClicks: daily });
    }
    catch(error){
        //console.log("Analytics error");
        //console.log(error)
        return res.status(500).json({status:"error", message: "Internal Server error" });
    }
}