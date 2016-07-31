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
    (let [strSol (.readFileSync fs "dapp/resume.sol" "utf-8")
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
            '(esGas tHash)
            )
        )
    )

(defn -main [& args]
    (let [web3 (web3obj.)
          web3prov (web3obj.providers.HttpProvider. "http://localhost:8545")]
        ; init
        ;   web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
        (.setProvider web3 web3prov)
        ; exec
        (let [eth (.-eth web3)
              coinbase (.-coinbase eth)
              balance (.getBalance eth coinbase)
              accounts (js->clj (.-accounts eth))
              ch (chan)]

            ; basic operations
;;             (println "coinbase: " coinbase)
;;             (println "balance: " (.toFormat balance 2))
;;             (println "lastblock/gasLimit: "
;;                      (get (js->clj (.getBlock eth "latest")) "gasLimit"))
;;             (println "accounts: " accounts)

            ; newAccount
;;             (let [newAcc (.newAccount (.-personal web3) "password")]
;;                 (println "newAccount:" newAcc ) )

            ; unlock
            (println
              (doall (map #(utils/unlockAccount web3 % "password" 300)
                          (take 3 accounts)) ) )
            ; transfer
            (let [tx (utils/sendEther eth
                                    (nth accounts 0)
                                    (nth accounts 1)
                                    2000000
                                    ;#(println "tx-hash:" %)
                                    )]
                (utils/waitTx eth ch tx) )

            ; http://www.slideshare.net/sohta/coreasync

            ; check balances
            (go (<! ch)
                (println "balances: ")
                (doall (map #(let [bal (.getBalance eth %)]
                                 (println % "->" (.toFormat bal 2)) )
                            (take 3 accounts)))
                (>! ch 2) )

            (println "orgAddr: ")
            ; resume (orgAddr)
            (if false (do
            (let [orgAddr "0xedcdbd7c497a1b35df32029e930f8fcc7c65c14c"
                  aryResult
                  (addOrgCore eth "CLJS" orgAddr
                              "0x7748d0060a538ea1988007710a52e5c0f5bef280")]
                ; (.writeFile fs
                (.appendFile fs
                            "writetest.txt"
                            (str (concat aryResult '(orgAddr))) )
                )
            ) )

            (go (express/startHttpd))

            ;browser open
            ;(go (<! ch)
            (opn "http://localhost:3000/organization.html"
                  (clj->js {:app
                            ["google chrome"]}))
                ;)
            )
        )
    )

(defn -main2 [& args]
  (if (nil? args)
    (println "hostname is needed as a agrs")
    (.probe (.-sys ping)
      (nth args 0)
      #(println "ping(" (nth args 0) "):" %)) )
)

(set! *main-cli-fn* -main)
