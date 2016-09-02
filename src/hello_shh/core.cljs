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
(def resume (nodejs/require "/work/tf0054/work/hello-shh/node/applicant/Resumes2.js"))

(defonce db-args (atom {}))
(defonce db-locl (atom {}))

(defn- mkMap [db tbl c]
  (go (let [x (<! c)]
        (.all db
              (str "SELECT id,name,value FROM " tbl)
              (h/>? c) )
        ) )
  
  (go (let [x (<! c) ; if err occured, num of args would become 2?
            row (js->clj x :keywordize-keys true)]
        (println "Read: " tbl)
        (doall (for [y row]
                 (swap! db-locl assoc-in [:sys (keyword (:name y))] (:value y)) ))
        (>! c @db-locl) ) )
  )

(defn -main [& args]
    ; checking args
  (let [x   (args/parseOpts args)
        o   (:options x)
        _db (.-Database sqlite3)
        db  (_db. "test.db")
        c   (chan 1)]
        (if (or (not (nil? (x :errors))) (contains? o :help))
            (do (println (:errors x) "\n" "How to use:")
                (utils/nprint (:summary x))
                (.exit js/process 1))
            (do (swap! db-args merge o) ) )

        ;; (.serialize db (fn []
        ;;                  (println "Prepared.")
        ;;                  (.run db "DROP TABLE IF EXISTS lorem")
        ;;                  (.run db "CREATE TABLE lorem (info TEXT)")
        ;;                  (let [stmt (.prepare db "INSERT INTO lorem VALUES (?)")]
        ;;                    (println "Write:")
        ;;                    (doall (for [i (range 10)]
        ;;                             (.run stmt (str "Ipsum" i) #(println "w")) ) )                           
        ;;                    (.finalize stmt) )
        ;;                  (go (>! c 1) )
        ;;                  ))
        (go (>! c 1) )

        (go (let [x (<! c)]  
              (println "Updated:")
              (.run db
                    "UPDATE lorem SET info = ? WHERE rowid = ?" "bar" 2)
              (>! c 1) ) )

        (mkMap db "sys" c)
        
        (go (let [x (<! c)]
              (println "RES:" x)
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
              (.close db)
              (>! c 1)) )
        ; main
        (let [web3     (web3obj.)
              web3prov (web3obj.providers.HttpProvider. (:geth @db-args))]
          ; init web3
          (.setProvider web3 web3prov)
          ; exec

          (go (let [x (<! c)]
                (let [resumeCljs  (new (.-default resume) (clj->js {:web3 web3}))
                      prop {:abi (:abi (:sys @db-locl))
                            :systemAgent (:systemagent (:sys @db-locl))
                            }
                      ]
                  
                  (println "god-res:" (.loadOrganizations resumeCljs (clj->js prop)))  
                  )    
                ) )          

          (let [eth      (.-eth web3)
                coinbase (.-coinbase eth)
                ch       (chan)]
            (println "coinbase:" coinbase))
          )
        )
 )

(set! *main-cli-fn* -main)
