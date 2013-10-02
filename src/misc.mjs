(defn first-atom (form)
  (if (list? form)
    (first-atom (first form))
    form))

(defn first-token (form)
  (if (and (list? form) (not-empty? form))
    (or (first-token (first form)) (first-token (rest form)))
    (if (token? form) form)))



