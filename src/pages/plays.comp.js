import React, {useState, useEffect} from "react"
import styled from "styled-components"
import ReactDatatable from '@ashvin27/react-datatable'
import {getTopShotPlays} from "../util/fetchPlays";

const Root = styled.div`
  font-size: 13px;
  padding: 21px;
`

const Muted = styled.span`
  color: #78899a;
`

const H1 = styled.h1``

const Button = styled.button`
  margin-left: 20px;
  height: 30px;
  font-size: 18px;
  border-radius: 15px;
  border-color: grey;
  border-width: 1px;
`

const config = {
  page_size: 100,
  length_menu: [ 100, 500, 1000 ],
  no_data_text: 'No data available!',
  sort: { column: "playID", order: "desc" },
  key_column: "playID"
}

export function TopshotPlays() {
  const [error, setError] = useState(null)

  // used to chek the reload, so another reload is not triggered while the previous is still running
  // const [done, setDone] = useState(false)

  const [manualReloadDone, setManualReloadDone] = useState(true)

  const [topshotPlays, setTopshotPlays] = useState(null)
  useEffect(() => {
    load()
      .catch(() => setError(true))
  }, [])

  // for reloading
    // disable auto refresh for now
  // useEffect(() => {
  //   if(done){
  //     // set some delay
  //     const timer = setTimeout(()=>{
  //       load()
  //       .catch((e)=>{
  //         setDone(true) // enable reloading again for failed reload attempts
  //       })
  //     }, 5000)
  //     return () => clearTimeout(timer);
  //   }
  // }, [done]);

  const load = () => {
    // setDone(false)
    return getTopShotPlays()
      .then((d) => {
        console.log(d)
        setTopshotPlays(d)
        // setDone(true)
      })
  }

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

  var columns_found = { 'playID': true }; // add playID to columns found since it's in metadata
  topshotPlays.plays.forEach(play => { // get all possible column keys (names) in metadata
    for (var key in play.metadata) {
      columns_found[key] = true;
    }
  });
  columns_found = Object.keys(columns_found); // convert object to array, save only keys

  // preferred column order
  const columns_order = [
    'playID',
    'FullName',
    'DateOfMomentLocal',
    'PlayType',
    'PlayCategory',
    'TeamAtMoment',
    'TeamAtMomentNBAID',
    'HomeTeamName', // game details
    'HomeTeamScore',
    'AwayTeamName',
    'AwayTeamScore',
    'Outcome',
    'NbaSeason',
    'TotalYearsExperience',
    'PrimaryPosition', // play (info specific to play or point in time)
    'PlayerPosition',
    'JerseyNumber',
    'DraftYear',
    'DraftRound',
    'DraftSelection',
    'DraftTeam',
    'Birthdate',
    'Birthplace',
    'Height',
    'Weight',
    'CurrentTeam', // optional and infrequent
    'CurrentTeamID',
  ];

  const columns_extra = columns_found.filter(value => !columns_order.includes(value));
  var columns_ordered = columns_order.concat(columns_extra); // append additional columns not initially found in columns_order

  var columns_exclude = ['LastName', 'FirstName', 'DateOfMoment', 'Tagline']; // columns to exclude
  columns_ordered = columns_ordered.filter(value => !columns_exclude.includes(value));

  console.log(columns_ordered);

  var columns = [];
  columns_ordered.forEach(column_key => {
    columns.push({
      key: column_key,
      text: column_key,
      align: "left",
      sortable: true
    });
  });

  var data = [];
  topshotPlays.plays.forEach(play => {
    var metadata = play.metadata;
    for (let key in metadata) {
      if (metadata[key] === "<invalid Value>") {
        metadata[key] = "";
      }
    }

    metadata.playID = play.playID;

    let date_options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };

    if (metadata.DateOfMoment !== '') {
      metadata.DateOfMomentLocal = new Date(metadata.DateOfMoment).toLocaleString(undefined, date_options);
    }

    metadata.Outcome = (metadata.HomeTeamName === metadata.TeamAtMoment)
    ? (parseInt(metadata.HomeTeamScore) > parseInt(metadata.AwayTeamScore) ? 'Home Win' : 'Home Loss')
    : (parseInt(metadata.HomeTeamScore) > parseInt(metadata.AwayTeamScore) ? 'Away Loss' : 'Away Win');

    data.push(metadata);
  });

  return (
    <Root>
      <H1>
        <span>Plays</span>
        <Button onClick={handleManualReload}>{manualReloadDone ? "Reload" : "Reloading..."}</Button>
      </H1>
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
