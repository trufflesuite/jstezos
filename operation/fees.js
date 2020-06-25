import {forge_operation} from 'pytezos/operation/forge';
var hard_gas_limit_per_operation, hard_storage_limit_per_operation, minimal_fees, minimal_nanotez_per_byte, minimal_nanotez_per_gas_unit;
hard_gas_limit_per_operation = 1040000;
hard_storage_limit_per_operation = 60000;
minimal_fees = 100;
minimal_nanotez_per_byte = 1;
minimal_nanotez_per_gas_unit = 0.1;
function calculate_fee(content, consumed_gas, extra_size, reserve = 10) {
    var fee, size;
    size = (forge_operation(content).length + extra_size);
    fee = ((minimal_fees + (minimal_nanotez_per_byte * size)) + Number.parseInt((minimal_nanotez_per_gas_unit * consumed_gas)));
    return (fee + reserve);
}
function default_fee(content) {
    return calculate_fee({"content": content, "consumed_gas": default_gas_limit(content), "extra_size": ((32 + 64) + (3 * 3))});
}
function default_gas_limit(content) {
    var values;
    values = {"reveal": 10000, "delegation": 10000, "origination": (content.get("script") ? hard_gas_limit_per_operation : 10000), "transaction": (content.get("parameters") ? hard_gas_limit_per_operation : 10207)};
    return values.get(content["kind"]);
}
function default_storage_limit(content) {
    var values;
    values = {"reveal": 0, "delegation": 0, "origination": (content.get("script") ? hard_storage_limit_per_operation : 10207), "transaction": (content.get("parameters") ? hard_storage_limit_per_operation : 257)};
    return values.get(content["kind"]);
}
function burn_cap(content) {
    var values;
    values = {"reveal": 0, "delegation": 0, "origination": 257, "transaction": (content.get("parameters") ? 0 : 257)};
    return values.get(content["kind"]);
}

//# sourceMappingURL=fees.js.map
