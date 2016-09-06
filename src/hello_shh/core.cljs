(ns hello-shh.core
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]]
                   [cljs-callback-heaven.macros :refer [<?]]
                   )
  (:require [goog.string :as gstring]
            [goog.string.format]
            [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]
            [cljs.core.async :as async :refer [timeout chan <! >!]]
            [cljs-callback-heaven.core :as h]
            [hello-shh.args :as args]
            [hello-shh.utils :as utils]
            [hello-shh.express :as express]
            ))

(nodejs/enable-util-print!)

(def web3obj (nodejs/require "web3"))
(def log4js (nodejs/require "log4js"))
(def sqlite3 (nodejs/require "sqlite3"))

(def utils-merge (nodejs/require "utils-merge"))
(def node-localstorage (nodejs/require "node-localstorage"))

(def account (nodejs/require "/work/tf0054/work/hello-jsx/node/Account.js"))
(def oprofile (nodejs/require "/work/tf0054/work/hello-jsx/node/organization/Profile2.js"))
(def organization (nodejs/require "/work/tf0054/work/hello-jsx/node/organization/Organization.js"))
(def oagent (nodejs/require "/work/tf0054/work/hello-jsx/node/organization/Agent2.js"))

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
        (println "Reading config database")
        (doall (for [y row]
                 (swap! amap
                        assoc-in [:sys (keyword (:name y))] (:value y)) ))
        (>! c @amap) ) )
  )

(defn replaceWebFuncs [obj]
  ; replace this.setState
  (set! (.-setState obj)
        (fn [x]
          (utils-merge (.-state obj) x) ) )
  ; replace localStorage
  (let [_ls (.-LocalStorage node-localstorage)
        ls (new _ls "/tmp/localStorage")]
    (set! (.-localStorage js/global) ls) )
  ; replace console.log
  (let [logger (.getLogger log4js) ]
    (set! (.-console js/global) logger)
    (set! (.-log (.-console js/global))
          (fn [t & x] 
            (.debug logger (if (> (count x) 0)
                             (goog.string.format t x)
                             t) )) )
    )
  )

(defn mkStateVal [x]
  (clj->js {:target {:value x}})
  )

(defn writeOrg [db atomdb c]
  (.serialize db (fn []
                   (let [stmt (.prepare db "INSERT INTO org(org,name,value) VALUES (?,?,?)")]
                     (println "Write:")
                     (doall (map #(let [strKey (name %)
                                        strVal (if (= cljs.core/PersistentArrayMap (type (% atomdb)))
                                                 (.stringify js/JSON (clj->js (% atomdb)))
                                                 (% atomdb) )]
                                    (println % (% atomdb))
                                    (.run stmt (:name atomdb) strKey strVal
                                          (fn [x]
                                            (println "w" x))))
                                 (keys atomdb)))
                     (.finalize stmt) )
                   ))
  )

(defn -main [& args]
  ; checking args
  (let [x   (args/parseOpts args)
        o   (:options x)]

                                        ; processing args
    (if (args/checkHelp x o)
      (args/showHowTo x)
      (do (swap! db-args merge o) ) )

                                        ; main
    (let [web3     (web3obj.)
          web3prov (web3obj.providers.HttpProvider. (:geth @db-args))
          ;; logger (.getLogger log4js)
          _db      (.-Database sqlite3)
          db       (new _db "test.db")
          d        (chan 1)]
                                        ; init web3
      (.setProvider web3 web3prov)

                                        ; exec
      (let [eth              (.-eth web3)
            coinbase         (.-coinbase eth)
            _orgCljs         (.-default organization)
            organizationCljs (new _orgCljs
                                  (clj->js {:web3 web3}))
            ]

        (replaceWebFuncs organizationCljs)

        (go (>! d 1))

                                        ; getting params from database (abi etc.)
        (mkMap db "sys" db-locl d)

        (<? (if (:unlockCB @db-args)
              (do (println "unlocking coinbase.." coinbase)
                  (utils/unlockAccount web3 coinbase "password" 3600))
              (println "Skipped unlock coinbase")) "ERR" d)

                                        ; create account
        (go (let [x (<! d)]
              (println "creating... new")
              (let [accountCljs (new (.-default account)
                                     (clj->js {:web3          web3
                                               :onCreated     #(.accountCreated organizationCljs %1 %2 %3)
                                               :onUnlocked    #(.accountUnlocked organizationCljs %1 %2)
                                               :onTransferred #(do
                                                                 (.transferred organizationCljs %1)
                                                                 (go (>! d 1))) }))]
                (replaceWebFuncs accountCljs)
                (.setState accountCljs (clj->js {:password "password"}))
                                        ;(println "props(o):" (.-props organizationCljs))
                                        ;(print "props(o):" (.-props organizationCljs))
                (.createAccountClick accountCljs)
                )
                                        ; Channel should be filled in onTransfereed callback.
                                        ; (>! d 1)
              ) )

                                        ; adding profile to org obj
        (go (let [x (<! d)]
              (println "setting profile... new")
              (let [oprofileCljs (new (.-default oprofile)
                                      (clj->js {:web3   web3
                                                :onSave #(.saveProfile organizationCljs %1)}))]
                (replaceWebFuncs oprofileCljs)
                (.nameChange oprofileCljs (mkStateVal
                                           (str (:orgPostfix @db-args))))
                (.saveClick oprofileCljs))
              (>! d 1) ))

                                        ; adding agent to org obj
        (go (let [x (<! d)]
              (println "starting org agent... new")
              (let [orgState   (.-state organizationCljs)
                    orgParams  (clj->js {:web3                web3
                                         :account             (.-account orgState)
                                         :password            (.-password orgState) 
                                         :profile             (js->clj (.-profile orgState))
                                         :lockedTime          (.-lockedTime orgState)
                                         :balance             (.-balance orgState)
                                         :abi                 (:abi (:sys @db-locl))
                                         :systemAgent         (:systemagent (:sys @db-locl))
                                         :accountAutoUnlocked #(.accountAutoUnlocked organizationCljs %1)
                                         :onStarted           #(do
                                                                 (.agentStarted organizationCljs %1)
                                                                 (go (>! d 1)))
                                         })
                    oagentCljs (new (.-default oagent) orgParams)]
                (replaceWebFuncs oagentCljs)
                (.startAgentClick oagentCljs)
                                        ; Channel should be filled in onStarted callback.
                                        ; (>! d 1)
                )
              ))

                                        ; writing created org to db
        (go (let [x      (<! d)
                  orgRaw (js->clj (.-state organizationCljs) :keywordize-keys true)
                  orgRax (assoc orgRaw :name (:name (:profile orgRaw)))
                  orgPms (dissoc orgRax :abi :systemAgent :balance)]
              (println "state(o):" orgRax)
              (writeOrg db orgPms d)
              (>! d 1) ))

                                        ; closing db
        (go (let [x (<! d)]
              (println "Close database.")
              (.close db) ))
        )
      )
    )
  )

(set! *main-cli-fn* -main)
