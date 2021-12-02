const express = require("express");
const Chat = require("../models/Chat");
const Team = require("../models/Team");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const cookie = require("cookie");

router.post("/:id/search", async (req, res) => {
    const { handle } = req.body;
    // const all = await User.find({});
    // console.log(all);

    const reg = new RegExp(`.*${handle}.*`);
    console.log(reg);
    User.find({ "userHandle": { $regex: reg, $options: 'i' } },
        function (err, users) {
            if (err) throw new AppError(err, 500);
            res.json(users);
        });

});

router.get("/:id", async (req, res) => {
    // add isAuthenticated logi here 

    // assuming logged in

    const { id } = req.params;
    const user = await User.findById(id);
    res.render("user/profile", { user });
});


router.post("/:id/addFriend", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        // user.friends.length = 0;
        const friends = req.body.friends;
        console.log(friends);
        for (let fid of friends) {
            console.log(fid);
            const f = await User.findById(fid);
            f.friendRequests.push(user._id);
            await f.save();
        }

        // const fdocs = [];
        // for (let f of friends) {
        //     const doc = await User.findById(f);
        //     console.log(doc);
        //     if (!user.friends.some(id => String(id) == String(f))) user.friends.push(f);
        //     fdocs.push(doc);
        // }

        // for (let d1 of fdocs) {
        //     if (!d1.friends.some(f => f == id)) d1.friends.push(id);
        //     for (let d2 of fdocs) {
        //         if (d1._id != d2._id) {
        //             if (!d1.friends.some(f => f == d2._id)) d1.friends.push(d2._id);
        //         }
        //     }
        //     await d1.save();
        // }
        console.log("friend request sent");
        await user.save();
        res.send({ status: "friend request sent" });
    }
    catch (err) {
        console.log(err, "at userRoutes");
        res.send({ status: "friend request not sent" });
    }
})

router.get("/:id/my-friends", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).populate("friends");
        res.send(user.friends);
    }
    catch (err) {
        console.log(err, "at get friend requests");
    }
});

router.get("/:id/friend-requests", async (req, res) => { // get friend requests of user
    const { id } = req.params;
    try {
        const user = await User.findById(id).populate("friendRequests");
        console.log(user.friendRequests);
        res.send(user.friendRequests);
    }
    catch (err) {
        console.log(err, "at get friend requests");
    }
});

router.post("/:userId/friend-requests", async (req, res) => { // accept friend requests
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        const { friends } = req.body;

        for (let fid of friends) {
            const f = await User.findById(fid);
            user.friendRequests = user.friendRequests.filter(id => {
                return (String(id) !== String(fid));
            });
            f.friends.push(user._id);
            user.friends.push(f._id);
            await f.save();
        }

        console.log(user.friendRequests);
        await user.save();
        res.send({ status: "accepted" });
    }
    catch (err) {
        console.log(err, "at get friend requests");
    }
});

router.get("/:id/submissions/", async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("submissions");
    console.log("inside submissions");
    res.send({ subs: user.submissions });
});


// router.get("/:id/chat", async(req, res)=>{
//     const {id} = req.params;
//     const user = await User.findById(id).populate("friends");
//     res.json(user.friends);
// })


// router.post("/:id/chat", async (req, res) => {
//     try {
//         const {id} = req.params;
//         const user = await User.findById(id);
//         let members = req.body.friends;
//         if(req.body.friends.length != 2){
//             res.send("Please select two friends!!\nIf you do not have two friends , please add using Friend Request.")
//         }
//         members.push(user._id);
//         const chat = new Chat({
//             member_count: 3,
//             authorized_users: [...members],
//         });

//         await chat.save();
//         user.chatid = chat._id;
//         await user.save();

//         await user.populate("friends");
//         members = user.friends;

//         for (let f of members) {
//             f.chatid = chat._id;
//             await f.save();
//         }

//         res.redirect(`/user/${user._id}/room/${chat._id}`);
//     }
//     catch (err) {
//         console.log(err);
//         res.status(500).json({ msg: err });
//     }
// })

router.get("/:id/room/:teamId", async (req, res) => {
    const { id, teamId } = req.params;

    const team = await Team.findById(teamId);
    const chat = await Chat.findById(team.chatId);
    const user = await User.findById(id);
    // console.log("auth users : ", chat.authorized_users, user._id);
    if (chat.authorized_users.some(u => String(u) === String(user._id))) {
        res.render("chat/room", { user, chatId: team.chatId });
    }
    else {
        res.send("Your're not authorized to enter this chat room");
    }
});


// chat code

const socketChat = (ioChat) => {

    ioChat.use(async (socket, next) => {
        if (socket.request.user) {
            next();
        }
        else {
            const cookies = cookie.parse(socket.request.headers.cookie);
            var token = cookies.jwt;
            if (token) {
                token = jwt.decode(token);
                const user = await User.findById(token.id);
                socket.request.user = user;
            }
            next();
        }
    });

    ioChat.on('connect', async (socket) => {
        // console.log(`new connection ${socket.id}`);
        // socket.on('whoami', (cb) => {
        //     cb(socket.request.user ? socket.request.userCon.name : '');
        // });

        const userCon = socket.request.user; // connected user
        const team = await Team.findById(userCon.curTeam);
        const chatid = String(team.chatId);
        console.log(chatid);
        const chat = await Chat.findById(chatid).populate({
            path: "messages",
            populate: {
                path: "author",
            },
        });

        socket.join(chatid);
        if (!chat.online.some(name => name === userCon.name)) chat.online.push(userCon.name);
        await chat.save();

        ioChat.to(chatid).emit("online", chat.online);
        socket.emit("hello", "Connected");
        socket.emit("initialize-chat", chat);

        socket.on("disconnecting", async (socket) => {
            chat.online = chat.online.filter(name => name !== userCon.name);
            await chat.save();
            ioChat.to(chatid).emit("online", chat.online);
            ioChat.to(socket.id).emit("hello", "Disconnected");// 2
        });

        socket.on("disconnect", (socket) => {

        })

        socket.on('chat message', async (msg, user, time) => {
            const message = new Message({
                author: userCon._id,
                content: msg,
                "time": time,
            });
            await message.save();
            chat.messages.push(message._id);
            await chat.save();

            console.log(socket.rooms);
            console.log(chatid, user);
            ioChat.to(chatid).emit("chat message", msg, user, time);
        });

        socket.on('typing', (user, len) => {
            socket.to(chatid).emit("typing", user, len);
        });


        socket.on("chat images", async (msg, user, time) => {
            for (let m of msg) {
                const message = new Message({
                    author: userCon._id,
                    data: {
                        name: m.name,
                        img: m.b64,
                    },
                    "time": time,
                });
                await message.save();
                chat.messages.push(message._id);
                await chat.save();
            }
            ioChat.to(chatid).emit("chat images", msg, user, time);
            console.log("ehllo");
        })
    });
}

module.exports = { userRoutes: router, socketChat };