import {pprint} from 'pprint';
import {namedtuple} from 'collections';
import {prim_tags} from 'pytezos/michelson/forge';
import {Schema, build_maps, collapse_micheline, make_micheline, michelson_to_micheline, parse_json, parse_micheline} from 'pytezos/michelson/micheline';
import {micheline_to_michelson} from 'pytezos/michelson/formatter';
import {generate_docstring} from 'pytezos/michelson/docstring';
var _pj;
var BigMapSchema;

function applyMixins(derivedCtor, baseCtors) {
baseCtors.forEach(baseCtor => {
Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
});
});
}

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

function applyMixins(derivedCtor, baseCtors) {
baseCtors.forEach(baseCtor => {
Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
});
});
}

BigMapSchema = namedtuple("BigMapSchema", ["bin_to_id", "id_to_bin"]);
class MichelineSchemaError extends ValueError {
}
function build_schema(code) {
    /*
    Creates internal structures necessary for decoding/encoding micheline:
    `metadata` -> micheline tree with collapsed `pair`, `or`, and `option` nodes
    `bin_types` -> maps binary path to primitive
    `bin_names` -> binary path to key name mapping
    `json_to_bin` -> json path to binary path mapping
    :param code: parameter or storage section of smart contract source code (in micheline)
    :return: Schema
    */
    var metadata;
    try {
        metadata = collapse_micheline(code);
        return new Schema(metadata, ...build_maps(metadata));
    } catch(e) {
        if (((e instanceof KeyError) || (e instanceof ValueError) || (e instanceof TypeError))) {
            pprint(code, {"compact": true});
            throw new MichelineSchemaError(`Failed to build schema`, e.args);
        } else {
            throw e;
        }
    }
}
function decode_micheline(val_expr, type_expr, schema, root = "0") {
    /*
    Converts Micheline data into Python object
    :param val_expr: Micheline value expression
    :param type_expr: Michelson type expression for the entire type
    :param schema: schema built for particular contract/section
    :param root: which binary node to take as root, used to decode BigMap values/diffs
    :return: Object
    */
    try {
        return parse_micheline(val_expr, type_expr, schema, root);
    } catch(e) {
        if (((e instanceof KeyError) || (e instanceof IndexError) || (e instanceof TypeError))) {
            console.log(generate_docstring(schema, "schema"));
            pprint(val_expr, {"compact": true});
            throw new MichelineSchemaError(`Failed to decode micheline expression`, e.args);
        } else {
            throw e;
        }
    }
}
function encode_micheline(data, schema, root = "0", binary = false) {
    /*
    Converts Python object into Micheline expression
    :param data: Python object
    :param schema: schema built for particular contract/section
    :param root: which binary node to take as root, used to encode BigMap values
    :param binary: Encode keys and addresses in bytes rather than strings, default is False
    :return: Micheline expression
    */
    var bin_values;
    {
    let __whatever__ = false;
    try {
        bin_values = parse_json(data, schema, root);
        return make_micheline(bin_values, schema.bin_types, root, binary);
    } catch(e) {
        __whatever__ = true;
        if (((e instanceof KeyError) || (e instanceof IndexError) || (e instanceof TypeError))) {
            console.log(generate_docstring(schema, "schema"));
            pprint(data, {"compact": true});
            throw new MichelineSchemaError(`Failed to encode micheline expression`, e.args);
        } else {
            throw e;
        }
    } finally {
        if(__whatever__) {
        console.log("WORKS?!")
        }
    }
    }
}
function convert(source, schema = null, output = "micheline", inline = false) {
    /*
    Convert data between different representations (DO NOT USE FOR STORAGE/PARAMETER, can be ambiguous)
    :param source: Data, can be one of Michelson (string), Micheline expression, object
    :param schema: Needed if decoding/encoding objects (optional)
    :param output: Output format, one of 'micheline' (default), 'michelson', 'object'
    :param inline: Used for michelson output, whether to omit line breaks
    */
    if ((((typeof source) === "string") || (source instanceof String))) {
        try {
            source = michelson_to_micheline(source);
        } catch(e) {
            if ((e instanceof ValueError)) {
                _pj._assert(schema, null);
                source = encode_micheline(source, schema);
            } else {
                throw e;
            }
        }
    } else {
        if ((! is_micheline(source))) {
            _pj._assert(schema, null);
            source = encode_micheline(source, schema);
        }
    }
    if ((output === "michelson")) {
        return micheline_to_michelson(source, inline);
    } else {
        if ((output === "object")) {
            _pj._assert(false, `not supported`);
        } else {
            if ((output === "micheline")) {
                return source;
            } else {
                _pj._assert(false, output);
            }
        }
    }
}
function build_big_map_schema(data, schema) {
    var big_map_id, bin_to_id, id_to_bin;
    bin_to_id = dict();
    id_to_bin = dict();
    function get_big_map_id(node, path) {
        if ((path.length === 0)) {
            _pj._assert(node.get("int"), [node, path]);
            return Number.parseInt(node["int"]);
        } else {
            _pj._assert(node.get("args"), [node, path]);
            return get_big_map_id(node["args"][Number.parseInt(path[0])], path.slice(1));
        }
    }
    for (var bin_path, prim, _pj_c = 0, _pj_a = schema.bin_types.items(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
        bin_path = _pj_a[_pj_c];
        prim = _pj_a[_pj_c];
        if ((prim === "big_map")) {
            big_map_id = get_big_map_id(data, bin_path.slice(1));
            [bin_to_id[bin_path], id_to_bin[big_map_id]] = [big_map_id, bin_path];
        }
    }
    return new BigMapSchema(bin_to_id, id_to_bin);
}
function is_micheline(value) {
    var primitives;
    if ((value instanceof list)) {
        function get_prim(x) {
            return ((x instanceof dict) ? x.get("prim") : null);
        }
        return set(map(get_prim, value)) == {'parameter', 'storage', 'code'} // TODO transpile;
    } else {
        if ((value instanceof dict)) {
            primitives = list(prim_tags.keys());
            return any(map((x) => {
    return _pj.in_es6(x, value);
}, ["prim", "args", "annots", ...primitives]));
        } else {
            return false;
        }
    }
}
export {build_big_map_schema, build_schema, convert, decode_micheline, encode_micheline, is_micheline, BigMapSchema};

//# sourceMappingURL=converter.js.map
