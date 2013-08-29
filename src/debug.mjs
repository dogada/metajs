(defmacro log (& body)
  `(console.log ~@body))

(defmacro warn (& body)
  `(console.warn ~@body))

(defmacro log1 (& xs)
  (let* (tmp (gensym) target (first xs))
        `(let (~tmp ~target)
           (log ~(prn-str* target) " -> " ~tmp)
           ~@(rest xs)
           ~tmp)))

(defmacro log-call-stack ()
  `(log (get (new Error) 'stack)))


