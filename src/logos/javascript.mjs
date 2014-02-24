(declare Object Function Boolean Error Array Number Math String Date RegExp)

(declare-fn
 typeof (x)
 eval (code)
 parseInt (x radix:?)
 parseFloat (x))

;;; common extensions
(entity JSON
        (fn parse (text))
        (fn stringify (data)))

(entity console
        (fn log (& args)))

(declare console JSON)

(declare-fn
 setTimeout (cb ms)
 clearTimeout (id)
 setInterval (cb ms)
 clearInterval (id))
