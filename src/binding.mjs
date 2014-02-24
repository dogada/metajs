(defn destruct (binding expander)
  (merge (bulk-map binding expander)))

(defn expand-vector-bind (names value expander)
  (map names
       (fn (name i)
         (expander name
                   (if (or (value-literal? value)
                           (undefined? value))
                     value `(nth ~value ~i))))))

(defn expand-set (name value)
  (if (list-literal? name)  (merge (expand-vector-bind (rest name) value expand-set))
      (or (literal? name) (list? name)) [name value]
      (syntax-error (str "Unsupported left part of set: " (pr1 name)) name)))

(defn expand-def (name value)
  (if (list-literal? name)  (merge (expand-vector-bind (rest name) value expand-def))
      (literal? name) [name value]
      (syntax-error (str "Unsupported left part of def: " (pr1 name)) name)))

(defn bind-set (name value)
  (cdata (expr name) " = " (expr value)))

(defn bind-def (name value)
  (add-scope-symbol name)
  (if (undefined? value)
    (cdata (expr name 'def))
    (cdata (expr name) " = " (expr value))))


(defn next-id ()
  (inc metajs.last-id)
  metajs.last-id)

(defn gensym (prefix:"G__")
  "Returns a new symbol with a unique name."
  (new Token (str prefix (next-id))))
