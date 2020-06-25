import {exists, expanduser} from 'os/path';
import {RpcNode, ShellQuery, babylonnet, carthagenet, localhost, mainnet, pool, zeronet} from 'pytezos/rpc';
import {Key, is_installed} from 'pytezos/crypto';
import {is_key, is_pkh} from 'pytezos/encoding';
var _pj;
var default_key, default_key_hash, default_shell;

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

default_shell = "carthagenet";
default_key = "edsk33N474hxzA4sKeWVM6iuGNGDpX2mGwHNxEA4UbWS8sW3Ta3NKH";
default_key_hash = "tz1cnQZXoznhduu4MVWfJF6GSyP6mMHMbbWa";
class KeyHash extends Key {
    constructor(public_key_hash) {
        super(KeyHash, self).__init__(0) // TODO(*) Im still python;
        this._pkh = public_key_hash;
    }
    __repr__() {
        var res;
        res = [super.__repr__(), `
Public key hash`
, this.public_key_hash()];
        return "\n".join(res);
    }
    public_key_hash() {
        return this._pkh;
    }
    public_key() {
        throw NotImplementedError;
    }
    secret_key(passphrase = null, ed25519_seed = true) {
        throw NotImplementedError;
    }
    sign(message, generic = false) {
        throw NotImplementedError;
    }
    verify(signature, message) {
        throw NotImplementedError;
    }
}
class Interop {
    __repr__() {
        var res;
        res = [super.__repr__(), "\nProperties", `.key  # ${this.key.public_key_hash()}`, `.shell  # ${this.shell.node.uri} (${this.shell.node.network})`];
        return "\n".join(res);
    }
    constructor(shell = null, key = null) {
        var networks;
        if ((shell === null)) {
            shell = default_shell;
        }
        if ((((typeof shell) === "string") || (shell instanceof String))) {
            networks = {"mainnet": mainnet, "babylonnet": babylonnet, "carthagenet": carthagenet, "zeronet": zeronet, "sandboxnet": localhost.sandboxnet, "mainnet-pool": pool.mainnet};
            if (_pj.in_es6(shell, networks)) {
                this.shell = networks[shell];
            } else {
                this.shell = new ShellQuery({"node": new RpcNode({"uri": shell})});
            }
        } else {
            if ((shell instanceof ShellQuery)) {
                this.shell = shell;
            } else {
                throw new NotImplementedError(shell);
            }
        }
        if ((key === null)) {
            key = (is_installed() ? default_key : default_key_hash);
        }
        if ((((typeof key) === "string") || (key instanceof String))) {
            if (is_key(key)) {
                this.key = Key.from_encoded_key(key);
            } else {
                if (is_pkh(key)) {
                    this.key = new KeyHash(key);
                } else {
                    if (exists(expanduser(key))) {
                        this.key = Key.from_faucet(key);
                    } else {
                        this.key = Key.from_alias(key);
                    }
                }
            }
        } else {
            if ((key instanceof Key)) {
                this.key = key;
            } else {
                throw new NotImplementedError(key);
            }
        }
    }
    _spawn(kwargs = {}) {
        throw NotImplementedError;
    }
    using(shell = null, key = null) {
        /*
        Change current rpc endpoint and account (private key)
        :param shell: one of 'babylonnet', 'mainnet', 'zeronet', or RPC node uri, or instance of `ShellQuery`
        :param key: base58 encoded key, path to the faucet file, alias from tezos-client, or instance of `Key`
        :return: A copy of current object with changes applied
        */
        return this._spawn({"shell": shell, "key": key});
    }
}

//# sourceMappingURL=interop.js.map
