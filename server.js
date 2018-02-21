// Setup basic express server
var server = require('http').createServer();
var io = require('socket.io')(server);
server.listen(3000);

var rm = new RoomManager();

io.on('connection', function (socket) {
    query = socket.handshake.query;
    room = rm.createRoom(query['room']);
    user = new User(query['name'], socket);

    socket.join(room.name);

    socket.emit('init',room);

    room.createUser(user);



    socket.on('message-created',function(message){
        room.createMessage(message.text, user.name, '*');
    });

    socket.on('canvas-modified', function (properties) {
        room.modifyCanvas(properties);
        socket.broadcast.to(room.name).emit('canvas-modified', room.canvas);
    });

    // socket.on('selection-changed',function(id){
    //     if(room.isSelectable(id)){
    //         room.setSelectable(id, false, user.id);
    //         socket.broadcast.to(room.name).emit('selection-created', id);
    //     }
    //     else{
    //         socket.emit('selection-deny',id);
    //     }
    // });
    //
    // socket.on('selection-removed',function(id){
    //     if(room.getSelectedBy(id) !== user.id){
    //         socket.emit('selection-deny',id);
    //     }
    //     room.setSelectable(id, true, user.id);
    //     socket.broadcast.to(room.name).emit('selection-removed', id);
    // });
    socket.on('selection-changed',function(data){
        if(room.setSelectable(data.id, data.selectable, user.id)){
            socket.broadcast.to(room.name).emit('selection-changed', {id:data.id, selectable:data.selectable});
        }
        else{
            socket.emit('selection-deny',data.id);
        }
    });

    socket.on('object-modified',function(object){
        room.modifyObject(object);
        socket.broadcast.to(room.name).emit('object-modified', object);
    });
    socket.on('object-created',function(object){
        room.createObject(object);
        socket.broadcast.to(room.name).emit('object-created', object);
    });
    socket.on('object-removed',function(id){
        room.removeObject(id);
        socket.broadcast.to(room.name).emit('object-removed', id);
    });

    socket.on('disconnect', function () {
        socket.broadcast.to(room.name).emit('user-removed', user);

        socket.leave(room.name);
        room.removeUser(socket.id);
    });
});





function User(name, socket){
    this.id = socket.id;
    this.name = name;
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
    this.objects = {};
    this.canvas = {};
    this.loaded = false;
    this.file = {};

    this.isEmpty = function () {
        return Object.keys(this.users).length <= 0;
    };

    this.createUser = function(user){
        this.users[user.id] = user;
        console.log("+ user "+user.name+"("+user.id+") added");
        this.createMessage('User '+user.name+' connected', 'SYSTEM', '*', 'system');

        io.in(this.name).emit('user-created', this.users[user.id]);
    };

    this.removeUser = function(id){
        if(this.users[id] === undefined) return;

        this.createMessage('User '+this.users[id].name+' disconnected', 'SYSTEM', '*', 'system');
        io.in(this.name).emit('user-removed', id);

        delete this.users[id];
        console.log("- user "+id+" deleted");

        if(this.isEmpty())
            rm.removeRoom(this.name);
    };

    this.createMessage = function(text, from, to, type)
    {
        message = new Message(text, from, to, type);
        this.messages.push(message);
        io.in(this.name).emit('message-created', message);
        // socket.broadcast.to(this.name).emit('message-created', message);
    };


    this.modifyCanvas = function (properties) {
        this.canvas.height = properties.height;
        this.canvas.width = properties.width;
        this.canvas.backgroundColor = properties.backgroundColor;
    };

    this.createObject = function(obj){
        this.objects[obj.id] = obj;

    };
    this.removeObject = function (id) {
        delete this.objects[id];
    };
    this.modifyObject = function (obj) {
        obj.selectable = this.isSelectable(obj.id)
        this.objects[obj.id] = obj;
    };
    this.isSelectable = function (id) {
        if(this.objects[id] === undefined)
            return false;
        return this.objects[id].selectable;
    };
    this.getSelectedBy = function (id) {
        if(this.objects[id] === undefined)
            return undefined;
        return this.objects[id].selectedBy;
    };
    this.unselectObject = function(id, user){
        if(this.getSelectedBy(id) !== user.id)
            return false;
        else{
            this.objects[id].selectable = true;
            this.objects[id].selectedBy = undefined;
            return true;
        }
    };
    this.selectObject = function(id, user){
        if(!this.isSelectable(id))
            return false;
        else{
            this.objects[id].selectable = false;
            this.objects[id].selectedBy = user.id;
            return true;
        }
    };

    this.setSelectable = function (id, selectable, user) {
        if(selectable){
            return this.unselectObject(id, user);
        }
        else{
            return this.selectObject(id, user);
        }
    };

    this.findObjectById = function(id){
        return this.objects.filter(function (obj) {
            return obj.id === id;
        })
    };
    this.loadFileInfo = function () {
        //TODO: load file info from api
        this.file = {
            "size": 1556,
            "width": 512,
            "height": 512,
            "url": "http://wiki.localhost/images/2/25/SVG_Test.svg",
            "descriptionurl": "http://wiki.localhost/index.php/File:SVG_Test.svg",
            "descriptionshorturl": "https://commons.wikimedia.org/w/index.php?curid=1895005"
        };
        // this.canvas.height = file.height;
        // this.canvas.width = file.width;
        return this.file;
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

    this.createRoom = function (name) {
        room = this.getRoom(name);
        if (room === undefined){
            room = new Room(name);
            this.rooms[name] = room;
            console.log("+ room "+name+" added");
            room.loadFileInfo();
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