define("version", "9.0.u1254303");
define("resolution", "1080*1920");
define("requireVersion", "3.4.0");
var device = Device.searchObject(sigmaConst.DevSelectOne);
// 创建手机对象
// var device = Device.getMain();
if (!device) {
    print(device.name + "Cannot find device");
    throw "Cannot find device";
};
const dic = {}
var key_dict = ['旅游', '秋季穿搭', '穿搭', '美甲']
for (var o = 0; o < 3; o++) {
    print('第'+ o +'遍')
    try {
        var runAppName = "com.xingin.xhs"
        var runapp = device.runApp(runAppName);
        delay(1000);
        ret = get_Activity()
        if (runapp == 0 && ret.indexOf('com.xingin.xhs') != -1) {
            if (ret.indexOf('intersitial.ui') != -1) {
                device.click(960, 130, tcConst.STATE_PRESS);
                print(device.name + "关闭广告");
                delay(1000);
            }
            run()
        } else {
            print(device.name + '打开小红书失败');
            delay(2000);
        }
    } catch (err) {
        print(device.name + err);
    }
    delay(randomNum(600, 1000))
}

// 列表页随机点击
function personate_list(num) {
    var num = randomNum(1, num)
    if (num == 1) {
        for (var ii = 0; ii < 3; ii++) {
            device.click(randomNum(100, 1000), randomNum(500, 2000), tcConst.STATE_PRESS);
            delay(1000)
            var detail_activity4 = get_Activity();
            //  判断是否为详情页
            if (detail_activity4.indexOf("notedetail.NoteDetailActivity") != -1 || detail_activity4.indexOf("detail.activity.DetailFeedActivity")) {
                print(device.name + '列表页随机点击')
                personate_detail('3')
                break
            }
        }
    };
}
// 内容页随机
function personate_detail(detail_type) {
    // 进入随机内容页面
    var num = randomNum(1, 10)
    if (detail_type == '3') {
        //        print(device.name + '随机内容页面')
        delay(randomNum(7000, 10000))
        if (num == 1) {
         device.sendAai({ query: "C:.ImageView&&R:.eb_", action: "click" });
         device.sendAai({ query: "C:.ImageView&&R:.dte", action: "click" });
         }
        for (var i = 0; i < randomNum(2, 5); i++) {
            delay(randomNum(1000, 3000));
            device.move(tcConst.movement.shiftDown);
        }
        delay(randomNum(1000, 3000));
        var detail_activity3 = get_Activity();
        //  判断是否为详情页
        if (detail_activity3.indexOf("search") == -1) {
            device.send(tcConst.keyCodes.KEYCODE_BACK, tcConst.STATE_PRESS);
            delay(1000);
        }        // 选定内容页面
    } else {
        print(device.name + '选定内容页面')
        if (detail_type == '1') {
            for (var ii = 0; ii < randomNum(2, 3); ii++) {
                delay(randomNum(1000, 3000))
                device.move(tcConst.movement.shiftRight);
                delay(1000)
                var author_page = device.sendAai({ query: "T:*获赞与收藏*", action: "getBounds" });
                if (author_page) {
                    delay(1000)
                    device.send(tcConst.keyCodes.KEYCODE_BACK, tcConst.STATE_PRESS);
                    break
                }
            }
            for (var i = 0; i < randomNum(4, 6); i++) {
                delay(randomNum(5000, 10000));
                device.move(tcConst.movement.shiftDown);
            }
        } else {
            delay(randomNum(30000, 40000))
        }
        author_info(detail_type)
    }
}
// 作者页面随机
function author_info(detail_type) {
    var num = randomNum(1, 10)
    var author_click = false
    for (var i = 0; i < 3; i++) {
        if (detail_type == '1') {
            if (num == 1) {
              actionWithRetry(
                  () => device.sendAai({ query: "C:.ImageView&&R:.eb_", action: "click" }),
                  3,
                  1500);
            }
            delay(1000);
            // 图片页面
            var ret = actionWithRetry(
                  () =>  device.sendAai({ query: "R:.avatarLayout", action: "click" }),
                  3,
                  1500);
            if (  ret) { author_click = true } else { reload() }
        } else {
            if (num == 1) {
              actionWithRetry(
                    () =>  device.sendAai({ query: "C:.ImageView&&R:.dte", action: "click" }),
                    3,
                    1500);

             }
            delay(1000);
            if (device.sendAai({ query: "R:.matrixAvatarView", action: "click" })) { author_click = true } else { reload() }
        }
        if (author_click) { break }
    }
    delay(1000);
    print(device.name + '进入作者页面')
    // 作者页面下滑
    for (var i = 0; i < randomNum(2, 4); i++) {
        device.move(tcConst.movement.shiftDown);
        delay(randomNum(1000, 3000));
        // 随机点击
        personate_list(5)
    }
}


