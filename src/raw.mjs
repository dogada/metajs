(defn Fragment (data meta:?)
  (set this.data data
       this.meta meta))

(defn Fragment.prototype.unshift (x)
  (this.data.unshift x)
  this)

(defn fragment? (obj)
  (instanceof? obj Fragment))

(defn with-meta (meta obj)
  "Add meta to the object."
  (set obj.meta meta)
  obj)

(defn cdata (& args)
  (new Fragment (map args cdata-arg)))

(defn cdata-arg (arg)
  (if (list? arg) (throw (str "Lists as cdata arg"))
      arg))

(defn interpose (sep values)
  (apply cdata (slice (merge (map values
                                  (fn (v) [v sep]))) 0 -1)))

(defn cdata-map (xs func)
  (apply cdata (map xs func)))

(defn cdata-stmts (forms)
  (cdata-map forms stmt))

(defmacro js (template & args)
  (def stripped (strip-double-quotes template)
    parts (stripped.split "%")
    holes (- parts.length 1)
    res [])
  (when (!= holes args.length)
    (throw (str "js template error: '" (escape-js stripped)
                "', passed " args.length ", but required " holes " arguments.")))
  (each (p i) parts
        (push res p)
        ;; FIX rebind context
        (when (< i holes)
          (let arg (nth args i) carg (raw arg)
               (push res carg))))
  (apply cdata res))


(defn hook? (x)
  (def value (token-value* x))
  (and (string? value) (value.match /^[\.@].+/)))

(defn method-hook? (x)
  (x.match /^\..+/))

(defn process-hook (name res)
  "Read next form and add to previous form as property or method call. Enable catch-mode if token is method."
  (def is-method (= (first name) ".")
    real-name (name.slice 1)
    prop (if* (number-str? real-name) (parseInt real-name 10) real-name))
  (when (contains-many? res)
    ;; treat current list content as a function and prepare it to use as
    ;; parent for next property
    (set res (list res)))
  ;; append current form as property to previous form
  (set (last res) (list 'get (last res) (list 'quote prop)))
  (when is-method
    ;; make a call from last form
    (set res (list res)))
  res)

(defn -process-hook-params (name res xs i)
  (def max-i (- xs.length 1))
  (if (method-hook? name)
    (until (or (hook? (nth xs (+ i 1)))
               (>= i max-i))
           (inc i)
           ;; append param for hooked method
           (push (last res) (nth xs i)))
    (when (< i max-i)
      ;; ensure we don't have normal forms after hooked property
      (if-not (hook? (nth xs (+ i 1)))
        (syntax-error (str "Unsupported tail after " name) name))))
  i)

(defn process-hooks (xs)
  (def i 0 hooked 0 res [] [token value])
  (when (and (not-empty? xs) (hook? (first xs)))
    ;; transform (.prop obj) into (obj .prop)
    (assert (contains-many? xs) "Hook without target.")
    (assert (not (hook? (second xs))) "After hook at first position must be normal form.")
    (set xs (cons (second xs) (first xs) (slice xs 2))))
  (while (< i xs.length)
    (set token (nth xs i)
         value (token-value* token))
    (if-not (hook? value) (res.push token)
            (do
              (inc hooked)
              (set res (process-hook value res))
              (set i (-process-hook-params value res xs i))))
    (inc i))
  (if* hooked (last res) res))

(defn raw-list (forms)
  (def name (first forms)
    js-name (js-symbol name)
    macro (find-macro js-name))
  ;; (check-call name (forms.slice 1))
  (if (undefined? name) 'null
      macro (apply macro (forms.slice 1))
      (apply (find-macro '*call) forms)))

(defn raw-list-deep (token)
  (def ls token)
  (while (list? ls)
    (set ls (raw-list (process-hooks ls))))
  ls)

(defn raw-comment (string)
  (string.replace (regex "^;+") "//"))

(defn raw-quoted-string (string)
  (string .split "\n" .join "\\n\" +\n\""))

(defn raw-literal (token role)
  (if (= role 'def) token
      (js-literal (token-value* token))))

(defn raw-string (string role token)
  (if (literal? string) (raw-literal (or token string) role)
      (quoted? string) (raw-quoted-string)
      (comment? string) (raw-comment)
      string))

(defn raw (item role:?)
  (def value (token-value* item))
  (if (undefined? value) value
      (fragment? value) value
      (list? value) (raw-list-deep value)
      (string? value) (raw-string value role item)
      (number? value) value
      (throw (str "Unknown token: " (inspect item)
                  "\ntype: " (typeof item) "  token?: " (token? item)
                  "\nvalue: " (inspect value)))))

(defn set-raw-ctx (x)
  (set *env*.raw-ctx x))

(defn expr (form role:?)
  (set-raw-ctx 'expr)
  (raw form))

(defn stmt (form)
  (set-raw-ctx 'stmt)
  (def frag (raw form)
    end (if (undefined? frag) null
            (list-literal? form) null
            (hash? form) null
            (quoted? form) null
            (not frag.meta) ";\n"
            frag.meta.block "\n"
            frag.meta.inline-block null
            frag.meta.virtual null
            ";\n"))
  (when end
    ;; we may have raw string here
    (when-not (fragment? frag)
      (set frag (cdata frag)))
    (frag.data.push end))
  frag)

(defn rtrn (form)
  (set-raw-ctx 'rtrn)
  (def frag (raw form) meta (and frag frag.meta))
  (if (undefined? frag) frag
      (and meta (or meta.block meta.virtual meta.dont-return)) frag
      (fragment? frag) (frag.unshift "return ")
      (cdata "return " frag)))

(defn last-stmt (form)
  (set-raw-ctx 'last-stmt)
  (raw form))


(set-in metajs 'raw raw)
