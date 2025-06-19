import { useAccount, useDisconnect, useEnsAvatar, useEnsName, useConnect } from 'wagmi'
import { Button } from "@/components/ui/button"

function WalletOptions() {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <Button
      key={connector.uid}
      onClick={() => connect({ connector })}
    >
      Connect {connector.name}
    </Button>
  ))
}

function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div className="p-1 bg-black rounded-xl text-center flex gap-x-2">
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div className='text-white'>{ensName ? `${ensName} (${address})` : `${address.slice(0,4)}...${address.slice(-3)}`}</div>}
      <button className="p-1 bg-background rounded-xl hover:bg-background/80" onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}

export default function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}