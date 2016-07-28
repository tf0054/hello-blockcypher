(defproject hello-npm "0.1.0-SNAPSHOT"
  :description "FIXME: write this!"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.8.51"]]
  :jvm-opts ^:replace ["-Xmx1g" "-server"]
  :plugins [[lein-npm "0.6.2"]
            [lein-cljsbuild "1.1.2"]]
  :npm {:dependencies [[source-map-support "0.3.2"]]}
; :main "release/hello_npm.js"
  :source-paths ["src" "target/classes"]
  :clean-targets ["out" "release"]
  :target-path "target"
  :cljsbuild {:builds {:app {:source-paths ["src"]
                             :compiler {:output-to "release/hello_npm.js"
                                        :output-dir "release"
                                        :optimizations :simple
                                        :target :nodejs
                                        :verbose true
                                        :main hello-npm.core}}}})
