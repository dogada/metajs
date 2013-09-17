;;; Read string or input stream and return list of tokens.
;;; Token is the form itself and meta-information about source (filename, line,
;;; column) used for error reporting and building source maps.

; regular expressions for supported forms
(def tokens {regex              /\/(\\\/|[^\/\n])+\/[glim]*/
             comment            /\;.*/
             string             /\"(([^\"]|(\\\"))*[^\\])?\"/
             number             /-?[0-9][0-9.,]*/
             special            /['`~#]?/
             literal            /[@\-]?[\$\*\.\w][\*\.\w-]*(\?|!)?/
             operand            /[\?><=!\+\/\*\-]+/
             at-index           /@\d+/
             fn-arg             /%[1-9]?/
             colon              /:/
             ampersand          /&/
             close-paren        /\)/
             alternative-parens /\{|\[|\}|\]/})

(set tokens.special-literal (regex (str tokens.special.source tokens.literal.source))
     tokens.special-open-paren (regex (str tokens.special.source "@?" "\\(")))

(defmacro *literal-regexp ()
  "Raw string without javascript escaping."
  (str "/^" tokens.literal.source "$/"))

(def -token-order '(regex comment string number special-literal operand
                          at-index fn-arg colon ampersand
                          special-open-paren close-paren alternative-parens)
  -parser-re (join "|" (map -token-order #(str "(" ((get tokens %) @source) ")")))
  js-id-re /^[a-zA-Z_]\w*$/
  literal-re (*literal-regexp)
  operand-re (regex (str "^" tokens.operand.source "$"))
  constants '(true false null undefined)
  *reader-fn-args*)

(defn token? (item)
  (and (defined? item) (defined? item.value)))

(defn token-value (token)
  (get token 'value))

(defn token-value* (item)
  (if (token? item) (token-value item) item))

(defn valid-js-id? (token)
  (when-fn-it string? (token-value* token)
              (js-id-re.test it)))

(defn literal? (item)
  (def value (token-value* item))
  (bool
   (and (string? value) (value.match literal-re))))


(defn symbol? (token)
  (def value (token-value* token))
  (or
   (and (literal? value) (not-contains? constants value))
   (and (string? value) (value.match operand-re))))

(defn value-literal? (token)
  (def value (token-value* token))
  (or (number? value)
      (contains? constants value)
      (= value "\"\"")))

(defn quoted? (string)
  (def value (token-value* string))
  (and (string? value)
       (= "\"" (first value) (last value))))

(defn comment? (string)
  (match? (regex "^;") string))


(defn list-literal? (x)
  (and (list? x) (= 'list (token-value* (first x)))))

(defn hash? (x)
  (and (list? x) (= 'hash (token-value* (first x)))))

(defn list-not-literal? (x)
  (and (list? x) (!= 'list (token-value* (first x)))))

(defn has-meta? (token)
  (and (defined? token) (defined? token.meta) (not-empty? token.meta)))

(defn meta-contains? (token value)
  (and (has-meta? token) (contains? token.meta value)))

(defn get-meta (token)
  (or token.meta []))

(defn add-hint (token hint)
  (push token.meta hint)
  token)

(defn number-str? (string)
  (string.match (regex (str "^" tokens.number.source "$"))))

(defn append-hint (forms form)
  "Append hint to last form in the forms. Create new 'logos' form if forms is empty."
  (def target (last forms)
    hint (token-value* form))
  (when (not target)
    (set target (new Token ":"))
    (forms.push target))
  (target.append-hint hint)
  (comment log "append hint" hint target)
  target)

(defn read-compound (expected-bracket stream)
  (def ls []
    token (stream.read-token)
    first-token token
    meta-mode false)
  (while (and token (!= token.value expected-bracket))
    (def value token.value)
    (if
        (= value ":") (when (!= expected-bracket "}") (set meta-mode true))
        (do
          (def form (read-form token stream))
          (if meta-mode (append-hint ls form)
              (ls.push form))
          (set meta-mode false)))
    (set token (stream.read-token)))
  (when (not token)
    (syntax-error (str "Missed closing bracket: " expected-bracket ".")) first-token)
  ls)

(defn read-simple (token stream)
  (when (token.match /^(\)|\]|\})$/)
    (syntax-error "Missed opening bracket." token))
  (if (number-str? token.value)
    (new Token (parse-float (token.value.replace (regex "," 'g) "")))
    token))

(defn read-normal (token stream)
  (switch token.value
          "(" (read-compound ")")
          "{" (cons "hash" (read-compound "}"))
          "[" (cons "list" (read-compound "]"))
          (read-simple)))

(defn read-unquote (token stream)
  (if (= (second token.value) "@")
    (cons "unquote-splicing" [(read-normal (token.slice 2))])
    (cons "unquote" [(read-normal (token.slice 1))])))

(defn make-fn-params (args)
  (def params [] expected 1)
  (each (arg) (sort (keys args))
        (def arg-num (parseInt arg 10))
        (while (> arg-num expected)
          ;; fill holes in params with unused params
          (params.push (make-param expected))
          (inc expected))
        (params.push (get args arg))
        (set expected (+ 1 arg-num)))
  params)

(defn make-param (id)
  "Functions defined with #() can't be nested, so it safe don't use (gensym) here."
  (str "__ArG_" id))

(defn read-fn (token stream)
  (when (defined? *reader-fn-args*)
    (error "Nested #()s are not allowed."))
  (rebind
   (*reader-fn-args* {})
   (def body (read-compound ")")
     params (make-fn-params *reader-fn-args*))
   `(fn ~params ~body)))

(defn read-fn-arg (token stream)
  (when (undefined? *reader-fn-args*)
    (syntax-error (str "Argument literal %" token.value " outside of #().") token))
  (def arg-id (or token.value "1"))
  (when (not (get *reader-fn-args* arg-id))
    (set-in *reader-fn-args* arg-id (make-param arg-id)))
  (get *reader-fn-args* arg-id))


(defn read-dispatch (token stream)
  (switch (first token.value)
          "(" (read-fn)
          (syntax-error (str "Unsupported dispatch: " token.value) token)))

(defn read-form (token stream)
  (comment log "read-form" stream.index token)
  (switch (first token.value)
          "'" (cons "quote" [(read-normal (token.slice 1))])
          "`" (cons "syntax-quote" [(read-normal (token.slice 1))])
          "~" (read-unquote)
          "#" (read-dispatch (token.slice 1))
          "%" (read-fn-arg (token.slice 1))
          (read-normal)))

(defn Source (path line column)
  (set
   this.path path
   this.line line
   this.column column)
  this)

(defn Token (value source:?)
  (set
   this.value value
   this.source source
   this.meta [])
  this)

(defn Token.prototype.source-str ()
  (def self this)
  (when-let src self.source
            (str src.path ":" src.line ":" src.column)))

(defn Token.prototype.match (pattern)
  (this.value.match pattern))

(defn Token.prototype.slice (start end)
  (new Token (this.value.slice start end)))

(defn Token.prototype.append-hint (hint)
  (this.meta.push hint))

(defn Tokenizer (text re)
  (set-in this
          'text text
          're re
          'last-nl -1
          'line 1
          'column 0
          'closed false
          'last-token undefined)
  this)

(defn Tokenizer.prototype.update-position (token-str)
  (def self this
    start (- self.re.lastIndex token-str.length 1))
  (let-while pos (self.text.indexOf "\n" (+ self.last-nl 1))
             (and (>= pos 0) (< pos start))
             (inc self.line)
             (set self.last-nl pos))
  (set self.column (- start self.last-nl)))

(defn Tokenizer.prototype.read-token ()
  (def self this
    token)
  (when (not self.closed)
    (let (t (self.re.exec self.text))
      (when-let token-str (and t (nth t 0))
                (self.update-position token-str)
                (set token (new Token token-str (new Source metajs.file self.line self.column))
                     self.last-token token))
      (set self.closed (not t))))
  token)


(defn read-one (stream)
  (when-let token (stream.read-token)
            (read-form token)))

(defn read (text)
  "Read all forms from text."
  (def stream (new Tokenizer text (regex -parser-re 'g))
    forms [])
  (try
    (while (not stream.closed)
      (def form (read-one stream))
      (when form
        (forms.push form)))
    (catch e
        (fatal-error e.message stream.last-token)))
  forms)

(defn pr-atom (atom)
  (if (string? atom)
    (escape-js atom)
    atom))

(defn pr1 (form)
  "Print single form to a string."
  (if (list? form) (str "(" (join " " (map form pr1)) ")")
      (pr-atom (token-value* form))))

(defn prn-str* (& forms)
  "Print forms to string and escape it."
  (wrap-in-double-quotes (join "\n" (map forms pr1))))

(defn prn-str (& forms)
  "Print forms to string that reader can read back."
  (eval (apply prn-str* forms)))

(export* metajs
         prn-str prn-str*)

