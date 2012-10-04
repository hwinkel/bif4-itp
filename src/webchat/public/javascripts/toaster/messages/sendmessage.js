(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  __t('messages').SendMessage = (function(_super) {

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

  })(Message);

}).call(this);
