(ns hello-jsx.args
  (:require [cljs.tools.cli :refer [parse-opts]]
            [hello-jsx.utils :as utils]
            ))

; https://github.com/clojure/tools.cli
(def cli-options
  [["-g" "--geth Geth's uri" "Your geth's uri"
    :id :geth
    :default "http://127.0.0.1:8545"
    ]
   ["-n" "--number How many orgs should be prepared?" "Number of orgs prepared"
    :id :numOfOrg
    :default 2
    ]
   ["-u" "--unlock" "Unlock coinbase"
    :id :unlockCB]   
   ["-h" "--help"]])

(defn parseOpts [args]
    (parse-opts args cli-options) )

(defn checkHelp [x o]
  (or (not (nil? (x :errors))) (contains? o :help)) )

(defn showHowTo [x]
  (do (println (:errors x) "\n" "How to use:")
      (utils/nprint (:summary x))
      (println "")
      (.exit js/process 1))
  )
