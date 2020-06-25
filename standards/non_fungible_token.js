import {lru_cache} from 'functools';
import {Contract, ContractParameter, ContractStorage} from 'pytezos/michelson/contract';
import {michelson_to_micheline} from 'pytezos/michelson/micheline';
var _pj;
var parameter_tz, storage_tz;
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
parameter_tz = "\nparameter \n    (or (or (nat %burn :token_id) (pair %mint (address %owner) (nat %token_id)))\n        (pair %transfer (address %destination) (nat %token_id)))\n";
storage_tz = "storage (map nat address)";
class NonFungibleTokenImpl extends Contract {
    parameter() {
        return new ContractParameter(michelson_to_micheline(parameter_tz));
    }
    storage() {
        return new ContractStorage(michelson_to_micheline(storage_tz));
    }
}
_pj.set_decorators(NonFungibleTokenImpl, {"parameter": [property, lru_cache({"maxsize": null})], "storage": [property, lru_cache({"maxsize": null})]});

//# sourceMappingURL=non_fungible_token.js.map
