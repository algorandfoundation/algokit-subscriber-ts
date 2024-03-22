import algosdk from 'algosdk'
import AsyncLock from 'async-lock'
import Account = algosdk.Account
import Algodv2 = algosdk.Algodv2

let currentTestAccountPointer = 0
const testAccountLock = new AsyncLock()
export async function cachedTestAccountGenerator(algod: Algodv2) {
  return await testAccountLock.acquire<Account>('cachedTestAccountGenerator', async () => {
    const accountAddresses = (await import('./testAccounts/accounts-addrs')).default

    if (currentTestAccountPointer === 0) {
      // Given tests often run in an ephemeral environment (e.g. Continuous Integration), let's try account 0 first
      const account = await algod.accountInformation(accountAddresses[0]).do()

      // That account already existed; use a binary search to find where we are up to against the current LocalNet
      if (account && account.amount > 0) {
        let left = 0
        let right = accountAddresses.length - 1

        while (left <= right) {
          const mid = Math.floor((left + right) / 2)
          const midAccount = await algod.accountInformation(accountAddresses[mid]).do()

          if (midAccount && account.amount > 0) {
            left = mid + 1
          } else {
            right = mid - 1
          }
        }

        currentTestAccountPointer = left
      }
    }

    // We've exhausted our pre-canned list of test accounts or we aren't running on localnet; generate a new account
    if (currentTestAccountPointer >= accountAddresses.length) {
      return algosdk.generateAccount()
    }

    const accountAddress = accountAddresses[currentTestAccountPointer]
    let sk = ''
    const skFileIndex = Math.floor(currentTestAccountPointer / 1000)
    switch (skFileIndex) {
      case 0:
        sk = (await import('./testAccounts/accounts-sks-0')).default[currentTestAccountPointer % 1000]
        break
      case 1:
        sk = (await import('./testAccounts/accounts-sks-1')).default[currentTestAccountPointer % 1000]
        break
      case 2:
        sk = (await import('./testAccounts/accounts-sks-2')).default[currentTestAccountPointer % 1000]
        break
      case 3:
        sk = (await import('./testAccounts/accounts-sks-3')).default[currentTestAccountPointer % 1000]
        break
      case 4:
        sk = (await import('./testAccounts/accounts-sks-4')).default[currentTestAccountPointer % 1000]
        break
      case 5:
        sk = (await import('./testAccounts/accounts-sks-5')).default[currentTestAccountPointer % 1000]
        break
      case 6:
        sk = (await import('./testAccounts/accounts-sks-6')).default[currentTestAccountPointer % 1000]
        break
      case 7:
        sk = (await import('./testAccounts/accounts-sks-7')).default[currentTestAccountPointer % 1000]
        break
      case 8:
        sk = (await import('./testAccounts/accounts-sks-8')).default[currentTestAccountPointer % 1000]
        break
      case 9:
        sk = (await import('./testAccounts/accounts-sks-9')).default[currentTestAccountPointer % 1000]
        break
      default:
        throw new Error('Invalid skFileIndex')
    }
    const secretKey = Buffer.from(sk, 'base64')
    currentTestAccountPointer = currentTestAccountPointer + 1
    return {
      addr: accountAddress,
      sk: secretKey,
    } satisfies Account
  })
}
