define(function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var Mirror = require("../worker/mirror").Mirror;
    var $rdf = require('ace/ext/rdflib');
    //var StateMachine = require('ace/ext/fsm');
    var N3 = require('ace/ext/n3-browser.min.js');
    var idstatements = [];

    var TurtleWorker = exports.TurtleWorker = function(sender) {
        Mirror.call(this, sender);
        this.setTimeout(500);
        this.setOptions();
    };

    oop.inherits(TurtleWorker, Mirror);

    (function() {

        this.setOptions = function(options) {
            this.options = options || {
                // undef: true,
                // unused: true,
                esnext: true,
                moz: true,
                devel: true,
                browser: true,
                node: true,
                laxcomma: true,
                laxbreak: true,
                lastsemic: true,
                onevar: false,
                passfail: false,
                maxerr: 100,
                expr: true,
                multistr: true,
                globalstrict: true
            };
            this.doc.getValue() && this.deferredUpdate.schedule(100);
        };

        this.changeOptions = function(newOptions) {
            oop.mixin(this.options, newOptions);
            this.doc.getValue() && this.deferredUpdate.schedule(100);
        };

        this.isValidJS = function(str) {
            try {
                // evaluated code can only create variables in this function
                eval("throw 0;" + str);
            } catch (e) {
                if (e === 0)
                    return true;
            }
            return false
        };

        var curLine = 1;
        this.onUpdate = function() {
            var text = this.doc.getValue();
            //text.replace(/^#!.*\n/, "\n").match(/[^\r\n]+/g);
            var errors = [];
            if (true) {

                var uri = 'http://www.engie.com';
                var mimeType = 'text/turtle';
                var store = $rdf.graph();

                try {
                    $rdf.parse(text, store, uri, mimeType);
                    store.statements.forEach(function(statement) {
                        errors.push({
                            row: 1,
                            column: 0,
                            text: 'Parsed :' + statement.subject + ' ' + statement.predicate + ' ' + statement.object,
                            type: "info",
                            raw: " is not valid"
                        });
                    });
                    //console.log(store);

                } catch (err) {
                    var linenumber = err.split('\n')[1].split(' ')[1] - 1;
                    errors.push({
                        row: linenumber,
                        column: 0,
                        text: err.split('\n')[1].split('>:')[1],
                        type: "error",
                        raw: " errorHere"
                    });
                    errors.push({
                        row: 0,
                        column: 0,
                        text: 'Line:' + linenumber + ' ' + err.split('\n')[1].split('>:')[1],
                        type: "warning",
                        raw: " errorHere"
                    });
                    //console.log(err);
                }
            };
            this.sender.emit("annotate", errors);
        }
    }).call(TurtleWorker.prototype);
});