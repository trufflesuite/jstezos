/*
Welcome to PyTezos!

To start playing with the Tezos blockchain you need to get a PyTezosClient instance.
Just type:

>>> from pytezos import pytezos
>>> pytezos

And follow the interactive documentation.*/
import {RpcProvider, babylonnet, localhost, mainnet, zeronet} from './rpc/__init__';
import * as Errors from './rpc/errors';
import {Key} from './crypto';
import {Proto} from './proto';
import {Contract} from './michelson/contract';
import {format_timestamp} from './michelson/formatter';
import {PyTezosClient} from './client';
import {OperationGroup} from './operation/group';
import {ContractInterface} from './michelson/interface';
import {NonFungibleTokenImpl} from './standards/non_fungible_token';
var pytezos;
pytezos = new PyTezosClient();

//# sourceMappingURL=__init__.js.map
