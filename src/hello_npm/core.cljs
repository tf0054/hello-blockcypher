(ns hello-npm.core
  (:require [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]))

;; (defonce conn
;;   (repl/connect "http://localhost:9000/repl"))

(nodejs/enable-util-print!)

(def fs (nodejs/require "fs"))
(def ping (nodejs/require "ping"))
(def web3obj (nodejs/require "web3"))

(defn unlockAccount [web3 addr passwd duration]
    ;web3.personal.unlockAccount("0x1234...","password")
    (.unlockAccount (.-personal web3)
                     addr passwd duration)
    )

(defn mkTransaction [eth from to amount f]
    ;web3.eth.sendTransaction(transactionObject [, callback])
    (let [obj (clj->js {:to to
                        :from from
                        :value amount})]
        (.sendTransaction eth obj f) ) )

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
              accounts (js->clj (.-accounts eth))]
            ;(println "coinbase: " coinbase)
            ;(println "balance: " (.toFormat balance 2))
            ;(println "lastblock/gasLimit: "
            ;         (get (js->clj (.getBlock eth "latest")) "gasLimit"))
            ;(println "accounts: " accounts)

            ; unlock
            (println
              (doall (map #(unlockAccount web3 % "password" 300)
                          accounts)) )
            ; transfer
            (println "transaction: " (mkTransaction eth
                                                    (nth accounts 0)
                                                    (nth accounts 1)
                                                    2000000
                                                    ;#(println "tx-hash:" %)
                                                    ) )
            ; check balances
            (println "balances: ")
              (doall (map #(let [bal (.getBalance eth %)]
                               (println % "->" (.toFormat bal 2)) )
                          accounts))

            ; resume (orgAddr)
            (let [orgName "CLJS"
                  orgAddr "0xedcdbd7c497a1b35df32029e930f8fcc7c65c14c"
                  agentAddr "0x7748d0060a538ea1988007710a52e5c0f5bef280"
                  strSol (.readFileSync fs "resume.sol" "utf-8")
                  bytecode (.solidity (.-compile eth) strSol)
                  abi (.-abiDefinition (.-info (.-systemContract bytecode)))
                  systenAgent (.at (.contract eth abi) agentAddr)
                  ]
                ;(println "sol:" systemContract "," systenAgent)

                (let [esGas (.estimateGas (.-addOrganization systenAgent)
                                         orgName
                                         (clj->js {:from orgAddr}))
                      tHash (.addOrganization systenAgent
                                      orgName
                                      (clj->js {:from orgAddr
                                                :gas esGas}))]
                    (println "Gas(estimate):" esGas)
                    (println "Add(TxHash):" tHash)
                    (.writeFile fs "writetest.txt" (str orgAddr ","
                                                        orgName ","
                                                        tHash))
                    )
                )
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
