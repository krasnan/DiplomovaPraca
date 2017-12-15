function initKeyBindings($scope, canvas) {
    document.onkeydown = function(e) {
        e = e || window.event;
        console.log(e.which + " " + e.keyCode);
        switch(e.which || e.keyCode) {
            case 46:
                $scope.deleteSelection();
                break;
        }
    }

}