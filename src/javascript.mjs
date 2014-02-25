(defmacro defmacro (name params & code)
  (def args (transform-args params)
    raw-js (raw `(fn ~params ~@code))
    js-name (js-symbol name)
    js-str (compile-raw raw-js)
    macro (try (eval js-str)
               (catch e (syntax-error (str "error " e " in parsing macro "
                                           (token-value* name) ":\n" js-str) name))))
  (if metajs.bootstrap-mode `(*call set-scope-macro (quote ~name) null ~raw-js)
      (do
        (set-scope-macro js-name args macro)
        undefined)))

(defn get-fn-signature (verified)
  (def signature (or verified.def (and verified.entity verified.entity.extra)))
  (if (list? signature) signature undefined))

(defmacro *call (fn-name & args)
  "Internal macro. Generate string with function call."
  (def verified (verify-form fn-name fn-name)
    tname (raw verified.form)
    signature (get-fn-signature verified)
    resolved-args (check-call-params fn-name args signature)
    resolved (- resolved-args.length args.length))
  (cdata tname
         "(" (interpose ", " (map resolved-args #(expr %))) ")"
         (if resolved (str " /*logos:" resolved  "*/ ") "")))


(defmacro list (& xs)
  (cdata "[" (interpose ", " (map xs expr)) "]"))

(defmacro def (& binding)
  (with-meta {dont-return: true}
    (cdata "var " (interpose ",\n    " (bulk-map (destruct binding expand-def) bind-def)))))

(defmacro get (obj key)
  (def js-id (and (quote? key) (js-symbol (second key))))
  (if (valid-js-id? js-id)
    (cdata (expr obj) "." (expr js-id 'def))
    `(js "(%)[%]" ~obj ~key)))

(defmacro . (x y & more)
  (if (empty? more) `(get ~x ~y)
      `(. (. ~x  ~y) ~@more)))

(defmacro instanceof? (x type)
  `(js "(% instanceof %)" ~x ~type))

(defmacro safe-prop (obj name)
  `(js "(%).%" ~obj ~name))

(defmacro prop (obj name)
  `(js "%.%" ~obj ~name))

(defmacro nth (seq index)
  `(js "(%)[%]" ~seq ~index))

(defmacro *set (sym value)
  (cdata (expr sym) " = " (expr value)))

(defmacro set (& binding)
  (assert (even? binding.length) "Set require even number of bindings.")
  (cons 'statements (bulk-map (destruct binding expand-set) #(list '*set %1 %2))))

(defmacro set-in (obj & kvs)
  (cons 'statements (bulk-map kvs #(list '*set (list 'get obj %1) %2))))

(defmacro *del (obj)
  (with-meta {dont-return: true}
    (cdata "delete " (expr obj))))

(defmacro del (& xs)
  (cons 'statements (map xs #(list '*del %))))

(defmacro str (& xs)
  (cdata "(" (interpose " + " (map xs expr)) ")"))

(defmacro new (constructor & args)
  `(js "(new %)" (*call ~constructor ~@args)))

(defmacro hash (& pairs)
  (assert (even? pairs.length))
  (def kvs
    (bulk-map pairs (fn (key value)
                      (cdata (expr key 'arg) ": " (expr value)))))
  (if (< kvs.length 2)
    (cdata "{" (interpose ", " kvs) "}")
    (cdata "{\n" (interpose ",\n" kvs) "\n}")))

(defn *if-stmt (forms raw-ctx)
  "Make if/else statement cdata."
  (assert (>= forms.length 2))
  (def mapper (fn (x)
                (if (= raw-ctx 'stmt) x
                    ['maybe-return x]))
    lines (bulk-map forms (fn (x y)
                            (let line [(stmt ['*inline-block (mapper (or y x))])]
                                 (if y (line.unshift "if (" (expr x) ") "))
                                 (apply cdata line)))))
  (interpose " else " lines))


(defmacro if (& xs)
  (def raw-ctx *env*.raw-ctx
    stmts (*if-stmt xs raw-ctx))
  (switch raw-ctx
          '(rtrn stmt) (with-meta {block: true} stmts)
          (cdata "(function() {\n" stmts "\n" "})()")))

(defmacro if* (condition ok fail)
  "Experemental. Temporary ternary form of if. Will be integrated into main if form."
  `(js "(% ? % : %)" ~condition ~ok ~(or fail 'undefined)))

(defmacro while (condition & code)
  (with-meta {block: true}
    (cdata "while (" (expr condition) ") {\n" (cdata-stmts code) "}")))

(defn parse-case* (left right)
  (if (undefined? right) [['*default ['do* left]]]
      (quote? left) (parse-case* (quote* (second left)) right)
      (list-literal? left) (parse-case* (slice left 1) right)
      (list? left) (concat (map (slice left 0 -1) (fn (label) ['*case label]))
                           [['*case (last left) ['do* right]]])
      [['*case left ['do* right]]]))

(defmacro *switch (e & cases)
  "Internal macro. Don't call."
  (with-meta {block: true}
    (cdata "switch (" (expr e) ") {\n" (cdata-map cases expr) "}")))

(defmacro switch (e & cases)
  (asserts e
           (not-empty? cases))
  `(scoped (*switch ~e ~@(merge (bulk-map cases parse-case*)))))


(defmacro *case (x y:?)
  "Internal macro. Don't call."
  (if (defined? y) `(js "case %: %" ~x ~y)
      `(js "case %:\n" ~x)))

(defmacro *default (e)
  "Internal macro. Don't call."
  `(js "default: %" ~e))

(defmacro literal (x)
  (strip-double-quotes x))

(defmacro try (& xs)
  (def finally-form (when (list-name? (last xs) 'finally) (pop xs))
    catch-form (when (list-name? (last xs) 'catch) (pop xs)))
  `(scoped (*try (do ~@xs) ~catch-form ~finally-form)))

(defmacro *try (code catch-form finally-form)
  (when (and (not catch-form) (not finally-form))
    (syntax-error "At least catch or finally must be provided." code))
  (def params ["try {\n" (rtrn code) "}"])
  (when catch-form
    (start-scope "catch")
    (add-scope-symbol (second catch-form))
    (params.push " catch (" (expr (second catch-form)) ") {\n" (rtrn `(do ~@(slice catch-form 2))) "}")
    (finish-scope))
  (when finally-form
    (params.push " finally {\n" (stmt `(do ~@(slice finally-form 1))) "}"))
  (with-meta {block: true}
    (apply cdata params)))

(defmacro inc (num)
  `(js "((%)++)" ~num))

(defmacro dec (num)
  `(js "((%)--)" ~num))

(defmacro throw* (x)
  (with-meta {dont-return: true}
    (cdata "throw " (expr x))))

(defmacro throw (cls:? message:?)
  (if (defined? message)
    `(throw* (new ~cls ~message))
    `(throw* (new Error ~cls))))

(defmacro bool (x)
  `(js "(!!%)" ~x))

(defmacro statements (& code)
  (with-meta {virtual: true}
    (cdata-map code stmt)))

(defn insert-maybe-return (body)
  (when (not-empty? body)
    (let end (- body.length 1)
         (set-in body end ['maybe-return (nth body end)]))))

(defmacro do (& body)
  "Eval body and return result of last expession if parent form expects it."
  (if (= *env*.raw-ctx 'rtrn)
    (insert-maybe-return body))
  (with-meta {virtual: true} (cdata-stmts body)))

(defmacro do* (& body)
  "Internal macro. Always add maybe-return. Should be used in root scopes like fn."
  (insert-maybe-return body)
  (with-meta {virtual: true}
    (cdata-stmts body)))

(defmacro *block (& forms)
  "One or more statements in curly brackets."
  (let stmts (cdata-stmts forms)
       (with-meta {block: true}
         (cdata "{\n" stmts "}"))))

(defmacro *inline-block (& forms)
  "Block of code that don't force new line (like in if/else)."
  (with-meta {inline-block: true}
    (cdata "{\n" (cdata-stmts forms) "}")))

(defmacro maybe-return (x)
  "Return x if x can be translated to javascript expression. Never return statements (throw, def, while, etc)."
  (rtrn x))

(defmacro comment (& contents)
  (def str (prn-str contents))
  (with-meta {dont-return: true block: true}
    (cdata "/* " str " */")))

(defn -macro (& args)
  "Apply macro and return fragment."
  (expr args))

(defmacro -return (x)
  "Don't use it. Emit unconditional javascript return statement. Makes it easy to shoot yourself in the foot."
  (with-meta {dont-return: true}
    (cdata "return " (expr x))))

