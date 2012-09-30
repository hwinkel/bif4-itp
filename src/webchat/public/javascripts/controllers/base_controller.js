// Generated by CoffeeScript 1.3.3
(function() {

  window.WebChat || (window.WebChat = {});

  window.WebChat.BaseController = (function() {

    function _Class($scope, type) {
      var _this = this;
      this.$scope = $scope;
      this.type = type;
      this.$scope.items = [];
      this.$scope.$on('message', function(scope, message) {
        if (_this.canHandle(message.type)) {
          return _this.$scope.$apply(function() {
            switch (message.action) {
              case 'update':
                return _this.update(message.data);
              case 'create':
                return _this.create(message.data);
              case 'delete':
                return _this["delete"](message.data);
            }
          });
        }
      });
    }

    _Class.prototype.create = function(item) {
      return this.$scope.items.push(item);
    };

    _Class.prototype.update = function(updatedItem) {
      var counter, item, _i, _len, _ref, _results;
      console.log(this.$scope.items);
      console.log(updatedItem);
      _ref = this.$scope.items;
      _results = [];
      for (counter = _i = 0, _len = _ref.length; _i < _len; counter = ++_i) {
        item = _ref[counter];
        if (item.id === updatedItem.id) {
          _results.push(this.$scope.items[counter] = updatedItem);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    _Class.prototype["delete"] = function(removedItem) {
      var counter, item, removeItemId, _i, _len, _ref;
      removeItemId = -1;
      _ref = this.$scope.items;
      for (counter = _i = 0, _len = _ref.length; _i < _len; counter = ++_i) {
        item = _ref[counter];
        if (item.id === removedItem.id) {
          removeItemId = counter;
        }
      }
      if (removeItemId >= 0) {
        return this.$scope.items.splice(removeItemId, 1);
      }
    };

    _Class.prototype.getItemById = function(id) {
      var item, _i, _len, _ref;
      _ref = this.$scope.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.id === id) {
          return item;
        }
      }
    };

    _Class.prototype.canHandle = function(messageTypes) {
      var type, _i, _len;
      messageTypes = messageTypes.split('|');
      for (_i = 0, _len = messageTypes.length; _i < _len; _i++) {
        type = messageTypes[_i];
        if (type === this.type) {
          return true;
        }
      }
      return false;
    };

    return _Class;

  })();

}).call(this);
