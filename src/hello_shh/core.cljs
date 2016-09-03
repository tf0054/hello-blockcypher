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

(def utils-merge (nodejs/require "utils-merge"))
(def resume (nodejs/require "/work/tf0054/work/hello-jsx/node/applicant/Resumes2.js"))
(def profile (nodejs/require "/work/tf0054/work/hello-jsx/node/applicant/Profile2.js"))

(defonce db-args (atom {}))
(defonce db-locl (atom {}))

(defn- mkMap [db tbl amap c]
  (go (let [x (<! c)]
        (.all db
              (str "SELECT id,name,value FROM " tbl)
              (h/>? c) )
        ) )
  
  (go (let [x (<! c) ; if err occured, num of args would become 2?
            row (js->clj x :keywordize-keys true)]
        (println "Read: " tbl)
        (doall (for [y row]
                 (swap! amap
                        assoc-in [:sys (keyword (:name y))] (:value y)) ))
        (>! c @amap) ) )
  )

(defn replaceSetState [obj]
  (set! (.-setState obj)
        (fn [x]
          (utils-merge (.-state obj) x) ) )
  )

(defn mkStateVal [x]
  (clj->js {:target {:value x}})
  )

(defn -main [& args]
  ; checking args
  (let [x   (args/parseOpts args)
        o   (:options x)
        _db (.-Database sqlite3)
        db  (new _db "test.db")
        ;; db (new (.-Database sqlite3) "test.db")
        ;; db (.Database sqlite3 "test.db")
        c   (chan 1)]
        (if (or (not (nil? (x :errors))) (contains? o :help))
            (do (println (:errors x) "\n" "How to use:")
                (utils/nprint (:summary x))
                (.exit js/process 1))
            (do (swap! db-args merge o) ) )

        (go (>! c 1) )

        ;; (go (let [x (<! c)]
        ;;       (println "Updated:")
        ;;       (.run db
        ;;             "UPDATE lorem SET info = ? WHERE rowid = ?" "bar" 2)
        ;;       (>! c 1) ) )

        (mkMap db "sys" db-locl c)

        (go (let [x (<! c)]
              (println "RES:" x)
              (println "Close.")
              (.close db)
              (>! c 1)) )

        ; main
        (go (let [x (<! c)]
              (let [web3     (web3obj.)
                    web3prov (web3obj.providers.HttpProvider. (:geth @db-args))]
                ; init web3
                (.setProvider web3 web3prov)

                ; exec
                (let [resumeCljs (new (.-default resume) (clj->js {:web3 web3}))
                      profileCljs (new (.-default profile) (clj->js {:web3 web3})) 
                      prop       {:abi         (:abi (:sys @db-locl))
                                  :systemAgent (:systemagent (:sys @db-locl))
                                  }
                      ]

                  ; replace Component's setState bc it checks "mounted" status.
                  (replaceSetState resumeCljs)
                  (replaceSetState profileCljs)

                  ; changing Resume state
                  (.organizationChange resumeCljs (mkStateVal "test3"))
                  (.fromChange resumeCljs (mkStateVal "2001/04"))
                  (.toChange resumeCljs (mkStateVal "2003/03"))

                  ; changing Profile state
                  (.nameChange profileCljs (mkStateVal "test3"))
                  (.birthdayChange profileCljs (mkStateVal "1976/12/06"))

                  (println "props(R):" (.-props resumeCljs))
                  (println "props(P):" (.-props profileCljs))

                  (println "state(R):" (.-state resumeCljs))
                  (println "state(P):" (.-state profileCljs))

                  (println "god-res:" (.loadOrganizations resumeCljs (clj->js prop))))

                (let [eth      (.-eth web3)
                      coinbase (.-coinbase eth)]
                  (println "coinbase:" coinbase))
                )
              )
            )
        )
  )

(set! *main-cli-fn* -main)
