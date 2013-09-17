;;; <unknown>:1:0 E0: Missed opening bracket.
(assert-js* ")" "Error: ")
;;; <unknown>:1:0 E0: Missed closing bracket: ).
(assert-js* "(" "Error: ")
(try-assert (metajs.translate "(= () null)") "(null === null);\n\n")
(try-assert (metajs.translate "()") "null;\n\n")
(try-assert (metajs.translate "(str ())") "(null);\n\n")



