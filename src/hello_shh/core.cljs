(ns hello-shh.core
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]])
  (:require [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]
            [cljs.core.async :as async :refer [timeout chan <! >!]]
            [hello-shh.args :as args]
            [hello-shh.utils :as utils]
            [hello-shh.express :as express]
            ))

;; (defonce conn
;;   (repl/connect "http://localhost:9000/repl"))

(nodejs/enable-util-print!)

(def fs (nodejs/require "fs"))
(def opn (nodejs/require "opn"))
(def ping (nodejs/require "ping"))
(def web3obj (nodejs/require "web3"))

(defonce ls-db (atom {}))

(defn- getAbi [x]
    {:systemContract (js->clj (.-abiDefinition
                                  (.-info (.-systemContract x))))
     :applicantContract (js->clj (.-abiDefinition
                                     (.-info (.-applicantContract x))))
     :organizationContract (js->clj (.-abiDefinition
                                        (.-info (.-organizationContract x)))) }
    )

(defn- getSA [eth agentAddr x]
    (.at (.contract eth (.-abiDefinition
                            (.-info (.-systemContract x)))
                    ) agentAddr)
    )

(defn- addOrgCore [eth orgName orgAddr agentAddr]
    (let [strSol (.readFileSync fs (str js/__dirname "/../../dapp/resume.sol")
                                "utf-8")
          bytecode (.solidity (.-compile eth) strSol)
          abi (getAbi bytecode)
          systenAgent (getSA eth agentAddr bytecode) ]

        (let [esGas (.estimateGas (.-addOrganization systenAgent)
                                  orgName
                                  (clj->js {:from orgAddr}))
              tHash (.addOrganization systenAgent
                                      orgName
                                      (clj->js {:from orgAddr
                                                :gas esGas}))
              ]
            (println "Gas(estimate):" esGas)

            [tHash abi systenAgent]
            )
        )
    )

(defn- getAgentCore [eth abi account agentAddr]
    (let [systenAgent (.at (.contract eth abi) agentAddr)]
        (.getOrganizationAgent systenAgent
                                      (clj->js {:from account})) ) )

(defn -main [& args]
    ; checking args
    (let [x (args/parseOpts args)
          o (:options x)]
        (if (or (not (nil? (x :errors))) (contains? o :help))
            (do (println (:errors x) "\n" "How to use:")
                (utils/nprint (:summary x))
                (.exit js/process 1))
            (do (swap! ls-db merge o) ) )
            ;(print x)
        )
    ; main
    (let [web3 (web3obj.)
          web3prov (web3obj.providers.HttpProvider. (:geth @ls-db))]
        ; init
        (.setProvider web3 web3prov)
        ; exec
	(let [shh (.-shh web3)
              myIdentity (.newIdentity shh) ]
           (.post shh (clj->js {:from myIdentity
                                :topic (.fromAscii web3 "Topic(AppName)")
                                :payload [
                                   (.fromAscii web3 "myName")
                                   (.fromAscii web3 "What is your name?") ]
                                :ttl 100
                                :priority 100}))

           (let [shhWatch (.watch shh [
              (.fromAscii web3 "Topic(AppName)")
              myIdentity ] ) ]
              (.arrived shhWatch (fn [m]
                (println "Reply from " web3.toAscii(m.payload)
                         " whose address is " + (.from m))) ) ) )

        (let [eth (.-eth web3)
              coinbase (.-coinbase eth)
              ch (chan)]
             (println "coinbase:" coinbase))
    )
)

(set! *main-cli-fn* -main)
