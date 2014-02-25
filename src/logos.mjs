(declare resolve-arg verify-form)

(defn call-str (name args)
  (str name "("
       (join " " (map args (fn (arg)
                             (if (has-meta? arg) (str arg.value ":" arg.meta)
                                 (and arg arg.value) arg.value
                                 (list? arg) "[...]"
                                 arg))))
       ")"))

(defn parse-params (token name params expected)
  (def positional [] hints [] rest [])
  (each (param i) params
        (if (has-meta? param)
          (hints.push param)
          (if (empty? hints)
            (positional.push param)
            (rest.push param))))
  (when (and (undefined? expected) (not-empty? hints))
    (lint-unknown-hints (str "Hints in unknown function call: " (call-str name hints)) token))
  (when (!= hints.length (length (keys (hash-map hints (fn (p) [p.value 1])))))
    (lint-duplicated-hints (str "Duplicated hints in the call: " (call-str name hints)) token))
  [positional hints rest])

(defn check-call-params (fn-token params expected)
  (def name (token-value* fn-token)
    parsed (parse-params fn-token)
    [positional hints rest] parsed
    positional-count (length positional)
    expected-args (or expected [])
    keyword-count (length (filter expected-args (fn (arg) (= arg.presence 'keyword))))
    without-rest (filter expected-args (fn (arg) (!= arg.presence 'rest)))
    allowed-rest (or (undefined? expected)
                     (!= expected-args.length without-rest.length))
    resolved [])

  ;; FIX
  (defn pop-hint (name)
    (def hint)
    (each (h i) hints
          (when (= h.value name)
            (set hint (nth h.meta 0))
            (hints.splice i 1)))
    hint)

  ;; resolve arg without positional or hint value
  (defn resolve-blank (arg)
    (switch  arg.presence
             'required
             (do
               ;; find missed but required arg from surrounding context or report error
               (def val (resolve-arg arg fn-token))
               (if val (resolved.push val.form)
                   (lint-missed-required-arg (str arg.name " is required for " name) fn-token)))
             'optional
             (when (or keyword-count (not-empty? hints) (not-empty? rest))
               ;; we have a hint for next argument or keyword argument, so for current optional arg use undefined
               (resolved.push 'undefined))

             'keyword
             (do (when arg.meta
                   ;; for keyword argument without provided hint always use default
                   (resolved.push (last arg.meta))))))

  ;; iterate over all function arguments and resolve them 
  (each (arg index) without-rest
        (def arg-name arg.name
          hint (pop-hint arg-name))
        (if (defined? hint)
          (do
            (when (and (< index positional-count)
                       (!= arg.presence 'keyword))
              (syntax-error (str arg-name
                                 " passed twice: positionally and as keyword.") fn-token))
            (comment log "---------- Using hint at" index arg-name ":" hint)
            (resolved.push hint))
          (do
            (if (not-empty? positional)
              (do
                ;; keyword argumets always ignore params passed positionally
                (if (= arg.presence 'keyword)
                  (resolved.push (last arg.meta))
                  (resolved.push (verify-form (positional.shift) fn-token @form))))
              (resolve-blank arg)))))
  (when (not-empty? hints)
    (syntax-error (str "Unsupported hints: " (call-str name hints)) fn-token))
  (set rest (concat positional rest)
       resolved (concat resolved rest))
  (when (and (not allowed-rest) (not-empty? rest))
    (lint-undeclared-rest (str "Found " rest.length " undeclared rest params in "
                               (call-str name rest)) fn-token))
  resolved)

(defn entity-resolve (form)
  "Use entities associated with arg to find substitution for missed argument."
  (def entities (find-entities form)
    bound (filter (map entities (fn (e) {entity: e symbols: (find-symbols [e.name])}))
                  (fn (es) (not-empty? es.symbols))))
  (merge (map bound (fn (es)
                      (map es.symbols #(hash 'form (es.entity.code (. % 'name)
                                                                  ['quote es.entity.token])
                                             entity es.entity))))))

(defn symbol-resolve (form)
  "Find in the current lexical scope symbols with arg's name or meta type."
  (map (find-symbols (get-token-entities form)) #(hash form (get % 'name))))

(defn report-resolve-error (form parent forms fatal)
  "Show all possible candidates for resolving the missed argument of a function."
  (def resolvers ((map forms compile-one) .join ", "))
  (dump-scope-logos)
  (lint-multi-resolve #"Too many candidates for $form in $parent: $resolvers." parent)
  null)

(defn resolve-form (form parent fatal:true)
  "Replace missed argument of a function with a form or report an error."
  (def forms (concat (symbol-resolve) (entity-resolve)))
  (if (contains-one? forms) (first forms)
      (contains-many? forms) (report-resolve-error)))

(defn resolve-arg (arg fn-token fatal:true)
  (resolve-form arg.token fn-token))

(defmacro entity (name & rels)
  "Define entity in the current lexical scope."
  (def doc "")
  (when (quoted? (first rels))
    (set [doc rels] (frest rels)))
  ((get-scope) .set-entity name rels doc)
  undefined)

(defmacro declare-fn (& pairs)
  "Declare an function on the current scope."
  (defn declare-one (sym args)
    ((get-scope) .set-fn sym (transform-args args)))
  (bulk-map pairs (fn (target args)
                    (if (list? target) (each (sym) (rest target) (declare-one))
                        (declare-one target))))
  undefined)

(defmacro declare (& symbols)
  "Declare some symbols in the current scope."
  (each (sym) symbols
        (add-scope-symbol sym))
  undefined)


(defn verify-name (name parent)
  "Verify that name is defined or resolve it or print warning."
  (def parts (name .valueOf .split ".")
    head (first parts)
    tail (rest parts)
    adef (find-def head)
    main (if (= head "this") {form: name}
             adef {form: name def: adef}
             (resolve-form head parent fatal:false)))
  (when-not main
    (lint-undefined #"Undefined $name." name))
  ;; TODO: check tail validness
  (if (and main tail.length main.entity)
    (set main.form (concat ["." main.form] (map tail #(list 'quote %)))))
  (or main {form: name}))


(defn verify-form (form parent:?)
  (if (symbol? form) (verify-name form)
      {form: form})) 


