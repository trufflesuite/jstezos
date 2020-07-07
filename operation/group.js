import {pformat} from 'pprint';
import {blake2b_32} from 'pytezos/crypto';
import {ContentMixin} from 'pytezos/operation/content';
import {forge_operation_group} from 'pytezos/operation/forge';
import {calculate_fee, default_fee, default_gas_limit, default_storage_limit} from 'pytezos/operation/fees';
import {OperationResult} from 'pytezos/operation/result';
import {RpcError} from 'pytezos/rpc/errors';
import {base58_encode, forge_base58} from 'pytezos/encoding';
import {Interop} from 'pytezos/interop';
import {get_class_docstring} from 'pytezos/tools/docstring';
var _pj;
var validation_passes;

function applyMixins(derivedCtor, baseCtors) {
baseCtors.forEach(baseCtor => {
Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
});
});
}

function _pj_snippets(container) {
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

validation_passes = {"endorsement": 0, "proposal": 1, "ballot": 1, "seed_nonce_revelation": 2, "double_endorsement_evidence": 2, "double_baking_evidence": 2, "activate_account": 2, "reveal": 3, "transaction": 3, "origination": 3, "delegation": 3};
class OperationGroup extends Interop {
    /*Operation group representation: contents (single or multiple), signature, other fields,
    and also useful helpers for filling with precise fees, signing, forging, and injecting.
    */
    constructor(contents = null, protocol = null, chain_id = null, branch = null, signature = null, shell = null, key = null) {
        super(OperationGroup, self).__init__(shell=shell, key=key);
        this.contents = (contents || []);
        this.protocol = protocol;
        this.chain_id = chain_id;
        this.branch = branch;
        this.signature = signature;
    }
    __repr__() {
        var res;
        res = [super.__repr__(), "\nPayload", pformat(this.json_payload()), "\nHelpers", get_class_docstring(this.__class__)];
        return "\n".join(res);
    }
    _spawn(kwargs = {}) {
        return new OperationGroup({"contents": kwargs.get("contents", this.contents.copy()), "protocol": kwargs.get("protocol", this.protocol), "chain_id": kwargs.get("chain_id", this.chain_id), "branch": kwargs.get("branch", this.branch), "signature": kwargs.get("signature", this.signature), "shell": kwargs.get("shell", this.shell), "key": kwargs.get("key", this.key)});
    }
    json_payload() {
        /*Get json payload used for the preapply.
        */
        return {"protocol": this.protocol, "branch": this.branch, "contents": this.contents, "signature": this.signature};
    }
    binary_payload() {
        /*Get binary payload used for injection/hash calculation.
        */
        if ((! this.signature)) {
            throw new ValueError("Not signed");
        }
        return (bytes.fromhex(this.forge()) + forge_base58(this.signature));
    }
    operation(content) {
        /*Create new operation group with extra content added.

        :param content: Kind-specific operation body
        :rtype: OperationGroup
        */
        return this._spawn({"contents": (this.contents + [content])});
    }
    fill() {
        /*Try to fill all fields left unfilled, use approximate fees
        (not optimal, use `autofill` to simulate operation and get precise values).

        :rtype: OperationGroup
        */
        var branch, chain_id, counter, protocol, replace_map, source;
        var fill_content;
        chain_id = (this.chain_id || this.shell.chains.main.chain_id());
        branch = (this.branch || this.shell.head.predecessor.hash());
        protocol = (this.protocol || this.shell.head.header()["protocol"]);
        source = this.key.public_key_hash();
        counter = this.shell.contracts[source].count();
        replace_map = {"pkh": source, "source": source, "delegate": source, "counter": (x) => {
    return next(counter).toString();
}, "secret": (x) => {
    return this.key.activation_code;
}, "period": (x) => {
    return this.shell.head.voting_period().toString();
}, "public_key": (x) => {
    return this.key.public_key();
}, "manager_pubkey": source, "fee": (x) => {
    return default_fee(x).toString();
}, "gas_limit": (x) => {
    return default_gas_limit(x).toString();
}, "storage_limit": (x) => {
    return default_storage_limit(x).toString();
}};
        fill_content = (content) => {
            content = content.copy();
            for (var k, v, _pj_c = 0, _pj_a = replace_map.items(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                k = _pj_a[_pj_c];
                v = _pj_a[_pj_c];
                if (_pj.in_es6(content.get(k), ["", "0"])) {
                    content[k] = (((v instanceof Function) || ((typeof v) === "function")) ? v(content) : v);
                }
            }
            return content;
        };
        return this._spawn({"contents": list(map(fill_content, this.contents)), "protocol": protocol, "chain_id": chain_id, "branch": branch});
    }
    run() {
        /*Simulate operation without signature checks.

        :returns: RPC response from `run_operation`
        */
        return this.shell.head.helpers.scripts.run_operation.post({"operation": {"branch": this.branch, "contents": this.contents, "signature": base58_encode((b'0'
 * 64), b'sig'
).decode()}, "chain_id": this.chain_id});
    }
    forge(validate = true) {
        /*Convert json representation of the operation group into bytes.

        :param validate: Forge remotely also and compare results, default is True
        :returns: Hex string
        */
        var local_data, payload, remote_data;
        payload = {"branch": this.branch, "contents": this.contents};
        local_data = forge_operation_group(payload).hex();
        if (validate) {
            remote_data = this.shell.blocks[this.branch].helpers.forge.operations.post(payload);
            if ((local_data !== remote_data)) {
                throw new ValueError(`Local forge result differs from remote one:

${local_data}

${remote_data}`
);
            }
        }
        return local_data;
    }
    autofill(gas_reserve = 100) {
        /*Fill the gaps and then simulate the operation in order to calculate fee, gas/storage limits.

        :param gas_reserve: Add a safe reserve for gas limit (default is 100)
        :rtype: OperationGroup
        */
        var extra_size, opg, opg_with_metadata;
        var fill_content;
        opg = this.fill();
        opg_with_metadata = opg.run();
        if ((! OperationResult.is_applied(opg_with_metadata))) {
            throw RpcError.from_errors(OperationResult.errors(opg_with_metadata));
        }
        extra_size = (32 + 64) // len(opg.contents) + 1
;
        fill_content = (content) => {
            var burned, consumed_gas, fee, paid_storage_size_diff;
            if ((validation_passes[content["kind"]] === 3)) {
                consumed_gas = (OperationResult.consumed_gas(content) + gas_reserve);
                paid_storage_size_diff = OperationResult.paid_storage_size_diff(content);
                burned = OperationResult.burned(content);
                fee = calculate_fee(content, consumed_gas, extra_size);
                content.update({"gas_limit": (consumed_gas + gas_reserve).toString(), "storage_limit": (paid_storage_size_diff + burned).toString(), "fee": fee.toString()});
            }
            content.pop("metadata");
            return content;
        };
        opg.contents = list(map(fill_content, opg_with_metadata["contents"]));
        return opg;
    }
    sign() {
        /*Sign the operation group with the key specified by `using`.

        :rtype: OperationGroup
        */
        var chain_watermark, message, signature, validation_pass, watermark;
        validation_pass = validation_passes[this.contents[0]["kind"]];
        if (any(map((x) => {
    return (validation_passes[x["kind"]] !== validation_pass);
}, this.contents))) {
            throw new ValueError("Mixed validation passes");
        }
        if ((validation_pass === 0)) {
            chain_watermark = bytes.fromhex(this.shell.chains.main.watermark());
            watermark = (b''
 + chain_watermark);
        } else {
            watermark = b''
;
        }
        message = (watermark + bytes.fromhex(this.forge()));
        signature = this.key.sign({"message": message, "generic": true});
        return this._spawn({"signature": signature});
    }
    hash() {
        /*Calculate the Base58 encoded operation group hash.
        */
        var hash_digest;
        hash_digest = blake2b_32(this.binary_payload()).digest();
        return base58_encode(hash_digest, b'o'
).decode();
    }
    preapply() {
        /*Preapply signed operation group.

        :returns: RPC response from `preapply`
        */
        if ((! this.signature)) {
            throw new ValueError("Not signed");
        }
        return this.shell.head.helpers.preapply.operations.post({"operations": [this.json_payload()]})[0];
    }
    inject(_async = true, preapply = true, check_result = true, num_blocks_wait = 2) {
        /*Inject the signed operation group.

        :param _async: do not wait for operation inclusion (default is True)
        :param preapply: do a preapply before injection
        :param check_result: raise RpcError in case operation is refused
        :param num_blocks_wait: number of blocks to wait for injection
        :returns: operation group with metadata (raw RPC response)
        */
        var opg_hash, opg_with_metadata, pending_opg, res;
        if (preapply) {
            opg_with_metadata = this.preapply();
            if ((! OperationResult.is_applied(opg_with_metadata))) {
                throw RpcError.from_errors(OperationResult.errors(opg_with_metadata));
            }
        }
        opg_hash = this.shell.injection.operation.post({"operation": this.binary_payload(), "_async": false});
        if (_async) {
            return {"chain_id": this.chain_id, "hash": opg_hash, [None]: this.json_payload()};
        } else {
            for (var i = 0, _pj_a = num_blocks_wait; (i < _pj_a); i += 1) {
                this.shell.wait_next_block();
                try {
                    pending_opg = this.shell.mempool.pending_operations[opg_hash];
                    if ((! OperationResult.is_applied(pending_opg))) {
                        throw RpcError.from_errors(OperationResult.errors(pending_opg));
                    }
                    console.log(`Still in mempool: ${opg_hash}`);
                } catch(e) {
                    if ((e instanceof StopIteration)) {
                        res = this.shell.blocks.slice((- (i + 1))).find_operation(opg_hash);
                        if (check_result) {
                            if ((! OperationResult.is_applied(res))) {
                                throw RpcError.from_errors(OperationResult.errors(res));
                            }
                        }
                        return res;
                    } else {
                        throw e;
                    }
                }
            }
        }
        throw new TimeoutError(opg_hash);
    }
    result() {
        /*Parse the preapply result.

        :rtype: OperationResult
        */
        return OperationResult.from_operation_group(this.preapply());
    }
}
applyMixins(OperationGroup, [ContentMixin])
export {OperationGroup, validation_passes};

//# sourceMappingURL=group.js.map
