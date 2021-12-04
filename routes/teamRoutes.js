const Team = require("../models/Team");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Chat = require("../models/Chat");

// const fetch = require("node-fetch");

router.get("/create/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        console.log(userId);
        const user = await User.findById(userId).populate("friends");
        res.send(user.friends);
    }
    catch (err) {
        console.log(err);
        res.send(err);
        throw new Error(err);
    }
});

router.post("/create/:userId", async (req, res) => {
    const { userId } = req.params;
    const { teamName, friends } = req.body;
    try {
        console.log(teamName);
        const team = new Team({
            name: teamName,
        });
        
        const user = await User.findById(userId);
        user.teams.push(team._id);
        await user.save();
        
        team.members.push(user._id);
        team.acCnt = 1;
        await team.save();


        for (let fid of friends) {
            const f = await User.findById(fid);
            f.teamInvites.push(team._id);
            await f.save();
        }

        res.send({ status: "created" });
    }
    catch (err) {
        console.log(err);
        res.send({ status: "not created" });
        throw new Error("Team not created : ", err, userId);
    }
});


router.post("/accept/:userId/", async (req, res) => {
    const { userId } = req.params;
    try {
        const { teamsAc } = req.body;
        const user = await User.findById(userId);
        
        for (let teamId of teamsAc) {
            const team = await Team.findById(teamId);
            team.members.push(user._id);
            team.acCnt = team.acCnt + 1;
            user.teams.push(team._id);
            user.teamInvites = user.teamInvites.filter(id => String(id) !== String(teamId));

            if (team.acCnt == 3) {
                team.valid = true;
                const chat = new Chat({
                    member_count: 3,
                    teamId: team._id,
                });
                await chat.save();
                team.chatId = chat._id;
                await team.save();
                for (let member of team.members) {
                    if(String(member) === userId) continue;
                    const friend = await User.findById(member);
                    chat.authorized_users.push(friend._id);
                    friend.chat.push(chat._id);
                    await friend.save();
                }
                chat.authorized_users.push(user._id);
                user.chat.push(chat._id);
                await chat.save();
            } // 
            else
                await team.save();
        }
        
        await user.save();
        res.send({ status: "accepted" });
    }
    catch (err) {
        console.log(err);
        res.send({ status: "not accpeted" });
        throw new Error("Team invite not accpeted : ", err, userId);
    }
});


router.get("/invites/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).populate("teamInvites");
        res.send(user.teamInvites);
    }
    catch (err) {
        console.log(err);
        res.send({ status: "invite not found" });
        throw new Error(err, userId);
    }
})

router.get("/my-teams/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).populate("teams");
        res.send(user.teams);
    }
    catch (err) {
        console.log(err);
        res.send({ status: "invite not found" });
        throw new Error(err, userId);
    }
})

module.exports = { teamRoutes: router };

