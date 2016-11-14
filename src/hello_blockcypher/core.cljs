(ns hello-blockcypher.core
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]])
  (:require [goog.string :as gstring]
            [goog.string.format]
            [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]
            [cljs.core.async :as async :refer [timeout chan <! >!]]
            [hello-blockcypher.args :as args]
            [hello-blockcypher.utils :as utils]
            ))

(nodejs/enable-util-print!)

(def bcypher (nodejs/require "blockcypher"))
(def log4js (nodejs/require "log4js"))

(defonce db-args (atom {}))
(defonce db-locl (atom {}))

(defn- replaceJSGlobal []

  (let [logger (.getLogger log4js) ]
    (set! (.-category logger) "")
    (set! (.-console js/global) logger)
    (set! (.-log (.-console js/global))
          (fn [t & x]
            (.debug logger (if (> (count x) 0)
                             (goog.string.format t x)
                             t) )) ))
  )

(defn- printRes [err data]
  (if (nil? err)
    (println data)
    (println err))
  )

(defn -main [& args]
                                        ; checking args
  (let [x (args/parseOpts args)
        o (:options x)]
                                        ; processing args
    (if (args/checkHelp x o)
      (args/showHowTo x)
      (swap! db-args merge o) )

    (replaceJSGlobal)
    
    (let [;;_bcypher (.-Database sqlite3)
          bcapi (new bcypher "btc" "main"
                     "9441dc4f9ac5414fb7c73a4e8c569ae5")
          c     (chan)]
      
      ;;bcapi.getChain(printResponse);
      (.getChain bcapi printRes)
      )
    )
  )

(set! *main-cli-fn* -main)
