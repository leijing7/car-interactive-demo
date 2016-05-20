var console = require('console');

module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.visibleDevice = function (msg, session, next) {

    var uid = new Buffer(''+ new Date().valueOf() + session.__session__.__socket__.remoteAddress.ip).toString('base64');

    var sessionService = this.app.get('sessionService');

    //duplicate log in
    // TODO:
    // uid 被占用，设计新的uid哈希算法
    if(!!sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });

        return;
    }

    session.bind(uid);
    session.on('closed', onChannelClosed.bind(null, this.app));

    var channelService = this.app.channelService;
    var channel = channelService.getChannel('c:' + uid, true);

    channel.add(uid, this.app.getServerId());

    next(null, {visibleDevice: uid});
};

/**
 * New client control.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.controlDevice = function (msg, session, next) {
    var uid = new Buffer(''+ new Date().valueOf() + session.__session__.__socket__.remoteAddress.ip).toString('base64');

    var sessionService = this.app.get('sessionService');

    //duplicate log in
    if(!!sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });

        return;
    }

    session.bind(uid);
    session.set('visibleDevice', msg.visibleDevice);
    session.push('visibleDevice', function(err) {
        if(err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });
    session.on('closed', onUserLeave.bind(null, this.app));

    var channelService = this.app.get("channelService");
    var channel = channelService.getChannel("c:" + msg.visibleDevice);

    if(!channel) {
        next(null, {content: 'CHANNEL_NOT_FOUND'});
        return;
    }

    channel.add(uid, this.app.getServerId());

    channelService.pushMessageByUids('addDevice', {deviceId: uid}, [{
        uid: session.get('visibleDevice'),
        sid: this.app.getServerId()
    }]);

    next();
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function (app, session) {

    var channel = app.channelService.getChannel('c:' + session.get('visibleDevice'), false);
    if (!session || !session.uid) {
        return;
    }
    // leave channel
    if (!!channel) {
        channel.leave(session.uid, app.getServerId());
    }
};

var onChannelClosed = function (app, session) {

    var channel = app.channelService.getChannel('c:' + session.uid, false);
    if (!session || !session.uid) {
        return;
    }
    // leave channel
    if (!!channel) {
        channel.destroy();
    }
};
