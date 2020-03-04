//
// insert/delete/find (integer)
//

Expression
  = list:Func* {
     return JSON.stringify(list)
    }

Func "insert/delete/find"
  = _ funn:Funn  "(" _ expr:Integer _ ")" _  { return {fn: funn, val: expr}; }

Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

FunNames 
  = "insert"
  / "delete"
  / "find"

Funn "funn"
  = _ FunNames {return text()}

_ "whitespace"
  = [ \t\n\r]*
