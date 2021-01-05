import React, {useState, useEffect} from "react"
import * as fcl from "@onflow/fcl"
import styled from "styled-components"
import Prism from "prismjs"

const getTopShot = async () => {
  const resp = await fcl.send([
    fcl.script`
    import TopShot from 0x${window.topshotAddress}
    pub struct Set {
      pub let id: UInt32
      pub let setName: String
      pub let playIDs: [UInt32]
      pub var locked: Bool
      init(id: UInt32, setName: String) {
        self.id = id
        self.setName = setName
        self.playIDs = TopShot.getPlaysInSet(setID: id)!
        self.locked = TopShot.isSetLocked(setID: id)!
        for playID in self.playIDs {
          var retired = false
          retired = TopShot.isEditionRetired(setID: id, playID: playID)!
          var momentCount = UInt32(0)
          momentCount = TopShot.getNumMomentsInEdition(setID: id, playID: playID)!
        }
      }
    }
    pub struct TopShotData {
      pub let totalSupply: UInt64
      pub let plays: [TopShot.Play]
      pub let sets: [Set]
      pub let currentSeries: UInt32
      init() {
        self.totalSupply = TopShot.totalSupply
        self.currentSeries = TopShot.currentSeries
        self.plays = TopShot.getAllPlays()
        var setID = UInt32(1)
        var sets: [Set] = []
        while setID < TopShot.nextSetID {
          var setName = TopShot.getSetName(setID: setID)
          sets.append(Set(id: setID, setName: setName!))
          setID = setID + UInt32(1)
        }
        self.sets = sets
      }
    }
    pub fun main(): TopShotData {
      return TopShotData()
    } `,
  ])
  return fcl.decode(resp)
}

const Root = styled.div`
  // font-family: monospace;
  // color: #233445;
  font-size: 13px;
  padding: 21px;
`

const Muted = styled.span`
  color: #78899a;
`

export function TopShot() {
  const [error, setError] = useState(null)

  const [topshotData, setTopShotData] = useState(null)
  useEffect(() => {
    getTopShot()
      .then((d) => {
        setTopShotData(d)
      })
      .catch(() => setError(true))
  }, [])

  const codeChange = (topshotData || {}).code || new Uint8Array()
  useEffect(() => Prism.highlightAll(), [codeChange])

  if (error != null)
    return (
      <Root>
        <Root>
          <h3>
            <span>Error Fetching TopShot Info: {error}</span>
          </h3>
        </Root>
      </Root>
    )
  if (topshotData == null)
    return (
      <Root>
        <h3>
          <span>Fetching info for TopShot</span>
        </h3>
      </Root>
    )

  return (
    <Root>
      <h3>
        <Muted>TopShot Contract: </Muted>
        <span>0x0b2a3299cc857e29</span>
      </h3>
      <h3>
        <Muted>TopShot Market Contract: </Muted>
        <span>0xc1e4f4f4c4257510</span>
      </h3>
      <div>
        {topshotData && (
          <div>
            <h3>
              <Muted>Total Supply: </Muted>
              <span>{topshotData.totalSupply}</span>
            </h3>
            <h3>
              <Muted>Current Series: </Muted>
              <span>S{topshotData.currentSeries}</span>
            </h3>
          </div>
        )}
      </div>

      <p>
        Built with{" "}
        <span role="img" aria-labelledby="heart">
          ❤️
        </span>{" "}
        on <a href="https://www.onflow.org/" target="_blank" rel="noopener noreferrer">flow</a> 
        <br/>
        open sourced <a href="https://github.com/rrrkren/topshot-explorer" target="_blank" rel="noopener noreferrer">here</a>, PRs welcome!
      </p>
    </Root>
  )
}
