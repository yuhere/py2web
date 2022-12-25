const log = console.timedf("hello");
const {make_cmd} = require("./wincmdk.js");

log(module.uri, arguments);

function hello_main() {
    // create a "cmd /k" process
    const cmdk = make_cmd({
        "PS1": "C:\\Driver_D\\g_workspace\\JSch-Scripting>",
        "logfile": "win_cmdk.log",
        "charset": "GB18030",    // code page = 936
        "cwd": "C:\\Driver_D\\g_workspace22",
        "env": {
            "XPATH": "xpath"
        },
        loge: function (buf) {   // log event, trigger when response is coming from the process
            // log(buf);
        },
        waite: function (flag, elapsed, times) {  // wait event
            // log(flag, elapsed, times)
        }
    });

    log("wait PS1 1.", cmdk.wait4PS1());
    log("sendlnw [dir]", cmdk.sendlnw("dir"));
    log("wait PS1 2.", cmdk.wait4PS1());
    log("sendlnw [echo]", cmdk.sendlnw("echo %XPATH%"));
    log("wait PS1 3.", cmdk.wait4PS1());
    let {kw, txt} = cmdk.last();
    log("last:", "kw:" + JSON.stringify(kw), "txt:" + JSON.stringify(txt));
    log("sendlnw [exit]", cmdk.sendlnw("exit"));
    cmdk.destroy();
}

hello_main();
