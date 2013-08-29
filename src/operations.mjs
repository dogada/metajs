(defn multi-op (op args)
  (cdata "(" (interpose (str " " op " ") (map args expr)) ")"))

(defmacro + (& args)
  (multi-op "+" args))

(defmacro - (& args)
  (multi-op "-" args))

(defmacro - (& args)
  (multi-op "-" args))

(defmacro * (& args)
  (multi-op "*" args))

(defmacro / (& args)
  (multi-op "/" args))

(defmacro and (& args)
  (multi-op "&&" args))

(defmacro or (& args)
  (multi-op "||" args))

(defmacro mod (& args)
  (multi-op "%" args))

(defmacro compare-op (op left right)
  (cdata (expr left) " " (expr op) " " (expr right)))

(defmacro = (x & more)
  (def left (expr x)
    ops (map more #(list 'compare-op "===" left %)))
  `(and ~@ops))

(defmacro overlap (op args)
  (def ops
    (map (args.slice 0 -1)
         (fn (left index)
           `(compare-op (literal ~op) ~left ~(nth args (+ 1 index))))))
  `(and ~@ops))

(defmacro != (& args)
  `(overlap "!==" ~args))

(defmacro >  (& args)
  `(overlap ">" ~args))

(defmacro <  (& args)
  `(overlap "<" ~args))

(defmacro <= (& args)
  `(overlap "<=" ~args))

(defmacro >= (& args)
  `(overlap ">=" ~args))

(defmacro not (x)
  `(js "!%" ~x))

(defmacro pow (base exponent)
  `(*call Math.pow ~base ~exponent))

(defmacro zero? (x)
  `(= ~x 0))

(defmacro odd? (x)
  `(!= (mod ~x 2) 0))

(defmacro even? (x)
  `(= (mod ~x 2) 0))

(defmacro function? (x)
  `(= (typeof ~x) 'function))

(defmacro undefined? (x)
  `(= (typeof ~x) 'undefined))

(defmacro defined? (x)
  `(!= (typeof ~x) 'undefined))

(defmacro number? (x)
  `(= (typeof ~x) 'number))

(defmacro string? (x)
  `(= (typeof ~x) 'string))

(defmacro boolean? (x)
  `(= (typeof ~x) 'boolean))

(defmacro typeof-object? (x)
  `(= (typeof ~x) 'object))

(defmacro array? (x)
  `(and ~x (= (safe-prop ~x constructor.name) 'Array)))

(defmacro object? (x)
  `(and ~x (= (safe-prop ~x constructor.name) 'Object)))

(defmacro push (x & xs)
  `(~x .push ~@xs))

(defmacro pop (x)
  `(~x .pop))

(defmacro slice (xs begin:0 end:?)
  `(~xs .slice ~begin ~(or end 'undefined)))

(defmacro slice* (xs begin:0 end:?)
  `(*call Array.prototype.slice.call ~xs ~begin ~(or end 'undefined)))

(defmacro length (xs)
  `(prop ~xs length))

(defmacro empty? (xs)
  `(= (length ~xs) 0))

(defmacro not-empty? (xs)
  `(> (length ~xs) 0))

(defmacro contains? (seq item)
  `(!= (~seq .indexOf ~item) -1))

(defmacro not-contains? (seq item)
  `(= (~seq .indexOf ~item) -1))

(defmacro contains-many? (xs)
  `(> (length ~xs) 1))

(defmacro contains-one? (xs)
  `(= (length ~xs) 1))

(defmacro first (xs)
  `(nth ~xs 0))

(defmacro second (xs)
  `(nth ~xs 1))

(defmacro third (xs)
  `(nth ~xs 2))

(defmacro last (xs)
  `(nth ~xs (- (length ~xs) 1)))

(defmacro rest (xs)
  `(~xs .slice 1))

(defmacro frest (xs)
  `(~xs .slice 1))

(defmacro frest (xs)
  `(list (first ~xs) (rest ~xs)))

