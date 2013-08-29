(assert-eq (-> [1 2 3 4 5]
               (rest)
               (slice -2)
               first
               (* 3)) 12)


