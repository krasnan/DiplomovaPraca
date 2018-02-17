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
        var activeObject = canvas.getActiveObject(), activeGroup = canvas.getActiveGroup();
        if (activeObject) {
            canvas.remove(activeObject);
        }
        else if (activeGroup) {
            if (confirm('Are you sure?')) {
                var objectsInGroup = activeGroup.getObjects();
                canvas.discardActiveGroup();
                objectsInGroup.forEach(function(object) {
                    canvas.remove(object);
                    canvas.trigger('object:removed',{target:object});

                });
            }
        }
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
        var object = canvas.getActiveObject();
        var group = canvas.getActiveGroup();


        if(object !== null){
            object.clone(function(cloned){
                $scope._clipboard = cloned;
            })
        }
        else if(group !==null){
            group.clone(function(cloned){
                $scope._clipboard = cloned;
            })
        }
    };

    $scope.paste = function () {
        if($scope._clipboard === undefined) return;
        $scope._clipboard.clone(function(clonedObj) {
            clonedObj.set({
                left: clonedObj.left + 10,
                top: clonedObj.top + 10,
            });

            if (clonedObj.type === "group") {
                //TODO: implement paste operation for objects group
                return
                // canvas.discardActiveGroup();
                // clonedObj.forEachObject(function (obj) {
                //     obj.id = uniqueId();
                //     obj.set('active', true);
                //     canvas.add(obj);
                //     console.log(obj);
                // });
                //canvas.setActiveGroup(clonedObj);
            }

            else {
                canvas.discardActiveObject();
                clonedObj.id = uniqueId();
                canvas.add(clonedObj);
                canvas.trigger('object:created',{target:clonedObj})
            }
            $scope._clipboard.top += 10;
            $scope._clipboard.left += 10;
            canvas.renderAll();
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
        if( obj!= null )
            canvas.add(obj);
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
            obj.setCoords();
            $scope.activeTool = $scope.tools.select;
            canvas.trigger('object:created',{target:obj})
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

    function addObject(id, properties) {
        var object = new fabric[fabric.util.string.camelize(fabric.util.string.capitalize(properties.type))].fromObject(properties);
        object.id = id;
        canvas.add(object);
        return object;
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

    // ------------ Socket event listeners - END ------------

    socket.on('init', function (room) {
        console.log('SOCKET: init');

        $scope.room = room;
        console.log($scope.room);
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
    });


    socket.on('object-modified', function(obj){
        console.log('SOCKET: object-modified');

        var object = canvas.getObjectById(obj.id);
        if(object !== null){
            object.animate(
                {
                    left: obj.properties.left,
                    top: obj.properties.top,
                    scaleX: obj.properties.scaleX,
                    scaleY: obj.properties.scaleY,
                    angle: obj.properties.angle
                },{
                    duration:500,
                    onChange: function () {
                        object.setCoords();
                        canvas.renderAll();
                    }
                }
            );
            object.set(obj.properties);
        }
        else{
            object = addObject(obj.id, obj.properties);
        }
    });

    socket.on('object-created', function (obj) {
        console.log('SOCKET: object-created');

        object = addObject(obj.id, obj.properties);
        object.setCoords();
        canvas.renderAll();
    });
    
    socket.on('object-removed', function (obj) {
        console.log('SOCKET: object-removed');

        var object = canvas.getObjectById(obj.id);
        object.remove();
        canvas.renderAll();
    });




    // ------------ Socket event listeners - END ------------



    // ------------ Canvas event listeners - START ------------
    canvas.on('object:modified', function (event) {
        console.log('CANVAS: object:modified');

        object = event.target;
        // console.log(object);

        if(object.type === "group"){
            var group = object;
            for(var i = group._objects.length-1; i>=0; i--){
                obj = group._objects[i];
                group.removeWithUpdate(obj);
                socket.emit('object-modified',{id:obj.id, properties:obj.toJSON()});
                group.addWithUpdate(obj);
            }
        }
        else{
            socket.emit('object-modified',{id:object.id, properties:object.toJSON()});
        }
    });

    canvas.on('object:created', function (event) {
        console.log('CANVAS: object:created');

        var obj = event.target;
        socket.emit('object-created',{id:obj.id, properties:obj.toJSON()});
    });

    canvas.on('object:removed',function (event) {
        console.log('CANVAS: object:removed');

        var obj = event.target;
        socket.emit('object-removed',{id:obj.id});
    });
    // ------------ Canvas event listeners - END ------------

}


