(assert-js "(defn dret-if (a) (if a true false))" "var dretIf = (function(a) {
  if (a) {
    return true;
  } else {
    return false;
  }
});")

;; same when expr can be rendered in 3 different forms
(assert-js "(defn dret-when (a) (when a 42))" "var dretWhen = (function(a) {
  if (a) {
    return 42;
  }
});")

(assert-js "(defn expr-when (a) (log (when a 42)))" "var exprWhen = (function(a) {
  return console.log((function() {
    if (a) {
      return 42;
    }
  })());
});")

(assert-js "(defn stmt-when (a) (when a (set a b)) a)" "var stmtWhen = (function(a) {
  if (a) {
    a = b;
  }
  return a;
});")
