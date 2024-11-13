define("version", "9.0.u1254303");
define("resolution", "1080*1920");
define("requireVersion", "3.4.0");

/**
 * 27服务器
 */


var device = Device.searchObject(sigmaConst.DevSelectOne);
if (!device) throw "Can not find device";
var deviceName = device.name;
var logEntries = [];
var lockPath = "C:/log/lock.xlsx"; //锁存放路径

/**
 * 写入日志至 Excel 文件
 */
//检查锁
function checkFileLock() {
    // 读取 Excel 文件中的 "Sheet1"
    var Str = excelUtils.readExcel(lockPath, "Sheet1");
    if (Str === null) {
        console.log("无法读取 Excel 文件，请检查文件路径或文件格式！");
        console.log(deviceName, "无法读取锁文件");
        return false;  // 返回锁定状态为 false
    }

    // 检查读取的数据是否为空
    if (Str.length === 0 || Str[0].length === 0) {
        console.log("读取到的 Excel 数据为空！");
      console.log(deviceName, "锁状态读取失败");
        return false;
    }

    // 判断锁定标记是否存在
    if (Str[0][0] === "lock") {
      // print(deviceName+ "设备已上锁")

        return false;  // 返回设备已上锁状态
    } else {
        // print(deviceName+ "设备未上锁")

        return true;  // 返回设备未上锁状态
    }
}

// 上锁操作，将标记设置为 "lock"
function lockFile() {
    // 读取 Excel 文件中的 "Sheet1"
    var Str = excelUtils.readExcel(lockPath, "Sheet1");

    // 检查是否成功读取 Excel 文件
    if (Str === null) {
        console.log("无法读取 Excel 文件，请检查文件路径或文件格式！");
        console.log(deviceName, "无法读取锁文件");
        return;  // 如果读取失败，则退出函数
    }

    // 检查读取的数据是否有效
    if (Str.length === 0 || Str[0].length === 0) {
        console.log("读取到的 Excel 数据为空！");
        console.log(deviceName, "锁状态读取失败");
        return;  // 如果数据无效，则退出函数
    }

    // 判断是否需要上锁
    if (Str[0][0] !== "lock") {
        // 将锁定标记更改为 "lock"（上锁）
        Str[0][0] = "lock";  // 将第一个单元格的值设置为 "lock" 来表示已上锁
        // 将更新后的内容写回到 Excel 文件
        var ret = excelUtils.writeExcel(lockPath, "Sheet1", 0, 0, Str);
          // print(ret)
        if (ret === true) {
            // print(deviceName+"成功上锁")
        } else {
            print(deviceName+"上锁失败")
        }
    } else {
        print("设备已经上锁")
    }
}

// 解除锁定文件，并将标记设置为 "1"
function unLockFile() {
    // 读取 Excel 文件中的 "Sheet1"
    var Str = excelUtils.readExcel(lockPath, "Sheet1");
    // 检查是否成功读取 Excel 文件
    if (Str === null) {
        console.log("无法读取 Excel 文件，请检查文件路径或文件格式！");
        console.log(deviceName, "无法读取锁文件");
        return;  // 如果读取失败，则退出函数
    }

    // 检查读取的数据是否有效
    if (Str.length === 0 || Str[0].length === 0) {
        console.log("读取到的 Excel 数据为空！");
        console.log(deviceName, "锁状态读取失败");
        return;  // 如果数据无效，则退出函数
    }

    // 判断是否需要解除锁定
    if (Str[0][0] === "lock") {
        // 将锁定标记更改为 "1"（解除锁定）
        Str[0][0] = "1";  // 将第一个单元格的值设置为 "1" 来表示已解锁

        // 将更新后的内容写回到 Excel 文件
        var ret = excelUtils.writeExcel(lockPath, "Sheet1", 0, 0, Str);
        if (ret === true) {
          addLogEntry('info',deviceName,'设备已解锁，已更新 lock.xlsx 文件，标记为1')
        } else {
            console.log("解除锁定失败，写入 Excel 文件失败: " + lastError());
            console.log(deviceName, "解锁失败，写入文件失败");
        }
    } else {
        console.log(deviceName, "设备未上锁，无需解除锁定");
    }
}

function writeLog(logEntries) {
    try {
        // 获取当前日期，用于生成日志文件路径
        let currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = String(currentDate.getMonth() + 1).padStart(2, '0');
        let day = String(currentDate.getDate()).padStart(2, '0');
        let timestamp = `${year}-${month}-${day}`;

        // 使用日期创建文件路径
        let logExcelPath = `C:/log/27-output_log_${year}${month}${day}.xlsx`;
        let existingData;
        try {
            // 尝试读取现有的 Excel 文件
            existingData = excelUtils.readExcel(logExcelPath, "Sheet1");
        } catch (error) {
            // 如果读取失败，打印错误信息并初始化文件
            console.log("文件读取失败，错误是: " + error);
            existingData = null;
        }

        // 如果文件不存在或为空，则初始化文件
        if (!existingData || existingData.length === 0) {
            console.log("文件不存在或为空，将初始化文件。");
            existingData = [['时间', '设备名称', '日志等级', '输出信息']];  // 表头信息

            // 初始化 Excel 文件并写入标题行
            let initRet = excelUtils.writeExcel(logExcelPath, "Sheet1", 0, 0, existingData);
            if (!initRet) {
                console.log("初始化 Excel 文件失败!");
                return;
            }
            console.log("已成功创建并写入标题行到新的 Excel 文件。");
        }

        // 将 logEntries 数组中的每一项转换为 Excel 中的行
        let newLogs = logEntries.map(entry => [
            entry.timestamp,  // 时间戳
            entry.deviceName,  // 设备名称
            entry.level,  // 日志等级
            entry.logMessage  // 日志信息
        ]);

        // 获取现有数据的最后一行
        let startRow = existingData.length;

        // 将新的日志条目写入 Excel 文件
        let ret = excelUtils.writeExcel(logExcelPath, "Sheet1", 0, startRow, newLogs);

        if (ret !== true) {
            console.log("写入日志失败! 错误是: " + lastError());
        }
    } catch (err) {
        console.log(`写入日志失败: ${err}`);
    }
}


function 获取当前日期格式化() {
    var date = new Date();
    var 月 = (date.getMonth() + 1).toString().padStart(2, '0'); // 获取当前月份，格式为两位数
    var 日 = date.getDate().toString().padStart(2, '0'); // 获取当前日期，格式为两位数
    return `${月}-${日}`; // 返回格式化后的日期字符串
}

// 获取当前日期的简化格式 (例如 "10-30")
var 当前日期格式 = 获取当前日期格式化();

// 获取任务列表
var allTasks = taskList(); // 假设这是包含所有任务的数组

// 过滤出符合日期格式的任务，并按编号降序排序
var targetTasks = allTasks
    .filter(task => task.taskName.startsWith(当前日期格式 + "-")) // 筛选符合 "10-30-" 前缀的任务
    .sort((a, b) => {
        // 比较任务编号（提取"-"后面的数字，按降序排序）
        var numA = parseInt(a.taskName.split('-').pop(), 10);
        var numB = parseInt(b.taskName.split('-').pop(), 10);
        return numB - numA; // 降序排序
    });

// 获取最新的任务名称（编号最大的任务）
var latestTaskName = targetTasks.length > 0 ? targetTasks[0].taskName : null; // 获取最新任务的名称

if (latestTaskName) {
    var latestTask = taskInfo(latestTaskName); // 获取最新任务的详细信息
    if (latestTask) {
        // console.log(`找到任务详细信息: ${JSON.stringify(latestTask)}`);
        // 提取任务相关信息
        var taskID = latestTask.taskID;
        var taskStatus = latestTask.status;
        var taskIterCount = latestTask.iterCount;
        var taskOptions = latestTask.options;
        addLogEntry("info",deviceName, "当前执行任务名称" + latestTaskName);
    } else {
        throw new Error("获取任务信息失败");
    }
} else {
    throw new Error("未找到符合条件的最新任务名称");
}

