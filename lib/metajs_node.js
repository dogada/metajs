// common extensions;



// common runtime functions;

// reader;

// lint;

// scope;

// compiler;


var metajs = exports,
    util = require("util"),
    path = require("path"),
    fs = require("fs"),
    sys = require("sys"),
    inspect = util.inspect;

var pr = (function(x) {
  return sys.print(x);
});

var error = (function(x) {
  throw (new Error(x));
});

metajs.stack = [];
metajs.file = "<unknown>";
metajs.dir = undefined;
metajs.fileRole = undefined;
metajs.lastId = 0;
metajs._assertHandler_ = metajs.throwHandler;
metajs.error = error;
metajs.lintLogLevel = 3;

var LintError = (function(message, errorCount) {
  this.message = message;
  this.errorCount = errorCount;
});

LintError.prototype = (new Error());

var lintLog = {
1  : {
    label: "Error",
    logger: "error"
},
2  : {
    label: "Warning",
    logger: "warn"
},
3  : {
    label: "Info",
    logger: "info"
}
};

var lintErrorCount = 0,
    lintWarnCount = 0,
    lintInfoCount = 0;

var resetLint = (function() {
  lintErrorCount = 0;
  lintWarnCount = 0;
  lintInfoCount = 0;
});

var lintExitCode = (function() {
  return (lintErrorCount ? 1 : 0);
});

var lintReport = (function() {
  return ("MetaJS lint errors: " + lintErrorCount + ", warnings: " + lintWarnCount + ", hints: " + lintInfoCount + ".");
});

var logLintReport = (function() {
  var message = lintReport();
  console.log(message);
  return message;
});

var mjsLog = (function(level, code, message, form) {
  /* Provide some feedback about a token. */
  var label = (lintLog)[level].label,
    logger = (lintLog)[level].logger,
    token = firstToken(form),
    errStr = ((metajs.fileRole ? "+" : "") + (token__QUERY(token) ? (token.sourceStr() + " ") : "") + label + "(" + code + "): " + message);
  if ((level <= metajs.lintLogLevel)) {
    (console)[logger](errStr);
  }
  return errStr;
});

var lintError = (function(code, message, form) {
  ((lintErrorCount)++);
  return mjsLog(1, code, message, form) /*logos:3*/ ;
});

var lintWarn = (function(code, message, form) {
  ((lintWarnCount)++);
  return mjsLog(2, code, message, form) /*logos:3*/ ;
});

var lintInfo = (function(code, message, form) {
  ((lintInfoCount)++);
  return mjsLog(3, code, message, form) /*logos:3*/ ;
});

var fatalError = (function(message, form) {
  throw (new Error((new LintError(lintError(0, message, form) /*logos:2*/ , lintErrorCount))));
});

var syntaxError = (function(message, form) {
  return lintError(1, message, form) /*logos:2*/ ;
});

var lintMissedRequiredArg = (function(message, form) {
  return lintError(2, message, form) /*logos:2*/ ;
});

var lintUndeclaredRest = (function(message, form) {
  return lintWarn(3, message, form) /*logos:2*/ ;
});

var lintUnknownHints = (function(message, form) {
  return lintError(4, message, form) /*logos:2*/ ;
});

var lintDuplicatedHints = (function(message, form) {
  return lintError(5, message, form) /*logos:2*/ ;
});

var lintMultiResolve = (function(message, form, fatal) {
  fatal = ((typeof(fatal) === "undefined") ? true : fatal);
  if (fatal) {
    return lintError(6, message, form) /*logos:2*/ ;
  } else {
    return lintWarn(6, message, form) /*logos:2*/ ;
  }
});

var lintUndefined = (function(message, form) {
  return lintWarn(7, message, form) /*logos:2*/ ;
});

(function() {
  var G__1 = metajs;
  G__1.LintError = LintError;
  G__1.logLintReport = logLintReport;
  G__1.lintExitCode = lintExitCode;
  G__1.resetLint = resetLint;
})();

  
var Scope = (function(name) {
  this.name = name;
  this.source = undefined;
  this.context = {};
  this.macros = {};
  this.entities = {};
  this.symbols = {};
  this.relations = {};
  return this;
});

Scope.prototype.setSymbol = (function(name, value, overwrite) {
  if ((overwrite || !(this.context)[name])) {
    (this.context)[name] = value;
  }
  return this;
});

Scope.prototype.setFn = (function(name, args, overwrite) {
  overwrite = ((typeof(overwrite) === "undefined") ? true : overwrite);
  return this.setSymbol(name, args, overwrite);
});

Scope.prototype.setMacro = (function(name, args, fn) {
  (this.macros)[name] = fn;
  return this.setFn(name, args);
});

var setScopeMacro = (function(name, args, fn) {
  return getScope().setMacro(name, args, fn);
});

var __addProvider = (function(target, provider, index) {
  var providers = (index.hasOwnProperty(target) && (index)[target]);
  if (!providers) {
    providers = [];
    (index)[target] = providers;
  }
  return providers.push(provider);
});

Scope.prototype.setVars = (function(vars, overwrite) {
  overwrite = ((typeof(overwrite) === "undefined") ? true : overwrite);
  var context = this.context,
    symbols = this.symbols,
    self = this;
  vars.forEach((function(v) {
    self.setSymbol(v.name, v, overwrite);
    return getTokenEntities(v.token).forEach((function(name) {
      return __addProvider(name, v, symbols);
    }));
  }));
  return this;
});

var addScopeSymbol = (function(sym, overwrite) {
  overwrite = ((typeof(overwrite) === "undefined") ? true : overwrite);
  return getScope().setVars([{
    type: "var",
    name: sym.toString(),
    token: sym
}], overwrite);
});

var __relTargets = (function(rel) {
  var targets = (rel)[1];
  if (listLiteral__QUERY(targets)) {
    return targets.slice(1, undefined);
  } else if (token__QUERY(targets)) {
    return [targets];
  } else {
    return syntaxError("Invalid relation.", rel);
  }
});

var makeRelFn = (function(code) {
  return eval(compileOne(metajs.mergeSq(["fn", metajs.mergeSq(["sym", "rel"]), code])));
});

var __addRel = (function(code, rel, fqn, index, extra) {
  var relFn = makeRelFn(code) /*logos:1*/ ;
  return __relTargets(rel) /*logos:1*/ .forEach((function(target) {
    return __addProvider(tokenValue_(target), {
      name: fqn,
      type: (rel)[0],
      code: relFn,
      token: target,
      extra: extra
}, index) /*logos:1*/ ;
  }));
});

Scope.prototype.setEntity = (function(name, rels, doc) {
  var fqn = tokenValue_(name),
    index = this.relations,
    entity = {
    name: fqn,
    type: "entity",
    rels: rels,
    doc: doc
},
    getCode = ["list", ["quote", "."], "sym", "rel"];
  (this.entities)[fqn] = entity;
  rels.forEach((function(rel) {
    return (function() {
      switch (tokenValue_((rel)[0])) {
        case "has": return __addRel(getCode, rel, fqn, index) /*logos:3*/ ;
        case "fn": return __addRel(getCode, rel, fqn, index, transformArgs((rel)[2])) /*logos:3*/ ;
        case "rel": return __addRel((rel)[2], rel, fqn, index) /*logos:3*/ ;
        }
    })();
  }));
  return this;
});

var getStack = (function() {
  return metajs.stack;
});

var startScope = (function(name) {
  var scope = (new Scope(name));
  getStack().unshift(scope);
  return scope;
});

var finishScope = (function() {
  return getStack().shift();
});

var resetScope = (function() {
  var oldScope = getScope();
  finishScope();
  return startScope(oldScope.name);
});

var scopeCount = (function() {
  return getStack().length;
});

var getScope = (function(depth) {
  return (getStack())[(depth || 0)];
});

var closureScopeCount = (function() {
  /* Exclude global and root scopes from total scope count. */
  return (scopeCount() - 2);
});

var scopePath = (function() {
  return (metajs.file + ": " + join("/", pluck(reversed(getStack()), "name")));
});

var findInStack = (function(table, name, maxDepth) {
  var stack = getStack(),
    depth = 0,
    value;
  if ((typeof(maxDepth) === "undefined")) {
    maxDepth = stack.length;
  }
  while (!(value || (depth >= maxDepth))) {
    var scope = (stack)[depth];
    value = ((scope)[table])[name];
    ((depth)++);
  }
  return value;
});

var findDef = (function(name) {
  return findInStack("context", name);
});

var findEntities = (function(form) {
  /* Find all entitities assotiated with a token. */
  return merge(compact(map(getTokenEntities(form), (function(__ArG_1) {
    return findInStack("relations", __ArG_1);
  }))));
});

var findSymbols = (function(entities) {
  return merge(compact(map(entities, (function(__ArG_1) {
    return findInStack("symbols", __ArG_1, closureScopeCount());
  }))));
});

var dumpScopeLogos = (function() {
  console.log("symbols", getScope().symbols);
  console.log("entities", getScope().entities);
  return console.log("relations", getScope().relations);
});

var findClosureDef = (function(name) {
  /* Lookup for a def inside root def. */
  return findInStack("context", name, closureScopeCount());
});

var findMacroTable = (function(name) {
  var table = {},
    depth = 0;
  while (!((table)[name] || (depth >= scopeCount()))) {
    table = getScope(depth).macros;
    ((depth)++);
  }
  return ((table)[name] ? table : undefined);
});

var findMacro = (function(name) {
  var table = findMacroTable(name),
    macro = (table && (table)[name]);
  /* (log "find-macro" name (bool table)) */
  return macro;
});

var dumpStack = (function() {
  console.log("---------------- Stack ", scopeCount(), "------------------");
  return getStack().forEach((function(scope) {
    return console.log(scope);
  }));
});

(function() {
  var G__2 = metajs;
  G__2.dumpStack = dumpStack;
  G__2.getScope = getScope;
})();

  
  // global scope for common macros like def, defn, etc;
  
  startScope("global");
  
var list__QUERY = (function(x) {
  /* In MetaJS list is Javascript's native array. */
  return (x && ((x).constructor.name === "Array"));
});

var concat = (function(ls) {
  /* Combine several lists into one. Atoms wrapped into lists before appending. */
  var xs = Array.prototype.slice.call(arguments, 1, undefined);
  return Array.prototype.concat.apply(ls, xs);
});

var cons = (function() {
  /* Cons(truct) new list by prepending first items to the last list. */
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  (function(p0, p1) {
    var evaluated = (p0 && p1),
    ctx = {
      "path": "/home/dogada/projects/MJS/src/runtime.mjs:11:16",
      "assertion": "(and (>= xs.length 2) (list? (last xs)))",
      "quotedParams": ["(>= xs.length 2)", "(list? (last xs))"],
      "resolvedParams": [p0, p1]
};
    if ((metajs && metajs._assertHandler_)) {
      return metajs._assertHandler_(evaluated, "", ctx);
    } else {
      if (!evaluated) {
        throw (new Error(("Assert failed: " + "" + " " + ctx.assertion + " at " + ctx.path)));
      }
    }
  })((xs.length >= 2), list__QUERY((xs)[(xs.length - 1)]));
  return concat(xs.slice(0, -1), (xs)[(xs.length - 1)]);
});

var conj = (function(ls) {
  /* Conj(oin) ls with xs and return new list. Items always added to the end of list. */
  var xs = Array.prototype.slice.call(arguments, 1, undefined);
  return ls.concat(xs);
});

var join = (function(glue, xs) {
  return xs.join(glue);
});

var map = (function(xs, func, self) {
  return xs.map(func, self);
});

var bulkMap = (function(arr, func) {
  var index = 0,
    arity = func.length,
    res = [];
  while ((index < arr.length)) {
    res.push(func.apply(this, arr.slice(index, (index + arity))));
    index = (index + arity);
  }
  return res;
});

var filter = (function(xs, func, self) {
  return xs.filter(func, self);
});

var compact = (function(arr) {
  return filter(arr, (function(__ArG_1) {
    return (!!__ArG_1);
  }));
});

var merge = (function(xs) {
  /* Merge several arrays inside xs array into one. */
  return Array.prototype.concat.apply([], xs);
});

var pluck = (function(xs, key) {
  return map(xs, (function(__ArG_1) {
    return (__ArG_1)[key];
  }));
});

var reversed = (function(arr) {
  var res = [];
  arr.forEach((function(item) {
    return res.unshift(item);
  }));
  return res;
});

var filterKeys = (function(obj, keys) {
  var res = {};
  keys.forEach((function(key) {
    (res)[key] = (obj)[key];
  }));
  return res;
});

var hashMap = (function(ls, keyValueFunc) {
  var data = {};
  ls.forEach((function(item) {
    var key = (keyValueFunc(item))[0],
    value = (keyValueFunc(item))[1];
    (data)[key] = value;
  }));
  return data;
});

var sort = (function(ls, comparator) {
  return ls.sort(comparator);
});

var zip = (function() {
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  return map((xs)[0], (function(__ArG_1, __ArG_2) {
    return pluck(xs, (__ArG_2));
  }));
});

var zip_ = (function() {
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  return merge(zip.apply(this, xs));
});

// export symbols to exports if defined, otherwise to global object (window);

