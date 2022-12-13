// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract FirstComeFirstServed {
    event Entry(address addr, uint256 indexed round, uint256 blockNumber, uint40 timestamp);
    event LockEther(uint256 num);
    event Withdraw(address distination, uint256 amount);
    event ChangeOwner(address, address); // old, new
    event UpdatePeriodBlockNumber(uint256, uint256); // old, new
    event UpdateMaximumEntries(uint256, uint256); // old, new

    // 期間の計算に必要な初期データ
    uint256 public immutable GENESIS_BLOCK_NUMBER;

    // 各期間における先着順の枠（Txによる更新可能）
    uint256 public maximumEntries = 5;
    // 各先着期間のブロック番号（Txによる更新可能）
    // 更新不可が望ましかったが、Polkadot系だとブロック生成時間が短縮されたときに変更できるようにする。
    uint256 public periodBlockNumber = 1000;

    address payable owner;

    // 先着データ
    struct EntryAll {
        address addr;
        uint256 round;
        uint256 blockNumber;
        uint40 timestamp;
    }
    // 先着に入れたすべてのデータ
    EntryAll[] public allEntries;

    // 先着期間ごとに先着に入れたデータ
    mapping(uint256 => address[]) public roundEntries;

    constructor() payable {
        GENESIS_BLOCK_NUMBER = block.number;
        owner = payable(msg.sender);
    }

    // todo: 先着で同じadddressが入っている場合は弾く？
    function entry() external {
        uint256 currentRound = getCurrentRound();

        require(roundEntries[currentRound].length < maximumEntries, "current round is fulled");

        roundEntries[currentRound].push(msg.sender);
        allEntries.push(EntryAll(msg.sender, currentRound, block.number, uint40(block.timestamp)));

        emit Entry(msg.sender, currentRound, block.number, uint40(block.timestamp));

        // todo: etherがないとき
        if (address(this).balance > 0.1 ether) {
            payable(address(msg.sender)).transfer(0.1 ether);
        }
    }

    function getCurrentRound() public view returns (uint256) {
        uint256 pastBlock = block.number - GENESIS_BLOCK_NUMBER;
        uint256 round = (pastBlock / periodBlockNumber) + 1;
        return round;
    }

    function getBlockNumber() external view returns (uint256) {
        return block.number;
    }

    function getEntriesByRound(uint256 _round) external view returns (address[] memory) {
        return roundEntries[_round];
    }

    function getCurrentEntries() external view returns (address[] memory) {
        return roundEntries[getCurrentRound()];
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /*
        ADMIN
    */
    function setMaximumEntries(uint256 _newMaximumEntries) external {
        require(owner == msg.sender, "only Owner");
        uint256 old = maximumEntries;
        maximumEntries = _newMaximumEntries;
        emit UpdateMaximumEntries(old, _newMaximumEntries);
    }

    function setPeriodBlockNumber(uint256 _newPeriodBlockNumber) external {
        require(owner == msg.sender, "only Owner");
        uint256 old = periodBlockNumber;
        periodBlockNumber = _newPeriodBlockNumber;
        emit UpdatePeriodBlockNumber(old, _newPeriodBlockNumber);
    }

    function setOwner(address _newOwner) external {
        require(owner == msg.sender, "only Owner");
        address old = owner;
        owner = payable(_newOwner);
        emit ChangeOwner(old, _newOwner);
    }

    function withdraw(uint256 _value) external {
        require(owner == msg.sender, "only Owner");
        require(address(this).balance > _value, "insufficient balance");
        owner.transfer(_value);
        emit Withdraw(owner, _value);
    }

    receive() external payable {
        emit LockEther(msg.value);
    }
}
