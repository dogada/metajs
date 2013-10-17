(set-in metajs '*assert* 'exception)

(defn metajs.AssertError (message assertion path resolved-params)
  (set-in this
          'message message
          'assertion assertion)
  this)

(set metajs.AssertError.prototype (new Error))


(defn metajs.deep-equal? (actual expected)
  (if (= actual expected) true
      (and (list? expected) (list? actual))
      (let (index 0 diff)
        (until (or (= expected.length index) diff)
               (when (not (metajs.deep-equal? (nth actual index) (nth expected index)))
                 (set diff true))
               (inc index))
        (not diff))

      (and (object? expected) (object? actual))
      (let (diff)
        (each-key key expected
                  (when (not (metajs.deep-equal? (get expected key) (get actual key)))
                    (set diff true)))
        (not diff))

      false))

(defn form-source (form)
  (def token (first-token form))
  (prn-str* (if token (token.source-str) "unknown")))

(defmacro let-assert* (x handler)
  (def form (if* (list? x) x (list 'bool x))
    params (rest form)
    args (map params #(str "p" %2)))
  `(let* (~@(zip* args params))
         (def evaluated (~(first form) ~@args)
           ctx (hash 'path ~(form-source params)
                     'assertion ~(prn-str* form)
                     'quoted-params (list ~@(map params #(prn-str* %)))
                     'resolved-params (list ~@args)))
         ~handler))

(defmacro assert-error (message assertion path)
  `(throw (str "Assert failed: " ~(or message "") " " ~assertion " at " ~path)))

(defmacro assert (x message:?)
  "If *assert* is false don't output any code. Otherwise evaluate x and delegate evaluated result
to metajs.*assert-handler*."
  (when metajs.*assert*
    `(let-assert*
      ~x
      (if (and metajs metajs.*assert-handler*)
        (*call metajs.*assert-handler* evaluated ~(or message "") ctx)
        (when (not evaluated)
          (assert-error ~message ctx.assertion ctx.path))))))

(defmacro asserts (& xs)
  "Convert expressions with optional messages to list of asserts."
  (def ls [])
  (each (x) xs
        (if (quoted? x) (push (last ls) x)
            (push ls ['assert x])))
  `(statements ~@ls))

(defmacro assert-by2 (func & xs)
  (assert (even? xs.length))
  (let ls (bulk-map xs #(list 'assert (list func %1 %2)))
       `(statements ~@ls)))

(defmacro assert* (x message:?)
  "Classical assert without argument parsing."
  (when metajs.*assert*
    (def assertion (prn-str* x)
      token (first-token x)
      path (prn-str* (if token (token.source-str) "")))
    `(statements (if (and metajs metajs.*assert-handler*)
                   (*call metajs.*assert-handler* ~x ~(or message "")
                          (hash 'path ~path
                                'assertion ~assertion))
                   (when (not ~x)
                     (assert-error ~message ~assertion ~path))))))

(defmacro assert-eq (actual expected message:?)
  `(assert (= ~actual ~expected)))

(defmacro assert-eq* (actual expected)
  `(assert (metajs.deep-equal? ~actual ~expected)))

(defmacro assert-not (x)
  `(assert (not ~x)))

(defmacro assert-defined (& xs)
  "Chech that all passed arguments are defined."
  `(statements ~@(map xs #(list 'assert* (list 'defined? %)))))

(defmacro assert-true (actual message:?)
  `(assert-eq ~actual true))

(defmacro assert-false (actual message:?)
  `(assert-eq ~actual false))


(defmacro assert-match (regex thing message:?)
  `(assert (match ~regex ~thing)))

(defmacro try-assert (x res)
  `(assert-eq (try ~x
                   (catch e (e.toString))) ~res))

(defmacro assert-js (metajs-code js-code)
  `(assert-eq (try ((metajs.translate ~metajs-code) .trim)
                   (catch e (e.toString)))
              ~js-code))

(defmacro assert-js* (metajs-code js-prefix)
  `(assert (!= ((try ((metajs.translate ~metajs-code) .trim)
                     (catch e (e.toString))) .indexOf ~js-prefix) -1)))
