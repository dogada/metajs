(defn Scope (name:?)
  (set-in this
          'name name
          'source undefined
          'context {}
          'macros {})
  this)

(defn Scope.prototype.set-fn (name args)
  (set-in this.context name args)
  this)

(defn Scope.prototype.set-vars (vars)
  (def context this.context)
  (each (v) vars
        (set-in context v.name v))
  this)

(defn Scope.prototype.set-macro (name args fn)
  (set-in this.macros name fn)
  (this.set-fn name args))

(defn set-scope-macro (name args fn)
  ((get-scope) .set-macro name args fn))


(defn get-stack ()
  metajs.stack)

(defn start-scope (name)
  (def scope (new Scope name))
  ((get-stack) .unshift scope)
  scope)

(defn finish-scope ()
  ((get-stack) .shift))

(defn scope-count ()
  (length (get-stack)))

(defn get-scope (depth:?)
  (get (get-stack) (or depth 0)))

(defn closure-scope-count ()
  "Exclude global and root scopes from total scope count."
  (- (scope-count) 2))

(defn scope-path ()
  (str metajs.file ": "
       (join "/" (pluck (reversed (get-stack)) 'name))))

(defn find-in-stack (table name max-depth:?)
  (def stack (get-stack)
    depth 0
    value)
  (when (undefined? max-depth)
    (set max-depth stack.length))
  (until (or value (>= depth max-depth))
         (def scope (get stack depth))
         (set value (get (get scope table) name))
         (inc depth))
  value)

(defn find-def (name)
  (find-in-stack 'context name))

(defn find-closure-def (name)
  "Lookup for a def inside root def."
  (find-in-stack 'context name (closure-scope-count)))

(defn find-macro (name)
  (def table (find-macro-table name)
    macro (and table (get table name)))
  (comment log "find-macro" name (bool table))
  macro)

(defn find-macro-table (name)
  (def table {} depth 0)
  (until (or (get table name) (>= depth (scope-count)))
         (set table (get-scope depth @macros))
         (inc depth))
  (if* (get table name) table))

(defn dump-stack ()
  (log "---------------- Stack " (scope-count) "------------------")
  (each (scope) (get-stack)
        (log scope)))





