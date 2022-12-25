function make_cmd(opts) {
    let PS1 = opts['PS1'];         // the wait string during connect.
    const ofn = opts['logfile'];
    const charset = opts['charset'] || 'iso-8859-1';
    const loge = opts['loge'];
    const waite = opts['waite'];
    //
    const env = opts['env'];
    if (env) {
        const pb = new java.lang.ProcessBuilder("cmd", "/k");
        const penv = pb.environment();
        for (let key of Object.keys(env)) {
            penv.put(key, env[key]);
        }
    }
    //
    const cwd = opts['cwd'];
    if (cwd) {
        const cwd_f = new java.io.File(cwd);
        if (cwd_f.exists() && cwd_f.isDirectory()) {
            pb.directory(cwd_f);
            PS1 = cwd_f.getAbsolutePath() + ">";
        }
    }
    //
    pb.redirectErrorStream(true);
    const process = pb.start();
    //
    const input = new java.io.PrintStream(process.getOutputStream());
    const output = process.getInputStream();
    //
    const TARGET_OS_LINE_SEPARATOR = "\n";
    //
    const log_fos = ofn
        ? new java.io.FileOutputStream(ofn)
        : undefined;
    //
    const x = new Packages.yupen.isw.ISWaiter(output, log_fos, charset);
    loge && x.addLogListener(loge);
    waite && x.addWaitListener(waite);

    function sendln(command) {
        command = command + TARGET_OS_LINE_SEPARATOR;
        input.write((new java.lang.String(command)).getBytes(charset));  // send bytes data.
        input.flush();
    }

    function sendlnw(command, _timeout) {
        _timeout = _timeout || 10 * 60 * 1000;
        sendln(command);
        return x.wait4(TARGET_OS_LINE_SEPARATOR, _timeout);
    }

    function wait4() {
        return x.wait4.apply(x, Array.prototype.slice.call(arguments, 0))
    }

    const wait4PS1 = wait4.bind(null, PS1);

    function destroy() {
        log_fos.flush();
        log_fos.close();
        process.destroy();
    }

    function lastN(n) {
        const lst = x.history(n), rtn = [];
        for (let i = 0; i < lst.size(); i++) {
            let l = lst.get(i);
            rtn.push({txt: l.txt + "", kw: l.kw + ""});
        }
        return rtn;
    }

    function last() {
        return lastN(1)[0];
    }

    // @@@@@@@@@@@@@@@@@@@@
    let nlog;

    function _mk_log_writer(file_name) {
        const pw = new java.io.PrintWriter(new java.io.FileOutputStream(file_name));
        const lw = function (str, flag) {
            pw.write(str);
            pw.flush();
        };
        lw.close = function () {
            pw.flush();
            pw.close();
        };
        return lw;
    }

    function startlog(file_name) {
        if (nlog !== undefined) {
            return false;
        }
        nlog = _mk_log_writer(file_name);
        x.attachWaitLogger(nlog);
        return true;
    }

    function endlog() {
        if (nlog === undefined) {
            return false;
        }
        x.detachWaitLogger();
        nlog.close();
        nlog = undefined;
        return true;
    }

    return {
        PS1: PS1, charset: charset,
        destroy: destroy,
        sendln: sendln,
        sendlnw: sendlnw,
        wait4: wait4, wait4PS1: wait4PS1,
        lastN: lastN,
        last: last,
        startlog: startlog, endlog: endlog
    }

}

//
module.exports = {make_cmd: make_cmd};
