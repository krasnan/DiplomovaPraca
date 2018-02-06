function watchCanvas($scope) {

    function updateScope() {
        $scope.$$phase || $scope.$digest();
        canvas.renderAll();
    }

    canvas
        .on('object:selected', updateScope)
        .on('object:modified', updateScope)
        .on('group:selected', updateScope)
        .on('path:created', updateScope)
        .on('selection:cleared', updateScope)

        .on('path:created', function(){
            console.log('path:created');
        })
        .on('selection:cleared', function () {
            console.log('selection:cleared');
        })
        .on('before:selection:cleared', function () {
            console.log('before:selection:cleared');
        })
        .on('selection:created', function () {
            console.log('selection:created');
        })
        .on('object:modified', function () {
            console.log('object:modified');
        })
        .on('object:modified', function () {
            console.log('object:modified');
        });

}

app.controller('ImageEditor', function($scope, socket, $element) {

  $scope.canvas = canvas;
  //$scope.canvas.backgroundColor = '#ffffff';
  $scope.getActiveStyle = getActiveStyle;

    initAccessors($scope,canvas);
    initTools($scope,canvas);
    initKeyBindings($scope,canvas);
    watchCanvas($scope);
});
