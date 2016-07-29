(ns hello-npm.core
  (:require [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]))

;; (defonce conn
;;   (repl/connect "http://localhost:9000/repl"))

(nodejs/enable-util-print!)

(def ping (nodejs/require "ping"))
(def web3 (nodejs/require "web3"))

(defn -main [& args]
    (let [web3conn (web3.)
          web3prov (web3.providers.HttpProvider. "http://localhost:8545")]
        ; init
        ;   web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
        (.setProvider web3conn web3prov)
        ; exec
        (let [coinbase (.-coinbase (.-eth web3conn))
              balance (.getBalance (.-eth web3conn) coinbase)]
            (println "coinbase:" coinbase)
            (println "balance: " (.toFormat balance 2))
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
