(assert-eq (let (x 1 y 2) y) 2)
(assert-eq (let* (x 1 y 2) y) 2)

(def x 100)
(let (x 1 y 2)
  (assert-eq x 1)
  x)
(assert-eq x 100)

(let (x [42 8]
        [y z-let] x)
  (assert-eq* x [42 8])
  (assert-eq y 42)
  (assert-eq z-let 8)
  y)

(let (x)
  (assert-eq x undefined))

(let (x 1 y)
  (assert-eq x 1)
  (assert-eq y undefined))

(let ([x y])
  (assert-eq x undefined)
  (assert-eq y undefined))

(let x 1
     (assert-eq x 1))

(let x 1 y 2
     (assert-eq x 1)
     (assert-eq y 2))

(let ls [1 2] [x y] ls
     (assert-eq x 1)
     (assert-eq y 2))

(assert-eq (let x 1 x) 1)
(assert-eq (let x 1 y (+ x 3) y) 4)

(assert-eq x 100)
(assert* (undefined? unknown-var-1234))





