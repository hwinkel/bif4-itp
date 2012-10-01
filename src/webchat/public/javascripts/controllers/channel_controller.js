// Generated by CoffeeScript 1.3.3
(function() {
  var ChannelController, WebChat,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  WebChat = window.WebChat;

  ChannelController = (function(_super) {

    __extends(ChannelController, _super);

    function ChannelController($scope, websocket, activeChannel) {
      var _this = this;
      this.websocket = websocket;
      this.activeChannel = activeChannel;
      ChannelController.__super__.constructor.call(this, $scope, 'channel');
      this.getActiveChannelId = function() {
        return _this.activeChannel.getActiveChannelId();
      };
      this.setActiveChannelId = function(id) {
        return _this.activeChannel.setActiveChannelId(id);
      };
      $scope.join = function(id) {
        var message;
        message = new WebChat.JoinMessage(id);
        _this.websocket.sendJSON(message.serialize());
        _this.setActiveChannelId(id);
        return $scope.selected = id;
      };
      $scope.sendMessage = function(textInput, messageType) {
        var activeChannelId, message;
        activeChannelId = _this.getActiveChannelId();
        if (activeChannelId !== void 0) {
          message = new WebChat.SendMessage(textInput, messageType, activeChannelId);
          return _this.websocket.sendJSON(message.serialize());
        }
      };
      $scope.inviteUser = function(userId) {
        var activeChannelId, message;
        activeChannelId = _this.getActiveChannelId();
        if (activeChannelId !== void 0) {
          message = new WebChat.InviteUserMessage(userId, activeChannelId);
          return _this.websocket.sendJSON(message.serialize());
        }
      };
      $scope.inviteGroup = function(groupId) {
        var activeChannelId, message;
        activeChannelId = _this.getActiveChannelId();
        if (activeChannelId !== void 0) {
          message = new WebChat.InviteGroupMessage(groupId, activeChannelId);
          return _this.websocket.sendJSON(message.serialize());
        }
      };
      this.create({
        id: 1,
        name: 'channel'
      });
    }

    return ChannelController;

  })(WebChat.BaseController);

  angular.module('WebChat').controller('ChannelController', function($scope, websocket, activeChannel) {
    return new ChannelController($scope, websocket, activeChannel);
  });

}).call(this);
