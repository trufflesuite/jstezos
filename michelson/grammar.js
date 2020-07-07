import {LexToken, Lexer, lex} from 'ply/lex';
import {yacc} from 'ply/yacc';
import * as re from 're';
import * as json from 'json';
import {expand_macro} from 'pytezos/michelson/macros';
var _pj;

function applyMixins(derivedCtor, baseCtors) {
baseCtors.forEach(baseCtor => {
Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
});
});
}

function _pj_snippets(container) {
    function set_properties(cls, props) {
        var desc, value;
        var _pj_a = props;
        for (var p in _pj_a) {
            if (_pj_a.hasOwnProperty(p)) {
                value = props[p];
                if (((((! ((value instanceof Map) || (value instanceof WeakMap))) && (value instanceof Object)) && ("get" in value)) && (value.get instanceof Function))) {
                    desc = value;
                } else {
                    desc = {"value": value, "enumerable": false, "configurable": true, "writable": true};
                }
                Object.defineProperty(cls.prototype, p, desc);
            }
        }
    }
    container["set_properties"] = set_properties;
    return container;
}
_pj = {};
_pj_snippets(_pj);

function applyMixins(derivedCtor, baseCtors) {
baseCtors.forEach(baseCtor => {
Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
});
});
}

class MichelsonParserError extends ValueError {
    constructor(token, message = null) {
        message = (message || `failed to parse expression ${token}`);
        super(MichelsonParserError, self).__init__(message);
        this.message = message;
        this.line = token.lineno;
        this.pos = token.lexpos;
    }
}
class Sequence extends list {
}
class SimpleMichelsonLexer extends Lexer {
    constructor() {
        super(SimpleMichelsonLexer, self).__init__();
        this.lexer = lex({"module": this, "reflags": re.MULTILINE});
    }
    t_error(t) {
        t.type = t.value[0];
        t.value = t.value[0];
        t.lexer.skip(1);
        return t;
    }
}
_pj.set_properties(SimpleMichelsonLexer, {"t_ANNOT": "[:@%]+([_0-9a-zA-Z\\.]*)?", "t_BYTE": "0x[A-Fa-f0-9]*", "t_INT": "-?[0-9]+", "t_LEFT_CURLY": "\\{", "t_LEFT_PAREN": "\\(", "t_PRIM": "[A-Za-z][A-Za-z0-9_]+", "t_RIGHT_CURLY": "\\}", "t_RIGHT_PAREN": "\\)", "t_SEMI": ";", "t_STR": "\\\"(\\\\.|[^\\\"])*\\\"", "t_ignore": " \t\r\n\f", "t_ignore_COMMENT": "#[^\\n]*", "t_ignore_MULTI_COMMENT": "/\\*.*?\\*/", "tokens": ["INT", "BYTE", "STR", "ANNOT", "PRIM", "LEFT_CURLY", "RIGHT_CURLY", "LEFT_PAREN", "RIGHT_PAREN", "SEMI"]});
class MichelsonParser extends object {
    /*Customizable Michelson parser
    */
    p_instr(p) {
        /*instr : expr
        | empty
        */
        p[0] = p[1];
    }
    p_instr_int(p) {
        /* instr : INT */
        p[0] = {"int": p[1]};
    }
    p_instr_byte(p) {
        /* instr : BYTE */
        p[0] = {"bytes": p[1].slice(2)};
    }
    p_instr_str(p) {
        /* instr : STR */
        p[0] = {"string": json.loads(p[1])};
    }
    p_instr_list(p) {
        /* instr : instr SEMI instr */
        p[0] = list();
        for (var i, _pj_c = 0, _pj_a = [p[1], p[3]], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            i = _pj_a[_pj_c];
            if ((Object.getPrototypeOf(i) === list)) {
                p[0].extend(i);
            } else {
                if ((i !== null)) {
                    p[0].append(i);
                }
            }
        }
    }
    p_instr_subseq(p) {
        /* instr : LEFT_CURLY instr RIGHT_CURLY */
        p[0] = new Sequence();
        if ((Object.getPrototypeOf(p[2]) === list)) {
            p[0].extend(p[2]);
        } else {
            if ((p[2] !== null)) {
                p[0].append(p[2]);
            }
        }
    }
    p_expr(p) {
        /* expr : PRIM annots args */
        var expr;
        try {
            expr = expand_macro({"prim": p[1], "annots": (p[2] || []), "args": (p[3] || []), "extra": this.extra});
        } catch(e) {
            if ((e instanceof AssertionError)) {
                throw new MichelsonParserError(p.slice[1], e.toString());
            } else {
                throw e;
            }
        }
        p[0] = ((expr instanceof list) ? new Sequence(expr) : expr);
    }
    p_annots(p) {
        /*annots : annot
        | empty
        */
        if ((p[1] !== null)) {
            p[0] = [p[1]];
        }
    }
    p_annots_list(p) {
        /* annots : annots annot */
        p[0] = list();
        if ((Object.getPrototypeOf(p[1]) === list)) {
            p[0].extend(p[1]);
        }
        if ((p[2] !== null)) {
            p[0].append(p[2]);
        }
    }
    p_annot(p) {
        /* annot : ANNOT */
        p[0] = p[1];
    }
    p_args(p) {
        /*args : arg
        | empty
        */
        p[0] = list();
        if ((p[1] !== null)) {
            p[0].append(p[1]);
        }
    }
    p_args_list(p) {
        /* args : args arg */
        p[0] = list();
        if ((Object.getPrototypeOf(p[1]) === list)) {
            p[0].extend(p[1]);
        }
        if ((p[2] !== null)) {
            p[0].append(p[2]);
        }
    }
    p_arg_prim(p) {
        /* arg : PRIM */
        p[0] = {"prim": p[1]};
    }
    p_arg_int(p) {
        /* arg : INT */
        p[0] = {"int": p[1]};
    }
    p_arg_byte(p) {
        /* arg : BYTE */
        p[0] = {"bytes": p[1].slice(2)};
    }
    p_arg_str(p) {
        /* arg : STR */
        p[0] = {"string": json.loads(p[1])};
    }
    p_arg_subseq(p) {
        /* arg : LEFT_CURLY instr RIGHT_CURLY */
        if ((Object.getPrototypeOf(p[2]) === list)) {
            p[0] = p[2];
        } else {
            if ((p[2] !== null)) {
                p[0] = [p[2]];
            } else {
                p[0] = [];
            }
        }
    }
    p_arg_group(p) {
        /* arg : LEFT_PAREN expr RIGHT_PAREN */
        p[0] = p[2];
    }
    p_empty(p) {
        /* empty : */
    }
    p_error(p) {
        throw new MichelsonParserError(p);
    }
    constructor(debug = false, write_tables = false, extra_primitives = null) {
        /*Initialize Michelson parser

        :param debug: Verbose output
        :param write_tables: Store PLY output
        :param extra_primitives: List of words to be ignored
        */
        this.lexer = new SimpleMichelsonLexer();
        this.parser = yacc({"module": this, "debug": debug, "write_tables": write_tables});
        this.extra = extra_primitives;
    }
    parse(code) {
        /*Parse Michelson source.

        :param code: Michelson source
        :returns: Micheline expression
        */
        if ((((code.length > 0) && (code[0] === "(")) && (code.slice((- 1))[0] === ")"))) {
            code = code.slice(1, (- 1));
        }
        return this.parser.parse(code);
    }
}
_pj.set_properties(MichelsonParser, {"tokens": SimpleMichelsonLexer.tokens});
export {MichelsonParser, MichelsonParserError, Sequence, SimpleMichelsonLexer};

//# sourceMappingURL=grammar.js.map
