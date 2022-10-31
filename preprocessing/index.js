const fs = require('fs');
const fetch = require('node-fetch');

const philly = [39.9525839, -75.1652215];

const processState = ((state) => {
  let locations = {};
  const tracts = JSON.parse(fs.readFileSync(`../data/${state}.json`)).features;

  tracts.forEach((tract) => {
    const lat = Number(tract.properties.INTPTLAT);
    const lon = Number(tract.properties.INTPTLON);
    if (Math.sqrt((philly[0] - lat) * (philly[0] - lat) + (philly[1] - lon) * (philly[1] - lon)) < 0.05) {
      console.log(`https://www.wawa.com/handlers/locationbylatlong.ashx?limit=5000&lat=${lat}&long=${lon}`)
    }
  })

  //fs.writeFileSync(`../data/wawa_${state}.json`, JSON.stringify(locations, null, 2));
});

processState('pa');
processState('nj');

