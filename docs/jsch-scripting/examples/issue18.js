const log = console.timedf("hello");
const {
    make_session, make_shell, scpfrom, scpto
} = require("classpath:builtin/jsch.js");

log(module.uri, arguments);

function hello_main() {
    // create a JSch session
    const session/*com.jcraft.jsch.Session*/ = make_session({
        host: "10.65.46.151",
        port: 22,
        user: "oracle",
        passwd: "Welcome1"
    });
    log("connecting...");
    session.connect();
    log("connected...");
    // 创建 shell
    const shell = make_shell(session, Object.assign({}, {
        FPS1: "[oracle@celvpvm07578 ~]$ ",
        logf: "./hello.log",     // log file location, for log all output of ssh interactive
        loge: function (buf) {   // log event, trigger when response is comming from remote
            // log(buf);
        },
        // waite: function(flag, elapsed, times) {  // wait event
        //     log(flg, elapsed, times)
        // }
    }));

    // start ssh interactive, and start generating another log to local until tmp_dir
    log("connect.", shell.connect());
    shell.startlog("./hello_fragment_1.log");
    log("<date>", shell.sendlnw("date"));
    log("wait <date>", shell.wait4PS1());
    shell.endlog();
    //
    // close the shell, and session
    shell.disconnect();
    session.disconnect();
}

hello_main();
