app.controller('ImageEditor', function ($scope, $timeout, socket) {

    $scope.socket = socket;
    $scope.canvas = canvas;
    $scope.mw = mw;

    $scope.socketInit = function (serverUrl, serverPort, userName, roomName) {
        var server = serverUrl + ':' + serverPort;
        var query = {query: 'name=' + userName + '&room=' + roomName};

        socket.connect(server, query);
        initAccessors($scope);
        initTools($scope, $timeout);
        initEvents($scope);
        initKeyBindings($scope);
        watchCanvas($scope);
        $scope.loaded = true;
    };

    // console.log($scope.mw.user.tokens.get( 'editToken' ));
});


function watchCanvas($scope) {

    function updateScope() {
        $scope.$$phase || $scope.$digest();
        $scope.canvas.renderAll();
    }

    $scope.canvas
        .on('object:selected', updateScope)
        .on('object:modified', updateScope)
        .on('group:selected', updateScope)
        .on('path:created', updateScope)
        .on('selection:created', updateScope)
        .on('selection:cleared', updateScope)
        .on('selection:updated', updateScope);
}

