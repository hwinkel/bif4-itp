// Generated by CoffeeScript 1.3.3
(function() {
  var app,
    _this = this,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  app = angular.module('WebChat', []).config(function($provide) {
    $provide.value('WEBSOCKET_DOMAIN', document.location.host);
    $provide.value('WEBSOCKET_PATH', '/websocket');
    $provide.value('WEBSOCKET_SSL', false);
  });

  app.run(function($rootScope) {});

  angular.module('WebChat').factory('ActiveChannel', [
    '$rootScope', function($rootScope) {
      var ActiveChannel;
      ActiveChannel = {};
      ActiveChannel.activeChannelId = null;
      ActiveChannel.setActiveChannelId = function(id) {
        this.activeChannelId = id;
        return $rootScope.$broadcast('changed_channel');
      };
      ActiveChannel.getActiveChannelId = function() {
        return this.activeChannelId;
      };
      return ActiveChannel;
    }
  ]);

  angular.module('WebChat').factory('ChannelModel', [
    '_ChannelModel', function(_ChannelModel) {
      var channelmodel;
      channelmodel = new _ChannelModel();
      return channelmodel;
    }
  ]);

  angular.module('WebChat').factory('GroupModel', [
    '_GroupModel', function(_GroupModel) {
      var groupmodel;
      groupmodel = new _GroupModel();
      return groupmodel;
    }
  ]);

  angular.module('WebChat').factory('UserModel', [
    '_UserModel', function(_UserModel) {
      var usermodel;
      usermodel = new _UserModel();
      return usermodel;
    }
  ]);

  angular.module('WebChat').factory('FileModel', [
    '_FileModel', function(_FileModel) {
      var filemodel;
      filemodel = new _FileModel();
      return filemodel;
    }
  ]);

  angular.module('WebChat').factory('WebChatWebSocket', [
    '_WebChatWebSocket', 'WEBSOCKET_DOMAIN', 'WEBSOCKET_PATH', 'WEBSOCKET_SSL', 'ChannelModel', 'GroupModel', 'UserModel', 'FileModel', function(_WebChatWebSocket, WEBSOCKET_DOMAIN, WEBSOCKET_PATH, WEBSOCKET_SSL, ChannelModel, GroupModel, UserModel, FileModel) {
      var models, socket;
      models = [ChannelModel, GroupModel, UserModel, FileModel];
      socket = new _WebChatWebSocket();
      socket.connect(WEBSOCKET_DOMAIN, WEBSOCKET_PATH, WEBSOCKET_SSL);
      socket.onReceive(function(message) {
        var model, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = models.length; _i < _len; _i++) {
          model = models[_i];
          if (model.canHandle(message.type)) {
            _results.push(model.handle(message.data));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      return socket;
    }
  ]);

  angular.module('WebChat').factory('_WebChatWebSocket', function() {
    var WebChatWebSocket;
    WebChatWebSocket = (function() {

      function WebChatWebSocket() {
        this._callbacks = {
          onOpen: function() {
            return console.info('websocket is open');
          },
          onReceive: function() {},
          onError: function() {
            return console.error("websocket error occured");
          },
          onClose: function() {
            return console.info("closed websocket");
          }
        };
      }

      WebChatWebSocket.prototype.connect = function(domain, path, ssl) {
        var Socket, protocol, url,
          _this = this;
        if (domain == null) {
          domain = document.location.host;
        }
        if (path == null) {
          path = "/websocket";
        }
        this.ssl = ssl != null ? ssl : false;
        Socket = window['MozWebSocket'] || window['WebSocket'];
        if (this.ssl) {
          protocol = "wss://";
        } else {
          protocol = "ws://";
        }
        url = "" + protocol + domain + path;
        try {
          this._connection = new Socket(url);
          this._connection.onopen = function() {
            _this._callbacks.onOpen();
            return window.onbeforeunload = function() {
              return _this.close();
            };
          };
          this._connection.onmessage = function(event) {
            var json, msg;
            msg = event.data;
            json = JSON.parse(msg);
            _this._callbacks.onReceive(json);
            console.info("Received: " + msg);
            if (json.type === 'status') {
              if (json.data.level !== 'ok') {
                return console.warn(json.data.msg);
              }
            }
          };
          this._connection.onclose = function() {
            return _this._callbacks.onClose();
          };
          return this._connection.onerror = function() {
            return _this._callbacks.onError();
          };
        } catch (error) {
          return console.error("Cant connect to " + url);
        }
      };

      WebChatWebSocket.prototype.onOpen = function(callback) {
        return this._callbacks.onOpen = callback;
      };

      WebChatWebSocket.prototype.onReceive = function(callback) {
        return this._callbacks.onReceive = callback;
      };

      WebChatWebSocket.prototype.onClose = function(callback) {
        return this._callbacks.onClose = callback;
      };

      WebChatWebSocket.prototype.onError = function(callback) {
        return this._callbacks.onError = callback;
      };

      WebChatWebSocket.prototype.send = function(msg) {
        this._connection.send(msg);
        return console.info("Sending " + msg);
      };

      WebChatWebSocket.prototype.sendJSON = function(json_object) {
        var msg;
        msg = JSON.stringify(json_object);
        return this.send(msg);
      };

      return WebChatWebSocket;

    })();
    return WebChatWebSocket;
  });

  angular.module('WebChat').factory('_FileModel', [
    '_Model', function(_Model) {
      var FileModel;
      FileModel = (function(_super) {

        __extends(FileModel, _super);

        function FileModel() {
          FileModel.__super__.constructor.call(this, 'file');
        }

        return FileModel;

      })(_Model);
      return FileModel;
    }
  ]);

  angular.module('WebChat').factory('_GroupModel', [
    '_Model', function(_Model) {
      var GroupModel;
      GroupModel = (function(_super) {

        __extends(GroupModel, _super);

        function GroupModel() {
          GroupModel.__super__.constructor.call(this, 'group');
        }

        return GroupModel;

      })(_Model);
      return GroupModel;
    }
  ]);

  angular.module('WebChat').factory('_UserModel', [
    '_Model', function(_Model) {
      var UserModel;
      UserModel = (function(_super) {

        __extends(UserModel, _super);

        function UserModel() {
          UserModel.__super__.constructor.call(this, 'user');
        }

        return UserModel;

      })(_Model);
      return UserModel;
    }
  ]);

  angular.module('WebChat').factory('_MessageModel', [
    '_Model', function(_Model) {
      var MessageModel;
      MessageModel = (function(_super) {

        __extends(MessageModel, _super);

        function MessageModel() {
          MessageModel.__super__.constructor.call(this, 'message');
        }

        return MessageModel;

      })(_Model);
      return MessageModel;
    }
  ]);

  angular.module('WebChat').factory('_ChannelModel', [
    '_Model', function(_Model) {
      var ChannelModel;
      ChannelModel = (function(_super) {

        __extends(ChannelModel, _super);

        function ChannelModel() {
          ChannelModel.__super__.constructor.call(this, 'channel');
          this.create({
            id: 1,
            name: 'channel',
            groups: [0],
            users: [0, 1]
          });
        }

        return ChannelModel;

      })(_Model);
      return ChannelModel;
    }
  ]);

  angular.module('WebChat').factory('_Model', function() {
    var Model;
    Model = (function() {

      function _Class(type) {
        this.type = type;
        this.items = [];
      }

      _Class.prototype.handle = function(message) {
        switch (message.action) {
          case 'update':
            return this.update(message.data);
          case 'create':
            return this.create(message.data);
          case 'delete':
            return this["delete"](message.data);
        }
      };

      _Class.prototype.create = function(item) {
        return this.items.push(item);
      };

      _Class.prototype.update = function(updatedItem) {
        var counter, item, _i, _len, _ref, _results;
        _ref = this.items;
        _results = [];
        for (counter = _i = 0, _len = _ref.length; _i < _len; counter = ++_i) {
          item = _ref[counter];
          if (item.id === updatedItem.id) {
            _results.push(this.items[counter] = updatedItem);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      _Class.prototype["delete"] = function(removedItem) {
        var counter, item, removeItemId, _i, _len, _ref;
        removeItemId = -1;
        _ref = this.items;
        for (counter = _i = 0, _len = _ref.length; _i < _len; counter = ++_i) {
          item = _ref[counter];
          if (item.id === removedItem.id) {
            removeItemId = counter;
          }
        }
        if (removeItemId >= 0) {
          return this.items.splice(removeItemId, 1);
        }
      };

      _Class.prototype.getItemById = function(id) {
        var item, _i, _len, _ref;
        _ref = this.items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item.id === id) {
            return item;
          }
        }
      };

      _Class.prototype.getItems = function() {
        return this.items;
      };

      _Class.prototype.canHandle = function(msgType) {
        if (msgType === this.type) {
          return true;
        } else {
          return false;
        }
      };

      return _Class;

    })();
    return Model;
  });

  angular.module('WebChat').factory('_InviteUserMessage', [
    '_Message', function(_Message) {
      var InviteUserMessage;
      InviteUserMessage = (function(_super) {

        __extends(InviteUserMessage, _super);

        function InviteUserMessage(userId, channelId, value) {
          this.userId = userId;
          this.channelId = channelId;
          this.value = value;
          InviteUserMessage.__super__.constructor.call(this, 'inviteuser');
        }

        InviteUserMessage.prototype.serialize = function() {
          var data;
          data = {
            channel_id: this.channelId,
            user_id: this.userId,
            value: this.value
          };
          return InviteUserMessage.__super__.serialize.call(this, data);
        };

        return InviteUserMessage;

      })(_Message);
      return InviteUserMessage;
    }
  ]);

  angular.module('WebChat').factory('_PingMessage', [
    '_Message', function(_Message) {
      var PingMessage;
      PingMessage = (function(_super) {

        __extends(PingMessage, _super);

        function PingMessage() {
          PingMessage.__super__.constructor.call(this, 'ping');
        }

        PingMessage.prototype.serialize = function() {
          var data;
          data = {};
          return PingMessage.__super__.serialize.call(this, data);
        };

        return PingMessage;

      })(_Message);
      return PingMessage;
    }
  ]);

  angular.module('WebChat').factory('_ModUserMessage', [
    '_Message', function(_Message) {
      var ModUserMessage;
      ModUserMessage = (function(_super) {

        __extends(ModUserMessage, _super);

        function ModUserMessage(userId, channelId, value) {
          this.userId = userId;
          this.channelId = channelId;
          this.value = value;
          ModUserMessage.__super__.constructor.call(this, 'moduser');
        }

        ModUserMessage.prototype.serialize = function() {
          var data;
          data = {
            channel_id: this.channelId,
            user_id: this.userId,
            value: this.value
          };
          return ModUserMessage.__super__.serialize.call(this, data);
        };

        return ModUserMessage;

      })(_Message);
      return ModUserMessage;
    }
  ]);

  angular.module('WebChat').factory('_ReadonlyUserMessage', [
    '_Message', function(_Message) {
      var ReadonlyUserMessage;
      ReadonlyUserMessage = (function(_super) {

        __extends(ReadonlyUserMessage, _super);

        function ReadonlyUserMessage(userId, channelId, value) {
          this.userId = userId;
          this.channelId = channelId;
          this.value = value;
          ReadonlyUserMessage.__super__.constructor.call(this, 'readonlyuser');
        }

        ReadonlyUserMessage.prototype.serialize = function() {
          var data;
          data = {
            channel_id: this.channelId,
            user_id: this.userId,
            value: this.value
          };
          return ReadonlyUserMessage.__super__.serialize.call(this, data);
        };

        return ReadonlyUserMessage;

      })(_Message);
      return ReadonlyUserMessage;
    }
  ]);

  angular.module('WebChat').factory('_Message', function() {
    var Message;
    Message = (function() {

      function _Class(type) {
        this.type = type;
      }

      _Class.prototype.serialize = function(data) {
        var message;
        message = {
          type: this.type,
          data: data
        };
        return message;
      };

      return _Class;

    })();
    return Message;
  });

  angular.module('WebChat').factory('_InviteGroupMessage', [
    '_Message', function(_Message) {
      var InviteGroupMessage;
      InviteGroupMessage = (function(_super) {

        __extends(InviteGroupMessage, _super);

        function InviteGroupMessage(groupId, channelId, value) {
          this.groupId = groupId;
          this.channelId = channelId;
          this.value = value;
          InviteGroupMessage.__super__.constructor.call(this, 'invitegroup');
        }

        InviteGroupMessage.prototype.serialize = function() {
          var data;
          data = {
            channel_id: this.channelId,
            group_id: this.groupId,
            value: this.value
          };
          return InviteGroupMessage.__super__.serialize.call(this, data);
        };

        return InviteGroupMessage;

      })(_Message);
      return InviteGroupMessage;
    }
  ]);

  angular.module('WebChat').factory('_JoinMessage', [
    '_Message', function(_Message) {
      var JoinMessage;
      JoinMessage = (function(_super) {

        __extends(JoinMessage, _super);

        function JoinMessage(id) {
          this.id = id;
          JoinMessage.__super__.constructor.call(this, 'join');
        }

        JoinMessage.prototype.serialize = function() {
          var data;
          data = {
            id: this.id
          };
          return JoinMessage.__super__.serialize.call(this, data);
        };

        return JoinMessage;

      })(_Message);
      return JoinMessage;
    }
  ]);

  angular.module('WebChat').factory('_ReadonlyGroupMessage', [
    '_Message', function(_Message) {
      var ReadonlyGroupMessage;
      ReadonlyGroupMessage = (function(_super) {

        __extends(ReadonlyGroupMessage, _super);

        function ReadonlyGroupMessage(groupId, channelId, value) {
          this.groupId = groupId;
          this.channelId = channelId;
          this.value = value;
          ReadonlyGroupMessage.__super__.constructor.call(this, 'readonlygroup');
        }

        ReadonlyGroupMessage.prototype.serialize = function() {
          var data;
          data = {
            channel_id: this.channelId,
            user_id: this.groupId,
            value: this.value
          };
          return ReadonlyGroupMessage.__super__.serialize.call(this, data);
        };

        return ReadonlyGroupMessage;

      })(_Message);
      return ReadonlyGroupMessage;
    }
  ]);

  angular.module('WebChat').factory('_DeleteFileMessage', [
    '_Message', function(_Message) {
      var DeleteFileMessage;
      DeleteFileMessage = (function(_super) {

        __extends(DeleteFileMessage, _super);

        function DeleteFileMessage(fileId) {
          this.fileId = fileId;
          DeleteFileMessage.__super__.constructor.call(this, 'filedelete');
        }

        DeleteFileMessage.prototype.serialize = function() {
          var data;
          data = {
            id: this.fileId
          };
          return DeleteFileMessage.__super__.serialize.call(this, data);
        };

        return DeleteFileMessage;

      })(_Message);
      return DeleteFileMessage;
    }
  ]);

  angular.module('WebChat').factory('_ModGroupMessage', [
    '_Message', function(_Message) {
      var ModGroupMessage;
      ModGroupMessage = (function(_super) {

        __extends(ModGroupMessage, _super);

        function ModGroupMessage(groupId, channelId, value) {
          this.groupId = groupId;
          this.channelId = channelId;
          this.value = value;
          ModGroupMessage.__super__.constructor.call(this, 'modgroup');
        }

        ModGroupMessage.prototype.serialize = function() {
          var data;
          data = {
            channel_id: this.channelId,
            user_id: this.groupId,
            value: this.value
          };
          return ModGroupMessage.__super__.serialize.call(this, data);
        };

        return ModGroupMessage;

      })(_Message);
      return ModGroupMessage;
    }
  ]);

  angular.module('WebChat').factory('_SendMessage', [
    '_Message', function(_Message) {
      var SendMessage;
      SendMessage = (function(_super) {

        __extends(SendMessage, _super);

        function SendMessage(text, type, channelId) {
          this.text = text;
          this.type = type;
          this.channelId = channelId;
          SendMessage.__super__.constructor.call(this, 'message');
        }

        SendMessage.prototype.serialize = function() {
          var data;
          data = {
            'message': this.text,
            'type': this.type,
            'channel_id': this.channelId
          };
          return SendMessage.__super__.serialize.call(this, data);
        };

        return SendMessage;

      })(_Message);
      return SendMessage;
    }
  ]);

  $(document).ready(function() {
    return $("#input_field").focus();
  });

  angular.module('WebChat').factory('_DialogueController', [
    '_Controller', function(_Controller) {
      var DialogueController;
      DialogueController = (function(_super) {

        __extends(DialogueController, _super);

        function DialogueController($scope, channelmodel) {
          var _this = this;
          this.channelmodel = channelmodel;
          DialogueController.__super__.constructor.call(this, $scope);
          $scope.showNewChannelDialogue = function(show) {
            return $scope.newChannelDialogue = show;
          };
        }

        return DialogueController;

      })(_Controller);
      return DialogueController;
    }
  ]);

  angular.module('WebChat').factory('_GroupListController', [
    '_Controller', '_InviteUserMessage', '_InviteGroupMessage', 'GroupModel', 'UserModel', function(_Controller, _InviteUserMessage, _InviteGroupMessage, GroupModel, UserModel) {
      var GroupListController;
      GroupListController = (function(_super) {

        __extends(GroupListController, _super);

        function GroupListController($scope) {
          var _this = this;
          GroupListController.__super__.constructor.call(this, $scope);
          this.groupmodel = GroupModel;
          this.usermodel = UserModel;
          $scope.inviteUser = function(userId, value) {
            return _this.simpleChannelMessage(userId, _InviteUserMessage, value);
          };
          $scope.inviteGroup = function(groupId, value) {
            return _this.simpleChannelMessage(groupId, _InviteGroupMessage, value);
          };
        }

        return GroupListController;

      })(_Controller);
      return GroupListController;
    }
  ]);

  angular.module('WebChat').factory('_Controller', [
    '_SendMessage', 'WebChatWebSocket', 'ActiveChannel', function(_SendMessage, WebChatWebSocket, ActiveChannel) {
      var Controller;
      Controller = (function() {

        function Controller($scope) {
          var _this = this;
          this.getActiveChannelId = function() {
            return ActiveChannel.getActiveChannelId();
          };
          this.setActiveChannelId = function(id) {
            return ActiveChannel.setActiveChannelId(id);
          };
          this.simpleChannelMessage = function(id, Msg, value) {
            var activeChannelId, message;
            activeChannelId = _this.getActiveChannelId();
            if (activeChannelId !== null) {
              return message = new Msg(id, activeChannelId, value);
            }
          };
          this.sendMessage = function(Msg) {
            return WebChatWebSocket.sendJSON(message.serialize());
          };
          $scope.getActiveChannelId = function() {
            return _this.getActiveChannelId();
          };
        }

        return Controller;

      })();
      return Controller;
    }
  ]);

  angular.module('WebChat').factory('_ChannelListController', [
    '_Controller', '_JoinMessage', 'ChannelModel', function(_Controller, _JoinMessage, ChannelModel) {
      var ChannelListController;
      ChannelListController = (function(_super) {

        __extends(ChannelListController, _super);

        function ChannelListController($scope) {
          var _this = this;
          ChannelListController.__super__.constructor.call(this, $scope);
          this.channelmodel = ChannelModel;
          $scope.channels = this.channelmodel.getItems();
          $scope.join = function(id) {
            var message;
            message = new _JoinMessage(id);
            _this.sendMessage(message);
            _this.setActiveChannelId(id);
            return $scope.selected = id;
          };
        }

        return ChannelListController;

      })(_Controller);
      return ChannelListController;
    }
  ]);

  angular.module('WebChat').controller('ChannelListController', [
    '$scope', '_ChannelListController', function($scope, _ChannelListController) {
      return new _ChannelListController($scope);
    }
  ]);

  angular.module('WebChat').controller('GroupListController', [
    '$scope', '_GroupListController', function($scope, _GroupListController) {
      return new _GroupListController($scope);
    }
  ]);

  angular.module('WebChat').controller('MessageController', [
    '$scope', '_MessageController', function($scope, _MessageController) {
      return new _MessageController($scope);
    }
  ]);

  angular.module('WebChat').controller('GroupsInChannelController', [
    '$scope', '_GroupsInChannelController', function($scope, _GroupsInChannelController) {
      return new _GroupsInChannelController($scope);
    }
  ]);

  angular.module('WebChat').controller('FilesInChannelController', [
    '$scope', '_FilesInChannelController', function($scope, _FilesInChannelController) {
      return new _FilesInChannelController($scope);
    }
  ]);

  angular.module('WebChat').controller('DialogueController', [
    '$scope', '_DialogueController', function($scope, _DialogueController) {
      return new _DialogueController($scope);
    }
  ]);

  angular.module('WebChat').factory('_GroupsInChannelController', [
    '_Controller', '_ModUserMessage', '_ModGroupMessage', '_ReadonlyUserMessage', '_ReadonlyGroupMessage', '_InviteGroupMessage', '_InviteUserMessage', 'ChannelModel', 'GroupModel', 'UserModel', function(_Controller, _ModUserMessage, _ModGroupMessage, _ReadonlyUserMessage, _ReadonlyGroupMessage, _InviteGroupMessage, _InviteUserMessage, ChannelModel, GroupModel, UserModel) {
      var GroupsInChannelController;
      GroupsInChannelController = (function(_super) {

        __extends(GroupsInChannelController, _super);

        function GroupsInChannelController($scope) {
          var _this = this;
          GroupsInChannelController.__super__.constructor.call(this, $scope);
          this.channelmodel = ChannelModel;
          this.groupmodel = GroupModel;
          this.usermodel = UserModel;
          $scope.inviteUser = function(userId, value) {
            return _this.simpleChannelMessage(userId, _InviteUserMessage, value);
          };
          $scope.inviteGroup = function(groupId, value) {
            return _this.simpleChannelMessage(groupId, _InviteGroupMessage, value);
          };
          $scope.modUser = function(userId, value) {
            return _this.simpleChannelMessage(userId, _ModUserMessage, value);
          };
          $scope.modGroup = function(groupId, value) {
            return _this.simpleChannelMessage(groupId, _ModGroupMessage, value);
          };
          $scope.readonlyUser = function(userId, value) {
            return _this.simpleChannelMessage(userId, _ReadonlyUserMessage, value);
          };
          $scope.readonlyGroup = function(groupId, value) {
            return _this.simpleChannelMessage(groupId, _ReadonlyGroupMessage, value);
          };
        }

        return GroupsInChannelController;

      })(_Controller);
      return GroupsInChannelController;
    }
  ]);

  angular.module('WebChat').factory('_MessageController', [
    '_Controller', '_SendMessage', 'GroupModel', 'UserModel', 'MessageModel', function(_Controller, _SendMessage, GroupModel, UserModel, MessageModel) {
      var MessageController;
      MessageController = (function(_super) {

        __extends(MessageController, _super);

        function MessageController($scope) {
          MessageController.__super__.constructor.call(this, $scope);
          this.groupmodel = GroupModel;
          this.usermodel = UserModel;
          this.messagemodel = MessageModel;
        }

        return MessageController;

      })(_Controller);
      return MessageController;
    }
  ]);

  angular.module('WebChat').factory('_FilesInChannelController', [
    '_Controller', '_DeleteFileMessage', 'FileModel', function(_Controller, _DeleteFileMessage, FileModel) {
      var FilesInChannelController;
      FilesInChannelController = (function(_super) {

        __extends(FilesInChannelController, _super);

        function FilesInChannelController($scope) {
          FilesInChannelController.__super__.constructor.call(this, $scope);
          this.filemodel = FileModel;
        }

        return FilesInChannelController;

      })(_Controller);
      return FilesInChannelController;
    }
  ]);

  angular.module('WebChat').filter('userInChannel', function() {
    return function(users, args) {
      var result, user, _i, _len, _ref;
      result = [];
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        if (_ref = user.id, __indexOf.call(args.users, _ref) >= 0) {
          result.push(user);
        }
      }
      return result;
    };
  });

  angular.module('WebChat').filter('groupInChannel', function() {
    return function(groups, args) {
      var group, result, _i, _len, _ref;
      result = [];
      for (_i = 0, _len = groups.length; _i < _len; _i++) {
        group = groups[_i];
        if (_ref = group.id, __indexOf.call(args.groups, _ref) >= 0) {
          result.push(group);
        }
      }
      return result;
    };
  });

  angular.module('WebChat').filter('userInGroup', function() {
    return function(users, args) {
      var groupId, result, user, _i, _j, _len, _len1, _ref;
      result = [];
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        _ref = user.groups;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          groupId = _ref[_j];
          if (args.groupid === groupId) {
            result.push(user);
          }
        }
      }
      return result;
    };
  });

}).call(this);
