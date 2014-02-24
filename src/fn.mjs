(declare build-signature fn-body)

(defmacro fn (params & body)
  (def args (transform-args params)
    signature (build-signature args)
    full-body)
  ((start-scope signature) .set-vars args)
  (set full-body (fn-body args body))
  (finish-scope)
  (cdata "(function(" signature ") {\n" full-body "})"))

(defmacro defn (fn-name params & code)
  (def args (transform-args params)
    name* (token-value* fn-name)
    prefix (if* (contains? name* ".") 'set 'def)
    ast `(~prefix ~fn-name (fn ~params ~@code))
    raw-statement (raw ast))
  ((get-scope) .set-fn name* args)
  raw-statement)

(defn build-signature (args)
  (def positional (filter args
                          (fn (arg) (!= 'rest arg.presence))))
  (join ", " (map positional (fn (arg) (expr arg.name 'arg)))))

(defn fn-signature (fn-name args)
  (str fn-name "/" args.length))

(defn get-meta-default (meta)
  (when (not (symbol? (last meta)))
    (last meta)))

(defn arg-presence (token)
  (def meta (get-meta))
  (if* (and (not-empty? meta)
            (or (contains? meta "?")
                (defined? (get-meta-default))))
       'optional
       'required))

(defn transform-args (arglist)
  (def args []
    [last value])
  (each (token) arglist
        (set value (token-value* token))
        (when (!= value "&")
          (args.push {type: 'arg
                      name: value
                      token: token
                      presence: (if* (= last "&") 'rest (arg-presence))
                      default-value: (get-meta-default (get-meta))}))
        (set last value))
  (when (or (= last "&") (contains-many? (filter args (fn (arg) (= arg.presence 'rest)))))
    (syntax-error (str "unexpected '&' in signature") (last arglist)))
  args)


(defn fn-vars (args)
  (def rest (first (filter args
                           (fn (arg) (= 'rest arg.presence))))
    positional (- args.length 1))
  (when rest
    `(def ~rest.name (slice* arguments ~positional))))

(defn fn-defaults (args)
  (def with-default (filter args (fn (arg)
                                   (defined? arg.default-value)))
    defaults (merge (map with-default
                         (fn (arg)
                           [arg.name  ["if*" ["undefined?" arg.name] arg.default-value arg.name]]))))
  (when (not-empty? defaults)
    `(set ~@defaults)))

(defn doc-string (x)
  (cdata "/* " (strip-double-quotes (str (expr x))) " */"))

(defn fn-body (args body)
  (def res [])
  (when-fn-it quoted? (first body)
              ;; extract doc string
              (push res (doc-string it) "\n")
              (set body (rest body)))
  (res.push (cdata-stmts (compact (list (fn-vars)
                                        (fn-defaults)
                                        (cons 'do* body)))))
  (apply cdata res))

