(ns hello-npm.args
  (:require [cljs.tools.cli :refer [parse-opts]]
            [hello-npm.utils :as utils]
            ))

(def cli-options
  ;; An option with a required argument
  [["-n" "--name NameOfOrganization" "Organization's name"
    :id :name
    :default "TestOrg"
    ;:parse-fn #(Integer/parseInt %)
    ;:validate [#(< 0 % 0x10000) "Must be a number between 0 and 65536"]
    ]
   ;; A non-idempotent option
   ["-s" "--system SystemAccoutAddress" "System account's address"
    :id :system
    :validate [#(not (nil? %)) "Must be set"]
    ;:default 0
    ;:assoc-fn (fn [m k _] (update-in m [k] inc))
    ]
   ["-a" "--systemagent SystemAgentAddress" "System account's address"
    :id :sysagent
    :validate [#(not (nil? %)) "Must be set"]
    ;:default 0
    ;:assoc-fn (fn [m k _] (update-in m [k] inc))
    ]
   ;; A boolean option defaulting to nil
   ["-h" "--help"]])

(defn parseOpts [args]
    (parse-opts args cli-options) )
