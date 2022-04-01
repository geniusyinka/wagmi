import { providers } from 'ethers'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'remix'
import type { MetaFunction } from 'remix'

import { Provider, chain, createClient, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'

export function loader() {
  require('dotenv').config()
  return {
    alchemyId: process.env.REMIX_ALCHEMY_ID as string,
    etherscanApiKey: process.env.REMIX_ETHERSCAN_API_KEY as string,
    infuraId: process.env.REMIX_INFURA_ID as string,
  }
}

export const meta: MetaFunction = () => {
  return { title: 'wagmi' }
}

const chains = defaultChains
const defaultChain = chain.mainnet

const isChainSupported = (chainId?: number) =>
  chains.some((x) => x.id === chainId)

export default function App() {
  const { alchemyId, etherscanApiKey, infuraId } = useLoaderData()

  const client = createClient({
    autoConnect: true,
    connectors({ chainId }) {
      const rpcUrl =
        chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
        defaultChain.rpcUrls[0]
      return [
        new InjectedConnector({ chains }),
        new CoinbaseWalletConnector({
          chains,
          options: {
            appName: 'wagmi',
            jsonRpcUrl: `${rpcUrl}/${infuraId}`,
          },
        }),
        new WalletConnectConnector({
          chains,
          options: {
            infuraId,
            qrcode: true,
          },
        }),
      ]
    },
    provider({ chainId }) {
      return providers.getDefaultProvider(
        isChainSupported(chainId) ? chainId : defaultChain.id,
        {
          alchemy: alchemyId,
          etherscan: etherscanApiKey,
          infura: infuraId,
        },
      )
    },
    webSocketProvider({ chainId }) {
      return new providers.InfuraWebSocketProvider(
        isChainSupported(chainId) ? chainId : defaultChain.id,
      )
    },
  })

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <script> var global = global || window; </script>
      </head>
      <body>
        <Provider client={client}>
          <Outlet />
        </Provider>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}