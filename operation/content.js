import {Decimal} from 'decimal';
function format_mutez(value) {
    if ((value === null)) {
        value = 0;
    } else {
        if ((value instanceof Decimal)) {
            value = Number.parseInt((value * Math.pow(10, 6)));
        } else {
            if ((((typeof value) === "number") || (value instanceof Number))) {
                throw new ValueError("Please use decimal instead of float");
            }
        }
    }
    return value.toString();
}
function format_tez(value) {
    var tez;
    tez = (new Decimal(format_mutez(value)) / Math.pow(10, 6));
    return tez.quantize(new Decimal("0.000001"));
}
class ContentMixin {
    operation(content) {
        return content;
    }
    endorsement(level) {
        /*
        Endorse a block
        :param level: Endorsed level
        :return: dict or OperationGroup
        */
        return this.operation({"kind": "endorsement", "level": level.toString()});
    }
    seed_nonce_revelation(level, nonce) {
        /*
        Reveal the nonce committed operation in the previous cycle.
        More info https://tezos.stackexchange.com/questions/567/what-are-nonce-revelations
        :param level: When nonce hash was committed
        :param nonce: Hex string
        :return: dict or OperationGroup
        */
        return this.operation({"kind": "seed_nonce_revelation", "level": level.toString(), "nonce": nonce});
    }
    double_endorsement_evidence(op1, op2) {
        /*
        Provide evidence of double endorsement (endorsing two different blocks at the same block height).
        :param op1: Inline endorsement {
        "branch": $block_hash,
        "operations": {
        "kind": "endorsement",
        "level": integer ∈ [-2^31-2, 2^31+2]
        },
        "signature"?: $Signature
        }
        :param op2: Inline endorsement
        :return: dict or OperationGroup
        */
        return this.operation({"kind": "double_endorsement_evidence", "op1": op1, "op2": op2});
    }
    double_baking_evidence(bh1, bh2) {
        /*
        Provide evidence of double baking (two different blocks at the same height).
        :param bh1: First block hash
        :param bh2: Second block hash
        :return: dict or OperationGroup
        */
        return this.operation({"kind": "double_baking_evidence", "bh1": bh1, "bh2": bh2});
    }
    activate_account(activation_code = "", pkh = "") {
        /*
        Activate recommended allocations for contributions to the TF fundraiser.
        More info https://activate.tezos.com/
        :param activation_code: Secret code from pdf, leave empty for autocomplete
        :param pkh: Public key hash, leave empty for autocomplete
        :return: dict or OperationGroup
        */
        return this.operation({"kind": "activate_account", "pkh": pkh, "secret": activation_code});
    }
    proposals(proposals, source = "", period = 0) {
        /*
        Submit and/or upvote proposals to amend the protocol.
        Can only be submitted during a proposal period.
        More info https://tezos.gitlab.io/master/whitedoc/voting.html
        :param proposals: List of proposal hashes or single proposal hash
        :param source: Public key hash (of the signatory), leave None for autocomplete
        :param period: Number of the current voting period, leave 0 for autocomplete
        :return: dict or OperationGroup
        */
        if ((! (proposals instanceof list))) {
            proposals = [proposals];
        }
        return this.operation({"kind": "proposals", "source": source, "period": period.toString(), "proposals": proposals});
    }
    ballot(proposal, ballot, source = "", period = 0) {
        /*
        Vote for a proposal in a given voting period.
        Can only be submitted during Testing_vote or Promotion_vote periods, and only once per period.
        More info https://tezos.gitlab.io/master/whitedoc/voting.html
        :param proposal: Hash of the proposal
        :param ballot: 'Yay', 'Nay' or 'Pass'
        :param source: Public key hash (of the signatory), leave None for autocomplete
        :param period: Number of the current voting period, leave None for autocomplete
        :return: dict or OperationGroup
        */
        return this.operation({"kind": "ballot", "source": source, "period": period.toString(), "proposal": proposal, "ballot": ballot});
    }
    reveal(public_key = "", source = "", counter = 0, fee = 0, gas_limit = 0, storage_limit = 0) {
        /*
        Reveal the public key associated with a tz address.
        :param public_key: Public key to reveal, Base58 encoded
        :param source: Public key hash of the key revealed, leave None to use signatory address
        :param counter: Current account counter, leave None for autocomplete
        (More info https://tezos.stackexchange.com/questions/632/how-counter-grows)
        :param fee: Leave None for autocomplete
        :param gas_limit: Leave None for autocomplete
        :param storage_limit: Leave None for autocomplete
        :return: dict or OperationGroup
        */
        return this.operation({"kind": "reveal", "source": source, "fee": format_mutez(fee), "counter": counter.toString(), "gas_limit": gas_limit.toString(), "storage_limit": storage_limit.toString(), "public_key": public_key});
    }
    transaction(destination, amount = 0, parameters = null, source = "", counter = 0, fee = 0, gas_limit = 0, storage_limit = 0) {
        /*
        Transfer tezzies to a given address (implicit or originated).
        If the receiver is a smart contract, then optional parameters may be passed.
        :param source: Address from which funds will be sent, leave None to use signatory address
        :param destination: Address
        :param amount: Amount to send in microtez (int) or tez (Decimal) (optional)
        :param counter: Current account counter, leave None for autocomplete
        :param parameters: { "entrypoint": $string, "value": $Micheline expression } (optional)
        :param fee: Leave None for autocomplete
        :param gas_limit: Leave None for autocomplete
        :param storage_limit: Leave None for autocomplete
        :return: dict or OperationGroup
        */
        var content;
        content = {"kind": "transaction", "source": source, "fee": format_mutez(fee), "counter": counter.toString(), "gas_limit": gas_limit.toString(), "storage_limit": storage_limit.toString(), "amount": format_mutez(amount), "destination": destination};
        if ((parameters !== null)) {
            content["parameters"] = parameters;
        }
        return this.operation(content);
    }
    origination(script, balance = 0, delegate = null, source = "", counter = 0, fee = 0, gas_limit = 0, storage_limit = 0) {
        /*
        Deploy smart contract (scriptless KT accounts are not used for delegation since Babylon)
        :param script: {"code": $Micheline, "storage": $Micheline}
        :param balance: Amount transferred on the balance, WARNING: there is no default way to withdraw funds.
        More info: https://tezos.stackexchange.com/questions/1315/can-i-withdraw-funds-from-an-empty-smart-contract
        :param delegate: Set contract delegate, default None
        :param source: Address from which funds will be sent, leave None to use signatory address
        :param counter: Current account counter, leave None for autocomplete
        :param fee: Leave None for autocomplete
        :param gas_limit: Leave None for autocomplete
        :param storage_limit: Leave None for autocomplete
        :return: dict or OperationGroup
        */
        var content;
        content = {"kind": "origination", "source": source, "fee": format_mutez(fee), "counter": counter.toString(), "gas_limit": gas_limit.toString(), "storage_limit": storage_limit.toString(), "balance": format_mutez(balance), "script": script};
        if ((delegate !== null)) {
            content["delegate"] = delegate;
        }
        return this.operation(content);
    }
    delegation(delegate = "", source = "", counter = 0, fee = 0, gas_limit = 0, storage_limit = 0) {
        /*
        Delegate funds or register yourself as a delegate.
        :param delegate: tz address of delegate, leave None to register yourself as a delegate
        :param source: Address from which funds will be delegated, leave None to use signatory address
        :param counter: Current account counter, leave None for autocomplete
        :param fee: Leave None for autocomplete
        :param gas_limit: Leave None for autocomplete
        :param storage_limit: Leave None for autocomplete
        :return: dict or OperationGroup
        */
        return this.operation({"kind": "delegation", "source": source, "fee": format_mutez(fee), "counter": counter.toString(), "gas_limit": gas_limit.toString(), "storage_limit": storage_limit.toString(), "delegate": delegate});
    }
}

//# sourceMappingURL=content.js.map
