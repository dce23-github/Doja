const express = require("express");
const router = express.Router();


router.get("/:id", (req, res) => {
  
  const { id } = req.params;
  try {
    res.render("editor/codeEditor", { roomId: id });
  }
  catch (err) {
    console.log("Error creating room : ", err);
  }
})


const hashId = {};
const rooms = {}; // roomdId : [] // array of peerIds in the roomId

socketEditor = (ioEditor) => {
  ioEditor.on("connect", async (socket) => {
    // console.log("new Connection : ", socket.id);
    const socketId = socket.id;
    let socketPeerId;
    let socketRoomId;
    socket.join("Coderoom");
    socket.on("message", (peerId, myPeerId, msg, type) => {
      const toId = hashId[peerId];
      if (toId !== undefined)
        socket.to(toId).emit("message", myPeerId, msg, type);
    });

    socket.on("joinRoom", (peerId, roomId) => {
      hashId[peerId] = socketId;
      socketPeerId = peerId;
      socketRoomId = roomId;

      socket.join(roomId);
      if (rooms[roomId] === undefined) rooms[roomId] = [];
      rooms[roomId].push(peerId);
      // console.log(rooms[roomId]);

      // const sids = io.sockets.adapter.rooms.get(roomId);
      const ids = [];
      for (let pid of rooms[roomId]) {
        ids.push(pid);
      }
      // console.log(ids);
      socket.emit("joinedRoom", ids);

      socket.to(roomId).emit("newConnection", peerId);
    });

    socket.on("disconnected", () => {
      // console.log("disconnected : ", id);
      hashId[socketPeerId] = undefined;
      rooms[socketRoomId] = rooms[socketRoomId].filter(pid => pid !== socketPeerId);
      socket.emit("disconnected", socketPeerId);
    });

  })

}

module.exports = { editorRoutes: router, socketEditor };