(function() {
  var G__3 = (function() {
    if ((typeof(exports) !== "undefined")) {
      return exports;
    } else {
      return this;
    }
  })();
  G__3.list__QUERY = list__QUERY;
  G__3.cons = cons;
  G__3.conj = conj;
  G__3.map = map;
  G__3.zip = zip;
  G__3.zip_ = zip_;
  G__3.concat = concat;
})();

    
// Read string or input stream and return list of tokens.;

// Token is the form itself and meta-information about source (filename, line,;

// column) used for error reporting and building source maps.;

// regular expressions for supported forms;

var tokens = {
  regex: /\/(\\\/|[^\/\n])+\/[glim]*/,
  comment: /\;.*/,
  string: /\"(([^\"]|(\\\"))*[^\\])?\"/,
  number: /-?[0-9][0-9.,]*/,
  special: /['`~#]?/,
  literal: /[@\-]?[\$\*\.\w][\$\*\.\w-]*(\?|!)?/,
  operand: /[\?><=!\+\/\*\-]+/,
  atIndex: /@\d+/,
  fnArg: /%[1-9&$]?/,
  colon: /:/,
  ampersand: /&/,
  closeParen: /\)/,
  alternativeParens: /\{|\[|\}|\]/
};

tokens.specialLiteral = (new RegExp((tokens.special.source + tokens.literal.source), undefined));
tokens.specialOpenParen = (new RegExp((tokens.special.source + "@?" + "\\("), undefined));
tokens.interpolatedString = (new RegExp(("#" + tokens.string.source), undefined));

setScopeMacro("_literalRegexp", null, (function() {
  /* Raw string without javascript escaping. */
  return ("/^" + tokens.literal.source + "$/");
}));

var wordRe = (function(re) {
  return (new RegExp(("^" + re.source + "$"), undefined));
});

var __tokenOrder = ["regex", "comment", "interpolatedString", "string", "number", "specialLiteral", "operand", "atIndex", "fnArg", "colon", "ampersand", "specialOpenParen", "closeParen", "alternativeParens"],
    __parserRe = join("|", map(__tokenOrder, (function(__ArG_1) {
  return ("(" + (tokens)[__ArG_1].source + ")");
}))),
    jsIdRe = /^[a-zA-Z_]\w*$/,
    literalRe = /^[@\-]?[\$\*\.\w][\$\*\.\w-]*(\?|!)?$/,
    operandRe = wordRe(tokens.operand),
    constants = ["true", "false", "null", "undefined"],
    istringArgRe = /(\$\$|\$=?[a-zA-Z][\w-]*|\$=?\(.*\))/,
    istringArgWordRe = wordRe(istringArgRe),
    istringEscapeRe = /^\$\$$/,
    istringDebugRe = /^\$=/,
    entityRe = /[A-za-z][\w-]*/,
    _readerFnArgs_;

var token__QUERY = (function(item) {
  return ((typeof(item) !== "undefined") && (typeof(item.value) !== "undefined"));
});

var tokenValue = (function(token) {
  return token.value;
});

var tokenValue_ = (function(item) {
  if (token__QUERY(item)) {
    return tokenValue(item);
  } else {
    return item;
  }
});

var validJsId__QUERY = (function(token) {
  return (function() {
    var it = tokenValue_(token);
    if ((typeof(it) === "string")) {
      return jsIdRe.test(it);
    }
  })();
});

var literal__QUERY = (function(item) {
  var value = tokenValue_(item);
  return (!!((typeof(value) === "string") && value.match(literalRe)));
});

var symbol__QUERY = (function(token) {
  var value = tokenValue_(token);
  return ((literal__QUERY(value) && (constants.indexOf(value) === -1)) || ((typeof(value) === "string") && value.match(operandRe)));
});

var entity__QUERY = (function(token) {
  var value = tokenValue_(token);
  return (literal__QUERY(value) && (constants.indexOf(value) === -1) && (typeof(value) === "string") && value.match(entityRe));
});

var getTokenEntities = (function(token) {
  return cons(tokenValue_(token), filter(getMeta(token), (function(__ArG_1) {
    return entity__QUERY(__ArG_1);
  })));
});

var valueLiteral__QUERY = (function(token) {
  var value = tokenValue_(token);
  return ((typeof(value) === "number") || (constants.indexOf(value) !== -1) || (value === "\"\""));
});

var quoted__QUERY = (function(string) {
  var value = tokenValue_(string);
  return ((typeof(value) === "string") && ("\"" === (value)[0] && "\"" === (value)[(value.length - 1)]));
});

var comment__QUERY = (function(string) {
  return string.match((new RegExp("^;", undefined)));
});

var listName__QUERY = (function(form, name) {
  return (list__QUERY(form) && (tokenValue_((form)[0]) === name));
});

var listLiteral__QUERY = (function(x) {
  return listName__QUERY(x, "list");
});

var hash__QUERY = (function(x) {
  return listName__QUERY(x, "hash");
});

var listNotLiteral__QUERY = (function(x) {
  return (list__QUERY(x) && !listName__QUERY(x, "list"));
});

var hasMeta__QUERY = (function(token) {
  return ((typeof(token) !== "undefined") && (typeof(token.meta) !== "undefined") && (token.meta.length > 0));
});

var metaContains__QUERY = (function(token, value) {
  return (hasMeta__QUERY(token) && (token.meta.indexOf(value) !== -1));
});

var getMeta = (function(token) {
  return (token.meta || []);
});

var addHint = (function(token, hint) {
  token.meta.push(hint);
  return token;
});

var numberStr__QUERY = (function(string) {
  return string.match((new RegExp(("^" + tokens.number.source + "$"), undefined)));
});

var appendHint = (function(forms, form) {
  /* Append hint to last form in the forms. Create new 'logos' form if forms is empty. */
  var target = (forms)[(forms.length - 1)],
    hint = tokenValue_(form);
  if (!target) {
    target = (new Token(":"));
    forms.push(target);
  }
  target.appendHint(hint);
  /* (log "append hint" hint target) */
  return target;
});

var readCompound = (function(expectedBracket, stream) {
  var ls = [],
    token = stream.readToken(),
    firstToken = token,
    metaMode = false;
  while ((token && (token.value !== expectedBracket))) {
    var value = token.value;
    if ((value === ":")) {
      if ((expectedBracket !== "}")) {
        metaMode = true;
      }
    } else {
      var form = readForm(token, stream);
      if (metaMode) {
        appendHint(ls, form);
      } else {
        ls.push(form);
      }
      metaMode = false;
    }
    token = stream.readToken();
  }
  if (!token) {
    syntaxError(("Missed closing bracket: " + expectedBracket + "."), form) /*logos:1*/ ;
    firstToken;
  }
  return ls;
});

var readNumber = (function(token, stream) {
  return (new Token(parseFloat(token.value.replace((new RegExp(",", "g")), ""))));
});

var istring__QUERY = (function(s) {
  return (quoted__QUERY(s) && istringArgRe.test(s));
});

var readSimple = (function(token, stream) {
  if (token.match(/^(\)|\]|\})$/)) {
    syntaxError("Missed opening bracket.", token);
  }
  if (numberStr__QUERY(token.value)) {
    return readNumber(token, stream) /*logos:2*/ ;
  } else {
    return token;
  }
});

var readNormal = (function(token, stream) {
  return (function() {
    switch (token.value) {
      case "(": return readCompound(")", stream) /*logos:1*/ ;
      case "{": return cons("hash", readCompound("}", stream) /*logos:1*/ );
      case "[": return cons("list", readCompound("]", stream) /*logos:1*/ );
      default: return readSimple(token, stream) /*logos:2*/ ;
      }
  })();
});

var readUnquote = (function(token, stream) {
  if (((token.value)[1] === "@")) {
    return cons("unquote-splicing", [readNormal(token.slice(2), stream) /*logos:1*/ ]);
  } else {
    return cons("unquote", [readNormal(token.slice(1), stream) /*logos:1*/ ]);
  }
});

var makeParam = (function(id) {
  /* Functions defined with #() can't be nested, so it safe don't use (gensym) here. */
  return (function() {
    switch (id) {
      case "&": return "__ArG_more";
      case "$": return "arguments[arguments.length - 1]";
      default: return ("__ArG_" + id);
      }
  })();
});

var makeFnParams = (function(args) {
  var params = [],
    ids = Object.keys(args),
    maxPos = parseInt((sort(ids))[(sort(ids).length - 1)], 10);
  while ((maxPos > params.length)) {
    // declare all positional params even if used only some of them;
    params.push(makeParam((params.length + 1)));
  }
  if ((ids.indexOf("&") !== -1)) {
    params.push("&", makeParam("&"));
  }
  return params;
});

var readFn = (function(token, stream) {
  if ((typeof(_readerFnArgs_) !== "undefined")) {
    error("Nested #()s are not allowed.");
  }
  return (function() {
    var G__4 = _readerFnArgs_;
    return (function() {
      try {
        _readerFnArgs_ = {};
        var body = readCompound(")", stream) /*logos:1*/ ,
    params = makeFnParams(_readerFnArgs_);
        return metajs.mergeSq(["fn", params, body]);
      } finally {
        _readerFnArgs_ = G__4;
      }
    })();
  })();
});

var readFnArg = (function(token, stream) {
  if ((typeof(_readerFnArgs_) === "undefined")) {
    syntaxError(("Argument literal %" + token.value + " outside of #()."), token);
  }
  var argId = (token.value || "1");
  if (!(_readerFnArgs_)[argId]) {
    (_readerFnArgs_)[argId] = makeParam(argId);
  }
  return (_readerFnArgs_)[argId];
});

var readDispatch = (function(token, stream) {
  return (function() {
    switch ((token.value)[0]) {
      case "(": return readFn(token, stream) /*logos:2*/ ;
      case "\"": return ["fmt", token];
      default: return syntaxError(("Unsupported dispatch: " + token.value), token);
      }
  })();
});

var readForm = (function(token, stream) {
  /* (log "read-form" stream.index token) */
  return (function() {
    switch ((token.value)[0]) {
      case "'": return cons("quote", [readNormal(token.slice(1), stream) /*logos:1*/ ]);
      case "`": return cons("syntax-quote", [readNormal(token.slice(1), stream) /*logos:1*/ ]);
      case "~": return readUnquote(token, stream) /*logos:2*/ ;
      case "#": return readDispatch(token.slice(1), stream) /*logos:1*/ ;
      case "%": return readFnArg(token.slice(1), stream) /*logos:1*/ ;
      default: return readNormal(token, stream) /*logos:2*/ ;
      }
  })();
});

var Source = (function(path, line, column) {
  this.path = path;
  this.line = line;
  this.column = column;
  return this;
});

var Token = (function(value, source, meta) {
  meta = ((typeof(meta) === "undefined") ? [] : meta);
  this.value = value;
  this.source = source;
  this.meta = meta;
  return this;
});

Token.prototype.valueOf = (function() {
  return this.value;
});

Token.prototype.toString = (function() {
  return this.value;
});

Token.prototype.inspect = (function(depth) {
  var res = (this.value);
  if ((this.meta.length === 0)) {
    return this.value;
  } else {
    return (this.value + ":" + this.meta.join(":"));
  }
});

Token.prototype.sourceStr = (function() {
  var self = this;
  return (function() {
    var src = self.source;
    if (src) {
      return (src.path + ":" + src.line + ":" + src.column);
    }
  })();
});

Token.prototype.match = (function(pattern) {
  return this.value.match(pattern);
});

Token.prototype.slice = (function(start, end) {
  return (new Token(this.value.slice(start, end)));
});

Token.prototype.appendHint = (function(hint) {
  return this.meta.push(hint);
});

Token.prototype.cloneWithNs = (function(parent) {
  return (new Token((tokenValue(parent) + "." + this.value), this.source, this.meta));
});

Token.prototype.clone = (function(value) {
  return (new Token((value || this.value), this.source, this.meta));
});

var cloneForm = (function(form, value) {
  if (token__QUERY(form)) {
    return form.clone(value);
  } else {
    return (value || form);
  }
});

var Tokenizer = (function(text, re) {
  this.text = text;
  this.re = re;
  this.lastNl = -1;
  this.line = 1;
  this.column = 0;
  this.closed = false;
  this.lastToken = undefined;
  return this;
});

Tokenizer.prototype.updatePosition = (function(tokenStr) {
  var self = this,
    start = (self.re.lastIndex - tokenStr.length - 1);
  (function() {
    var pos = self.text.indexOf("\n", (self.lastNl + 1));
    while (((pos >= 0) && (pos < start))) {
      ((self.line)++);
      self.lastNl = pos;
      pos = self.text.indexOf("\n", (self.lastNl + 1));
    }
  })();
  self.column = (start - self.lastNl);
});

Tokenizer.prototype.readToken = (function() {
  var self = this,
    token;
  if (!self.closed) {
    (function() {
      var t = self.re.exec(self.text);
      (function() {
        var tokenStr = (t && (t)[0]);
        if (tokenStr) {
          self.updatePosition(tokenStr);
          token = (new Token(tokenStr, (new Source(metajs.file, self.line, self.column))));
          self.lastToken = token;
        }
      })();
      self.closed = !t;
    })();
  }
  return token;
});

