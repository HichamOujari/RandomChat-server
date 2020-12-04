const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require('socket.io')(http,{
    cors: {
      origin: "https://randomchat-server.herokuapp.com:3000",
      methods: ["GET", "POST"]
    }
  })
var count=0;
var Rooms = [];
function addRoom(id) {
  for(p=0;p<Rooms.length;p++){  
    if(Rooms[p].id1==' '){
      Rooms[p].id1=id;
      io.to(Rooms[p].id2).emit('coId',{id:id,name:"Randomly"})
      io.to(Rooms[p].id1).emit('coId',{id:Rooms[p].id2,name:"Randomly"})
      return ++p;
    }else if(Rooms[p].id2==' '){
      Rooms[p].id2=id;
      io.to(Rooms[p].id1).emit('coId',{id:id,name:"Randomly"})
      io.to(Rooms[p].id2).emit('coId',{id:Rooms[p].id1,name:"Randomly"})
      return ++p;
    }
  }
  Rooms.push({id1:id,id2:" "})
  return Rooms.length;
}

function SuppFroomRoom(id){
  for(p=0;p<Rooms.length;p++){
    if(Rooms[p].id1==id){
      Rooms[p].id1=' ';
      io.to(Rooms[p].id2).emit('exited',"")
    }else if(Rooms[p].id2==id){
      Rooms[p].id2=' ';
      io.to(Rooms[p].id1).emit('exited',"")
    }
    if(Rooms[p].id2==" " && Rooms[p].id1==" "){
      Rooms.splice(p, 1);
    }
  }
}

function exchange(id) {
  SuppFroomRoom(id.id)
  SuppFroomRoom(id.coid)
  addRoom(id.id)
  addRoom(id.coid)
}
io.on('connection',socket =>{
    socket.on('disconnect',() =>{
      --count;
      SuppFroomRoom(socket.id)
      io.emit('count',count)
    })
    count++;
    io.emit('count',count)
    io.to(socket.id).emit('id',socket.id)
    var room = addRoom(socket.id)
    socket.on('new_message',(data)=>{
        if(data.to!==' '){
          io.to(data.to).emit('message',data)
          io.to(data.id).emit('message',data)
        }
    })
    socket.on('skip',(data)=>{
        exchange(data)
    })
  })

http.listen(4000,()=>{
    console.log("listening on port : 4000")
})