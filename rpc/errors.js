import {RpcError} from 'pytezos/rpc/node';
class MichelsonBadContractParameter extends RpcError {
    /*
    Either no parameter was supplied to a contract with a non-unit parameter type, a non-unit parameter was passed
    to an account, or a parameter was supplied of the wrong type
    */
}
class MichelsonBadReturn extends RpcError {
    /*
    Unexpected stack at the end of a lambda or script
    */
}
class MichelsonRuntimeError extends RpcError {
    /*
    Catch all michelson_v1 errors
    */
}
class TezArithmeticError extends RpcError {
    /*
    Catch all tez errors
    */
}
class MichelsonScriptRejected extends RpcError {
    /*
    A FAILWITH instruction was reached
    */
}

//# sourceMappingURL=errors.js.map
