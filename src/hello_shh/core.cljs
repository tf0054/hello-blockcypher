(ns hello-shh.core
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]]
                   [cljs-callback-heaven.macros :refer [<?]]
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
(def account (nodejs/require "/work/tf0054/work/hello-jsx/node/Account.js"))
(def resume (nodejs/require "/work/tf0054/work/hello-jsx/node/applicant/Resumes2.js"))
(def oprofile (nodejs/require "/work/tf0054/work/hello-jsx/node/organization/Profile2.js"))
(def aprofile (nodejs/require "/work/tf0054/work/hello-jsx/node/applicant/Profile2.js"))
(def organization (nodejs/require "/work/tf0054/work/hello-jsx/node/organization/Organization.js"))
(def oagent (nodejs/require "/work/tf0054/work/hello-jsx/node/organization/Agent2.js"))

(defonce db-args (atom {}))
(defonce db-locl (atom {}))
(defonce db-orgn (atom {}))

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

(defn onTransferred [d x]
  (println "Account transfered:" x)
  (go (>! d 1)))

(defn aonCreated [account password unlockTime]
  (println "Account created:" account password unlockTime)
  (swap! db-orgn assoc :account account
                       :password password
                       :unlockTime unlockTime)
  )

(defn aonSave [objJs]
  (let [objRet (js->clj objJs :keywordize-keys true)]
    (println "Org name:" objRet)
    (swap! db-orgn assoc
           :name (:name objRet)
           :profile objRet) ))

(defn agentOnStarted [d x]
  (println "Org-Agent:" x)
  (swap! db-orgn assoc
         :agent x)
  (go (>! d 1))
  )

(defn writeOrg [db atomdb c]
  (.serialize db (fn []
                   (let [stmt (.prepare db "INSERT INTO org(org,name,value) VALUES (?,?,?)")]
                     (println "Write:")
                     (doall (map #(let [strKey (name %)
                                        strVal (if (= cljs.core/PersistentArrayMap (type (% @atomdb)))
                                                 (.stringify js/JSON (clj->js (% @atomdb)))
                                                 (% @atomdb) )]
                                    (println % (% @atomdb))
                                    (.run stmt (:name @atomdb) strKey strVal
                                          (fn [x]
                                            (println "w" x))))
                                 (keys @atomdb)))
                     (.finalize stmt) )
                   ))
  )

(defn -main [& args]
  ; checking args
  (let [x   (args/parseOpts args)
        o   (:options x)
        _db (.-Database sqlite3)
        db  (new _db "test.db")
        ;; db (new (.-Database sqlite3) "test.db")
        c   (chan 1)]
        (if (or (not (nil? (x :errors))) (contains? o :help))
            (do (println (:errors x) "\n" "How to use:")
                (utils/nprint (:summary x))
                (.exit js/process 1))
            (do (swap! db-args merge o) ) )

        (mkMap db "sys" db-locl c)
        (go (>! c 1))

        ; main
        (let [web3     (web3obj.)
              web3prov (web3obj.providers.HttpProvider. (:geth @db-args))
              d   (chan 1)]
          ; init web3
          (.setProvider web3 web3prov)

          (go (let [x (<! c)]
                ; exec
                (let [eth      (.-eth web3)
                      coinbase (.-coinbase eth)
                      ]

                  (go (>! d 1))

                  (<? (do (println "unlocking coinbase.." coinbase)
                        ;(utils/unlockAccount web3 coinbase "password" 3600)
                        ) "ERR" d)
                  
                  ; create org
                  (go (let [x (<! d)]
                        (println "creating... new")
                        (let [accountCljs (new (.-default account)
                                               (clj->js {:web3          web3
                                                         :onCreated     aonCreated
                                                         :onUnlocked #(println "onUnlocked" %)
                                                         :onTransferred (partial onTransferred d)}))]
                          (replaceSetState accountCljs)
                          (.setState accountCljs (clj->js {:password "password"}))
                          ;(println "props(A):" (.-props accountCljs))
                          (println "state(A):" (.-state accountCljs))
                          (if true
                            (.createAccountClick accountCljs)
                            (swap! db-orgn assoc ;DEBUG
                                   :account "0x2253697d2b8b39ee083b11da8a2be6dbbced4e58"
                                   :password "password"
                                   :unlockTime "1472998353636") )
                          )
                        ; Channel should be filled in onTransfereed callback.
                        ; (>! d 1)
                        ) )

                  (go (let [x (<! d)]
                        (println "setting profile... new")
                        (let [oprofileCljs (new (.-default oprofile)
                                                (clj->js {:web3   web3
                                                          :onSave aonSave}))]
                          (replaceSetState oprofileCljs)
                          (.nameChange oprofileCljs (mkStateVal
                                                     (str "Org_" (utils/fixed-length-password 4))))
                          (println "props(oP):" (.-props oprofileCljs))
                          (println "state(oP):" (.-state oprofileCljs))
                          (.saveClick oprofileCljs))
                        (>! d 1) ))

                  (go (let [x (<! d)]
                        (let [organizationCljs (new (.-default organization)
                                                    (clj->js {:web3 web3}))]

                          (replaceSetState organizationCljs)
                          (.setState organizationCljs (clj->js {:account (:account @db-orgn)}))
                          (.accountUnlocked organizationCljs (:password @db-orgn) (:unlockTime @db-orgn))

                          (println "starting org agent... new")
                          (let [orgProps    (.-state organizationCljs)
                                agentParams (clj->js {:web3                web3
                                                      :account             (:account @db-orgn)
                                                      :password            (:password @db-orgn) 
                                                      :profile             (:profile @db-orgn)
                                                      :lockedTime          (.-lockedTime orgProps)
                                                      :balance             (.-balance orgProps)
                                                      :abi                 (:abi (:sys @db-locl))
                                                      :systemAgent         (:systemagent (:sys @db-locl))
                                                      :onStarted           (partial agentOnStarted d)
                                                      :accountAutoUnlocked #(println "accountAutoUnlocked" %)
                                                      })
                                oagentCljs  (new (.-default oagent) agentParams)]
                            (println "AgentParams:" agentParams)
                            (replaceSetState oagentCljs)
                            (.startAgentClick oagentCljs)
                            ; Channel should be filled in onStarted callback.
                            ; (>! d 1)
                            )
                          )
                        )
                      )

                  (go (let [x (<! d)]
                        (writeOrg db db-orgn d)
                        (>! d 1) ))

                  (go (let [x (<! d)]
                        (println "Close.")
                        (.close db)
                        (>! c 1)) )

                  ; create applicant
                  ;; (let [aprofileCljs (new (.-default aprofile)
                  ;;                         (clj->js {:web3   web3
                  ;;                                   :onSave nil}))]
                  ;;   (replaceSetState aprofileCljs)
                  ;;   (.nameChange aprofileCljs (mkStateVal "test3"))
                  ;;   (.birthdayChange aprofileCljs (mkStateVal "1976/12/06"))
                  ;;   (println "props(aP):" (.-props aprofileCljs))
                  ;;   (println "state(aP):" (.-state aprofileCljs)))

                  )
                )
              )
          )
        )
  )

(set! *main-cli-fn* -main)
