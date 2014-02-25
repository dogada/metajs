(declare Object Function Boolean Error Array Number Math String Date RegExp)
(declare Infinity NaN undefined)
(declare arguments)

(declare-fn
 typeof (x)
 eval (code)
 parseInt (x radix:?)
 parseFloat (x)
 decodeURI (x)
 decodeURIComponent (x)
 encodeURI (x)
 encodeURIComponent (x)
 isFinite (number)
 isNaN (number))

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
