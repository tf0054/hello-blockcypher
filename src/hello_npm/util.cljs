(ns hello-npm.utils
  (:require-macros [cljs.core.async.macros :as m :refer [go go-loop]])
  (:require ;[clojure.browser.repl :as repl]
            ;[cljs.nodejs :as nodejs]
            [pointslope.remit.events :as pse :refer [emit subscribe]]
            [pointslope.remit.middleware :as psm :refer [event-map-middleware]]
            [cljs.core.async :as async :refer [timeout chan <! >!]]
            ))

(defn nprint [x]
    (.write (.-stdout js/process) x) )

(defn logtime []
    (.toISOString (js/Date.)))

(defn unlockAccount [web3 addr passwd duration]
    ;web3.personal.unlockAccount("0x1234...","password")
    (.unlockAccount (.-personal web3)
                     addr passwd duration) )

(defn sendEther [eth from to amount]
    ;web3.eth.sendTransaction(transactionObject [, callback])
    (let [obj (clj->js {:to to
                        :from from
                        :value amount})]
        (.sendTransaction eth obj) ) )

; - -

(defonce app-db (atom {:loop false}))

(defn wrap-db
  "Wraps handlers in middleware that adds the app-db
  to the event map under the :db key"
  [handler]
  (-> handler
     (event-map-middleware :db app-db)) )

(defn waitTx [eth ch tx]
    (go ; This go needed for starting watching parallely..
        (println "Tx registered:" tx)
        (let [wfilter (.watch
                          (.filter eth "latest")
                          (fn [err blockHash]
                              (.getBlock eth blockHash
                                         (fn [e block]
                                             (let [trans (js->clj (.-transactions block))]
                                                 (if (> (count trans) 0)
                                                     (if (some #(= tx %) trans)
                                                         (do
                                                             ;(print "Found:" blockHash)
                                                             (emit :stop-watch
                                                                   tx)
                                                             )
                                                         (nprint "+")
                                                         ) ) )
                                             )
                                         )
                              ))]
            (subscribe :stop-watch
                       (wrap-db
                           #(let [data (:data %)]
                                (.stopWatching wfilter)
                                (swap! app-db assoc-in [:loop] false)
                                ;(<! (timeout 410)) ; flush final "."
                                (println "")
                                (println "Tx  completed:" data)
                                ) ))
            ) )
    (go
        (swap! app-db assoc-in [:loop] true)
        (loop [x 1]
            (if (:loop @app-db)
                (do
                    (<! (timeout 400))
                    (nprint ".")
                    (recur 1))
                (>! ch 1)
                )) )
    )
