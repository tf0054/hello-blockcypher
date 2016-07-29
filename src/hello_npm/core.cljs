(ns hello-npm.core
  (:require [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]))

;; (defonce conn
;;   (repl/connect "http://localhost:9000/repl"))

(nodejs/enable-util-print!)

(def ping (nodejs/require "ping"))
(def web3obj (nodejs/require "web3"))

(defn sleep [msec]
  (let [deadline (+ msec (.getTime (js/Date.)))]
(while (> deadline (.getTime (js/Date.))))))

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
        (println "obj:" obj)
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
            (println "coinbase: " coinbase)
            (println "balance: " (.toFormat balance 2))
            (println "lastblock: " (js->clj (.getBlock eth "latest")))
            (println "accounts: " accounts)

            ; unlock
            (println
              (doall (map #(unlockAccount web3 % "password" 300)
                          accounts)) )
            ; transfer
            (println "transaction: " (mkTransaction eth
                                                    (nth accounts 0)
                                                    (nth accounts 1)
                                                    10
                                                    #(println "tx-hash:" %) ) )
            (sleep (* 100 10))
            ; check balances
            (println "wakeup")
              (doall (map #(let [bal (.getBalance eth %)]
                               (println % "->" (.toFormat bal 2)) )
                          accounts))
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
