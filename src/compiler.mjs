(use "./logos/javascript")
(use "./logos/metajs")

(defn js-literal (token)
  (token
   .replace /^\-([a-zA-Z])/ "__$1"
   .replace /\*/g "_"
   .replace /\?$/ "__QUERY"
   .replace /!$/  "__BANG"
   .replace /-([\w])/g (fn (match p1) (p1.to-upper-case))))

(defn js-symbol (form)
  (def value (token-value* form))
  (if (literal? value) (js-literal value)
      value))

(defn write-token (token env)
  (def name (token-value* token)
    js-name (if* (string? name) (js-literal name) name))
  (when env.source-map
    (push env.source-map {name: name
                          offset: env.offset
                          source: (token.source-str)}))
  (push env.js js-name))

;;; rebindable in the compiler environment
(def *env*)

(defn make-env (indent:"  " source-map:?)
  {js: [] offset: 0 indent: indent _indent: "" source-map: [] raw-ctx: null})

(defn indent-raw (raw env)
  (when (match? /^[^\"\'\/]*\}/ raw)
    (set env._indent (slice env._indent env.indent.length)))
  (when *env*.new-line
    (push-js env env._indent)
    (set *env*.new-line false))
  (push-js env raw)
  (when (match? /\n$/ raw)
    (set *env*.new-line true))
  (when (match? /^[^\"\'\/]*\{/ raw)
    (set env._indent (+ env._indent env.indent))))

(defn write-raw-string (raw env)
  (if env.indent (indent-raw) (push-js env raw)))

(defn write-raw (raw env)
  (if (string? raw) (write-raw-string)
      (or (number? raw) (boolean? raw)) (push env.js raw)
      (token? raw) (write-token raw)
      (fragment? raw) (map raw.data #(write-raw % env))
      (undefined? raw) 0
      (throw (str "Unknown raw, type: " (typeof raw) ", value: " raw "."))))



(defn push-js (env x)
  (env.js.push x))

(defn compile-raw (raw)
  (let env (make-env)
       (write-raw raw env)
       (join "" env.js)))

(defn eval-expr (form)
  (eval (compile-raw (expr form))))

(defn significant-raw? (raw)
  (if (and (defined? raw)
           (or (not (string? raw)) raw.trim))  true false))

(defn compile (forms)
  (rebind (*env* (make-env))
          (each (form) forms
                (when-fn-it defined? (stmt form)
                            (write-raw it *env*)
                            (write-raw "\n" *env*)))
          (join "" *env*.js)))

(defn compile-one (form)
  (rebind (*env* (make-env))
          (when-fn-it defined? (raw form)
                      (write-raw it *env*))
          (join "" *env*.js)))

(defn translate (text)
  ;; FIX: use *env*.lint-error-count
  (def prev-error-count lint-error-count)
  (do1 (compile (read text))
       (when (> lint-error-count prev-error-count)
         (throw* (new LintError (lint-report) (- lint-error-count prev-error-count))))))


(defn reset-state ()
  "Reset state of the root scope of the compiler and don't touch global scope."
  (reset-lint)
  (reset-scope))


(defmacro include (file)
  "This macro depends on metajs.include that platform (node or browser) should implement."
  (with-meta {virtual: true}
    (cdata (metajs.include (eval-expr file)))))

(defmacro use (file)
  "Include file if it was not included early (or use early included)."
  (with-meta {virtual: true}
    (cdata (metajs.include (eval-expr file) true))))

(export* metajs
         compile translate js-literal js-symbol reset-state)

