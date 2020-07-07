import clone from 'rfdc';
const deepcopy = clone();
import {blake2b} from 'pytezos/crypto';
import {base58_encode} from 'pytezos/encoding';
import {StackItem, assert_stack_item} from 'pytezos/repl/types';
import {micheline_to_michelson} from 'pytezos/michelson/converter';
import {BigMapPool} from 'pytezos/repl/big_map';
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

class DummyGen {
    constructor() {
        this.index = 0;
        this.self = this.get_fresh_address();
    }
    get_fresh_address() {
        var nonce, nonce_hash, res;
        nonce = ((''
 * 32) + this.index.to_bytes(4, "big"));
        nonce_hash = blake2b({"data": nonce, "digest_size": 20}).digest();
        res = base58_encode(nonce_hash, 'KT1'
).decode();
        this.index += 1;
        return res;
    }
}
class Context {
    constructor() {
        this.stack = [];
        this.meta = {};
        this.dummy_gen = new DummyGen();
        this.big_maps = new BigMapPool();
        this.debug = true;
        this.stdout = list();
        this["protected"] = 0;
        this.pushed = 0;
    }
    __deepcopy__(memodict = {}) {
        var ctx;
        ctx = new Context();
        ctx.stack = deepcopy(this.stack);
        ctx.meta = deepcopy(this.meta);
        ctx.dummy_gen = deepcopy(this.dummy_gen);
        ctx.big_maps = deepcopy(this.big_maps);
        ctx.debug = this.debug;
        ctx["protected"] = this["protected"];
        ctx.pushed = this.pushed;
        return ctx;
    }
    spawn(stack) {
        var ctx;
        ctx = new Context();
        ctx.stack = stack;
        ctx.meta = this.meta;
        ctx.dummy_gen = this.dummy_gen;
        ctx.big_maps = this.big_maps;
        ctx.debug = this.debug;
        ctx.stdout = this.stdout;
        return ctx;
    }
    reset() {
        this.stdout = [];
        this.pushed = false;
    }
    protect(count) {
        _pj._assert((this.stack.length >= count), `got ${this.stack.length} items, wanted to protect ${count}`);
        this["protected"] += count;
        this.print(`protect ${count} item(s)`);
    }
    restore(count) {
        _pj._assert((this["protected"] >= count), `wanted to restore ${count}, only ${this["protected"]} protected`);
        this.print(`restore ${count} item(s)`);
        this["protected"] -= count;
    }
    push(item, annots = null, move = false) {
        assert_stack_item(item);
        this.stack.insert(this["protected"], (move ? item : item.rename(annots)));
        this.pushed = true;
        this.print(`push ${repr(item)}`);
    }
    peek() {
        _pj._assert((this.stack.length > 0), "stack is empty");
        return this.stack[this["protected"]];
    }
    pop(count) {
        var body, res;
        _pj._assert(((this.stack.length - this["protected"]) >= count), `got ${(this.stack.length - this["protected"])} items, requested ${count} `);
        res = function () {
    var _pj_a = [], _pj_b = range(count);
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var _ = _pj_b[_pj_c];
        _pj_a.push(this.stack.pop(this["protected"]));
    }
    return _pj_a;
}
.call(this);
        if ((count <= 3)) {
            body = ", ".join(map(repr, res));
        } else {
            body = `${count} items`;
        }
        this.print(`pop ${body}`);
        return res;
    }
    pop1() {
        var res;
        res = this.pop({"count": 1});
        return res[0];
    }
    pop2() {
        return tuple(this.pop({"count": 2}));
    }
    pop3() {
        return tuple(this.pop({"count": 3}));
    }
    get(key, _default = null) {
        return this.meta.get(key, _default);
    }
    set(key, value) {
        this.meta[key] = value;
        if (_pj.in_es6(key, ["parameter", "storage", "code", "STORAGE"])) {
            this.print(micheline_to_michelson({"prim": key, "args": [value]}, {"inline": true}));
        } else {
            this.print(`set ${key}=${repr(value)}`);
        }
    }
    unset(key) {
        if (_pj.in_es6(key, this.meta)) {
            delete this.meta[key];
            this.print(`unset ${key}`);
        }
    }
    drop_all() {
        this.stack.clear();
        this["protected"] = 0;
        this.print(`drop all`);
    }
    dump(count) {
        if ((this.stack.length > 0)) {
            count = min(count, this.stack.length);
            return this.stack.slice(0, count);
        }
    }
    print(message) {
        if (this.debug) {
            this.stdout.append({"action": "event", "text": message});
        }
    }
    printf(template) {
        var message;
        var format_stack_item;
        format_stack_item = (match) => {
            var i;
            i = Number.parseInt(match.groups()[0]);
            _pj._assert((i < this.stack.length), `requested ${i}th element, got only ${this.stack.length} items`);
            return repr(this.stack[i]);
        };
        message = template.replace("\\{(\\d+)\\}", format_stack_item);
        this.stdout.append({"action": "message", "text": message});
    }
    begin(prim = null) {
        this.pushed = false;
        if (this.debug) {
            this.stdout.append({"action": "begin", "prim": prim});
        }
    }
    end() {
        if (this.debug) {
            this.stdout.append({"action": "end"});
        }
    }
    get length() {
        return this.stack.length;
    }
    __repr__() {
        return JSON.stringify(this.stack);
    }
}
export {Context, DummyGen};

//# sourceMappingURL=context.js.map
