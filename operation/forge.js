import {forge_address, forge_array, forge_base58, forge_bool, forge_nat, forge_public_key} from 'pytezos/encoding';
import {forge_entrypoint, forge_micheline, forge_script} from 'pytezos/michelson/forge';
var operation_tags;

function applyMixins(derivedCtor, baseCtors) {
baseCtors.forEach(baseCtor => {
Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
});
});
}

operation_tags = {"endorsement": 0, "proposal": 5, "ballot": 6, "seed_nonce_revelation": 1, "double_endorsement_evidence": 2, "double_baking_evidence": 3, "activate_account": 4, "reveal": 107, "transaction": 108, "origination": 109, "delegation": 110};
function forge_operation(content) {
    /*Forge operation content (locally).

    :param content: {.., "kind": "transaction", ...}
    */
    var encode_content, encode_proc;
    encode_content = {"activate_account": forge_activate_account, "reveal": forge_reveal, "transaction": forge_transaction, "origination": forge_origination, "delegation": forge_delegation};
    encode_proc = encode_content.get(content["kind"]);
    if ((! encode_proc)) {
        throw new NotImplementedError(content["kind"]);
    }
    return encode_proc(content);
}
function forge_operation_group(operation_group) {
    /*Forge operation group (locally).

    :param operation_group: {"branch": "B...", "contents": [], ...}
    */
    var res;
    res = forge_base58(operation_group["branch"]);
    res += b''
.join(map(forge_operation, operation_group["contents"]));
    return res;
}
function forge_activate_account(content) {
    var res;
    res = forge_nat(operation_tags[content["kind"]]);
    res += forge_base58(content["pkh"]);
    res += bytes.fromhex(content["secret"]);
    return res;
}
function forge_reveal(content) {
    var res;
    res = forge_nat(operation_tags[content["kind"]]);
    res += forge_address(content["source"], {"tz_only": true});
    res += forge_nat(Number.parseInt(content["fee"]));
    res += forge_nat(Number.parseInt(content["counter"]));
    res += forge_nat(Number.parseInt(content["gas_limit"]));
    res += forge_nat(Number.parseInt(content["storage_limit"]));
    res += forge_public_key(content["public_key"]);
    return res;
}
function forge_transaction(content) {
    var res;
    res = forge_nat(operation_tags[content["kind"]]);
    res += forge_address(content["source"], {"tz_only": true});
    res += forge_nat(Number.parseInt(content["fee"]));
    res += forge_nat(Number.parseInt(content["counter"]));
    res += forge_nat(Number.parseInt(content["gas_limit"]));
    res += forge_nat(Number.parseInt(content["storage_limit"]));
    res += forge_nat(Number.parseInt(content["amount"]));
    res += forge_address(content["destination"]);
    if (content.get("parameters")) {
        res += forge_bool(true);
        res += forge_entrypoint(content["parameters"]["entrypoint"]);
        res += forge_array(forge_micheline(content["parameters"]["value"]));
    } else {
        res += forge_bool(false);
    }
    return res;
}
function forge_origination(content) {
    var res;
    res = forge_nat(operation_tags[content["kind"]]);
    res += forge_address(content["source"], {"tz_only": true});
    res += forge_nat(Number.parseInt(content["fee"]));
    res += forge_nat(Number.parseInt(content["counter"]));
    res += forge_nat(Number.parseInt(content["gas_limit"]));
    res += forge_nat(Number.parseInt(content["storage_limit"]));
    res += forge_nat(Number.parseInt(content["balance"]));
    if (content.get("delegate")) {
        res += forge_bool(true);
        res += forge_address(content["delegate"], {"tz_only": true});
    } else {
        res += forge_bool(false);
    }
    res += forge_script(content["script"]);
    return res;
}
function forge_delegation(content) {
    var res;
    res = forge_nat(operation_tags[content["kind"]]);
    res += forge_address(content["source"], {"tz_only": true});
    res += forge_nat(Number.parseInt(content["fee"]));
    res += forge_nat(Number.parseInt(content["counter"]));
    res += forge_nat(Number.parseInt(content["gas_limit"]));
    res += forge_nat(Number.parseInt(content["storage_limit"]));
    if (content.get("delegate")) {
        res += forge_bool(true);
        res += forge_address(content["delegate"], {"tz_only": true});
    } else {
        res += forge_bool(false);
    }
    return res;
}
export {forge_activate_account, forge_delegation, forge_operation, forge_operation_group, forge_origination, forge_reveal, forge_transaction};

//# sourceMappingURL=forge.js.map
