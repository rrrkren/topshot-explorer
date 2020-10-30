import {useEffect} from "react"
import {config} from "@onflow/config"

export function LocalConfig() {
  window.topshotAddress = ""
  window.topshotMarketAddress = ""
  useEffect(() => {
    config().put("accessNode.api", "http://localhost:8080").put("fcl.eventsPollRate", 1000)
  }, [])
  return null
}
