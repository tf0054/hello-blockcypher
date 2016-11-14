(defproject hello-blockcypher "0.1.0-SNAPSHOT"
  :description "FIXME: write this!"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.8.51"]
                 [org.clojure/core.async "0.2.374" :exclusions [org.clojure/tools.reader]]
                 ;
                 [org.clojure/tools.cli "0.3.5"]
                 ;
                 [pointslope/remit "0.2.0"]
                 [com.cemerick/piggieback "0.2.1"]
                 [org.clojure/tools.nrepl "0.2.10"]
                ]
  :jvm-opts ^:replace ["-Xmx1g" "-server"]
  :repl-options {:nrepl-middleware [cemerick.piggieback/wrap-cljs-repl]}
  :plugins [[lein-npm "0.6.2"]
            [lein-cljsbuild "1.1.4"]
           ]
  :npm {:dependencies [[blockcypher "0.2.0"]
                      ]}
  :source-paths ["src" "target/classes"]
  :clean-targets ["out" "release"]
  :target-path "target"
  :cljsbuild {:builds {:app {:source-paths ["src"]
                             :compiler {:output-to "release/hello_blockcypher.js"
                                        :output-dir "release"
                                      ; :optimizations :simple
                                        :optimizations :none
                                        :target :nodejs
                                        :verbose true
                                        :main hello-blockcypher.core}}}})
