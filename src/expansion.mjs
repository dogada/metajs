(defmacro syntax-quote (form)
  (if (list? form)
    (switch (token-value* (first form))
            "unquote" (js-quote (second form))
            "unquote-splicing" ['list "\"unquote-splicing\"" (js-quote (second form))]
            (cons 'metajs.merge-sq [(cons 'list (map form (find-macro 'syntax-quote)))]))
    (quote* form)))

(defn wrap-in-double-quotes (x)
  (str "\"" x "\""))

(defn strip-double-quotes (x)
  (if (quoted? x) (x.slice 1 -1) x))

(defn escape-js (x)
  (x
   .replace /[\\\"']/g "\\$&"
   .replace /\u0000/g, "\\0"))

(defn escape-js-quotes (x)
  (x
   .replace /\\\"/g "\\\\\""
   .replace /\"/g "\\\""))

(defn js-quote (form)
  (def value (token-value* form))
  (if (list? value)
    (map value js-quote)
    (if (quoted? value)
      (wrap-in-double-quotes (escape-js-quotes value))
      value)))

(defmacro quote (x)
  (quote* x))

(defn quote* (x)
  (def value (token-value* x))
  (if (list? value) (cons 'list (map value quote*))
      (number? value)  value
      (quoted? value) (wrap-in-double-quotes (escape-js-quotes value))
      (wrap-in-double-quotes (js-literal value))))

(defn quote? (x)
  (and (list? x) (= (first x) 'quote)))

(defn metajs.merge-sq (ls)
  (def merged [])
  (each (form) ls
        (if (and (list? form) (= (first form) "unquote-splicing"))
          (set merged (merged.concat (second form)))
          (merged.push form)))
  merged)

(defmacro macrojs (name)
  "Return macro's function javascript code as string."
  (when-it (find-macro (raw name))
           (it.toString)))

(export* metajs
         strip-double-quotes)
