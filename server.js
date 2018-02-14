// Setup basic express server
var server = require('http').createServer();
var io = require('socket.io')(server);

var rm = new RoomManager();

io.on('connection', function (socket) {
    query = socket.handshake.query;
    var room = rm.addRoom(query['room']);
    var user = new User(query['name'], socket);
    
    room.addUser(user);
    socket.join(room.name);

    console.log(room.users);
    console.log(' log: users in room: ' + JSON.stringify(room.users));
    socket.emit('init',JSON.stringify(room));


    socket.broadcast.to(room.name).emit('user-created', user);

    socket.on('object-modified',function(object){
        room.objects[object.id] = object.properties;
        socket.broadcast.to(room.name).emit('object-modified', object);
    });
    socket.on('object-created',function(object){
        room.objects[object.id] = object.properties;
        console.log(room.objects);
        socket.broadcast.to(room.name).emit('object-created', object);
    });
    socket.on('object-removed',function(object){
        delete room.objects[object.id];
        socket.broadcast.to(room.name).emit('object-removed', object);
    });

    socket.on('disconnect', function () {
        socket.broadcast.to(room.name).emit('user-removed', user);

        socket.leave(room.name);
        room.removeUser(socket.id);
    });
});

server.listen(3000);




function User(name, socket){
    this.name = name;
    this.id = socket.id;
}

function Message(from, to, text) {
    this.from = from;
    this.to = to;
    this.text = text;
    dt = new Date();
    this.time = dt.toLocaleTimeString();
}

function Room(name) {
    this.name = name;
    this.users = [];
    this.messages = [];
    this.objects = [];
    this.canvas = {};

    this.isEmpty = function () {
        return this.users.length <= 0;
    };

    this.addUser = function(user){
        this.users[user.id] = user;
        console.log("+ user "+user.name+"("+user.id+") added");
    };

    this.removeUser = function(id){
        if(this.users[id] === undefined) return;

        delete this.users[id];
        console.log("- user "+id+" deleted");

        if(this.isEmpty())
            rm.removeRoom(this.name);
    };



    this.addObject = function(obj){
        this.objects[obj.id] = obj;
    };
    this.removeObject = function (obj) {
        delete this.objects[obj.id];
    };
    this.modifyObject = function (obj) {
        this.objects[obj.id] = obj;
    };
    this.isSelectable = function (id) {
        return this.object[id].selectable;
    };
    this.setSelectable = function (id, selectable) {
        this.objects[id].selectable = selectable;
    }


}

function RoomManager() {
    this.rooms = [];

    this.isEmpty = function () {
        return this.rooms.length <= 0;
    };

    this.getRoom = function (name) {
        return this.rooms[name];
    };

    this.addRoom = function (name) {
        room = this.getRoom(name);
        if (room === undefined){
            room = new Room(name);
            this.rooms[name] = room;
            console.log("+ room "+name+" added");

        }
        return room;
    };

    this.removeRoom = function (name) {
        delete this.rooms[name];
        console.log("- room "+name+" deleted");
    }
}