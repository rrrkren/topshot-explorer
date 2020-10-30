import React, {useState, useEffect} from "react"
import * as fcl from "@onflow/fcl"
import styled from "styled-components"
import {Table} from "react-bootstrap"

const getTopshotPlays = async () => {
  const resp = await fcl.send([
    fcl.script`
    import TopShot from 0x${window.topshotAddress}
    pub struct TopShotData {
      pub let plays: [TopShot.Play]
      init() {
        self.plays = TopShot.getAllPlays()
      }
    }
    pub fun main(): TopShotData {
      return TopShotData()
    } `,
  ])
  return fcl.decode(resp)
}

const Root = styled.div`
  font-size: 13px;
  padding: 21px;
`

const Muted = styled.span`
  color: #78899a;
`

const H1 = styled.h1``

export function TopshotPlays() {
  const [error, setError] = useState(null)

  const [topshotPlays, setTopshotPlays] = useState(null)
  useEffect(() => {
    getTopshotPlays()
      .then((d) => {
        console.log(d)
        setTopshotPlays(d)
      })
      .catch(() => setError(true))
  }, [])

  if (error != null)
    return (
      <Root>
        <Root>
          <H1>
            <Muted>TopShot: </Muted>
            <span>0x0b2a3299cc857e29</span>
          </H1>
          <h3>
            <span>Error Fetching TopShot Info: {error}</span>
          </h3>
        </Root>
      </Root>
    )
  if (topshotPlays == null)
    return (
      <Root>
        <h3>
          <span>Fetching Plays...</span>
        </h3>
      </Root>
    )

  return (
    <Root>
      <H1>Plays</H1>
      <div>
        {topshotPlays && (
          <div>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>playID</th>
                  <th>full name</th>
                  <th>play type</th>
                  <th>team at moment</th>
                </tr>
              </thead>
              <tbody>
                {topshotPlays.plays.map((play) => {
                  return (
                    <tr key={play.playID}>
                      <td>{play.playID}</td>
                      <td>{play.metadata.FullName}</td>
                      <td>{play.metadata.PlayType}</td>
                      <td>{play.metadata.TeamAtMoment}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </Root>
  )
}
