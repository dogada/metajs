(defn LintError (message error-count)
  (set-in this
          'message message
          'error-count error-count))

(set LintError.prototype (new Error))

(def lint-log {1: {label: "Error" logger: "error"},
               2: {label: "Warning" logger: "warn"},
               3: {label: "Info" logger: "info"}})

(def [lint-error-count lint-warn-count lint-info-count] 0)

(defn reset-lint ()
  (set [lint-error-count lint-warn-count lint-info-count] 0))

(defn lint-exit-code ()
  (if* lint-error-count 1 0))

(defn lint-report ()
  (str "MetaJS lint errors: " lint-error-count
                    ", warnings: " lint-warn-count
                    ", hints: " lint-info-count "."))

(defn log-lint-report ()
  (def message (lint-report))
  (console.log message)
  message)


(defn mjs-log (level code message form)
  "Provide some feedback about a token."
  (def label ((get lint-log level) @label)
    logger ((get lint-log level) @logger)
    token (first-token form)
    err-str (str (if* metajs.file-role "+" "")
                 (if* (token? token) (str (token.source-str) " ") "")
                 label "(" code "): " message))
  (when (<= level metajs.lint-log-level)
    ((get console logger) err-str))
  err-str)

(defn lint-error (code message form)
  (inc lint-error-count)
  (mjs-log 1))

(defn lint-warn (code message form)
  (inc lint-warn-count)
  (mjs-log 2))

(defn lint-info (code message form)
  (inc lint-info-count)
  (mjs-log 3))


(defn fatal-error (message form)
  (throw (new LintError (lint-error 0) lint-error-count)))

(defn syntax-error (message form)
  (lint-error 1))

(defn lint-missed-required-arg (message form)
  (lint-error 2))

(defn lint-undeclared-rest (message form)
  (lint-warn 3))

(defn lint-unknown-hints (message form)
  (lint-error 4))

(defn lint-duplicated-hints (message form)
  (lint-error 5))

(defn lint-many-candidates (message form)
  (lint-error 6))

(export* metajs
         LintError
         log-lint-report lint-exit-code reset-lint)
