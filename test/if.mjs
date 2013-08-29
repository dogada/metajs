(defn if-test (x)
  (if (= x 1) 1
      (= x 2) 2
      (= x 3) 3))

(assert-eq (if-test 1) 1)
(assert-eq (if-test 2) 2)
(assert-eq (if-test 3) 3)
(assert-eq (if-test 4) undefined)

(defn if-else-test (x)
  (if (= x 1) 1
      (= x 2) 2
      x))

(assert-eq (if-else-test 1) 1)
(assert-eq (if-else-test 2) 2)
(assert-eq (if-else-test 3) 3)
(assert-eq (if-else-test "x") "x")


(assert-eq (if* true 1 0) 1)
(assert-eq (if* true 1) 1)
(assert-eq (if* false 7) undefined)
(assert-eq (if* 1 1 0) 1)
(assert-eq (if* 0 1 0) 0)
(assert-eq (if* "" 1 0) 0)
(assert-eq (if* (empty? []) "empty" 'full) "empty")
(assert-eq* [(if* 1 1 0)] [1])
(assert-eq* [(if* (zero? 0) "zero" 0)] ["zero"])
(assert-eq* [(if* (odd? 1) "odd" "even")] ["odd"])
(assert-eq* [(if* (odd? 2) "odd" "even")] ["even"])

(assert-eq (when (> 2 1) 2) 2)
(assert-eq (when-let it (> 2 1) it) true)
(assert-eq (when-let it (< 2 1) it) undefined)

(assert-eq (when-it (* 3 4) it) 12)
(assert-eq (when-it (- 3 3) it) undefined)


(assert-eq (when-fn-it odd? (+ 1 2) it) 3)
(assert-eq (when-fn-it odd? (+ 2 2) it) undefined)
