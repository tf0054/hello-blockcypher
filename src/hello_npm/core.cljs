(ns hello-npm.core
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]])
  (:require [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]
            [cljs.core.async :as async :refer [timeout chan <! >!]]
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

(defn addOrgCore [eth orgName orgAddr agentAddr]
    (let [strSol (.readFileSync fs (str js/__dirname "/../../dapp/resume.sol")
                                "utf-8")
          bytecode (.solidity (.-compile eth) strSol)
          abi (.-abiDefinition (.-info (.-systemContract bytecode)))
          systenAgent (.at (.contract eth abi) agentAddr)
          ]

        (let [esGas (.estimateGas (.-addOrganization systenAgent)
                                  orgName
                                  (clj->js {:from orgAddr}))
              tHash (.addOrganization systenAgent
                                      orgName
                                      (clj->js {:from orgAddr
                                                :gas esGas}))]
            (println "Gas(estimate):" esGas)
            (println "Add(TxHash):" tHash)
            [tHash esGas]
            )
        )
    )

(defonce newAccount (atom ""))

(defn -main [& args]
    (let [numArgs 2]
        (if (< (count args) numArgs)
            (do (println (str "Missing args(" numArgs ")"
                              "! - should be provided: "
                              "SystemAgentAddr OrgName"))
                         (.exit js/process 1) ) ))

    (let [web3 (web3obj.)
          web3prov (web3obj.providers.HttpProvider. "http://localhost:8545")
          addrSystemAgent (nth args 1)]
        ;(if false (do ;***
        ; init
        ;   web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
        (.setProvider web3 web3prov)
        ; exec
        (let [eth (.-eth web3)
              coinbase (.-coinbase eth)
              ;accounts (js->clj (.-accounts eth))
              ch (chan)]

            ; basic operations
            (println "coinbase: " coinbase)
            ;(println "balance: " (.toFormat balance 2))
            ;(println "accounts: " accounts)

            ; newAccount
            (let [newAcc (.newAccount (.-personal web3) "password")]
                (println "newAccount:" newAcc )
                (reset! newAccount newAcc) )

            ; unlock
            (println
              (doall (map #(utils/unlockAccount web3 % "password" 300)
                          [coinbase @newAccount]) ) )

            ; transfer
            (let [tx (utils/sendEther eth
                                    coinbase
                                    @newAccount
                                    3000000000000000000)]
                (utils/waitTx eth ch tx) )

            ; http://www.slideshare.net/sohta/coreasync

            ; check balances
            (go (<! ch)
                (println "balances: ")
                (doall (map #(let [bal (.getBalance eth %)]
                                 (println % "->" (.toFormat bal 2)) )
                            [coinbase @newAccount]))
                (>! ch 2) )

            (go (<! ch)
                (println "AddOrganization:")
                (let [tx (nth (addOrgCore eth (nth args 0) @newAccount
                                  addrSystemAgent) 0)]
                    (utils/waitTx eth ch tx) )
;;                     (.appendFile fs
;;                                  "writetest.txt"
;;                                  (str (concat aryResult '(orgAddr))) )
                    )
             )
        ;)) ;***

        (go (express/startHttpd @newAccount addrSystemAgent))

        ;browser open
        ;(go (<! ch)
        (opn "http://localhost:3000/ntl"
             (clj->js {:app
                       ["google chrome"]}))
        ;)
        )
    )

(set! *main-cli-fn* -main)
