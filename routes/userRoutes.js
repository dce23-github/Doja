const express = require("express");
const Chat = require("../models/Chat");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cookieParser = require("cookie-parser");
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
    const { id } = req.params;
    const user = await User.findById(id);
    const friends = req.body.friends;

    const fdocs = [];
    for (let f of friends) {
        const doc = await User.findById(f);
        if (!user.friends.some(id => id == f)) user.friends.push(f);
        fdocs.push(doc);
    }

    for (let d1 of fdocs) {
        if (!d1.friends.some(id => id == f)) d1.friends.push(id);
        for (let d2 of fdocs) {
            if (d1._id != d2._id) {
                if (!user.friends.some(id => id == f)) d1.friends.push(d2._id);
            }
        }
        await d1.save();
    }

    await user.save();
    res.json({ user: user.friends });
})


router.get("/:id/chat", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate("friends");
        const members = user.friends;

        const chat = new Chat({
            member_count: 3,
            authorized_users: [...members],
        });

        user.chatid = chat._id;
        await user.save();
        await chat.save();

        for (let f of members) {
            f.chatid = chat._id;
            await f.save();
        }

        res.send("chat created");
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
        const chat = await Chat.findById(userCon.chatid);

        if (!chat.online.some(name => name === userCon.name)) chat.online.push(userCon.name);
        await chat.save();
        io.emit("online", chat.online);
        socket.emit("hello", "you are online");

        socket.on("disconnecting", async(socket)=> {
            chat.online = chat.online.filter(name => name !== userCon.name);
            await chat.save();
            io.emit("online", chat.online);
            io.to(socket.id).emit("hello", "you are offline");// 2
        });

        socket.on("disconnect", (socket)=>{
            
        })

        socket.on('chat message', (msg, user) => {
            io.emit('chat message', msg, user);
        });

        socket.on('typing', (user, len) => {
            socket.broadcast.emit("typing", user, len);
        });
    });
}

module.exports = { userRoutes: router, socketCreate };