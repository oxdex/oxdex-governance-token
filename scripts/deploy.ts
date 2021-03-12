import { BigNumber, providers, Wallet } from 'ethers'
import { deployContract } from 'ethereum-waffle'
import OX from '../build/Ox.json'
import { enpoint, mnemonic } from '../deploy.json'
import { createInterface } from 'readline'

const deployComfirm = (chainId: number, deployer: string) => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((res, rej) => {
    rl.question(`Please confirm: deploy by ${deployer} on network ${chainId}(Y/n) `, (answer) => {
      try {
        if (answer === 'Y') {
          res(null)
        } else {
          rej('rejected')
        }
      } finally {
        rl.close()
      }
    })
  })
}

async function main() {
  const provider = new providers.JsonRpcProvider(enpoint)
  const signer = Wallet.fromMnemonic(mnemonic).connect(provider)

  const signerNonce = await signer.getTransactionCount()
  if (signerNonce !== 2) {
    throw new Error('OxDexFactory should be deployed with a fresh account')
  }

  const signerBalance = await signer.getBalance()
  if (signerBalance.lt(BigNumber.from('200000000000000000'))) {
    throw new Error('insufficient funds for deploying')
  }

  const { chainId } = await provider.getNetwork()
  await deployComfirm(chainId, signer.address)

  console.log('deploying...')
  const factory = await deployContract(signer, OX)
  await factory.deployed()
  console.log('deployed at', factory.address)
}

main().catch(console.log)
