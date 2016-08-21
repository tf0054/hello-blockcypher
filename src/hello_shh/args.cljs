(ns hello-shh.args
  (:require [cljs.tools.cli :refer [parse-opts]]
            [hello-shh.utils :as utils]
            ))

; https://github.com/clojure/tools.cli
(def cli-options
  [["-g" "--geth Geth's uri" "Your geth's uri"
    :id :geth
    :default "http://127.0.0.1:8545"
    ]
   ["-n" "--name NameOfOrganization" "Organization's name"
    :id :name
    :default "TestOrg"
    ]
   ["-h" "--help"]])

(defn parseOpts [args]
    (parse-opts args cli-options) )
