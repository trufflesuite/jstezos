import {blake2b_32} from '../crypto';
import {base58_encode, forge_address, forge_base58, forge_contract, forge_public_key, forge_timestamp} from '../encoding';
import {forge_micheline, unforge_micheline} from './forge';
import {parse_prim_expr} from '../repl/parser';
var _pj;

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

function prepack_micheline(val_expr, type_expr) {
    function try_pack(val_node, type_node) {
        var is_string, type_args, type_idx, type_prim;
        [type_prim, type_args] = parse_prim_expr(type_node);
        is_string = ((val_node instanceof dict) && val_node.get("string"));
        if (_pj.in_es6(type_prim, ["set", "list"])) {
            val_node = function () {
    var _pj_a = [], _pj_b = val_node;
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var i = _pj_b[_pj_c];
        _pj_a.push(try_pack(i, type_args[0]));
    }
    return _pj_a;
}
.call(this);
        } else {
            if (_pj.in_es6(type_prim, ["map", "big_map"])) {
                val_node = function () {
    var _pj_a = [], _pj_b = val_node;
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var elt = _pj_b[_pj_c];
        _pj_a.push({"prim": "Elt", "args": function () {
    var _pj_e = [], _pj_f = [0, 1];
    for (var _pj_g = 0, _pj_h = _pj_f.length; (_pj_g < _pj_h); _pj_g += 1) {
        var i = _pj_f[_pj_g];
        _pj_e.push(try_pack(elt["args"][i], type_args[i]));
    }
    return _pj_e;
}
.call(this)});
    }
    return _pj_a;
}
.call(this);
            } else {
                if ((type_prim === "pair")) {
                    val_node["args"] = function () {
    var _pj_a = [], _pj_b = [0, 1];
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var i = _pj_b[_pj_c];
        _pj_a.push(try_pack(val_node["args"][i], type_args[i]));
    }
    return _pj_a;
}
.call(this);
                } else {
                    if ((type_prim === "option")) {
                        if ((val_node["prim"] === "Some")) {
                            val_node["args"] = [try_pack(val_node["args"][0], type_args[0])];
                        }
                    } else {
                        if ((type_prim === "or")) {
                            type_idx = ((val_node["prim"] === "Left") ? 0 : 1);
                            val_node["args"] = [try_pack(val_node["args"][0], type_args[type_idx])];
                        } else {
                            if ((type_prim === "lambda")) {
                            } else {
                                if (((type_prim === "chain_id") && is_string)) {
                                    return {"bytes": forge_base58(val_node["string"]).hex()};
                                } else {
                                    if (((type_prim === "signature") && is_string)) {
                                        return {"bytes": forge_base58(val_node["string"]).hex()};
                                    } else {
                                        if (((type_prim === "key_hash") && is_string)) {
                                            return {"bytes": forge_address(val_node["string"], {"tz_only": true}).hex()};
                                        } else {
                                            if (((type_prim === "key") && is_string)) {
                                                return {"bytes": forge_public_key(val_node["string"]).hex()};
                                            } else {
                                                if (((type_prim === "address") && is_string)) {
                                                    return {"bytes": forge_address(val_node["string"]).hex()};
                                                } else {
                                                    if (((type_prim === "contract") && is_string)) {
                                                        return {"bytes": forge_contract(val_node["string"]).hex()};
                                                    } else {
                                                        if (((type_prim === "timestamp") && is_string)) {
                                                            return {"int": forge_timestamp(val_node["string"])};
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return val_node;
    }
    return try_pack(val_expr, type_expr);
}
function pack(val_expr, type_expr) {
    var data;
    data = prepack_micheline(val_expr, type_expr);
    return b'' + forge_micheline(data) // TODO Transpile
;
}
function get_sub_expr(type_expr, bin_path = "0") {
    var node;
    _pj._assert((bin_path.length > 0), `binary path should be at least `0``);
    node = type_expr;
    for (var idx, _pj_c = 0, _pj_a = bin_path.slice(1), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
        idx = _pj_a[_pj_c];
        _pj._assert((node instanceof dict), `type expression contains dict nodes only`);
        node = node["args"][Number.parseInt(idx)];
    }
    return node;
}
function get_key_hash(val_expr, type_expr, bin_path = "") {
    var data;
    for (var idx, _pj_c = 0, _pj_a = bin_path, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
        idx = _pj_a[_pj_c];
        _pj._assert((type_expr instanceof dict), `type expression contains dict nodes only`);
        type_expr = type_expr["args"][Number.parseInt(idx)];
    }
    data = blake2b_32(pack(val_expr, type_expr)).digest();
    return base58_encode(data, b'expr' // TODO transpile
).decode();
}
function unpack(data, type_expr) {
    var parsed;
    _pj._assert(data.startswith(b'') // TODO transpile
, `packed data should start with 05`), null);
    parsed = unforge_micheline(data.slice(1));
    return parsed;
}
export {get_key_hash, get_sub_expr, pack, prepack_micheline, unpack};

//# sourceMappingURL=pack.js.map
