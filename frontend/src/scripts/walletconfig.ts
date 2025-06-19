import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask(),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
  batch: {
    multicall: true, // TODO: Add batchsize limit to avoid exceeding provider limits
  }
})