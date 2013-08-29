(defn empty-fn ())
(assert-eq (empty-fn) undefined)

(defn required-arg-fn (a)
  a)
(assert-eq (required-arg-fn) undefined)
(assert-eq (required-arg-fn 1) 1)

(defn required-args-fn (a b)
  [a b])
(assert-eq* (required-args-fn 1 2) [1 2])
(assert-eq* (required-args-fn 3) [3 undefined])

(defn required-optional-args-fn (a b c)
  [a b c])
(assert-eq* (required-optional-args-fn 4 "five" 6) [4 "five" 6])
(assert-eq* (required-optional-args-fn true false) [true false undefined])

(defn required-optional-args-fn2 (a b c d)
  [a b c d])
(assert-eq* [4 "five" 7 undefined] (required-optional-args-fn2 4 "five" 7))
(assert-eq* [true false null undefined] (required-optional-args-fn2 true false null))
(assert-eq* [8 "nine" undefined undefined] (required-optional-args-fn2 8 'nine))

(defn full-fn (a b c:? d:? & more)
  [a b c d more])

(assert-eq* (full-fn 1) [1 undefined undefined undefined []])
(assert-eq* (full-fn a:2) [2 undefined undefined undefined []])
(assert-eq* (full-fn b:17) [undefined 17 undefined undefined []])
(assert-eq* (full-fn 7 b:8) [7 8 undefined undefined []])
(assert-eq* (full-fn a:7 b:8) [7 8 undefined undefined []] )
(assert-eq* (full-fn b:8 a:7) [7 8 undefined undefined []])
(assert-eq* (full-fn 7 8 c:9) [7 8 9 undefined []])
(assert-eq* (full-fn 7 8 d:10) [7 8 undefined 10 []])
(assert-eq* (full-fn 7 8 9 d:10) [7 8 9 10 []])
(assert-eq* (full-fn 7 8 9 d:10 11) [7 8 9 10 [11]])
(assert-eq* (full-fn 7 8 d:10 c:9 11) [7 8 9 10 [11]])
(assert-eq* (full-fn 7 b:8 d:10 c:9 11 12) [7 8 9 10 [11 12]])
(assert-eq* (full-fn a:7 b:8 d: (* 2 5) c:9 11 12 13) [7 8 9 10 [11 12 13]] )
(assert-eq* (full-fn 7 b: 8 11 (* 4 3)) [7 8 undefined undefined [11 12]])
(assert-eq* (full-fn 7 b: (+ 3 5) d: "last" "rest") [7 8 undefined "last" ["rest"]])

(assert-eq* (full-fn 1 2) [1 2 undefined undefined []])
(assert-eq* (full-fn 1 2 3) [1 2 3 undefined []])
(assert-eq* (full-fn 1 2 3 4) [1 2 3 4 []])
(assert-eq* (full-fn 1 2 3 4 5) [1 2 3 4 [5]])
(assert-eq* (full-fn 1 2 3 4 5 6) [1 2 3 4 [5 6]])


(assert-js "(undefined-fn x:7)"
           "Error: Hints in unknown function call: undefined-fn(x:7)")

(assert-js "(defn test1 (x &))"
           "Error: unexpected \'&\' in signature")

(assert-js "(defn test2 (x & y & z))"
           "Error: unexpected \'&\' in signature")

(assert-eq* ((fn (x y:3 opt-z: 4 & more)
               "Doc string."
               [x y opt-z more]) 1) [1 3 4 []])

(defn test-defn1 (a b:? c:4 & more)
  [a b c more])

(assert-eq* (test-defn1 7) [7 undefined 4 []])

(assert-eq* (#(list % %2 %3) 1 2 3) [1 2 3])
(assert-eq* (#(list %1 %2 %3) 1 2 3) [1 2 3])
(assert-eq* (#(list % % %) 1 2) [1 1 1])
(assert-eq* (#(list % % %1) 1 2) [1 1 1])
(assert-eq* (#(list %1 % %1) 1 2) [1 1 1])
(assert-eq* (#(list %1 %3) 1 2 3) [1 3])



