(assert-eq (try (+ 2 3) (catch e (log e))) 5)
(let a 1
     (assert-eq (try
                 (set a 2)
                 a
                 (catch e e.message)
                 (finally (set a 3))) 2))

(assert-eq (try
             (/ 2 undefined-var)
             (catch e e.message)
             (finally (set a 3))) "undefinedVar is not defined")

; usually you never return from finally, but you can
(assert-eq (try
             (/ 2 undefined-var)
             (catch e e.message)
             (finally (-return "finally-return"))) "finally-return")

(assert-js "(try a b (catch e e.message) (finally (log \"1\") (log \"finally\")))" "(function() {
  try {
    a;
    return b;
  } catch (e) {
    return e.message;
  } finally {
    console.log(\"1\");
    console.log(\"finally\");
  }
})();")

(assert-js "(try a b (catch e e.message))" "(function() {
  try {
    a;
    return b;
  } catch (e) {
    return e.message;
  }
})();")

(assert-js "(try a b (finally (set a 1) (set b a)))" "(function() {
  try {
    a;
    return b;
  } finally {
    a = 1;
    b = a;
  }
})();")

(assert-js "(try a b c)" "Error: At least catch or finally must be provided.")
