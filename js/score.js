import * as config from "./config.js";

const CONFIG = config["config"];
function ajax_get(url, callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      try {
        var data = JSON.parse(xmlhttp.responseText);
      } catch (err) {
        console.log(err.message + " in " + xmlhttp.responseText);
        return;
      }
      callback(data);
    }
  };

  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function createColorScale(color, scale) {
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);

  const deltaRed = (red - 255) / (scale - 1);
  const deltaGreen = (green - 255) / (scale - 1);
  const deltaBlue = (blue - 255) / (scale - 1);

  const colorScale = [];
  for (let i = 0; i < scale; i++) {
    const newRed = Math.round(255 + i * deltaRed);
    const newGreen = Math.round(255 + i * deltaGreen);
    const newBlue = Math.round(255 + i * deltaBlue);
    colorScale.push(
      `#${newRed.toString(16)}${newGreen.toString(16)}${newBlue.toString(16)}`
    );
  }

  return colorScale;
}

function onHoverState(state, abbr) {
  console.log(state);

  $("#col").find("span:first").text(state);
  for (const indicator of ["youth", "adulthood1", "adulthood2", "social"]) {
    $(`#${indicator}`)
      .empty()
      .html(
        `<ul><li><span>${scoreData[abbr][indicator]["cr_score100"]}</span></li><li><span></span></li></ul>`
      );
  }
}

const colorPalette = CONFIG["colorPalette"];
const colorScale = {
  youth: createColorScale(
    colorPalette["youth"]["color"],
    colorPalette["youth"]["scale"]
  ),
  adulthood1: createColorScale(
    colorPalette["adulthood1"]["color"],
    colorPalette["adulthood1"]["scale"]
  ),
  adulthood2: createColorScale(
    colorPalette["adulthood2"]["color"],
    colorPalette["adulthood2"]["scale"]
  ),
  social: createColorScale(
    colorPalette["social"]["color"],
    colorPalette["social"]["scale"]
  ),
  overall: createColorScale(
    colorPalette["overall"]["color"],
    colorPalette["overall"]["scale"]
  ),
};

function paintState(theme) {
  const expression = ["match", ["get", "state_abbrev"]];
  for (const stateAbbr of Object.keys(scoreData)) {
    const score = scoreData[stateAbbr][theme]["cr_score100"];
    if (score === 0) continue;

    let level = Math.floor(score / (100 / colorPalette[theme]["scale"]));
    level = level == colorPalette[theme]["scale"] ? level - 1 : level;
    const color = colorScale[theme][level];

    expression.push(stateAbbr, color);
  }
  expression.push("#cdcdcd");

  map.setPaintProperty("state", "fill-color", expression);
}

mapboxgl.accessToken = CONFIG["accessToken"];
let scoreData = {};
ajax_get(CONFIG["scoreDataPath"], function (d) {
  for (const feature of d.features) {
    scoreData[feature.properties.abbr] = feature.properties;
  }
});

const map = new mapboxgl.Map({
  container: "map",
  pitchWithRotate: false,
  dragRotate: false,
  touchZoomRotate: false,
  style: {
    version: 8,
    name: "Mapbox Streets",
    sprite: "mapbox://sprites/mapbox/streets-v8",
    glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    sources: {
      composite: {
        id: "states",
        url: "mapbox://mbxsolutions.albersusa-points,mbxsolutions.albersusa",
        type: "vector",
      },
    },
    layers: [
      {
        id: "state",
        type: "fill",
        source: "composite",
        "source-layer": "albersusa",
        filter: ["all", ["==", "type", "state"], ["!=", "state_abbrev", "PR"]],
        paint: {
          "fill-color": "#cdcdcd",
        },
      },

      {
        id: "state-boundaries",
        type: "line",
        source: "composite",
        "source-layer": "albersusa",
        filter: ["all", ["==", "type", "state"], ["!=", "state_abbrev", "PR"]],
        paint: {
          "line-color": "#6b6b6b",
        },
      },
      {
        id: "state-points",
        type: "symbol",
        source: "composite",
        "source-layer": "albersusa-points",
        filter: ["all", ["==", "type", "state"], ["!=", "state_abbrev", "PR"]],
        layout: {
          "text-field": ["to-string", ["get", "state_abbrev"]],
          "text-font": ["Arial Unicode MS Regular"],
        },
      },
    ],
  },
  center: [0, 1],
  zoom: 4.5,
});

let previousState = null;
let currentTheme = "youth";
map.on("load", () => {
  paintState(currentTheme);

  map.on("mousemove", "state", (e) => {
    const state = e.features[0].properties.state_name;
    const stateAbbrev = e.features[0].properties.state_abbrev;

    if (state === previousState) return;
    previousState = state;

    onHoverState(state, stateAbbrev);
  });

  map.on("mouseenter", "state", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "state", () => {
    map.getCanvas().style.cursor = "";
  });
});
