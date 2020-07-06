import lru_cache from 'lru-cache';
import {hexlify} from 'binascii';
import {datetime} from 'datetime';
import {sleep} from 'time';
import {base58_decode} from 'pytezos/encoding';
import {RpcQuery} from 'pytezos/rpc/query';
import {get_attr_docstring} from 'pytezos/tools/docstring';
import {CyclesQuery, VotingPeriodsQuery} from 'pytezos/rpc/search';
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
    function set_decorators(cls, props) {
        var deco, decos;
        var _pj_a = props;
        for (var p in _pj_a) {
            if (_pj_a.hasOwnProperty(p)) {
                decos = props[p];
                function reducer(val, deco) {
                    return deco(val, cls, p);
                }
                deco = decos.reduce(reducer, cls.prototype[p]);
                if ((((! ((deco instanceof Function) || (deco instanceof Map) || (deco instanceof WeakMap))) && (deco instanceof Object)) && (("value" in deco) || ("get" in deco)))) {
                    delete cls.prototype[p];
                    Object.defineProperty(cls.prototype, p, deco);
                } else {
                    cls.prototype[p] = deco;
                }
            }
        }
    }
    container["_assert"] = _assert;
    container["set_decorators"] = set_decorators;
    return container;
}
_pj = {};
_pj_snippets(_pj);

