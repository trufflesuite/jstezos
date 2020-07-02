import {glob} from 'glob';
import {resolve, dirname, join} from 'path';
import fire from 'js-fire';
import {Contract, RpcError, pytezos} from 'pytezos';
import {generate_docstring} from 'pytezos/michelson/docstring';
import {OperationResult} from 'pytezos/operation/result';
import {create_deployment, create_deployment_status} from 'pytezos/tools/github';
var _pj;
var kernel_js_path, kernel_json;
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
    container["_assert"] = _assert;
    return container;
}
_pj = {};
_pj_snippets(_pj);
kernel_js_path = join(dirname(dirname(__file__)), "assets", "kernel.js");
kernel_json = {"argv": ["pytezos", "kernel", "run", "-file", "{connection_file}"], "display_name": "Michelson", "language": "michelson", "codemirror_mode": "michelson"};
function make_bcd_link(network, address) {
    var net;
    net = {"carthagenet": "carthage", "babylonnet": "babylon", "sandboxnet": "sandbox", "mainnet": "main", "zeronet": "zeronet"};
    return `https://better-call.dev/${net[network]}/${address}`;
}
function get_contract(path) {
    var address, contract, files, network, ptz, script;
    if ((path === null)) {
        files = glob("*.tz");
        _pj._assert((files.length === 1), null);
        contract = Contract.from_file(resolve(files[0]));
    } else {
        if (any(map((x) => {
    return path.startswith(x);
}, ["zeronet", "babylonnet", "mainnet", "carthagenet"]))) {
            [network, address] = path.split(":");
            ptz = pytezos.using({"shell": network});
            script = ptz.shell.contracts[address].script();
            contract = Contract.from_micheline(script["code"]);
        } else {
            contract = Contract.from_file(path);
        }
    }
    return contract;
}
class PyTezosCli {
    storage(action, path = null) {
        /*
        :param action: One of `schema`, `default`
        :param path: Path to the .tz file, or the following uri: <network>:<KT-address>
        */
        var contract;
        contract = get_contract(path);
        if ((action === "schema")) {
            console.log(generate_docstring(contract.storage.schema, {"title": "storage"}));
        } else {
            if ((action === "default")) {
                console.log(JSON.stringify(contract.storage["default"]()));
            } else {
                _pj._assert(false, action);
            }
        }
    }
    parameter(action, path = null) {
        /*
        :param action: One of `schema`
        :param path: Path to the .tz file, or the following uri: <network>:<KT-address>
        */
        var contract;
        contract = get_contract(path);
        if ((action === "schema")) {
            console.log(generate_docstring(contract.parameter.schema, {"title": "parameter"}));
        } else {
            _pj._assert(false, action);
        }
    }
    activate(path, network = "carthagenet") {
        /*
        Activates and reveals key from the faucet file
        :param path: Path to the .json file downloaded from https://faucet.tzalpha.net/
        :param network: Default is Babylonnet
        */
        var opg, ptz;
        ptz = pytezos.using({"key": path, "shell": network});
        console.log(`Activating ${ptz.key.public_key_hash()} in the ${network}`);
        if ((ptz.balance() === 0)) {
            try {
                opg = ptz.activate_account().autofill().sign();
                console.log(`Injecting activation operation:`);
                console.log(JSON.stringify(opg.json_payload()));
                opg.inject({"_async": false});
                console.log(`Activation succeeded! Claimed balance: ${ptz.balance()} ꜩ`);
            } catch(e) {
                if ((e instanceof RpcError)) {
                    console.log(JSON.stringify(e));
                    exit((- 1));
                } else {
                    throw e;
                }
            }
        } else {
            console.log("Already activated");
        }
        try {
            opg = ptz.reveal().autofill().sign();
            console.log(`Injecting reveal operation:`);
            console.log(JSON.stringify(opg.json_payload()));
            opg.inject({"_async": false});
            console.log(`Your key ${ptz.key.public_key_hash()} is now active and revealed`);
        } catch(e) {
            if ((e instanceof RpcError)) {
                console.log(JSON.stringify(e));
                exit((- 1));
            } else {
                throw e;
            }
        }
    }
    deploy(path, storage = null, network = "carthagenet", key = null, github_repo_slug = null, github_oauth_token = null, dry_run = false) {
        /*
        Deploy contract to the specified network
        :param path: Path to the .tz file
        :param storage: Storage in JSON format (not Micheline)
        :param network:
        :param key:
        :param github_repo_slug:
        :param github_oauth_token:
        :param dry_run: Set this flag if you just want to see what would happen
        */
        var bcd_link, contract, deployment, opg, originated_contracts, ptz, status;
        ptz = pytezos.using({"shell": network, "key": key});
        console.log(`Deploying contract using ${ptz.key.public_key_hash()} in the ${network}`);
        contract = get_contract(path);
        if ((storage !== null)) {
            storage = contract.storage.encode(storage);
        }
        try {
            opg = ptz.origination({"script": contract.script({"storage": storage})}).autofill().sign();
            console.log(`Injecting origination operation:`);
            console.log(JSON.stringify(opg.json_payload()));
            if (dry_run) {
                console.log(JSON.stringify(opg.preapply()));
                exit(0);
            } else {
                opg = opg.inject({"_async": false});
            }
            originated_contracts = OperationResult.originated_contracts(opg);
            _pj._assert((originated_contracts.length === 1), null);
            bcd_link = make_bcd_link(network, originated_contracts[0]);
            console.log(`Contract was successfully deployed: ${bcd_link}`);
            if (github_repo_slug) {
                deployment = create_deployment(github_repo_slug, github_oauth_token, {"environment": network});
                console.log(JSON.stringify(deployment));
                status = create_deployment_status(github_repo_slug, github_oauth_token, {"deployment_id": deployment["id"], "state": "success", "environment": network, "environment_url": bcd_link});
                console.log(JSON.stringify(status));
            }
        } catch(e) {
            if ((e instanceof RpcError)) {
                console.log(JSON.stringify(e));
                exit((- 1));
            } else {
                throw e;
            }
        }
    }
}
function main() {
    return new fire(PyTezosCli);
}
if ((__name__ === "__main__")) {
    main();
}

export { PyTezosCli, get_contract, main, make_bcd_link, kernel_js_path, kernel_json }

//# sourceMappingURL=cli.js.map