var readOne = (function(stream) {
  return (function() {
    var token = stream.readToken();
    if (token) {
      return readForm(token, stream) /*logos:1*/ ;
    }
  })();
});

var read = (function(text) {
  /* Read all forms from text. */
  var stream = (new Tokenizer(text, (new RegExp(__parserRe, "g")))),
    forms = [];
  (function() {
    try {
      while (!stream.closed) {
        var form = readOne(stream);
        if (form) {
          forms.push(form);
        }
      }
    } catch (e) {
      return fatalError(e.message, stream.lastToken);
    }
  })();
  return forms;
});

var prAtom = (function(atom) {
  if ((typeof(atom) === "string")) {
    return escapeJs(atom);
  } else {
    return atom;
  }
});

var pr1 = (function(form) {
  /* Print single form to a string. */
  if (list__QUERY(form)) {
    return ("(" + join(" ", map(form, pr1)) + ")");
  } else {
    return prAtom(tokenValue_(form));
  }
});

var prnStr_ = (function() {
  /* Print forms to string and escape it. */
  var forms = Array.prototype.slice.call(arguments, 0, undefined);
  return wrapInDoubleQuotes(join("\n", map(forms, pr1)));
});

var prnStr = (function() {
  /* Print forms to string that reader can read back. */
  var forms = Array.prototype.slice.call(arguments, 0, undefined);
  return eval(prnStr_.apply(this, forms));
});

(function() {
  var G__5 = metajs;
  G__5.read = read;
  G__5.prnStr = prnStr;
  G__5.prnStr_ = prnStr_;
})();

    
var wrapInDoubleQuotes = (function(x) {
  return ("\"" + x + "\"");
});

