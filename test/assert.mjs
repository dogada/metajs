(assert 42)
(assert-eq (+ 2 3) (+ 1 4))

(assert-eq* {x: 1} {x: 1})
(assert-eq (first [1 2 "three" "quote \" \n ' inside \'"]) 1)

(assert* true)

(let (x 1 y 2)
  (assert-defined x y)
  1)

(asserts
 (> 2 1) "one"
 2 ""
 3
 (+ 2 3))



