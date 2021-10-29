import {useEffect} from "react"
import {config} from "@onflow/config"

export function TestnetConfig() {
  window.topshotAddress = "877931736ee77cff"
  window.topshotMarketAddress = "547f177b243b4d80"
  useEffect(() => {
    config().put("accessNode.api", "https://access-testnet.onflow.org")
  }, [])
  return null
}
