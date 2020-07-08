import * as pendulum from 'pendulum';
import {ParserError} from 'pendulum/parsing/exceptions';
import {count} from '@aureooms/js-itertools/src/base/count';
import {get_attr_docstring} from '../tools/docstring';
import {BlockSliceQuery} from './search';
import {RpcQuery} from './query';
import {is_bh, is_ogh} from '../encoding';
var _pj;

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

function to_timestamp(v) {
    try {
        v = pendulum.parse(v);
    } catch(e) {
        if ((e instanceof ParserError)) {
        } else {
            throw e;
        }
    }
    if ((v instanceof Date)) {
        v = Number.parseInt(v.timestamp());
    }
    return v;
}
class BlocksQuery extends RpcQuery {
    __call__(length = 1, head = null, min_date = null) {
        /*Lists known heads of the blockchain sorted with decreasing fitness.
        Optional arguments allows to returns the list of predecessors for known heads
        or the list of predecessors for a given list of blocks.

        :param length: The requested number of predecessors to returns (per requested head).
        :param head: An empty argument requests blocks from the current heads.         A non empty list allow to request specific fragment of the chain.
        :param min_date: When `min_date` is provided, heads with a timestamp before `min_date` are filtered out
        :rtype: list[list[str]]
        */
        if (((((typeof head) === "string") || (head instanceof String)) && (! is_bh(head)))) {
            head = this.__getitem__(head).calculate_hash();
        }
        if ((min_date && (! (((typeof min_date) === "number") || (min_date instanceof Number))))) {
            min_date = to_timestamp(min_date);
        }
        return super.__call__({"length": length, "head": head, "min_date": min_date});
    }
    __getitem__(block_id) {
        /*Construct block query or get a block range.

        :param block_id: Block identity or block range

        - int: Block level or offset from the head if negative;
        - str: Block hash (base58) or special names (head, genesis), expressions like `head~1` etc;
        - slice [:]: First value (start) must be int, second (stop) can be any Block ID or empty.
        :rtype: BlockQuery or BlockSliceQuery
        */
        if ((block_id instanceof slice)) {
            if ((! (((typeof block_id.start) === "number") || (block_id.start instanceof Number)))) {
                throw new NotImplementedError("Slice start should be an integer.");
            }
            return new BlockSliceQuery({"start": block_id.start, "stop": block_id.stop, "node": this.node, "path": this._wild_path, "params": this._params});
        }
        if (((((typeof block_id) === "number") || (block_id instanceof Number)) && (block_id < 0))) {
            return this.blocks[`head~${block_id}`];
        }
        return super.__getitem__(block_id);
    }
    get current_voting_period() {
        /*Get block range for the current voting period.

        :rtype: BlockSliceQuery
        */
        var metadata;
        metadata = this.head.metadata();
        return new BlockSliceQuery({"start": (metadata["level"]["level"] - metadata["level"]["voting_period_position"]), "stop": "head", "node": this.node, "path": this._wild_path, "params": this._params});
    }
    get current_cycle() {
        /*Get block range for the current cycle.

        :rtype: BlockSliceQuery
        */
        var metadata;
        metadata = this.head.metadata();
        return new BlockSliceQuery({"start": (metadata["level"]["level"] - metadata["level"]["cycle_position"]), "stop": "head", "node": this.node, "path": this._wild_path, "params": this._params});
    }
}
class BlockQuery extends RpcQuery {
    constructor(yaargs, yakwargs) {
        super(BlockQuery, self).__init__(*args, **kwargs);
        this._caching = (this._caching || (! _pj.in_es6("head", this._params)));
    }
    get predecessor() {
        /*Query previous block.

        :rtype: BlockQuery
        */
        return this._parent[this.header()["predecessor"]];
    }
    get baker() {
        /*Query block producer (baker).

        :rtype: ContractQuery
        */
        return this.context.contracts[this.metadata()["baker"]];
    }
    voting_period() {
        /*Get voting period for this block from metadata.
        */
        return this.metadata()["level"]["voting_period"];
    }
    level() {
        /*Get level for this block from metadata.
        */
        return this.metadata()["level"]["level"];
    }
    cycle() {
        /*
        Get cycle for this block from metadata.
        */
        return this.metadata()["level"]["cycle"];
    }
}
class ContractQuery extends RpcQuery {
    public_key() {
        /*Retrieve the contract manager's public key (base58 encoded)
        */
        var pk, pkh;
        pkh = this._params.slice((- 1))[0];
        if (pkh.startswith("KT")) {
            pkh = this.manager_key().get("manager");
        }
        pk = this._parent[pkh].manager_key().get("key");
        if ((! pk)) {
            throw new Error("Public key is not revealed.");
        }
        return pk;
    }
    count() {
        /*Get contract counter iterator: it returns incremented value on each call.
        */
        return count({"start": (Number.parseInt(this.counter()) + 1), "step": 1});
    }
    code() {
        /*Get contract code.

        :returns: Micheline expression
        */
        return this().get("script", {}).get("code");
    }
}
class BigMapGetQuery extends RpcQuery {
    post(query) {
        /*Access the value associated with a key in the big map storage of the michelson.

        :param query
        {
        key: { $key_type : <key> },
        type: { "prim" : $key_prim }
        }
        $key_type: Provided key encoding, e.g. "string", "bytes" for hex-encoded string, "int"
        key_prim: Expected high-level data type, e.g. "address", "nat", "mutez" (see storage section in code)
        :returns: Micheline expression
        */
        return this._post({"json": query});
    }
}
class ContextRawBytesQuery extends RpcQuery {
    constructor(args, kwargs) {
        kwargs.update({"timeout": 60});
        super(ContextRawBytesQuery, self).__init__(*args, **kwargs);
    }
    __call__(depth = 1) {
        /*Return the raw context.

        :param depth: Context is a tree structure, default depth is 1
        */
        return super.__call__({"depth": depth});
    }
}
class ContextRawJsonQuery extends RpcQuery {
    constructor(args, kwargs) {
        kwargs.update({"timeout": 60});
        super(ContextRawJsonQuery, self).__init__(*args, **kwargs);
    }
}
class ContextSeedQuery extends RpcQuery {
    post() {
        /*Get seed of the cycle to which the block belongs.
        */
        return this._post();
    }
}
class EndorsingPower extends RpcQuery {
    post(endorsement_operation) {
        /*Get the endorsing power of an endorsement operation, that is, the number of slots that the op has.

        :param endorsement_operation
        {
        "branch": $block_hash,
        "contents": [ $operation.alpha.contents ... ],
        "signature": $Signature
        }
        */
        return this._post({"sendorsement_operation": endorsement_operation});
    }
}
class OperationListListQuery extends RpcQuery {
    __getitem__(item) {
        /*Find operation by hash.

        :param item: Operation group hash (base58)
        :rtype: OperationQuery
        */
        var operation_hashes;
        if ((item instanceof tuple)) {
            return this[item[0]][item[1]];
        }
        if (((((typeof item) === "string") || (item instanceof String)) && is_ogh(item))) {
            operation_hashes = this._parent.operation_hashes();
            var find_index;
            find_index = () => {
                for (var i, validation_pass, _pj_c = 0, _pj_a = enumerate(operation_hashes), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                    i = _pj_a[_pj_c];
                    validation_pass = _pj_a[_pj_c];
                    for (var j, og_hash, _pj_f = 0, _pj_d = enumerate(validation_pass), _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                        j = _pj_d[_pj_f];
                        og_hash = _pj_d[_pj_f];
                        if ((og_hash === item)) {
                            return [i, j];
                        }
                    }
                }
                throw new StopIteration("Operation group hash not found");
            };
            return this[find_index()];
        }
        return super.__getitem__(item);
    }
    get endorsements() {
        /*Operations with content of type: `endorsement`.

        :rtype: OperationListQuery
        */
        return this[0];
    }
    get votes() {
        /*Operations with content of type: `proposal`, `ballot`.

        :rtype: OperationListQuery
        */
        return this[1];
    }
    get anonymous() {
        /*Operations with content of type: `seed_nonce_revelation`, `double_endorsement_evidence`,
        `double_baking_evidence`, `activate_account`.

        :rtype: OperationListQuery
        */
        return this[2];
    }
    get managers() {
        /*Operations with content of type: `reveal`, `transaction`, `origination`, `delegation`.

        :rtype: OperationListQuery
        */
        return this[3];
    }
    find_upvotes(proposal_id) {
        /*Find operations of kind `proposal` for given proposal.

        :param proposal_id: Proposal hash (base58)
        :returns: list of operation contents
        */
        var is_upvote;
        is_upvote = (op) => {
            return any(map((x) => {
    return ((x["kind"] === "proposal") && _pj.in_es6(proposal_id, x.get("proposals", [])));
}, op["contents"]));
        };
        return list(filter(is_upvote, this.votes()));
    }
    find_ballots(proposal_id = null) {
        /*Find operations of kind `ballot`.

        :param proposal_id: Proposal hash (optional)
        :returns: list of operation contents
        */
        var is_ballot;
        is_ballot = (op) => {
            return any(map((x) => {
    return ((x["kind"] === "ballot") && ((proposal_id === null) || (proposal_id === x.get("proposal"))));
}, op["contents"]));
        };
        return list(filter(is_ballot, this.votes()));
    }
    find_origination(contract_id) {
        /*Find origination of the contract.

        :param contract_id: Contract ID (KT-address)
        :returns: operation content
        */
        var is_origination;
        is_origination = (op) => {
            var is_it;
            is_it = (x) => {
                return ((x["kind"] === "origination") && _pj.in_es6(contract_id, x["metadata"]["operation_result"]["originated_contracts"]));
            };
            return any(map(is_it, op["contents"]));
        };
        return next(filter(is_origination, this.managers()));
    }
}
class OperationQuery extends RpcQuery {
    unsigned() {
        /*Get operation group data without metadata and signature.
        */
        var data;
        data = this();
        return {"branch": data["branch"], "contents": function () {
    var _pj_a = [], _pj_b = data["contents"];
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var content = _pj_b[_pj_c];
        _pj_a.push({k: v for k, v in content.items() if k != 'metadata'}
);
    }
    return _pj_a;
}
.call(this)};
    }
}
class ProposalQuery extends RpcQuery {
    __call__() {
        /*Roll count for this proposal.
        */
        var proposal_id, proposals, roll_count;
        proposals = this._parent();
        proposal_id = this._params.slice((- 1))[0];
        roll_count = next((x[1] for x in proposals if x[0] == proposal_id)
, 0);
        return roll_count;
    }
}
class ProposalsQuery extends RpcQuery {
    __getitem__(proposal_id) {
        /*Roll count for the selected proposal.

        :param proposal_id: Base58-encoded proposal ID
        :rtype: ProposalQuery
        */
        return new ProposalQuery({"path": (this._wild_path + "/{}"), "params": (this._params + [proposal_id]), "node": this.node});
    }
    __repr__() {
        var res;
        res = [super.__repr__(), `[]${get_attr_docstring(this.__class__, "__getitem__")}`];
        return "\n".join(res);
    }
}
export {BigMapGetQuery, BlockQuery, BlocksQuery, ContextRawBytesQuery, ContextRawJsonQuery, ContextSeedQuery, ContractQuery, EndorsingPower, OperationListListQuery, OperationQuery, ProposalQuery, ProposalsQuery, to_timestamp};

//# sourceMappingURL=protocol.js.map
