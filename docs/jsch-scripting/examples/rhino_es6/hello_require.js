const log = console.timedf("hello");
log(module.uri, arguments);

const {name, attr1, func1} = require("mymodule.js");
log("de-struct from a module. (" + "name=" + name + ",attr1=" + attr1 + ") func1=" + func1());

function func_destruct({a}) {
    return a;
}
log("argument de-struct...", func_destruct({a: "aaaaaaa"}));
