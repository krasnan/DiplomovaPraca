function initKeyBindings($scope, canvas) {
    document.onkeyup = function (e) {

        var e = window.event ? event : e;

        // console.log(String.fromCharCode(e.keyCode) + " " + e.keyCode);

        if (e.keyCode == 37 && e.ctrlKey) {
            $scope.copy();
        }
        //edit key bindings
        if (e.keyCode == 67 && e.ctrlKey) {
            $scope.copy();
        }
        else if (e.keyCode == 86 && e.ctrlKey) {
            $scope.paste();
        }
        else if (e.keyCode == 88 && e.ctrlKey) {
            $scope.cut();
        }
        // else if (e.keyCode == 68 && e.ctrlKey && e.shiftKey) {
        //     $scope.duplicate();
        // }
        else if (e.keyCode == 68 && e.shiftKey) {
            $scope.duplicate();
        }
        else if (e.keyCode == 46) {
            $scope.deleteSelection();
        }

        // tools key bindings
        else if(e.keyCode == 83){
            $scope.setActiveTool($scope.tools.select);
        }
        else if(e.keyCode == 80){
            $scope.setActiveTool($scope.tools.pencil);
        }
        else if(e.keyCode == 76){
            $scope.setActiveTool($scope.tools.line);
        }
        else if(e.keyCode == 82){
            $scope.setActiveTool($scope.tools.rectangle);
        }
        else if(e.keyCode == 67){
            $scope.setActiveTool($scope.tools.circle);
        }
        else if(e.keyCode == 84){
            $scope.setActiveTool($scope.tools.text);
        }

        //object
        else if(e.keyCode == 38 && e.ctrlKey && e.shiftKey){
            $scope.bringToFront();
        }
        else if(e.keyCode == 40 && e.ctrlKey && e.shiftKey){
            $scope.sendToBack();
        }
        else if(e.keyCode == 40 && e.ctrlKey){
            $scope.sendBackwards();
        }
        else if(e.keyCode == 38 && e.ctrlKey){
            $scope.bringForward();
        }


        $scope.$apply();
    }

}