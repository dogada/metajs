---
layout: 'default'
slug: 'overview'
title: 'MetaJS is a Lisp that can guess your thoughts and generate missed code'
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


#### Destructuring

MetaJS supports destructuring in `def`, `get`, `set` forms:

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

#### Macros

To define a macro you can use standard Lisp syntax-quote, unquote and unquote-splicing:

```lisp
(defmacro when (x & code)
  `(if ~x (do ~@code)))

(when earth-moves (log "And yet it moves!"))
```

#### String interpolation

You can embed variables inside [interpolated
strings](http://en.wikipedia.org/wiki/String_interpolation) that are started with `#`.
Inside such strings `$symbol` is replaced with symbol's value and `$=var`
replaced with pair _name=value_. For escaping `$` itself use `$$`.

```
#"Hello, $name!"
#"$name, you got $$100."
#"Debug: $=name, $=last-value."
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

<h4 id="magic">Magic</h4>

It's not a joke  that MetaJS compiler can guess your thoughts and generate
missed parts of code. Let's look at example bellow where function `named-id`
requires 2 parameters but it's called without any parameters. Notice that in the
compiled Javascript code on the right function `namedId` called with both two
required parameters obtained from local context. How is it done?  It's
[magic](http://www.coect.net/metajs/).

```
(defn named-id (id name opt:"")
  (str id ":" name ":" opt))

(defn logos-demo (id)
  (let name "A name" opt 42
    (named-id)))
```

MetaJS will do what you mean **only** if you didn't say what to do. Compiler will
never attempt to be smarter than you. MetaJS will try to resolve only required
function parameters, i.e. do what you said it to do. It will not try to find
optional parameters in the execution context.

In the above example local variable `opt` from `logos-demo` function isn't passed to
`named-id` function, because `opt` argument declared as *optional* for
`named-id` function (and has default value &ndash; empty string). If you missed a required
variable and MetaJS can't find it in the call context or there more than one
possible solution, you should see a warning.

#### Try more

For experiments with bigger code parts you can use [Translate Eval
Print Loop (TEPL)](/tepl/) or [install
MetaJS](https://github.com/dogada/metajs#how-to-install-and-try-metajs) locally.

Look at the discussions about MetaJS on
[Reddit](http://www.reddit.com/r/lisp/comments/1ltb9r/new_lisp_dialect_can_guess_your_thoughts_and_emit/)
and [LOR](http://www.linux.org.ru/news/opensource/9546490).

You can find more information about semantic code transformations, examples of
symbolic and entitative MetaJS to JavaScipt transformations in the [metajs_semantic_code_transformations.pdf](/pdf/metajs_semantic_code_transformations.pdf).