function reload() {
    device.send(tcConst.KEY_RECENTAPP);
    delay(2000);
    device.send(tcConst.KEY_BACK);
    delay(3000);
}

function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}

function actionWithRetry(action, times, delayMs) {
    for (let i = 0; i < times; i++) {
        try {
            const returnValue = action();
            if (returnValue !== null) {
                return returnValue;
            } else {
                checkNetError();
                checkDeviceError();
                checkAccountError();
            }
            delay(delayMs);
        } catch (err) {
            checkNetError();
            checkDeviceError();
            checkAccountError();
            continue;
        }
        return;
    }
}

function error() {
    var error_text = device.sendAai({ query: "T:*网络好像断了*", action: "getBounds" });
    if (error_text) {
        delay(1000);
        print(device.name + '网络中断,重新点击')
        device.sendAai({ query: "C:.ImageView&&R:.dfs", action: "click" });
        delay(3000);
    }
    if (get_Activity().indexOf('xhs') == -1){
        var runAppName = "com.xingin.xhs"
        var runapp = device.runApp(runAppName);
        delay(1000);
        if (ret.indexOf('intersitial.ui') != -1) {
            device.click(960, 130, tcConst.STATE_PRESS);
            print(device.name + "关闭广告");
            delay(1000);
        }
    }
}

function click_key(author_key) {
    delay(500);
    var img  =  actionWithRetry(
          () =>  device.sendAai({ query: "T:*" + author_key + "*", action: "getBounds" }),
          3,
          1500);
    //    print(device.name + '当前页面：' + img)
    if (img) {
        delay(500);
        if (img.bounds[0][1] < 340) {
            return ''
        }
        printf(device.name + '查找到关键词：' + author_key)
        actionWithRetry(
              () =>  device.sendAai({ query: "ID:" + img.ids[0], action: "click" }),
              3,
              1500);
        delay(500);
        var detail_activity = get_Activity();
        //  判断是否为详情页
        if (detail_activity.indexOf("search.GlobalSearchActivity") == -1) {
            try {
                if (detail_activity.indexOf("notedetail.NoteDetailActivity") != -1) {
                    personate_detail("1")

                    delay(1000);
                    device.move(tcConst.movement.shiftDown);
                    // 作者
                    var author = device.sendAai({ query: "C:.TextView&&R:.nickNameTV", action: "getText" });
                    // 标题
                    var title = device.sendAai({ query: "C:.TextView&&R:.ebx", action: "getText" });
                }
                if (detail_activity.indexOf("detail.activity.DetailFeedActivity") != -1) {
                    var author = device.sendAai({ query: "C:.TextView&&R:.matrixNickNameView", action: "getText" });
                    // 标题
                    var title = device.sendAai({ query: "C:.TextView&&R:.noteContentText", action: "getText" });
                    personate_detail("2")
                }
                if (!(author)) {
                    author = { 'retval': 0 };
                };
                if (!(title)) {
                    title = { 'retval': 0 };;
                };
                printf(device.name + '作者:%s,标题:%s,', author.retval, title.retval)
            } catch (err) {
                print(device.name + "错误描述11：" + err.message);
                delay(1000);
            }
            for (var i = 0; i < 3; i++) {
                var detail_activity2 = get_Activity();
                //  判断是否为详情页
                if (detail_activity2.indexOf("IndexActivityV2") == -1) {
                    device.send(tcConst.keyCodes.KEYCODE_BACK, tcConst.STATE_PRESS);
                    delay(1000);
                }
            }
        } else {
            print(device.name + '当前页面既不是视频也不是图片');
        }
    }
}
function zuixin(key) {
    for (var q = 0; q < 3; q++) {
        if (get_Activity().indexOf('index') != -1) {
            device.click(970, 140, tcConst.STATE_PRESS);
            delay(1000);
            print(device.name + "进入小红书搜索页");
                device.exec("ime set com.sigma_rt.totalcontrol/.ap.service.SigmaIME", 5000);
                delay(1000);
        }
        try {
            // 输入关键
            var keyword = device.inputTextSync(0, key);
            // var keyword =  device.inputText(key)
            print(device.name + keyword)
            delay(2000);
          var search_text =  actionWithRetry(
                  () =>  device.sendAai({ query: "C:.EditText&&R:.dns", action: "getText" }),
                  3,
                  1500);
            print(device.name + search_text)
            if (keyword == true && search_text.retval == key) {
                print(device.name + "输入：" + key);
                break;
            } else {
                print(device.name + '判断输入关键词是否成功');
                reload()
            }
        } catch (err) {
            print(device.name + err);
            info_ids_list = []
        }
    }
    delay(1500);
    // 点击搜索按钮
    device.sendAai({ query: "C:.TextView&&R:.dnx", action: "click" });
    delay(1500)
     for (var i = 0; i < 50; i++) {
        error()
        personate_list(5)
        var slide = device.move(tcConst.movement.shiftDown);
        delay(randomNum(1000, 2000));
        if (slide != 0) {
            print(device.name + "滑动失败：" + lastError());
        }
    }
    for (var i = 0; i < 3; i++) {
    var detail_activity2 = get_Activity();
    //  判断是否为详情页
    if (detail_activity2.indexOf("index") == -1) {
        device.send(tcConst.keyCodes.KEYCODE_BACK, tcConst.STATE_PRESS);
        delay(1000);
    }
    }
}

