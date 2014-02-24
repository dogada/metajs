(scoped 
 (declare window)
 (declare location Math browser)
 (declare-fn
  my-sum (x y)
  other ())
 (defn test-sum (x y)
      (my-sum))
 (defn my-sum (x y)
   (+ x y))
 (assert-eq (test-sum 1 2) 3))
