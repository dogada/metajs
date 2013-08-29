(defn TestObj (data)
  (set this.data data))

(def obj (new TestObj "xyz"))
(assert-eq obj.data "xyz")

(assert-true (instanceof? obj TestObj))
(assert-false (instanceof? TestObj TestObj))
(assert-false (instanceof? {} TestObj))
(assert-false (instanceof? [] TestObj))
(assert-false (instanceof? 1 TestObj))

