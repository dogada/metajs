vpath %.mjs ./src ./test
vpath %.js ./lib
# for targets like compile/all
vpath % ./var

MJS = $(shell find ./src -name "*.mjs" -not -name ".*" -printf "%f\n")
JS = $(MJS:.mjs=.js)
ALL_MJS = $(shell find ./src ./test  -name "*.mjs" -not -name ".*" -printf "%f\n")
LIB_MJS = src/metajs_node.mjs src/metajs_browser.mjs src/cli.mjs

all: clean compile-all test

compile:
	metajs --bootstrap -o lib/ $(LIB_MJS)

compile-all: $(MJS)
	@echo "Compile new compiler with old compiler."
	metajs --bootstrap -o lib/ $(LIB_MJS)
	@echo "Recompile new compiler again with just made new compiler."
	metajs --bootstrap -o lib/ $(LIB_MJS)
	@touch ./var/compile-all
	@echo "New MetaJS compiler is born."

test: compile-all
	metajs -x test/index.mjs

testjs: compile-all
	metajs test/index.mjs -o tmp/
	node ./tmp/index.js


jshint: compile-all
	jshint ./lib/metajs_node.js

check: clean compile
	metajs -x test/index.mjs

clean: init
	git checkout -- lib/
	rm -f ./var/compile-all

init:
	@mkdir -p ./var
	@mkdir -p ./tmp

%.js : %.mjs
	metajs $< -o ./lib

.PHONY: all compile test init clean jshint
