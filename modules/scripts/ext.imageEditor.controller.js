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
        .on('selection:cleared', function () {
            console.log('deselected');
        })
        .on('before:selection:cleared', function () {
            console.log('before deselected');
        })
        .on('selection:created', function () {
            console.log('selected group');
        })
        .on('object:modified', function () {
            console.log('modified');
        })
        .on('object:selected', function () {
            console.log('selected obj');
        });

}

colabedit.controller('CanvasControls', function($scope, $element) {

  $scope.canvas = canvas;
  $scope.canvas.backgroundColor = '#ffffff';
  $scope.getActiveStyle = getActiveStyle;

    initAccessors($scope,canvas);
    initTools($scope,canvas);
    initKeyBindings($scope,canvas);
    watchCanvas($scope);
});
