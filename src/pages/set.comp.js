import React, {useState, useEffect, useCallback} from "react"
import {useParams} from "react-router-dom"
import styled from "styled-components"

import ReactDatatable from '@ashvin27/react-datatable'

import * as fcl from "@onflow/fcl"
const Red = styled.span`
  color: red;
`
const Green = styled.span`
  color: green;
`
const Muted = styled.span`
  color: #78899a;
`

const Button = styled.button`
  margin-left: 20px;
  height: 30px;
  font-size: 18px;
  border-radius: 15px;
  border-color: grey;
  border-width: 1px;
`

const getTopshotSet = async (setID) => {
  const resp = await fcl.send([
    fcl.script`
      import TopShot from 0x${window.topshotAddress}
      access(all) struct Edition {
        access(all) let playID: UInt32
        access(all) let retired: Bool
        access(all) let momentCount: UInt32
        access(all) let playOrder: UInt32
        init(playID: UInt32, retired: Bool, momentCount: UInt32, playOrder: UInt32) {
          self.playID = playID
          self.retired = retired
          self.momentCount = momentCount
          self.playOrder = playOrder
        }
      }
      access(all) struct Set {
        access(all) let id: UInt32
        access(all) let setName: String
        access(all) let playIDs: [UInt32]
        access(all) let editions: [Edition]
        access(all) let locked: Bool
        access(all) let series: UInt32
        init(id: UInt32, setName: String) {
          self.id = id
          self.setName = setName
          var setData = TopShot.getSetData(setID: id)!
          self.playIDs = setData.getPlays()
          self.locked = setData.locked
          self.series = setData.series
          var editions: [Edition] = []
          var playOrder = UInt32(1)

          for playID in self.playIDs {
            var retired = false
            var retiredEditions = setData.getRetired()
            retired = retiredEditions[playID]!
            var momentCount = UInt32(0)
            var numberMintedPerPlay = setData.getNumberMintedPerPlay()
            momentCount = numberMintedPerPlay[playID]!
            editions.append(Edition(playID: playID, retired: retired, momentCount: momentCount, playOrder: playOrder))
            playOrder = playOrder + UInt32(1)
          }
          self.editions = editions
        }
      }
  access(all) struct MyPlay {
    access(all) let playID: UInt32
    access(all) let metadata: {String:String}

  init(playID: UInt32, metadata: {String:String}) {
    self.playID = playID
    self.metadata = metadata
  }
}

      access(all) struct TopshotSet {
        access(all) let set: Set
        access(all) let plays: [MyPlay]

        init() {
            var setName = TopShot.getSetName(setID: ${setID})
            self.set = Set(id: ${setID}, setName: setName!)
            let sd = TopShot.QuerySetData(setID:  ${setID})!
            self.plays = []
            for playID in sd.getPlays() {
              let md = TopShot.getPlayMetaData(playID: playID)!
              self.plays.append(MyPlay(playID: playID, metadata: md))
            }
          }
      }
      access(all) fun main(): TopshotSet {
        return TopshotSet()
      } `,
  ])
  return fcl.decode(resp)
}
const Root = styled.div`
  font-size: 13px;
  padding: 21px;
`

const columns = [
  {
    key: "playOrder",
    text: "Creation Order",
    align: "left",
    sortable: true,
  },
  {
      key: "playID",
      text: "Play ID",
      align: "left",
      sortable: true,
  },
  {
    key: "retired",
    text: "Retired",
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
      key: "playCategory",
      text: "Play Category",
      sortable: true
  },
  {
      key: "totalMinted",
      text: "Total Minted",
      align: "left",
      sortable: true
  },
];

const config = {
  page_size: 10,
  length_menu: [ 10, 20, 50 ],
  no_data_text: 'No data available!',
  sort: { column: "playOrder", order: "desc" },
  key_column: "playID"
}

export function TopshotSet() {
  const [error, setError] = useState(null)
  const {setID} = useParams()
  const [TopshotSet, setTopshotSet] = useState(null)

  // used to chek the reload, so another reload is not triggered while the previous is still running
  const [done, setDone] = useState(false)

  const [manualReloadDone, setManualReloadDone] = useState(true)

  const load = useCallback(() => {
    setDone(false)
    return getTopshotSet(setID).then(
      (topshotSet) => {
        console.log(topshotSet)
        setTopshotSet(topshotSet)
        setDone(true)
      })
  }, [setID])

  useEffect(() => {
    load()
      .catch(setError)
  }, [setID, load]);

  // for reloading
  useEffect(() => {
    if(done){
      // set some delay
      const timer = setTimeout(()=>{
        load()
        .catch((e)=>{
          setDone(true) // enable reloading again for failed reload attempts
        })
      }, 5000)
      return () => clearTimeout(timer);
    }
  }, [done, load]);

  const handleManualReload = () => {
    setManualReloadDone(false)
    load()
    .then(()=>{
      setManualReloadDone(true)
    })
    .catch((err)=>{
      setManualReloadDone(true)
      // Do we need to show them the error on manual reloadf?
      console.log(`An error occured while reloading err: ${err}`);
    })

  }

  const getPlay = (playID) => {
    return (
      TopshotSet &&
      TopshotSet.plays.filter((play) => {
        return play.playID === playID
      })
    )
  }
  if (error != null)
    return (
      <Root>
        <h3>
          <span>Could NOT fetch info for: {setID}</span>
        </h3>
      </Root>
    )

  if (TopshotSet == null)
    return (
      <Root>
        <h3>
          <span>Fetching Set: {setID}</span>
        </h3>
      </Root>
    )

  const data = TopshotSet.set.editions?.map((edition) => {
    var play = getPlay(edition.playID)[0]
    return {playID: play.playID, retired: edition.retired ? <Red>retired</Red> : <Green>open</Green>, fullName: play.metadata.FullName,
      playType: play.metadata.PlayType, playCategory: play.metadata.PlayCategory, totalMinted: edition.momentCount, playOrder: edition.playOrder}
  })
  return (
    <Root>
      <h1>
        <Muted>{TopshotSet.set.setName}</Muted> S{TopshotSet.set.series}:
        {TopshotSet.set.locked ? <Red>locked set</Red> : <Green>open set</Green>}
        <Button onClick={handleManualReload}>{manualReloadDone ? "Reload" : "Reloading..."}</Button>
      </h1>
      <ReactDatatable
        config={config}
        records={data}
        columns={columns}
        extraButtons={[]}
      />
    </Root>
  )
}
