const log = console.timedf("hello");
const {make_session, make_shell} = require("classpath:builtin/jsch.js");

// log(module.uri, arguments);

function hello_main() {
    // create a JSch session
    const session = make_session({
        host: "14.14.52.32",
        port: 22,
        user: "opc",
        privateKeyFile: "C:\\pks\\1_14.14.52.32.key",
        /* passphrase: "" <<<< it is an optional parameter, only required if the key file needs a passphrase */
        proxy: "http://proxy.xxx.com:80"
    });
    log("connect...");
    log("connected...", session.connect());
    // create a shell
    const shell = make_shell(session, Object.assign({}, {
        FPS1: "[opc@instance-20220916-1726 ~]$ ",
        RPS1: false,               // do not reset the PS1 as a random string.
        logf: "./hello_1.log",     // log file location, for log all output of ssh interactive
        loge: function (buf) {     // log event, trigger when response is coming from remote
            // log(buf);
        },
        // waite: function(flag, elapsed, times) {  // wait event
        //     log(flg, elapsed, times)
        // }
    }));
    // start ssh interactive, and start generating another log to local until tmp_dir
    log("connecting...");
    shell.connect();
    log("connected...");
    log("<date>", shell.sendlnw("date"));
    log("wait <date>", shell.wait4PS1());
    log("<whoami>", shell.sendlnw("whoami"));
    log("wait <whoami>", shell.wait4PS1());
    let {kw, txt} = shell.last();
    log("<whoami>", JSON.stringify(txt));
    // close the shell, and session
    shell.disconnect();
    session.disconnect();
}

hello_main();

// assets\examples\jsch\LoginWithPrivateKeyFile.js
// .........
// 17:13:53.364 hello connect...
// 17:13:55.704 hello connected... undefined
// 17:13:55.741 hello connecting...
// 17:13:56.214 hello connected...
// 17:13:56.429 hello <date> 0
// 17:13:56.429 hello wait <date> 0
// 17:13:56.651 hello <whoami> 0
// 17:13:56.651 hello wait <whoami> 0
// 17:13:56.655 hello <whoami> "opc\n"
//
// Process finished with exit code 0

