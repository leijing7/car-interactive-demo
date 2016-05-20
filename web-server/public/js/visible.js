/**
 * Created by Lon on 2014/12/3.
 */
var pomelo = window.pomelo;
var host = window.location.hostname;
var port = "3010";
var inited = false;
var currentControlDevice = '';

pomelo.on('addDevice', function (data) {
    currentControlDevice = data.deviceId;
    console.log('New Device Connected In');
    console.log(data);
    document.getElementById('container').style.display = 'none';
    // avoid duplicate load viewport
    if(!inited){
        init();
        inited = true;
    }else{
        // ON LOAD COMPLETE
        pomelo.notify('connector.controlHandler.echo', {
            type: 'loaded',
            controlDevice: currentControlDevice
        });
    }
});
//alert('im ie');
pomelo.init({
    host: host,
    port: port,
    log: true
}, function () {
    pomelo.request("connector.entryHandler.visibleDevice", function (data) {
        var url = 'http://' + window.location.host + '/control/' + data.visibleDevice;
        //alert(url);
        console.log(url);
        jQuery('#output').qrcode({
            text: url,
            background: '#ccc',
            width: 280,
            height: 280,
            foreground: "#333"
        });
    });
});