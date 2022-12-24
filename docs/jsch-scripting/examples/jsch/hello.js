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
    log("connect...");
    log("connected...", session.connect());
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
    const log_fragment_1 = "./hello_fragment_1.log";  //
    shell.startlog(log_fragment_1);
    log("connect.", shell.connect());
    log("<date>", shell.sendlnw("date"));
    log("wait <date>", shell.wait4PS1());
    log("<oraenv>", shell.sendlnw(". oraenv"));
    log("wait <oraenv>", shell.wait4("] ? "));
    log("<oraenv>", shell.sendlnw("db199ncdb"));
    log("wait <oraenv>", shell.wait4PS1());
    shell.endlog();
    //
    const tmp_dir = java.lang.System.getProperty("java.io.tmpdir");
    //
    log("<echo>", shell.sendlnw("echo \"hello " + new Date() + "\" > hello.txt"));
    log("wait <echo>", shell.wait4PS1());
    log("download file from server...");
    const from_lfile = tmp_dir + "";           // local file location
    const from_rfile = "hello.txt";            // remote file location
    scpfrom(session, from_rfile, from_lfile, function (/*String*/flg, /*long*/passed, /*long*/total) {
        log("download...", flg, passed, total, passed / total * 100 + "%");
    });

    log("upload file to server...");
    const to_lfile = tmp_dir + "/hello.txt";     // local file location
    const to_rfile = "hello_1.txt";              // remote file location
    scpto(session, to_lfile, to_rfile, function (/*String*/flg, /*long*/passed, /*long*/total) {
        log("upload...", flg, passed, total, passed / total * 100 + "%");
    });

    log("<cat>", shell.sendlnw("cat hello_1.txt"));
    log("wait <cat>", shell.wait4PS1());

    // close the shell, and session
    shell.disconnect();
    session.disconnect();
}

hello_main();
