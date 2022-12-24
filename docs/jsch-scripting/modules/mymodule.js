const log = console.timedf("my_module");
log(module.uri, arguments);

module.exports = {
    name: "my_module",
    attr1: "attr1",
    func1: () => "func1_value"
};
