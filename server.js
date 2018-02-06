// Setup basic express server
var server = require('http').createServer();
var io = require('socket.io')(server);

var rm = new RoomManager();

io.on('connection', function (socket) {
    query = socket.handshake.query;
    room = rm.addRoom(query['room']);
    user = new User(query['name'], socket);
    
    room.addUser(user);
    socket.join(room.name);

    // socket.on('', function (data) {
    //
    // });
    //

    socket.on('disconnect', function () {
        socket.leave(room.name);
        room.removeUser(socket.id);
    });
});

server.listen(3000);




function User(name, socket){
    this.name = name;
    this.socket = socket;
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