try {
    var keyDict={'精华': ['美白神器，黑色素退散', '听点真话，广告巨多的新品到底怎么样', '近期热门新品精华测评［无广实话篇］', '博主大爆料！Olay功效性精华该不该买？！', '双十一省流抄作业版|热门抗老精华怎么选', '爽 用完给姐钓成翘嘴', '淡纹抗老圈大变天！没见过淡纹这么猛的！', '最近见了儿子的女朋友所幸我保养得还行', '承包你的梳妆台OLAY精华三巨头就够了', '敏皮真的爱了，抗老精华届的六边形战士', '当博主这么久的真心话：OLAY精华值不值得买？', '双十一OLAY三精华值不值得买？看这篇就够', '双十一抢OLAY精华，一篇告诉你怎么买！', '发现了一个不得了的东西，豪华程度惊人....', 'OLAY双十一怎么买？（省钱划算版）', '双十一理性购物！按我的空瓶来抄作业吧', '史无前例! 双十一送这么多不要命了吗？！', 'offer4之后航总还能回OLAY上班吗？？？', '在双十一前，彻底对抗老精华祛魅', '双十一又当韭菜又当光的！stop！！', '稳居抗老榜单！这瓶精华鲨疯了', '看offer4 PK老总的氛围！谈优惠还得李佳琦', '紧急避雷2024佳琦双11全线图文点评无广', '双十一想买精华? 先看看哪款适合你', '2024李佳琦双11比价攻略怎么买最划算', '双十一抗老精华高端局 | 淡纹强的可怕', '双十一必买抗老精华！淡纹巨牛！连毛孔都细了', '双十一美妆护肤紧急凑单！不会凑的进', '眼纹法令纹都能淡？这抗老精华别太能吹牛', '双十一必买精华指南！抗老？淡纹？细腻？', '两周淡纹！？营销过头的结果是？', '这俩精华若是早生10年！早C晚A都上不了台面！', '精华搭对有多爽？？？淡纹嫩肤翻天了...', '不花冤枉钱!实力型抗老精华到底怎么挑', '长见识的抗老精华！脸蛋有种没吃过苦的嫩', '每天用心打理自己，不漂亮简直没天理！', '25+必备抗老精华推荐！让你轻松拿捏抗老', '好嘛！双11抗老精华功课可算是整理出来了', '盘点一些谁用谁嫩的抗老精华。。。。', '敏肌躺赢式抗老精华搭配！脸糙有纹的姐妹进', '双十一真正值得投资大牌精华！把钱花刀刃上', '被我盘到包浆的抗老精华合集！好用不过千！', '淡纹抗老圈大变天！没见过淡纹这么猛的！', '别瞎买！进阶抗老精华的正确打开方式', '包好用的！多年抗老精华经验总结！', '双11敲章认证的抗老精华！1v1对比更会选！', '圈内爆料！贵妇圈双十一都要抢的抗老精华！', '千元以下值得买的抗老单品', '这么做，老的慢！细胞级抗衰黑科技', '最近见了儿子的女朋友所幸我保养得还行', '真就把A醇玩的明明白白，硬核淡纹不在话下', '小投资高回报的报恩精华从百元到千元', '双十一省流抄作业版|热门抗老精华怎么选', '爽 用完给姐钓成翘嘴', '自用大牌精华合集！绝对不输千元精华！', '抗老强的可怕！这一瓶搞定淡纹缩毛孔！', '粉丝团10人实测！抗老精华中的温柔猛药！', '性价比才是王道！双十一抗老精华功课快码住', '注意看！这才是所有细纹的真正克星！', '精华届巨头！OLAY美白抗老精华一篇搞懂！', '磨皮 CP，下手好狠…..', '双11抗老精华不知道选什么？自用大总结！', '踩了无数的雷，终于知道抗老精华怎么选！', '不管说的多好听，Olay这三支劝你别冲动入', '喂饭式抗老精华双十一选购教程！一篇盘点完', '上市就霸榜，双11这支抗老精华抢到就偷乐吧', '李佳琦啵啵间双十一大剧透！！！！', '晋护肤搭配！早B晚A皮肤真的嫩爆了！！！！！！！', '要命啊 三位数精华也卷成这样了吗？', '一篇搞定双11抗老精华怎么选？自用大实话版', '这一世 我的红敏粗糙纹路脸重生了…', '2024双11超前剧透！快马住抄作业！', '双十一抗老精华怎么选？！！！喂饭式全总结', '姐妹双十一别再乱买精华了！', '双十一躺赢式抗老！！！抗老精华还得看这篇！！', '24赛季末了，能打的抗老精华还是寥寥无几', '抗老精华别瞎买！看完这篇怒省千元！', '上市2月就霸榜？！这瓶抗老精华凭什么！', '霸榜精华诚不欺我！榜一大哥靠实力说话！', '几百块抗老淡纹？一键P图的快乐我也有了', '成分卷出新高度！一瓶搞定纹路毛孔！', '24年双十一！李佳琦美妆节超前剧透！', '杀疯了！双十一不得不囤的抗老精华', '别说省不下钱啦！双11值得入手的精华攻略！', '双11大促划重点！优惠机制领取剧透', '怪不得能悍死在双11精华必入榜上！！！', '双十一抗老精华标准答案，直接抄！！', '精华榜单诚不欺我！纹路脸回春拿捏了！', '打开白皮新思路：叠涂精华', '双十一该买啥，榜单已给出标准答案', '李老头你玩真的！双11大剧透+玩法+时间线', '敏皮真的爱了，抗老精华届的六边形战士', '李佳琦双十一精华回看！抗老精华买它就够了', '双11大剧透玩法汇总+时间安排！莫错过！', '双11买对！抗老精华怎么选？我来告诉你！', '一句话点评9款宝藏精华（双11预备队员）', '用过上百瓶精华，这些在我双11必买！', '大牌中的质价比精华们！双11看完这篇再下手！', '李佳琦双十一重要时间线和爆品剧透汇总！', '双十一跟着榜单买抗老精华准没错！', '嫩哭，这抗老精华真的是我的救世主', '我嘞个霸榜精华，粗糙纹路脸终于上岸了！', 'OLAY已被00后接管活动力度老板哭晕在厕所', '谁敢信才三位数！淡纹效果吊打千元抗老精华', 'OLAY你别太宠！双十一这力度很难不囤！', '淡纹精华届爽文！双十一跟着榜单买准没错！', '李佳琦双十一红黑榜Offer最新解读', '28天真实打卡！OLAY黑化叠加实力大增！', 'OLAY这机制认真的？跟送福利有什么区别！', '别再早C晚A了，早A晚B才是嫩脸白月光…', '李老头我嘴替! offer4鲨风!拿下OLAY大优惠', 'OMG！李老头竟然把抗老精华的价格给打下来了', '黑管精华竟然要上+7啵啵间！机制太炸了', '法令纹会惩罚每一个不想抗老的人', '黑白CP,让我放弃多年的早C晚A', '起猛了, 今年双十一这么炸的吗?', '最新消息！李佳琦双十一必买精华机制来了！', '风大抗老精华 到底营销过度还是真有实力？', '难怪李老头猛猛夸！双11必买抗老精华就它了！', '2024李佳琦双11红黑榜营销骗子退退退', '10人打卡实测爆火抗老精华到底值不值得入', '双十一抢OLAY精华，一篇告诉你怎么买！', '2024最强势抗老精华（双11强推）', '真划算or偷偷涨价佳琦双11比价红黑榜【三】', '双十一7款自用空瓶精华 大牌国货都有（上集）', '发现了一个不得了的东西，豪华程度惊人....', '家道中落大小姐之双11囤什么才值得！', '双11必买清单！这抗老精华淡纹竟然这么快？？', '双十一李佳琦这个精华的机制，直接把我拿捏', '妈呀...今年双11太疯狂了！精华霸榜王大降价', 'offer4|不愧是李老头！OLAY老板看起来要碎了', '泄密李佳琦双11带着抗老猛来了！！', '怒花几w踩雷！双十一别乱囤抗老精华了！', '双十一断货王精华？28天实测来说大实话！', '双十一抗老精华这样买怒省几顿饭钱！', '抗老精华界黑悟空？28天淡纹嫩脸实录！', 'OLAY双十一怎么买？（省钱划算版）', '有一些品牌别太炸裂了！抗老精华居然这样搞', '双11必买‼佳琦破价了！天花板机制！', '佳琦牛掰！把淡纹仙品炸出了史诗级offer', '断层式霸榜的抗老精华！双十一必须安排！', '李佳琦双十一！爆品美妆offer来啦', '受不了早C晚A千锤百炼，为何不走捷径?', '快来教你花最少的钱！买到最划算的OLAY', '抗老人双十一必囤精华！淡纹嫩脸就这瓶了！', '今年双十一 OLAY真的豁出去了！', '李佳琦10.14号双11美妆节预告！精华怎么买？', '李佳琦双11所有女生offer[精华]产品汇总', '双十一送的比正装还多？不愧是霸榜抗老精华！', '李佳琦双十一必买清单！吐血整理', '双十一4字头能买到100多ml的抗老精华？', '双十一理性购物！按我的空瓶来抄作业吧', '深纹脸救星！双十一送的要比买的多！', '过了这个双十一，OLAY这日子就不打算过了？', '史无前例! 双十一送这么多不要命了吗？！', '李佳琦双11比价PPT第3期：一眼瞅出谁涨价！', '霸榜黑马抗老精华，双11闭眼买就对了', '不是吧olay！你今年玩这么大啊！', '双11大牌抗老精华回购清单！李老头严选！', '李佳琦双十一必买清单！油敏肌抗老精华', '跟着李佳琦买的双十一抗老精华！包好用的！', '李佳琦双十一精华攻略！打下OLAY价格憋大招！', '包划算的纯纯好价不来虚的，LJQ护肤必买～', '挤进抗老赛道高端局？过了营销期才敢说！', '双十一又当韭菜又当光的！stop！！', '公然叫板双11！精准狙击所有“骨折”大厂货！', '3分钟告诉你，olay三款高性价比精华怎么选？', '美妆节终极揭榜！+7双11精华看这篇就够了~', '买抗老精华先等等! 李佳琦双十一这波好给力', '双十一必买抗老精华！每瓶都是高回报！', '在双十一前，彻底对抗老精华祛魅', '我悟了！早B晚A才是抗老人的神仙护肤搭配！', '双十一怎么凑更划算？直接进来抄作业！', '李佳琦双十一olay黑管精华详细凑单攻略', '不是！双11 OLAY不想赚了？直播间价格好便宜', '笑发财了！！OLAY老板自己都要被这offer逼疯！', '今年最伟大的组合！没有之一！！', '李老头：我和老板们总得疯一个！', '蹲到OLAY黑管精华双11优惠了！今年力度绝了', '看offer4 PK老总的氛围！谈优惠还得李佳琦', '双十一机制爽文！OLAY黑管精华不囤不行了!', '稳居抗老榜单！这瓶精华鲨疯了', '双11的OLAY你是要考研吗…机制这么卷！！', 'offer4之后航总还能回OLAY上班吗？？？', '抗老英雄会顶奢较量往往1瓶决胜负', '牛啊，双十一敢买新品够胆你就盲冲吧', '佳琦：我跟老板总得碎一个！OLAY机制太炸了！', 'OLAY offer定了! 李佳琦双十一机制真的炸', '【李佳琦的双十一抗老产品攻略全揭秘！】', '李佳琦双十一抗老淡纹一套就蹲它！', '14天15人实测！脆皮肌的高效抗老精华？', '李老头也太会谈判了！OLAY这次是抄底了吧！', '双十一想买精华? 先看看哪款适合你', '双11超值推荐！让你买到手软！（精华篇）', 'OLAY双11机制真玩这么大？！黑管精华直接送', '今年的OFFER 你们都没发现吗？！', '2024李佳琦双11比价攻略怎么买最划算', '李佳琦双11美妆节比价攻略', '李佳琦双十一热门精华价格对比', '李老头严选精华，双十一心甘情愿掏出钱钱！', '李佳琦双十一！美妆节活动攻略来啦！', '双十一+7啵啵间必入精华！机制太', '不好意思，olay黑管精华虽然火，我还是要说！', '佳琦又炸出新机制啦！颤抖吧OLAY老板！', '我的双十一李佳琦回购清单已出炉！！', '双十一OLAY精华究竟值不值得买？！', '今年双11王炸精华水灵灵的被李佳琦谈到了', '所有女生！双11李老头直播间必入精华合集来', '双11省流版！新所有女生的Offer4机制汇总篇', 'OLAY双11大比价！+7啵啵间怎么买最划算？', 'OMG！李佳琦的双11给力，OLAY的offer炸了！', 'OLAY 你双11不赚钱了?+7 啵啵间价格惊呆我!', '双11省钱了！跟李佳琦超低价抢黑管精华！', '抄作业！喂饭式双11攻略来啦！抗老人help', '离嗮谱！这辈子脸没这么嫩过！！', '双11炸裂机制 | 李佳琦直播间冲这些！', '李佳琦双十一美妆节！黑管精华来炸街啦！！！', '紧急避雷双11李佳琦这些不建议买', '李佳琦双11什么值得买！（含机制分享', '双十一李佳琦啵啵间大比价！买对不买贵！', '双11必买|干皮抗老护肤，自用大牌精华！', '不信广告信榜单！双十一必入抗老精华！', '黑管精华就蹲双11+7直播间，机制可太顶了！', '比搞钱更重要！双十一囤货请冷静，只买该买的', '我嘞个天爷！OLAY双十一鲨疯了！！', '双11必囤的淡纹精华！细腻光滑Q弹在这里！', '解锁OLAY 双十一隐藏福利！！', '双十一抗老精华高端局 | 淡纹强的可怕', '双十一必买抗老精华！淡纹巨牛！连毛孔都小了', '双11李佳琦OLAY比价凑单攻略', '速戳！双十一凑单极速版攻略来了', '双十一省钱攻略！跟着课代表来抄作业！', '年度爱用抗老精华盘点！ 双11错过苦等一年！', '熨斗式淡纹抗老？众测团来一测究竟！', '火力全开的双十一省米攻略！想买精华的进', '李佳琦双11坠强offer！！[OLAY 篇]', '跟风打卡最成功的1次!!给法令纹一点小震撼', 'OLAY双十一省钱功课！这样凑太划算了！', '双11极限凑单|手把手教会！', '双十一美妆护肤紧急凑单！不会凑的进', '李佳琦直播间10个大牌值得买的面霜和精华！', '这个淡纹精华用了3周，请你们听我一句劝…', '双十一省钱攻略！帮你怒省一个亿！', '来抄佳琦双11OLAY黑管精华凑单作业吧！', '太牛了，闺蜜算出了黑管精华双十一地板价', '马住这篇！今年双11让你怒省一个亿', '眉间纹去哪里了双十一黑马抗老精华惊艳。', '人生建议：双11大促看完我的攻略先', '双11最值得入手的抗老精华！不买后悔一整年', '眼纹法令纹都能淡？这抗老精华别太能吹牛', '旺旺这波上大分！她的变化真的有目共睹', '手把手教会你双十一如何叠加优惠！！', '缩毛孔？淡细纹？抗老实测假话假图～直接退网！', '被朱旺旺惊艳女生努力真的能变美', '我的双十一凑单分享～这也太划算了', '最后机会！双11精华咋买最划算？比价告诉你', '双十一李佳琦啵啵间什么值得买！', 'olay你能不能别折腾我了……', '双11省钱信息差花小钱办大事攻略来了～', '双11尾款日必看！~极限凑单最省钱！', '双十一省钱攻略总结！直接抄作业不出错！', '这是什么淡纹天菜！双十一送的比买的多！！', '双十一凑单怎么买？低于机制价进来学！', '28天搞定纹纹路路？现在的精华可真能吹！', '双十一买了这仨的！能救一个是一个！', '双十一必买精华指南！抗老？淡纹？细腻？', '建议收藏...一篇讲透功效精华怎么选', '跪求各位do法令纹前给它一个机会', '预算有限怎么选对精华？', '双十一必买这四位强功效的神！不买准亏', '各司其职的OLAY三大精华！教你对号入座！', '双十一最值得买的功效精华，脸白嫩全靠它们', '买一堆瓶瓶罐罐不如一只精华allin有效抗老', '功效型精华, 用对比买对更关键', '别找了，不会比它淡纹更快的抗老精华了', '双十一超绝offer今年OLAY鲨疯一定要买精华', 'OLAY三大爆款精华，怎么选不踩雷？', '新技术！牙套脸的法令纹有救了！！', '这俩精华若是早生10年！早C晚A都上不了台面！', '两周淡纹！？营销过头的结果是？', '不是现在品牌这么敢宣传到底真的假的', '年度好用精华提前出炉！双十一请卷这6瓶！', '双11敏皮抗老|「淡纹充盈感」精华篇', '身边人纷纷入坑？过度营销还是真能淡纹？', '精华搭对有多爽？？？淡纹嫩肤翻天了...', '纹路越长越多的要看！这思路所有人都能照抄', '30+精致韩女K老宝藏从头到脚变年轻！', '双11必囤精华尖子生！油皮包好用的', '听说是王炸抗老组合，买了！', '从怀疑到震惊！淡纹这瓶真的神？', '真正能让脸变嫩变透亮的好东西！', '不花冤枉钱！OLAY精华怎么选！', '糙脸用好这俩还需要什么早C晚A', '第一批早B晚A受益人出现了……', '双十一大牌热门抗老精华！都是回购无数的！', '纹重脸糙的姐妹一定要知道...', '嫩就一个字！姐只说一次！', '这个喷不了，法令纹确实淡了。。', '发现一个过分简单，但有用的方法（对法令纹）', '嫩就一个字！姐只说一次！', '双十一反复回购的精华！它来了！'], '抗老精华': ['黑管精华上市前，一些不吐不快的大实话……', '听点真话，广告巨多的新品到底怎么样', '原来补骨脂酚这么贵', '哪个是干敏能用的精华啊', '无广用了毛孔会变小的油皮抗老仙品', '油管皮肤科医生，当下最认可的封神抗衰方案', '抗老强的可怕！这一瓶搞定淡纹缩毛孔！', '博主大爆料！Olay功效性精华该不该买？！', '双十一省流抄作业版|热门抗老精华怎么选', '爽 用完给姐钓成翘嘴', '淡纹抗老圈大变天！没见过淡纹这么猛的！', '用A醇的好处就是比同龄人显小', '空瓶记录', '性价比才是王道！双十一抗老精华功课快码住', '双十一抗老精华怎么选？！！！喂饭式全总结', '喂饭攻略一篇看懂OLAY精华三大头怎么选', '双十一该买啥，榜单已给出标准答案', '敏皮真的爱了，抗老精华届的六边形战士', '双十一跟着榜单买抗老精华准没错！', 'OLAY已被00后接管活动力度老板哭晕在厕所', '李佳琦双十一红黑榜②Offer最新解读', 'OMG！李老头竟然把抗老精华的价格给打下来了', '28天真实打卡！OLAY黑化叠加实力大增！', '2024最强势抗老精华（双11强推）', '双11必买清单！这抗老精华淡纹竟然这么快？？', '妈呀...今年双11太疯狂了！精华霸榜王大降价', '发现了一个不得了的东西，豪华程度惊人....', '难怪李老头猛猛夸！双11必买抗老精华就它了！', '怒花几w踩雷！双十一别乱囤抗老精华了！', '双十一抗老精华这样买怒省几顿饭钱！', '双十一断货王精华？28天实测来说大实话！', '双十一送的比正装还多？不愧是霸榜抗老精华！', '跟着李佳琦买的双十一抗老精华！包好用的！', '双十一理性购物！按我的空瓶来抄作业吧', '李佳琦双十一必买清单！油敏肌抗老精华', '霸榜黑马抗老精华，双11闭眼买就对了', '双十一4字头能买到100多ml的抗老精华？', '抗老英雄会顶奢较量往往1瓶决胜负', 'offer4之后航总还能回OLAY上班吗？？？', '公然叫板双11！精准狙击所有“骨折”大厂货！', '建议严查这瓶精华！抗老嫩脸太强了', '在双十一前，彻底对抗老精华祛魅', '双十一机制爽文！OLAY黑管精华不囤不行了!', '双十一又当韭菜又当光的！stop！！', '稳居抗老榜单！这瓶精华鲨疯了', '李老头也太会谈判了！OLAY这次是抄底了吧！', '双十一想买精华? 先看看哪款适合你', '2024李佳琦双11比价攻略怎么买最划算', '佳琦：我跟老板总得碎一个！OLAY机制太炸了！', '离嗮谱！这辈子脸没这么嫩过！！', 'OLAY双11大比价！+7啵啵间怎么买最划算？', '双十一OLAY精华究竟值不值得买？！', '比搞钱更重要！双十一囤货请冷静，只买该买的', '双十一抗老精华高端局 | 淡纹强的可怕', '双十一必买抗老精华！淡纹巨牛！连毛孔都细了', '双十一美妆护肤紧急凑单！不会凑的进', '眼纹法令纹都能淡？这抗老精华别太能吹牛', '这是什么淡纹天菜！双十一送的比买的多！！', '双十一必买精华指南！抗老？淡纹？细腻？', '跪求各位do法令纹前给它一个机会', '双十一必买这四位强功效的神！不买准亏', '买一堆瓶瓶罐罐不如一只精华allin有效抗老', '别找了，不会比它淡纹更快的抗老精华了', '两周淡纹！？营销过头的结果是？', '精华搭对有多爽？？？淡纹嫩肤翻天了...', '听说是王炸抗老组合，买了！', '双十一黑管精华开箱！', '所有大牌抗老精华里，真正值得投资的三款！！', '纹重脸糙的姐妹一定要知道...', '心心念念的Olay黑管精华终于到了', '嫩就一个字！姐只说一次！', '双十一开箱(Olay黑管精华)', 'Olay黑管精华双十一到货开箱', 'Prox实验室线，淡纹淡斑组合拳！', '双十一', '不花冤枉钱!实力型抗老精华到底怎么挑', '长见识的抗老精华！脸蛋有种没吃过苦的嫩', '每天用心打理自己，不漂亮简直没天理！', '25+必备抗老精华推荐！让你轻松拿捏抗老', '好嘛！双11抗老精华功课可算是整理出来了', '盘点一些谁用谁嫩的抗老精华。。。。', '敏肌躺赢式抗老精华搭配！脸糙有纹的姐妹进', '双十一真正值得投资大牌精华！把钱花刀刃上', '被我盘到包浆的抗老精华合集！好用不过千！', '淡纹抗老圈大变天！没见过淡纹这么猛的！', '别瞎买！进阶抗老精华的正确打开方式', '包好用的！多年抗老精华经验总结！', '双11敲章认证的抗老精华！1v1对比更会选！', '圈内爆料！贵妇圈双十一都要抢的抗老精华！', '千元以下值得买的抗老单品', '这么做，老的慢！细胞级抗衰黑科技', '最近见了儿子的女朋友所幸我保养得还行', '真就把A醇玩的明明白白，硬核淡纹不在话下', '小投资高回报的报恩精华从百元到千元', '双十一省流抄作业版|热门抗老精华怎么选', '爽 用完给姐钓成翘嘴', '自用大牌精华合集！绝对不输千元精华！', '抗老强的可怕！这一瓶搞定淡纹缩毛孔！', '粉丝团10人实测！抗老精华中的温柔猛药！', '性价比才是王道！双十一抗老精华功课快码住', '注意看！这才是所有细纹的真正克星！', '精华届巨头！OLAY美白抗老精华一篇搞懂！', '磨皮 CP，下手好狠…..', '双11抗老精华不知道选什么？自用大总结！', '踩了无数的雷，终于知道抗老精华怎么选！', '不管说的多好听，Olay这三支劝你别冲动入', '喂饭式抗老精华双十一选购教程！一篇盘点完', '上市就霸榜，双11这支抗老精华抢到就偷乐吧', '李佳琦啵啵间双十一大剧透！！！！', '晋护肤搭配！早B晚A皮肤真的嫩爆了！！！！！！！', '要命啊 三位数精华也卷成这样了吗？', '一篇搞定双11抗老精华怎么选？自用大实话版', '这一世 我的红敏粗糙纹路脸重生了…', '2024双11超前剧透！快马住抄作业！', '双十一抗老精华怎么选？！！！喂饭式全总结', '姐妹双十一别再乱买精华了！', '双十一躺赢式抗老！！！抗老精华还得看这篇！！', '24赛季末了，能打的抗老精华还是寥寥无几', '抗老精华别瞎买！看完这篇怒省千元！', '上市2月就霸榜？！这瓶抗老精华凭什么！', '霸榜精华诚不欺我！榜一大哥靠实力说话！', '几百块抗老淡纹？一键P图的快乐我也有了', '成分卷出新高度！一瓶搞定纹路毛孔！', '24年双十一！李佳琦美妆节超前剧透！', '杀疯了！双十一不得不囤的抗老精华', '别说省不下钱啦！双11值得入手的精华攻略！', '双11大促划重点！优惠机制领取剧透', '怪不得能悍死在双11精华必入榜上！！！', '双十一抗老精华标准答案，直接抄！！', '精华榜单诚不欺我！纹路脸回春拿捏了！', '打开白皮新思路：叠涂精华', '双十一该买啥，榜单已给出标准答案', '李老头你玩真的！双11大剧透+玩法+时间线', '敏皮真的爱了，抗老精华届的六边形战士', '李佳琦双十一精华回看！抗老精华买它就够了', '双11大剧透玩法汇总+时间安排！莫错过！', '双11买对！抗老精华怎么选？我来告诉你！', '一句话点评9款宝藏精华（双11预备队员）', '用过上百瓶精华，这些在我双11必买！', '大牌中的质价比精华们！双11看完这篇再下手！', '李佳琦双十一重要时间线和爆品剧透汇总！', '双十一跟着榜单买抗老精华准没错！', '嫩哭，这抗老精华真的是我的救世主', '我嘞个霸榜精华，粗糙纹路脸终于上岸了！', 'OLAY已被00后接管活动力度老板哭晕在厕所', '谁敢信才三位数！淡纹效果吊打千元抗老精华', 'OLAY你别太宠！双十一这力度很难不囤！', '淡纹精华届爽文！双十一跟着榜单买准没错！', '李佳琦双十一红黑榜Offer最新解读', '28天真实打卡！OLAY黑化叠加实力大增！', 'OLAY这机制认真的？跟送福利有什么区别！', '别再早C晚A了，早A晚B才是嫩脸白月光…', '李老头我嘴替! offer4鲨风!拿下OLAY大优惠', 'OMG！李老头竟然把抗老精华的价格给打下来了', '黑管精华竟然要上+7啵啵间！机制太炸了', '法令纹会惩罚每一个不想抗老的人', '黑白CP,让我放弃多年的早C晚A', '起猛了, 今年双十一这么炸的吗?', '最新消息！李佳琦双十一必买精华机制来了！', '风大抗老精华 到底营销过度还是真有实力？', '难怪李老头猛猛夸！双11必买抗老精华就它了！', '2024李佳琦双11红黑榜营销骗子退退退', '10人打卡实测爆火抗老精华到底值不值得入', '双十一抢OLAY精华，一篇告诉你怎么买！', '2024最强势抗老精华（双11强推）', '真划算or偷偷涨价佳琦双11比价红黑榜【三】', '双十一7款自用空瓶精华 大牌国货都有（上集）', '发现了一个不得了的东西，豪华程度惊人....', '家道中落大小姐之双11囤什么才值得！', '双11必买清单！这抗老精华淡纹竟然这么快？？', '双十一李佳琦这个精华的机制，直接把我拿捏', '妈呀...今年双11太疯狂了！精华霸榜王大降价', 'offer4|不愧是李老头！OLAY老板看起来要碎了', '泄密李佳琦双11带着抗老猛来了！！', '怒花几w踩雷！双十一别乱囤抗老精华了！', '双十一断货王精华？28天实测来说大实话！', '双十一抗老精华这样买怒省几顿饭钱！', '抗老精华界黑悟空？28天淡纹嫩脸实录！', 'OLAY双十一怎么买？（省钱划算版）', '有一些品牌别太炸裂了！抗老精华居然这样搞', '双11必买‼佳琦破价了！天花板机制！', '佳琦牛掰！把淡纹仙品炸出了史诗级offer', '断层式霸榜的抗老精华！双十一必须安排！', '李佳琦双十一！爆品美妆offer来啦', '受不了早C晚A千锤百炼，为何不走捷径?', '快来教你花最少的钱！买到最划算的OLAY', '抗老人双十一必囤精华！淡纹嫩脸就这瓶了！', '今年双十一 OLAY真的豁出去了！', '李佳琦10.14号双11美妆节预告！精华怎么买？', '李佳琦双11所有女生offer[精华]产品汇总', '双十一送的比正装还多？不愧是霸榜抗老精华！', '李佳琦双十一必买清单！吐血整理', '双十一4字头能买到100多ml的抗老精华？', '双十一理性购物！按我的空瓶来抄作业吧', '深纹脸救星！双十一送的要比买的多！', '过了这个双十一，OLAY这日子就不打算过了？', '史无前例! 双十一送这么多不要命了吗？！', '李佳琦双11比价PPT第3期：一眼瞅出谁涨价！', '霸榜黑马抗老精华，双11闭眼买就对了', '不是吧olay！你今年玩这么大啊！', '双11大牌抗老精华回购清单！李老头严选！', '李佳琦双十一必买清单！油敏肌抗老精华', '跟着李佳琦买的双十一抗老精华！包好用的！', '李佳琦双十一精华攻略！打下OLAY价格憋大招！', '包划算的纯纯好价不来虚的，LJQ护肤必买～', '挤进抗老赛道高端局？过了营销期才敢说！', '双十一又当韭菜又当光的！stop！！', '公然叫板双11！精准狙击所有“骨折”大厂货！', '3分钟告诉你，olay三款高性价比精华怎么选？', '美妆节终极揭榜！+7双11精华看这篇就够了~', '买抗老精华先等等! 李佳琦双十一这波好给力', '双十一必买抗老精华！每瓶都是高回报！', '在双十一前，彻底对抗老精华祛魅', '我悟了！早B晚A才是抗老人的神仙护肤搭配！', '双十一怎么凑更划算？直接进来抄作业！', '李佳琦双十一olay黑管精华详细凑单攻略', '不是！双11 OLAY不想赚了？直播间价格好便宜', '笑发财了！！OLAY老板自己都要被这offer逼疯！', '今年最伟大的组合！没有之一！！', '李老头：我和老板们总得疯一个！', '蹲到OLAY黑管精华双11优惠了！今年力度绝了', '看offer4 PK老总的氛围！谈优惠还得李佳琦', '双十一机制爽文！OLAY黑管精华不囤不行了!', '稳居抗老榜单！这瓶精华鲨疯了', '双11的OLAY你是要考研吗…机制这么卷！！', 'offer4之后航总还能回OLAY上班吗？？？', '抗老英雄会顶奢较量往往1瓶决胜负', '牛啊，双十一敢买新品够胆你就盲冲吧', '佳琦：我跟老板总得碎一个！OLAY机制太炸了！', 'OLAY offer定了! 李佳琦双十一机制真的炸', '【李佳琦的双十一抗老产品攻略全揭秘！】', '李佳琦双十一抗老淡纹一套就蹲它！', '14天15人实测！脆皮肌的高效抗老精华？', '李老头也太会谈判了！OLAY这次是抄底了吧！', '双十一想买精华? 先看看哪款适合你', '双11超值推荐！让你买到手软！（精华篇）', 'OLAY双11机制真玩这么大？！黑管精华直接送', '今年的OFFER 你们都没发现吗？！', '2024李佳琦双11比价攻略怎么买最划算', '李佳琦双11美妆节比价攻略', '李佳琦双十一热门精华价格对比', '李老头严选精华，双十一心甘情愿掏出钱钱！', '李佳琦双十一！美妆节活动攻略来啦！', '双十一+7啵啵间必入精华！机制太', '不好意思，olay黑管精华虽然火，我还是要说！', '佳琦又炸出新机制啦！颤抖吧OLAY老板！', '我的双十一李佳琦回购清单已出炉！！', '双十一OLAY精华究竟值不值得买？！', '今年双11王炸精华水灵灵的被李佳琦谈到了', '所有女生！双11李老头直播间必入精华合集来', '双11省流版！新所有女生的Offer4机制汇总篇', 'OLAY双11大比价！+7啵啵间怎么买最划算？', 'OMG！李佳琦的双11给力，OLAY的offer炸了！', 'OLAY 你双11不赚钱了?+7 啵啵间价格惊呆我!', '双11省钱了！跟李佳琦超低价抢黑管精华！', '抄作业！喂饭式双11攻略来啦！抗老人help', '离嗮谱！这辈子脸没这么嫩过！！', '双11炸裂机制 | 李佳琦直播间冲这些！', '李佳琦双十一美妆节！黑管精华来炸街啦！！！', '紧急避雷双11李佳琦这些不建议买', '李佳琦双11什么值得买！（含机制分享', '双十一李佳琦啵啵间大比价！买对不买贵！', '双11必买|干皮抗老护肤，自用大牌精华！', '不信广告信榜单！双十一必入抗老精华！', '黑管精华就蹲双11+7直播间，机制可太顶了！', '比搞钱更重要！双十一囤货请冷静，只买该买的', '我嘞个天爷！OLAY双十一鲨疯了！！', '双11必囤的淡纹精华！细腻光滑Q弹在这里！', '解锁OLAY 双十一隐藏福利！！', '双十一抗老精华高端局 | 淡纹强的可怕', '双十一必买抗老精华！淡纹巨牛！连毛孔都小了', '双11李佳琦OLAY比价凑单攻略', '速戳！双十一凑单极速版攻略来了', '双十一省钱攻略！跟着课代表来抄作业！', '年度爱用抗老精华盘点！ 双11错过苦等一年！', '熨斗式淡纹抗老？众测团来一测究竟！', '火力全开的双十一省米攻略！想买精华的进', '李佳琦双11坠强offer！！[OLAY 篇]', '跟风打卡最成功的1次!!给法令纹一点小震撼', 'OLAY双十一省钱功课！这样凑太划算了！', '双11极限凑单|手把手教会！', '双十一美妆护肤紧急凑单！不会凑的进', '李佳琦直播间10个大牌值得买的面霜和精华！', '这个淡纹精华用了3周，请你们听我一句劝…', '双十一省钱攻略！帮你怒省一个亿！', '来抄佳琦双11OLAY黑管精华凑单作业吧！', '太牛了，闺蜜算出了黑管精华双十一地板价', '马住这篇！今年双11让你怒省一个亿', '眉间纹去哪里了双十一黑马抗老精华惊艳。', '人生建议：双11大促看完我的攻略先', '双11最值得入手的抗老精华！不买后悔一整年', '眼纹法令纹都能淡？这抗老精华别太能吹牛', '旺旺这波上大分！她的变化真的有目共睹', '手把手教会你双十一如何叠加优惠！！', '缩毛孔？淡细纹？抗老实测假话假图～直接退网！', '被朱旺旺惊艳女生努力真的能变美', '我的双十一凑单分享～这也太划算了', '最后机会！双11精华咋买最划算？比价告诉你', '双十一李佳琦啵啵间什么值得买！', 'olay你能不能别折腾我了……', '双11省钱信息差花小钱办大事攻略来了～', '双11尾款日必看！~极限凑单最省钱！', '双十一省钱攻略总结！直接抄作业不出错！', '这是什么淡纹天菜！双十一送的比买的多！！', '双十一凑单怎么买？低于机制价进来学！', '28天搞定纹纹路路？现在的精华可真能吹！', '双十一买了这仨的！能救一个是一个！', '双十一必买精华指南！抗老？淡纹？细腻？', '建议收藏...一篇讲透功效精华怎么选', '跪求各位do法令纹前给它一个机会', '预算有限怎么选对精华？', '双十一必买这四位强功效的神！不买准亏', '各司其职的OLAY三大精华！教你对号入座！', '双十一最值得买的功效精华，脸白嫩全靠它们', '买一堆瓶瓶罐罐不如一只精华allin有效抗老', '功效型精华, 用对比买对更关键', '别找了，不会比它淡纹更快的抗老精华了', '双十一超绝offer今年OLAY鲨疯一定要买精华', 'OLAY三大爆款精华，怎么选不踩雷？', '新技术！牙套脸的法令纹有救了！！', '这俩精华若是早生10年！早C晚A都上不了台面！', '两周淡纹！？营销过头的结果是？', '不是现在品牌这么敢宣传到底真的假的', '年度好用精华提前出炉！双十一请卷这6瓶！', '双11敏皮抗老|「淡纹充盈感」精华篇', '身边人纷纷入坑？过度营销还是真能淡纹？', '精华搭对有多爽？？？淡纹嫩肤翻天了...', '纹路越长越多的要看！这思路所有人都能照抄', '30+精致韩女K老宝藏从头到脚变年轻！', '双11必囤精华尖子生！油皮包好用的', '听说是王炸抗老组合，买了！', '从怀疑到震惊！淡纹这瓶真的神？', '真正能让脸变嫩变透亮的好东西！', '不花冤枉钱！OLAY精华怎么选！', '糙脸用好这俩还需要什么早C晚A', '第一批早B晚A受益人出现了……', '双十一大牌热门抗老精华！都是回购无数的！', '纹重脸糙的姐妹一定要知道...', '嫩就一个字！姐只说一次！', '这个喷不了，法令纹确实淡了。。', '发现一个过分简单，但有用的方法（对法令纹）']};
    var xhsApp = "com.xingin.xhs";
    var finishedTitles = [];
    var keyAll = [];
    var currentnotes = [];
    var captchRet = "false";
    var keywordAll = [];
    var finishedNotes = [];
    var count = 0;
    var waitTimeMin = 1; // 休眠时间，单位为分钟，如需修改，改此处即可
    var waitTime = waitTimeMin * 60 * 1000;
    var slideCount = 48;  //这里定义下滑次数
    for (var keyword in keyDict) {
        if(captchRet === "false"){
        for (let i = 0; i < 3; i++) {
            try {
                if (openApp(xhsApp)) {
                    addLogEntry('info', deviceName, '开始优化关键词: ' + keyword);
                    run(keyword);
                    actionWithRetry(() => sendFunction(tcConst.keyCodes.KEYCODE_BACK, tcConst.STATE_PRESS), 3, 1500);
                    actionWithRetry(() => sendFunction(tcConst.keyCodes.KEYCODE_BACK, tcConst.STATE_PRESS), 3, 1500);
                    var numBrowse = randomNum(1, 10);
                    if (numBrowse <=  4) {
                        fxBrowse(numBrowse);
                        delay(1500)
                    }
                    closeApp(xhsApp);
                    writeDetailExcel(keywordAll);
                    keywordAll = [];
                    delay(waitTime);
                    break;
                } else {
                    print(`启动应用失败: ${appName} - 错误信息: ${lastError()}`);
                    delay(1500);
                }
            } catch (err) {
                print(`ERROR: ${device.name}: ${err.message || err}`);
            }
        }
    }else{
        break;
    }
}
    delay(randomNum(888,3888))
    writeLog(logEntries)
    writeCountExcel(keyAll);
    // writeRoundCountExcel(keyAll)
    addLogEntry('info', deviceName, '优化结束');
    print("27服务器--->"+deviceName, '----------------------------------优化已完成')
    // writeLogExcel(deviceName,`LogInfo:${device.name} >>> 优化结束`);
} catch (err) {
    print(`ERROR: ${device.name}: ${err}`);
}


