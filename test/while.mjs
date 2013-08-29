(let (ls [])
     (let-while x ls.length (< x 3)
                (ls.push x))
     (assert-eq* ls [0 1 2]))
