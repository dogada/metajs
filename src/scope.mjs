(defn Scope (name:?)
  (set-in this
          'name name
          'source undefined
          'context {}
          'macros {}
          'entities {}
          'symbols {}
          'relations {})
  this)

(defn Scope.prototype.set-fn (name args)
  (set-in this.context name args)
  this)

(defn Scope.prototype.set-macro (name args fn)
  (set-in this.macros name fn)
  (this.set-fn name args))

(defn set-scope-macro (name args fn)
  ((get-scope) .set-macro name args fn))


(defn -add-provider (target provider index)
  (def providers (and (index .hasOwnProperty target) (get index target)))
  (when-not providers
    (set providers [])
    (set-in index target providers))
  (providers.push provider))

(defn Scope.prototype.set-vars (vars)
  (def context this.context
    symbols this.symbols)
  (each (v) vars
        (set-in context v.name v)
        (each (name) (get-token-entities v.token)
              (-add-provider name v symbols)))
  this)

(defn add-scope-symbol (sym)
  ((get-scope) .set-vars [{type: "var"
                           name: (sym.toString)
                           token: sym}]))


(defn -rel-targets (rel)
  (def targets (second rel))
  (if (list-literal? targets) (slice targets 1)
      (token? targets) (list targets)
      (syntax-error "Invalid relation." rel)))

(defn make-rel-fn (code)
  (eval (compile-one `(fn (sym rel) ~code))))

(defn -add-rel (code rel fqn index extra:?)
  (def rel-fn (make-rel-fn))
  (each (target) (-rel-targets)
        (-add-provider (token-value* target)
                       {name: fqn
                        type: (first rel)
                        code: rel-fn
                        token: target
                        extra: extra
                        })))

(defn Scope.prototype.set-entity (name rels doc:?)
  (def fqn (token-value* name)
    index this.relations
    entity {name: fqn type: 'entity rels: rels doc: doc}
    get-code ['list ['quote "."] 'sym 'rel])
  (set-in this.entities fqn entity)
  (each (rel) rels
        (switch (token-value* (first rel))
                'has (-add-rel get-code)
                'fn (-add-rel get-code extra: (transform-args (rel @2)))
                'rel (-add-rel (rel @2))))
  this)

(defn get-stack ()
  metajs.stack)

(defn start-scope (name)
  (def scope (new Scope name))
  ((get-stack) .unshift scope)
  scope)

(defn finish-scope ()
  ((get-stack) .shift))

(defn reset-scope ()
  (def old-scope (get-scope))
  (finish-scope)
  (start-scope old-scope.name))

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

(defn find-entities (form)
  "Find all entitities assotiated with a token."
  (merge (compact (map (get-token-entities form) #(find-in-stack 'relations %)))))


(defn find-symbols (entities)
  (merge (compact (map entities #(find-in-stack 'symbols % (closure-scope-count))))))

(defn dump-scope-logos ()
  (log "symbols" (get (get-scope) 'symbols))
  (log "entities" (get (get-scope) 'entities))
  (log "relations" (get (get-scope) 'relations)))

(defn find-closure-def (name)
  "Lookup for a def inside root def."
  (find-in-stack 'context name (closure-scope-count)))

(defn find-macro-table (name)
  (def table {} depth 0)
  (until (or (get table name) (>= depth (scope-count)))
         (set table (get-scope depth @macros))
         (inc depth))
  (if* (get table name) table))

(defn find-macro (name)
  (def table (find-macro-table name)
    macro (and table (get table name)))
  (comment log "find-macro" name (bool table))
  macro)


(defn dump-stack ()
  (log "---------------- Stack " (scope-count) "------------------")
  (each (scope) (get-stack)
        (log scope)))

(export* metajs
         dump-stack get-scope)


