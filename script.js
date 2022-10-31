const median = ((values) => {
  if (values.length === 0) return -1;

  values.sort(function(a, b) {
    return a - b;
  });

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];

  return (values[half - 1] + values[half]) / 2.0;
});

const map = L.map('map', {
  zoomControl: false
}).setView([39.95580659996906, -75.18150329589845], 12);

L.tileLayer('https://map.amtrakle.com/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Imagery © <a href="https://www.mapbox.com/">Mapbox</a><br/>Income data from US Census Bureau | Made by <a href="https://piemadd.com/">Piero Maddaleni</a>'
}).addTo(map);

window.tracts = [];
window.locations = {};

const popTypes = {
  B19001_002E: 0,
  B19001_003E: 10000,
  B19001_004E: 15000,
  B19001_005E: 20000,
  B19001_006E: 25000,
  B19001_007E: 30000,
  B19001_008E: 35000,
  B19001_009E: 40000,
  B19001_010E: 45000,
  B19001_011E: 50000,
  B19001_012E: 60000,
  B19001_013E: 75000,
  B19001_014E: 100000,
  B19001_015E: 125000,
  B19001_016E: 150000,
  B19001_017E: 200000,
}

const popTypesEnglish = {
  0: "Less than $10,000",
  10000: "$10,000 to $14,999",
  15000: "$15,000 to $19,999",
  20000: "$20,000 to $24,999",
  25000: "$25,000 to $29,999",
  30000: "$30,000 to $34,999",
  35000: "$35,000 to $39,999",
  40000: "$40,000 to $44,999",
  45000: "$45,000 to $49,999",
  50000: "$50,000 to $59,999",
  60000: "$60,000 to $74,999",
  75000: "$75,000 to $99,999",
  100000: "$100,000 to $124,999",
  125000: "$125,000 to $149,999",
  150000: "$150,000 to $199,999",
  200000: "$200,000 or more",
}

const processState = (async (stateName) => {
  const reqGeo = await fetch(`./data/${stateName}.json`)
  const dataGeo = await reqGeo.json();

  const reqIncome = await fetch(`./data/${stateName}_pop.json`)
  const dataIncome = await reqIncome.json();

  let dataTracts = {};

  dataIncome.forEach((tract, i) => {
    if (i == 0) { return; }
    dataTracts[tract.GEO_ID.split('1400000US')[1]] = tract;
  })

  L.geoJSON(dataGeo, {
    style: function(feature) {
      //console.log(feature)
      const featureData = dataTracts[feature.properties.GEOID];
      let featureArray = [];

      window.tracts.push([Number(feature.properties.INTPTLAT), Number(feature.properties.INTPTLON)])

      for (let i = 0; i < Object.keys(popTypes).length; i++) {
        const total = featureData[Object.keys(popTypes)[i]];

        for (let j = 0; j < total; j++) {
          featureArray.push(i + 1);
        }
      }

      const rawTractValue = median(featureArray);
      const englishTractValue = popTypes[Object.keys(popTypes)[rawTractValue - 1]];

      if (rawTractValue < 0) {
        return {
          weight: 0,
          color: '#00000000'
        };
      }
      
      return {
        weight: 1,
        //color: `hsl(${360 - ((rawTractValue / Object.keys(popTypes).length) * 130)}deg, 80%, 30%)`,
        color: `hsl(${360 - ((englishTractValue / 200000) * 200)}deg, 80%, 30%)`,
        fillOpacity: 0.5
      };
    }
  }).addTo(map);
});

processState('pa')
processState('nj')

fetch('./data/wawa.json')
  .then((res) => res.json())
  .then((wawa) => {
    let allMarkers = [];

    const icon = L.icon({
      iconUrl: 'wawa.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    wawa.forEach((location) => {
      const marker = L.marker(location.location, {
        icon: icon
      }).addTo(map);
      allMarkers.push(marker)
    })

    let group = new L.featureGroup(allMarkers);

    //map.fitBounds(group.getBounds());
  })