//加入日志到数组
function addLogEntry(level, deviceName, logMessage) {
    const logEntry = {
        level: level,          // 日志等级
        deviceName: deviceName,
        logMessage: logMessage,
        timestamp: new Date().toISOString(),  // 添加时间戳
    };

    // 将日志信息添加到数组中
    logEntries.push(logEntry);
}


/*
 * 打开、关闭、重启应用
 */
function openApp(appName) {
    return device.runApp(appName) === 0
}

function closeApp(appName) {
    device.closeApp(appName);
    device.send(tcConst.KEY_RECENTAPP);
    delay(3000)
    device.click(0.5000, 0.8900);
}

function restartApp(appName) {
    return device.restartApp(appName) === 0;
}
/**  */


function writeDetailExcel(dataList) {
    try {
        // 检查锁
        let retryCount = 0;
        const maxRetries = 10; // 最大重试次数
        // 循环检查设备是否解锁，直到解锁或者达到最大重试次数
        while (!checkFileLock() && retryCount < maxRetries) {
            retryCount++;
            delay(3000);
        }
        if (retryCount === maxRetries && !checkFileLock()) {
            addLogEntry('error',deviceName,'设备仍然上锁，放弃写入日志')

            return;
        }
        lockFile();

        let currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        let excelPath = "D:/27Data/count/" + `${year}_${month}_${day}` + "_关键词count.xlsx";
        // 读取现有的 Excel 数据
        let existingData = excelUtils.readExcel(excelPath, "Sheet1");
        if (existingData === null) {
            existingData = [['服务器', '优化时间', '关键词', '标题', '作者名称', '次数', '设备名称']];
        }

        // 将现有数据转换为数组格式
        let jsArrayExistingData = [];
        let existingDataLength = existingData.length;
        for (let i = 0; i < existingDataLength; i++) {
            let innerArray = existingData[i];
            let jsInnerArray = [];
            for (let j = 0; j < innerArray.length; j++) {
                jsInnerArray.push(innerArray[j]);
            }
            jsArrayExistingData.push(jsInnerArray);
        }

        // 遍历新的 dataList，不管设备号是否重复，每条记录都新写入
        let dataListLength = dataList.length;
        for (let j = 0; j < dataListLength; j++) {
            let arr = [];
            arr.push("27-Server"); // 新增服务器列，替换为实际的服务器名称
            arr.push(dataList[j][0]); // 优化时间
            arr.push(dataList[j][1]); // 关键词
            arr.push(dataList[j][2]); // 标题
            arr.push(String(dataList[j][3])); // 作者名称字符串
            arr.push(1); // 次数固定为 1
            arr.push(dataList[j][4]); // 设备名称
            jsArrayExistingData.push(arr);  // 无论如何都追加新记录
        }

        // 将更新后的数据写回到 Excel 文件
        let ret = excelUtils.writeExcel(excelPath, "Sheet1", 0, 0, jsArrayExistingData);

        if (ret === true) {
            addLogEntry('info', deviceName, '写入Excel成功');
            // writeLogExcel(deviceName, `LogInfo:成功写入单个关键词Excel文件`);
        } else {
            print(deviceName + "--写入Excel失败! 错误是: " + lastError());
        }
    } catch (err) {
        print("err:" + err);
    } finally {
        // 确保解锁操作会在任何情况下执行
        unLockFile();
    }
}



