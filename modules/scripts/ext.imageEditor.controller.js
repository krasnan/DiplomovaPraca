app.controller('ImageEditor', function($scope, $timeout, socket) {

    $scope.canvas = canvas;
    $scope.getActiveStyle = getActiveStyle;

    $scope.socketInit=function(serverUrl, serverPort, userName, roomName){
        var server = serverUrl+':'+serverPort;
        var query = {query:'name='+userName+'&room='+roomName};

        socket.connect(server, query);
        initAccessors($scope, socket, canvas);
        initTools($scope, socket, canvas, $timeout);
        initKeyBindings($scope, socket, canvas);
        watchCanvas($scope, socket);
        $scope.loaded = true;
    };
});


function watchCanvas($scope, socket) {

    function updateScope() {
        $scope.$$phase || $scope.$digest();
        canvas.renderAll();
    }

    canvas
        .on('object:selected', updateScope)
        .on('object:modified', updateScope)
        .on('group:selected', updateScope)
        .on('path:created', updateScope)
        .on('selection:created', updateScope)
        .on('selection:cleared', updateScope)
        .on('selection:updated', updateScope);
}

