/* solium-disable error-reason */
pragma solidity >= 0.6.0;

/// @title Helping hand
/// @author Tonlabs
contract Grunt {

    /// @dev Sends the fixed amount of funds to the specified address, paying for the contract deployment.
    /// @param addr Temporary (non-bounceable) address,
    function grant(address addr) public pure {
	tvm.accept();
        addr.transfer(111000000000, false, 3);
    }
}
