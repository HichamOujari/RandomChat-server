const express = require("express");
const { emit } = require("process");
const app = express()
const http = require("http").Server(app)
const PORT = process.env.PORT 
//const PORT = 4000;
const io = require('socket.io')(http,{
    cors: {
      origin: "https://myrandchat.herokuapp.com",
      //origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })
var count=0;
var Rooms=[];
function addRoom(data) {
  var nbr = Rooms.length;
  for(i=nbr-1;i>=0;--i){
    if(Rooms[i].id1==" "){
      Rooms[i].id1=data.id;
      Rooms[i].name1=data.name;
      Rooms[i].peerid1=data.peerid;
      io.to(Rooms[i].id2).emit("couser",data);
      io.to(Rooms[i].id1).emit("couser",{id:Rooms[i].id2,name:Rooms[i].name2,peerid:Rooms[i].peerid2});
      return 1;
    }if(Rooms[i].id2==" "){
      Rooms[i].id2=data.id;
      Rooms[i].name2=data.name;
      Rooms[i].peerid2=data.peerid;
      io.to(Rooms[i].id1).emit("couser",data);
      io.to(Rooms[i].id2).emit("couser",{id:Rooms[i].id1,name:Rooms[i].name1,peerid:Rooms[i].peerid1});
      return 1;
    }
  }
  Rooms.push({id1:data.id,name1:data.name,peerid1:data.peerid,id2:" ",name2:" ",peerid2:" "});
  return 1;
}

function clean() {
  for(k=0;k<Rooms.length;k++){
    if(Rooms[k].id2=="occuped" && Rooms[k].id1=="occuped" ){
      Rooms.splice(k,1);
      nbr = Rooms.length;
    }else if(Rooms[k].id2==" " && Rooms[k].id1=="occuped"){
      Rooms.splice(k,1);
      nbr = Rooms.length;
    }else if(Rooms[k].id2=="occuped" && Rooms[k].id1==" "){
      Rooms.splice(k,1);
      nbr = Rooms.length;
    }
  }
}

function exite(id) {
  for(j=0;j<Rooms.length;j++){
    if(Rooms[j].id1===id){
      Rooms[j].id1="occuped";
      io.to(Rooms[j].id2).emit("exited");
      clean();
      return 1;
    }
    if(Rooms[j].id2===id){
      Rooms[j].id2="occuped";
      io.to(Rooms[j].id1).emit("exited");
      clean();
      return 1;
    }
  }
  return 0;
}
io.on('connection',socket =>{
    count++;
    io.emit('count',count);
    socket.on("mydata",data=>{
      addRoom({id:socket.id,name:data.name,peerid:data.peerid});
      io.to(socket.id).emit("mydata",socket.id)
    })
    socket.on("new_msg",data=>{
      io.to(data.to).emit("new_msg",data);
    })
    socket.on("skip",(data)=>{
      exite(socket.id);
      addRoom({id:socket.id,name:data.name,peerid:data.peerid})
    })
    socket.on('disconnect',() =>{
      --count;
      exite(socket.id);
      io.emit('count',count);
    })
  })
http.listen(PORT,()=>{
    console.log("listening on port : ",PORT)
})