var escapeJs = (function(x) {
  return x.replace(/[\\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
});

var escapeJsQuotes = (function(x) {
  return x.replace(/\\\"/g, "\\\\\"").replace(/\"/g, "\\\"");
});

var stripDoubleQuotes = (function(x) {
  if (quoted__QUERY(x)) {
    return x.slice(1, -1);
  } else {
    return x;
  }
});

var jsQuote = (function(form) {
  var value = tokenValue_(form);
  if (list__QUERY(value)) {
    return map(value, jsQuote);
  } else {
    if (quoted__QUERY(value)) {
      return wrapInDoubleQuotes(escapeJsQuotes(value));
    } else {
      return value;
    }
  }
});

setScopeMacro("syntaxQuote", null, (function(form) {
  if (list__QUERY(form)) {
    return (function() {
      switch (tokenValue_((form)[0])) {
        case "unquote": return jsQuote((form)[1]);
        case "unquote-splicing": return ["list", "\"unquote-splicing\"", jsQuote((form)[1])];
        default: return cons("metajs.mergeSq", [cons("list", map(form, findMacro("syntaxQuote")))]);
        }
    })();
  } else {
    return quote_(form);
  }
}));

setScopeMacro("quote", null, (function(x) {
  return quote_(x);
}));

var quote_ = (function(x) {
  var value = tokenValue_(x);
  if (list__QUERY(value)) {
    return cons("list", map(value, quote_));
  } else if ((typeof(value) === "number")) {
    return value;
  } else if (quoted__QUERY(value)) {
    return wrapInDoubleQuotes(escapeJsQuotes(value));
  } else {
    return wrapInDoubleQuotes(jsLiteral(value));
  }
});

var quote__QUERY = (function(x) {
  return listName__QUERY(x, "quote");
});

metajs.mergeSq = (function(ls) {
  var merged = [];
  ls.forEach((function(form) {
    if (listName__QUERY(form, "unquote-splicing")) {
      merged = merged.concat((form)[1]);
    } else {
      return merged.push(form);
    }
  }));
  return merged;
});

setScopeMacro("macrojs", null, (function(name) {
  /* Return macro's function javascript code as string. */
  return (function() {
    var it = findMacro(raw(name));
    if (it) {
      return it.toString();
    }
  })();
}));

(function() {
  var G__6 = metajs;
  G__6.stripDoubleQuotes = stripDoubleQuotes;
})();

      


var callStr = (function(name, args) {
  return (name + "(" + join(" ", map(args, (function(arg) {
    if (hasMeta__QUERY(arg)) {
      return (arg.value + ":" + arg.meta);
    } else if ((arg && arg.value)) {
      return arg.value;
    } else if (list__QUERY(arg)) {
      return "[...]";
    } else {
      return arg;
    }
  }))) + ")");
});

var parseParams = (function(token, name, params, expected) {
  var positional = [],
    hints = [],
    rest = [];
  params.forEach((function(param, i) {
    if (hasMeta__QUERY(param)) {
      return hints.push(param);
    } else {
      if ((hints.length === 0)) {
        return positional.push(param);
      } else {
        return rest.push(param);
      }
    }
  }));
  if (((typeof(expected) === "undefined") && (hints.length > 0))) {
    lintUnknownHints(("Hints in unknown function call: " + callStr(name, hints)), token);
  }
  if ((hints.length !== Object.keys(hashMap(hints, (function(p) {
    return [p.value, 1];
  }))).length)) {
    lintDuplicatedHints(("Duplicated hints in the call: " + callStr(name, hints)), token);
  }
  return [positional, hints, rest];
});

var checkCallParams = (function(fnToken, params, expected) {
  var name = tokenValue_(fnToken),
    parsed = parseParams(fnToken, name, params, expected) /*logos:3*/ ,
    positional = (parsed)[0],
    hints = (parsed)[1],
    rest = (parsed)[2],
    positionalCount = positional.length,
    expectedArgs = (expected || []),
    keywordCount = filter(expectedArgs, (function(arg) {
    return (arg.presence === "keyword");
  })).length,
    withoutRest = filter(expectedArgs, (function(arg) {
    return (arg.presence !== "rest");
  })),
    allowedRest = ((typeof(expected) === "undefined") || (expectedArgs.length !== withoutRest.length)),
    resolved = [];
  // FIX;
  var popHint = (function(name) {
    var hint;
    hints.forEach((function(h, i) {
      if ((h.value === name)) {
        hint = (h.meta)[0];
        return hints.splice(i, 1);
      }
    }));
    return hint;
  });
  // resolve arg without positional or hint value;
  var resolveBlank = (function(arg) {
    return (function() {
      switch (arg.presence) {
        case "required": // find missed but required arg from surrounding context or report error;
        var val = resolveArg(arg, fnToken);
        if (val) {
          return resolved.push(val.form);
        } else {
          return lintMissedRequiredArg((arg.name + " is required for " + name), fnToken);
        }
        case "optional": if ((keywordCount || (hints.length > 0) || (rest.length > 0))) {
          // we have a hint for next argument or keyword argument, so for current optional arg use undefined;
          return resolved.push("undefined");
        }
        case "keyword": if (arg.meta) {
          // for keyword argument without provided hint always use default;
          return resolved.push((arg.meta)[(arg.meta.length - 1)]);
        }
        }
    })();
  });
  // iterate over all function arguments and resolve them ;
  withoutRest.forEach((function(arg, index) {
    var argName = arg.name,
    hint = popHint(argName);
    if ((typeof(hint) !== "undefined")) {
      if (((index < positionalCount) && (arg.presence !== "keyword"))) {
        syntaxError((argName + " passed twice: positionally and as keyword."), fnToken);
      }
      /* (log "---------- Using hint at" index arg-name ":" hint) */
      return resolved.push(hint);
    } else {
      if ((positional.length > 0)) {
        // keyword argumets always ignore params passed positionally;
        if ((arg.presence === "keyword")) {
          return resolved.push((arg.meta)[(arg.meta.length - 1)]);
        } else {
          return resolved.push(positional.shift());
        }
      } else {
        return resolveBlank(arg);
      }
    }
  }));
  if ((hints.length > 0)) {
    syntaxError(("Unsupported hints: " + callStr(name, hints)), fnToken);
  }
  rest = concat(positional, rest);
  resolved = concat(resolved, rest);
  if ((!allowedRest && (rest.length > 0))) {
    lintUndeclaredRest(("Found " + rest.length + " undeclared rest params in " + callStr(name, rest)), fnToken);
  }
  return resolved;
});

var entityResolve = (function(form) {
  /* Use entities associated with arg to find substitution for missed argument. */
  var entities = findEntities(form),
    bound = filter(map(entities, (function(e) {
    return {
      entity: e,
      symbols: findSymbols([e.name])
};
  })), (function(es) {
    return (es.symbols.length > 0);
  }));
  return merge(map(bound, (function(es) {
    return map(es.symbols, (function(__ArG_1) {
      return {
        "form": es.entity.code(__ArG_1.name, ["quote", es.entity.token]),
        entity: es.entity
};
    }));
  })));
});

var symbolResolve = (function(form) {
  /* Find in the current lexical scope symbols with arg's name or meta type. */
  return map(findSymbols(getTokenEntities(form)), (function(__ArG_1) {
    return {form: __ArG_1.name};
  }));
});

var reportResolveError = (function(form, parent, forms, fatal) {
  /* Show all possible candidates for resolving the missed argument of a function. */
  var resolvers = map(forms, compileOne).join(", ");
  dumpScopeLogos();
  lintMultiResolve(("Too many candidates for " + form + " in " + parent + ": " + resolvers + "."), parent);
  return null;
});

var resolveForm = (function(form, parent, fatal) {
  /* Replace missed argument of a function with a form or report an error. */
  fatal = ((typeof(fatal) === "undefined") ? true : fatal);
  var forms = concat(symbolResolve(form) /*logos:1*/ , entityResolve(form) /*logos:1*/ );
  if ((forms.length === 1)) {
    return (forms)[0];
  } else if ((forms.length > 1)) {
    return reportResolveError(form, parent, forms, fatal) /*logos:4*/ ;
  }
});

var resolveArg = (function(arg, fnToken, fatal) {
  fatal = ((typeof(fatal) === "undefined") ? true : fatal);
  return resolveForm(arg.token, fnToken);
});

setScopeMacro("entity", null, (function(name) {
  /* Define entity in the current lexical scope. */
  var rels = Array.prototype.slice.call(arguments, 1, undefined);
  var doc = "";
  if (quoted__QUERY((rels)[0])) {
    doc = ([(rels)[0], rels.slice(1)])[0];
    rels = ([(rels)[0], rels.slice(1)])[1];
  }
  getScope().setEntity(name, rels, doc);
  return undefined;
}));

setScopeMacro("declareFn", null, (function() {
  /* Declare an function on the current scope. */
  var pairs = Array.prototype.slice.call(arguments, 0, undefined);
  var declareOne = (function(sym, args) {
    return getScope().setFn(sym, transformArgs(args), false);
  });
  bulkMap(pairs, (function(target, args) {
    if (list__QUERY(target)) {
      return target.slice(1).forEach((function(sym) {
        return declareOne(sym, args) /*logos:2*/ ;
      }));
    } else {
      return declareOne(target, args) /*logos:1*/ ;
    }
  }));
  return undefined;
}));

setScopeMacro("declare", null, (function() {
  /* Declare some symbols in the current scope. */
  var symbols = Array.prototype.slice.call(arguments, 0, undefined);
  symbols.forEach((function(sym) {
    return addScopeSymbol(sym, false);
  }));
  return undefined;
}));

var verifyName = (function(name, parent) {
  /* Verify that name is defined or resolve it or print warning. */
  var parts = name.valueOf().split("."),
    head = (parts)[0],
    tail = parts.slice(1),
    adef = findDef(head),
    main = (function() {
    if ((head === "this")) {
      return {form: name};
    } else if (adef) {
      return {
        form: name,
        def: adef
};
    } else {
      return resolveForm(head, parent, false);
    }
  })();
  if (!main) {
    lintUndefined(("Undefined " + name + "."), name);
  }
  // TODO: check tail validness;
  if ((main && tail.length && main.entity)) {
    main.form = concat([".", main.form], map(tail, (function(__ArG_1) {
      return ["quote", __ArG_1];
    })));
  }
  return (main || {form: name});
});

var verifyForm = (function(form, parent) {
  if (symbol__QUERY(form)) {
    return verifyName(form, parent) /*logos:1*/ ;
  } else {
    return {form: form};
  }
});

        
var Fragment = (function(data, meta) {
  this.data = data;
  this.meta = meta;
});

Fragment.prototype.unshift = (function(x) {
  this.data.unshift(x);
  return this;
});

var fragment__QUERY = (function(obj) {
  return (obj instanceof Fragment);
});

var withMeta = (function(meta, obj) {
  /* Add meta to the object. */
  obj.meta = meta;
  return obj;
});

var cdataArg = (function(arg) {
  if (list__QUERY(arg)) {
    throw (new Error(("Lists as cdata arg")));
  } else {
    return arg;
  }
});

var cdata = (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return (new Fragment(map(args, cdataArg)));
});

var interpose = (function(sep, values) {
  return cdata.apply(this, merge(map(values, (function(v) {
    return [v, sep];
  }))).slice(0, -1));
});

var cdataMap = (function(xs, func) {
  return cdata.apply(this, map(xs, func));
});

setScopeMacro("js", null, (function(template) {
  var args = Array.prototype.slice.call(arguments, 1, undefined);
  var stripped = stripDoubleQuotes(template),
    parts = stripped.split("%"),
    holes = (parts.length - 1),
    res = [];
  if ((holes !== args.length)) {
    throw (new Error(("js template error: '" + escapeJs(stripped) + "', passed " + args.length + ", but required " + holes + " arguments.")));
  }
  parts.forEach((function(p, i) {
    res.push(p);
    // FIX rebind context;
    if ((i < holes)) {
      return (function() {
        var arg = (args)[i],
    carg = raw(arg);
        return res.push(carg);
      })();
    }
  }));
  return cdata.apply(this, res);
}));

var hook__QUERY = (function(x) {
  var value = tokenValue_(x);
  return ((typeof(value) === "string") && value.match(/^[\.@].+/));
});

var methodHook__QUERY = (function(x) {
  return x.match(/^\..+/);
});

var processHook = (function(name, res) {
  /* Read next form and add to previous form as property or method call. Enable catch-mode if token is method. */
  var isMethod = ((name)[0] === "."),
    realName = name.slice(1),
    prop = (numberStr__QUERY(realName) ? parseInt(realName, 10) : realName);
  if ((res.length > 1)) {
    // treat current list content as a function and prepare it to use as;
    // parent for next property;
    res = [res];
  }
  // append current form as property to previous form;
  (res)[(res.length - 1)] = ["get", (res)[(res.length - 1)], ["quote", prop]];
  if (isMethod) {
    // make a call from last form;
    res = [res];
  }
  return res;
});

var __processHookParams = (function(name, res, xs, i) {
  var maxI = (xs.length - 1);
  if (methodHook__QUERY(name)) {
    while (!(hook__QUERY((xs)[(i + 1)]) || (i >= maxI))) {
      ((i)++);
      // append param for hooked method;
      (res)[(res.length - 1)].push((xs)[i]);
    }
  } else {
    if ((i < maxI)) {
      // ensure we don't have normal forms after hooked property;
      if (!hook__QUERY((xs)[(i + 1)])) {
        syntaxError(("Unsupported tail after " + name), name);
      }
    }
  }
  return i;
});

var processHooks = (function(xs) {
  var i = 0,
    hooked = 0,
    res = [],
    token,
    value;
  if (((xs.length > 0) && hook__QUERY((xs)[0]))) {
    // transform (.prop obj) into (obj .prop);
    (function(p0) {
      var evaluated = (p0.length > 1),
    ctx = {
        "path": "/home/dogada/projects/MJS/src/raw.mjs:90:28",
        "assertion": "(contains-many? xs)",
        "quotedParams": ["xs"],
        "resolvedParams": [p0]
};
      if ((metajs && metajs._assertHandler_)) {
        return metajs._assertHandler_(evaluated, "Hook without target.", ctx);
      } else {
        if (!evaluated) {
          throw (new Error(("Assert failed: " + "Hook without target." + " " + ctx.assertion + " at " + ctx.path)));
        }
      }
    })(xs);
    (function(p0) {
      var evaluated = !p0,
    ctx = {
        "path": "/home/dogada/projects/MJS/src/raw.mjs:91:18",
        "assertion": "(not (hook? (second xs)))",
        "quotedParams": ["(hook? (second xs))"],
        "resolvedParams": [p0]
};
      if ((metajs && metajs._assertHandler_)) {
        return metajs._assertHandler_(evaluated, "After hook at first position must be normal form.", ctx);
      } else {
        if (!evaluated) {
          throw (new Error(("Assert failed: " + "After hook at first position must be normal form." + " " + ctx.assertion + " at " + ctx.path)));
        }
      }
    })(hook__QUERY((xs)[1]));
    xs = cons((xs)[1], (xs)[0], xs.slice(2, undefined));
  }
  while ((i < xs.length)) {
    token = (xs)[i];
    value = tokenValue_(token);
    if (!hook__QUERY(value)) {
      res.push(token);
    } else {
      ((hooked)++);
      res = processHook(value, res);
      i = __processHookParams(value, res, xs, i);
    }
    ((i)++);
  }
  return (hooked ? (res)[(res.length - 1)] : res);
});

var rawList = (function(forms) {
  var name = (forms)[0],
    jsName = jsSymbol(name),
    macro = findMacro(jsName);
  // (check-call name (forms.slice 1));
  if ((typeof(name) === "undefined")) {
    return "null";
  } else if (macro) {
    return macro.apply(this, forms.slice(1));
  } else {
    return findMacro("_call").apply(this, forms);
  }
});

var rawListDeep = (function(token) {
  var ls = token;
  while (list__QUERY(ls)) {
    ls = rawList(processHooks(ls));
  }
  return ls;
});

var rawComment = (function(string) {
  return string.replace((new RegExp("^;+", undefined)), "//");
});

var rawQuotedString = (function(string) {
  return string.split("\n").join("\\n\" +\n\"");
});

var rawLiteral = (function(token, role) {
  // try to resolve every literal that isn't definition of new symbol or;
  // function arg via active logos rules;
  var resolved = (((role !== "def") && (role !== "arg")) ? verifyForm(token).form : token);
  // convert def literals in compiler to generate source maps also;
  if ((token !== resolved)) {
    return raw(resolved, role);
  } else if ((role === "def")) {
    return token;
  } else {
    return jsLiteral(tokenValue_(resolved));
  }
});

var rawString = (function(string, role, token) {
  if (literal__QUERY(string)) {
    return rawLiteral((token || string), role);
  } else if (quoted__QUERY(string)) {
    return rawQuotedString(string) /*logos:1*/ ;
  } else if (comment__QUERY(string)) {
    return rawComment(string) /*logos:1*/ ;
  } else {
    return string;
  }
});

var raw = (function(item, role) {
  var value = tokenValue_(item);
  if ((typeof(value) === "undefined")) {
    return value;
  } else if (fragment__QUERY(value)) {
    return value;
  } else if (list__QUERY(value)) {
    return rawListDeep(value);
  } else if ((typeof(value) === "string")) {
    return rawString(value, role, item);
  } else if ((typeof(value) === "number")) {
    return value;
  } else {
    throw (new Error(("Unknown token: " + inspect(item) + "\ntype: " + typeof(item) + "  token?: " + token__QUERY(item) + "\nvalue: " + inspect(value))));
  }
});

var setRawCtx = (function(x) {
  _env_.rawCtx = x;
});

var expr = (function(form, role) {
  setRawCtx("expr");
  return raw(form, role);
});

var stmt = (function(form) {
  setRawCtx("stmt");
  var frag = raw(form),
    end = (function() {
    if ((typeof(frag) === "undefined")) {
      return null;
    } else if (listLiteral__QUERY(form)) {
      return null;
    } else if (hash__QUERY(form)) {
      return null;
    } else if (quoted__QUERY(form)) {
      return null;
    } else if (!frag.meta) {
      return ";\n";
    } else if (frag.meta.block) {
      return "\n";
    } else if (frag.meta.inlineBlock) {
      return null;
    } else if (frag.meta.virtual) {
      return null;
    } else {
      return ";\n";
    }
  })();
  if (end) {
    // we may have raw string here;
    if (!fragment__QUERY(frag)) {
      frag = cdata(frag);
    }
    frag.data.push(end);
  }
  return frag;
});

var rtrn = (function(form) {
  setRawCtx("rtrn");
  var frag = raw(form),
    meta = (frag && frag.meta);
  if ((typeof(frag) === "undefined")) {
    return frag;
  } else if ((meta && (meta.block || meta.virtual || meta.dontReturn))) {
    return frag;
  } else if (fragment__QUERY(frag)) {
    return frag.unshift("return ");
  } else {
    return cdata("return ", frag);
  }
});

var lastStmt = (function(form) {
  setRawCtx("lastStmt");
  return raw(form);
});

var cdataStmts = (function(forms) {
  return cdataMap(forms, stmt);
});

metajs.raw = raw;

        


var jsLiteral = (function(token) {
  return token.replace(/^\-([a-zA-Z])/, "__$1").replace(/\*/g, "_").replace(/\?$/, "__QUERY").replace(/!$/, "__BANG").replace(/-([\w])/g, (function(match, p1) {
    return p1.toUpperCase();
  }));
});

var jsSymbol = (function(form) {
  var value = tokenValue_(form);
  if (literal__QUERY(value)) {
    return jsLiteral(value);
  } else {
    return value;
  }
});

var writeToken = (function(token, env) {
  var name = tokenValue_(token),
    jsName = ((typeof(name) === "string") ? jsLiteral(name) : name);
  if (env.sourceMap) {
    env.sourceMap.push({
      name: name,
      offset: env.offset,
      source: token.sourceStr()
});
  }
  return env.js.push(jsName);
});

// rebindable in the compiler environment;

var _env_;

var makeEnv = (function(indent, sourceMap) {
  indent = ((typeof(indent) === "undefined") ? "  " : indent);
  return {
    js: [],
    offset: 0,
    indent: indent,
    _indent: "",
    sourceMap: [],
    rawCtx: null
};
});

var indentRaw = (function(raw, env) {
  if (raw.match(/^[^\"\'\/]*\}/)) {
    env._indent = env._indent.slice(env.indent.length, undefined);
  }
  if (_env_.newLine) {
    pushJs(env, env._indent);
    _env_.newLine = false;
  }
  pushJs(env, raw);
  if (raw.match(/\n$/)) {
    _env_.newLine = true;
  }
  if (raw.match(/^[^\"\'\/]*\{/)) {
    env._indent = (env._indent + env.indent);
  }
});

var writeRawString = (function(raw, env) {
  if (env.indent) {
    return indentRaw(raw, env) /*logos:2*/ ;
  } else {
    return pushJs(env, raw);
  }
});

var writeRaw = (function(raw, env) {
  if ((typeof(raw) === "string")) {
    return writeRawString(raw, env) /*logos:2*/ ;
  } else if (((typeof(raw) === "number") || (typeof(raw) === "boolean"))) {
    return env.js.push(raw);
  } else if (token__QUERY(raw)) {
    return writeToken(raw, env) /*logos:1*/ ;
  } else if (fragment__QUERY(raw)) {
    return map(raw.data, (function(__ArG_1) {
      return writeRaw(__ArG_1, env);
    }));
  } else if ((typeof(raw) === "undefined")) {
    return 0;
  } else {
    throw (new Error(("Unknown raw, type: " + typeof(raw) + ", value: " + raw + ".")));
  }
});

var pushJs = (function(env, x) {
  return env.js.push(x);
});

var compileRaw = (function(raw) {
  return (function() {
    var env = makeEnv();
    writeRaw(raw, env);
    return join("", env.js);
  })();
});

var evalExpr = (function(form) {
  return eval(compileRaw(expr(form)));
});

var significantRaw__QUERY = (function(raw) {
  if (((typeof(raw) !== "undefined") && (!(typeof(raw) === "string") || raw.trim))) {
    return true;
  } else {
    return false;
  }
});

var compile = (function(forms) {
  return (function() {
    var G__7 = _env_;
    return (function() {
      try {
        _env_ = makeEnv();
        forms.forEach((function(form) {
          return (function() {
            var it = stmt(form);
            if ((typeof(it) !== "undefined")) {
              writeRaw(it, _env_);
              return writeRaw("\n", _env_);
            }
          })();
        }));
        return join("", _env_.js);
      } finally {
        _env_ = G__7;
      }
    })();
  })();
});

var compileOne = (function(form) {
  return (function() {
    var G__8 = _env_;
    return (function() {
      try {
        _env_ = makeEnv();
        (function() {
          var it = raw(form);
          if ((typeof(it) !== "undefined")) {
            return writeRaw(it, _env_);
          }
        })();
        return join("", _env_.js);
      } finally {
        _env_ = G__8;
      }
    })();
  })();
});

var translate = (function(text) {
  // FIX: use *env*.lint-error-count;
  var prevErrorCount = lintErrorCount;
  return (function() {
    var G__9 = compile(read(text));
    if ((lintErrorCount > prevErrorCount)) {
      throw (new LintError(lintReport(), (lintErrorCount - prevErrorCount)));
    }
    return G__9;
  })();
});

var resetState = (function() {
  /* Reset state of the root scope of the compiler and don't touch global scope. */
  resetLint();
  return resetScope();
});

setScopeMacro("include", null, (function(file) {
  /* This macro depends on metajs.include that platform (node or browser) should implement. */
  return withMeta({virtual: true}, cdata(metajs.include(evalExpr(file))));
}));

setScopeMacro("use", null, (function(file) {
  /* Include file if it was not included early (or use early included). */
  return withMeta({virtual: true}, cdata(metajs.include(evalExpr(file), true)));
}));

(function() {
  var G__10 = metajs;
  G__10.compile = compile;
  G__10.translate = translate;
  G__10.jsLiteral = jsLiteral;
  G__10.jsSymbol = jsSymbol;
  G__10.resetState = resetState;
})();

          
var passes = 0,
    fails = 0;

var green = (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return ("\033[32m" + join("", args) + "\033[0m");
});

var red = (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return ("\033[31m" + join("", args) + "\033[0m");
});

var logAssertContext = (function(evaluated, message, ctx, full) {
  full = ((typeof(full) === "undefined") ? false : full);
  var summary = ("Assert failed: " + message);
  console.error(summary);
  console.error(ctx.assertion, "at", ctx.path);
  (function() {
    var it = ctx.resolvedParams;
    if (it) {
      return it.forEach((function(arg, i) {
        if (full) {
          console.log((ctx.quotedParams)[i], "-->");
        }
        return console.log(arg);
      }));
    }
  })();
  return summary;
});

metajs.throwHandler = (function(evaluated, message, ctx) {
  if (!evaluated) {
    var summary = logAssertContext(evaluated, message, ctx) /*logos:3*/ ;
    throw (new Error((summary + " " + ctx.assertion + " at " + ctx.path)));
  }
});

var logCurrentStack = (function() {
  return console.log((new Error()).stack.replace(/Error.*/, ""));
});

metajs.testHandler = (function(evaluated, message, ctx) {
  if (evaluated) {
    ((passes)++);
    return metajs.pr(green("."));
  } else {
    ((fails)++);
    metajs.pr((red("F") + " #" + (passes + fails) + "\n"));
    return logAssertContext(evaluated, message, ctx) /*logos:3*/ ;
  }
});

metajs.printTestingState = (function() {
  return console.log(("\nExecuted " + (passes + fails) + " tests, " + green(passes, " passed") + ", " + red(fails, " failed.")));
});

            
metajs._assert_ = "exception";

metajs.AssertError = (function(message, assertion, path, resolvedParams) {
  this.message = message;
  this.assertion = assertion;
  return this;
});

metajs.AssertError.prototype = (new Error());

metajs.deepEqual__QUERY = (function(actual, expected) {
  if ((actual === expected)) {
    return true;
  } else if ((list__QUERY(expected) && list__QUERY(actual))) {
    return (function() {
      var index = 0,
    diff;
      while (!((expected.length === index) || diff)) {
        if (!metajs.deepEqual__QUERY((actual)[index], (expected)[index])) {
          diff = true;
        }
        ((index)++);
      }
      return !diff;
    })();
  } else if (((expected && ((expected).constructor.name === "Object")) && (actual && ((actual).constructor.name === "Object")))) {
    return (function() {
      var diff;
      Object.keys(expected).forEach((function(key) {
        if (!metajs.deepEqual__QUERY((expected)[key], (actual)[key])) {
          diff = true;
        }
      }));
      return !diff;
    })();
  } else {
    return false;
  }
});

var formSource = (function(form) {
  var token = firstToken(form);
  return prnStr_((function() {
    if (token) {
      return token.sourceStr();
    } else {
      return "unknown";
    }
  })());
});

setScopeMacro("letAssert_", null, (function(x, handler) {
  var form = (list__QUERY(x) ? x : ["bool", x]),
    params = form.slice(1),
    args = map(params, (function(__ArG_1, __ArG_2) {
    return ("p" + __ArG_2);
  }));
  return metajs.mergeSq(["let_", metajs.mergeSq([["unquote-splicing", zip_(args, params)]]), metajs.mergeSq(["def", "evaluated", metajs.mergeSq([(form)[0], ["unquote-splicing", args]]), "ctx", metajs.mergeSq(["hash", metajs.mergeSq(["quote", "path"]), formSource(params), metajs.mergeSq(["quote", "assertion"]), prnStr_(form), metajs.mergeSq(["quote", "quotedParams"]), metajs.mergeSq(["list", ["unquote-splicing", map(params, (function(__ArG_1) {
    return prnStr_(__ArG_1);
  }))]]), metajs.mergeSq(["quote", "resolvedParams"]), metajs.mergeSq(["list", ["unquote-splicing", args]])])]), handler]);
}));

setScopeMacro("assertError", null, (function(message, assertion, path) {
  return metajs.mergeSq(["throw", metajs.mergeSq(["str", "\"Assert failed: \"", (message || "\"\""), "\" \"", assertion, "\" at \"", path])]);
}));

setScopeMacro("assert", null, (function(x, message) {
  /* If *assert* is false don't output any code. Otherwise evaluate x and delegate evaluated result\n" +
"to metajs.*assert-handler*. */
  if (metajs._assert_) {
    return metajs.mergeSq(["letAssert_", x, metajs.mergeSq(["if", metajs.mergeSq(["and", "metajs", "metajs._assertHandler_"]), metajs.mergeSq(["_call", "metajs._assertHandler_", "evaluated", (message || "\"\""), "ctx"]), metajs.mergeSq(["when", metajs.mergeSq(["not", "evaluated"]), metajs.mergeSq(["assertError", message, "ctx.assertion", "ctx.path"])])])]);
  }
}));

setScopeMacro("asserts", null, (function() {
  /* Convert expressions with optional messages to list of asserts. */
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  var ls = [];
  xs.forEach((function(x) {
    if (quoted__QUERY(x)) {
      return (ls)[(ls.length - 1)].push(x);
    } else {
      return ls.push(["assert", x]);
    }
  }));
  return metajs.mergeSq(["statements", ["unquote-splicing", ls]]);
}));

setScopeMacro("assertBy2", null, (function(func) {
  var xs = Array.prototype.slice.call(arguments, 1, undefined);
  (function(p0) {
    var evaluated = ((p0 % 2) === 0),
    ctx = {
      "path": "/home/dogada/projects/MJS/src/assert.mjs:70:17",
      "assertion": "(even? xs.length)",
      "quotedParams": ["xs.length"],
      "resolvedParams": [p0]
};
    if ((metajs && metajs._assertHandler_)) {
      return metajs._assertHandler_(evaluated, "", ctx);
    } else {
      if (!evaluated) {
        throw (new Error(("Assert failed: " + "" + " " + ctx.assertion + " at " + ctx.path)));
      }
    }
  })(xs.length);
  return (function() {
    var ls = bulkMap(xs, (function(__ArG_1, __ArG_2) {
      return ["assert", [func, __ArG_1, __ArG_2]];
    }));
    return metajs.mergeSq(["statements", ["unquote-splicing", ls]]);
  })();
}));

setScopeMacro("assert_", null, (function(x, message) {
  /* Classical assert without argument parsing. */
  if (metajs._assert_) {
    var assertion = prnStr_(x),
    token = firstToken(x),
    path = prnStr_((function() {
      if (token) {
        return token.sourceStr();
      } else {
        return "";
      }
    })());
    return metajs.mergeSq(["statements", metajs.mergeSq(["if", metajs.mergeSq(["and", "metajs", "metajs._assertHandler_"]), metajs.mergeSq(["_call", "metajs._assertHandler_", x, (message || "\"\""), metajs.mergeSq(["hash", metajs.mergeSq(["quote", "path"]), path, metajs.mergeSq(["quote", "assertion"]), assertion])]), metajs.mergeSq(["when", metajs.mergeSq(["not", x]), metajs.mergeSq(["assertError", message, assertion, path])])])]);
  }
}));

setScopeMacro("assertEq", null, (function(actual, expected, message) {
  return metajs.mergeSq(["assert", metajs.mergeSq(["=", actual, expected])]);
}));

setScopeMacro("assertEq_", null, (function(actual, expected) {
  return metajs.mergeSq(["assert", metajs.mergeSq(["metajs.deepEqual__QUERY", actual, expected])]);
}));

setScopeMacro("assertNot", null, (function(x) {
  return metajs.mergeSq(["assert", metajs.mergeSq(["not", x])]);
}));

setScopeMacro("assertDefined", null, (function() {
  /* Chech that all passed arguments are defined. */
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  return metajs.mergeSq(["statements", ["unquote-splicing", map(xs, (function(__ArG_1) {
    return ["assert_", ["defined__QUERY", __ArG_1]];
  }))]]);
}));

setScopeMacro("assertTrue", null, (function(actual, message) {
  return metajs.mergeSq(["assertEq", actual, "true"]);
}));

setScopeMacro("assertFalse", null, (function(actual, message) {
  return metajs.mergeSq(["assertEq", actual, "false"]);
}));

setScopeMacro("assertMatch", null, (function(regex, thing, message) {
  return metajs.mergeSq(["assert", metajs.mergeSq(["match", regex, thing])]);
}));

setScopeMacro("tryAssert", null, (function(x, res) {
  return metajs.mergeSq(["assertEq", metajs.mergeSq(["try", x, metajs.mergeSq(["catch", "e", metajs.mergeSq(["e.toString"])])]), res]);
}));

setScopeMacro("assertJs", null, (function(metajsCode, jsCode) {
  return metajs.mergeSq(["assertEq", metajs.mergeSq(["try", metajs.mergeSq([metajs.mergeSq(["metajs.translate", metajsCode]), ".trim"]), metajs.mergeSq(["catch", "e", metajs.mergeSq(["e.toString"])])]), jsCode]);
}));

setScopeMacro("assertJs_", null, (function(metajsCode, jsPrefix) {
  return metajs.mergeSq(["assert", metajs.mergeSq(["!=", metajs.mergeSq([metajs.mergeSq(["try", metajs.mergeSq([metajs.mergeSq(["metajs.translate", metajsCode]), ".trim"]), metajs.mergeSq(["catch", "e", metajs.mergeSq(["e.toString"])])]), ".indexOf", jsPrefix]), -1])]);
}));

            
var destruct = (function(binding, expander) {
  return merge(bulkMap(binding, expander));
});

var expandVectorBind = (function(names, value, expander) {
  return map(names, (function(name, i) {
    return expander(name, (function() {
      if ((valueLiteral__QUERY(value) || (typeof(value) === "undefined"))) {
        return value;
      } else {
        return metajs.mergeSq(["nth", value, i]);
      }
    })());
  }));
});

var expandSet = (function(name, value) {
  if (listLiteral__QUERY(name)) {
    return merge(expandVectorBind(name.slice(1), value, expandSet));
  } else if ((literal__QUERY(name) || list__QUERY(name))) {
    return [name, value];
  } else {
    return syntaxError(("Unsupported left part of set: " + pr1(name)), name);
  }
});

var expandDef = (function(name, value) {
  if (listLiteral__QUERY(name)) {
    return merge(expandVectorBind(name.slice(1), value, expandDef));
  } else if (literal__QUERY(name)) {
    return [name, value];
  } else {
    return syntaxError(("Unsupported left part of def: " + pr1(name)), name);
  }
});

var bindSet = (function(name, value) {
  return cdata(expr(name), " = ", expr(value));
});

var bindDef = (function(name, value) {
  addScopeSymbol(name);
  if ((typeof(value) === "undefined")) {
    return cdata(expr(name, "def"));
  } else {
    return cdata(expr(name, "def"), " = ", expr(value));
  }
});

var nextId = (function() {
  ((metajs.lastId)++);
  return metajs.lastId;
});

var gensym = (function(prefix) {
  /* Returns a new symbol with a unique name. */
  prefix = ((typeof(prefix) === "undefined") ? "G__" : prefix);
  return (new Token((prefix + nextId())));
});

            
setScopeMacro("defmacro", null, (function(name, params) {
  var code = Array.prototype.slice.call(arguments, 2, undefined);
  var args = transformArgs(params),
    rawJs = raw(metajs.mergeSq(["fn", params, ["unquote-splicing", code]])),
    jsName = jsSymbol(name),
    jsStr = compileRaw(rawJs),
    macro = (function() {
    try {
      return eval(jsStr);
    } catch (e) {
      return syntaxError(("error " + e + " in parsing macro " + tokenValue_(name) + ":\n" + jsStr), name);
    }
  })();
  if (metajs.bootstrapMode) {
    return metajs.mergeSq(["_call", "setScopeMacro", metajs.mergeSq(["quote", name]), "null", rawJs]);
  } else {
    setScopeMacro(jsName, args, macro);
    return undefined;
  }
}));

var getFnSignature = (function(verified) {
  var signature = (verified.def || (verified.entity && verified.entity.extra));
  if (list__QUERY(signature)) {
    return signature;
  } else {
    return undefined;
  }
});

setScopeMacro("_call", null, (function(fnName) {
  /* Internal macro. Generate string with function call. */
  var args = Array.prototype.slice.call(arguments, 1, undefined);
  var verified = verifyForm(fnName, fnName),
    signature = getFnSignature(verified),
    resolvedArgs = checkCallParams(fnName, args, signature),
    resolved = (resolvedArgs.length - args.length);
  return cdata(expr(verified.form), "(", interpose(", ", map(resolvedArgs, (function(__ArG_1) {
    return expr(__ArG_1);
  }))), ")", (function() {
    if (resolved) {
      return (" /*logos:" + resolved + "*/ ");
    } else {
      return "";
    }
  })());
}));

setScopeMacro("list", null, (function() {
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  return cdata("[", interpose(", ", map(xs, expr)), "]");
}));

setScopeMacro("def", null, (function() {
  var binding = Array.prototype.slice.call(arguments, 0, undefined);
  return withMeta({dontReturn: true}, cdata("var ", interpose(",\n    ", bulkMap(destruct(binding, expandDef), bindDef))));
}));

setScopeMacro("get", null, (function(obj, key) {
  var jsId = (quote__QUERY(key) && jsSymbol((key)[1]));
  if (validJsId__QUERY(jsId)) {
    return cdata(expr(obj), ".", expr(jsId, "def"));
  } else {
    return metajs.mergeSq(["js", "\"(%)[%]\"", obj, key]);
  }
}));

setScopeMacro(".", null, (function(x, y) {
  var more = Array.prototype.slice.call(arguments, 2, undefined);
  if ((more.length === 0)) {
    return metajs.mergeSq(["get", x, y]);
  } else {
    return metajs.mergeSq([".", metajs.mergeSq([".", x, y]), ["unquote-splicing", more]]);
  }
}));

setScopeMacro("instanceof__QUERY", null, (function(x, type) {
  return metajs.mergeSq(["js", "\"(% instanceof %)\"", x, type]);
}));

setScopeMacro("safeProp", null, (function(obj, name) {
  return metajs.mergeSq(["js", "\"(%).%\"", obj, name]);
}));

setScopeMacro("prop", null, (function(obj, name) {
  return metajs.mergeSq(["js", "\"%.%\"", obj, name]);
}));

setScopeMacro("nth", null, (function(seq, index) {
  return metajs.mergeSq(["js", "\"(%)[%]\"", seq, index]);
}));

setScopeMacro("_set", null, (function(sym, value) {
  return cdata(expr(sym), " = ", expr(value));
}));

setScopeMacro("set", null, (function() {
  var binding = Array.prototype.slice.call(arguments, 0, undefined);
  (function(p0) {
    var evaluated = ((p0 % 2) === 0),
    ctx = {
      "path": "/home/dogada/projects/MJS/src/javascript.mjs:62:17",
      "assertion": "(even? binding.length)",
      "quotedParams": ["binding.length"],
      "resolvedParams": [p0]
};
    if ((metajs && metajs._assertHandler_)) {
      return metajs._assertHandler_(evaluated, "Set require even number of bindings.", ctx);
    } else {
      if (!evaluated) {
        throw (new Error(("Assert failed: " + "Set require even number of bindings." + " " + ctx.assertion + " at " + ctx.path)));
      }
    }
  })(binding.length);
  return cons("statements", bulkMap(destruct(binding, expandSet), (function(__ArG_1, __ArG_2) {
    return ["_set", __ArG_1, __ArG_2];
  })));
}));

setScopeMacro("setIn", null, (function(obj) {
  var kvs = Array.prototype.slice.call(arguments, 1, undefined);
  return cons("statements", bulkMap(kvs, (function(__ArG_1, __ArG_2) {
    return ["_set", ["get", obj, __ArG_1], __ArG_2];
  })));
}));

setScopeMacro("_del", null, (function(obj) {
  return withMeta({dontReturn: true}, cdata("delete ", expr(obj)));
}));

setScopeMacro("del", null, (function() {
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  return cons("statements", map(xs, (function(__ArG_1) {
    return ["_del", __ArG_1];
  })));
}));

setScopeMacro("str", null, (function() {
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  return cdata("(", interpose(" + ", map(xs, expr)), ")");
}));

setScopeMacro("new", null, (function(constructor) {
  var args = Array.prototype.slice.call(arguments, 1, undefined);
  return metajs.mergeSq(["js", "\"(new %)\"", metajs.mergeSq(["_call", constructor, ["unquote-splicing", args]])]);
}));

setScopeMacro("hash", null, (function() {
  var pairs = Array.prototype.slice.call(arguments, 0, undefined);
  (function(p0) {
    var evaluated = ((p0 % 2) === 0),
    ctx = {
      "path": "/home/dogada/projects/MJS/src/javascript.mjs:82:17",
      "assertion": "(even? pairs.length)",
      "quotedParams": ["pairs.length"],
      "resolvedParams": [p0]
};
    if ((metajs && metajs._assertHandler_)) {
      return metajs._assertHandler_(evaluated, "", ctx);
    } else {
      if (!evaluated) {
        throw (new Error(("Assert failed: " + "" + " " + ctx.assertion + " at " + ctx.path)));
      }
    }
  })(pairs.length);
  var kvs = bulkMap(pairs, (function(key, value) {
    return cdata(expr(key, "arg"), ": ", expr(value));
  }));
  if ((kvs.length < 2)) {
    return cdata("{", interpose(", ", kvs), "}");
  } else {
    return cdata("{\n", interpose(",\n", kvs), "\n}");
  }
}));

var _ifStmt = (function(forms, rawCtx) {
  /* Make if/else statement cdata. */
  (function(p0, p1) {
    var evaluated = (p0 >= p1),
    ctx = {
      "path": "/home/dogada/projects/MJS/src/javascript.mjs:92:14",
      "assertion": "(>= forms.length 2)",
      "quotedParams": ["forms.length", "2"],
      "resolvedParams": [p0, p1]
};
    if ((metajs && metajs._assertHandler_)) {
      return metajs._assertHandler_(evaluated, "", ctx);
    } else {
      if (!evaluated) {
        throw (new Error(("Assert failed: " + "" + " " + ctx.assertion + " at " + ctx.path)));
      }
    }
  })(forms.length, 2);
  var mapper = (function(x) {
    if ((rawCtx === "stmt")) {
      return x;
    } else {
      return ["maybeReturn", x];
    }
  }),
    lines = bulkMap(forms, (function(x, y) {
    return (function() {
      var line = [stmt(["_inlineBlock", mapper((y || x))])];
      if (y) {
        line.unshift("if (", expr(x), ") ");
      }
      return cdata.apply(this, line);
    })();
  }));
  return interpose(" else ", lines);
});

setScopeMacro("if", null, (function() {
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  var rawCtx = _env_.rawCtx,
    stmts = _ifStmt(xs, rawCtx);
  return (function() {
    switch (rawCtx) {
      case "rtrn":
      case "stmt": return withMeta({block: true}, stmts);
      default: return cdata("(function() {\n", stmts, "\n", "})()");
      }
  })();
}));

setScopeMacro("if_", null, (function(condition, ok, fail) {
  /* Experemental. Temporary ternary form of if. Will be integrated into main if form. */
  return metajs.mergeSq(["js", "\"(% ? % : %)\"", condition, ok, (fail || "undefined")]);
}));

setScopeMacro("while", null, (function(condition) {
  var code = Array.prototype.slice.call(arguments, 1, undefined);
  return withMeta({block: true}, cdata("while (", expr(condition), ") {\n", cdataStmts(code), "}"));
}));

var parseCase_ = (function(left, right) {
  if ((typeof(right) === "undefined")) {
    return [["_default", ["do_", left]]];
  } else if (quote__QUERY(left)) {
    return parseCase_(quote_((left)[1]), right);
  } else if (listLiteral__QUERY(left)) {
    return parseCase_(left.slice(1, undefined), right);
  } else if (list__QUERY(left)) {
    return concat(map(left.slice(0, -1), (function(label) {
      return ["_case", label];
    })), [["_case", (left)[(left.length - 1)], ["do_", right]]]);
  } else {
    return [["_case", left, ["do_", right]]];
  }
});

setScopeMacro("_switch", null, (function(e) {
  /* Internal macro. Don't call. */
  var cases = Array.prototype.slice.call(arguments, 1, undefined);
  return withMeta({block: true}, cdata("switch (", expr(e), ") {\n", cdataMap(cases, expr), "}"));
}));

setScopeMacro("switch", null, (function(e) {
  var cases = Array.prototype.slice.call(arguments, 1, undefined);
  (function(p0) {
    var evaluated = (!!p0),
    ctx = {
      "path": "/home/dogada/projects/MJS/src/javascript.mjs:132:11",
      "assertion": "(bool e)",
      "quotedParams": ["e"],
      "resolvedParams": [p0]
};
    if ((metajs && metajs._assertHandler_)) {
      return metajs._assertHandler_(evaluated, "", ctx);
    } else {
      if (!evaluated) {
        throw (new Error(("Assert failed: " + "" + " " + ctx.assertion + " at " + ctx.path)));
      }
    }
  })(e);
  (function(p0) {
    var evaluated = (p0.length > 0),
    ctx = {
      "path": "/home/dogada/projects/MJS/src/javascript.mjs:133:23",
      "assertion": "(not-empty? cases)",
      "quotedParams": ["cases"],
      "resolvedParams": [p0]
};
    if ((metajs && metajs._assertHandler_)) {
      return metajs._assertHandler_(evaluated, "", ctx);
    } else {
      if (!evaluated) {
        throw (new Error(("Assert failed: " + "" + " " + ctx.assertion + " at " + ctx.path)));
      }
    }
  })(cases);
  return metajs.mergeSq(["scoped", metajs.mergeSq(["_switch", e, ["unquote-splicing", merge(bulkMap(cases, parseCase_))]])]);
}));

setScopeMacro("_case", null, (function(x, y) {
  /* Internal macro. Don't call. */
  if ((typeof(y) !== "undefined")) {
    return metajs.mergeSq(["js", "\"case %: %\"", x, y]);
  } else {
    return metajs.mergeSq(["js", "\"case %:\n\"", x]);
  }
}));

setScopeMacro("_default", null, (function(e) {
  /* Internal macro. Don't call. */
  return metajs.mergeSq(["js", "\"default: %\"", e]);
}));

setScopeMacro("literal", null, (function(x) {
  return stripDoubleQuotes(x);
}));

setScopeMacro("try", null, (function() {
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  var finallyForm = (function() {
    if (listName__QUERY((xs)[(xs.length - 1)], "finally")) {
      return xs.pop();
    }
  })(),
    catchForm = (function() {
    if (listName__QUERY((xs)[(xs.length - 1)], "catch")) {
      return xs.pop();
    }
  })();
  return metajs.mergeSq(["scoped", metajs.mergeSq(["_try", metajs.mergeSq(["do", ["unquote-splicing", xs]]), catchForm, finallyForm])]);
}));

setScopeMacro("_try", null, (function(code, catchForm, finallyForm) {
  if ((!catchForm && !finallyForm)) {
    syntaxError("At least catch or finally must be provided.", code);
  }
  var params = ["try {\n", rtrn(code), "}"];
  if (catchForm) {
    startScope("catch");
    addScopeSymbol((catchForm)[1]);
    params.push(" catch (", expr((catchForm)[1]), ") {\n", rtrn(metajs.mergeSq(["do", ["unquote-splicing", catchForm.slice(2, undefined)]])), "}");
    finishScope();
  }
  if (finallyForm) {
    params.push(" finally {\n", stmt(metajs.mergeSq(["do", ["unquote-splicing", finallyForm.slice(1, undefined)]])), "}");
  }
  return withMeta({block: true}, cdata.apply(this, params));
}));

setScopeMacro("inc", null, (function(num) {
  return metajs.mergeSq(["js", "\"((%)++)\"", num]);
}));

setScopeMacro("dec", null, (function(num) {
  return metajs.mergeSq(["js", "\"((%)--)\"", num]);
}));

setScopeMacro("throw_", null, (function(x) {
  return withMeta({dontReturn: true}, cdata("throw ", expr(x)));
}));

setScopeMacro("throw", null, (function(cls, message) {
  if ((typeof(message) !== "undefined")) {
    return metajs.mergeSq(["throw_", metajs.mergeSq(["new", cls, message])]);
  } else {
    return metajs.mergeSq(["throw_", metajs.mergeSq(["new", "Error", cls])]);
  }
}));

setScopeMacro("bool", null, (function(x) {
  return metajs.mergeSq(["js", "\"(!!%)\"", x]);
}));

setScopeMacro("statements", null, (function() {
  var code = Array.prototype.slice.call(arguments, 0, undefined);
  return withMeta({virtual: true}, cdataMap(code, stmt));
}));

var insertMaybeReturn = (function(body) {
  if ((body.length > 0)) {
    return (function() {
      var end = (body.length - 1);
      (body)[end] = ["maybeReturn", (body)[end]];
    })();
  }
});

setScopeMacro("do", null, (function() {
  /* Eval body and return result of last expession if parent form expects it. */
  var body = Array.prototype.slice.call(arguments, 0, undefined);
  if ((_env_.rawCtx === "rtrn")) {
    insertMaybeReturn(body);
  }
  return withMeta({virtual: true}, cdataStmts(body));
}));

setScopeMacro("do_", null, (function() {
  /* Internal macro. Always add maybe-return. Should be used in root scopes like fn. */
  var body = Array.prototype.slice.call(arguments, 0, undefined);
  insertMaybeReturn(body);
  return withMeta({virtual: true}, cdataStmts(body));
}));

setScopeMacro("_block", null, (function() {
  /* One or more statements in curly brackets. */
  var forms = Array.prototype.slice.call(arguments, 0, undefined);
  return (function() {
    var stmts = cdataStmts(forms);
    return withMeta({block: true}, cdata("{\n", stmts, "}"));
  })();
}));

setScopeMacro("_inlineBlock", null, (function() {
  /* Block of code that don't force new line (like in if/else). */
  var forms = Array.prototype.slice.call(arguments, 0, undefined);
  return withMeta({inlineBlock: true}, cdata("{\n", cdataStmts(forms), "}"));
}));

setScopeMacro("maybeReturn", null, (function(x) {
  /* Return x if x can be translated to javascript expression. Never return statements (throw, def, while, etc). */
  return rtrn(x);
}));

setScopeMacro("comment", null, (function() {
  var contents = Array.prototype.slice.call(arguments, 0, undefined);
  var str = prnStr(contents);
  return withMeta({
    dontReturn: true,
    block: true
}, cdata("/* ", str, " */"));
}));

var __macro = (function() {
  /* Apply macro and return fragment. */
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return expr(args);
});

setScopeMacro("__return", null, (function(x) {
  /* Don't use it. Emit unconditional javascript return statement. Makes it easy to shoot yourself in the foot. */
  return withMeta({dontReturn: true}, cdata("return ", expr(x)));
}));

            
setScopeMacro("fn", null, (function(params) {
  var body = Array.prototype.slice.call(arguments, 1, undefined);
  var args = transformArgs(params),
    signature = buildSignature(args),
    fullBody;
  startScope(signature).setVars(args);
  fullBody = fnBody(args, body);
  finishScope();
  return cdata("(function(", signature, ") {\n", fullBody, "})");
}));

setScopeMacro("defn", null, (function(fnName, params) {
  var code = Array.prototype.slice.call(arguments, 2, undefined);
  var args = transformArgs(params),
    name_ = tokenValue_(fnName),
    prefix = ((name_.indexOf(".") !== -1) ? "set" : "def"),
    ast = metajs.mergeSq([prefix, fnName, metajs.mergeSq(["fn", params, ["unquote-splicing", code]])]),
    rawStatement = raw(ast);
  getScope().setFn(name_, args);
  return rawStatement;
}));

var buildSignature = (function(args) {
  var positional = filter(args, (function(arg) {
    return ("rest" !== arg.presence);
  }));
  return join(", ", map(positional, (function(arg) {
    return expr(arg.name, "arg");
  })));
});

var fnSignature = (function(fnName, args) {
  return (fnName + "/" + args.length);
});

var getMetaDefault = (function(meta) {
  if (!symbol__QUERY((meta)[(meta.length - 1)])) {
    return (meta)[(meta.length - 1)];
  }
});

var argPresence = (function(token) {
  var meta = getMeta(token) /*logos:1*/ ;
  return (((meta.length > 0) && ((meta.indexOf("?") !== -1) || (typeof(getMetaDefault(meta) /*logos:1*/ ) !== "undefined"))) ? "optional" : "required");
});

var transformArgs = (function(arglist) {
  var args = [],
    last,
    value;
  arglist.forEach((function(token) {
    value = tokenValue_(token);
    if ((value !== "&")) {
      args.push({
        type: "arg",
        name: value,
        token: token,
        presence: ((last === "&") ? "rest" : argPresence(token) /*logos:1*/ ),
        defaultValue: getMetaDefault(getMeta(token) /*logos:1*/ )
});
    }
    last = value;
  }));
  if (((last === "&") || (filter(args, (function(arg) {
    return (arg.presence === "rest");
  })).length > 1))) {
    syntaxError(("unexpected '&' in signature"), (arglist)[(arglist.length - 1)]);
  }
  return args;
});

var fnVars = (function(args) {
  var rest = (filter(args, (function(arg) {
    return ("rest" === arg.presence);
  })))[0],
    positional = (args.length - 1);
  if (rest) {
    return metajs.mergeSq(["def", rest.name, metajs.mergeSq(["slice_", "arguments", positional])]);
  }
});

var fnDefaults = (function(args) {
  var withDefault = filter(args, (function(arg) {
    return (typeof(arg.defaultValue) !== "undefined");
  })),
    defaults = merge(map(withDefault, (function(arg) {
    return [arg.name, ["if*", ["undefined?", arg.name], arg.defaultValue, arg.name]];
  })));
  if ((defaults.length > 0)) {
    return metajs.mergeSq(["set", ["unquote-splicing", defaults]]);
  }
});

var docString = (function(x) {
  return cdata("/* ", stripDoubleQuotes((expr(x))), " */");
});

var fnBody = (function(args, body) {
  var res = [];
  (function() {
    var it = (body)[0];
    if (quoted__QUERY(it)) {
      // extract doc string;
      res.push(docString(it), "\n");
      body = body.slice(1);
    }
  })();
  res.push(cdataStmts(compact([fnVars(args) /*logos:1*/ , fnDefaults(args) /*logos:1*/ , cons("do_", body)])));
  return cdata.apply(this, res);
});

            
var multiOp = (function(op, args) {
  return cdata("(", interpose((" " + op + " "), map(args, expr)), ")");
});

setScopeMacro("+", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return multiOp("+", args);
}));

setScopeMacro("-", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return multiOp("-", args);
}));