function writeExcelWithDuration(keyword, duration, deviceName) {//TODO:优化时间写入
    try {
        let currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        // let excelPath = "D:/keyword/" + `${year}_${taskName}_` + "执行时间.xlsx";
        // 读取现有的 Excel 数据
        let existingData = excelUtils.readExcel(timeExcelPath, "Sheet1");
        if (existingData === null) {
            existingData = [['优化时间', '关键词', '优化花费时间（秒）', '设备名称']];
        }
        // 将现有数据转换为数组格式
        let jsArrayExistingData = [];
        let existingDataLength = existingData.length;

        for (let i = 0; i < existingDataLength; i++) {
            let innerArray = existingData[i];
            let jsInnerArray = [];
            for (let j = 0; j < innerArray.length; j++) {
                jsInnerArray.push(innerArray[j]);
            }
            jsArrayExistingData.push(jsInnerArray);
        }

        // 计算优化花费时间的整数分钟数
        let durationMinutes = Math.floor((duration / 1000));

        // 新增一条记录
        let arr = [];
        arr.push(currentDate.toLocaleString()); // 优化时间
        arr.push(keyword); // 关键词
        arr.push(durationMinutes); // 优化花费时间（分钟）
        arr.push(deviceName); // 设备名称

        jsArrayExistingData.push(arr);  // 新增记录

        // 将更新后的数据写回到 Excel 文件
        let ret = excelUtils.writeExcel(timeExcelPath, "Sheet1", 0, 0, jsArrayExistingData);
        if (ret === true) {
            addLogEntry('info', deviceName, '写入Excel成功');
            // writeLogExcel(deviceName,`LogInfo:成功写入时间Excel文件`);
        } else {
            print(deviceName + "--写入Excel失败! 错误是: " + lastError());
        }
    } catch (err) {
        print("err:" + err);
    }
}


