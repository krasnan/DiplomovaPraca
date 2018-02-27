function uniqueId() {
    return Math.random().toString(36).substr(2, 16);
}

function initTools($scope, socket, canvas, $timeout) {
    // console.log($scope.serverUrl);

    $scope.tools = {
        select: 'select',
        brush: 'brush',
        line: 'line',
        rectangle: 'rectangle',
        circle: 'circle',
        ellipse: 'ellipse',
        triangle: 'triangle',
        polygon: 'polygon',
        text: 'text',
        image: 'image'
    };
    $scope.panels = {};

    // $scope.canvas = canvas;

    $scope.activeTool = $scope.tools.select;
    $scope.backgroundColor = 'rgba(0,0,0,0)';
    $scope.fillColor = 'rgba(0,0,0,1)';
    $scope.strokeColor = 'rgba(0,0,0,1)';
    $scope.message = "";
    $scope.grid = 5;
    $scope.snapToGrid = false;

    $scope.setFreeDrawingBrush = function (type) {
        $scope.brushType = type;
        console.log(type);
        canvas.freeDrawingBrush = new fabric[type + 'Brush'](canvas);
    };

    $scope.selectAllObjects = function () {
        canvas.discardActiveObject();
        var sel = new fabric.ActiveSelection(canvas.getObjects(), {
            canvas: canvas
        });
        canvas.setActiveObject(sel);
        canvas.requestRenderAll();
    };

    $scope.setActiveTool = function (tool) {
        $scope.polygon_edit = false;
        $scope.activeTool = tool;
        if ($scope.activeTool === $scope.tools.brush) {
            canvas.isDrawingMode = true;
            canvas.discardActiveObject();
        }
        else
            canvas.isDrawingMode = false;
    };

    $scope.getStrokeColor = function () {
        if (canvas.getActiveObject())
            return $scope.getStroke();
        else return $scope.strokeColor;

    };
    $scope.setStrokeColor = function (value) {
        if (canvas.getActiveObject())
            $scope.setStroke(value);
        else $scope.strokeColor = value;

        canvas.freeDrawingBrush.strokeColor = value;
    };
    $scope.getFillColor = function (value) {
        if (canvas.getActiveObject())
            return $scope.getFill(value);
        else return $scope.fillColor;

    };
    $scope.setFillColor = function (value) {
        if (canvas.getActiveObject())
            $scope.setFill(value);
        else $scope.fillColor = value;

        canvas.freeDrawingBrush.color = value;
    };
    $scope.deleteSelection = function () {
        var objects = canvas.getActiveObjects();
        if (objects.length > 0) {
            $scope.panels.modal = {
                opened: true,
                header: "Delete items?",
                text: "Do you want to delete selected items?",
                successText: "Delete",
                cancelText: "Cancel",
                success: function () {
                    objects.forEach(function (object) {
                        canvas.trigger('object:removed', {target: object});
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

    $scope.rasterize = function (e, filename) {
        if (!fabric.Canvas.supports('toDataURL')) {
            alert('This browser doesn\'t provide means to serialize canvas to an image');
        }
        else {
            var elem = angular.element(e.currentTarget)[0];
            elem.href = canvas.toDataURL();
            elem.download = filename;
        }
    };

    $scope.rasterizeSVG = function (e, filename) {
        var elem = angular.element(e.currentTarget)[0];
        elem.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(canvas.toSVG());
        elem.download = filename;
    };

    $scope.copy = function () {
        canvas.getActiveObject().clone(function (cloned) {
            $scope._clipboard = cloned;
        });
    };

    $scope.paste = function () {
        // clone again, so you can do multiple copies.
        $scope._clipboard.clone(function (clonedObj) {
            canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 10,
                top: clonedObj.top + 10,
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                // active selection needs a reference to the canvas.
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(function (obj) {
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
            canvas.trigger('object:created', {target: clonedObj});
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


    var obj = null, isDown = false, origX = 0, origY = 0;

    canvas.on('mouse:down', function (o) {
        var pointer = canvas.getPointer(o.e);
        origX = pointer.x;
        origY = pointer.y;
        var pointer = canvas.getPointer(o.e);
        switch ($scope.activeTool) {
            case $scope.tools.line:
                // obj = $scope.createLine(pointer);
                obj = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                    id: uniqueId(),
                    strokeWidth: 5,
                    stroke: $scope.strokeColor,
                    originX: 'center', originY: 'center'
                });
                break;
            case $scope.tools.rectangle:
                obj = new fabric.Rect({
                    id: uniqueId(),
                    strokeWidth: 0,
                    left: origX,
                    top: origY,
                    fill: $scope.fillColor,
                    stroke: $scope.strokeColor
                });
                break;
            case $scope.tools.circle:
                obj = new fabric.Circle({
                    id: uniqueId(),
                    strokeWidth: 0,
                    left: origX,
                    top: origY,
                    radius: 1,
                    fill: $scope.fillColor,
                    stroke: $scope.strokeColor
                });
                break;
            case $scope.tools.ellipse:
                obj = new fabric.Ellipse({
                    id: uniqueId(),
                    strokeWidth: 0,
                    left: origX,
                    top: origY,
                    fill: $scope.fillColor,
                    stroke: $scope.strokeColor
                });
                break;

            case $scope.tools.text:
                obj = new fabric.Textbox('Insert your text...', {
                    id: uniqueId(),
                    left: origX,
                    top: origY,
                    fill: $scope.fillColor,
                    stroke: $scope.strokeColor,
                    fontFamily: 'Arial',
                    // originX: 'left'
                });
                break;

            case $scope.tools.triangle:
                obj = new fabric.Triangle({
                    id: uniqueId(),
                    strokeWidth: 0,
                    left: origX,
                    top: origY,
                    fill: $scope.fillColor,
                    stroke: $scope.strokeColor
                });
                break;
            case $scope.tools.polygon:
                if ($scope.polygon_edit === false) {
                    obj = new fabric.Polygon([{x: origX, y: origY}], {
                        id: uniqueId(),
                        strokeWidth: 0,
                        fill: $scope.fillColor,
                        stroke: $scope.strokeColor,
                        objectCaching: false
                    });
                    $scope.polygon_edit = obj.id;
                }
                else {

                    obj = canvas.getObjectById($scope.polygon_edit);
                    obj.draggable = false;
                    obj.points.push({x: pointer.x, y: pointer.y});
                    tmp = obj.toObject('selectable', 'selectedBy', 'index');
                    delete tmp.top;
                    delete tmp.left;
                    tmp = new fabric.Polygon(tmp.points, tmp);
                    obj.set(tmp);
                    canvas.renderAll();
                    canvas.setActiveObject(obj);
                    canvas.trigger('object:modified', {target: obj});
                    return;
                }

                break;

            default:
                return false;
        }
        if (obj != null) {
            canvas.add(obj);
            canvas.trigger('object:created', {target: obj});
        }
        isDown = true;
    });


    canvas.on('mouse:move', function (o) {
        if (!isDown) return;
        var pointer = canvas.getPointer(o.e);

        if (obj != null) {
            switch (obj.get('type')) {
                case 'rect':
                    if (origX > pointer.x)
                        obj.set({left: Math.abs(pointer.x)});
                    if (origY > pointer.y)
                        obj.set({top: Math.abs(pointer.y)});

                    width = Math.abs((origX - pointer.x));
                    height = Math.abs((origY - pointer.y));
                    if ($scope.shiftPressed) {
                        obj.set({width: Math.max(width, height), height: Math.max(width, height)});
                    }
                    else {
                        obj.set({width: width, height: height});
                    }
                    break;


                case 'circle':
                    x = Math.abs(origX - pointer.x);
                    y = Math.abs(origY - pointer.y);
                    obj.set({radius: Math.max(x, y) / 2});
                    break;

                case 'ellipse':
                    if (origX > pointer.x)
                        obj.set({left: Math.abs(pointer.x)});
                    if (origY > pointer.y)
                        obj.set({top: Math.abs(pointer.y)});

                    rx = Math.abs((origX - pointer.x) / 2);
                    ry = Math.abs((origY - pointer.y) / 2);
                    if ($scope.shiftPressed) {
                        obj.set({rx: Math.max(rx, ry), ry: Math.max(rx, ry)});
                    }
                    else {
                        obj.set({rx: rx, ry: ry});
                    }
                    break;

                case 'line':
                    if ($scope.shiftPressed) {
                        dx = Math.abs(origX - pointer.x);
                        dy = Math.abs(origY - pointer.y);
                        if (dx > dy)
                            obj.set({x2: pointer.x, y2: origY});
                        else
                            obj.set({x2: origX, y2: pointer.y});
                    }
                    else
                        obj.set({x2: pointer.x, y2: pointer.y});

                    break;

                case 'triangle':
                    if (origX > pointer.x)
                        obj.set({left: Math.abs(pointer.x)});
                    if (origY > pointer.y)
                        obj.set({top: Math.abs(pointer.y)});
                    width = Math.abs((origX - pointer.x));
                    height = Math.abs((origY - pointer.y));
                    if ($scope.shiftPressed) {
                        obj.set({width: Math.max(width, height), height: Math.max(width, height)});
                    }
                    else {
                        obj.set({width: width, height: height});
                    }
                    break;


                default:
                    return;
            }
        }
        canvas.renderAll();
    });

    canvas.on('mouse:up', function (o) {
        if (!isDown) return;
        if (obj != null) {
            canvas.trigger('object:modified', {target: obj});
            // canvas.trigger('object:created',{target:obj});
            obj.setCoords();
            if ($scope.activeTool !== $scope.tools.polygon)
                $scope.setActiveTool($scope.tools.select);
        }
        isDown = false;
        obj = null;
    });

    $scope.loadImage = function (file) {
        var object;
        new fabric.Image.fromURL(file.dataUri, function (obj) {
            obj.id = uniqueId();
            canvas.add(obj);
            object = obj;
            canvas.trigger('object:created', {target: obj});
        });
    };

    $scope.toggleFullScreen = function () {
        if ((document.fullScreenElement && document.fullScreenElement !== null) ||
            (!document.mozFullScreen && !document.webkitIsFullScreen)) {
            if (document.documentElement.requestFullScreen) {
                document.documentElement.requestFullScreen();
                $scope.isFullscreen = true;
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
                $scope.isFullscreen = true;
            } else if (document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                $scope.isFullscreen = true;
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
                $scope.isFullscreen = false;
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
                $scope.isFullscreen = false;
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
                $scope.isFullscreen = false;
            }
        }
    };

    function addObject(object) {
        var obj = undefined;
        switch (object.type) {
            case 'line':
                obj = new fabric.Line([object.x1, object.y1, object.x2, object.y2], object);
                break;
            case 'polygon':
                obj = new fabric.Polygon(object.points, object);
                break;
            case 'textbox':
                obj = new fabric.Textbox(object.text, object);
                break;
            case 'path':
                obj = new fabric.Path(object.path, object);
                break;
            case 'image':
                fabric.Image.fromURL(object.src, function (obj) {
                    obj.id = object.id;
                    obj.set(object);
                    obj.top = object.top;
                    obj.left = object.left;
                    canvas.add(obj);
                    obj.moveTo(obj.index);
                    return obj;
                });
                return;
            case 'group':
                console.log(object);
                new fabric.Group.fromObject(object, function (obj) {
                    obj.id = object.id;
                    obj.set(object);
                    obj.top = object.top;
                    obj.left = object.left;
                    canvas.add(obj);
                    obj.moveTo(obj.index);
                    return obj;

                });
                return;

            // break;
            default:
                type = fabric.util.string.camelize(fabric.util.string.capitalize(object.type));
                obj = new fabric[type](object);
                break;
        }
        if (obj !== undefined) {
            obj.id = object.id;
            obj.selectable = object.selectable;
            obj.selectedBy = object.selectedBy;
            canvas.add(obj);
            obj.moveTo(obj.index);
            return obj;
        }
        else {
            return undefined;
        }
    }

    $scope.groupSelection = function () {
        obj = canvas.getActiveObject();
        if (obj.type === 'activeSelection') {
            obj.toGroup();
        }
        canvas.renderAll();
    };

    $scope.ungroupSelection = function () {
        obj = canvas.getActiveObject();
        if (obj.type === 'group') {
            obj.ungroupOnCanvas();
            canvas.renderAll();
        }
    };

    $scope.groupAlign = function (direction, object) {
        if(object === undefined)
            object = canvas.getActiveObject();

        if(object.type !== 'group' && object.type !== 'activeSelection' ) return;

        var groupWidth = object.getWidth();
        var groupHeight = object.getHeight();

        object.forEachObject(function (obj) {
            var itemWidth = obj.getBoundingRect().width;
            var itemHeight = obj.getBoundingRect().height;
            switch (direction){
                case 'vertical-top':
                    obj.set({
                        originY: 'center',
                        top: -groupHeight / 2 + itemHeight / 2
                    });
                    break;
                case 'vertical-center':
                    obj.set({
                        originY: 'center',
                        top:0
                    });
                    break;
                case 'vertical-bottom':
                    obj.set({
                        originY: 'center',
                        top: groupHeight / 2 - itemHeight / 2
                    });
                    break;
                case 'horizontal-left':
                    obj.set({
                        originX: 'center',
                        left: -groupWidth / 2 + itemWidth / 2
                    });
                    break;
                case 'horizontal-center':
                    obj.set({
                        originX: 'center',
                        left: 0
                    });
                    break;
                case 'horizontal-right':
                    obj.set({
                        originX: 'center',
                        left: groupWidth / 2 - itemWidth / 2
                    });
                    break;
                default:
                    return;
            }
            obj.setCoords();
            canvas.renderAll();
        });
        canvas.trigger('object:modified', {target: object});

    };

    $scope.scrollDown = function (elementClass) {
        $timeout(function () {
            var scroller = document.getElementsByClassName(elementClass);
            scroller[0].scrollTop = scroller[0].scrollHeight;
        }, 100, false);
    };

    $scope.sendMessage = function () {
        if ($scope.message === "") return;
        socket.emit('message-created', {text: $scope.message});
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

        if (!$scope.room.loaded) {
            console.log(fabric);
        }

        for (let key in $scope.room.objects) {
            if ($scope.room.objects.hasOwnProperty(key)) {
                addObject($scope.room.objects[key]);
            }
        }
        canvas.getObjects().forEach(function (obj) {
            obj.moveTo(obj.index);
        })
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

    socket.on('selection-changed', function (data) {
        console.log('SOCKET: selection-changed');
        var obj = canvas.getObjectById(data.id);
        obj.selectable = data.selectable;
        obj.selectedBy = data.selectedBy;
    });

    socket.on('selection-deny', function (id) {
        console.log('SOCKET: selection-deny');

    });

    socket.on('object-modified', function (obj) {
        console.log('SOCKET: object-modified');

        var object = canvas.getObjectById(obj.id);
        if (object !== null) {
            object.animate(
                {
                    left: obj.left,
                    top: obj.top,
                    scaleX: obj.scaleX,
                    scaleY: obj.scaleY,
                    angle: obj.angle
                }, {
                    duration: 500,
                    onChange: function () {
                        object.setCoords();
                        canvas.renderAll();
                    }
                }
            );
            object.set(obj);
        }
        else {
            object = addObject(obj);
        }

    });

    socket.on('object-created', function (obj) {
        console.log('SOCKET: object-created');
        // console.log(obj);
        object = addObject(obj);
        if(object === undefined) return;
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

    socket.on('canvas-modified', function (properties) {
        canvas.setHeight(parseInt(properties.height, 10));
        canvas.setWidth(parseInt(properties.width, 10));
        canvas.backgroundColor = properties.backgroundColor;
        canvas.renderAll();
    });


    // ------------ Socket event listeners - END ------------


    // ------------ Canvas event listeners - START ------------
    canvas.on('selection:created', function (event) {
        console.log('CANVAS: selection:created');
        event.selected.forEach(function (obj) {
            // if(obj.type === 'polygon' && $scope.polygon_edit !== false) return;

            socket.emit('selection-changed', {id: obj.id, selectable: false});
        });
    });

    canvas.on('selection:updated', function (event) {
        console.log('CANVAS: selection:updated');
        event.selected.forEach(function (obj) {
            socket.emit('selection-changed', {id: obj.id, selectable: false});
        });
        event.deselected.forEach(function (obj) {
            socket.emit('selection-changed', {id: obj.id, selectable: true});
        });
    });

    canvas.on('selection:cleared', function (event) {
        console.log('CANVAS: selection:cleared');
        if (event.deselected === undefined) return;
        event.deselected.forEach(function (obj) {
            // if(obj.type === 'polygon' && $scope.polygon_edit !== false) return;

            socket.emit('selection-changed', {id: obj.id, selectable: true});
        });
    });

    canvas.on('object:modified', function (event) {
        console.log('CANVAS: object:modified');

        object = event.target;
        console.log(object);

        if (object.type === "activeSelection") {
            var group = object;
            for (var i = group._objects.length - 1; i >= 0; i--) {
                obj = group._objects[i];
                obj.index = obj.getIndex();
                group.removeWithUpdate(obj);
                socket.emit('object-modified', obj.toJSON(['id', 'selectable', 'index']));
                group.addWithUpdate(obj);
            }
        }
        else {
            object.index = object.getIndex();
            socket.emit('object-modified', object.toJSON(['id', 'selectable', 'index']));
        }
    });

    canvas.on('object:created', function (event) {
        console.log('CANVAS: object:created');

        var obj = event.target;
        console.log(obj);
        obj.index = obj.getIndex();
        socket.emit('object-created', obj.toJSON(['id', 'selectable', 'index']));
    });

    canvas.on('object:removed', function (event) {
        console.log('CANVAS: object:removed');

        var obj = event.target;
        // if(obj.type === 'polygon' && $scope.polygon_edit !== false) return;

        socket.emit('object-removed', obj.id);
    });

    canvas.on('canvas:modified', function (event) {
        socket.emit('canvas-modified', {
            width: canvas.width,
            height: canvas.height,
            backgroundColor: canvas.backgroundColor
        })
    });

    canvas.on('path:created', function (event) {
        console.log('CANVAS: path:created');
        obj = event.path;
        console.log(obj);
        obj.index = obj.getIndex();
        obj.id = uniqueId();
        console.log(obj.toJSON(['id', 'selectable', 'index']));
        socket.emit('object-created', obj.toJSON(['id', 'selectable', 'index']));
    });

    canvas.on('object:moving', function (options) {
        if($scope.snapToGrid) {
            options.target.set({
                left: Math.round(options.target.left / $scope.grid) * $scope.grid,
                top: Math.round(options.target.top / $scope.grid) * $scope.grid
            });
        }
    });

    // ------------ Canvas event listeners - END ------------
}