setScopeMacro("-", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return multiOp("-", args);
}));

setScopeMacro("_", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return multiOp("*", args);
}));

setScopeMacro("/", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return multiOp("/", args);
}));

setScopeMacro("and", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return multiOp("&&", args);
}));

setScopeMacro("or", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return multiOp("||", args);
}));

setScopeMacro("mod", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return multiOp("%", args);
}));

setScopeMacro("compareOp", null, (function(op, left, right) {
  return cdata(expr(left), " ", expr(op), " ", expr(right));
}));

setScopeMacro("=", null, (function(x) {
  var more = Array.prototype.slice.call(arguments, 1, undefined);
  var left = x,
    ops = map(more, (function(__ArG_1) {
    return ["compareOp", "===", left, __ArG_1];
  }));
  return metajs.mergeSq(["and", ["unquote-splicing", ops]]);
}));

setScopeMacro("overlap", null, (function(op, args) {
  var ops = map(args.slice(0, -1), (function(left, index) {
    return metajs.mergeSq(["compareOp", metajs.mergeSq(["literal", op]), left, (args)[(1 + index)]]);
  }));
  return metajs.mergeSq(["and", ["unquote-splicing", ops]]);
}));

setScopeMacro("!=", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return metajs.mergeSq(["overlap", "\"!==\"", args]);
}));

