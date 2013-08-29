(assert (object? {}))
(assert-not (object? null))
(assert-not (object? []))
(assert-not (object? ""))
(assert-not (object? 1))
(assert-not (object? NaN))
(assert-not (object? Infinity))
(assert-not (object? undefined))

(assert (list? [1 2]))
(assert-not (list? null))
(assert-not (list? {}))
(assert-not (list? ""))

(asserts
 (boolean? true)
 (boolean? false)
 (not (boolean? 1))
 (not (boolean? "true"))
 (not (boolean? null)))


