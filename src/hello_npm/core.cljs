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
  (.ping ping "www.google.com" #(println "ping:" %))
  (println "Helloworld:" (add-numbers 1 2) ":" args ";")
)

(set! *main-cli-fn* -main)
