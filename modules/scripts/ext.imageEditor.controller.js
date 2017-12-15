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
        .on('selection:cleared', updateScope);

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