// 滑动页面
function search_key() {
    num_page = randomNum(100, 150)
    for (var i = 0; i < 200; i++) {
        error()
        if (i == num_page){
             zuixin(key_dict[randomNum(0, key_dict.length - 1)])
            if (randomNum(1, 2)==1){
                break
            }
        }
        for (var z = 0; z < key_dict.length; z++) {
            click_key(key_dict[z]);
        }
        var slide = device.move(tcConst.movement.shiftDown);
        delay(randomNum(1000, 2000));
        if (slide != 0) {
            print(device.name + "滑动失败：" + lastError());
        }
    }
}

function run() {
    print(device.name + "打开小红书");
    if (get_Activity().indexOf('update') != -1) {
        device.sendAai({ query: "C:.ImageView&&R:.az9", action: "click" });
    }
    //对坐标(123,254)进行点击操作（按下+弹起）

    info_ids_list = []
    delay(1000);
    // 点击搜索按钮
    actionWithRetry(
          () =>    device.sendAai({ query: "C:.TextView&&R:.dnx", action: "click" }),
          3,
          1500);
    // 滑动页面
    search_key()
        // 返回搜索页
    print(device.name + '-----------------------------------')
     delay(1000);
    device.closeApp(runAppName);
}



function checkNetError() {
    for (let i = 0; i < 3; i++) {
        let errorText = device.sendAai({
            query: "T:*网络好像断了*",
            action: "getBounds",
        });
        if (errorText) {
            let click = device.sendAai({action:"click",query:"R:.f_v"});
            if (click) {
                print("INFO:>>>" + deviceName + ">>>网络错误解除成功");
                break;
            }
        }
    }
}

function checkYzm() {
    for (let kk = 0; kk < 5; kk++) {
        let yzmText = device.sendAai({
            query: "T:*请通过滑块验证*",
            action: "getBounds",
        });

        if (yzmText) {
            print("INFO:>>>" + deviceName + ">>>设备出现验证码，已暂停50秒，尽快点击");
            delay(15000);
        } else {
            break;
        }
    }
}

function checkDeviceError() {
    for (var kk = 0; kk < 3; kk++) {
        var deviceText = device.sendAai({
            query: "T:*设备异常，请尝试关闭/卸载风险插件或重启试试*",
            action: "getBounds",
        });
        if (deviceText != null) {
            var deviceClick = device.sendAai({
                query: "T:*知道了*",
                action: "click",
            });
            if (deviceClick) {
                print("INFO:>>>" + deviceName + ">>>设备错误解除成功");
                break;
            }
        }
          delay(1000);
    }
}

function checkAccountError() {
    for (var kk = 0; kk < 3; kk++) {
        var deviceText = device.sendAai({
            query: "T:*检测到账号异常，请稍后重启试试*",
            action: "getBounds",
        });
        if (deviceText != null) {
            var deviceClick = device.sendAai({
                query: "T:*知道了*",
                action: "click",
            });
            if (deviceClick) {
                print("INFO:>>>" + deviceName + ">>>账号异常解除成功");
            }
        }
        delay(1000);
    }
}

function get_Activity() {
    for (var q = 0; q < 3; q++) {
        var ret = device.getActivity();
        delay(500);
        if (ret) {
            return ret
        }
    }
    print(device.name + '3次get_Activity都失败')
}
