import * as yaml from 'yaml';
import {deepcopy} from 'copy';
import {pformat} from 'pprint';
import {MichelsonParser, MichelsonParserError} from 'pytezos/michelson/grammar';
import {micheline_to_michelson, michelson_to_micheline} from 'pytezos/michelson/converter';
import {MichelsonRuntimeError, do_interpret} from 'pytezos/repl/control';
import {*} from 'pytezos/repl/helpers';
import {*} from 'pytezos/repl/arithmetic';
import {*} from 'pytezos/repl/structures';
import {*} from 'pytezos/repl/blockchain';
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

function get_content(obj) {
    var content;
    content = obj.get("_content");
    if (content) {
        return format_content(content);
    }
    return {};
}
function format_stack_item(item) {
    var row;
    row = {};
    if ((item instanceof Operation)) {
        row["value"] = yaml.dump(get_content(item.val_expr)).rstrip("\n");
    } else {
        if (((item instanceof List) && (item.val_type() === Operation))) {
            row["value"] = yaml.dump(function () {
    var _pj_a = [], _pj_b = item.val_expr;
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var x = _pj_b[_pj_c];
        _pj_a.push(get_content(x));
    }
    return _pj_a;
}
.call(this)).rstrip("\n");
        } else {
            row["value"] = micheline_to_michelson(item.val_expr);
        }
    }
    row["type"] = micheline_to_michelson(item.type_expr);
    if ((item.name !== null)) {
        row["name"] = `@${item.name}`;
    }
    return row;
}
function format_diff(diff) {
    if ((diff["action"] === "alloc")) {
        return {"big_map": diff["big_map"], "action": diff["action"], "key": micheline_to_michelson(diff["key_type"]), "value": micheline_to_michelson(diff["value_type"])};
    } else {
        if ((diff["action"] === "update")) {
            return {"big_map": diff["big_map"], "action": diff["action"], "key": micheline_to_michelson(diff["key"]), "value": (diff.get("value") ? micheline_to_michelson(diff["value"]) : "null")};
        } else {
            if ((diff["action"] === "copy")) {
                return {"destination_big_map": diff["big_map"], "action": diff["action"], "value": diff["source_big_map"]};
            } else {
                if ((diff["action"] === "remove")) {
                    return {"big_map": diff["big_map"], "action": diff["action"]};
                } else {
                    _pj._assert(false, diff["action"]);
                }
            }
        }
    }
}
function format_content(content) {
    var res;
    if ((content["kind"] === "transaction")) {
        return {"kind": content["kind"], "target": content["destination"], "amount": content["amount"], "entrypoint": content["parameters"]["entrypoint"], "parameters": micheline_to_michelson(content["parameters"]["value"])};
    } else {
        if ((content["kind"] === "origination")) {
            res = {"kind": content["kind"], "target": content["originated_contract"], "amount": content["balance"], "storage": micheline_to_michelson(content["script"]["storage"]), "code": micheline_to_michelson(content["script"]["code"])};
            if (content.get("delegate")) {
                res["delegate"] = content["delegate"];
            }
            return res;
        } else {
            if ((content["kind"] === "delegation")) {
                return {"kind": content["kind"], "target": content["delegate"]};
            } else {
                _pj._assert(false, content["kind"]);
            }
        }
    }
}
function format_stdout(items) {
    var depth, newline, res;
    newline = true;
    depth = 0;
    res = [];
    function break_line() {
        nonlocal newline // TODO transpile;
        nonlocal res // TODO transpile;
        if ((! newline)) {
            res.append("\n");
            newline = true;
        }
    }
    for (var item, _pj_c = 0, _pj_a = items, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
        item = _pj_a[_pj_c];
        if ((item["action"] === "begin")) {
            break_line();
            if ((! _pj.in_es6(item["prim"], ["parameter", "storage", "code", "STORAGE", "DUMP"]))) {
                res.extend([("  " * depth), item["prim"], ":"]);
                depth += 1;
                newline = false;
            }
        } else {
            if ((item["action"] === "end")) {
                depth -= 1;
                break_line();
            } else {
                if (_pj.in_es6(item["action"], ["message", "event"])) {
                    res.append((newline ? ("  " * depth) : " "));
                    res.extend([item["text"], ";"]);
                    newline = false;
                } else {
                    _pj._assert(false, item["action"]);
                }
            }
        }
    }
    res = "".join(res).strip("\n");
    if (((! _pj.in_es6("\n", res)) && all(map((x) => {
    return (x["action"] !== "message");
}, items)))) {
        return "";
    }
    return res;
}
function format_result(result) {
    var big_map_diff, kind, operations, storage;
    if ((result === null)) {
        return null;
    }
    kind = result["kind"];
    if ((kind === "message")) {
        return result;
    } else {
        if ((kind === "big_map_diff")) {
            return {"value": list(map(format_diff, result["big_map_diff"])), [None]: result};
        } else {
            if ((kind === "code")) {
                return {"value": micheline_to_michelson(result["code"]), [None]: result};
            } else {
                if ((kind === "stack")) {
                    return {"value": list(map(format_stack_item, result["stack"])), [None]: result};
                } else {
                    if ((kind === "output")) {
                        operations = function () {
    var _pj_a = [], _pj_b = result["operations"].val_expr;
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var x = _pj_b[_pj_c];
        _pj_a.push(format_content(x.get("_content")));
    }
    return _pj_a;
}
.call(this);
                        storage = [format_stack_item(result["storage"])];
                        big_map_diff = list(map(format_diff, result["big_map_diff"]));
                        return {"value": [operations, storage, big_map_diff], [None]: result};
                    } else {
                        _pj._assert(false, kind);
                    }
                }
            }
        }
    }
}
function format_stderr(error) {
    var ename, evalue, traceback;
    ename = Object.getPrototypeOf(error).__name__;
    if ((error instanceof MichelsonRuntimeError)) {
        [evalue, traceback] = [error.message, ("at " + " -> ".join(error.trace))];
    } else {
        if ((error instanceof MichelsonParserError)) {
            [evalue, traceback] = [error.message, `at line ${error.line}, pos ${error.pos}`];
        } else {
            [evalue, traceback] = [pformat(error.args, {"compact": true}), ""];
        }
    }
    return {"name": ename, "value": evalue, "trace": traceback};
}
class Interpreter {
    /*Michelson interpreter reimplemented in Python.
    Based on the following reference: https://michelson.nomadic-labs.com/
    */
    constructor(debug = true) {
        this.ctx = new Context();
        this.parser = new MichelsonParser({"extra_primitives": helpers_prim});
        this.debug = debug;
    }
    execute(code) {
        /*Execute Michelson instructions (note that stack is not cleared after execution).

        :param code: Michelson source (any valid Michelson expression or special helpers)
        :returns: {"success": True|False, "stdout": "", "stderr": {}, "result": {"value": "", ...}}
        */
        var backup, code_expr, int_res, res;
        int_res = {"success": false};
        try {
            code_expr = michelson_to_micheline(code, {"parser": this.parser});
        } catch(e) {
            if ((e instanceof MichelsonParserError)) {
                if (this.debug) {
                    throw e;
                }
                int_res["stderr"] = format_stderr(e);
                return int_res;
            } else {
                throw e;
            }
        }
        backup = deepcopy(this.ctx);
        try {
            res = do_interpret(this.ctx, code_expr);
            if (((res === null) && this.ctx.pushed)) {
                res = {"kind": "stack", "stack": this.ctx.dump({"count": 1})};
            }
            int_res["result"] = format_result(res);
            int_res["stdout"] = format_stdout(this.ctx.stdout);
            int_res["success"] = true;
            this.ctx.reset();
        } catch(e) {
            if ((e instanceof MichelsonRuntimeError)) {
                int_res["stderr"] = format_stderr(e);
                int_res["stdout"] = format_stdout(this.ctx.stdout);
                this.ctx = backup;
                if (this.debug) {
                    if (int_res.get("stdout")) {
                        console.log(int_res["stdout"]);
                    }
                    throw e;
                }
            } else {
                throw e;
            }
        }
        if (this.debug) {
            if (int_res.get("stdout")) {
                console.log(int_res["stdout"]);
            }
            if (int_res.get("result")) {
                console.log(("RESULT: " + pformat(int_res["result"])));
            }
        }
        return int_res;
    }
}
export {Interpreter, format_content, format_diff, format_result, format_stack_item, format_stderr, format_stdout, get_content};

//# sourceMappingURL=interpreter.js.map
