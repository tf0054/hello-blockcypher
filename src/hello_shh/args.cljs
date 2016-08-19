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
   ["-s" "--system SystemAccoutAddress" "System account's address"
    :id :system
    :missing "-s is needed."
    :validate [#(not (nil? %)) "Must be set"]
    ]
   ["-a" "--systemagent SystemAgentAddress" "System account's address"
    :id :sysagent
    :missing "-a is needed."
    :validate [#(not (nil? %)) "Must be set"]
    ]
   ;; A boolean option defaulting to nil
   ["-h" "--help"]])

(defn parseOpts [args]
    (parse-opts args cli-options) )
