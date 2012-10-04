(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  __t('messages').ModGroupMessage = (function(_super) {

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

  })(Message);

}).call(this);
