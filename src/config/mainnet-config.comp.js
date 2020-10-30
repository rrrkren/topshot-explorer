import {useEffect} from "react"
import {config} from "@onflow/config"

export function MainnetConfig() {
  window.topshotAddress = "0b2a3299cc857e29"
  window.topshotMarketAddress = "c1e4f4f4c4257510"
  useEffect(() => {
    config().put("accessNode.api", "https://access-mainnet-beta.onflow.org")
  }, [])
  return null
}
