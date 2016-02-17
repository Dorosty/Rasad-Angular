angular.module('app', ['datatables'])

.directive('rsdStretchToBottom', function () {
  return {
    restrict: 'A',
    link: function (_, element) {
      var w = $(window);
      function setHeight() {
        element.css({ height: w.height() - element.offset().top + 'px' });
      }
      setHeight();
      w.resize(setHeight);
    }
  };
})

.directive('rsdBoundry', function () {
  return {
    restrict: 'A',
    controller: function ($element) {
      this.element = $element;
    }
  };
})

.directive('rsdZIndexed', function () {
  var elements = [];
  return {
    restrict: 'A',
    link: function (_, element) {
      elements.push(element);
      element.css({ zIndex: elements.length });
      element.mousedown(function() {
        for(var i=0, len=elements.length; i < len; i++) {
          var zIndex = elements[i].css('zIndex');
          if (zIndex > element.css('zIndex'))
            elements[i].css({ zIndex: zIndex - 1 });
        }
        element.css({ zIndex: elements.length });
      })
    }
  }
})

.directive('rsdResizable', function() {
  var somebodyDown;
  var hasN = [], hasS = [], hasE = [], hasW = [];
  var elements = [];
  return {
    restrict: 'A',
    require: '^rsdBoundry',
    link: function (_, element, __, boundry) {
      element.boundry = boundry && boundry.element;
    },
    controller: function ($element, $timeout) {
      var j = elements.length;
      elements.push($element);
      function isInvalidValidEvent(e) {
        return elements.filter(function(elem) {
          return elem[0] !== $element[0] && (elem[0] === e.target || elem[0].contains(e.target));
        }).length;
      }
      function isNear(a, b) { return Math.abs(a - b) <= 5 }
      function isNearlyBetween(a, low, high) { return a >= low - 5 && a <= high + 5 }
      var w = $(window), b = $(document.body);
      var x, y;
      var width, height, top, left, bottom, right, boundry;
      function isTopEdge()    { return isNear(top, y)    && isNearlyBetween(x, left, right); };
      function isLeftEdge()   { return isNear(left, x)   && isNearlyBetween(y, top, bottom); };
      function isRightEdge()  { return isNear(right, x)  && isNearlyBetween(y, top, bottom); };
      function isBottomEdge() { return isNear(bottom, y) && isNearlyBetween(x, left, right); };
      $timeout(function() {
        width = $element.width();
        height = $element.height();
        boundry = $element.boundry;
        updateElementCoordinates();
      });
      function updateElementCoordinates() {
        var offset = $element.offset();
        top = offset.top;
        left = offset.left
        bottom = top + height;
        right = left + width;
      }
      this.updateElementCoordinates = updateElementCoordinates;
      var topEdge, bottomEdge, leftEdge, rightEdge;
      var down;
      w.mousedown(function (e) {

        if (isInvalidValidEvent(e))
          return;

        var position = $element.position();
        down = {
          x: x,
          y: y,
          width: width,
          height: height,
          top: top,
          left: left,
          _top: position.top,
          _left: position.left
        };
        somebodyDown = true;
        if (topEdge)
          down.topEdge = true;
        if (leftEdge)
          down.leftEdge = true;
        if (bottomEdge)
          down.bottomEdge = true;
        if (rightEdge)
          down.rightEdge = true;
        if (!topEdge && !leftEdge && !bottomEdge && !rightEdge)
          down = null;
      });

      w.mousemove(function (e) {

        if (isInvalidValidEvent(e) && !down) {
          hasN[j] = false;
          hasS[j] = false;
          hasE[j] = false;
          hasW[j] = false;
          return;
        }

        x = e.pageX;
        y = e.pageY;

        if (!somebodyDown) {
          topEdge = bottomEdge = rightEdge = leftEdge = false;
          if (isTopEdge())
            topEdge = true;
          if (isLeftEdge())
            leftEdge = true;
          if (isBottomEdge())
            bottomEdge = true;
          if (isRightEdge())
            rightEdge = true;

          hasN[j] = topEdge;
          hasS[j] = bottomEdge;
          hasE[j] = rightEdge;
          hasW[j] = leftEdge;

          var toBeAdded = [];
          if (~hasN.indexOf(true))
            toBeAdded.push('n');
          if (~hasS.indexOf(true))
            toBeAdded.push('s');
          if (~hasE.indexOf(true))
            toBeAdded.push('e');
          if (~hasW.indexOf(true))
            toBeAdded.push('w');
          b.attr('class', toBeAdded.join(' '));

        }

        if (!down)
          return;

        var deltaX = e.pageX - down.x;
        var deltaY = e.pageY - down.y;
        if (down.topEdge) {
          if (deltaY > 0) {
            if (down.height - deltaY > 200) {
              top = down.top + deltaY;
              height = down.height - deltaY;
              $element.css({
                top: down._top + deltaY + 'px',
                height: down.height - deltaY + 'px'
              });
            }
            else {
              top = down.top + down.height - 200;
              height = 200;
              $element.css({
                top: down._top + down.height - 200 + 'px',
                height: '200px'
              });
            }
          }
          else {
            if (down._top + deltaY > 0) {
              top = down.top + deltaY;
              height = down.height - deltaY;
              $element.css({
                top: down._top + deltaY + 'px',
                height: down.height - deltaY + 'px'
              });
            }
            else {
              top = down.top - down._top;
              height = down._top + down.height;
              $element.css({
                top: '0px',
                height: down._top + down.height + 'px'
              });
            }
          }
        } // end top
        if (down.leftEdge) {
          if (deltaX > 0) {
            if (down.width - deltaX > 400) {
              left = down.left + deltaX;
              width = down.width - deltaX;
              $element.css({
                left: down._left + deltaX + 'px',
                width: down.width - deltaX + 'px'
              });
            }
            else {
              left = down.left + down.width - 400;
              width = 400;
              $element.css({
                left: down._left + down.width - 400 + 'px',
                width: '400px'
              });
            }
          }
          else {
            if (down._left + deltaX > 0) {
              left = down.left + deltaX
              width = down.width - deltaX;
              $element.css({
                left: down._left + deltaX + 'px',
                width: down.width - deltaX + 'px',
              });
            }
            else {
              left = down.left - down._left;
              width = down._left + down.width;
              $element.css({
                left: '0px',
                width: down._left + down.width + 'px'
              });
            }
          }
        } // end left
        if (down.bottomEdge) {
          if (deltaY > 0) {
            if (down._top + down.height + deltaY > boundry.height()) {
              bottom = down.top + boundry.height() - down._top;
              height = boundry.height() - down._top;
              $element.css({
                height: boundry.height() - down._top + 'px'
              });
            }
            else {
              bottom = down.top + down.height + deltaY;
              height = down.height + deltaY;
              $element.css({
                height: down.height + deltaY + 'px'
              });
            }
          }
          else {
            if (down.height + deltaY > 200) {
              bottom = down.top + down.height + deltaY;
              height = down.height + deltaY;
              $element.css({
                height: down.height + deltaY + 'px'
              });
            }
            else {
              bottom = down.top + 200;
              height = 200;
              $element.css({
                height: '200px'
              });
            }
          }
        } // end bottom
        if (down.rightEdge) {
          if (deltaX > 0) {
            if (down._left + down.width + deltaX > boundry.width()) {
              right = down.left + boundry.width() - down._left;
              width = boundry.width() - down._left;
              $element.css({
                width: boundry.width() - down._left + 'px'
              });
            }
            else {
              right = down.left + down.width + deltaX;
              width = down.width + deltaX;
              $element.css({
                width: down.width + deltaX + 'px'
              });
            }
          }
          else {
            if (down.width + deltaX > 400) {
              right = down.left + down.width + deltaX;
              width = down.width + deltaX;
              $element.css({
                width: down.width + deltaX + 'px'
              });
            }
            else {
              right = down.left + 400;
              width = 400;
              $element.css({
                width: '400px'
              });
            }
          }
        } // end right
      });
      w.mouseup(function () {
        down = null;
        somebodyDown = false;
      });
    }
  }
})

