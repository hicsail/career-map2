import * as config from "./config.js";

const CONFIG = config["config"];
const themes = ["youth", "adulthood1", "adulthood2", "social", "overall"];
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
  for (let i = 0; i < scale; i++) {
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
  for (const theme of themes) {
    let subTheme = "cr_score100";
    if (theme === "overall") subTheme = "cr_score3";
    const score = Math.round((scoreData[abbr][theme][subTheme] + Number.EPSILON) * 100) / 100;
    $(`.state-row .${theme}-score`).empty().html(`<span>${score}</span>`);
    generateProgressBar("state", theme, score, colorScale[theme][colorPalette[theme]["scale"] - 1]);
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

function paintState(theme, subTheme = "cr_score100", percentage = true) {
  const expression = ["match", ["get", "state_abbrev"]];
  for (const stateAbbr of Object.keys(scoreData)) {
    const score = scoreData[stateAbbr][theme][subTheme];

    let level = Math.floor(score / (100 / colorPalette[theme]["scale"]));
    if (level === colorPalette[theme]["scale"]) level--;

    let color = colorScale[theme][level];
    if (score === null) color = "#cdcdcd";

    expression.push(stateAbbr, color);
    $(`#${stateAbbr.toLowerCase()}-badge`).css("background-color", color);
    $(`#${stateAbbr.toLowerCase()}-badge`).css("color", getLuminance(color) > 200 ? "#000" : "#fff");
  }
  expression.push("#cdcdcd");

  map.setPaintProperty("state", "fill-color", expression);
  $("#choropleth-legend").empty();
  for (let idx = colorScale[theme].length - 1; idx >= 0; idx--) {
    const item = $("<div></div>");
    const colorBox = $("<span></span>").css("background-color", colorScale[theme][idx]);

    let text = $("<span></span>").text(
      `${idx * (100 / colorPalette[theme]["scale"])} - ${(idx + 1) * (100 / colorPalette[theme]["scale"])}`
    );

    item.append(colorBox).append(text);
    $("#choropleth-legend").append(item);
  }
}

function updateSideDropdown(theme, subTheme = "cr_score100") {
  if (subTheme === "cr_score100" || subTheme === "cr_score3") {
    $("#side-dropdown a.dropdown-toggle").text(CONFIG["propertiesToNames"][theme]);
  } else {
    $("#side-dropdown a.dropdown-toggle").text(CONFIG["propertiesToNames"][subTheme]);
  }
  $("#side-dropdown a.dropdown-toggle").css("color", "#fff");
  $("#side-dropdown a.dropdown-toggle").css("background-color", colorScale[theme][colorPalette[theme]["scale"] - 1]);
  $("#side-dropdown .dropdown-menu").empty();
  for (const subTheme of Object.keys(scoreData["AK"][theme])) {
    if (!CONFIG["propertiesToNames"][subTheme].includes("%")) {
      if (!subTheme.includes("cr_score")) continue;
    }

    $("#side-dropdown .dropdown-menu").append(
      `<a class="dropdown-item" name="${subTheme}">${CONFIG["propertiesToNames"][subTheme]}</a>`
    );
    $(`#side-dropdown .dropdown-menu a[name="${subTheme}"]`).click(function () {
      const subTheme = $(this).attr("name");
      paintState(theme, subTheme);
      updateSideDropdown(theme, subTheme);
    });
  }
}

function generateProgressBar(row, theme, score, color) {
  $(`.${row}-row .${theme}-score`).empty().html(`
      <div class="progress" style="height: 20px">
        <div class="progress-bar" role="progressbar" style="width: ${score}%; background-color: ${color}">
          <span>${score}</span>
        </div>
      </div>`);
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
        id: "state-name-bg",
        type: "symbol",
        source: "composite",
        "source-layer": "albersusa-points",
        filter: [
          "all",
          ["==", "type", "state"],
          ["!in", "state_abbrev", "PR", "DC", "VT", "NH", "MA", "RI", "CT", "NJ", "MD", "DE", "WV", "MS"],
        ],
        layout: {
          "text-field": ["step", ["zoom"], ["get", "state_abbrev"], 4, ["get", "state_name"]],
          "text-font": ["Arial Unicode MS Regular"],
          "text-allow-overlap": true,
        },
      },
      {
        id: "state-name-sm",
        type: "symbol",
        source: "composite",
        "source-layer": "albersusa-points",
        filter: [
          "all",
          ["==", "type", "state"],
          ["in", "state_abbrev", "VT", "NH", "MA", "RI", "CT", "NJ", "MD", "DE", "WV", "MS"],
        ],
        layout: {
          "text-field": ["step", ["zoom"], ["get", "state_abbrev"], 5, ["get", "state_name"]],
          "text-font": ["Arial Unicode MS Regular"],
        },
      },
    ],
  },
  center: [0, 1],
  zoom: 4.5,
});

map.touchZoomRotate.disableRotation();

let previousState = null;
let currentTheme = "youth";
map.on("load", () => {
  map.fitBounds(boundingBox);
  paintState(currentTheme);
  updateSideDropdown(currentTheme);

  for (const theme of themes) {
    let accumScore = 0;
    let numStates = 50;
    for (const stateAbbr of Object.keys(scoreData)) {
      const subTheme = theme === "overall" ? "cr_score3" : "cr_score100";
      if (scoreData[stateAbbr][theme][subTheme] === null) {
        numStates--;
        continue;
      }

      accumScore += scoreData[stateAbbr][theme][subTheme];
    }

    const nationalScore = Math.round((accumScore / numStates + Number.EPSILON) * 100) / 100;
    generateProgressBar("national", theme, nationalScore, colorScale[theme][colorPalette[theme]["scale"] - 1]);
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

  map.on("moveend", () => {
    console.log(map.getZoom());
  });
});

$("#bottom-dash .chart-header .btn").click(function () {
  const theme = $(this).attr("value");
  if (theme === currentTheme) return;
  currentTheme = theme;
  if (theme === "overall") {
    paintState(theme, "cr_score3");
    updateSideDropdown(theme, "cr_score3");
  } else {
    paintState(theme);
    updateSideDropdown(theme);
  }
});

$("#state-legends .state-badge").hover(function () {
  const name = $(this).attr("name");
  const abbr = $(this).text();
  onHoverState(name, abbr);
});