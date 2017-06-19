/*
 * Copyright 2017 ENGIE 'Smart Energy Aware Systems' SEAS Project. 
 * Licensed under [license], Version 1.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 * [license URL]
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */

define(function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("./text").Mode;
    var TurtleHighlightRules = require("./turtle_highlight_rules").TurtleHighlightRules;
    var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;

    var Mode = function() {
        this.HighlightRules = TurtleHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function() {
        // Extra logic goes here. (see below)
        //Syntax validation through Worker
        var WorkerClient = require("../worker/worker_client").WorkerClient;
        this.createWorker = function(session) {
            var worker = new WorkerClient(["ace"], "ace/mode/turtle_worker", "TurtleWorker");
            worker.attachToDocument(session.getDocument());
            //worker.keywordMapper = TurtleHighlightRules.keywordMapper;

            worker.on("annotate", function(results) {
                session.setAnnotations(results.data);
            });

            worker.on("somecallback", function(results) {
                console.log("SOMECALLBACK DETECTED");
                console.log(results);
            });

            worker.on("terminate", function() {
                session.clearAnnotations();
            });

            return worker;
        };
        this.$id = "ace/mode/tutle";
    }).call(Mode.prototype);

    exports.Mode = Mode;
});