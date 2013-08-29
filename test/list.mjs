(assert-eq () null)
(assert-not ())
(assert (list))
(assert-eq* (list) [])

(let ls []
  (assert (empty? ls))
  (assert-eq (length ls) 0)
  (push ls 1)
  (assert-eq* ls [1])
  (push ls 2 3)
  (assert-eq* ls [1 2 3])
  (assert-eq (pop ls) 3)
  (assert-eq* ls [1 2])
  (push ls [3 4])
  (assert-eq* ls [1 2 [3 4]])
  (assert-eq* (slice ls 1) [2 [3 4]])
  (assert-eq* (slice ls 1 -1) [2])
  (assert-eq* (slice ls -1) [[3 4]])
  (assert-eq* (slice ls 0) [1 2 [3 4]])
  (assert-eq* (slice ls) [1 2 [3 4]])
  (assert-eq* (frest ls) [1 [2 [3 4]]])
  (assert-eq* (let ([head tail] (frest ls))
                [(+ 7 head) (first tail)]) [8 2])
  (assert-eq (length ls) 3)
  (assert-eq (nth ls 0) 1)
  (assert-eq* (nth ls 2) [3 4])
  (assert-eq (length (nth ls 2)) 2)
  (assert (not-empty? ls)))

(assert-eq* (list 1 2 3 4) [1 2 3 4])
(assert-eq* (cons 1 [2 3 4]) [1 2 3 4])
(assert-eq* (cons 1 2 [3 4]) [1 2 3 4])
(assert-eq* (conj [1] 2 3 4) [1 2 3 4])



(let ids '(a b) values [1 2] nums [7 8]
     (assert-eq* (metajs.map values #(* % 2)) [2 4])
     (assert-eq* (metajs.zip ids values) [['a 1] ['b 2]])
     (assert-eq* (metajs.zip ids values nums) [['a 1 7] ['b 2 8]])
     (assert-eq* (metajs.zip* ids values) ['a 1 'b 2])
     (assert-eq* (metajs.zip* ids values nums) ['a 1 7 'b 2 8]))


