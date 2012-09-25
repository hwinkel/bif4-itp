// Generated by CoffeeScript 1.3.3
/*
This handels all managers and the reloading of json data
*/

var MainManager;

MainManager = (function() {

  function MainManager(domain, path, ssl) {
    var ws_url,
      _this = this;
    if (domain == null) {
      domain = document.location.host;
    }
    if (path == null) {
      path = "/websocket";
    }
    this.ssl = ssl != null ? ssl : false;
    if (this.ssl) {
      ws_url = "wss://" + domain + path;
      console.log("using ssl");
    } else {
      ws_url = "ws://" + domain + path;
    }
    this.keep_alive_interval = 30;
    this.channels = new ChannelManager(function() {
      return _this.init_managers();
    }, this);
    this.managers_initialized = 0;
    this.init_websocket(ws_url);
  }

  MainManager.prototype.init_managers = function() {
    this.managers_initialized++;
    if (this.managers_initialized === 4) {
      console.log("All managers initialized");
      return this.channels.init_ui();
    }
  };

  MainManager.prototype.init_keep_alive = function() {
    var _this = this;
    console.log("setting keep alive interval to " + this.keep_alive_interval + " seconds");
    return this.keep_alive_timer = setInterval(function() {
      return _this.send_keep_alive();
    }, this.keep_alive_interval * 1000);
  };

  MainManager.prototype.init_websocket = function(ws_url) {
    var Socket,
      _this = this;
    console.log("initializing websockets on " + ws_url);
    Socket = window['MozWebSocket'] || window['WebSocket'];
    try {
      this.connection = new Socket(ws_url);
      this.connection.onopen = function() {
        var init_msg;
        window.onbeforeunload = function() {
          return _this.close_websocket();
        };
        _this.init_keep_alive();
        init_msg = {
          type: "init",
          data: {}
        };
        return _this.send_websocket(init_msg);
      };
      this.connection.onmessage = function(event) {
        return _this.rcv_websocket(JSON.parse(event.data));
      };
      this.connection.onclose = function() {
        return console.log("closed websocket");
      };
      return this.connection.onerror = function() {
        return console.log("websocket error occured");
      };
    } catch (error) {
      return console.log("Cant connect to " + ws_url);
    }
  };

  MainManager.prototype.send_websocket = function(msg) {
    msg = JSON.stringify(msg);
    console.log("sending from websocket " + msg);
    return this.connection.send(msg);
  };

  MainManager.prototype.rcv_websocket = function(data) {
    console.log("received from websocket " + JSON.stringify(data));
    if (data.init) {
      switch (data.type) {
        case "user":
          return this.channels.init_user(data.data);
        case "activeuser":
          return this.channels.init_active_user(data.data);
        case "group":
          return this.channels.init_group(data.data);
        case "channel":
          return this.channels.init(data.data);
        case "file":
          return this.channels.init_file(data.data);
        case "message":
          return this.channels.init_stream(data.data);
        case "status":
          return this.status_msg(data.data);
      }
    } else {
      switch (data.type) {
        case "user":
          return this.channels.input_user(data.data, data.actions);
        case "group":
          return this.channels.input_group(data.data, data.actions);
        case "channel":
          return this.channels.input(data.data, data.actions);
        case "file":
          return this.channels.input_file(data.data, data.actions);
        case "message":
          return this.channels.input_stream(data.data, data.actions);
        case "status":
          return this.status_msg(data.data);
      }
    }
  };

  MainManager.prototype.close_websocket = function() {
    console.log("closing websocket");
    return this.connection.close();
  };

  MainManager.prototype.send_keep_alive = function() {
    var message;
    message = {
      type: "ping",
      data: {}
    };
    return this.send_websocket(message);
  };

  MainManager.prototype.status_msg = function(data) {
    console.log("received status " + JSON.stringify(data));
    if (data.level === "ok") {
      return true;
    } else {
      return alert(data.msg);
    }
  };

  MainManager.prototype.json_query = function(url) {
    console.log("querying " + url);
    return $.getJSON(url, function(data) {
      return data;
    });
  };

  MainManager.prototype.send_msg = function(msg, type) {
    var channel_id, message;
    if (type === "text" && msg.charAt(msg.length - 1) === "\n") {
      msg = msg.slice(0, -1);
    }
    channel_id = this.channels.get_active_channel();
    if (channel_id !== void 0) {
      channel_id = parseInt(channel_id);
      message = {};
      if (msg.indexOf("/topic ") === 0 && type === "text") {
        return this.change_topic(msg.substr(7));
      } else {
        message = {
          type: "message",
          data: {
            message: msg,
            type: type,
            channel: [channel_id]
          }
        };
        return this.send_websocket(message);
      }
    }
  };

  MainManager.prototype.complete_name = function(val) {
    return this.channels.complete_name(val);
  };

  MainManager.prototype.reset_invite_selection = function() {
    return this.channels.reset_invite_selection();
  };

  MainManager.prototype.invite_user = function(user_id) {
    return this.invite_msg([user_id], []);
  };

  MainManager.prototype.invite_group = function(group_id) {
    return this.invite_msg([], [group_id]);
  };

  MainManager.prototype.invite_selection = function() {
    var groups, selected_users_and_groups, users;
    selected_users_and_groups = this.channels.get_invite_selection();
    users = selected_users_and_groups.users;
    groups = selected_users_and_groups.groups;
    return this.invite_msg(users, groups);
  };

  MainManager.prototype.invite_msg = function(users, groups) {
    var channel_id, msg;
    channel_id = parseInt(this.channels.get_active_channel());
    msg = {
      type: "invite",
      data: {
        channel: channel_id,
        users: users,
        groups: groups
      }
    };
    if (users.length > 0 || groups.length > 0) {
      return this.send_websocket(msg);
    }
  };

  MainManager.prototype.create_channel = function(name, topic, is_public) {
    var msg;
    msg = {
      type: "newchannel",
      data: {
        name: name,
        topic: topic,
        is_public: is_public
      }
    };
    if (name !== "") {
      return this.send_websocket(msg);
    }
  };

  MainManager.prototype.change_topic = function(topic, channel_id) {
    var message;
    if (channel_id == null) {
      channel_id = this.channels.get_active_channel();
    }
    message = {
      type: "channeltopic",
      data: {
        topic: topic,
        channel: parseInt(channel_id)
      }
    };
    return this.send_websocket(message);
  };

  MainManager.prototype.change_channel_name = function(name, channel_id) {
    var message;
    if (channel_id == null) {
      channel_id = this.channels.get_active_channel();
    }
    message = {
      type: "channelname",
      data: {
        name: name,
        channel: parseInt(channel_id)
      }
    };
    return this.send_websocket(message);
  };

  MainManager.prototype.delete_channel = function(channel_id) {
    var message;
    if (channel_id == null) {
      channel_id = this.channels.get_active_channel();
    }
    message = {
      type: "channeldelete",
      data: {
        channel: parseInt(channel_id)
      }
    };
    return this.send_websocket(message);
  };

  MainManager.prototype.close_channel = function(channel_id) {
    var message;
    if (channel_id == null) {
      channel_id = this.channels.get_active_channel();
    }
    channel_id = parseInt(channel_id);
    message = {
      type: "channelclose",
      data: {
        channel: channel_id
      }
    };
    return this.send_websocket(message);
  };

  MainManager.prototype.update_profile = function(args) {
    var message;
    message = {
      type: "profileupdate",
      data: {
        username: args.username,
        prename: args.prename,
        lastname: args.lastname,
        password: args.password,
        email: args.email
      }
    };
    return this.send_websocket(message);
  };

  MainManager.prototype.kick_group = function(group_id) {
    return this.kick_msg([group_id], []);
  };

  MainManager.prototype.kick_user = function(user_id) {
    return this.kick_msg([], [user_id]);
  };

  MainManager.prototype.kick_msg = function(group_ids, user_ids) {
    var channel_id, message;
    if (group_ids == null) {
      group_ids = [];
    }
    if (user_ids == null) {
      user_ids = [];
    }
    channel_id = parseInt(this.channels.get_active_channel());
    message = {
      type: "kick",
      data: {
        channel: channel_id,
        users: user_ids,
        groups: group_ids
      }
    };
    return this.send_websocket(message);
  };

  MainManager.prototype.delete_file = function(file_id) {
    var message;
    message = {
      type: "filedelete",
      data: {
        file: parseInt(file_id)
      }
    };
    return this.send_websocket(message);
  };

  MainManager.prototype.join = function(channel_id) {
    var msg;
    msg = {
      type: "join",
      data: {
        channel: parseInt(channel_id)
      }
    };
    return this.send_websocket(msg);
  };

  return MainManager;

})();