(defn find-fn-signature (name)
  (def signature (find-def name))
  (if (list? signature) signature undefined))


(defn check-call (name args)
  (def name* (token-value* name)
    expected (find-fn-signature name*))
  (def checked (if (= name* 'defmacro)
                 args
                 (check-call-params name args expected)))
  checked)

(defn call-str (name args)
  (str name "("
       (join " " (map args (fn (arg)
                             (if (has-meta? arg) (str arg.value ":" arg.meta)
                                 (and arg arg.value) arg.value
                                 (list? arg) "[...]"
                                 arg))))
       ")"))

(defn parse-params (token name params expected)
  (def allow-hints (and (!= name 'defmacro) (!= name 'js)))
  (def positional [] hints [] rest [])
  (each (param i) params
        (if (and allow-hints (has-meta? param))
          (hints.push param)
          (if (empty? hints)
            (positional.push param)
            (rest.push param))))
  (when (and (undefined? expected) (not-empty? hints)
             allow-hints)
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
               (def val (resolve-arg arg))
               (if val (resolved.push val)
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
                  (resolved.push (positional.shift))))
              (resolve-blank arg)))))
  (when (not-empty? hints)
    (syntax-error (str "Unsupported hints: " (call-str name hints)) fn-token))
  (set rest (concat positional rest)
       resolved (concat resolved rest))
  (when (and (not allowed-rest) (not-empty? rest))
    (lint-undeclared-rest (str "Found " rest.length " undeclared rest params in " (call-str name rest)) fn-token))
  resolved)

(defn resolve-arg (arg)
  (if (find-closure-def arg.name) arg.name))


(defn check-name (name)
  (when (and (not-contains? name ".") (not (find-def name)))
    (comment warn "Unknown name" name)))
