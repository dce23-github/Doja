const express = require("express");
const router = express.Router();
const User = require("../models/User");



router.get("/:id", async (req, res) => {

    const { id } = req.params;
    try {
        const user = await User.findById(id).populate("teamInvites").populate("friendRequests");
        if(user){
            res.send(user);
        }
        else{
            throw new Error("user not found in notification route");
        }

    }
    catch (err) {
        throw new Error(err);
    }

})


module.exports = {notifRoutes : router};