function randomBoolByProbability(probability) {
    // 确保概率值在0到100之间
    if (probability < 0 || probability > 100) {
        throw new Error('Probability must be between 0 and 100.');
    }

    // 将概率值转换为0到1之间的数
    const prob = probability / 100;

    // 生成一个0到1之间的随机数（不包括1）
    const random = Math.random();

    // 如果随机数小于等于概率值，则返回true，否则返回false
    return random <= prob;
}
function fxBrowse(num) { //num为划动次数    //TODO:发现页完善写入
    //如果正常退出到发现页
    /*
        1、 获取id 判断 是否点击阅读 50%概率
        2、 进入发现页笔记内容，是否有互动 40%概率点赞 30%收藏 10%三连 时长 大于1分钟快速浏览
        3、 退出 当前浏览 30概率继续浏览
        4、 继续操作
    */
    checkNetError();
    checkDeviceError();
    checkYzm();
    slideUp(1);

    for (var i = 0; i < 4; i++) {
        glide(randomNum(1, 4));
        delay(1500);
    }
}

function slideUp(upNum) {
    for (var i = 1; i <= upNum; i++) {
        device.move(tcConst.movement.pageUp);
        delay(2000)
    }
}

function glide(glideNum) {
    for (var i = 1; i <= glideNum; i++) {
        device.move(tcConst.movement.pageDown);
        delay(randomNum(3000, 5000));
    }
}

