(ns hello-shh.core
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]]
                   )
  (:require [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]
            [cljs.core.async :as async :refer [timeout chan <! >!]]
            [cljs-callback-heaven.core :as h]
            [hello-shh.args :as args]
            [hello-shh.utils :as utils]
            [hello-shh.express :as express]
            ))

;; (defonce conn
;;   (repl/connect "http://localhost:9000/repl"))

(nodejs/enable-util-print!)

(def fs (nodejs/require "fs"))
(def opn (nodejs/require "opn"))
(def web3obj (nodejs/require "web3"))
(def sqlite3 (nodejs/require "sqlite3"))

(defonce ls-db (atom {}))

(defn -main [& args]
    ; checking args
    (let [x (args/parseOpts args)
          o (:options x)
          _db (.-Database sqlite3)
          db (_db. "test.db")
          c (chan 1)]
        (if (or (not (nil? (x :errors))) (contains? o :help))
            (do (println (:errors x) "\n" "How to use:")
                (utils/nprint (:summary x))
                (.exit js/process 1))
            (do (swap! ls-db merge o) ) )

        (.serialize db (fn []
                         (println "Prepared.")
                         (.run db "DROP TABLE IF EXISTS lorem")
                         (.run db "CREATE TABLE lorem (info TEXT)")
                         (let [stmt (.prepare db "INSERT INTO lorem VALUES (?)")]
                           (println "Write:")
                           (doall (for [i (range 10)]
                                    (.run stmt (str "Ipsum" i) #(println "w")) ) )                           
                           (.finalize stmt) )
                         (go (>! c 1) )
                         ))

        (go (let [x (<! c)]
              (println "Updated:")
              (.run db
                    "UPDATE lorem SET info = ? WHERE rowid = ?" "bar" 2)
              (>! c 1) ) )
        
        (go (let [x (<! c)]
              (.all db
                    "SELECT rowid AS id, info FROM lorem"
                    (h/>? c) )
              ) )
        
        (go (let [x (<! c) ; if err occured, num of args would become 2?
                  row (js->clj x :keywordize-keys true)]
              (println "Read:")
              (doall (for [y row]
                       (println (:id y) ":" (:info y)) ))
              (>! c 1) ) )
        
        (go (let [x (<! c)]
              (println "Close.")
              (.close db) ) )
        )
    ; main
  (let [web3     (web3obj.)
        web3prov (web3obj.providers.HttpProvider. (:geth @ls-db))]
        ; init
        (.setProvider web3 web3prov)
        ; exec
        (let [shh (.-shh web3)
              myIdentity (.newIdentity shh)]

            (println "myIdentity:" myIdentity)

            (.post shh
                   (clj->js {:from myIdentity
                             :topic [(.fromAscii web3 "Topic(AppName)")]
                             :payload (.fromAscii web3 "What is your name?")
                             :ttl 100
                             :priority 100}))

            (.watch (.filter shh (clj->js [(.fromAscii web3 "Topic(AppName)")
                                           myIdentity ] ) )
                    (fn [err _res]
                        (let [res (js->clj _res :keywordize-keys true)]
                            (println "Reply from "
                                     (.toAscii web3 (:payload res))
                                     " whose address is "
                                     (:from res) ))) )

            (let [eth (.-eth web3)
                  coinbase (.-coinbase eth)
                  ch (chan)]
                (println "coinbase:" coinbase))
            )
        )
    )

(set! *main-cli-fn* -main)
