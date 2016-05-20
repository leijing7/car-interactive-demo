var console = require('console');

module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

/**
 * New client control.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.control = function (msg, session, next) {

    var channelService = this.app.get("channelService");
    var channel = channelService.getChannel("c:" + session.get('visibleDevice'));

    if(!channel) {
        channelService.pushMessageByUids('close', {code: 404, error: true, content: "VISIBLE_DEVICE_CLOSED"}, [{
            uid: session.uid,
            sid: this.app.getServerId()
        }]);

        return;
    }


    // TODO:
    // 处理两个人同时操作一个可视设备
    channelService.pushMessageByUids(msg.type, msg.data, [{
        uid: session.get('visibleDevice'),
        sid: this.app.getServerId()
    }]);

    next();
};


/**
 * Display client echo message to control device
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.echo = function (msg, session, next) {

    var channelService = this.app.get("channelService");

    // TODO:
    // 处理两个人同时操作一个可视设备
    channelService.pushMessageByUids(msg.type, {}, [{
        uid: msg.controlDevice,
        sid: this.app.getServerId()
    }]);

    next();
};