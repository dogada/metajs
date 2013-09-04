---
layout: 'default'
slug: 'overview'
title: 'MetaJS overview'
---

#### Introduction

MetaJS is Lisp compiled to Javascript. Final code runs in browser or on NodeJs
plaform without runtime dependencies. More about MetaJS background you can find
on [coect.net/metajs/](http://www.coect.net/metajs/). Project Coect aims to
replace outdated Email and XMPP with modern [universal communication
protocol](http://www.coect.net/). MetaJS for Coect plays the same role as Emacs
Lisp for Emacs.

Bellow is an interactive overview of MetaJS language. You can change MetaJS
code as you read docs and imediatelly see generated javascript code.


#### Destructing

MetaJS supports destructing in `def`, `get`, `set` forms:

```lisp
(def actors ["Neo" "Trinity" "Morpheus"]
     [neo trinity morpheus] actors)

(let digits [1 2 3]
     [one two three] digits
  (set [one two three] digits))
```


#### Method and property hooks

For chaining methods calls and object property access there is also method and
property hooks. Literal begining with `.` is treated as method of the previous
form, next forms are parameters of the method. Literal begining with `@` is
property of previous form, for example `(get obj 'prop)` can be written as `(obj
@prop)`. Hooks are espesially useful when they are combined:

```lisp
(d3 .selectAll "circle" .transition
    .duration 750
    .delay #(* %2 10)
    .attr "r" #(Math.sqrt (* %1 scale)))
```

#### Macroses

To define a macros you can use standard Lisp syntax-quote, unquote and unquote-splicing:

```lisp
(defmacro when (x & code)
  `(if ~x (do ~@code)))

(when earth-moves (log "And yet it moves!"))
```

#### Functions

Functions can have optional parameters and parameters with default values. Each
parameter can be passed positionally or as keyword. In addition function can
accept variable number of parameters that are accessible as list.


```lisp
(defn demo-fn (a b:Thing c:? d:2 & more)
 (log a b c d more))

;; an example of the function call
(demo-fn "Just A" "noumenon" c:42)
```

#### Smart compilation

MetaJS tries to generate optimized Javascript code. Same MetaJS code can be
compiled to several forms of Javascript code. For example, let's look at the
classical conditional form `if` in different contexts.

```lisp
(defn if-return (a b)
  (if a b))
```

```lisp
(defn if-statement (a b)
  (if a (set b a))
  b)
```

```lisp
(defn if-expression (a b)
  (log (if a a b)))
```

#### Try more

For experiments with bigger code parts you can use [Translate Eval
Print Loop (TEPL)](/tepl/) or [install
MetaJS](https://github.com/dogada/metajs#how-to-install-and-try-metajs) locally.
