from typing import Literal, TypeAlias

import beaker
import pyteal as pt
from beaker.lib.storage import BoxMapping
from pyteal.ast import CallConfig, MethodConfig


class BareCallAppState:
    value = beaker.GlobalStateValue(stack_type=pt.TealType.uint64)
    bytes1 = beaker.GlobalStateValue(stack_type=pt.TealType.bytes)
    bytes2 = beaker.GlobalStateValue(stack_type=pt.TealType.bytes)
    int1 = beaker.GlobalStateValue(stack_type=pt.TealType.uint64)
    int2 = beaker.GlobalStateValue(stack_type=pt.TealType.uint64)
    local_bytes1 = beaker.LocalStateValue(stack_type=pt.TealType.bytes)
    local_bytes2 = beaker.LocalStateValue(stack_type=pt.TealType.bytes)
    local_int1 = beaker.LocalStateValue(stack_type=pt.TealType.uint64)
    local_int2 = beaker.LocalStateValue(stack_type=pt.TealType.uint64)
    box = BoxMapping(pt.abi.StaticBytes[Literal[4]], pt.abi.String)


app = beaker.Application("TestingApp", state=BareCallAppState)


@app.external(read_only=True)
def call_abi(value: pt.abi.String, *, output: pt.abi.String) -> pt.Expr:
    return output.set(pt.Concat(pt.Bytes("Hello, "), value.get()))


# https://github.com/algorand/pyteal-utils/blob/main/pytealutils/strings/string.py#L63
@pt.Subroutine(pt.TealType.bytes)
def itoa(i: pt.Expr) -> pt.Expr:
    """itoa converts an integer to the ascii byte string it represents"""
    return pt.If(
        i == pt.Int(0),
        pt.Bytes("0"),
        pt.Concat(
            pt.If(i / pt.Int(10) > pt.Int(0), itoa(i / pt.Int(10)), pt.Bytes("")),
            pt.Extract(pt.Bytes("0123456789"), i % pt.Int(10), pt.Int(1)),
        ),
    )


@app.external(read_only=True)
def call_abi_foreign_refs(*, output: pt.abi.String) -> pt.Expr:
    return output.set(
        pt.Concat(
            pt.Bytes("App: "),
            itoa(pt.Txn.applications[1]),
            pt.Bytes(", Asset: "),
            itoa(pt.Txn.assets[0]),
            pt.Bytes(", Account: "),
            itoa(pt.GetByte(pt.Txn.accounts[0], pt.Int(0))),
            pt.Bytes(":"),
            itoa(pt.GetByte(pt.Txn.accounts[0], pt.Int(1))),
        )
    )


@app.external()
def set_global(
    int1: pt.abi.Uint64, int2: pt.abi.Uint64, bytes1: pt.abi.String, bytes2: pt.abi.StaticBytes[Literal[4]]
) -> pt.Expr:
    return pt.Seq(
        app.state.int1.set(int1.get()),
        app.state.int2.set(int2.get()),
        app.state.bytes1.set(bytes1.get()),
        app.state.bytes2.set(bytes2.get()),
    )


@app.external()
def set_local(
    int1: pt.abi.Uint64, int2: pt.abi.Uint64, bytes1: pt.abi.String, bytes2: pt.abi.StaticBytes[Literal[4]]
) -> pt.Expr:
    return pt.Seq(
        app.state.local_int1.set(int1.get()),
        app.state.local_int2.set(int2.get()),
        app.state.local_bytes1.set(bytes1.get()),
        app.state.local_bytes2.set(bytes2.get()),
    )


@app.external()
def issue_transfer_to_sender(amount: pt.abi.Uint64) -> pt.Expr:
    return pt.InnerTxnBuilder.Execute(
        {
            pt.TxnField.type_enum: pt.TxnType.Payment,
            pt.TxnField.amount: amount.get(),
            pt.TxnField.receiver: pt.Txn.sender(),
            pt.TxnField.fee: pt.Int(0),
        }
    )


@app.external()
def set_box(name: pt.abi.StaticBytes[Literal[4]], value: pt.abi.String) -> pt.Expr:
    return app.state.box[name.get()].set(value.get())


@app.external()
def error() -> pt.Expr:
    return pt.Assert(pt.Int(0), comment="Deliberate error")


@app.external(
    bare=True,
    method_config=MethodConfig(no_op=CallConfig.CREATE, opt_in=CallConfig.CREATE),
)
def create() -> pt.Expr:
    return pt.Approve()


@app.update(authorize=beaker.Authorize.only_creator(), bare=True)
def update() -> pt.Expr:
    return pt.Approve()


@app.delete(authorize=beaker.Authorize.only_creator(), bare=True)
def delete() -> pt.Expr:
    return pt.Approve()


@app.opt_in
def opt_in() -> pt.Expr:
    return pt.Approve()


@app.external()
def emitSwapped(a: pt.abi.Uint64, b: pt.abi.Uint64) -> pt.Expr:
    return pt.Seq(
        # 4 byte prefix for this method selector is 1ccbd925 (hex) per https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0028.md#reference-implementation
        pt.Log(pt.Concat(pt.MethodSignature("Swapped(uint64,uint64)"), pt.Itob(a.get()), pt.Itob(b.get()))),
        pt.Approve(),
    )


@app.external()
def emitSwappedTwice(a: pt.abi.Uint64, b: pt.abi.Uint64) -> pt.Expr:
    return pt.Seq(
        pt.Log(pt.Concat(pt.MethodSignature("Swapped(uint64,uint64)"), pt.Itob(a.get()), pt.Itob(b.get()))),
        pt.Log(pt.Concat(pt.MethodSignature("Swapped(uint64,uint64)"), pt.Itob(b.get()), pt.Itob(a.get()))),
        pt.Approve(),
    )


DynamicIntArray: TypeAlias = pt.abi.DynamicArray[pt.abi.Uint32]


class ComplexEvent(pt.abi.NamedTuple):
    array: pt.abi.Field[DynamicIntArray]
    int: pt.abi.Field[pt.abi.Uint64]


@app.external()
def emitComplex(a: pt.abi.Uint64, b: pt.abi.Uint64, array: pt.abi.DynamicArray[pt.abi.Uint32]) -> pt.Expr:
    return pt.Seq(
        pt.Log(pt.Concat(pt.MethodSignature("Swapped(uint64,uint64)"), pt.Itob(a.get()), pt.Itob(b.get()))),
        (event := ComplexEvent()).set(array, b),
        pt.Log(pt.Concat(pt.MethodSignature("Complex(uint32[],uint64)"), event._stored_value.load())),
        pt.Approve(),
    )
