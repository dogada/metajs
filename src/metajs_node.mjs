(include "./logos/javascript")
(include "./logos/node")
(include "./logos/metajs")

(def metajs exports
  util (require 'util)
  path (require 'path)
  fs (require 'fs)
  sys (require 'sys)
  inspect  util.inspect)

(defn pr (x)
  (sys.print x))

(include "./core")

(set-in metajs
        'dir  (process.cwd)
        'pr pr
        'includes {})

(defn metajs.remove-script-header (data)
  (data.replace /^#!.*\n/ ""))

(defn metajs.include (file once:false)
  (when (not (file.match /\.(mjs|json)$/))
    (set file (str file ".mjs")))
  (when (file.match (regex "^\\./"))
    (set file (str metajs.dir "/" file)))
  (when-not (and once (get metajs.includes file))
    (set-in metajs.includes file true)
    (metajs.translate-file (require.resolve file) "Include")))

(defn with-dir-and-file (dir file role func)
  (def scope (get-scope))
  (rebind (metajs.dir dir metajs.file file metajs.file-role role scope.source file)
          (func)))

(defn metajs.translate-file (file-name role:?)
  ;; (log "translate-file" file-name)
  (with-dir-and-file (path.dirname file-name) file-name role
    (fn ()
      (metajs.translate
       (metajs.remove-script-header
        (fs.read-file-sync file-name "utf8"))))))

(defn metajs.version-string ()
  (let package metajs.package-json
       (str package.name " " package.version)))

(set metajs.package-json (include "../package.json"))

