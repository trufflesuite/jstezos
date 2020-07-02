import {basename} from 'os/path';
import {Schema, is_optional} from 'pytezos/michelson/micheline';
var _pj;
var core_types, domain_types;

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

core_types = ["string", "int", "bool"];
domain_types = {"nat": "int  /* Natural number */", "unit": "Unit || None /* Void */", "bytes": "string  /* Hex string */ ||\n\tbytes  /* Python byte string */", "timestamp": "int  /* Unix time in seconds */ ||\n\tstring  /* Formatted datetime `%Y-%m-%dT%H:%M:%SZ` */", "mutez": "int  /* Amount in `utz` (10^-6) */ ||\n\tDecimal  /* Amount in `tz` */", "contract": "string  /* Base58 encoded `KT` address */", "address": "string  /* Base58 encoded `tz` or `KT` address */", "key": "string  /* Base58 encoded public key */", "key_hash": "string  /* Base58 encoded public key hash */", "signature": "string  /* Base58 encoded signature */", "lambda": "string  /* Michelson source code */"};
function generate_docstring(schema, title, root = "0") {
    /*Generate Michelson type (of arbitrary complexity) documentation in a more readable form.

    :param schema: parameter/storage schema
    :param title: documentation title
    :param root: binary path to the root element (default is '0')
    :returns: formatted docstring
    */
    var docstring, known_types;
    docstring = list();
    known_types = set();
    function get_node(bin_path) {
        return schema.metadata[bin_path];
    }
    function get_name(bin_path) {
        var name;
        name = schema.bin_names.get(bin_path);
        if ((! name)) {
            name = next(basename(k) for k, v in schema.json_to_bin.items() if v == bin_path
, bin_path);
        }
        return name;
    }
    function get_type(bin_path) {
        var _default;
        _default = (get_name(bin_path.slice(0, (- 1))) + "_item");
        return schema.metadata[bin_path].get("typename", _default);
    }
    function get_comment(bin_path) {
        var node;
        node = schema.metadata[bin_path];
        return node.get("typename", node.get("fieldname"));
    }
    function decode_node(bin_path, is_element = false, is_entry = false) {
        var bin_type, comment, doc, entries, item, items, lines, node, parameter, res, value, values;
        node = get_node(bin_path);
        bin_type = schema.bin_types[bin_path];
        function get_struct_name() {
            var struct_name;
            if ((bin_path === root)) {
                struct_name = title;
            } else {
                if (is_element) {
                    struct_name = get_type(bin_path);
                } else {
                    struct_name = get_name(bin_path);
                }
            }
            return `$${struct_name}`;
        }
        if ((bin_type === "router")) {
            entries = {[get_name(x)]: decode_node(x, is_entry=True) for x in node['args']
};
            doc = " || \n\t".join(map((x) => {
    return (("{ " + `"${x[0]}": ${x[1]}`) + " }");
}, entries.items()));
            res = get_struct_name();
            docstring.insert(0, `${res}:
${doc}`
);
            return res;
        } else {
            if ((bin_type === "enum")) {
                res = " || ".join(map((x) => {
    return `"${get_name(x)}"`;
}, node["args"]));
            } else {
                if ((bin_type === "namedtuple")) {
                    items = map((x) => {
    return [get_name(x), decode_node(x)];
}, node["args"]);
                    lines = map((x) => {
    return `  "${x[0]}": ${x[1]}`;
}, items);
                    doc = (("\t{\n\t" + ",\n\t".join(lines)) + "\n\t}");
                    res = get_struct_name();
                    docstring.insert(0, `${res}:
${doc}`
);
                    return res;
                } else {
                    if ((bin_type === "tuple")) {
                        values = map(decode_node, node["args"]);
                        res = `[ ${" , ".join(values)} ]`;
                    } else {
                        if (bin_type in {'keypair', 'pair'}
) {
                            values = map(decode_node, node["args"]);
                            res = `( ${" , ".join(values)} )`;
                        } else {
                            if (bin_type in {'set', 'list'}
) {
                                value = decode_node(node["args"][0], {"is_element": true});
                                res = `[ ${value} , ... ]`;
                            } else {
                                if (bin_type in {'map', 'big_map'}
) {
                                    item = [decode_node(node["args"][0]), decode_node(node["args"][1], {"is_element": true})];
                                    res = (("{ " + `${item[0]} : ${item[1]} , ...`) + " }");
                                    if ((bin_type === "big_map")) {
                                        res += "  /* big_map */";
                                    }
                                } else {
                                    res = node["prim"];
                                    if ((! _pj.in_es6(res, core_types))) {
                                        res = `$${res}`;
                                    }
                                    if (is_entry) {
                                        comment = get_comment(bin_path);
                                        if (comment) {
                                            res = `${res}  /* ${comment} */`;
                                        }
                                    }
                                    if (_pj.in_es6(node["prim"], ["contract", "lambda"])) {
                                        parameter = schema.metadata[bin_path]["parameter"];
                                        res = `${res} (${parameter})`;
                                    }
                                    if (is_optional(schema, bin_path)) {
                                        res = `None || ${res}`;
                                    }
                                    if ((! _pj.in_es6(node["prim"], core_types))) {
                                        if ((bin_path === root)) {
                                            res = domain_types[node["prim"]];
                                        } else {
                                            _pj._assert(_pj.in_es6(node["prim"], domain_types), `not a domain type ${node["prim"]}`);
                                            known_types.add(node["prim"]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if ((bin_path === root)) {
            docstring.insert(0, `$${title}:
${res}`
);
        }
        return res;
    }
    decode_node(root);
    for (var prim, _pj_c = 0, _pj_a = known_types, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
        prim = _pj_a[_pj_c];
        docstring.append(`$${prim}:
${domain_types[prim]}`
);
    }
    return "\n".join(docstring);
}
export {generate_docstring, core_types, domain_types};

//# sourceMappingURL=docstring.js.map
