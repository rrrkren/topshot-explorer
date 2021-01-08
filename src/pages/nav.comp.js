import React, {useState, useEffect} from "react"
import * as fcl from "@onflow/fcl"
import styled from "styled-components"

import {Navbar, Nav, NavDropdown, Form, FormControl, Button} from "react-bootstrap"
const Red = styled.span`
  color: red;
`
const Green = styled.span`
  color: green;
`
const splitSets = (sets) => {
  return sets.reduce((acc, cur) => {(acc[cur.series] = acc[cur.series] || []).push(cur); return acc}, {})
}

const getTopshotOverview = async () => {
  const resp = await fcl.send([
    fcl.script`
      import TopShot from 0x${window.topshotAddress}
      pub struct Set {
        pub let id: UInt32
        pub let setName: String
        pub var locked: Bool
        pub let series: UInt32
        init(id: UInt32, setName: String, series: UInt32) {
          self.id = id
          self.setName = setName
          self.series = series
          self.locked = TopShot.isSetLocked(setID: id)!
        }
      }
      pub struct TopshotOverview {
        pub let totalSupply: UInt64
        pub let sets: [Set]
        init() {
          self.totalSupply = TopShot.totalSupply
          var setID = UInt32(1)
          var sets: [Set] = []
          while setID < TopShot.nextSetID {
            var setName = TopShot.getSetName(setID: setID)
            var series = TopShot.getSetSeries(setID: setID)
            sets.append(Set(id: setID, setName: setName!, series: series!))
            setID = setID + UInt32(1)
          }
          self.sets = sets
        }
      }
      pub fun main(): TopshotOverview {
        return TopshotOverview()
      } `,
  ])
  return fcl.decode(resp)
}

export function TopShotNav() {
  const [error, setError] = useState(null)
  const [accountAddress, setAccountAddress] = useState("")
  const [seriesSets, setSeriesSets] = useState(null)
  useEffect(() => {
    getTopshotOverview()
      .then((d) => {
        console.log(d)
        setSeriesSets(splitSets(d.sets))
      })
      .catch(setError)
  }, [])
  return (
    <Navbar bg="dark" variant="dark" expand="md" sticky="top">
      <Navbar.Brand href="/">
        {error ? <Red>Topshot Explorer</Red> : "Topshot Explorer"}
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/plays">Plays</Nav.Link>
          {seriesSets && Object.entries(seriesSets).map(
            ([series, sets],i) => {
              return (
                <NavDropdown key={series} title={`s${series} sets`} id="basic-nav-dropdown">
                {sets.map((s) => {
                    return (
                      <NavDropdown.Item key={s.id} href={"/sets/" + s.id}>
                        {s.id} {s.setName} S{s.series} {s.locked ? <Red>locked</Red> : <Green>open</Green>} 
                      </NavDropdown.Item>
                    )
                  })}
              </NavDropdown>
                  )
            }
          )
          }
          {/* <NavDropdown title="Sets" id="basic-nav-dropdown">
            {topshotOverview &&
              topshotOverview.sets.map((s) => {
                return (
                  <NavDropdown.Item key={s.id} href={"/sets/" + s.id}>
                    {s.id} {s.setName} S{s.series} {s.locked ? <Red>locked</Red> : <Green>open</Green>} 
                  </NavDropdown.Item>
                )
              })}
          </NavDropdown> */}
        </Nav>
        <Form inline>
          <FormControl
            type="text"
            placeholder="0xAccountID"
            onChange={(event) => {
              setAccountAddress(event.target.value)
            }}
            className="mr-sm-2"
          />
          <Button variant="outline-success" href={"/account/" + accountAddress}>
            Get Account
          </Button>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  )
}
