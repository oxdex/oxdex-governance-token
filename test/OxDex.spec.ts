import { Wallet, providers, BigNumber } from "ethers";
import { deployContract, loadFixture, solidity } from "ethereum-waffle";
import chai, { expect } from "chai";
chai.use(solidity);

import OxDexJson from "../build/OxDex.json";
import { OxDex } from "../types";

describe("OxDex", async () => {
  async function fixture([wallet, other]: Wallet[], _: providers.Provider) {
    const token = await deployContract(wallet, OxDexJson);
    return { token: token as OxDex, wallet, other };
  }

  it("name,symobl,decimal,cap", async () => {
    const { token, wallet } = await loadFixture(fixture);
    expect(await token.balanceOf(wallet.address)).to.eq(0);
    expect(await token.cap()).to.eq(
      BigNumber.from("1000000000000000000000000000")
    );
    expect(await token.name()).to.eq("OXDEX");
    expect(await token.symbol()).to.eq("OX");
    expect(await token.decimals()).to.eq(18);
  });
});
