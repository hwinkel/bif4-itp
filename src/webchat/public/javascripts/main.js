// Generated by CoffeeScript 1.3.3

$(document).ready(function() {
  var allow_submit, keycodes, manager, password_check, submit;
  manager = new MainManager();
  keycodes = new KeyCodes();
  $(".channels_link").click(function() {
    if (!$("#channel_sidebar #channels").is(":visible")) {
      $("#channel_sidebar #groups").fadeOut("fast", function() {
        return $("#channel_sidebar #channels").fadeIn("fast");
      });
    }
    return false;
  });
  $(".groups_link").click(function() {
    if (!$("#channel_sidebar #groups").is(":visible")) {
      $("#channel_sidebar #channels").fadeOut("fast", function() {
        return $("#channel_sidebar #groups").fadeIn("fast");
      });
    }
    return false;
  });
  $("#input_field").focus();
  $("#input_field").keydown(function(e) {
    if (e.keyCode === keycodes.tab) {
      $(this).val(manager.complete_name($(this).val()));
    }
    if (e.keyCode === keycodes.enter && !e.shiftKey) {
      console.log(keycodes.shift_pressed);
      e.preventDefault();
      return submit();
    }
  });
  $("#input_field").keydown(function(e) {
    if (e.keyCode === keycodes.tab) {
      return false;
    }
    if (e.keyCode === keycodes.enter) {
      if ($(this).val() === "") {
        return false;
      }
    }
  });
  $("#input_send").click(function(e) {
    return submit();
  });
  $("body").keyup(function(e) {
    if (e.keyCode === keycodes.escape) {
      $(".popup_window:visible").fadeOut("fast");
      $(".popup_wrapper:visible").fadeOut("fast");
    }
    if (e.keyCode === keycodes.enter) {
      return $(".popup_window:visible .submit").each(function() {
        if ($(this).attr("disabled") !== "disabled") {
          return $(this).trigger("click");
        }
      });
    }
  });
  submit = function() {
    var msg, type;
    type = $("#input_options option:selected").val();
    msg = $("#input_field").val();
    $("#input_field").val("");
    if (msg.length > 0) {
      return manager.send_msg(msg, type);
    }
  };
  $(".popup_wrapper").click(function() {
    $(".popup_wrapper:visible").fadeOut("fast");
    return $(".popup_window:visible").fadeOut("fast");
  });
  $(".popup_window .cancel").click(function() {
    $(".popup_wrapper:visible").fadeOut("fast");
    return $(".popup_window:visible").fadeOut("fast");
  });
  $("#streams a.change_topic").live("click", function() {
    var topic;
    $(".popup_wrapper").fadeIn("fast");
    $("#change_topic_window").fadeIn("fast");
    topic = $(this).parent().parent().siblings(".stream_meta").children(".topic").html();
    return $("#change_topic_window #change_topic").html(topic);
  });
  $("#change_topic_window .submit").click(function() {
    var topic;
    topic = $("#change_topic_window #change_topic").val();
    manager.change_topic(topic);
    $(".popup_wrapper").fadeOut("fast");
    return $("#change_topic_window").fadeOut("fast");
  });
  $("#streams a.change_channel_name").live("click", function() {
    var name;
    $(".popup_wrapper").fadeIn("fast");
    $("#change_channel_name_window").fadeIn("fast");
    name = $(this).parent().siblings("span").html();
    return $("#change_channel_name_window #change_channel_name").val(name);
  });
  $("#change_channel_name_window .submit").click(function() {
    var name;
    name = $("#change_channel_name_window #change_channel_name").val();
    manager.change_channel_name(name);
    $(".popup_wrapper").fadeOut("fast");
    return $("#change_channel_name_window").fadeOut("fast");
  });
  $("#streams a.delete_channel").live("click", function() {
    var name;
    $(".popup_wrapper").fadeIn("fast");
    $("#delete_channel_window").fadeIn("fast");
    name = $(this).parent().siblings("span").html();
    return $("#delete_channel_window #delete_channel").html(name);
  });
  $("#delete_channel_window .submit").click(function() {
    manager.delete_channel();
    $(".popup_wrapper").fadeOut("fast");
    return $("#delete_channel_window").fadeOut("fast");
  });
  $("#streams a.close_channel").live("click", function() {
    var name;
    $(".popup_wrapper").fadeIn("fast");
    $("#close_channel_window").fadeIn("fast");
    name = $(this).parent().siblings("span").html();
    return $("#close_channel_window #close_channel").html(name);
  });
  $("#close_channel_window .submit").click(function() {
    manager.close_channel();
    $(".popup_wrapper").fadeOut("fast");
    return $("#close_channel_window").fadeOut("fast");
  });
  $("#edit_profile_link").click(function() {
    $(".popup_wrapper").fadeIn("fast");
    return $("#edit_profile_window").fadeIn("fast");
  });
  $("#edit_profile_window .submit").click(function() {
    var data;
    data = {};
    data.username = $("#edit_profile_window #edit_profile_username").val();
    data.prename = $("#edit_profile_window #edit_profile_first_name").val();
    data.lastname = $("#edit_profile_window #edit_profile_last_name").val();
    data.password = $("#edit_profile_window #edit_profile_password").val();
    data.repeat_password = $("#edit_profile_window #edit_profile_password_repeat").val();
    data.email = $("#edit_profile_window #edit_profile_email").val();
    manager.update_profile(data);
    $(".popup_wrapper").fadeOut("fast");
    return $("#edit_profile_window").fadeOut("fast");
  });
  $("#edit_profile_window #edit_profile_password").keyup(function() {
    if (password_check($("#edit_profile_password"), $("#edit_profile_password_repeat"))) {
      return allow_submit($("#edit_profile_window .submit"), true);
    } else {
      return allow_submit($("#edit_profile_window .submit"), false);
    }
  });
  $("#edit_profile_window #edit_profile_password_repeat").keyup(function() {
    if (password_check($("#edit_profile_password"), $("#edit_profile_password_repeat"))) {
      return allow_submit($("#edit_profile_window .submit"), true);
    } else {
      return allow_submit($("#edit_profile_window .submit"), false);
    }
  });
  password_check = function(input, repeat_input) {
    if (input.val() === repeat_input.val()) {
      input.removeClass("no_match");
      repeat_input.removeClass("no_match");
      return true;
    } else {
      input.removeClass("no_match");
      repeat_input.removeClass("no_match");
      return false;
    }
  };
  allow_submit = function(submit_button, enabled) {
    if (enabled) {
      return submit_button.removeAttr("disabled");
    } else {
      return submit_button.attr("disabled", "disabled");
    }
  };
  $("#channel_sidebar #channels .utils .newchannel").click(function() {
    $(".popup_wrapper").fadeIn("fast");
    $("#newchannel_window").fadeIn("fast");
    $("#newchannel_window #newchannel_name").val("");
    $("#newchannel_window #newchannel_topic").val("");
    return $("#newchannel_window #newchannel_public").prop("checked", false);
  });
  $("#newchannel_window .submit").click(function() {
    var is_public, name, topic;
    name = $("#newchannel_window #newchannel_name").val();
    topic = $("#newchannel_window #newchannel_topic").val();
    is_public = $("#newchannel_window #newchannel_public").is(":checked");
    manager.create_channel(name, topic, is_public);
    $(".popup_wrapper").fadeOut("fast");
    return $("#newchannel_window").fadeOut("fast");
  });
  $("#info_sidebar #channel_info .utils .invite").click(function() {
    $(".popup_wrapper").fadeIn("fast");
    $("#invite_window").fadeIn("fast");
    $("#invite_filter").focus();
    manager.reset_invite_selection();
    $("#invite_window #invite_filter").val("");
    return $("#invite_window #selected_preview .select_list ul li").each(function() {
      return $(this).show();
    });
  });
  $("#invite_window .submit").click(function() {
    $(".popup_wrapper").fadeOut("fast");
    $("#invite_window").fadeOut("fast");
    return manager.invite_selection();
  });
  return $("#invite_window #invite_filter").keyup(function() {
    var text;
    text = $(this).val();
    console.log(text);
    return $("#invite_window #selected_preview .select_list ul li").each(function() {
      if ($(this).html().toLowerCase().indexOf(text) !== -1) {
        return $(this).show();
      } else {
        return $(this).hide();
      }
    });
  });
});
