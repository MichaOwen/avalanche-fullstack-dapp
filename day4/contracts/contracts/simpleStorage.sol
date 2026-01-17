// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract SimpleStorage {
    // simpan nilai dalam bentuk uint256
    uint256 private storedValue;
    string private message;

    address public owner;

    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    // jika ada update akan di track
    event ValueUpdated(uint256 newValue);
    event MessageUpdated(string newMessage);

    // Modifier owner yang boleh akses
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnerSet(address(0), owner); // oldOwner = 0 saat deploy
    }
    // simpan data ke blockchain (write)
    function setValue(uint256 _value) public {
        require(msg.sender == owner, "Only owner can update");
        storedValue = _value;
        emit ValueUpdated(_value);
    }

    // Fungsi update message hanya owner
    function setMessage(string calldata _message) public onlyOwner {
        message = _message;
        emit MessageUpdated(_message);
    }

    // membaca nilai dri blockchain (read) terakhir kali di update
    function getValue() public view returns (uint256) {
        return storedValue;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}