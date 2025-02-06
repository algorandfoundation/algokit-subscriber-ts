from typing import Literal

from algopy import *


class ComplexEvent(arc4.Struct):
    array: arc4.DynamicArray[arc4.UInt32]
    int: arc4.UInt64


class TestingApp(ARC4Contract):
    value: UInt64
    bytes1: Bytes
    bytes2: Bytes
    int1: UInt64
    int2: UInt64
    local_bytes1: LocalState[Bytes]
    local_bytes2: LocalState[Bytes]
    local_int1: LocalState[UInt64]
    local_int2: LocalState[UInt64]
    box: BoxMap[arc4.StaticArray[arc4.Byte, Literal[4]], arc4.String]

    def __init__(self) -> None:
        self.local_int1 = LocalState(UInt64)
        self.local_int2 = LocalState(UInt64)
        self.local_bytes1 = LocalState(Bytes)
        self.local_bytes2 = LocalState(Bytes)

        self.box = BoxMap(arc4.StaticArray[arc4.Byte, Literal[4]], arc4.String, key_prefix=b"")

    @subroutine
    def authorize_creator(self) -> None:
        assert Txn.sender == Global.creator_address, "unauthorized"

    @subroutine
    def itoa(self, i: UInt64) -> String:
        if i == UInt64(0):
            return String("0")
        else:
            return (self.itoa(i // UInt64(10)) if (i // UInt64(10)) > UInt64(0) else String("")) + String.from_bytes(
                String("0123456789").bytes[i % UInt64(10)]
            )

    @arc4.baremethod(create="require", allow_actions=["NoOp", "OptIn"])
    def create(self) -> None:
        pass

    @arc4.baremethod(allow_actions=["UpdateApplication"])
    def update(self) -> None:
        self.authorize_creator()

    @arc4.baremethod(allow_actions=["DeleteApplication"])
    def delete(self) -> None:
        self.authorize_creator()

    @arc4.abimethod(allow_actions=["OptIn"])
    def opt_in(self) -> None:
        pass

    @arc4.abimethod(readonly=True)
    def call_abi(self, value: String) -> String:
        return String("Hello, ") + value

    @arc4.abimethod(readonly=True)
    def call_abi_foreign_refs(self) -> String:
        return (
            "App: "
            + self.itoa(Txn.applications(1).id)
            + ", Asset: "
            + self.itoa(Txn.assets(0).id)
            + ", Account: "
            + self.itoa(op.getbyte(Txn.accounts(0).bytes, 0))
            + ":"
            + self.itoa(op.getbyte(Txn.accounts(0).bytes, 1))
        )

    @arc4.abimethod
    def set_global(
        self, int1: UInt64, int2: UInt64, bytes1: String, bytes2: arc4.StaticArray[arc4.Byte, Literal[4]]
    ) -> None:
        self.int1 = int1
        self.int2 = int2
        self.bytes1 = bytes1.bytes
        self.bytes2 = bytes2.bytes

    @arc4.abimethod
    def set_local(
        self, int1: UInt64, int2: UInt64, bytes1: String, bytes2: arc4.StaticArray[arc4.Byte, Literal[4]]
    ) -> None:
        self.local_int1[Txn.sender] = int1
        self.local_int2[Txn.sender] = int2
        self.local_bytes1[Txn.sender] = bytes1.bytes
        self.local_bytes2[Txn.sender] = bytes2.bytes

    @arc4.abimethod
    def issue_transfer_to_sender(self, amount: arc4.UInt64) -> None:
        itxn.Payment(receiver=Txn.sender, amount=amount.native).submit()

    @arc4.abimethod
    def set_box(self, name: arc4.StaticArray[arc4.Byte, Literal[4]], value: arc4.String) -> None:
        self.box[name] = value

    @arc4.abimethod(readonly=True)
    def error(self) -> None:
        assert False, "Deliberate error"  # noqa: PT015, B011

    @arc4.abimethod
    def emitSwapped(self, a: arc4.UInt64, b: arc4.UInt64) -> None:
        arc4.emit("Swapped", a, b)

    @arc4.abimethod
    def emitSwappedTwice(self, a: arc4.UInt64, b: arc4.UInt64) -> None:
        arc4.emit("Swapped", a, b)
        arc4.emit("Swapped", b, a)

    @arc4.abimethod
    def emitComplex(self, a: arc4.UInt64, b: arc4.UInt64, array: arc4.DynamicArray[arc4.UInt32]) -> None:
        arc4.emit("Swapped", a, b)
        arc4.emit("Complex", array, b)
