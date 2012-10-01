// Generated by CoffeeScript 1.3.3
(function() {
  var UserController, WebChat,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  WebChat = window.WebChat;

  UserController = (function(_super) {

    __extends(UserController, _super);

    function UserController($scope, websocket) {
      this.websocket = websocket;
      UserController.__super__.constructor.call(this, $scope, 'user');
      $scope.items = [
        {
          id: 0,
          name: "ben",
          groups: [0, 1],
          online: true
        }, {
          id: 1,
          name: "tom",
          groups: [0],
          online: false
        }
      ];
    }

    return UserController;

  })(WebChat.BaseController);

  angular.module('WebChat').controller('UserController', [
    '$scope', 'websocket', function($scope, websocket) {
      return new UserController($scope, websocket);
    }
  ]);

}).call(this);
