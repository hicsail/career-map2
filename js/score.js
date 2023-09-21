import * as config from "./config.js";

const CONFIG = config["config"];
const boundingBox = [
  [-25, 14],
  [23, -14],
];

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

  const deltaRed = (red - 255) / scale;
  const deltaGreen = (green - 255) / scale;
  const deltaBlue = (blue - 255) / scale;

  const colorScale = [];
  for (let i = 0; i <= scale; i++) {
    const newRed = Math.round(255 + i * deltaRed);
    const newGreen = Math.round(255 + i * deltaGreen);
    const newBlue = Math.round(255 + i * deltaBlue);
    colorScale.push(
      `#${newRed.toString(16).padStart(2, "0")}${newGreen.toString(16).padStart(2, "0")}${newBlue
        .toString(16)
        .padStart(2, "0")}`
    );
  }

  return colorScale;
}

function getLuminance(color) {
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function onHoverState(state, abbr) {
  $("#bottom-dash .state-name").find("span").text(state);
  for (const indicator of ["youth", "adulthood1", "adulthood2", "social"]) {
    const score = Math.round((scoreData[abbr][indicator]["cr_score100"] + Number.EPSILON) * 100) / 100;
    $(`.state-row .${indicator}-score`).empty().html(`<span>${score}</span>`);
  }
}

const colorPalette = CONFIG["colorPalette"];
const colorScale = {
  youth: createColorScale(colorPalette["youth"]["color"], colorPalette["youth"]["scale"]),
  adulthood1: createColorScale(colorPalette["adulthood1"]["color"], colorPalette["adulthood1"]["scale"]),
  adulthood2: createColorScale(colorPalette["adulthood2"]["color"], colorPalette["adulthood2"]["scale"]),
  social: createColorScale(colorPalette["social"]["color"], colorPalette["social"]["scale"]),
  overall: createColorScale(colorPalette["overall"]["color"], colorPalette["overall"]["scale"]),
};

function paintState(theme) {
  const expression = ["match", ["get", "state_abbrev"]];
  for (const stateAbbr of Object.keys(scoreData)) {
    const score = scoreData[stateAbbr][theme]["cr_score100"];

    let level = Math.floor(score / (100 / colorPalette[theme]["scale"] + 1)) + 1;
    if (level === colorPalette[theme]["scale"].length) level--;
    if (score === 0) level = 0;

    const color = colorScale[theme][level];

    expression.push(stateAbbr, color);
    $(`#${stateAbbr.toLowerCase()}-badge`).css("background-color", color);
    $(`#${stateAbbr.toLowerCase()}-badge`).css("color", getLuminance(color) > 200 ? "#000" : "#fff");
  }
  expression.push("#cdcdcd");

  map.setPaintProperty("state", "fill-color", expression);
  for (let idx = colorScale[theme].length - 1; idx >= 0; idx--) {
    const item = $("<div></div>");
    const colorBox = $("<span></span>").css("background-color", colorScale[theme][idx]);
    const text = $("<span></span>").text("test");
    item.append(colorBox).append(text);
    $("#choropleth-legend").append(item);
  }
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
        filter: ["all", ["==", "type", "state"], ["!in", "state_abbrev", "PR", "DC"]],
        paint: {
          "fill-color": "#cdcdcd",
        },
      },

      {
        id: "state-boundaries",
        type: "line",
        source: "composite",
        "source-layer": "albersusa",
        filter: ["all", ["==", "type", "state"], ["!in", "state_abbrev", "PR", "DC"]],
        paint: {
          "line-color": "#6b6b6b",
          "line-opacity": 0.7,
        },
      },
      {
        id: "state-fullname",
        type: "symbol",
        source: "composite",
        "source-layer": "albersusa-points",
        filter: [
          "all",
          ["==", "type", "state"],
          ["!in", "state_abbrev", "PR", "DC", "VT", "NH", "MA", "DC", "RI", "CT", "NJ", "MD", "DE"],
        ],
        layout: {
          "text-field": ["to-string", ["get", "state_name"]],
          "text-font": ["Arial Unicode MS Regular"],
        },
      },
      {
        id: "state-abbr",
        type: "symbol",
        source: "composite",
        "source-layer": "albersusa-points",
        filter: [
          "all",
          ["==", "type", "state"],
          ["!in", "state_abbrev", "PR", "DC"],
          ["in", "state_abbrev", "VT", "NH", "MA", "DC", "RI", "CT", "NJ", "MD", "DE"],
        ],
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
  map.fitBounds(boundingBox);
  paintState(currentTheme);

  for (const theme of ["youth", "adulthood1", "adulthood2", "social"]) {
    let accumScore = 0;
    let numStates = 50;
    for (const stateAbbr of Object.keys(scoreData)) {
      if (scoreData[stateAbbr][theme]["cr_score100"] === null) {
        numStates--;
        continue;
      }

      accumScore += scoreData[stateAbbr][theme]["cr_score100"];
    }

    const nationalScore = Math.round((accumScore / numStates + Number.EPSILON) * 100) / 100;

    $(`.national-row .${theme}-score`).empty().html(`<span>${nationalScore}</span>`);
  }

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

$("#state-legends .state-badge").hover(function () {
  const name = $(this).attr("name");
  const abbr = $(this).text();
  onHoverState(name, abbr);
});