setScopeMacro(">", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return metajs.mergeSq(["overlap", "\">\"", args]);
}));

setScopeMacro("<", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return metajs.mergeSq(["overlap", "\"<\"", args]);
}));

setScopeMacro("<=", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return metajs.mergeSq(["overlap", "\"<=\"", args]);
}));

setScopeMacro(">=", null, (function() {
  var args = Array.prototype.slice.call(arguments, 0, undefined);
  return metajs.mergeSq(["overlap", "\">=\"", args]);
}));

setScopeMacro("not", null, (function(x) {
  return metajs.mergeSq(["js", "\"!%\"", x]);
}));

setScopeMacro("pow", null, (function(base, exponent) {
  return metajs.mergeSq(["_call", "Math.pow", base, exponent]);
}));

setScopeMacro("zero__QUERY", null, (function(x) {
  return metajs.mergeSq(["=", x, 0]);
}));

setScopeMacro("odd__QUERY", null, (function(x) {
  return metajs.mergeSq(["!=", metajs.mergeSq(["mod", x, 2]), 0]);
}));

setScopeMacro("even__QUERY", null, (function(x) {
  return metajs.mergeSq(["=", metajs.mergeSq(["mod", x, 2]), 0]);
}));

setScopeMacro("function__QUERY", null, (function(x) {
  return metajs.mergeSq(["=", metajs.mergeSq(["typeof", x]), metajs.mergeSq(["quote", "function"])]);
}));

