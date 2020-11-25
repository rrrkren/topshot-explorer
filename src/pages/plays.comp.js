import React, {useState, useEffect} from "react"
import * as fcl from "@onflow/fcl"
import styled from "styled-components"
import ReactDatatable from '@ashvin27/react-datatable'

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

const columns = [
  {
      key: "playID",
      text: "Play ID",
      align: "left",
      sortable: true,
  },
  {
      key: "fullName",
      text: "Full Name",
      align: "left",
      sortable: true
  },
  {
      key: "playType",
      text: "Play Type",
      sortable: true
  },
  {
      key: "teamAtMoment",
      text: "Team at Moment",
      align: "left",
      sortable: true
  },
];

const config = {
  page_size: 10,
  length_menu: [ 10, 20, 50 ],
  no_data_text: 'No data available!',
  sort: { column: "playID", order: "desc" }
}

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

  const data = topshotPlays.plays?.map((play) => {
    return {playID: play.playID, fullName: play.metadata.FullName,
      playType: play.metadata.PlayType, teamAtMoment: play.metadata.TeamAtMoment}
  })

  return (
    <Root>
      <H1>Plays</H1>
      <div>
        {topshotPlays && (
          <div>
            <ReactDatatable
              config={config}
              records={data}
              columns={columns}
              extraButtons={[]}
            />
          </div>
        )}
      </div>
    </Root>
  )
}
