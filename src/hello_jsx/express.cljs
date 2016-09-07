(ns hello-jsx.express
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]])
  (:require [cljs.nodejs :as nodejs]
            [clojure.string :as string]
            [hello-jsx.utils :as utils]
            ))

(def fs (nodejs/require "fs"))
(def express (nodejs/require "express"))
(def mustacheExpress (nodejs/require "mustache-express"))

(defonce ls-db (atom {}))

(defn- logicRootCore [req res path]
    (let [fileName (.-name (.-params req))]
        (.sendFile res fileName
                   (clj->js {:root (str js/__dirname "/../../dapp" path)
                             :dotfiles "deny"})
                   (fn [err]
                       (if-not (nil? err)
                           (do (println (utils/logtime)
                                        "NotFound:" (str path fileName))
                               (println err)
                               (.end (.status res (.-status err))) )
                           (println (utils/logtime)
                                    "Sent:" (str path fileName)) ) ) ) ) )

(defn- logicRoot [req res]
    (logicRootCore req res "/") )

(defn- logicRootJs [req res]
    (logicRootCore req res "/js/") )

(defn- logicNtl [req res]
    (.render res "setLocalstrage" (clj->js @ls-db)))

(defn startHttpd [x]
    (let [app (express)]
        (reset! ls-db x)
        (.engine app "mustache" (mustacheExpress))
        ; set template engine
        (.set app "view engine" "mustache")
        (.set app "views" (str js/__dirname "/../../views"))
        ; set rootings
        (.get app "/ntl" logicNtl)
        (.get app "/resume/:name" logicRoot)
        (.get app "/resume/js/:name" logicRootJs)
        ; start server
        (.listen app 3000 (fn []
                              (println "Httpd-Server started on port 3000")))))
