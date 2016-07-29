(ns hello-npm.core
  (:require [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]))

;; (defonce conn
;;   (repl/connect "http://localhost:9000/repl"))

(nodejs/enable-util-print!)

(def ping (nodejs/require "ping"))
; (def ping (js/require "ping"))

(defn ^:export add-numbers [a b]
  (+ a b))

(defn -main [& args]
  (if (nil? args)
    (println "hostname is needed as a agrs")
    (.probe (.-sys ping)
      (nth args 0)
      #(println "ping(" (nth args 0) "):" %)) )
)

(set! *main-cli-fn* -main)