.directive('rsdDraggable', function () {
  return {
    restrict: 'A',
    require: ['?^rsdBoundry', '?rsdResizable'],
    link: function (_, element, __, controllers) {
      if (controllers.length == 1) {
        element.boundry = controllers[0].element;
      }
      else if (controllers.length == 2) {
        element.boundry = controllers[0].element;
        element.resizable = controllers[1];
      }
    },
    controller: function ($element) {
      var w = $(window);
      var down;
      var handle = $element;
      var omits = [];
      function mousedown(e) {
        if (~omits.indexOf(e.toElement))
          return;

        position = $element.position();
        down = {
          x: e.pageX,
          y: e.pageY,
          top: position.top,
          left: position.left
        };
      }
      w.mousemove(function (e) {
        if (!down)
          return;

        var top  = down.top  + e.pageY - down.y;
        var left = down.left + e.pageX - down.x;
        var boundry = $element.boundry;
        if (boundry) {
          var maximumTop  = boundry.height() - $element.height();
          var maximumLeft = boundry.width() - $element.width();
          if (top  > maximumTop)
            top  = maximumTop;
          if (left > maximumLeft)
            left = maximumLeft;
          if (top  < 0)
            top  = 0;
          if (left < 0)
            left = 0;
        }
        $element.css({
          top:  top  + 'px',
          left: left + 'px'
        });

        var resizable = $element.resizable;
        if (resizable)
          resizable.updateElementCoordinates();
      });
      w.mouseup(function () {
        down = null;
      });

      this.setHandle = function (element) {
        handle.unbind('mousedown', mousedown);
        handle = element;
        handle.mousedown(mousedown);
      }
      this.setHandle($element);

      this.omit = function (element) {
        omits.push(element[0]);
      }
    }
  };
})

