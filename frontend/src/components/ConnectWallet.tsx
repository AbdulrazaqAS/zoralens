import { useAccount, useDisconnect, useEnsAvatar, useEnsName, useConnect } from 'wagmi'

function WalletOptions() {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <button
      className="bg-primary text-background px-4 py-2 rounded-md hover:bg-accent transition"
      key={connector.uid}
      onClick={() => connect({ connector })}
    >
      Connect {connector.name}
    </button>
  ))
}

function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div className="p-1 bg-primary rounded-xl text-center flex gap-x-2">
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : `${address.slice(0,4)}...${address.slice(-3)}`}</div>}
      <button className="p-1 bg-background rounded-xl hover:bg-background/80" onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}

export default function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}