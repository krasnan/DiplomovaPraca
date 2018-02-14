fabric.Canvas.prototype.getObjectById = function(id){
    var objects = this.getObjects();
    for(var i = 0; i<objects.length; i++){
        if(objects[i].id === id ) return objects[i];
    }
    return null;
};


var canvas = new fabric.Canvas('ie__canvas');

var app = angular.module('ImageEditor', [
    'colorpicker.module'
]);

app.config(function ($interpolateProvider) {
    $interpolateProvider
        .startSymbol('{[')
        .endSymbol(']}');
});

app.directive('bindValueTo', function () {
    return {
        restrict: 'A',

        link: function ($scope, $element, $attrs) {

            var prop = capitalize($attrs.bindValueTo),
                getter = 'get' + prop,
                setter = 'set' + prop;

            $element.on('change keyup select', function () {
                if ($element[0].type !== 'checkbox') {
                    $scope[setter] && $scope[setter](this.value);
                }
            });

            $element.on('click', function () {
                if ($element[0].type === 'checkbox') {
                    if ($element[0].checked) {
                        $scope[setter] && $scope[setter](true);
                    }
                    else {
                        $scope[setter] && $scope[setter](false);
                    }
                }
            });

            $scope.$watch($scope[getter], function (newVal) {
                if ($element[0].type === 'radio') {
                    var radioGroup = document.getElementsByName($element[0].name);
                    for (var i = 0, len = radioGroup.length; i < len; i++) {
                        radioGroup[i].checked = radioGroup[i].value === newVal;
                    }
                }
                else if ($element[0].type === 'checkbox') {
                    $element[0].checked = newVal;
                }
                else {
                    $element.val(newVal);
                }
            });
        }
    };
});

app.factory('socket', function ($rootScope) {

    var socket = io.connect('http://wiki.localhost:3000', {query:'name=krasnan&room=roomName'});

    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});

(function (global) {
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getFileName() {
        return location.href.search();
    }

    global.capitalize = capitalize;
    global.getFileName = getFileName;
})(this);

