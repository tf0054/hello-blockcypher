(defproject hello-shh "0.1.0-SNAPSHOT"
  :description "FIXME: write this!"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.8.51"]
                 [org.clojure/core.async "0.2.374" :exclusions [org.clojure/tools.reader]]
                 ;
                 [org.clojure/tools.cli "0.3.5"]
                 ;
                 [pointslope/remit "0.2.0"]
    ]
  :jvm-opts ^:replace ["-Xmx1g" "-server"]
  :plugins [[lein-npm "0.6.2"]
            [lein-cljsbuild "1.1.2"]
    ]
  :npm {:dependencies [[source-map-support "0.3.2"]
                       [mustache-express "1.2.2"]
                       [express "4.14.0"]
                       [opn "4.0.2"]
                       [xmlhttprequest "1.8.0"]
                       [utf8 "2.1.1"]
                       [crypto-js "3.1.6"]
                       [bignumber.js "2.4.0"]
                       [web3 "0.16.0"]
                       [sqlite3 "3.1.4"]
    ]}
; :main "release/hello_shh.js"
  :source-paths ["src" "target/classes"]
  :clean-targets ["out" "release"]
  :target-path "target"
  :cljsbuild {:builds {:app {:source-paths ["src"]
                             :compiler {:output-to "release/hello_shh.js"
                                        :output-dir "release"
                                      ;  :optimizations :simple
                                        :optimizations :none
                                        :target :nodejs
                                        :verbose true
                                        :main hello-shh.core}}}})
