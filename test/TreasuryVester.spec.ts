import chai, { expect } from "chai";
import { BigNumber, providers, Wallet } from "ethers";
import { solidity, loadFixture, deployContract } from "ethereum-waffle";
chai.use(solidity);

import TreasuryVesterJson from "../build/TreasuryVester.json";

import OxDexJson from "../build/OxDex.json";
import { OxDex, TreasuryVester } from "../types";

describe("TreasuryVester", () => {
  async function mineBlock(
    provider: providers.Web3Provider,
    timestamp: number
  ): Promise<void> {
    return provider.send("evm_mine", [timestamp]);
  }

  async function testfixtrue(
    [wallet, other]: Wallet[],
    provider: providers.Provider
  ) {
    const { timestamp: now } = await provider.getBlock("latest");
    const ox = await deployContract(wallet, OxDexJson);
    const vestingAmount = BigNumber.from(100).mul(BigNumber.from(10).pow(18));
    const vestingBegin = now + 60;
    const vestingCliff = vestingBegin + 60;
    const vestingEnd = vestingBegin + 60 * 60 * 24 * 365;
    const treasuryVester = await deployContract(wallet, TreasuryVesterJson, [
      ox.address,
      other.address,
      vestingAmount,
      vestingBegin,
      vestingCliff,
      vestingEnd,
    ]);

    // fund the treasury
    await ox.mint(treasuryVester.address, vestingAmount);
    return {
      ox: ox as OxDex,
      treasuryVester: treasuryVester as TreasuryVester,
      provider: provider as providers.Web3Provider,
      wallet,
      other,
      vestingAmount,
      vestingBegin,
      vestingCliff,
      vestingEnd,
    };
  }

  let ox: OxDex;
  let treasuryVester: TreasuryVester;
  let vestingAmount: BigNumber;
  let vestingBegin: number;
  let vestingCliff: number;
  let vestingEnd: number;

  let wallet: Wallet;
  let other: Wallet;
  let provider: providers.Web3Provider;

  beforeEach(async () => {
    const fixture = await loadFixture(testfixtrue);
    ox = fixture.ox;
    treasuryVester = fixture.treasuryVester;
    vestingAmount = fixture.vestingAmount;
    vestingBegin = fixture.vestingBegin;
    vestingEnd = fixture.vestingEnd;
    vestingCliff = fixture.vestingCliff;
    wallet = fixture.wallet;
    other = fixture.other;
    provider = fixture.provider;
  });

  it("setRecipient:fail", async () => {
    await expect(
      treasuryVester.setRecipient(wallet.address)
    ).to.be.revertedWith("TreasuryVester::setRecipient: unauthorized");
  });

  it("claim:fail", async () => {
    await expect(treasuryVester.claim()).to.be.revertedWith(
      "TreasuryVester::claim: not time yet"
    );
    await mineBlock(provider, vestingBegin + 1);
    await expect(treasuryVester.claim()).to.be.revertedWith(
      "TreasuryVester::claim: not time yet"
    );
  });

  it("claim:~half", async () => {
    await mineBlock(
      provider,
      vestingBegin + Math.floor((vestingEnd - vestingBegin) / 2)
    );
    await treasuryVester.claim();
    const balance = await ox.balanceOf(other.address);
    expect(
      vestingAmount
        .div(2)
        .sub(balance)
        .abs()
        .lte(vestingAmount.div(2).div(10000))
    ).to.be.true;
  });

  it("claim:all", async () => {
    await mineBlock(provider, vestingEnd);
    await treasuryVester.claim();
    const balance = await ox.balanceOf(other.address);
    expect(balance).to.be.eq(vestingAmount);
  });
});
