/*
Welcome to PyTezos!

To start playing with the Tezos blockchain you need to get a PyTezosClient instance.
Just type:

>>> from pytezos import pytezos
>>> pytezos

And follow the interactive documentation.*/
import {RpcProvider, babylonnet, localhost, mainnet, zeronet} from './rpc/__init__';
import * as Errors from './rpc/errors';
import {Key} from 'pytezos/crypto';
import {Proto} from 'pytezos/proto';
import {Contract} from 'pytezos/michelson/contract';
import {format_timestamp} from 'pytezos/michelson/formatter';
import {PyTezosClient} from 'pytezos/client';
import {OperationGroup} from 'pytezos/operation/group';
import {ContractInterface} from 'pytezos/michelson/interface';
import {NonFungibleTokenImpl} from 'pytezos/standards/non_fungible_token';
var pytezos;
pytezos = new PyTezosClient();

//# sourceMappingURL=__init__.js.map
