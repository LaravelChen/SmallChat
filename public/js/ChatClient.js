/**
 * Created by LaravelChen on 2017/11/9.
 * Swoole的客户端
 */
$(function () {
    chat.init();
    $("#send_message").click(function () {
        chat.sendMsg();
    });
    $("#send_private_message").click(function () {
        chat.sendPrivateMessage();
    });
});
var config = {
    server: "ws://127.0.0.1:9502",
}

var chat = {
    data: {
        Client: null,
        to_user_fd: null
    },
    init: function () {
        this.data.Client = new WebSocket(config.server);
        this.open();
        this.messages();
        this.close();
        this.error();
    },
    open: function () {
        this.data.Client.onopen = function (evt) {
            chat.notice("服务器连接成功!", "green");
        }
    },
    messages: function () {
        this.data.Client.onmessage = function (evt) {
            var server_data = JSON.parse(evt.data);
            switch (server_data.type) {
                case 'open':
                    chat.appendUser(server_data.user);
                    chat.showMessage(server_data.message);
                    break;
                case 'close':
                    chat.removeUser(server_data.user);
                    chat.showMessage(server_data.message);
                    break;
                case 'public_message':
                    chat.showMessage(JSON.parse(server_data.message));
                    break;
                case 'private_message':
                    console.log(server_data.message);
                    chat.showPrivateMessage(server_data.message);
                    break;
                case 'openSuccess':
                    chat.showUsersList(server_data.all);
                    break;
                default:
                    break;
            }
        }
    },
    close: function () {
        this.data.Client.onclose = function (evt) {
            chat.notice("服务器连接关闭!", "red");
        }
    },
    error: function () {
        this.data.Client.onerror = function (evt) {
            chat.notice("服务器出现错误", "red");
        }
    },
    notice: function (msg, level) {
        $("#warning_error").html('<span  style="color:' + level + ' ">' + msg + '</span>');
    },
    showMessage: function (msg) {
        message = '<article class="media"> <div class="media-left"> <figure class="image is-48x48"> ' +
            '<img class="is-circle is-circle-o" src="' + msg.user.avatar + '"> </figure> </div>' +
            ' <div class="media-content"> <div class="content"> <p> <strong class="color_green">' + msg.user.name + '</strong> <br>' + msg.data + ' </p> </div> </div> </article>';
        $("#article_content").append(message);
    },
    showPrivateMessage: function (msg) {
        message = '<article class="media"> <div class="media-left"> <figure class="image is-48x48"> ' +
            '<img class="is-circle is-circle-o" src="' + msg.user.avatar + '"></figure> </div>' +
            ' <div class="media-content"> <div class="content"><p><strong class="color_green">' + msg.user.name + '</strong> <br>' + msg.data + '</p></div> </div> </article>';
        $("#private_article_content").append(message);
    },
    appendUser: function (msg) {
        message = chat.userListHtml(msg);
        $("#client_user_list").append(message);
    },
    showUsersList: function (msg) {
        for (var i = 0; i < msg.length; i++) {
            message = chat.userListHtml(msg[i]);
            $("#client_user_list").append(message);
        }
    },
    removeUser: function (msg) {
        console.log(msg.fd);
        $(".fd-" + msg.fd).remove();
    },
    userListHtml: function (msg) {
        return message = '<li class="fd-' + msg.fd + '"> <div class="dropdown is-hoverable width_100"> <div class="dropdown-trigger"> <div class="media"> <div class="media-left"> <img src="' + msg.avatar + '"class="image is-35x35 is-circle is-circle-o"> </div>' +
            ' <div class="media-content hidder_100"> <p class="subtitle is-6 margin_top_6">' + msg.name + '</p> </div> </div>' +
            ' </div> <div class="dropdown-menu" id="dropdown-menu3" role="menu"> ' +
            '<div class="dropdown-content"> <a onclick="chat.chatSingle(' + msg.fd + ')" class="dropdown-item"> 私聊 </a> </div> </div> </div> </li>';
    },
    sendMsg: function () {
        var content = $("#content").val();
        var data = {"type": "public", "data": {"message": content}};
        if (content) {
            //发送内容
            this.data.Client.send(JSON.stringify(data));
            $("#content").val("");
        }
    },
    sendPrivateMessage: function () {
        var content = $("#private_content").val();
        var data = {"type": "private", "data": {"message": content, "to_user_fd": this.data.to_user_fd}};
        if (content) {
            //发送内容
            this.data.Client.send(JSON.stringify(data));
        }
        $("#private_content").val("");
    },
    chatSingle: function (to_user_fd) {
        $(".modal").addClass("is-active");
        this.data.to_user_fd = to_user_fd;
    },
}

