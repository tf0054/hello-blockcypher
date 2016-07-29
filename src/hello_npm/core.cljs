(ns hello-npm.core
  (:require [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]))

;; (defonce conn
;;   (repl/connect "http://localhost:9000/repl"))

(nodejs/enable-util-print!)

(def ping (nodejs/require "ping"))
(def web3 (nodejs/require "web3"))

(defn -main [& args]
(println ":" (.HttpProvider (.-providers web3) "http://172.17.0.2:8545"))
(println ":" web3)
(println ":" (js->clj web3))
(println ":" (web3 (.-providers web3)))
)

(defn -main2 [& args]
  (if (nil? args)
    (println "hostname is needed as a agrs")
    (.probe (.-sys ping)
      (nth args 0)
      #(println "ping(" (nth args 0) "):" %)) )
)

(set! *main-cli-fn* -main)
