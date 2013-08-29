(assert-js "(defmacro yield (x) `(js \"yield %\" ~x)) (yield (+ 2 2))" "yield (2 + 2);")

