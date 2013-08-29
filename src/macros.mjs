(include "./operations")

(defmacro export* (obj & values)
  (let tmp (gensym)
       (list 'let tmp obj
             (cons 'set-in tmp (merge (map values #(list ['quote %] %)))))))

(defmacro apply (func arglist)
  `(~func .apply this ~arglist))

(defmacro regex (string glim:?)
  `(new RegExp ~string ~(or glim 'undefined)))

(defmacro if-not (x & code)
  `(if (not ~x) ~@code))

(defmacro if-empty (x & code)
  `(if (empty? ~x) ~@code))

(defmacro if-not-empty (x & code)
  `(if-not (empty? ~x) ~@code))

(defmacro if-defined (x & code)
  `(if (defined? ~x) ~@code))

(defmacro when (x & code)
  `(if ~x (do ~@code)))

(defmacro when-let (x value & code)
  `(let (~x ~value) (when ~x ~@code)))

(defmacro when-fn-let (func x value & code)
  `(let (~x ~value) (when (~func ~x) ~@code)))

(defmacro when-it (value & code)
  `(let (it ~value) (when it ~@code)))

(defmacro when-fn-it (func value & code)
  `(let (it ~value) (when (~func it) ~@code)))

(defmacro when-not (x & code)
  `(when (not ~x) ~@code))

(defmacro when-empty (x & code)
  `(when (empty? ~x) ~@code))

(defmacro when-not-empty (x & code)
  `(when-not (empty? ~x) ~@code))

(defmacro when-defined (x & code)
  `(when (defined? ~x) ~@code))


(defmacro each (signature xs & code)
  `(~xs .forEach (fn ~signature ~@code)))

(defmacro each-key (as obj & body)
  `(each (~as) (keys ~obj) ~@body))

(defmacro match? (regexp string)
  `(~string .match ~regexp))

(defmacro -> (x form:? & more)
  "Insert each form into second position of next form (wrap it in list if it's not a list already)."
  (if
      (undefined? form) x
      (empty? more) (if (list? form)
                      `(~(first form) ~x ~@(rest form))
                      (list form x))
      `(-> (-> ~x ~form) ~@more)))

(defmacro rebind (bindings & code)
  "Rebind existing symbols to new values, execute code and then restore original binding."
  (def names (filter bindings #(even? %2))
    remember [] restore [])
  (each (name) names
        (def sym (gensym))
        (remember.push sym name)
        (restore.push name sym))
  `(scoped
    (def ~@remember)
    (try
      (set ~@bindings)
      ~@code
      (finally (set ~@restore)))))

(defmacro let (& xs)
  "Create lexical context. Each binding can see the prior bindings and use destruction."
  (let (binding [] code xs)
    (until (or (list-not-literal? (first code)) (< code.length 2))
           (push binding (first code) (second code))
           (set code (slice code 2)))
    (when (and (empty? binding) (list-not-literal? (first code)))
      (set binding (first code)
           code (rest code)))
    (asserts (not-empty? binding)
             (not-empty? code))
    `(scoped (def ~@binding) ~@code)))

(defmacro let* (bindings & code)
  "Create simple lexical context for bindings. Bindings don't see previous bindings. Destruction isn't supported."
  (assert (even? bindings.length))
  (def names (filter bindings #(even? %2))
    values (filter bindings #(odd? %2)))
  `((fn ~names ~@code) ~@values))

(defmacro scoped (& body)
  `((fn () ~@body)))

(defmacro let-while (name value condition & code)
  `(let (~name ~value)
     (while ~condition
       ~@code
       (set ~name ~value))))

(defmacro do1 (& xs)
  (let* (tmp (gensym))
        `(let (~tmp ~(first xs))
           ~@(rest xs)
           ~tmp)))

(defmacro until (condition & code)
  `(while (not ~condition) ~@code))

(defmacro keys (obj)
  `(*call Object.keys ~obj))

(defmacro arguments ()
  (cdata "(Array.prototype.slice.apply(arguments))"))


