import {Interop} from 'pytezos/interop';
import {BigMap, Map, StackItem} from 'pytezos/repl/types';
import {assert_big_map_val, assert_comparable, assert_expr_equal, get_int, parse_expression} from 'pytezos/repl/parser';
import {get_key_hash} from 'pytezos/michelson/pack';
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

function make_elt(args) {
    _pj._assert(((args instanceof list) && (args.length === 2)), null);
    return {"prim": "Elt", "args": args};
}
function elt_to_update(elt, type_expr, big_map_id) {
    var key_hash, update;
    key_hash = get_key_hash(elt["args"][0], type_expr["args"][0]);
    update = {"action": "update", "big_map": big_map_id.toString(), "key_hash": key_hash, "key": elt["args"][0], "value": elt["args"][1]};
    return [key_hash, update];
}
class BigMapPool {
    constructor() {
        this.maps = {};
        this.tmp_id = (- 1);
        this.alloc_id = 0;
        this.maybe_remove = set();
    }
    reset() {
        this.maps.clear();
        this.tmp_id = (- 1);
        this.alloc_id = 0;
        this.maybe_remove.clear();
    }
    empty(k_type_expr, v_type_expr) {
        var res;
        assert_comparable(k_type_expr);
        assert_big_map_val(v_type_expr);
        res = new BigMap({"val": this.tmp_id, "val_expr": {"int": this.tmp_id.toString(), "_diff": {}}, "type_expr": {"prim": "big_map", "args": [k_type_expr, v_type_expr]}});
        this.tmp_id -= 1;
        return res;
    }
    _pre_alloc(val_expr, type_expr) {
        var res;
        res = {"int": this.tmp_id.toString(), "_diff": dict(elt_to_update(elt, type_expr, self.tmp_id) for elt in val_expr)
};
        this.tmp_id -= 1;
        return res;
    }
    _check_allocated(val_expr, type_expr, network = null) {
        var _, big_map, big_map_id;
        big_map_id = get_int(val_expr);
        _pj._assert((big_map_id >= 0), `expected an allocated big map (>=0), got ${big_map_id}`);
        if (_pj.in_es6(big_map_id, this.maps)) {
            big_map = this.maps[big_map_id];
            _ = function () {
    var _pj_a = [], _pj_b = [0, 1];
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var i = _pj_b[_pj_c];
        _pj_a.push(assert_expr_equal(type_expr["args"][i], big_map.type_expr["args"][i]));
    }
    return _pj_a;
}
.call(this);
            return [big_map_id, {"_diff": {}}];
        } else {
            _pj._assert(network, `big map #${big_map_id} is not allocated`);
            this.alloc_id = max(this.alloc_id, (big_map_id + 1));
            return [big_map_id, {"_diff": {}, "_network": network}];
        }
    }
    _pre_copy(val_expr, type_expr, network = null) {
        var big_map_id, kw, res;
        [big_map_id, kw] = this._check_allocated(val_expr, type_expr, network);
        res = {"int": this.tmp_id.toString(), "_copy": big_map_id, [None]: kw};
        this.tmp_id -= 1;
        return res;
    }
    _pre_remove(val_expr, type_expr, network = null) {
        var big_map_id, kw;
        [big_map_id, kw] = this._check_allocated(val_expr, type_expr, network);
        this.maybe_remove.add(big_map_id);
        return {"int": big_map_id.toString(), [None]: kw};
    }
    pre_alloc(val_expr, type_expr, copy = false, network = null) {
        var alloc_selector;
        alloc_selector = (val_node, type_node, res, type_path) => {
            var prim;
            prim = type_node["prim"];
            if (_pj.in_es6(prim, ["list", "set"])) {
                return res;
            }
            if (_pj.in_es6(prim, ["pair", "or"])) {
                return {"prim": val_node["prim"], "args": res};
            } else {
                if (((prim === "option") && (val_node["prim"] === "Some"))) {
                    return {"prim": val_node["prim"], "args": res};
                } else {
                    if ((prim === "map")) {
                        return list(map(make_elt, res));
                    } else {
                        if ((prim === "big_map")) {
                            if ((val_node instanceof list)) {
                                return this._pre_alloc(val_node, type_node);
                            } else {
                                if (copy) {
                                    return this._pre_copy(val_node, type_node, {"network": network});
                                } else {
                                    return this._pre_remove(val_node, type_node, {"network": network});
                                }
                            }
                        }
                    }
                }
            }
            return val_node;
        };
        val_expr = parse_expression(val_expr, type_expr, alloc_selector);
        return StackItem.parse({"val_expr": val_expr, "type_expr": type_expr});
    }
    diff(storage) {
        var alloc_id, maybe_remove, res, val_expr;
        var diff_selector;
        res = [];
        alloc_id = this.alloc_id;
        maybe_remove = this.maybe_remove;
        diff_selector = (val_node, type_node, val, type_path) => {
            var big_map_id, prim;
            nonlocal res, alloc_id, maybe_remove;
            prim = type_node["prim"];
            if (_pj.in_es6(prim, ["list", "set"])) {
                return val;
            }
            if (_pj.in_es6(prim, ["pair", "or"])) {
                return {"prim": val_node["prim"], "args": val};
            } else {
                if (((prim === "option") && (val_node["prim"] === "Some"))) {
                    return {"prim": val_node["prim"], "args": val};
                } else {
                    if ((prim === "map")) {
                        return list(map(make_elt, val));
                    } else {
                        if ((prim === "big_map")) {
                            _pj._assert((((typeof val) === "number") || (val instanceof Number)), `expected big map pointer`);
                            if ((val < 0)) {
                                big_map_id = alloc_id;
                                if (val_node.get("_copy")) {
                                    res.append({"action": "copy", "source_big_map": val_node["_copy"].toString(), "destination_big_map": big_map_id.toString()});
                                } else {
                                    res.append({"action": "alloc", "big_map": big_map_id.toString(), "key_type": type_node["args"][0], "value_type": type_node["args"][1]});
                                }
                                alloc_id += 1;
                            } else {
                                big_map_id = val;
                                maybe_remove.remove(big_map_id);
                            }
                            res.extend(map((x) => {
    return {[None]: x, "big_map": big_map_id.toString()};
}, val_node["_diff"].values()));
                            return {"int": big_map_id.toString()};
                        } else {
                            return val_node;
                        }
                    }
                }
            }
        };
        val_expr = parse_expression(storage.val_expr, storage.type_expr, diff_selector);
        res.extend(function () {
    var _pj_a = [], _pj_b = maybe_remove;
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var x = _pj_b[_pj_c];
        _pj_a.push({"action": "remove", "big_map": x});
    }
    return _pj_a;
}
.call(this));
        return [StackItem.parse(val_expr, storage.type_expr), res];
    }
    commit(big_map_diff) {
        var big_map_id, key, raw_map, val;
        for (var diff, _pj_c = 0, _pj_a = big_map_diff, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            diff = _pj_a[_pj_c];
            big_map_id = Number.parseInt(diff["big_map"]);
            raw_map = this.maps.get(big_map_id);
            if ((diff["action"] === "alloc")) {
                _pj._assert((raw_map === null), `#${big_map_id} already allocated`);
                this.maps[big_map_id] = Map.empty({"k_type_expr": diff["key_type"], "v_type_expr": diff["value_type"]});
            } else {
                if ((diff["action"] === "remove")) {
                    _pj._assert((raw_map !== null), `#${big_map_id} is not allocated`);
                    delete this.maps[big_map_id];
                } else {
                    if ((diff["action"] === "update")) {
                        _pj._assert((raw_map !== null), `#${big_map_id} is not allocated`);
                        key = raw_map.make_key(diff["key"]);
                        if (diff.get("value")) {
                            val = raw_map.make_val(diff["value"]);
                            this.maps[big_map_id] = raw_map.update(key, val);
                        } else {
                            this.maps[big_map_id] = raw_map.remove(key);
                        }
                    }
                }
            }
        }
        if (big_map_diff) {
            this.alloc_id = (max(function () {
    var _pj_a = [], _pj_b = big_map_diff;
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var x = _pj_b[_pj_c];
        _pj_a.push(Number.parseInt(x["big_map"]));
    }
    return _pj_a;
}
.call(this)) + 1);
        }
        this.maybe_remove.clear();
    }
    _get_big_map_val(big_map, key) {
        var key_hash, network, res;
        key_hash = get_key_hash(key.val_expr, key.type_expr);
        network = big_map.val_expr["_network"];
        try {
            res = new Interop().using(network).shell.head.context.big_maps[Number.parseInt(big_map)][key_hash]();
        } catch(e) {
            if ((e instanceof SyntaxError)) {
                res = null;
            } else {
                throw e;
            }
        }
        return res;
    }
    contains(big_map, key) {
        var v_val_expr;
        if (_pj.in_es6(key, big_map)) {
            return (big_map.find(key) !== null);
        }
        if ((Number.parseInt(big_map) >= 0)) {
            if (big_map.val_expr.get("_network")) {
                v_val_expr = this._get_big_map_val(big_map, key);
                return (v_val_expr !== null);
            } else {
                _pj._assert(_pj.in_es6(Number.parseInt(big_map), this.maps), `#${Number.parseInt(big_map)} is not allocated`);
                return _pj.in_es6(key, this.maps[Number.parseInt(big_map)]);
            }
        }
        return false;
    }
    find(big_map, key) {
        var v_val_expr;
        if (_pj.in_es6(key, big_map)) {
            return big_map.find(key);
        }
        if ((Number.parseInt(big_map) >= 0)) {
            if (big_map.val_expr.get("_network")) {
                v_val_expr = this._get_big_map_val(big_map, key);
                if (v_val_expr) {
                    return StackItem.parse({"val_expr": v_val_expr, "type_expr": big_map.type_expr["args"][1]});
                }
            } else {
                _pj._assert(_pj.in_es6(Number.parseInt(big_map), this.maps), `#${Number.parseInt(big_map)} is not allocated`);
                return this.maps[Number.parseInt(big_map)].find(key);
            }
        }
    }
}
export {BigMapPool, elt_to_update, make_elt};

//# sourceMappingURL=big_map.js.map
