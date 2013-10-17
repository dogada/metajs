(scoped
 (def x 1)
 (assert-true (defined? x))
 (assert-eq x 1)

 (def y 2 z)
 (assert-eq y 2)
 (assert-false (defined? z))
 (assert-eq z undefined)

;;; Unsupported left part of def: (get obj (quote k))
 (assert-js* "(def (get obj 'k) 1)" "Error: ")

 (def a 2
   b (+ a 1)
   c (* a b))
 (assert-eq* [a b c] [2 3 6])

;;; deep destruction
 (def ls [1 2]
   [ls0 ls1] ls
   free)

 (assert-eq* [ls0 ls1] ls)
 (assert-eq free undefined)

 (def ls1 [1 2 ["child" 3 (+ 3 1)]]
   [ls1-0 ls1-1 ls1-2] ls1
   [free1 free2])

 (assert-eq* [ls1-0 ls1-1 ls1-2] ls1)
 (assert-eq* [free1 free2] [undefined undefined])

 (assert-js "(def x)" "var x;")
 (assert-js "(def x undefined)" "var x = undefined;")
 (assert-js "(def x 1 y)" "var x = 1,\n    y;")
 (assert-js "(def [x y] 1)" "var x = 1,\n    y = 1;")
 (assert-js "(def [x y])" "var x,\n    y;")
 (assert-js "(def [x y] true)" "var x = true,\n    y = true;")
 (assert-js "(def [x y] \"\")" "var x = \"\",\n    y = \"\";")

 (def
   ls2 [1 2 [3 4]]
   [a b c] ls2
   [c0 c1] c
   z)

 (assert-eq* [a b [c0 c1]] ls2)
 (assert-eq z undefined))
