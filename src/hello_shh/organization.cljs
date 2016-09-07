(ns hello-shh.organization
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]]
                   [cljs-callback-heaven.macros :refer [<?]]
                   )
  (:require [goog.string :as gstring]
            [goog.string.format]
            [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]
            [cljs.core.async :as async :refer [timeout chan <! >!]]
            [cljs-callback-heaven.core :as h]
            [hello-shh.utils :as utils]
            [hello-shh.express :as express]
            ))

(def web3obj (nodejs/require "web3"))

(def account (nodejs/require "/work/tf0054/work/hello-jsx/node/Account.js"))
(def oprofile (nodejs/require "/work/tf0054/work/hello-jsx/node/organization/Profile2.js"))
(def organization (nodejs/require "/work/tf0054/work/hello-jsx/node/organization/Organization.js"))
(def oagent (nodejs/require "/work/tf0054/work/hello-jsx/node/organization/Agent2.js"))

(defn mkStateVal [x]
  (clj->js {:target {:value x}})
  )

(defn- writeOrg [db atomdb c]
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

(defn createOrg [db-args db-locl db c]
    (let [web3     (web3obj.)
          web3prov (web3obj.providers.HttpProvider. (:geth @db-args))
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

        (utils/replaceWebFuncs organizationCljs)

        (go (>! d 1))

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
                (utils/replaceWebFuncs accountCljs)
                (.setState accountCljs (clj->js {:password "password"}))
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
                (utils/replaceWebFuncs oprofileCljs)
                (.nameChange oprofileCljs (mkStateVal
                                    (utils/fixed-length-password 4)))
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
                (utils/replaceWebFuncs oagentCljs)
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
              (writeOrg db orgPms d)
              (>! c orgPms)  ))
        )
      )
  )

