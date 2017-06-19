//HIGHLIGHT RULES
define(function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
    //var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";
    var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";
    var iri = "<([a-z]*['s://'?'://']*?[a-zA-Z0-9-_./#?=]+)>";
    var blanknode = "(['_:']+[a-zA-Z0-9]*)";
    var prefixedname = "([a-zA-Z0-9-?]+[-]*[':'])+[a-zA-Z0-9-_?]*";
    var literal = "(['\"']+[a-zA-Z0-9-_.#]+['\"']['\^\^xsd:']*['STRING|INTEGER|FLOAT']*)";

    var TurtleHighlightRules = function() {

        var keywordMapper = this.createKeywordMapper({
            "variable.language": "false", // Pseudo
            "keyword": "@prefix|@base|PREFIX|BASE",
            "storage.type": "const|let|var|function",
            "constant.language": "@prefix|@base|a",
            "support.function": "alert",
            "constant.language.boolean": "true|false",
            "rdf.statement": ""

        }, "identifier");

        var kwBeforeRe = "case|do|else|finally|in|instanceof|return|throw|try|typeof|yield|void";

        // regexp must not have capturing parentheses. Use (?:) instead.
        // regexps are ordered -> the first match is used
        this.$rules = {
            "start": [{
                    token: "comment",
                    regex: "#.*$"
                },
                { //directive
                    token: "comment",
                    regex: '@prefix|PREFIX',
                    next: "pname_ns"
                },
                { //directive
                    token: "comment",
                    regex: '@base|BASE',
                    next: "iriref"
                },
                { //triples-SUBJECT-predicate-object
                    //SUBJECT
                    token: "constant.language.boolean",
                    regex: iri + "|" + prefixedname + "|" + blanknode,
                    next: "predicate"
                },
                {
                    token: keywordMapper,
                    regex: identifierRe
                },
                {
                    token: keywordMapper,
                    regex: "\\-?[a-zA-Z_][a-zA-Z0-9_\\-]*"
                }
            ],
            "pname_ns": [{
                token: function(value) {
                    if (/[a-zA-Z0-9-_?]*[':']+/.test(value)) {
                        return "constant.language.boolean";
                    } else {
                        return "invalid";
                    }
                },
                //regex: "([a-zA-Z0-9-_?]+[':'])",
                regex: "([a-zA-Z0-9-_?:]+)",
                next: "iriref"
            }],
            "iriref": [{
                token: "line.markup",
                regex: "<([a-zA-Z]*['s://'?'://']*?[a-zA-Z0-9-_./#?=]+)>",
                next: "dot"
            }],
            "dot": [{
                token: function(value) {
                    if (/[.]/.test(value)) {
                        return "constant.language.boolean";
                    } else {
                        return "invalid";
                    }
                },
                regex: "[a-zA-Z0-9-_./#?=]+",
                next: "start"
            }],
            "iri": [{
                token: "constant.language.boolean",
                regex: "<([a-zA-Z]*['s://'?'://']*?[a-zA-Z0-9-_./#?=]+)>",
                //next: "dot"
            }],
            "prefixedname": [{
                token: "list.markup",
                regex: "([a-zA-Z0-9]+)",
                //next: "dot"
            }],
            "predicate": [{
                //triples-subject-PREDICATE-object
                //PREDICATE
                token: "support.function",
                regex: iri + "|" + prefixedname + "|a",
                next: "object"
            }],
            "object": [{
                //triples-subject-predicate-OBJECT
                //PREDICATE
                token: "variable.language",
                regex: iri + "|" + prefixedname + "|" + blanknode + "|" + literal,
                next: "nexttoobject",
                caseInsensitive: true
            }],
            "nexttoobject": [{
                //triples-subject-predicate-OBJECT
                //PREDICATE
                token: "constant.language.boolean",
                regex: "['.']",
                next: "start"
            }, {
                //triples-subject-predicate-OBJECT
                //PREDICATE
                token: "constant.language.boolean",
                regex: "[',']",
                next: "object"
            }, {
                //triples-subject-predicate-OBJECT
                //PREDICATE
                token: "support.function",
                regex: ";",
                next: "predicate"
            }],
            "hex": [{
                token: "paran.lparan",
                regex: "[0-9]|[A-F]|[a-f]",
                //next: "tag_stuff"
            }]
        };
    };

    oop.inherits(TurtleHighlightRules, TextHighlightRules);
    exports.TurtleHighlightRules = TurtleHighlightRules;
});