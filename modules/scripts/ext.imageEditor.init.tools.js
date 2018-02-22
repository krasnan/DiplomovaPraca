function uniqueId(){
    return Math.random().toString(36).substr(2, 16);
}

function initTools($scope, socket, canvas, $timeout){
    console.log($scope.serverUrl);



    $scope.tools={
        select : 'select',
        brush : 'brush',
        line : 'line',
        rectangle : 'rectangle',
        circle : 'circle',
        polygon : 'polygon',
        text : 'text',
        image : 'image'
    };
    $scope.panels = {};

    $scope.activeTool = $scope.tools.select;
    $scope.backgroundColor = 'rgba(0,0,0,0)';
    $scope.fillColor = 'rgba(0,0,0,1)';
    $scope.strokeColor = 'rgba(255,255,255,0)';
    $scope.message = "";

    $scope.setActiveTool = function(tool){
        $scope.activeTool = tool;
        canvas.isDrawingMode = ($scope.activeTool == $scope.tools.brush);
        console.log($scope.serverUrl);
    };

    $scope.getStrokeColor = function(){
        if(canvas.getActiveObject())
            return $scope.getStroke();
        else return $scope.strokeColor;

    };
    $scope.setStrokeColor = function(value){
        if(canvas.getActiveObject())
            $scope.setStroke(value);
        else $scope.strokeColor = value;

    };
    $scope.getFillColor = function(value){
        if(canvas.getActiveObject())
            return $scope.getFill(value);
        else return $scope.fillColor;

    };
    $scope.setFillColor = function(value){
        if(canvas.getActiveObject())
            $scope.setFill(value);
        else $scope.fillColor = value;

    };
    $scope.deleteSelection = function(){
        var objects = canvas.getActiveObjects();
        if(objects.length > 0){
            $scope.panels.modal = {
                opened:true,
                header: "Delete items?",
                text: "Do you want to delete selected items?",
                successText: "Delete",
                cancelText: "Cancel",
                success: function () {
                    objects.forEach(function (object) {
                        canvas.trigger('object:removed',{target:object});
                        canvas.remove(object);
                    });
                    canvas.discardActiveObject();
                },
                cancel: function () {
                }
            };
        }
    };
    $scope.deleteObject = function (object) {
        $scope.panels.modal = {
            opened: true,
            header: "Delete " + object.type + "?",
            text: "Do you want to delete " + object.type + "(" + object.id + ") object?",
            successText: "Delete",
            cancelText: "Cancel",
            success: function () {
                canvas.remove(object);
                canvas.trigger('object:removed', {target: object});
            },
            cancel: function () {
            }
        }
    };

    $scope.selectObject = function (object) {
        canvas.setActiveObject(object);
    };

    $scope.rasterize = function(e, filename) {
        if (!fabric.Canvas.supports('toDataURL')) {
            alert('This browser doesn\'t provide means to serialize canvas to an image');
        }
        else {
            var elem = angular.element(e.currentTarget )[0];
            elem.href = canvas.toDataURL();
            elem.download = filename;
        }
    };

    $scope.rasterizeSVG = function(e, filename) {
        var elem = angular.element(e.currentTarget )[0];
        elem.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(canvas.toSVG());
        elem.download = filename;
    };

    $scope.copy = function(){
        canvas.getActiveObject().clone(function(cloned) {
            $scope._clipboard = cloned;
        });
    };

    $scope.paste = function () {
        // clone again, so you can do multiple copies.
        $scope._clipboard.clone(function(clonedObj) {
            canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 10,
                top: clonedObj.top + 10,
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                // active selection needs a reference to the canvas.
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(function(obj) {
                    obj.id = uniqueId();
                    canvas.add(obj);
                });
                // this should solve the unselectability
                clonedObj.setCoords();
            } else {
                clonedObj.id = uniqueId();
                canvas.add(clonedObj);
            }
            $scope._clipboard.top += 10;
            $scope._clipboard.left += 10;
            canvas.setActiveObject(clonedObj);
            canvas.requestRenderAll();
        });
    };

    $scope.duplicate = function () {
        $scope.copy();
        $scope.paste();
    };

    $scope.cut = function () {
        $scope.copy();
        $scope.deleteSelection();
    };


    var obj=null, isDown=false, origX=0, origY=0;

    canvas.on('mouse:down', function(o){
        var pointer = canvas.getPointer(o.e);
        origX = pointer.x;
        origY = pointer.y;
        var pointer = canvas.getPointer(o.e);
        switch($scope.activeTool) {
            case $scope.tools.line:
                obj = createLine(pointer);
                break;
            case $scope.tools.rectangle:
                obj = createRectangle(pointer);
                break;
            case $scope.tools.circle:
                obj = createCircle(pointer);
                break;
            case $scope.tools.text:
                obj = createText(pointer);
                break;
            case $scope.tools.polygon:
                //code block
                break;
            case $scope.tools.image:
                //code block
                break;

            default:
                return false;
        }
        if( obj!= null ){
            canvas.add(obj);
            canvas.trigger('object:created',{target:obj});
        }
        isDown = true;
    });


    canvas.on('mouse:move', function(o){
        if ( !isDown ) return;
        var pointer = canvas.getPointer(o.e);

        if ( obj != null ){
            switch (obj.get('type')){
                case 'rect':
                    if(origX>pointer.x)
                        obj.set({ left: Math.abs(pointer.x) });
                    if(origY>pointer.y)
                        obj.set({ top: Math.abs(pointer.y) });
                    obj.set({ width: Math.abs(origX - pointer.x) });
                    obj.set({ height: Math.abs(origY - pointer.y) });
                    break;

                case 'circle':
                    obj.set({ radius: Math.abs(origX - pointer.x) });
                    break;

                case 'line':
                    obj.set({ x2: pointer.x, y2: pointer.y });
                    break;


                default:
                    return;
            }
        }
        canvas.renderAll();
    });

    canvas.on('mouse:up', function(o){
        if( !isDown ) return;
        if( obj != null ){
            canvas.trigger('object:modified',{target:obj});
            // canvas.trigger('object:created',{target:obj});
            obj.setCoords();
            $scope.activeTool = $scope.tools.select;
        }
        isDown = false;
        obj = null;
    });

    function createRectangle(pointer) {
        return new fabric.Rect({
            id: uniqueId(),
            left: origX,
            top: origY,
            originX: 'left',
            originY: 'top',
            width: pointer.x-origX,
            height: pointer.y-origY,
            angle: 0,
            fill: $scope.fillColor
        });
    }

    function createCircle(pointer) {
        return new fabric.Circle({
            id: uniqueId(),
            left: origX,
            top: origY,
            radius: 50,
            fill: $scope.fillColor,
            originX: 'center', originY: 'center'
        })
    }

    function createLine(pointer) {
        return new fabric.Line([pointer.x, pointer.y,pointer.x, pointer.y], {
            id: uniqueId(),
            strokeWidth: 5,
            fill: $scope.fillColor,
            stroke: $scope.strokeColor,
            originX: 'center', originY: 'center'
        });
    }

    function createText(pointer) {
        return  new fabric.Textbox('Insert your text...', {
            id: uniqueId(),
            left: origX,
            top: origY,
            fill: $scope.fillColor,
            fontFamily: 'helvetica',
            originX: 'left'
        });
    }

    $scope.toggleFullScreen = function() {
        if ((document.fullScreenElement && document.fullScreenElement !== null) ||
            (!document.mozFullScreen && !document.webkitIsFullScreen)) {
            if (document.documentElement.requestFullScreen) {
                document.documentElement.requestFullScreen();
                $scope.isFullscreen=true;
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
                $scope.isFullscreen=true;
            } else if (document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                $scope.isFullscreen=true;
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
                $scope.isFullscreen=false;
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
                $scope.isFullscreen=false;
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
                $scope.isFullscreen=false;
            }
        }
    };

    function addObject(object) {
        type  = fabric.util.string.camelize(fabric.util.string.capitalize(object.type));
        var obj = new fabric[type](object);
        obj.id = object.id;
        canvas.add(obj);
        return obj;
    }
    $scope.scrollDown = function(elementClass){
        $timeout(function() {
            var scroller = document.getElementsByClassName(elementClass);
            scroller[0].scrollTop = scroller[0].scrollHeight;
        }, 100, false);
    };

    $scope.sendMessage = function(){
        if($scope.message === "") return;
        socket.emit('message-created', {text:$scope.message});
        $scope.message = "";
        $scope.scrollDown('ie__messenger__messages');
    };

    $scope.getLayers = function () {
        return canvas._objects;
    };


    // ------------ Socket event listeners - END ------------


    socket.on('init', function (data) {
        console.log('SOCKET: init');

        $scope.room = data.room;
        $scope.user = data.user;

        console.log($scope.room);

        if(!$scope.room.loaded){
            console.log(fabric);
            
            // fabric.loadSVGFromURL($scope.room.url, function (objects, options) {
            //     console.log(objects);
            // });
            // var str = '';
            //
            // fabric.loadSVGFromString("", function (objects, options) {
            //     console.log(objects);
            // })
        }

        for (let key in $scope.room.objects) {
            if ($scope.room.objects.hasOwnProperty(key)){
                let obj = addObject($scope.room.objects[key]);
                $scope.room.objects[key] = obj;
            }
        }
        for (let key in $scope.room.objects) {
            if ($scope.room.objects.hasOwnProperty(key)) {
                let obj = $scope.room.objects[key];
                obj.moveTo(obj.index);
            }
        }
    });

    socket.on('user-created', function (user) {
        console.log('SOCKET: user-created');
        $scope.room.users[user.id] = user;
    });
    socket.on('user-removed', function (id) {
        console.log('SOCKET: user-removed');
        delete $scope.room.users[id];
    });

    socket.on('message-created', function (message) {
        console.log('SOCKET: message-created');
        console.log(message);
        $scope.room.messages.push(message);
        $scope.room.newMessage = true
    });

    socket.on('selection-changed',function(data){
        console.log('SOCKET: selection-changed');
        canvas.getObjectById(data.id).selectable = data.selectable;
    });

    socket.on('selection-deny',function(id){
        console.log('SOCKET: selection-deny');

    });

    socket.on('object-modified', function(obj){
        console.log('SOCKET: object-modified');

        var object = canvas.getObjectById(obj.id);
        if(object !== null){
            object.animate(
                {
                    left: obj.left,
                    top: obj.top,
                    scaleX: obj.scaleX,
                    scaleY: obj.scaleY,
                    angle: obj.angle
                },{
                    duration:500,
                    onChange: function () {
                        object.setCoords();
                        canvas.renderAll();
                    }
                }
            );
            object.set(obj);
        }
        else{
            object = addObject(obj);
        }
        object.moveTo(object.index);

    });

    socket.on('object-created', function (obj) {
        console.log('SOCKET: object-created');

        object = addObject(obj);
        object.setCoords();
        canvas.renderAll();
        object.moveTo(object.index);

    });
    
    socket.on('object-removed', function (id) {
        console.log('SOCKET: object-removed');

        var object = canvas.getObjectById(id);
        console.log(object);
        // object.remove();
        canvas.remove(object);
        canvas.renderAll();
    });

    socket.on('canvas-modified', function(properties){
        canvas.setHeight(parseInt(properties.height, 10));
        canvas.setWidth(parseInt(properties.width, 10));
        canvas.backgroundColor = properties.backgroundColor;
        canvas.renderAll();
    });


    // ------------ Socket event listeners - END ------------



    // ------------ Canvas event listeners - START ------------
    canvas.on('selection:created' , function (event) {
        console.log('CANVAS: selection:created');
        event.selected.forEach(function (obj) {
            socket.emit('selection-changed',{id:obj.id, selectable:false});
        });
    });

    canvas.on('selection:updated' , function (event) {
        console.log('CANVAS: selection:updated');
        event.selected.forEach(function (obj) {
            socket.emit('selection-changed',{id:obj.id, selectable:false});
        });
        event.deselected.forEach(function (obj) {
            socket.emit('selection-changed',{id:obj.id, selectable:true});
        });
    });

    canvas.on('selection:cleared' , function (event) {
        console.log('CANVAS: selection:cleared');
        // console.log(event);
        if(event.deselected === undefined) return;
        event.deselected.forEach(function (obj) {
            socket.emit('selection-changed',{id:obj.id, selectable:true});
        });
    });

    //
    // canvas.on('object:selected' , function (event) {
    //     console.log('CANVAS: object:selected');
    //     // console.log(object);
    //     object = event.target;
    //     // if(object.type === "group"){
    //     //     object.getObjects().forEach(function (obj) {
    //     //         socket.emit('selection-changed',{id:obj.id, selectable:false});
    //     //
    //     //     });
    //     // }
    //     // else{
    //     //     socket.emit('selection-changed',{id:object.id, selectable:false});
    //     //
    //     // }
    // });
    // canvas.on('selection:cleared' , function (event) {
    //     console.log('CANVAS: selection:cleared');
    //     // console.log(object);
    //     object = event.target;
    //     // if(object.type === "group"){
    //     //     object.getObjects().forEach(function (obj) {
    //     //         socket.emit('selection-changed',{id:obj.id, selectable:false});
    //     //
    //     //     });
    //     // }
    //     // else{
    //     //     socket.emit('selection-changed',{id:object.id, selectable:false});
    //     //
    //     // }
    // });
    // canvas.on('before:selection:cleared' , function (event) {
    //     console.log('CANVAS: before:selection:cleared');
    //     object = event.target;
    //     // if(object.type === "group"){
    //     //     object.getObjects().forEach(function (obj) {
    //     //         socket.emit('selection-changed',{id:obj.id, selectable:true});
    //     //     });
    //     // }
    //     // else{
    //     //     socket.emit('selection-changed',{id:object.id, selectable:true});
    //     //
    //     // }
    // });

    canvas.on('object:modified', function (event) {
        console.log('CANVAS: object:modified');

        object = event.target;
        // console.log(object);

        if(object.type === "activeSelection"){
            var group = object;
            for(var i = group._objects.length-1; i>=0; i--){
                obj = group._objects[i];
                obj.index = obj.getIndex();
                group.removeWithUpdate(obj);
                // console.log(obj);
                socket.emit('object-modified',obj.toJSON(['id','selectable', 'index']));
                group.addWithUpdate(obj);
            }
        }
        else{
            object.index = object.getIndex();
            socket.emit('object-modified',object.toJSON(['id','selectable', 'index']));
        }
    });

    canvas.on('object:created', function (event) {
        console.log('CANVAS: object:created');

        var obj = event.target;
        obj.index = obj.getIndex();
        socket.emit('object-created',obj.toJSON(['id','selectable', 'index']));
    });

    canvas.on('object:removed',function (event) {
        console.log('CANVAS: object:removed');

        var obj = event.target;
        socket.emit('object-removed',obj.id);
    });

    canvas.on('canvas:modified', function (event) {
        socket.emit('canvas-modified', {width: canvas.width, height: canvas.height, backgroundColor: canvas.backgroundColor})
    });

    // ------------ Canvas event listeners - END ------------
}



