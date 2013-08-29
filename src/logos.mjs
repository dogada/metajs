(defn find-fn-signature (name)
  (def signature (find-def name))
  (if (list? signature) signature undefined))


(defn check-call (name args)
  (def name* (token-value* name)
    expected (find-fn-signature name*))
  (def checked (if (= name* 'defmacro)
                 args
                 (check-call-params name* args expected)))
  checked)

(defn call-str (name args)
  (str name "("
       (join " " (map args (fn (arg)
                             (if (has-meta? arg)
                               (str arg.value ":" arg.meta)
                               (if (list? arg) "[...]" arg)))))
       ")"))

(defn log-unresolved (arg fn-name hints)
  (def message (str "Can't resolve " arg.presence " " arg.name " for " fn-name))
  (if (not-empty? hints)
    (error message)
    (warn message)))

(defn parse-params (name params expected)
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
    (error (str "Hints in unknown function call: " (call-str name hints))))
  (when (!= hints.length (length (keys (hash-map hints (fn (p) [p.value 1])))))
    (error (str "Duplicated hints in the call: " (call-str name hints))))
  [positional hints rest])

(defn check-call-params (name params expected)
  (def parsed (parse-params)
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
                   metajs.log-unresolved (log-unresolved arg fn-name hints)))
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
              (error (str "Non-keyword '" arg-name
                          "' passed twice: positionaly and via hint.")))
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
    (error (str "Unsupported hints: " (call-str name hints))))
  (set rest (concat positional rest)
       resolved (concat resolved rest))
  (when (and (not allowed-rest) (not-empty? rest))
    (warn (str "Found " rest.length " undeclared rest params in " (call-str name rest))))
  resolved)

(defn resolve-arg (arg)
  (if (find-closure-def arg.name) arg.name))


(defn check-name (name)
  (when (and (not-contains? name ".") (not (find-def name)))
    (comment warn "Unknown name" name)))
