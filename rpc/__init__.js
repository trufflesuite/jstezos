import * as Shell from './shell';
import * as Protocol from './protocol';
import * as Helpers from './helpers';
import * as Search from './search';
import {RpcMultiNode, RpcNode} from './node';
var _pj;
var babylonnet, carthagenet, localhost, mainnet, pool, tzkt, zeronet;
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
class RpcProvider {
    constructor(klass = RpcNode, urls = {}) {
        this.urls = urls;
        this.klass = klass;
    }
    __getattr__(network) {
        return new ShellQuery({"node": this.klass({"uri": this.urls[network], "network": network})});
    }
    __dir__() {
        return (list(super.__dir__()) + list(this.urls.keys()));
    }
    __repr__() {
        var res;
        res = [super.__repr__(), "\nNetworks", ...list(map((x) => {
    return `.${x[0]}  # ${x[1]}`;
}, this.urls.items()))];
        return "\n".join(res);
    }
}
_pj.set_decorators(RpcProvider, {"__getattr__": [lru_cache({"maxsize": null})]});
localhost = new RpcProvider({"sandboxnet": "http://127.0.0.1:8732/"});
tzkt = new RpcProvider({"mainnet": "https://rpc.tzkt.io/mainnet/", "babylonnet": "https://rpc.tzkt.io/babylonnet/", "carthagenet": "https://rpc.tzkt.io/carthagenet/", "zeronet": "https://rpc.tzkt.io/zeronet/"});
pool = new RpcProvider({"klass": RpcMultiNode, "mainnet": ["https://rpc.tzkt.io/mainnet/", "https://tezos-prod.cryptonomic-infra.tech/", "https://rpc.tezrpc.me/", "https://api.tezos.org.ua/", "https://api.tez.ie/"], "babylonnet": ["https://rpc.tzkt.io/babylonnet/", "https://tezos-dev.cryptonomic-infra.tech/"], "carthagenet": ["https://rpc.tzkt.io/carthagenet/", "https://carthagenet.tezos.org.ua/"]});
mainnet = tzkt.mainnet;
babylonnet = tzkt.babylonnet;
carthagenet = tzkt.carthagenet;
zeronet = tzkt.zeronet;

//# sourceMappingURL=__init__.js.map