setScopeMacro("undefined__QUERY", null, (function(x) {
  return metajs.mergeSq(["=", metajs.mergeSq(["typeof", x]), metajs.mergeSq(["quote", "undefined"])]);
}));

setScopeMacro("defined__QUERY", null, (function(x) {
  return metajs.mergeSq(["!=", metajs.mergeSq(["typeof", x]), metajs.mergeSq(["quote", "undefined"])]);
}));

setScopeMacro("number__QUERY", null, (function(x) {
  return metajs.mergeSq(["=", metajs.mergeSq(["typeof", x]), metajs.mergeSq(["quote", "number"])]);
}));

setScopeMacro("string__QUERY", null, (function(x) {
  return metajs.mergeSq(["=", metajs.mergeSq(["typeof", x]), metajs.mergeSq(["quote", "string"])]);
}));

setScopeMacro("boolean__QUERY", null, (function(x) {
  return metajs.mergeSq(["=", metajs.mergeSq(["typeof", x]), metajs.mergeSq(["quote", "boolean"])]);
}));

setScopeMacro("typeofObject__QUERY", null, (function(x) {
  return metajs.mergeSq(["=", metajs.mergeSq(["typeof", x]), metajs.mergeSq(["quote", "object"])]);
}));

setScopeMacro("array__QUERY", null, (function(x) {
  return metajs.mergeSq(["and", x, metajs.mergeSq(["=", metajs.mergeSq(["safeProp", x, "constructor.name"]), metajs.mergeSq(["quote", "Array"])])]);
}));

setScopeMacro("object__QUERY", null, (function(x) {
  return metajs.mergeSq(["and", x, metajs.mergeSq(["=", metajs.mergeSq(["safeProp", x, "constructor.name"]), metajs.mergeSq(["quote", "Object"])])]);
}));

setScopeMacro("push", null, (function(x) {
  var xs = Array.prototype.slice.call(arguments, 1, undefined);
  return metajs.mergeSq([x, ".push", ["unquote-splicing", xs]]);
}));

setScopeMacro("pop", null, (function(x) {
  return metajs.mergeSq([x, ".pop"]);
}));

setScopeMacro("slice", null, (function(xs, begin, end) {
  begin = ((typeof(begin) === "undefined") ? 0 : begin);
  return metajs.mergeSq([xs, ".slice", begin, (end || "undefined")]);
}));

setScopeMacro("slice_", null, (function(xs, begin, end) {
  begin = ((typeof(begin) === "undefined") ? 0 : begin);
  return metajs.mergeSq(["_call", "Array.prototype.slice.call", xs, begin, (end || "undefined")]);
}));

setScopeMacro("length", null, (function(xs) {
  return metajs.mergeSq(["prop", xs, "length"]);
}));

setScopeMacro("empty__QUERY", null, (function(xs) {
  return metajs.mergeSq(["=", metajs.mergeSq(["length", xs]), 0]);
}));

setScopeMacro("notEmpty__QUERY", null, (function(xs) {
  return metajs.mergeSq([">", metajs.mergeSq(["length", xs]), 0]);
}));

setScopeMacro("contains__QUERY", null, (function(seq, item) {
  return metajs.mergeSq(["!=", metajs.mergeSq([seq, ".indexOf", item]), -1]);
}));

setScopeMacro("notContains__QUERY", null, (function(seq, item) {
  return metajs.mergeSq(["=", metajs.mergeSq([seq, ".indexOf", item]), -1]);
}));

setScopeMacro("containsMany__QUERY", null, (function(xs) {
  return metajs.mergeSq([">", metajs.mergeSq(["length", xs]), 1]);
}));

setScopeMacro("containsOne__QUERY", null, (function(xs) {
  return metajs.mergeSq(["=", metajs.mergeSq(["length", xs]), 1]);
}));

setScopeMacro("first", null, (function(xs) {
  return metajs.mergeSq(["nth", xs, 0]);
}));

setScopeMacro("second", null, (function(xs) {
  return metajs.mergeSq(["nth", xs, 1]);
}));

setScopeMacro("third", null, (function(xs) {
  return metajs.mergeSq(["nth", xs, 2]);
}));

setScopeMacro("last", null, (function(xs) {
  return metajs.mergeSq(["nth", xs, metajs.mergeSq(["-", metajs.mergeSq(["length", xs]), 1])]);
}));

setScopeMacro("rest", null, (function(xs) {
  return metajs.mergeSq([xs, ".slice", 1]);
}));

setScopeMacro("frest", null, (function(xs) {
  return metajs.mergeSq(["list", metajs.mergeSq(["first", xs]), metajs.mergeSq(["rest", xs])]);
}));

  
setScopeMacro("export_", null, (function(obj) {
    var values = Array.prototype.slice.call(arguments, 1, undefined);
    return (function() {
      var tmp = gensym();
      return ["let", tmp, obj, cons("setIn", tmp, merge(map(values, (function(__ArG_1) {
        return [["quote", __ArG_1], __ArG_1];
      }))))];
    })();
  }));
  
setScopeMacro("apply", null, (function(func, arglist) {
    return metajs.mergeSq([func, ".apply", "this", arglist]);
  }));
  
setScopeMacro("regex", null, (function(string, glim) {
    return metajs.mergeSq(["new", "RegExp", string, (glim || "undefined")]);
  }));
  
setScopeMacro("ifNot", null, (function(x) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["if", metajs.mergeSq(["not", x]), ["unquote-splicing", code]]);
  }));
  
setScopeMacro("ifEmpty", null, (function(x) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["if", metajs.mergeSq(["empty__QUERY", x]), ["unquote-splicing", code]]);
  }));
  
setScopeMacro("ifNotEmpty", null, (function(x) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["ifNot", metajs.mergeSq(["empty__QUERY", x]), ["unquote-splicing", code]]);
  }));
  
setScopeMacro("ifDefined", null, (function(x) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["if", metajs.mergeSq(["defined__QUERY", x]), ["unquote-splicing", code]]);
  }));
  
setScopeMacro("when", null, (function(x) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["if", x, metajs.mergeSq(["do", ["unquote-splicing", code]])]);
  }));
  
setScopeMacro("whenLet", null, (function(x, value) {
    var code = Array.prototype.slice.call(arguments, 2, undefined);
    return metajs.mergeSq(["let", metajs.mergeSq([x, value]), metajs.mergeSq(["when", x, ["unquote-splicing", code]])]);
  }));
  