.directive('rsdDraggableHandle', function () {
  return {
    restrict: 'A',
    require: '^rsdDraggable',
    link: function (_, element, __, draggable) {
      draggable.setHandle(element);
    }
  };
})

.directive('rsdDraggableOmit', function () {
  return {
    restrict: 'A',
    require: '^rsdDraggable',
    link: function (_, element, __, draggable) {
      draggable.omit(element);
    }
  };
})

.directive('rsdHeader', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'header.html'
  };
})

.directive('rsdSidebar', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'sidebar.html',
    scope: {
      create: '=onCreate'
    }
  };
})

.directive('rsdPortletPane', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'portletPane.html',
    scope: {
      subscribeToPortletsUpdate: '=update'
    },
    controller: function($scope) {
      $scope.portlets = [];
      $scope.subscribeToPortletsUpdate(function(type) {
        $scope.portlets.push({type: type});
      });
      $scope.destroy = function(portlet) {
        $scope.portlets.splice($scope.portlets.indexOf(portlet), 1);
      };
    }
  };
})

.directive('rsdPortlet', function () {
  return {
    restrict: 'E',
    replace: true,
    require: '^rsdPortletPane',
    templateUrl: 'portlet.html',
    scope: {
      title: '@',
      contents: '@',
      top: '@',
      left: '@',
      width: '@',
      height: '@',
      destroy: '&'
    },
    controller: function ($scope, $timeout) {
      $scope.title = '[title]';
      $timeout(function () {
        function removePixel(a) {
          if (a && a.endsWith('px'))
            return a.substr(0, a.length - 2);
          else
            return a;
        }
        function setDefault(attr, value) {
          var a = $scope[attr];
          var a = removePixel(a);
          a = a || value;
          $scope[attr] = a + 'px';
        }
        setDefault('top', 50);
        setDefault('left', 50);
        setDefault('width', 400);
        setDefault('height', 200);
      });
                        
      $scope.gotoOptions = function() {
        $scope.options = true;
      }
      $scope.goBack = function() {
        $scope.options = false;
      }

      $scope.persons = [{id:0, firstName:'Ali', lastName: 'Dorosty'},
                        {id:1, firstName:'Hassan', lastName: 'Hosseini'}];
    }
  };
})

.controller('app', function($scope) {
  portletsUpdateCallbacks = [];
  $scope.subscribeToPortletsUpdate = function(callback) {
    portletsUpdateCallbacks.push(callback);
  }
  $scope.createPortlet = function(type) {
    portletsUpdateCallbacks.forEach(function(callback) {
      callback(type);
    });
  }
})