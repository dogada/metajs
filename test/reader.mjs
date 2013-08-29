(try-assert (metajs.translate ")") "Error: Missed opening bracket.\nStopped at: )\n<unknown>:1:0")
(try-assert (metajs.translate "(") "Error: Missed closing bracket: ).\nStopped at: (\n<unknown>:1:0")
(try-assert (metajs.translate "(= () null)") "(null === null);\n\n")
(try-assert (metajs.translate "()") "null;\n\n")
(try-assert (metajs.translate "(str ())") "(null);\n\n")



