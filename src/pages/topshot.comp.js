import React, {useState, useEffect} from "react"
import * as fcl from "@onflow/fcl"
import styled from "styled-components"
import Prism from "prismjs"
import {getTopShotPlays} from "../util/fetchPlays";

const getTopShotSets = async () => {
    const resp = await fcl.send([
        fcl.script`
    import TopShot from 0x${window.topshotAddress}
    access(all) struct Set {
      access(all) let id: UInt32
      access(all) let setName: String
      access(all) let playIDs: [UInt32]
      access(all) var locked: Bool
      init(id: UInt32, setName: String) {
        self.id = id
        self.setName = setName
        self.playIDs = TopShot.getPlaysInSet(setID: id)!
        self.locked = TopShot.isSetLocked(setID: id)!
      }
    }
    access(all) struct TopShotData {
      access(all) var sets: [Set]
      init() {
        var sets: [Set] = []
        self.sets = sets

        var setID = UInt32(1)

        while setID < TopShot.nextSetID {
          var setName = TopShot.getSetName(setID: setID)
          if setName == nil {
            setID = setID + UInt32(1)
            continue
          }
          sets.append(Set(id: setID, setName: setName!))
          setID = setID + UInt32(1)
        }
        self.sets = sets
      }
    }
    access(all) fun main(): TopShotData {
      return TopShotData()
    } `,
    ])
    return fcl.decode(resp)

}

const getTopShot = async () => {
    const plays = await getTopShotPlays();
    const sets = await getTopShotSets();
    return {...plays, ...sets}
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
      .catch((e) => setError(JSON.stringify(e)))
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
