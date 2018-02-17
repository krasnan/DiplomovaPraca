// Setup basic express server
var server = require('http').createServer();
var io = require('socket.io')(server);
server.listen(3000);

var rm = new RoomManager();

io.on('connection', function (socket) {
    query = socket.handshake.query;
    room = rm.addRoom(query['room']);
    user = new User(query['name'], socket);

    socket.join(room.name);

    socket.emit('init',room);
    room.addUser(user);

    // socket.broadcast.to(room.name).emit('user-created', user);
    socket.on('message-created',function(message){
        console.log(message);
        room.addMessage(message.text, user.name, '*');
        socket.broadcast.to(room.name).emit('message-created', message);
    });

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





function User(name, socket){
    this.name = name;
    this.id = socket.id;
    this.color = getRandomColor();
}

function Message(text, from, to, type) {
    this.from = from;
    this.to = to;
    this.text = text;
    this.type = type;
    dt = new Date();
    this.time = dt.toLocaleTimeString();
}

function Room(name) {
    this.name = name;
    this.users = {};
    this.messages = [];
    this.objects = [];
    this.canvas = {};

    this.isEmpty = function () {
        return Object.keys(this.users).length <= 0;
    };

    this.addUser = function(user){
        this.users[user.id] = user;
        console.log("+ user "+user.name+"("+user.id+") added");
        this.addMessage('User '+user.name+' connected', 'SYSTEM', '*', 'system');

        io.in(this.name).emit('user-created', this.users[user.id]);
    };

    this.removeUser = function(id){
        if(this.users[id] === undefined) return;

        this.addMessage('User '+this.users[id].name+' disconnected', 'SYSTEM', '*', 'system');
        io.in(this.name).emit('user-removed', id);

        delete this.users[id];
        console.log("- user "+id+" deleted");

        if(this.isEmpty())
            rm.removeRoom(this.name);
    };

    this.addMessage = function(text, from, to, type)
    {
        message = new Message(text, from, to, type);
        this.messages.push(message);
        io.in(this.name).emit('message-created', message);
        // socket.broadcast.to(this.name).emit('message-created', message);
    };


    this.addObject = function(obj){
        this.objects.push(obj);
    };
    this.removeObject = function (obj) {
        var index = this.objects.findIndex(o => o.id === obj.id);
        delete this.objects[index];
    };
    this.modifyObject = function (obj) {
        var index = this.objects.findIndex(o => o.id === obj.id);
        this.objects[index] = obj;
    };
    this.isSelectable = function (id) {
        var index = this.objects.findIndex(o => o.id === id);
        return this.object[index].selectable;
    };
    this.setSelectable = function (id, selectable) {
        var index = this.objects.findIndex(o => o.id === obj.id);
        this.objects[index].selectable = selectable;
    };
    this.findObjectById = function(id){
        return this.objects.filter(function (obj) {
            return obj.id === id;
        })
    }


}

function RoomManager() {
    this.rooms = [];

    this.isEmpty = function () {
        return Object.keys(this.rooms).length <= 0;
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

function getRandomColor() {
    var letters = '0123456789ABCD'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 10)];
    }
    return color;
}

Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};