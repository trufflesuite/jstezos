import {datetime} from 'datetime';
var _pj;
var line_size;

function _pj_snippets(container) {
    function _assert(comp, msg) {
        function PJAssertionError(message) {
            this.name = "PJAssertionError";
            this.message = (message || "Custom error PJAssertionError");
            if (((typeof Error.captureStackTrace) === "function")) {
                Error.captureStackTrace(this, this.constructor);
            } else {
                this.stack = new Error(message).stack;
            }
        }
        PJAssertionError.prototype = Object.create(Error.prototype);
        PJAssertionError.prototype.constructor = PJAssertionError;
        msg = (msg || "Assertion failed.");
        if ((! comp)) {
            throw new PJAssertionError(msg);
        }
    }
    function in_es6(left, right) {
        if (((right instanceof Array) || ((typeof right) === "string"))) {
            return (right.indexOf(left) > (- 1));
        } else {
            if (((right instanceof Map) || (right instanceof Set) || (right instanceof WeakMap) || (right instanceof WeakSet))) {
                return right.has(left);
            } else {
                return (left in right);
            }
        }
    }
    container["_assert"] = _assert;
    container["in_es6"] = in_es6;
    return container;
}
_pj = {};
_pj_snippets(_pj);

line_size = 100;
function format_timestamp(timestamp) {
    var dt;
    dt = datetime.utcfromtimestamp(timestamp);
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ");
}
class MichelsonFormatterError extends ValueError {
}
function is_framed(node) {
    if (node['prim'] in {'Pair', 'Left', 'Right', 'Some',
'pair', 'or', 'option', 'map', 'big_map', 'list', 'set', 'contract', 'lambda'} // TODO transpile
) {
        return true;
    } else {
        if (node['prim'] in {'key', 'unit', 'signature', 'operation',
'int', 'nat', 'string', 'bytes', 'mutez', 'bool', 'key_hash', 'timestamp', 'address'} // TODO transpile
) {
            return _pj.in_es6("annots", node);
        }
    }
    return false;
}
function is_complex(node) {
    return ((node["prim"] === "LAMBDA") || node["prim"].startswith("IF"));
}
function is_inline(node) {
    return (node["prim"] === "PUSH");
}
function is_script(node) {
    return all(map((x) => {
    return ((x instanceof dict) && _pj.in_es6(x.get("prim"), ["parameter", "storage", "code"]));
}, node));
}
function format_node(node, indent = "", inline = false, is_root = false, wrapped = false) {
    var alt_indent, arg_indent, args, expr, is_script_root, item, items, length, seq, seq_indent, space;
    if ((node instanceof list)) {
        is_script_root = (is_root && is_script(node));
        seq_indent = (is_script_root ? indent : (indent + (" " * 2)));
        items = list(map((x) => {
    return format_node(x, seq_indent, inline, {"wrapped": true});
}, node));
        if (items) {
            length = ((indent.length + sum(map(len, items))) + 4);
            space = (is_script_root ? "" : " ");
            if ((inline || (length < line_size))) {
                seq = `${space}; `.join(items);
            } else {
                seq = `${space};
${seq_indent}`
.join(items);
            }
            return (is_script_root ? seq : `{ ${seq} }`);
        } else {
            return "{}";
        }
    } else {
        if ((node instanceof dict)) {
            if (node.get("prim")) {
                expr = " ".join(([node["prim"]] + node.get("annots", [])));
                args = node.get("args", []);
                if (is_complex(node)) {
                    arg_indent = (indent + (" " * 2));
                    items = list(map((x) => {
    return format_node(x, arg_indent, inline);
}, args));
                    length = ((((indent.length + expr.length) + sum(map(len, items))) + items.length) + 1);
                    if ((inline || (length < line_size))) {
                        expr = `${expr} ${" ".join(items)}`;
                    } else {
                        expr = `
${arg_indent}`
.join(([expr] + items));
                    }
                } else {
                    if ((args.length === 1)) {
                        arg_indent = (indent + (" " * (expr.length + 1)));
                        expr = `${expr} ${format_node(args[0], arg_indent, inline)}`;
                    } else {
                        if ((args.length > 1)) {
                            arg_indent = (indent + (" " * 2));
                            alt_indent = (indent + (" " * (expr.length + 2)));
                            for (var arg, _pj_c = 0, _pj_a = args, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                                arg = _pj_a[_pj_c];
                                item = format_node(arg, arg_indent, inline);
                                length = (((indent.length + expr.length) + item.length) + 1);
                                if (((inline || is_inline(node)) || (length < line_size))) {
                                    arg_indent = alt_indent;
                                    expr = `${expr} ${item}`;
                                } else {
                                    expr = `${expr}
${arg_indent}${item}`
;
                                }
                            }
                        }
                    }
                }
                if (((is_framed(node) && (! is_root)) && (! wrapped))) {
                    return `(${expr})`;
                } else {
                    return expr;
                }
            } else {
                core_type, value = next((k, v) for k, v in node.items() if k[0] != '_' and k != 'annots') // TODO transpile;
                if ((core_type === "int")) {
                    return value;
                } else {
                    if ((core_type === "bytes")) {
                        return `0x${value}`;
                    } else {
                        if ((core_type === "string")) {
                            return JSON.stringify(value);
                        } else {
                            _pj._assert(false, `unexpected core node ${node}`);
                        }
                    }
                }
            }
        } else {
            _pj._assert(false, `unexpected node ${node}`);
        }
    }
}
function micheline_to_michelson(data, inline = false, wrap = false) {
    /*
    Converts micheline expression into formatted Michelson source
    :param data: Micheline expression
    :param inline: produce single line, used for tezos-client arguments (False by default)
    :param wrap: ensure expression is wrapped in brackets
    :return: string
    */
    var res;
    try {
        res = format_node(data, {"inline": inline, "is_root": true});
        if ((wrap && any(map(res.startswith, ["Left", "Right", "Some", "Pair"])))) {
            return `(${res})`;
        } else {
            return res;
        }
    } catch(e) {
        if (((e instanceof KeyError) || (e instanceof IndexError) || (e instanceof TypeError))) {
            console.log(JSON.stringify(data));
            throw new MichelsonFormatterError(e.args);
        } else {
            throw e;
        }
    }
}
export {MichelsonFormatterError, format_node, format_timestamp, is_complex, is_framed, is_inline, is_script, micheline_to_michelson, line_size};

//# sourceMappingURL=formatter.js.map