setScopeMacro("whenFnLet", null, (function(func, x, value) {
    var code = Array.prototype.slice.call(arguments, 3, undefined);
    return metajs.mergeSq(["let", metajs.mergeSq([x, value]), metajs.mergeSq(["when", metajs.mergeSq([func, x]), ["unquote-splicing", code]])]);
  }));
  
setScopeMacro("whenIt", null, (function(value) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["let", metajs.mergeSq(["it", value]), metajs.mergeSq(["when", "it", ["unquote-splicing", code]])]);
  }));
  
setScopeMacro("whenFnIt", null, (function(func, value) {
    var code = Array.prototype.slice.call(arguments, 2, undefined);
    return metajs.mergeSq(["let", metajs.mergeSq(["it", value]), metajs.mergeSq(["when", metajs.mergeSq([func, "it"]), ["unquote-splicing", code]])]);
  }));
  
setScopeMacro("whenNot", null, (function(x) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["when", metajs.mergeSq(["not", x]), ["unquote-splicing", code]]);
  }));
  
setScopeMacro("whenEmpty", null, (function(x) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["when", metajs.mergeSq(["empty__QUERY", x]), ["unquote-splicing", code]]);
  }));
  
setScopeMacro("whenNotEmpty", null, (function(x) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["whenNot", metajs.mergeSq(["empty__QUERY", x]), ["unquote-splicing", code]]);
  }));
  
setScopeMacro("whenDefined", null, (function(x) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["when", metajs.mergeSq(["defined__QUERY", x]), ["unquote-splicing", code]]);
  }));
  
setScopeMacro("each", null, (function(signature, xs) {
    var code = Array.prototype.slice.call(arguments, 2, undefined);
    return metajs.mergeSq([xs, ".forEach", metajs.mergeSq(["fn", signature, ["unquote-splicing", code]])]);
  }));
  
setScopeMacro("eachKey", null, (function(as, obj) {
    var body = Array.prototype.slice.call(arguments, 2, undefined);
    return metajs.mergeSq(["each", metajs.mergeSq([as]), metajs.mergeSq(["keys", obj]), ["unquote-splicing", body]]);
  }));
  
setScopeMacro("match__QUERY", null, (function(regexp, string) {
    return metajs.mergeSq([string, ".match", regexp]);
  }));
  
setScopeMacro("->", null, (function(x, form) {
    /* Insert each form into second position of next form (wrap it in list if it's not a list already). */
    var more = Array.prototype.slice.call(arguments, 2, undefined);
    if ((typeof(form) === "undefined")) {
      return x;
    } else if ((more.length === 0)) {
      if (list__QUERY(form)) {
        return metajs.mergeSq([(form)[0], x, ["unquote-splicing", form.slice(1)]]);
      } else {
        return [form, x];
      }
    } else {
      return metajs.mergeSq(["->", metajs.mergeSq(["->", x, form]), ["unquote-splicing", more]]);
    }
  }));
  
setScopeMacro("rebind", null, (function(bindings) {
    /* Rebind existing symbols to new values, execute code and then restore original binding. */
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    var names = filter(bindings, (function(__ArG_1, __ArG_2) {
      return ((__ArG_2 % 2) === 0);
    })),
    remember = [],
    restore = [];
    names.forEach((function(name) {
      var sym = gensym();
      remember.push(sym, name);
      return restore.push(name, sym);
    }));
    return metajs.mergeSq(["scoped", metajs.mergeSq(["def", ["unquote-splicing", remember]]), metajs.mergeSq(["try", metajs.mergeSq(["set", ["unquote-splicing", bindings]]), ["unquote-splicing", code], metajs.mergeSq(["finally", metajs.mergeSq(["set", ["unquote-splicing", restore]])])])]);
  }));
  
setScopeMacro("let", null, (function() {
    /* Create lexical context. Each binding can see the prior bindings and use destruction. */
    var xs = Array.prototype.slice.call(arguments, 0, undefined);
    return (function() {
      var binding = [],
    code = xs;
      while (!(listNotLiteral__QUERY((code)[0]) || (code.length < 2))) {
        binding.push((code)[0], (code)[1]);
        code = code.slice(2, undefined);
      }
      if (((binding.length === 0) && listNotLiteral__QUERY((code)[0]))) {
        binding = (code)[0];
        code = code.slice(1);
      }
      (function(p0) {
        var evaluated = (p0.length > 0),
    ctx = {
          "path": "/home/dogada/projects/MJS/src/macros.mjs:96:25",
          "assertion": "(not-empty? binding)",
          "quotedParams": ["binding"],
          "resolvedParams": [p0]
};
        if ((metajs && metajs._assertHandler_)) {
          return metajs._assertHandler_(evaluated, "", ctx);
        } else {
          if (!evaluated) {
            throw (new Error(("Assert failed: " + "" + " " + ctx.assertion + " at " + ctx.path)));
          }
        }
      })(binding);
      (function(p0) {
        var evaluated = (p0.length > 0),
    ctx = {
          "path": "/home/dogada/projects/MJS/src/macros.mjs:97:25",
          "assertion": "(not-empty? code)",
          "quotedParams": ["code"],
          "resolvedParams": [p0]
};
        if ((metajs && metajs._assertHandler_)) {
          return metajs._assertHandler_(evaluated, "", ctx);
        } else {
          if (!evaluated) {
            throw (new Error(("Assert failed: " + "" + " " + ctx.assertion + " at " + ctx.path)));
          }
        }
      })(code);
      return metajs.mergeSq(["scoped", metajs.mergeSq(["def", ["unquote-splicing", binding]]), ["unquote-splicing", code]]);
    })();
  }));
  
setScopeMacro("let_", null, (function(bindings) {
    /* Create simple lexical context for bindings. Bindings don't see previous bindings. Destruction isn't supported. */
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    (function(p0) {
      var evaluated = ((p0 % 2) === 0),
    ctx = {
        "path": "/home/dogada/projects/MJS/src/macros.mjs:102:17",
        "assertion": "(even? bindings.length)",
        "quotedParams": ["bindings.length"],
        "resolvedParams": [p0]
};
      if ((metajs && metajs._assertHandler_)) {
        return metajs._assertHandler_(evaluated, "", ctx);
      } else {
        if (!evaluated) {
          throw (new Error(("Assert failed: " + "" + " " + ctx.assertion + " at " + ctx.path)));
        }
      }
    })(bindings.length);
    var names = filter(bindings, (function(__ArG_1, __ArG_2) {
      return ((__ArG_2 % 2) === 0);
    })),
    values = filter(bindings, (function(__ArG_1, __ArG_2) {
      return ((__ArG_2 % 2) !== 0);
    }));
    return metajs.mergeSq([metajs.mergeSq(["fn", names, ["unquote-splicing", code]]), ["unquote-splicing", values]]);
  }));
  
setScopeMacro("scoped", null, (function() {
    var body = Array.prototype.slice.call(arguments, 0, undefined);
    return metajs.mergeSq([metajs.mergeSq(["fn", metajs.mergeSq([]), ["unquote-splicing", body]])]);
  }));
  
setScopeMacro("letWhile", null, (function(name, value, condition) {
    var code = Array.prototype.slice.call(arguments, 3, undefined);
    return metajs.mergeSq(["let", metajs.mergeSq([name, value]), metajs.mergeSq(["while", condition, ["unquote-splicing", code], metajs.mergeSq(["set", name, value])])]);
  }));
  
setScopeMacro("do1", null, (function() {
    var xs = Array.prototype.slice.call(arguments, 0, undefined);
    return (function(tmp) {
      return metajs.mergeSq(["let", metajs.mergeSq([tmp, (xs)[0]]), ["unquote-splicing", xs.slice(1)], tmp]);
    })(gensym());
  }));
  
setScopeMacro("until", null, (function(condition) {
    var code = Array.prototype.slice.call(arguments, 1, undefined);
    return metajs.mergeSq(["while", metajs.mergeSq(["not", condition]), ["unquote-splicing", code]]);
  }));
  
setScopeMacro("keys", null, (function(obj) {
    return metajs.mergeSq(["_call", "Object.keys", obj]);
  }));
  
setScopeMacro("arguments", null, (function() {
    return cdata("(Array.prototype.slice.apply(arguments))");
  }));
  
  var __debugArg = (function(arg) {
    return ["str", wrapInDoubleQuotes((arg + "=")), ["inspect", arg]];
  });
  
  var __fmtArg = (function(arg) {
    if (istringEscapeRe.test(arg)) {
      return "\"$\"";
    } else if (istringDebugRe.test(arg)) {
      return __debugArg(arg.slice(2));
    } else {
      return arg.slice(1);
    }
  });
  
  var __fmtStr = (function(s) {
    var tokens = stripDoubleQuotes(tokenValue_(s)).split(istringArgRe);
    return cons("str", map(tokens, (function(__ArG_1) {
      return (istringArgWordRe.test(__ArG_1) ? __fmtArg(__ArG_1) : wrapInDoubleQuotes(__ArG_1));
    })));
  });
  
setScopeMacro("fmt", null, (function(s) {
    if (quoted__QUERY(s)) {
      return __fmtStr(s);
    } else {
      return syntaxError(("(fmt) requires string, but got" + tokenValue_(s) + "."), s);
    }
  }));
  
              
var firstAtom = (function(form) {
  if (list__QUERY(form)) {
    return firstAtom((form)[0]);
  } else {
    return form;
  }
});

var firstToken = (function(form) {
  if ((list__QUERY(form) && (form.length > 0))) {
    return (firstToken((form)[0]) || firstToken(form.slice(1)));
  } else {
    if (token__QUERY(form)) {
      return form;
    }
  }
});

              
setScopeMacro("log", null, (function() {
  var body = Array.prototype.slice.call(arguments, 0, undefined);
  return metajs.mergeSq(["console.log", ["unquote-splicing", body]]);
}));

setScopeMacro("warn", null, (function() {
  var body = Array.prototype.slice.call(arguments, 0, undefined);
  return metajs.mergeSq(["console.warn", ["unquote-splicing", body]]);
}));

setScopeMacro("log1", null, (function() {
  var xs = Array.prototype.slice.call(arguments, 0, undefined);
  return (function(tmp, target) {
    return metajs.mergeSq(["let", metajs.mergeSq([tmp, target]), metajs.mergeSq(["log", prnStr_(target), "\" -> \"", tmp]), ["unquote-splicing", xs.slice(1)], tmp]);
  })(gensym(), (xs)[0]);
}));

setScopeMacro("logCallStack", null, (function() {
  return metajs.mergeSq(["log", metajs.mergeSq(["get", metajs.mergeSq(["new", "Error"]), metajs.mergeSq(["quote", "stack"])])]);
}));

              
              // root scope for user functions and macros;
              
              // symbol with same name as in global scope will hide but not delete global definition;
              
              startScope("root");
              
  
  metajs.dir = process.cwd();
  metajs.pr = pr;
  metajs.includes = {};
  
  metajs.removeScriptHeader = (function(data) {
    return data.replace(/^#!.*\n/, "");
  });
  
  metajs.include = (function(file, once) {
    once = ((typeof(once) === "undefined") ? false : once);
    if (!file.match(/\.(mjs|json)$/)) {
      file = (file + ".mjs");
    }
    if (file.match((new RegExp("^\\./", undefined)))) {
      file = (metajs.dir + "/" + file);
    }
    if (!(once && (metajs.includes)[file])) {
      (metajs.includes)[file] = true;
      return metajs.translateFile(require.resolve(file), "Include");
    }
  });
  
  var withDirAndFile = (function(dir, file, role, func) {
    var scope = getScope();
    return (function() {
      var G__11 = metajs.dir,
    G__12 = metajs.file,
    G__13 = metajs.fileRole,
    G__14 = scope.source;
      return (function() {
        try {
          metajs.dir = dir;
          metajs.file = file;
          metajs.fileRole = role;
          scope.source = file;
          return func();
        } finally {
          metajs.dir = G__11;
          metajs.file = G__12;
          metajs.fileRole = G__13;
          scope.source = G__14;
        }
      })();
    })();
  });
  
  metajs.translateFile = (function(fileName, role) {
    // (log "translate-file" file-name);
    return withDirAndFile(path.dirname(fileName), fileName, role, (function() {
      return metajs.translate(metajs.removeScriptHeader(fs.readFileSync(fileName, "utf8")));
    }));
  });
  
  metajs.versionString = (function() {
    return (function() {
      var package = metajs.packageJson;
      return (package.name + " " + package.version);
    })();
  });
  
metajs.packageJson = {
  "name": "metajs",
  "homepage": "http://metajs.coect.net",
  "version": "0.3.0",
  "keywords": ["logos", "lisp", "javascript", "language", "macros", "compiler", "magic"],
  "description": "Write on Lisp. Compile to Javascript. Can guess thoughts and generate missed code.",
  "license": "MIT",
  "contributors": {
    "name": "Dmytro V. Dogadailo",
    "web": "http://www.coect.net/"
},
  "repository": {
    "type": "git",
    "url": "http://github.com/dogada/metajs.git"
},
  "bugs": {"url": "http://github.com/dogada/metajs/issues"},
  "bin": {"metajs": "./bin/metajs"},
  "main": "./lib/metajs_node",
  "dependencies": {"commander": "~2.0.0"}
}
    ;
    
