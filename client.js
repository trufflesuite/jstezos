import lru_cache from 'lru-cache';
import {Decimal} from 'decimal.js';
import {OperationGroup} from './operation/group';
import {ContentMixin} from './operation/content';
import {ContractInterface} from './michelson/interface';
import {Contract} from './michelson/contract';
import {Interop} from './interop';
import {get_class_docstring} from './tools/docstring';
import {NonFungibleTokenImpl} from './standards/non_fungible_token';
var _pj;

function _pj_snippets(container) {
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
    container["set_decorators"] = set_decorators;
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

class PyTezosClient extends Interop {
    __repr__() {
        var res;
        res = [super.__repr__(), "\nHelpers", get_class_docstring(this.__class__)];
        return "\n".join(res);
    }
    _spawn(kwargs = {}) {
        return new PyTezosClient({"shell": kwargs.get("shell", this.shell), "key": kwargs.get("key", this.key)});
    }
    operation_group(protocol = null, branch = null, contents = null, signature = null) {
        /*
        Create new operation group (multiple contents).
        You can leave all fields empty in order to create an empty operation group.
        :param protocol: Leave None for autocomplete, otherwise you know what to do
        :param branch: Leave None for autocomplete
        :param contents: List of operation contents (optional)
        :param signature: Can be set later
        :return: OperationGroup
        */
        return new OperationGroup({"protocol": protocol, "branch": branch, "contents": contents, "signature": signature, "shell": this.shell, "key": this.key});
    }
    operation(content) {
        /*
        Create an operation group with single content
        :param content: Operation body (depending on `kind`)
        :return: OperationGroup
        */
        return new OperationGroup({"contents": [content], "shell": this.shell, "key": this.key});
    }
    account(account_id = null) {
        /*
        Shortcut for RPC contract request
        :param account_id: tz/KT address, leave None to show info about current key
        :return: dict
        */
        var address;
        address = (account_id || this.key.public_key_hash());
        return this.shell.contracts[address]();
    }
    balance() {
        return (new Decimal(this.account()["balance"]) / Math.pow(10, 6)).quantize(new Decimal("0.000001"));
    }
    now() {
        /*
        Timestamp of the current head (UTC)
        :return: int
        */
        var constants, dt, first_delay, ts;
        constants = this.shell.block.context.constants();
        ts = this.shell.head.header()["timestamp"];
        dt = new Date(); // TODO - CONVERT this ---> datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ");
        first_delay = constants["time_between_blocks"][0];
        return (Number.parseInt((dt - new Date(1970, 1, 1)).total_seconds()) + Number.parseInt(first_delay));
    }
    _get_contract_interface(contract_id, factory = Contract) {
        return new ContractInterface({"address": contract_id, "shell": this.shell, "key": this.key, "factory": factory});
    }
    contract(contract_id) {
        /*
        Get a high-level interface for a given smart contract id.
        :param contract_id: KT address of a smart contract
        :return: ContractInterface
        */
        return this._get_contract_interface(contract_id);
    }
    nft_app(contract_id) {
        /*
        Get a high-level NFT interface for a given smart contract id.
        Read more at https://nft.stove-labs.com/
        :param contract_id: KT address of a smart contract
        :return: ContractInterface
        */
        return this._get_contract_interface(contract_id, {"factory": NonFungibleTokenImpl});
    }
}
_pj.set_decorators(PyTezosClient, {"_get_contract_interface": [new lru_cache()]});
applyMixins(PyTezosClient, [ContentMixin])
export {PyTezosClient};

//# sourceMappingURL=client.js.map