function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
}

// 内容页随机
function personateDetail(detailType) {
    // 进入随机内容页面
    var newname = "未定义"
    if (detailType === "1") {
        for (let i = 0; i < randomNum(2, 3); i++) {
          delay(2000)
            actionWithRetry(
                () => moveFunction(tcConst.movement.shiftRight),
                3,
                1500);
        }
        for (let i = 0; i < randomNum(5,6); i++) {
            delay(6000);
            actionWithRetry(
                () => moveFunction(tcConst.movement.shiftDown),
                3,
                1500);
            //这里尝试获取作者名;
        }
        var nickName = actionWithRetry(() => device.sendAai({ action: "getText", query: "C:.TextView&&R:.nickNameTV" }), 3, 1500);
        delay(1500)
        for (i = 0; i < 3; i++) {
            if (nickName && nickName.retval || nickName.retval != "undefined" || typeof nickName.retval != "undefined") {
                newname = nickName.retval
                break;
            } else {
                delay(1500)
                nickName = actionWithRetry(() => device.sendAai({ action: "getText", query: "C:.TextView&&R:.nickNameTV" }), 3, 1500);
                newname = nickName.retval
            }
        }
    }
    return newname; // 在结束下滑后返回作者名数组
}

function checkNetError() {
    for (let kk = 0; kk < 6; kk++) {
        let errorText = device.sendAai({
            query: "T:*网络好像断了*",
            action: "getBounds",
        });
        if (errorText) {
            let click = device.sendAai({ query: "C:.ImageView&&R:.c3k", action: "click" });
            if (click) {
                addLogEntry('info', deviceName, '网络错误解除成功');
                delay(10000)
                break;
            }
        }
    }
}
function checkfh(){
  for (let kk = 0; kk < 3; kk++) {
      let fhText = device.sendAai({
          query: "T:*封号处理说明*",
          action: "getBounds",
      });
      if (fhText) {
        addLogEntry('info', deviceName, '已被封号');
      }
      break;
  }
}
function checkYzm() {
    for (let kk = 0; kk < 5; kk++) {
        var yzmText = device.sendAai({
            query: "T:*请通过滑块验证*",
            action: "getBounds",
        });
        //com.xingin.xhs/com.xingin.xhs.antispam.CaptchaActivity
        if (yzmText) {
            addLogEntry('info', deviceName, '设备出现验证码，已暂停50秒，尽快点击');
            delay(15000);
        } else {
            break;
        }
    }
    if (yzmText) {
        captchRet = true;  // 如果验证码没有通过，设置 captcha 为 true
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
                addLogEntry('info', deviceName, '设备错误解除成功');
                // writeLogExcel(deviceName,`LogInfo: 设备错误解除成功`);
                break;
            }
        }
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
                addLogEntry('info', deviceName, '账号异常解除成功');
                // writeLogExcel(deviceName,`LogInfo:账号异常解除成功`);
            }
        }
    }
}


function writeCountExcel(dataList) {
    try {
        let currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');

        // 本地 Excel 路径
        let excelPath = "D:/27Data/count/" + `${year}_${month}_${day}_` + "All_count.xlsx";
        // let excelPath = "D:/" + `${year}_${month}_${day}` + "_238总count.xlsx"
        // 网络文件夹路径
        let networkExcelPath = `\\\\192.168.1.111\\日报数据\\服务器count\\27\\10月\\${year}_${month}_${day}_27备份count.xlsx`;
        // 读取现有数据
        let existingData = excelUtils.readExcel(excelPath, "Sheet1");
        if (existingData === null) {
            // 如果没有现有数据，初始化表头，增加服务器列
            existingData = [['优化服务器', '优化时间', '关键词', '标题', '作者名称', '次数']];
        }

        // 处理现有数据
        let jsArrayExistingData = [];
        let existingDataLength = existingData.length;
        for (let i = 0; i < existingDataLength; i++) {
            let innerArray = existingData[i];
            let jsInnerArray = [];
            for (let j = 0; j < innerArray.length; j++) {
                jsInnerArray.push(innerArray[j]);
            }
            jsArrayExistingData.push(jsInnerArray);
        }

        // 处理新的数据
        let dataListLength = dataList.length;
        for (let j = 0; j < dataListLength; j++) {
            let findFlag = false;
            // 检查是否有匹配的记录
            for (let i = 1; i < existingDataLength; i++) {
                if (jsArrayExistingData[i][1] === dataList[j][1] && // 优化时间
                    jsArrayExistingData[i][2] === dataList[j][2] && // 关键词
                    jsArrayExistingData[i][3] === dataList[j][3]) { // 标题

                    jsArrayExistingData[i][5] = parseInt(jsArrayExistingData[i][5]) + 1;  // 次数增加
                    findFlag = true;
                    break;
                }
            }
            if (findFlag) {
                continue;
            }
            // 添加新的数据
            let arr = [];
            arr.push('27'); // 服务器列，固定为 "237Server"
            arr.push(dataList[j][0]); // 优化时间
            arr.push(dataList[j][1]); // 关键词
            arr.push(dataList[j][2]); // 标题
            let authorName = String(dataList[j][3]); // 确保作者名称是字符
            arr.push(authorName); // 作者名称
            arr.push(1); // 次数初始化为 1

            jsArrayExistingData.push(arr);
        }

        // 写回 Excel 到本地
        let localRet = excelUtils.writeExcel(excelPath, "Sheet1", 0, 0, jsArrayExistingData);
        if (localRet === true) {
            addLogEntry('info', deviceName, '成功写入27总count本地Excel文件');
        } else {
            print(deviceName + "--写入本地Excel失败! 错误是: " + lastError());
        }
        // 写回 Excel 到网络文件夹
        let networkRet = excelUtils.writeExcel(networkExcelPath, "Sheet1", 0, 0, jsArrayExistingData);
        if (networkRet === true) {
            addLogEntry('info', deviceName, '成功写入测试总count网络Excel文件');
        } else {
            print(deviceName + "--写入网络Excel失败! 错误是: " + lastError());
        }
    } catch (err) {
        print("err:" + err);
    }
}

function writeRoundCountExcel(dataList) {
    try {
        let currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');

        // 本地 Excel 路径
        // let excelPath = "D:/roundcount/" + `${year}_${taskName}` + "轮_count.xlsx";
        // 网络文件夹路径


        // 读取现有数据
        let existingData = excelUtils.readExcel(roundcountExcelPath, "Sheet1");
        if (existingData === null) {
            // 如果没有现有数据，初始化表头，增加服务器列
            existingData = [['优化服务器', '优化时间', '关键词', '标题', '作者名称', '次数']];
        }

        // 处理现有数据
        let jsArrayExistingData = [];
        let existingDataLength = existingData.length;
        for (let i = 0; i < existingDataLength; i++) {
            let innerArray = existingData[i];
            let jsInnerArray = [];
            for (let j = 0; j < innerArray.length; j++) {
                jsInnerArray.push(innerArray[j]);
            }
            jsArrayExistingData.push(jsInnerArray);
        }

        // 处理新的数据
        let dataListLength = dataList.length;
        for (let j = 0; j < dataListLength; j++) {
            let findFlag = false;

            // 检查是否有匹配的记录
            for (let i = 1; i < existingDataLength; i++) {
                if (jsArrayExistingData[i][1] === dataList[j][1] && // 优化时间
                    jsArrayExistingData[i][2] === dataList[j][2] && // 关键词
                    jsArrayExistingData[i][3] === dataList[j][3]) { // 标题

                    jsArrayExistingData[i][5] = parseInt(jsArrayExistingData[i][5]) + 1;  // 次数增加
                    findFlag = true;
                    break;
                }
            }

            if (findFlag) {
                continue;
            }

            // 添加新的数据
            let arr = [];
            arr.push('27'); // 服务器列，固定为 "237Server"
            arr.push(dataList[j][0]); // 优化时间
            arr.push(dataList[j][1]); // 关键词
            arr.push(dataList[j][2]); // 标题
            let authorName = String(dataList[j][3]); // 确保作者名称是字符
            arr.push(authorName); // 作者名称
            arr.push(1); // 次数初始化为 1

            jsArrayExistingData.push(arr);
        }

        // 写回 Excel 到本地
        let localRet = excelUtils.writeExcel(roundcountExcelPath, "Sheet1", 0, 0, jsArrayExistingData);
        if (localRet === true) {
            addLogEntry('info',deviceName,`成功写入 27 每轮count本地Excel文件`);
            // writeLogExcel(deviceName,`LogInfo:成功写入27 每轮count 网络Excel文件`);
        } else {
            print(deviceName + "--写入本地Excel失败! 错误是: " + lastError());
        }
    } catch (err) {
        print("err:" + err);
    }
}



function sendAaiFunction(query, action) {
    let result = device.sendAai({
        query: query,
        action: action,
    });
    return result;
}

function sendFunction(code, state) {
    let result = device.send(code, state);
    if (result !== 0) {
        return null;
    }
    return result;
}

function clickFunction(x, y, action) {
    let result = device.click(x, y, action);
    if (result !== 0) {
        return null;
    }
    return result;
}

