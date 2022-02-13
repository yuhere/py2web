$(document).ready(function() {
  var KB      = 1024;
  var MS_IN_S = 1000;

  var parser = SQLConditionParser;

  var parseTimer         = null;
  var oldInput          = null;

  function buildSizeAndTimeInfoHtml(title, size, time) {
    return $("<span/>", {
      "class": "size-and-time",
      title:   title,
      html:    (size / KB).toPrecision(2) + "&nbsp;kB, "
                 + time + "&nbsp;ms, "
                 + ((size / KB) / (time / MS_IN_S)).toPrecision(2) + "&nbsp;kB/s"
    });
  }

  function buildErrorMessage(e) {
    // return e.location !== undefined
    //   ? "Line " + e.location.start.line + ", column " + e.location.start.column + ": " + e.message
    //   : e.message;
    // console.log(e);
    return e.location !== undefined
      ? "Syntax Error at (Line " + e.location.start.line + ", Column " + e.location.start.column + "). "
        + e.message
      : (
        e.elocation !== undefined
        ? "Eval Error at (Line " + e.elocation.start.line + ", Column " + e.elocation.start.column + "). "
          + e.message
        : e.message
      );
  }


    function eval_filter_ast(itm, exp_ast, debug = true) {
        const FUNCS = {
            "UPPER": function(str) {
                if (typeof str !== "string") return str;
                return str.toUpperCase()
            },
            "LOWER": function(str) {
                if (typeof str !== "string") return str;
                return str.toLowerCase()
            }
        };
        
        function is_like(val, exp) {
            console.log("is_like", val, exp);
            if (exp == null) exp = "";
            if (typeof exp !== "string") exp = exp + ""
            let re = new RegExp(exp.replace(/_/g, '.{1}').replace(/%/g, '.*'), "g");
            return re.test(val)
        }

        // 
        let clog = {
            log: debug ? console.log :()=>{},  
            error: debug ? console.error :()=>{}, 
        }
        //
        function _eval_internal(ast_node, level = 0) {
            let {type, operator, parentheses} = ast_node;
            clog.log("_eval_internal", level, ast_node)
            if (type===undefined && ast_node["0"]) {
                return _eval_internal(ast_node["0"], level + 1)
            }
            if (type === "unary_expr") {
                if (operator === "NOT") {
                    let {expr} = ast_node;
                    return !_eval_internal((Array.isArray(expr) ? expr[0] : expr), level + 1)
                }
            }
            if (type === "binary_expr") {
                // logic operator
                if (["OR", "AND"].indexOf(operator)!==-1) {
                    let nodes = [];
                    if (ast_node["left"]) nodes.push(ast_node["left"]);
                    if (ast_node["right"]) nodes.push(ast_node["right"]);
                    // 
                    if (operator === "OR") {
                        for (let i = 0;i<nodes.length;i++) {
                            let val = _eval_internal((Array.isArray(nodes[i]) ? nodes[i][0] : nodes[i]), level+1);
                            if (val) return val;
                        }
                        return false;
                    } 
                    if (operator === "AND") {
                        for (let i = 0;i<nodes.length;i++) {
                            let val = _eval_internal((Array.isArray(nodes[i]) ? nodes[i][0] : nodes[i]), level+1);
                            if (!val) return val;
                        }
                        return true;
                    }
                }
                // comparison operator
                if ([">=", ">", "<=", "<", "=", "<>", "!=", "LIKE", "NOT LIKE", "IS", "IS NOT", "IN", "NOT IN"].indexOf(operator)!==-1) {
                    let left = _eval_internal(Array.isArray(ast_node["left"]) ? ast_node["left"][0] : ast_node["left"]);
                    let right = _eval_internal(Array.isArray(ast_node["right"]) ? ast_node["right"][0] : ast_node["right"]);
                    clog.log("comparison...", operator, left, right);
                    if (operator === ">=") {
                        clog.log("comparison...", operator, left, right, left >= right);
                        return left >= right;
                    } 
                    if (operator === ">") {
                        clog.log("comparison...", operator, left, right, left > right);
                        return left > right;
                    } 
                    if (operator === "<=") {
                        clog.log("comparison...", operator, left, right, left <= right);
                        return left <= right;
                    } 
                    if (operator === "<") {
                        clog.log("comparison...", operator, left, right, left < right);
                        return left < right;
                    } 
                    if (operator === "=") {
                        clog.log("comparison...", operator, left, right, left == right);
                        return left == right;
                    } 
                    if (operator === "<>" || operator === "!=") {
                        clog.log("comparison...", operator, left, right, left != right);
                        return left != right;
                    } 
                    
                    if (operator === "LIKE") {
                        let retval = is_like(left, right);
                        clog.log("comparison...", operator, left, right, retval);
                        return retval
                    } 
                    if (operator === "NOT LIKE") {
                        let retval = !is_like(left, right);
                        clog.log("comparison...", operator, left, right, retval);
                        return retval
                    } 
                    if (operator === "IS") {
                        clog.log("comparison...", operator, left, right, left === right);
                        return left === right;
                    }
                    if (operator === "IS NOT") {
                        clog.log("comparison...", operator, left, right, left !== right);
                        return left !== right;
                    }
                    if (operator === "IN") {
                        clog.log("comparison...", operator, left, right, right.indexOf(left)!==-1);
                        return right.indexOf(left)!==-1;
                    }
                    if (operator === "NOT IN") {
                        clog.log("comparison...", operator, left, right, right.indexOf(left)===-1);
                        return right.indexOf(left)===-1;
                    }
                }
                // arithmetic/string operator
                if (["+", "-", "*", "/", "%", "||"].indexOf(operator)!==-1) {
                    let left = _eval_internal(Array.isArray(ast_node["left"]) ? ast_node["left"][0] : ast_node["left"]);
                    let right = _eval_internal(Array.isArray(ast_node["right"]) ? ast_node["right"][0] : ast_node["right"]);
                    if (operator === "+") {
                        console.log("arithmetic...", operator, left, right, left + right);
                        return left + right;
                    }
                    if (operator === "-") {
                        console.log("arithmetic...", operator, left, right, left - right);
                        return left - right;
                    }
                    if (operator === "*") {
                        console.log("arithmetic...", operator, left, right, left * right);
                        return left * right;
                    }
                    if (operator === "/") {
                        console.log("arithmetic...", operator, left, right, left / right);
                        return left / right;
                    }
                    if (operator === "%") {
                        console.log("arithmetic...", operator, left, right, left % right);
                        return left % right;
                    }
                    if (operator === "||") {
                        console.log("string...", operator, left, right, JSON.stringify("" + left + right));
                        return "" + left + right;
                    }
                }
                
                clog.error("error 111", ast_node);
                throw new Error("Unknown. type=" + type + ",operator=" + operator)
            }
            if (["column_ref"].indexOf(type)!==-1) {
                let column = ast_node["column"];
                if (!itm.hasOwnProperty(column)) {
                    clog.error("error 222", ast_node);
                    throw {
                        message: "Invalid column. Type=" + type + ",Column="+column + ".",
                        elocation: ast_node.location
                    }
                }
                return itm[column];
            } 
            if (["number", "string"].indexOf(type)!==-1) {
                return ast_node["value"];
            }
            if (["null"].indexOf(type)!==-1) {
                return null;
            }
            if (type === "function") {
                let {name, args} = ast_node;
                let func = FUNCS[name];
                if (typeof func !== "function") {
                    clog.error("error 222", ast_node);
                    throw {
                        message: "Invalid function call. name=" + name + ".",
                        elocation: ast_node.location
                    }
                }
                // 
                let eargs = _eval_internal(Array.isArray(args) ? args[0] : args);
                let retval = func.apply(func, eargs);
                clog.log("function...", name, eargs, "=>", retval);
                return retval;
            }
            if (type === "expr_list") {
                let {value} = ast_node;
                return value.map(function(itm, idx) {
                    return _eval_internal(Array.isArray(itm) ? itm[0] : itm);
                });
            }
            // // case
            clog.error("error 000", ast_node);
            throw new Error("Unknown. type=" + type)
        }
        return _eval_internal(exp_ast);
    }


  function parse() {
    oldInput = $("#input").val();

    $("#input").removeAttr("disabled");
    $("#parse-message").attr("class", "message progress").text("Parsing the input...");
    $("#output").addClass("disabled").text("Output not available.");

    try {
      var timeBefore = (new Date).getTime();
      var output = parser.parse($("#input").val());
      var timeAfter = (new Date).getTime();

      $("#parse-message")
        .attr("class", "message info")
        .text("Input parsed successfully.")
        .append(buildSizeAndTimeInfoHtml(
          "Parsing time and speed",
          $("#input").val().length,
          timeAfter - timeBefore
        ));
      $("#output").removeClass("disabled").text(jsDump.parse(output));
      // extract4semantic(output);
      // 
      console.log(output);
      var sample = JSON.parse($("#sample").val());
      console.log(sample, sample.filter(function(itm, idx) {
          return eval_filter_ast(itm, output);
      }));
      // 
      var result = true;
    } catch (e) {
      console.log(e);
      $("#parse-message").attr("class", "message error").text(buildErrorMessage(e));
      var result = false;
    }

    doLayout();
    return result;
  }

  function scheduleParse() {
    if ($("#input").val() === oldInput) { return; }

    if (parseTimer !== null) {
      clearTimeout(parseTimer);
      parseTimer = null;
    }

    parseTimer = setTimeout(function() {
      parse();
      parseTimer = null;
    }, 500);
  }

  function doLayout() {
    /*
     * This forces layout of the page so that the |#columns| table gets a chance
     * make itself smaller when the browser window shrinks.
     */
    $("#left-column").height("0px");    // needed for IE
    $("#right-column").height("0px");   // needed for IE
    $("#input").height("0px");
    $("#sample").height("0px");
    // $("#output").height("0px");
    //
    $("#left-column").height(($("#left-column").parent().innerHeight() - 2) + "px");     // needed for IE
    $("#right-column").height(($("#right-column").parent().innerHeight() - 2) + "px");   // needed for IE
    //
    var _height = $("#input").parent().parent().innerHeight();
    $("#input").height((_height - 200 - 14) + "px");
    $("#sample").height((100) + "px");
    $("#output").height((_height - 104) + "px");
  }


  $("#input")
    .change(scheduleParse)
    .mousedown(scheduleParse)
    .mouseup(scheduleParse)
    .click(scheduleParse)
    .keydown(scheduleParse)
    .keyup(scheduleParse)
    .keypress(scheduleParse);


  $("#loader").hide();
  $("#content").show();

  doLayout();
  $(window).resize(doLayout);

  scheduleParse();

});
