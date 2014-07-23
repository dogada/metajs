# (: MetaJS)

Write on **lisp**. Compile to pure **javascript** without runtime dependencies.
Enjoy compiler that can **guess your thoughts** and **generate intentionally missed
parts of code**.

### Knowledge-oriented programming language

MetaJS is yet another attempt to create better programming language for modern
world. More about MetaJS background, why it was chosen Lisp-syntax and why it's
compiled to Javascript, you can find on
[coect.net/metajs/](http://www.coect.net/metajs/). Project Coect aims to replace
outdated Email and XMPP with modern [universal communication
protocol](http://www.coect.net/).

MetaJS for Coect plays the same role as Emacs Lisp for Emacs. MetaJS is written
in MetaJS and can recompile itself. Look at the [interactive
MetaJS-documentation](http://metajs.coect.net/) where you can try MetaJS without
leaving your browser.

Knowledge-oriented programming as opposed to object-oriented or functional one gives
main priority to semantic models of the program instead of building blocks of
the program (objects or functions). Each semantic model (in the form that
compiler can understand) is called [logos](http://en.wikipedia.org/wiki/Logos).

You can find more information about semantic code transformations, examples of
symbolic and entitative MetaJS to JavaScipt transformations in the [metajs_semantic_code_transformations.pdf](http://metajs.coect.net/pdf/metajs_semantic_code_transformations.pdf).
Please look also at the high-level MetaJS language overview [metajs_lisp.pdf](http://metajs.coect.net/pdf/metajs_lisp.pdf).

### Seamless integration with Javascript

MetaJS is compiled to Javascript code without runtime dependencies and don't use
own datastructures (like for example ClojureScript does). MetaJS uses native
Javascript's arrays as lists and so can perform in any Javascript environment
without unnecessary overhead. JSON documents are valid MetaJS documents and so
can be included with usual `include`. MetaJS tries to generate beautiful
javascript code that passes JSHint without warnings. The generated code is
compatible with [EcmaScript5](http://kangax.github.io/es5-compat-table/). For
legacy browsers like IE8 it should be used
[es5-shim](https://github.com/kriskowal/es5-shim/) or other
[polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill/).

MetaJS is implemented in MetaJS and you can extend language easily by adding new
macros. For example, to add support of `yield` keyword introduced in
[Javascript 1.7](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.7)
just create a macro like:

```lisp
(defmacro yield (x)
  `(js "yield %" ~x))
```

### Feature highlights

MetaJS supports destructuring across all forms that accept name-value bindings:

```lisp
(def actors ["Neo" "Trinity" "Morpheus"]
     [neo trinity morpheus] actors)

(let digits [1 2 3]
     [one two three] digits
  (set [one two three] digits))
```

Forms can be chained with well-known `->` macro. For chaining methods calls often
used in javascript libraries like [jQuery](http://jquery.com/) or
[D3](http://d3js.org/) there is also special syntax based on method hooks. For
example let's look at following [code-sample](http://d3js.org/#transitions) from
D3 homepage:

```javascript
d3.selectAll("circle").transition()
    .duration(750)
    .delay(function(d, i) { return i * 10; })
    .attr("r", function(d) { return Math.sqrt(d * scale); });
```

and rewrite it in MetaJS using hooks and short anonymous functions:

```lisp
(d3 .selectAll "circle" .transition
    .duration 750
    .delay #(* %2 10)
    .attr "r" #(Math.sqrt (* %1 scale)))
```

To define a macro you can use standard Lisp syntax-quote, unquote and unquote-splicing:

```lisp
(defmacro when (x & code)
  `(if ~x (do ~@code)))
```

Functions can have optional parameters and parameters with default values. Each
parameter can be passed positionally or as keyword. In addition function can
accept variable number of parameters that are accessible as list. Shortly syntax
for keyword-only function parameters will be finalised.

```lisp
;; 'a' is required, 'b' is required and associated with an entity 'Thing'
;; 'c' is optional, 'd' is optional and has default value 2, 'more' holds rest positional parameters
(defn demo-fn (a b:Thing c:? d:2 & more)
 (log a b c d more))

;; an example of the function call
(demo-fn "Just A" "noumenon" c:42)
```

You can embed variables inside [interpolated
strings](http://en.wikipedia.org/wiki/String_interpolation) that are started with `#`.
Inside such strings `$symbol` is replaced with symbol's value and `$=var`
replaced with pair _name=value_. For escaping `$` itself use `$$`.

```lisp
(= #"Hello, $nickname!" (str "Hello, " nickname "!"))
```

MetaJS is under active development. In the nearest plans is to finish javascript
source maps support and explicit semantic code transformations. Then add
namespaces and integrate support of
[Browserify](https://github.com/substack/node-browserify). You can see [full
list](http://github.com/dogada/metajs/issues) of planned changes and offer your
own.


### How to install and try MetaJS

Firstly, please install [Node.js](http://nodejs.org/download/).

If you want  to install latest development version of MetaJS:

```sh
$ git clone https://github.com/dogada/metajs.git
$ cd ./metajs
$ npm install
$ npm link .
```

If you don't plan to rebuild MetaJS and just want to try it:

```sh
$ npm install -g metajs
```

You have just installed MetaJS and become qualified for a MetaJS-developer
T-shirt. It's time to dive into MetaJS:

```
$ metajs -x test/index.mjs # run MetaJS test suite
$ metajs --lint test/index.mjs # check unit tests for errors
$ metajs --lint --lint-log-level=1 test/index.mjs # show only Lint errors, hide warnings and hints
$ metajs # start TEPL (Translate Eval Print Loop)
$ metajs src/cli.mjs  # compile single file to stdout
$ metajs test/def.mjs test/hook.mjs --output ./ # compile 2 files to the working directory
$ metajs -e "(+ 2 2)" # advanced calculator
$ metajs --help # print help to stdout
$ make # rebuild MetaJS compiler and run test suite
```

If you use Emacs you will enjoy MetaJS-support for flymake mode. The simplest
method is to use [my fork of flymake](https://github.com/dogada/emacs-flymake),
however you can also extend standard flymake with MetaJS support (use [this
changeset](https://github.com/dogada/emacs-flymake/commit/01d6296597016d2e4ad51fb556439c8ade7d6ce8)
as a hint). With flymake you will receive MetaJS feedback in real-time mode
during edithing the code.

### How to get involved or learn more

Add any bugs or feature requests to the
[issues](http://github.com/dogada/metajs/issues) page. Follow
[@meta_js](https://twitter.com/meta_js) or
[d0gada](http://www.twitter.com/d0gada) on Twitter to receive latest metajs
news. Like [MetaJS page](https://www.facebook.com/pages/Metajs/1389834274578119)
on Facebook. Join our [mailing list](https://groups.google.com/d/forum/coect).
Please visit [www.coect.net](http://www.coect.net) to find more docs and
examples.


### MetaJS allows compiler to generate source code. Will a computer create programs instead of a human?

The compiler will execute the instructions exactly as before, but in addition to
grammar instructions, it will also execute semantic instructions defined
specifically for your program.

Imagine that you're explaining how does your program work to someone who knows
nothing about programming &mdash; it's an old grammar compiler. Now imagine that
you're explaining the same thing to someone with a degree in computer science &mdash;
it's a new semantic compiler. But you will have to explain it in both cases.
