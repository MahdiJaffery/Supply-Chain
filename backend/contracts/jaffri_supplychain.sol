// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract jaffri_supplychain {
    enum Role { Manufacturer, Distributor, Retailer, Customer }
    enum Status { Manufactured, InTransit, Delivered }

    struct Product {
        uint256 id;
        string name;
        string description;
        address currentOwner;
        Role ownerRole;
        Status status;
    }

    struct HistoryEntry {
        address passedFrom;
        address passedTo;
        Role newRole;
        Status newStatus;
        uint256 timestamp;
    }

    uint256 public nextProductId;
    mapping(uint256 => Product) public products;
    mapping(uint256 => HistoryEntry[]) public productHistory;

    event ProductRegistered(uint256 indexed productId, string name, address indexed owner);
    event ProductTransferred(uint256 indexed productId, address indexed from, address indexed to, Role newRole, Status newStatus);

    modifier productExists(uint256 _productId) {
        require(_productId < nextProductId, "Product does not exist");
        _;
    }

    function registerProduct(string memory _name, string memory _description) public returns (uint256) {
        uint256 currentId = nextProductId++;
        
        products[currentId] = Product({
            id: currentId,
            name: _name,
            description: _description,
            currentOwner: msg.sender,
            ownerRole: Role.Manufacturer,
            status: Status.Manufactured
        });

        productHistory[currentId].push(HistoryEntry({
            passedFrom: address(0),
            passedTo: msg.sender,
            newRole: Role.Manufacturer,
            newStatus: Status.Manufactured,
            timestamp: block.timestamp
        }));

        emit ProductRegistered(currentId, _name, msg.sender);
        return currentId;
    }

    function transferProduct(uint256 _productId, address _newOwner, Role _newRole, Status _newStatus) public productExists(_productId) {
        Product storage prod = products[_productId];
        require(prod.currentOwner == msg.sender, "Only current owner can transfer");
        require(prod.status != Status.Delivered, "Product already delivered");
        
        address prevOwner = prod.currentOwner;
        prod.currentOwner = _newOwner;
        prod.ownerRole = _newRole;
        prod.status = _newStatus;

        productHistory[_productId].push(HistoryEntry({
            passedFrom: prevOwner,
            passedTo: _newOwner,
            newRole: _newRole,
            newStatus: _newStatus,
            timestamp: block.timestamp
        }));

        emit ProductTransferred(_productId, prevOwner, _newOwner, _newRole, _newStatus);
    }

    function getProductHistory(uint256 _productId) public view productExists(_productId) returns (HistoryEntry[] memory) {
        return productHistory[_productId];
    }
}