function make_operation_result(kwargs = {}) {
    return {"metadata": {"operation_result": kwargs}};
}
class ShellQuery extends RpcQuery {
    get blocks() {
        return this.chains.main.blocks;
    }
    get head() {
        return this.blocks.head;
    }
    block() {
        /*
        Cached head block, useful if you just want to explore things.
        */
        return this.blocks[this.head.hash()];
    }
    get cycles() {
        /*
        Operate on cycles rather than blocks.
        */
        return new CyclesQuery({"node": this.node, "path": (this._wild_path + "/chains/{}/blocks"), "params": (this._params + ["main"])});
    }
    get voting_periods() {
        /*
        Operate on voting periods rather than blocks.
        */
        return new VotingPeriodsQuery({"node": this.node, "path": (this._wild_path + "/chains/{}/blocks"), "params": (this._params + ["main"])});
    }
    get contracts() {
        return this.head.context.contracts;
    }
    get mempool() {
        return this.chains.main.mempool;
    }
    wait_next_block(block_hash = null) {
        var block_time, current_block_hash, delay_sec, elapsed_sec, header, prev_block_dt;
        block_time = Number.parseInt(this.block.context.constants()["time_between_blocks"][0]);
        header = this.head.header();
        if ((block_hash === null)) {
            block_hash = header["hash"];
        }
        prev_block_dt = datetime.strptime(header["timestamp"], "%Y-%m-%dT%H:%M:%SZ");
        elapsed_sec = (datetime.utcnow() - prev_block_dt).seconds;
        delay_sec = ((elapsed_sec > block_time) ? 0 : (block_time - elapsed_sec));
        console.log(`Wait ${delay_sec} seconds until block ${block_hash} is finalized`);
        sleep(delay_sec);
        for (var i = 0, _pj_a = block_time; (i < _pj_a); i += 1) {
            current_block_hash = this.head.hash();
            if ((current_block_hash === block_hash)) {
                sleep(1);
            } else {
                return current_block_hash;
            }
        }
        _pj._assert(false, null);
    }
}
_pj.set_decorators(ShellQuery, {"block": [property, new lru_cache()]});
class ChainQuery extends RpcQuery {
    watermark() {
        /*
        Chain watermark, hex encoded
        */
        var data;
        data = this.chain_id();
        return hexlify(base58_decode(data.encode())).decode();
    }
}
class InvalidBlockQuery extends RpcQuery {
    delete() {
        return this._delete();
    }
}
class MempoolQuery extends RpcQuery {
    post(configuration) {
        /*
        Set operation filter rules.
        :param configuration: a JSON dictionary, known keys are `minimal_fees`, `minimal_nanotez_per_gas_unit`,
        `minimal_nanotez_per_byte`
        */
        return this._post({"json": configuration});
    }
}
class PendingOperationsQuery extends RpcQuery {
    __getitem__(item) {
        /*
        Search for operation in node's mempool by hash.
        :param item: operation group hash (base58)
        */
        var errors, operations_dict;
        operations_dict = this();
        for (var status, operations, _pj_c = 0, _pj_a = operations_dict.items(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            status = _pj_a[_pj_c];
            operations = _pj_a[_pj_c];
            for (var operation, _pj_f = 0, _pj_d = operations, _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                operation = _pj_d[_pj_f];
                if ((operation instanceof dict)) {
                    if ((operation["hash"] === item)) {
                        return {[None]: make_operation_result({"status": status}), [None]: operation};
                    }
                } else {
                    if ((operation instanceof list)) {
                        if ((operation[0] === item)) {
                            errors = operation[1].pop1("error", {"default": []});
                            return {[None]: make_operation_result({"status": status, "errors": errors}), [None]: operation[1]};
                        }
                    } else {
                        _pj._assert(false, operation);
                    }
                }
            }
        }
        throw StopIteration;
    }
    __repr__() {
        var res;
        res = [super.__repr__(), ("[]" + get_attr_docstring(this.__class__, "__getitem__"))];
        return "\n".join(res);
    }
}
class DescribeQuery extends RpcQuery {
    __call__(recurse = true) {
        /*
        Get RPCs documentation and input/output schema.
        :param recurse: Show information for child elements, default is True.
        In some cases doesn't work without this flag.
        */
        return super.__call__({"recurse": recurse});
    }
    __repr__() {
        var res;
        res = [super.__repr__(), `()${get_attr_docstring(DescribeQuery, "__call__")}`, "Can be followed by any path:\n.chains\n.network.connections\netc\n"];
        return "\n".join(res);
    }
}
class BlockInjectionQuery extends RpcQuery {
    post(block, _async = false, force = false, chain = null) {
        /*
        Inject a block in the node and broadcast it.
        The `operations` embedded in `blockHeader` might be pre-validated using a contextual RPCs from the latest block
        (e.g. '/blocks/head/context/preapply').
        :param block: Json input:
        {
        "data": <hex-encoded block header>,
        "operations": [ [ {
        "branch": <block_hash>,
        "data": <hex-encoded operation>
        } ... ] ... ]
        }
        :param _async: By default, the RPC will wait for the block to be validated before answering,
        set True if you don't want to.
        :param force:
        :param chain: Optionally you can specify the chain
        :return: ID of the block
        */
        return this._post({"params": {"async": _async, "force": force, "chain": chain}, "json": block});
    }
}
class OperationInjectionQuery extends RpcQuery {
    post(operation, _async = false, chain = null) {
        /*
        Inject an operation in node and broadcast it.
        The `signedOperationContents` should be constructed using a contextual RPCs from the latest block
        and signed by the client.
        :param operation: Hex-encoded operation data or bytes
        :param _async: By default, the RPC will wait for the operation to be (pre-)validated before answering,
        set True if you don't want to.
        :param chain: Optionally you can specify the chain
        :return: ID of the operation
        */
        if ((operation instanceof bytes)) {
            operation = operation.hex();
        }
        return this._post({"params": {"async": _async, "chain": chain}, "json": operation});
    }
}
class ProtocolInjectionQuery extends RpcQuery {
    post(protocol, _async = false, force = false) {
        /*
        Inject a protocol in node.
        :param protocol: Json input:
        {
        "expected_env_version": <integer>,
        "components": [{
        "name": <unistring>,
        "interface"?: <hex-encoded data>,
        "implementation": <hex-encoded data> }
        ...
        ]}
        }
        :param _async:
        :param force:
        :return: ID of the protocol
        */
        return this._post({"params": {"async": _async, "force": force}, "json": protocol});
    }
}
class ResponseGenerator {
    constructor(res) {
        this._lines = res.iter_lines();
    }
    * __iter__() {
        for (var line, _pj_c = 0, _pj_a = this._lines, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            line = _pj_a[_pj_c];
            yield JSON.parse(line.decode());
        }
    }
}
class MonitorQuery extends RpcQuery {
    __call__(kwargs = {}) {
        return new ResponseGenerator(this.node.request({"method": "GET", "path": this.path, "params": kwargs, "stream": true}));
    }
    __repr__() {
        var res;
        res = [super.__repr__(), "NOTE: Returned object is a generator."];
        return "\n".join(res);
    }
}
class ConnectionQuery extends RpcQuery {
    delete(wait = false) {
        return this._delete({"params": dict({"wait": wait})});
    }
}
class NetworkItems extends RpcQuery {
    __call__(_filter = null) {
        return this._get({"params": {"filter": _filter}});
    }
}
class NetworkLogQuery extends RpcQuery {
    __call__(monitor = false) {
        if (monitor) {
            return new ResponseGenerator(this.node.request({"method": "GET", "path": this.path, "stream": true}));
        } else {
            return this._get();
        }
    }
}
export {BlockInjectionQuery, ChainQuery, ConnectionQuery, DescribeQuery, InvalidBlockQuery, MempoolQuery, MonitorQuery, NetworkLogQuery, OperationInjectionQuery, PendingOperationsQuery, ProtocolInjectionQuery, ResponseGenerator, ShellQuery, make_operation_result};

//# sourceMappingURL=shell.js.map
