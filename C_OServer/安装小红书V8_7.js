define("version", "9.0.u1254303");
define("resolution", "1080*1920");
define("requireVersion", "3.4.0");


var device = Device.searchObject(sigmaConst.DevSelectOne)

printf(device.name + " --- 开始安装小红书V8.7版本")

var ret =  device.adb("install A:\\apk\\xhsv8.7.apk");
if (ret != 0) {
    print(device.name +"----成功安装小红书 V8.7 APK");

} else {
    print(device.name + "----安装失败 --- " + lastError());
}
