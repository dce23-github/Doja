const express = require("express");
const Chat = require("../models/Chat");
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
        user.friends.length = 0;
        const friends = req.body.friends;

        const fdocs = [];
        for (let f of friends) {
            const doc = await User.findById(f);
            console.log(doc);
            if (!user.friends.some(id => String(id) == String(f))) user.friends.push(f);
            fdocs.push(doc);
        }

        for (let d1 of fdocs) {
            if (!d1.friends.some(f => f == id)) d1.friends.push(id);
            for (let d2 of fdocs) {
                if (d1._id != d2._id) {
                    if (!d1.friends.some(f => f == d2._id)) d1.friends.push(d2._id);
                }
            }
            await d1.save();
        }

        await user.save();
        res.json({ user: user.friends });
    }
    catch (err) {
        console.log(err, "at userRoutes");
    }
})

router.get("/:id/chat", async(req, res)=>{
    const {id} = req.params;
    const user = await User.findById(id).populate("friends");
    res.json(user.friends);
})


router.post("/:id/chat", async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        let members = req.body.friends;
        if(req.body.friends.length != 2){
            res.send("Please select two friends!!\nIf you do not have two friends , please add using Friend Request.")
        }
        members.push(user._id);
        const chat = new Chat({
            member_count: 3,
            authorized_users: [...members],
        });
        
        await chat.save();
        user.chatid = chat._id;
        await user.save();

        await user.populate("friends");
        members = user.friends;

        for (let f of members) {
            f.chatid = chat._id;
            await f.save();
        }

        res.redirect(`/user/${user._id}/room/${chat._id}`);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
    }
})

router.get("/:id/room/:chatid", async (req, res) => {
    const { id, chatid } = req.params;
    const chat = await Chat.findById(chatid).populate("authorized_users");
    const user = await User.findById(id);
    if (chat.authorized_users.some(u => u.userHandle === user.userHandle)) {
        res.render("chat/room", { user, chatid });
    }
    else {
        res.send("Your're not authorized mf");
    }
});


// chat code

const socketCreate = (io) => {

    io.use(async (socket, next) => {
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

    io.on('connect', async (socket) => {
        console.log(`new connection ${socket.id}`);
        // socket.on('whoami', (cb) => {
        //     cb(socket.request.user ? socket.request.userCon.name : '');
        // });

        const userCon = socket.request.user; // connected user
        const chatid = String(userCon.chatid);
        const chat = await Chat.findById(userCon.chatid).populate({
            path: "messages",
            populate: {
                path: "author",
            },
        });

        socket.join(chatid);
        if (!chat.online.some(name => name === userCon.name)) chat.online.push(userCon.name);
        await chat.save();

        io.to(chatid).emit("online", chat.online);
        socket.emit("hello", "you are online");
        socket.emit("initialize-chat", chat);

        socket.on("disconnecting", async (socket) => {
            chat.online = chat.online.filter(name => name !== userCon.name);
            await chat.save();
            io.to(chatid).emit("online", chat.online);
            io.to(socket.id).emit("hello", "you are offline");// 2
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
            io.to(chatid).emit("chat message", msg, user, time);
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
            io.to(chatid).emit("chat images", msg, user, time);
            console.log("ehllo");
        })
    });
}

module.exports = { userRoutes: router, socketCreate };