function moveFunction(action) {
    let result = device.move(action);
    if (result !== 0) {
        return null;
    }
    return result;
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


function checkErrors() {
    checkNetError();
    checkDeviceError();
    checkAccountError();
}

function readNote(keyTitle) {
    /**
     * 1、开始阅读时间
     * 2、检查页面是否有错误
     * 3、获取作者名字
     */
    let flag = false;
    var name = "query";
    try {
        checkNetError();
        checkDeviceError();
        checkAccountError();
        checkYzm();
        checkfh();
        if (device.getActivity().indexOf("notedetail.NoteDetailActivity") !== -1) {
            var author = personateDetail("1");
            for (i = 0; i < 3; i++) {
                if (author && author != "undefined") {
                    name = author;
                    break;
                } else {
                    author = actionWithRetry(
                        () => device.sendAai({ action: "getText", query: "C:.TextView&&R:.nickNameTV" }),
                        3,
                        1500);
                    delay(3000);
                    name = author.retval;
                }
            }
            var title = actionWithRetry(
                () => sendAaiFunction("C:.TextView&&R:.d44", "getText"),
                3,
                1500
            );
        } else if (device.getActivity().indexOf("detail.activity.DetailFeedActivity") !== -1) {
            delay(randomNum(28000,32000));
            for (let i = 0; i < 3; i++) {
                var author = actionWithRetry(
                    () => device.sendAai({ action: "getText", query: "R:.matrixNickNameView" }),
                    3,
                    1500
                );
                if (author) {
                    name = author.retval;
                    break;
                }
            }

            // 获取标题
            var title = actionWithRetry(
                () => sendAaiFunction("C:.TextView&&R:.noteContentText", "getText"),
                3,
                1500
            );
        }

        if (!title) {
            title = { retval: "空" };
        }

        for (i = 0; i < 3; i++) {
            if (name && typeof name != "undefined" || name != "query" || name != "undefined") {
                break;
            }
            addLogEntry('error',deviceName,`作者名获取失败:,当前位置`+ name);
            delay(1500);
            var author1 = device.sendAai({ actions: ["newQuery('C:.TextView&&R:.nickNameTV',5000)", "getText"] });
            name = author1.list[1].retval
        }
        count++;
        // printf("INFO:>>>" + device.name + ">>>查找到笔记标题：" + keyTitle + ">>>作者名称:" + name + ">>>共【" + count + "】次" + ">>>搜索关键词:【" + keyword + "】");
        // 获取当前时间
        let currentTime = new Date();
        var formattedDate = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;

        // 构建行数据
        var row = [formattedDate, keyword, keyTitle, name, device.name];
        keyAll.push(row);
        keywordAll.push(row);
        finishedTitles.push(keyTitle);
        flag = true;

        navigateBack();

    } catch (e) {
        print(device.name + "错误描述: " + e.message); // 输出错误信息
        flag = false;
        delay(1500);
    }

    return flag;
}

function navigateBack() {
    for (let i = 0; i < 3; i++) {
        checkNetError();
        checkDeviceError();
        checkAccountError();
        let currentActivity = device.getActivity();
        if (currentActivity.indexOf("notedetail.NoteDetailActivity") !== -1) {
            actionWithRetry(
                () => device.sendAai({ action: "click", query: "C:.ImageView&&R:.ng" }),
                3,
                1500
            );
            break;
        } else if (currentActivity.indexOf("detail.activity.DetailFeedActivity") !== -1) {
            actionWithRetry(
                () => device.sendAai({ action: "click", query: "C:.ImageView&&R:.backButton" }),
                3,
                1500
            );
            break;
        } else {
            addLogEntry('error',deviceName,`当前没进入详情页:`+ currentActivity);
        }
    }
}

//

function run(keyword) {
    if (get_Activity().indexOf("UpdateDialogActivity") !== -1) {
        device.sendAai({ action: "click", query: "C:.ImageView&&R:.ah_" })
        addLogEntry('info', deviceName, '消除更新完成');
    }
    for (let i = 0; i < 3; i++) {
        try {
            // 临时获取活动页面信息
            delay(1500);
            if (device.getActivity().indexOf("IndexActivityV2") !== -1) {
                var clickMethods = [
                    () => actionWithRetry(() => clickFunction(970, 140, tcConst.STATE_PRESS), 3, 1500),
                    // () => device.sendAai({ action: "click", query: "TP:line,top,1&&IX:3" }),
                    // () => device.sendAai({ action: "click", query: "C:.ImageView&&R:.dr4" })
                ];
                reliableClick(clickMethods);
                device.exec(
                    "ime set com.sigma_rt.totalcontrol/.ap.service.SigmaIME",
                    5000
                );
            }
            var enterKeyword = device.inputTextSync(0, keyword);
            delay(1500);
            if (enterKeyword === true) {
                // 点击搜索按钮
                actionWithRetry(() => sendAaiFunction("C:.TextView&&R:.caj", "click"),3,1500);
                // 滑动页面
                delay(3000);
                checkNetError();
                checkYzm();
                checkfh();
                // 确保搜索页所有元素都正确加载完成
                for (let i = 0; i < 3; i++) {
                    var queryRet = device.sendAai({ actions: ["newQuery('C:.TextView&&R:/.cyz|.ey/&&ST:YX',5000)", "getText"] });
                    if (queryRet) {
                        break;  // 如果成功获取信息，退出循环
                    } else {
                        activePage = device.getActivity(); // 更新活动状态
                        if (activePage.indexOf("CaptchaActivity") !== -1) {
                            addLogEntry('info', deviceName, '遇到验证码，开始暂停');
                            // 循环等待验证码解除
                            for (let j = 0; j < 30; j++) {
                                checkNetError();
                                activePage = device.getActivity(); // 更新活动状态
                                if (activePage.indexOf("CaptchaActivity") !== -1) {
                                    delay(10000); // 等待10秒
                                } else {
                                    addLogEntry('info', deviceName, '验证码已解除');
                                    break; // 退出循环并继续执行clickTitles
                                }
                            }
                            if (activePage.indexOf("CaptchaActivity") !== -1) {
                              captchRet = true;
                              break;
                            }
                        }else{
                            delay(8000);
                            checkNetError();
                            addLogEntry('info', deviceName, '网络较慢,进行检查网络');
                            delay(5000);
                            checkNetError();
                        }

                    }
                }
                let startTime = Date.now();
                // print(Array.isArray(finishedNotes))
                searchKeyword(keyDict[keyword], keyword,finishedNotes);
                currentnotes = [];
                // Array.isArray(finishedNotes) = [];
                let endTime = Date.now();
                let duration = endTime - startTime; // 计算时间差
                let durationMinutes = (duration / 1000) / 60;
                addLogEntry('info', deviceName, '关键词:' + keyword + '优化花费时间:' + durationMinutes.toFixed(1) + "分钟");
                print(`INFO:>>>【${device.name}】关键词:【${keyword}】优化花费时间: ${durationMinutes.toFixed(1)} 分钟`);

                break;
            } else {
                delay(500);
                actionWithRetry(
                    () => sendFunction(tcConst.keyCodes.KEYCODE_BACK, tcConst.STATE_PRESS),
                    3,
                    1500);
            }
        } catch (err) {
            print(device.name + err);
        }
    }

}


/**
 * 不同点击定位方法
 */
function reliableClick(clickMethods) {
    for (let i = 0; i < clickMethods.length; i++) {
        try {
            clickMethods[i]();
            return; // 成功后退出
        } catch (err) {
            // 如果失败，继续尝试下一个方法
            print("尝试点击方法失败，继续下一个");
        }
    }
    print("所有点击方法都失败");
}

// 滑动页面
function searchKeyword(titles, keyword,finishedNotes) {
    // i 循环表示滑动次数
    for (let i = 0; i <= slideCount ; i++) { //添加下滑次数的变量
        // 在滑动之前，检查是否在 globalSearch
        let activePage = device.getActivity();
        if (activePage.indexOf("GlobalSearchActivity") !== -1) {
            // 点击标题并过滤已完成的标题
            var hasClicked = clicknote(titles, keyword);
            if (hasClicked) {
                keyDict[keyword] = keyDict[keyword].filter(title => !finishedNotes.includes(title)); // 删除已完成的笔记
                addLogEntry('info', deviceName, '已完成笔记数量:' + finishedNotes.length + " 未完成笔记数量:" + keyDict[keyword].length + " 已完成笔记标题:" + finishedNotes);
            }
            // 向下滑动
            actionWithRetry(
                () => moveFunction(tcConst.movement.shiftDown),
                3,
            2000
            );
        } else if (activePage.indexOf("CaptchaActivity") !== -1) {
            // console.log("【" + deviceName + "】遇到验证码, 开始暂停");
              addLogEntry('info', deviceName, '在搜索也上,遇到验证码，开始暂停');
            // 循环等待验证码解除
            for (let j = 0; j < 5; j++) {
                checkNetError();
                checkDeviceError();
                checkAccountError();
                activePage = device.getActivity(); // 更新活动状态
                if (activePage.indexOf("CaptchaActivity") !== -1) {
                    delay(15000); // 等待10秒
                } else {
                    // console.log("【" + deviceName + "】验证码已解除");
                    break; // 退出循环并继续执行clickTitles
                }
            }
            if (activePage.indexOf("CaptchaActivity") !== -1) {
              captchRet = true;
              break;
            }
        } else {
            checkNetError();
            checkDeviceError();
            checkAccountError();
        }
    }

    // writeLogExcel(deviceName,`LogInfo: 关键词--->${keyword}:已经完成${finishedTitles.length}---未完成笔记标题:${titles.length}`);
    addLogEntry('info', deviceName, '关键词:' + keyword + " 已经完成:" + finishedTitles.length + " 未完成笔记标题:" + titles.length);
    // console.log("INFO:>>>【" + deviceName + "】>>>关键词:【" + keyword + "】 已经完成:" + finishedTitles.length + " 未完成笔记标题:" + titles.length);
}

// function clickTitles(titles, keyword, finishedNotes) {
//     let zh = false;
//     var pagenotes = actionWithRetry(
//         () => device.sendAai({ query: "C:.TextView&&R:/.cyz|.ey/&&ST:YX", action: "getText" }),
//         3,
//         1500);
//     // var pagenotes = device.sendAai({query:"C:.TextView&&R:/.cyz|.ey/&&ST:YX",action:"getText"})
//     if (pagenotes === null || pagenotes.retval === null) {
//         for (var i = 0; i < 3; i++) {
//             delay(1500);
//             var pagenotes = actionWithRetry(
//                 () => device.sendAai({ query: "C:.TextView&&R:/.cyz|.ey/&&ST:YX", action: "getText" }),
//                 3,
//                 1500);
//             if (pagenotes.retval != null) {
//                 break;
//             }
//             addLogEntry('error', deviceName, '获取搜索笔记失败,当前页面在' + device.getActivity());
//         }
//     }
//     var cleanedPagenotes;
//     if(Array.isArray(pagenotes.retval)){
//         cleanedPagenotes = pagenotes.retval.map(note => cleanString(note).slice(0, 20));
//     }else{
//         cleanedPagenotes = [cleanString(pagenotes.retval).slice(0, 20)];
//     }
//
//     // 进行匹配
//     const matches = titles.filter(title => {
//         var cleanedTitle = cleanString(title).slice(0, 18); // 取前 15 个字符
//         return cleanedPagenotes.some(cleanedPagenote => {
//             let mismatches = 0;
//             for (let i = 0; i < Math.min(cleanedTitle.length, cleanedPagenote.length); i++) {
//                 if (cleanedTitle[i] !== cleanedPagenote[i]) {
//                     mismatches++;
//                     if (mismatches > 1) break;  // 允许最多1个字符的差异
//                 }
//             }
//
//             return mismatches <= 1;
//         });
//     });
//
//     if (matches.length === 0) {
//         return false; // 没有找到匹配的标题
//     }
//
//     let anyClicked = false;
//     // 遍历匹配成功的标题并进行点击
//     matches.forEach(match => {
//         pagenotes.retval.forEach(pagenote => {
//             var cleanedPagenote = cleanString(pagenote).slice(0, 20);
//             // var shortenedPagenote = (pagenote).slice(0, 20);
//             var cleanedMatch = cleanString(match).slice(0, 18);
//
//             let mismatches = 0;
//             for (let i = 0; i < Math.min(cleanedMatch.length, cleanedPagenote.length); i++) {
//                 if (cleanedMatch[i] !== cleanedPagenote[i]) {
//                     mismatches++;
//                     if (mismatches > 1) break;
//                 }
//             }
//             // 如果匹配成功，使用 pagenotes 中的内容进行点击
//             if (mismatches <= 1) {
//                 let noteToRead = pagenote.slice(0, 18);
//                 if (!currentnotes.includes(noteToRead)) {
//                     var ids = actionWithRetry(
//                         () => device.sendAai({ query: "T:*" + noteToRead + "*", postAction: "getBounds" }), 2, 1500);
//                     if (!ids) {
//                         let shortTitle = noteToRead.slice(0, 4); // 获取标题的前5个字符
//                          ids  =   actionWithRetry(
//                             () => device.sendAai({ query: "T:*" + shortTitle + "*", action: "getBounds" }),
//                              2,  // 尝试2次
//                              1500  // 每次尝试的延时
//                              );
//                     }
//                     /**
//                       1、获取综合的下边缘
//                       2、获取目标笔记的上边缘
//                       3、安全边距为30
//                       4、确保目标笔记的 y 上边缘大于综合区域的 y 下边缘
//
//                     */
//                     if (ids.bounds) {
//                         if (ids.bounds[0][1] < 338) {
//
//                             delay(1500)
//                             addLogEntry('warn',deviceName,`bound值小于综合` );
//                             print(device.name + "bound值小于综合"+ ids.bounds[0][1] + ids.bounds[0][3])
//                             actionWithRetry(
//                                 () => moveFunction(tcConst.movement.shiftUp),
//                                 3,
//                                 1500);
//                                 //更改滑动 使位置恢复到300
//                                 zh = true;
//                         }
//                         delay(1500);
//                     }else{
//                       print(deviceName + "获取失败")
//                       actionWithRetry(
//                           () => moveFunction(tcConst.movement.shiftUp),
//                           3,
//                           1500);
//                           zh = true;
//                     }
//                     var ret = device.sendAai({ query: "T:*" + noteToRead + "*", postAction: "click" });
//                     checkNetError();
//                     // 将匹配成功的源 title 加入 finishedNotes
//                     if (!ret) {
//                        let shortTitle = noteToRead.slice(0, 4); // 再次提取前5个字符
//                         addLogEntry('error', deviceName, '点击笔记失败');
//                          ret = actionWithRetry(
//                             () => device.sendAai({ query: "T:*" + shortTitle + "*", action: "click" }),
//                             2,  // 尝试2次
//                             1500  // 每次尝试的延时
//                             );
//                     }
//                     finishedNotes.push(noteToRead);
//                     currentnotes.push(noteToRead);
//                     readNote(match);  // 读取笔记内容
//                     if(zh){
//                       delay(1000);
//                       actionWithRetry(
//                           () => moveFunction(tcConst.movement.shiftDown),
//                           3,
//                           1500);
//                           zh = false;
//                     }
//                     anyClicked = true;
//                 } else {
//                     // console.log(deviceName + "当前笔记：【" + noteToRead + "】已经存在于笔记库中，跳过操作");
//                 }
//             }
//         });
//     });
//     return anyClicked ? matches : false; // 返回匹配成功的源标题
// }

function clicknote(titles, keyword) {
    var pagenotes = getPageNotes();  // 获取页面笔记
    var matches = filterMatchingTitles(titles, pagenotes);  // 筛选匹配的标题
    var anyClicked = false;  // 标记是否有任何笔记被点击
    var clickAllowed = false;  // 标记是否需要下拉操作
    delay(500)
    // 遍历匹配成功的笔记
    matches.forEach(noteData => {
        let originTitle = noteData.matchedNote;
        let cleantitle = noteData.originalTitle
        // 检查位置，如果位置不合格则设置下拉标志
        if (!currentnotes.includes(originTitle)) {
            clickAllowed = checkPosition(originTitle);  // 使用原始标题检查是否需要下拉
            // 尝试点击该笔记
            var clickret = device.sendAai({ query: "T:" + originTitle, postAction: "click" });
            if (clickret) {
                finishedNotes.push(cleantitle);  // 将该笔记标记为已完成
                currentnotes.push(originTitle);  // 将该笔记标记为当前正在处理的笔记
                readNote(cleantitle);  // 使用匹配后的笔记标题读取内容
                anyClicked = true;

            } else {
                device.sendAai({ query: "T:" + originTitle, postAction: "click" });
                addLogEntry('error', deviceName, '点击笔记失败');
            }
            if (clickAllowed) {
                addLogEntry('info', deviceName, '笔记位置不合格，进行下拉操作');
                device.swipe([500, 1100], [500, 200], 2);  // 执行滑动操作
            } else {
                addLogEntry('info', deviceName, '所有笔记已阅读，无需下拉操作');
            }
        }
    });
    return anyClicked;  // 返回是否有任何笔记被点击
}

function checkPosition(reqNoteClick) {
    var boundaryBox = { left: 20, top: 338, right: 1050, bottom: 2000 };
    let maxOffset = 0;  // 用于记录最大的滑动偏移量
    let needsScroll = false;  // 标记是否需要滑动
    // 遍历要点击的笔记
        delay(500)
        let ids = device.sendAai({ query: "T:" + reqNoteClick , postAction: "getBounds" });
        // 确保获取到笔记的坐标信息
        if (ids) {
            let top = ids.bounds[0][1]
            // 如果笔记的top坐标低于方格的top，需要上移
            if ( top <= 306) {
                print("ids获取成功"+ids.bounds[0])
                let offset = 500 - top;  // 计算需要上移的偏移量
                maxOffset = Math.max(maxOffset, offset);  // 记录最大偏移量
                needsScroll = true;  // 标记需要滑动
            }
        }else{
          actionWithRetry(
             () => device.sendAai({ query: "T:" + reqNoteClick, postAction: "getBounds" }),
             2,
             1500
         );
          print("ids获取失败")
        }

    // 如果有需要滑动的偏移量
    if (needsScroll) {
        addLogEntry('warn', deviceName, `笔记超出方格顶部，2滑动调整位置，最大偏移量：${maxOffset}`);
        print("滑动避免")
        delay(800)
        // 执行一次滑动操作
        device.scroll(20, 338, 20, 438);
        delay(800);
        return true;  // 返回表示已滑动
    }
    return false;  // 没有需要调整的位置
}

function filterMatchingTitles(titles, pagenotes) {
    // 进行匹配，检查标题前18个字符是否与笔记库中相似
    const matches = titles.map(title => {
        // 不再对标题进行清理，直接使用原始标题
        let cleanedTitle = cleanString(title).slice(0, 18); // 只取前18个字符进行匹配

        // 查找匹配的页面笔记
        let matchedNote = pagenotes.find(note => {
            let cleanedPagenote = cleanString(note).slice(0, 18);  // 对页面笔记进行清理和裁剪
            let mismatches = 0;
            for (let i = 0; i < Math.min(cleanedTitle.length, cleanedPagenote.length); i++) {
                if (cleanedTitle[i] !== cleanedPagenote[i]) {
                    mismatches++;
                    if (mismatches > 2) break;  // 允许最多2个字符的差异
                }
            }
            return mismatches <= 1;
        });

        // 如果匹配成功，返回原始标题和匹配的页面笔记
        if (matchedNote) {
            return { originalTitle: title, matchedNote: matchedNote };
        } else {
            return null;  // 没有匹配时返回 null
        }
    }).filter(result => result !== null); // 过滤掉 null 结果

    // 返回所有匹配的原始标题和匹配的页面笔记
    return matches;
}

function getPageNotes() {
    var pagenotes = actionWithRetry(
        () => device.sendAai({ query: "C:.TextView&&R:/.cyz|.ey/&&ST:YX", action: "getText" }),
        3,
        1000
    );

    // 如果获取不到笔记数据，重试最多3次
    if ( !pagenotes || !pagenotes.retval) {
        for (let i = 0; i < 3; i++) {
            delay(1500);
            pagenotes = actionWithRetry(
                () => device.sendAai({ query: "C:.TextView&&R:/.cyz|.ey/&&ST:YX", action: "getText" }),
                3,
                1500
            );
            if (pagenotes && pagenotes.retval ) {
                break;
            }
            addLogEntry('error', deviceName, '获取搜索笔记失败,当前页面在' + device.getActivity());
        }
    }

    return pagenotes && pagenotes.retval ? pagenotes.retval : [];
}

function cleanString(str) {
    // 移除除汉字、字母、数字和空格外的所有字符
    return str.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '');
}
function get_Activity() {
    for (let q = 0; q < 3; q++) {
        var ret = device.getActivity();
        if (ret) {
            return ret;
        }
        delay(1500);
    }
    addLogEntry('error', deviceName, '3次get_Activity都失败');
}
