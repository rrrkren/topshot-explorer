import React, {useState, useEffect} from "react"
import {useParams} from "react-router-dom"
import styled from "styled-components"

import {Table} from "react-bootstrap"

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

const getTopshotSet = async (setID) => {
  const resp = await fcl.send([
    fcl.script`
      import TopShot from 0x${window.topshotAddress}
      pub struct Edition {
        pub let playID: UInt32
        pub let retired: Bool
        pub let momentCount: UInt32
        init(playID: UInt32, retired: Bool, momentCount: UInt32) {
          self.playID = playID
          self.retired = retired
          self.momentCount = momentCount
        }
      }
      pub struct Set {
        pub let id: UInt32
        pub let setName: String
        pub let playIDs: [UInt32]
        pub let editions: [Edition]
        pub var locked: Bool
        init(id: UInt32, setName: String) {
          self.id = id
          self.setName = setName
          self.playIDs = TopShot.getPlaysInSet(setID: id)!
          self.locked = false
          self.locked = TopShot.isSetLocked(setID: id)!
          var editions: [Edition] = []
          for playID in self.playIDs {
            var retired = false
            retired = TopShot.isEditionRetired(setID: id, playID: playID)!
            var momentCount = UInt32(0)
            momentCount = TopShot.getNumMomentsInEdition(setID: id, playID: playID)!
            editions.append(Edition(playID: playID, retired: retired, momentCount: momentCount))
          }
          self.editions = editions
        }
      }
      pub struct TopshotSet {
        pub let set: Set
        pub let plays: [TopShot.Play]

        init() {
            var setName = TopShot.getSetName(setID: ${setID})
            self.set = Set(id: ${setID}, setName: setName!)
            self.plays = TopShot.getAllPlays()
          }
      }
      pub fun main(): TopshotSet {
        return TopshotSet()
      } `,
  ])
  return fcl.decode(resp)
}
const Root = styled.div`
  font-size: 13px;
  padding: 21px;
`

export function TopshotSet() {
  const [error, setError] = useState(null)
  const {setID} = useParams()
  const [TopshotSet, setTopshotSet] = useState(null)
  useEffect(() => {
    getTopshotSet(setID).then(setTopshotSet).catch(setError)
  }, [setID])
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

  return (
    <Root>
      <h1>
        <Muted>{TopshotSet.set.setName}</Muted>:{" "}
        {TopshotSet.set.locked ? <Red>locked set</Red> : <Green>open set</Green>}
      </h1>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>playID</th>
            <th>retired</th>
            <th>full name</th>
            <th>play type</th>
            <th>total minted</th>
          </tr>
        </thead>
        <tbody>
          {TopshotSet.set.editions.map((edition) => {
            var play = getPlay(edition.playID)[0]
            return (
              <tr key={edition.playID}>
                <td>{play.playID}</td>
                <td>{edition.retired ? <Red>retired</Red> : <Green>open</Green>}</td>
                <td>{play.metadata.FullName}</td>
                <td>{play.metadata.PlayType}</td>
                <td>{edition.momentCount}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Root>
  )
}
