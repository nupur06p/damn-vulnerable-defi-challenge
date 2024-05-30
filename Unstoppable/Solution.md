# Unstoppable

In the Unstoppable challenge, we have the below challenges to beat the level:

"There’s a tokenized vault with a million DVT tokens deposited. It’s offering flash loans for free, until the grace period ends.
To pass the challenge, make the vault stop offering flash loans.You start with 10 DVT tokens in balance."

The state variable `poolBalance` tracks all DVT tokens deposited into the contract by calling the `depositTokens` function. The poolBalance variable will be updated accordingly when the `depositTokens` function is called.

Borrowers call the `flashLoan` function with an amount they are looking to borrow when they need a loan.

When we look closer at the three things mentioned above that are present inside the contract, we notice that the `poolBalance` variable is updated only when the `depositToken` function is called.

When we take an in-depth look into the `flashLoan` function, we can see that it demands strict equality for the `poolBalance` variable. This means that it will always equal the actual contract’s token balance. It needs to be true before flash loans can be executed successfully.

To solve this challenge, our primary focus will be changing the contract’s DVT token balance without updating the `poolBalance` variable.

To achieve this, we will have to send one or more DVT tokens to the contract by directly calling the `transfer` function. Since our DVT token is ERC20-token-standard-compliant, it’s expected to have a `transfer` function present.

By transferring tokens directly to the contract, we can change the contract’s token balance without updating the `poolBalance` variable since we did not deposit our tokens by calling the `depositTokens` function.

At this point, we have made the `poolBalance` value to not be equal to the actual token balance. This forces the `assert(poolBalance == balanceBefore)` to be false whenever it’s called and prevents anyone from being able to borrow DVT tokens from the lending pool.

## Solution:
1. Create a script using hardhat project.
2. Define a 'before block' and initialize the required variables.
3. Begin the attack by transferring 1 DVT token to the lending pool contract.
4. Now, we can be sure that our contract’s DVT token balance is not equal to the `poolBalance` variable because we transferred 1 DVT token by calling the `transfer` function on the DVT token. 
5. Once we call the `flashLoan` function, we can expect the transaction to be reverted, and that ends our solution for the challenge.

## Recommendations:
In the “Unstoppable” challenge, the vulnerable line of code is in the `flashLoan` function, where the contract checks that the `pool balance` is the same before and after the flash loan. An attacker can modify the pool balance or the balance before bypassing this check, leading to a DDoS attack.

Similarly, in the Edgeware case (`Edgeware Lockdrop Vulnerability`), the vulnerable line of code was in the lock function. This where the contract checks that the balance of the newly created Lock contract matches the amount of ETH sent by the user. An attacker can force this check to fail by sending some spare change to the address of the next Lock contract before it even exists, leading to a DDoS attack.

In both cases, the issue could have been avoided by not assuming that the balance of a contract will remain the same throughout the execution of a function. Instead, contracts should consider that their balance may change due to other contracts self-destructing or sending them ETH before the function call and should use appropriate checks and safeguards to account for these possibilities.

By not making assumptions about the system’s state and adequately handling all possible edge cases, smart contract developers can help ensure the security and reliability of their contracts.

## Takewaways:
Avoid using strict equality checks “==” when writing smart contracts. Instead, use “>=” for equality checks. This is generally recommended as a Solidity security best practice for equality checks.
