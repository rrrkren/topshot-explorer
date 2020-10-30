import React from "react"
import ReactDOM from "react-dom"
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {MainnetConfig} from "./config/mainnet-config.comp"

import {BrowserRouter as Router, Route, Switch} from "react-router-dom"

import {Account} from "./pages/account.comp"
import {TopShot} from "./pages/topshot.comp"
import {TopShotNav} from "./pages/nav.comp"
import {TopshotSet} from "./pages/set.comp"
import {TopshotPlays} from "./pages/plays.comp"

import "bootstrap/dist/css/bootstrap.css"

window.fcl = fcl
window.t = t
window.topshotAddress = ""
window.topshotMarketAddress = ""

const NoMatch = () => <div>route not found</div>

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <MainnetConfig></MainnetConfig>
      <TopShotNav></TopShotNav>
      <Switch>
        <Route exact path="/" component={TopShot} />
        <Route exact path="/plays" component={TopshotPlays} />
        <Route exact path="/sets/:setID" component={TopshotSet} />
        <Route exact path="/account/0x:address" component={Account} />
        <Route component={NoMatch} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
)
