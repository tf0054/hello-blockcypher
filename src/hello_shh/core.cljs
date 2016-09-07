(ns hello-shh.core
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]])
  (:require [goog.string :as gstring]
            [goog.string.format]
            [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]
            [cljs.core.async :as async :refer [timeout chan <! >!]]
            [cljs-callback-heaven.core :as h]
            [hello-shh.args :as args]
            ;[hello-shh.utils :as utils]
            [hello-shh.organization :as organization]
            ))

(nodejs/enable-util-print!)

(def log4js (nodejs/require "log4js"))
(def sqlite3 (nodejs/require "sqlite3"))

(def node-localstorage (nodejs/require "node-localstorage"))

(defonce db-args (atom {}))
(defonce db-locl (atom {}))

(defn- replaceJSGlobal []
                                        ; replace localStorage
  (let [_ls (.-LocalStorage node-localstorage)
        ls  (new _ls "/tmp/localStorage")]
    (set! (.-localStorage js/global) ls) )
                                        ; replace console.log
  (let [logger (.getLogger log4js) ]
    (set! (.-console js/global) logger)
    (set! (.-log (.-console js/global))
          (fn [t & x] 
            (.debug logger (if (> (count x) 0)
                             (goog.string.format t x)
                             t) )) ))
  )

(defn- mkMap [db tbl amap c]

    (.all db
          (str "SELECT id,name,value FROM " tbl)
          (h/>? c) )
    
    (go (let [x   (<! c) ; if err occured, num of args would become 2?
              row (js->clj x :keywordize-keys true)]
          (println "Reading config database")
          (doall (for [y row]
                   (swap! amap
                          assoc-in [:sys (keyword (:name y))] (:value y)) ))
          (>! c @amap) ) )
    )

(defn -main [& args]
  ; checking args
  (let [x   (args/parseOpts args)
        o   (:options x)]
                                        ; processing args
    (if (args/checkHelp x o)
      (args/showHowTo x)
      (swap! db-args merge o) )

    (replaceJSGlobal)
    
    (let [_db (.-Database sqlite3)
          db  (new _db "test.db")
          c   (chan)
          ]
      
      (mkMap db "sys" db-locl c)

      (go (let [d (chan)
                x (<! c)]
            (organization/createOrg db-args db-locl db d)
            (organization/createOrg db-args db-locl db d)
            (>! c [(<! d) (<! d)]) 
            ))
      
      (go (let [x (<! c)]
            (println "Created org" x)
            (println "Close database.")
            (.close db) 
            ))
      )
    )
  )

(set! *main-cli-fn* -main)
