(def ls [1 2 3 4 5]
  [set1 set2])
(assert-eq set1 undefined)
(assert-eq set2 undefined)

(set [set1 set2] ls)
(assert-eq set1 1)
(assert-eq set2 2)

;; (assert-js "(set z)" "Error: Set require even number of bindings.")
;; (assert-js "(set [y x])" "Error: Set require even number of bindings.")

(let xs [0 0] data {}
     (set (nth xs 0) 1
           (get xs 1) 2
           (get data 'key) 'value)
     (assert-eq* xs [1 2])
     (assert-eq data.key 'value))

(def test-indent 2
  test-flag true)

(scoped
 (assert-eq test-indent 2)
 (assert-true test-flag)
 (rebind (test-indent (+ 2 test-indent) test-flag false)
         (assert-eq test-indent 4)
         (assert-false test-flag))
 (assert-eq test-indent 2)
 (assert-true test-flag))


(let k1 1 k2 "v2" obj {}
     (export* obj k1 k2)
     (assert (= obj.k1 1))
     (assert (= obj.k2 "v2")))
