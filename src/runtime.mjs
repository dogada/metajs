(defn list? (x)
  "In MetaJS list is Javascript's native array."
  (array? x))

(defn list? (x)
  "In MetaJS list is Javascript's native array."
  (array? x))

(defn concat (ls & xs)
  "Combine several lists into one. Atoms wrapped into lists before appending."
  (Array.prototype.concat.apply ls xs))

(defn cons (& xs)
  "Cons(truct) new list by prepending first items to the last list."
  (assert (and (>= xs.length 2) (list? (last xs))))
  (concat (slice xs 0 -1) (last xs)))

(defn conj (ls & xs)
  "Conj(oin) ls with xs and return new list. Items always added to the end of list."
  (ls .concat xs))


(defn join (glue xs)
  (xs.join glue))

(defn map (xs func self:?)
  (xs .map func self))

(defn bulk-map (arr func)
  (def index 0
    arity func.length
    res [])
  (while (< index arr.length)
    (res.push (apply func (slice arr index (+ index arity))))
    (set index (+ index arity)))
  res)

(defn filter (xs func self:?)
  (xs .filter func self))

(defn compact (arr)
  (filter arr #(bool %)))

(defn merge (xs)
  "Merge several arrays inside xs array into one."
  (Array.prototype.concat.apply [] xs))

(defn pluck (xs key)
  (map xs #(get % key)))

(defn reversed (arr)
  (def res [])
  (each (item) arr (res.unshift item))
  res)

(defn filter-keys (obj keys)
  (def res {})
  (each (key) keys
        (set-in res key (get obj key)))
  res)

(defn hash-map (ls key-value-func)
  (def data {})
  (each (item) ls
        (def [key value] (key-value-func item))
        (set-in data key value))
  data)

(defn sort (ls comparator:?)
  (ls.sort comparator))

(defn zip (& xs)
  (map (first xs) #(pluck xs (str %2))))

(defn zip* (& xs)
  (merge (apply zip xs)))

;;; export symbols to exports if defined, otherwise to global object (window)
(export* (if (defined? exports) exports this)
         list? cons conj map zip zip* concat)
