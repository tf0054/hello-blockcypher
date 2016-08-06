(ns hello-npm.core
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]])
  (:require [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]
            [cljs.core.async :as async :refer [timeout chan <! >!]]
            [hello-npm.args :as args]
            [hello-npm.utils :as utils]
            [hello-npm.express :as express]
            ))

;; (defonce conn
;;   (repl/connect "http://localhost:9000/repl"))

(nodejs/enable-util-print!)

(def fs (nodejs/require "fs"))
(def opn (nodejs/require "opn"))
(def ping (nodejs/require "ping"))
(def web3obj (nodejs/require "web3"))

(defonce ls-db (atom {}))
(defonce strUri "http://127.0.0.1:8545")
;(defonce strUri "http://172.17.0.2:8545")

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
    (let [x (args/parseOpts args)]
        (if (not (nil? (x :errors)))
            (do (println (:errors x) "\n" "How to use:")
                (utils/nprint (:summary x))
                (.exit js/process 1))
            (do (swap! ls-db merge (x :options)) ) ) )
    ; main
    (let [web3 (web3obj.)
          web3prov (web3obj.providers.HttpProvider. strUri)]
        ; init
        ;   web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
        (.setProvider web3 web3prov)
        ; exec
        (let [eth (.-eth web3)
              coinbase (.-coinbase eth)
              ;accounts (js->clj (.-accounts eth))
              ch (chan)]

;            (if false (do ;***

            ; basic operations
            (println "coinbase: " coinbase)
            (swap! ls-db assoc-in [:coinbase] coinbase)
            ;(println "balance: " (.toFormat balance 2))

            ; newAccount
            (let [newAcc (.newAccount (.-personal web3) "password")]
                (swap! ls-db assoc-in [:account] newAcc)
                (println "newAccount:" newAcc ) )

            ; unlock
            (go ;(<! ch)
                (println "unlock:"
                         (doall (map #(utils/unlockAccount web3 % "password" 300)
                                     [coinbase (:account @ls-db)]) ) )
                (>! ch 0) )

            ; transfer
            (go (<! ch)
                (println "transfer:")
                (let [tx (utils/sendEther eth
                                          coinbase
                                          (:account @ls-db)
                                          3000000000000000000)]
                    (utils/waitTx eth ch tx #(println "\ntransfer: recipt\n" %)) ) )

            ; http://www.slideshare.net/sohta/coreasync

            ; check balances
            (go (<! ch)
                (println "balances: ")
                (doall (map #(let [bal (.getBalance eth %)]
                                 (println % "->" (utils/toEther web3 bal) ))
                            [coinbase (:account @ls-db)]) )
                (>! ch 2) )

            ; Add organization
            (go (<! ch)
                (println "AddOrganization:")
                (let [contract (addOrgCore eth
                                           (:name @ls-db)
                                           (:account @ls-db)
                                           (:sysagent @ls-db))
                      tx (nth contract 0)
                      abi (nth contract 1)]
                    (swap! ls-db assoc-in [:abi] (.stringify js/JSON (clj->js abi)))
                    (utils/waitTx eth ch tx #(println "\nAddOrganization: recipt\n" %) ) ) )
 ;          ) (go (>! ch 2)))  ;***

            ; get created Org agent address
            (go (<! ch)
                (println "GetOrganizationAgent:")
                (let [aAddr (getAgentCore eth (.-systemContract (.parse js/JSON (:abi @ls-db)) )
                                          (:account @ls-db)
                                          (:sysagent @ls-db))]
                    (println "OA address: " aAddr)
                    (swap! ls-db assoc-in [:orgagent] aAddr) )
                (>! ch 4) )

;;                     (.appendFile fs
;;                                  "writetest.txt"
;;                                  (str (concat aryResult '(orgAddr))) )

            ;start http listening
            (go (<! ch)
                (if (> 4 (.-length (str (:orgagent @ls-db))))
                    (do (println "ERR: system agent address is wrong.")
                        (.exit js/process 1) ) )
                ;
                (go (express/startHttpd @ls-db))
                (>! ch 5) )

            ;browser open
            (go (<! ch)
                (opn "http://localhost:3000/ntl"
                     (clj->js {:app
                               ["google chrome"]})) )
            )
        )
    )

(set! *main-cli-fn* -main)
