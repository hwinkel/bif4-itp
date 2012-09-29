// Generated by CoffeeScript 1.3.3
(function() {
  var GroupController,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  GroupController = (function(_super) {

    __extends(GroupController, _super);

    function GroupController($scope) {
      GroupController.__super__.constructor.call(this, $scope, 'group|user');
      $scope.items = [
        {
          id: 0,
          name: "john"
        }, {
          id: 1,
          name: "mino"
        }
      ];
    }

    return GroupController;

  })(WebChat.BaseController);

  angular.module('WebChat').controller('GroupController', [
    'websocket', function($scope, websocket) {
      return new GroupController($scope);
    }
  ]);

}).call(this);