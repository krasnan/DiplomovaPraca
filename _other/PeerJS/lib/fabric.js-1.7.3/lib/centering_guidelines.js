/**
 * Augments canvas by assigning to `onObjectMove` and `onAfterRender`.
 * This kind of sucks because other code using those methods will stop functioning.
 * Need to fix it by replacing callbacks with pub/sub kind of subscription model.
 * (or maybe use existing fabric.util.fire/observe (if it won't be too slow))
 */
function initCenteringGuidelines(canvas) {

  var canvasWidth = $scope.canvas.getWidth(),
      canvasHeight = $scope.canvas.getHeight(),
      canvasWidthCenter = canvasWidth / 2,
      canvasHeightCenter = canvasHeight / 2,
      canvasWidthCenterMap = { },
      canvasHeightCenterMap = { },
      centerLineMargin = 4,
      centerLineColor = 'rgba(255,0,241,0.5)',
      centerLineWidth = 1,
      ctx = $scope.canvas.getSelectionContext(),
      viewportTransform;

  for (var i = canvasWidthCenter - centerLineMargin, len = canvasWidthCenter + centerLineMargin; i <= len; i++) {
    canvasWidthCenterMap[Math.round(i)] = true;
  }
  for (var i = canvasHeightCenter - centerLineMargin, len = canvasHeightCenter + centerLineMargin; i <= len; i++) {
    canvasHeightCenterMap[Math.round(i)] = true;
  }

  function showVerticalCenterLine() {
    showCenterLine(canvasWidthCenter + 0.5, 0, canvasWidthCenter + 0.5, canvasHeight);
  }

  function showHorizontalCenterLine() {
    showCenterLine(0, canvasHeightCenter + 0.5, canvasWidth, canvasHeightCenter + 0.5);
  }

  function showCenterLine(x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = centerLineColor;
    ctx.lineWidth = centerLineWidth;
    ctx.beginPath();
    ctx.moveTo(x1 * viewportTransform[0], y1 * viewportTransform[3]);
    ctx.lineTo(x2 * viewportTransform[0], y2 * viewportTransform[3]);
    ctx.stroke();
    ctx.restore();
  }

  var afterRenderActions = [],
      isInVerticalCenter,
      isInHorizontalCenter;

  $scope.canvas.on('mouse:down', function () {
    viewportTransform = $scope.canvas.viewportTransform;
  });

  $scope.canvas.on('object:moving', function(e) {
    var object = e.target,
        objectCenter = object.getCenterPoint(),
        transform = $scope.canvas._currentTransform;

    if (!transform) return;

    isInVerticalCenter = Math.round(objectCenter.x) in canvasWidthCenterMap,
    isInHorizontalCenter = Math.round(objectCenter.y) in canvasHeightCenterMap;

    if (isInHorizontalCenter || isInVerticalCenter) {
      object.setPositionByOrigin(new fabric.Point((isInVerticalCenter ? canvasWidthCenter : objectCenter.x), (isInHorizontalCenter ? canvasHeightCenter : objectCenter.y)), 'center', 'center');
    }
  });

  $scope.canvas.on('before:render', function() {
    $scope.canvas.clearContext($scope.canvas.contextTop);
  });

  $scope.canvas.on('after:render', function() {
    if (isInVerticalCenter) {
      showVerticalCenterLine();
    }
    if (isInHorizontalCenter) {
      showHorizontalCenterLine();
    }
  });

  $scope.canvas.on('mouse:up', function() {
    // clear these values, to stop drawing guidelines once mouse is up
    isInVerticalCenter = isInHorizontalCenter = null;
    $scope.canvas.renderAll();
  });
}
