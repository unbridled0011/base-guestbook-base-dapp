// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseGuestbook {
    uint256 public constant MAX_NAME_LENGTH = 24;
    uint256 public constant MAX_MESSAGE_LENGTH = 140;

    struct Entry {
        address writer;
        string name;
        string message;
        uint256 timestamp;
    }

    Entry[] private entries;

    event GuestbookSigned(
        address indexed writer,
        string name,
        string message,
        uint256 timestamp
    );

    function signGuestbook(string calldata name, string calldata message) external {
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= MAX_NAME_LENGTH, "Name too long");
        require(bytes(message).length > 0, "Message required");
        require(bytes(message).length <= MAX_MESSAGE_LENGTH, "Message too long");

        entries.push(
            Entry({
                writer: msg.sender,
                name: name,
                message: message,
                timestamp: block.timestamp
            })
        );

        emit GuestbookSigned(msg.sender, name, message, block.timestamp);
    }

    function totalEntries() external view returns (uint256) {
        return entries.length;
    }

    function getRecentEntries(uint256 limit) external view returns (Entry[] memory recent) {
        uint256 total = entries.length;
        if (limit > total) {
            limit = total;
        }

        recent = new Entry[](limit);
        for (uint256 i = 0; i < limit; i++) {
            recent[i] = entries[total - limit + i];
        }
    }
}
