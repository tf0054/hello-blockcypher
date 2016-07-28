(ns hello-npm.core
  (:require [clojure.browser.repl :as repl]
            [cljs.nodejs :as nodejs]))

;; (defonce conn
;;   (repl/connect "http://localhost:9000/repl"))

(nodejs/enable-util-print!)

(defn ^:export add-numbers [a b]
  (+ a b))

(defn -main [& args]
  (println "Helloworld:" (add-numbers 1 2))
)

(set! *main-cli-fn* -main)
