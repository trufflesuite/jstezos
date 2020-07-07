import debugModule from 'debug';
const debug = debugModule("tools:otp");
import {is_pkh} from '../encoding';
import {Key} from '../crypto';
import {mainnet} from '../rpc/__init__';
export default class OTP {
    constructor(key, interval = 5, shell = mainnet) {
        /*
        :param key: secret key (encrypted/unencrypted), public key or public key hash, all base58 encoded
        :param interval: number of blocks to check (tolerance)
        :param shell: ShellQuery instance
        */
        if ((! (key instanceof Key))) {
            if (is_pkh(key)) {
                key = shell.public_key(key);
            }
            key = Key.from_encoded_key(key);
        }
        this._key = key;
        this._interval = interval;
        this._shell = shell;
    }
    now() {
        var message;
        if ((! this._key.secret_exponent)) {
            throw new Error("Cannot generate OTP without a secret key");
        }
        message = this._shell.head.calculate_hash();
        debug(`block hash: ${message}`);
        return this._key.sign(message);
    }
    verify(signature) {
        var block_hashes, message;
        block_hashes = this._shell.blocks({"length": this._interval});
        for (var row, _pj_c = 0, _pj_a = block_hashes, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            row = _pj_a[_pj_c];
            try {
                message = row[0];
                debug(`try ${message}`);
                this._key.verify(signature, message);
                return true;
            } catch(e) {
                if ((e instanceof TypeError)) {
                    debug(e.toString());
                } else {
                    throw e;
                }
            }
        }
        return false;
    }
}

//# sourceMappingURL=otp.js.map
