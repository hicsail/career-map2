import * as config from "./config.js";

const CONFIG = config["config"];
const themes = ["youth", "adulthood1", "adulthood2", "social"];
let scoreData = {};
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

  scale++;
  const colorScale = [color];
  for (let i = 1; i < scale; i++) {
    let fraction = Math.sqrt(i / (scale - 1));
    const newRed = Math.round(red + fraction * (255 - red));
    const newGreen = Math.round(green + fraction * (255 - green));
    const newBlue = Math.round(blue + fraction * (255 - blue));

    colorScale.push(
      `#${newRed.toString(16).padStart(2, "0")}${newGreen.toString(16).padStart(2, "0")}${newBlue
        .toString(16)
        .padStart(2, "0")}`
    );
  }

  colorScale.pop();

  return colorScale.reverse();
}

function getLuminance(color) {
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function onHoverState(state, abbr) {
  if ($("#topleft-card").css("display") === "none") {
    $("#topleft-card").css("display", "block");
  }
  $("#bottom-dash .state-name").find("span").text(state);
  $("#topleft-card .state-name").text(state);
  $("#topleft-card .rank").text(`${scoreData[abbr]["overall"]["rank_cr3"]}`);
  $("#topleft-card .score").text(`${scoreData[abbr]["overall"]["cr_score3"]} / 100`);
  for (const theme of themes) {
    const subTheme = "cr_score100";
    const score = scoreData[abbr][theme][subTheme];

    const hasUniqueColor = colorScale[theme][subTheme] !== undefined;
    const colorSubTheme = hasUniqueColor ? subTheme : "default";
    $(`.state-row .${theme}-score`).empty().html(`<span>${score}</span>`);

    let color = colorScale[theme].default[colorPalette[theme]["scale"] - 1];
    if (colorScale[theme][colorSubTheme] !== undefined) {
      color = colorScale[theme][colorSubTheme][colorScale[theme][colorSubTheme].length - 1];
    }

    generateProgressBar("state", theme, score, color);
  }
}

const colorPalette = CONFIG["colorPalette"];
// Generating color scale
const colorScale = {};
for (const [theme, themeObj] of Object.entries(colorPalette)) {
  const themeScale = {};
  // Each theme must have a default color scale
  if ("color" in themeObj["default"] && "scale" in themeObj["default"]) {
    themeScale["default"] = createColorScale(themeObj["default"]["color"], themeObj["default"]["scale"]);
  } else if ("colors" in themeObj["default"]) {
    themeScale["default"] = themeObj["default"]["colors"];
  } else {
    console.error("Error: colorPalette is not properly defined.");
  }

  for (const [subTheme, subThemeObj] of Object.entries(themeObj)) {
    if (subTheme === "default") continue;
    if ("color" in subThemeObj && "scale" in subThemeObj) {
      themeScale[subTheme] = createColorScale(subThemeObj["color"], subThemeObj["scale"]);
    } else if ("colors" in subThemeObj) {
      themeScale[subTheme] = subThemeObj["colors"];
    } else {
      console.error("Error: colorPalette is not properly defined.");
    }
  }

  colorScale[theme] = themeScale;
}

function paintState(theme, subTheme = "cr_score100", max = 100, min = 0) {
  const expression = ["match", ["get", "state_abbrev"]];
  currentSubTheme = subTheme;
  const hasUniqueColor = colorScale[theme][subTheme] !== undefined;
  const colorSubTheme = hasUniqueColor ? subTheme : "default";

  // painting state on the map
  for (const stateAbbr of Object.keys(scoreData)) {
    const score = scoreData[stateAbbr][theme][subTheme];

    let level = Math.floor((score - min) / ((max - min) / colorScale[theme][colorSubTheme].length));
    if (level === colorScale[theme][colorSubTheme].length) level--;

    let color = colorScale[theme][colorSubTheme][level];
    if (score === null) color = "#cdcdcd";
    // if it is ratio, color it inversely
    if (subTheme.includes("ratio"))
      color = colorScale[theme][colorSubTheme][colorScale[theme][colorSubTheme].length - 1 - level];

    expression.push(stateAbbr, color);
    $(`#${stateAbbr.toLowerCase()}-badge`).css("background-color", color);
    $(`#${stateAbbr.toLowerCase()}-badge`).css("color", getLuminance(color) > 200 ? "#000" : "#fff");
  }
  expression.push("#cdcdcd");

  map.setPaintProperty("state", "fill-color", expression);
  $("#choropleth-legend").empty();

  const colorBoxes = [];
  const colorTexts = [];
  for (let idx = colorScale[theme][colorSubTheme].length - 1; idx >= 0; idx--) {
    colorBoxes.push(colorScale[theme][colorSubTheme][idx]);
    colorTexts.push(
      `${Math.floor(idx * ((max - min) / colorScale[theme][colorSubTheme].length) + min)} - ${Math.ceil(
        (idx + 1) * ((max - min) / colorScale[theme][colorSubTheme].length) + min
      )}`
    );
  }

  if (subTheme.includes("ratio")) {
    colorTexts.reverse();
  }
  for (let idx = 0; idx < colorBoxes.length; idx++) {
    const item = $("<div></div>");
    const colorBox = $("<span></span>").css("background-color", colorBoxes[idx]);
    const text = $("<span></span>").text(colorTexts[idx]);

    item.append(colorBox).append(text);
    $("#choropleth-legend").append(item);
    $("#bottom-dash .chart-header .btn").css({ "background-color": "", color: "" });
    $(`#${theme}-head .btn`).css(
      "background-color",
      colorScale[theme][colorSubTheme][colorScale[theme][colorSubTheme].length - 1]
    );
    $(`#${theme}-head .btn`).css(
      "color",
      getLuminance(colorScale[theme][colorSubTheme][colorScale[theme][colorSubTheme].length - 1]) > 200
        ? "#000"
        : "#fff"
    );
  }
}

function updateSideDropdown(theme, subTheme = "cr_score100") {
  const hasUniqueColor = colorScale[theme][subTheme] !== undefined;
  const colorSubTheme = hasUniqueColor ? subTheme : "default";

  $("#side-dropdown a.btn").empty();
  if (subTheme === "cr_score100" || subTheme === "cr_score3") {
    $("#side-dropdown a.btn").text(CONFIG["propertiesToNames"][theme]);
  } else {
    $("#side-dropdown a.btn").text(CONFIG["propertiesToNames"][subTheme]);
  }
  $("#side-dropdown a.btn").css("color", "#fff");
  $("#side-dropdown a.btn").css(
    "background-color",
    colorScale[theme][colorSubTheme][colorScale[theme][colorSubTheme].length - 1]
  );

  $("#side-dropdown a.btn").append(
    `<div class="vr" style="border-color:${
      colorScale[theme][colorSubTheme][colorScale[theme][colorSubTheme].length - 2]
    }"/>`
  );
  $("#side-dropdown a.btn").append(
    `<svg height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-18.53 -18.53 222.40 222.40" xml:space="preserve" fill="#ffffff" transform="rotate(0)" stroke="#ffffff" stroke-width="9.267149999999999"><path style="fill:#ffffff;" d="M51.707,185.343c-2.741,0-5.493-1.044-7.593-3.149c-4.194-4.194-4.194-10.981,0-15.175 l74.352-74.347L44.114,18.32c-4.194-4.194-4.194-10.987,0-15.175c4.194-4.194,10.987-4.194,15.18,0l81.934,81.934 c4.194,4.194,4.194,10.987,0,15.175l-81.934,81.939C57.201,184.293,54.454,185.343,51.707,185.343z" /></svg>`
  );

  $("#side-dropdown .dropdown-menu").empty();
  for (const subTheme of Object.keys(scoreData["AK"][theme])) {
    let max = 100;
    let min = 0;
    if (subTheme.includes("rank")) continue;
    if (!subTheme.includes("cr_score")) {
      max = Math.ceil(Math.max(...Object.values(scoreData).map((d) => d[theme][subTheme])) + Number.EPSILON);
      min = Math.floor(Math.min(...Object.values(scoreData).map((d) => d[theme][subTheme])) + Number.EPSILON);
    }

    $("#side-dropdown .dropdown-menu").append(
      `<a class="dropdown-item" name="${subTheme}">${CONFIG["propertiesToNames"][subTheme]}</a>`
    );
    $(`#side-dropdown .dropdown-menu a[name="${subTheme}"]`).click(function () {
      const subTheme = $(this).attr("name");
      paintState(theme, subTheme, max, min);
      updateSideDropdown(theme, subTheme);
    });
  }
}

function generateProgressBar(row, theme, score, color) {
  $(`.${row}-row .${theme}-score`).empty().html(`
      <div class="progress">
        <div class="progress-bar" role="progressbar" style="width: ${score}%; background-color: ${color}">
          <span>${score}</span>
        </div>
      </div>`);
}

function openStateModal(state, stateAbbrev) {
  $("#state-modal .modal-title").text(state);
  $("#state-modal #state-rank-number").text(scoreData[stateAbbrev]["overall"]["rank_cr3"]);
  $("#state-modal #state-score-number").text(`${scoreData[stateAbbrev]["overall"]["cr_score3"]} / 100`);
  $("#state-modal .modal-body .row-content").remove();
  for (const theme of themes) {
    $(`#state-modal .modal-body .${theme}-content`).empty();
    $(`#state-modal .modal-body .${theme}-sec h4`).css(
      "color",
      colorScale[theme]["default"][colorScale[theme]["default"].length - 1]
    );
    $(`#state-modal .modal-body .${theme}-sec .rank`).text(`Ranking: #${scoreData[stateAbbrev][theme]["rank"]}`);
    $(`#state-modal .modal-body .${theme}-sec .state-col`).text(state);
    const entries = Object.entries(scoreData[stateAbbrev][theme]).filter((d) => !d[0].includes("rank"));
    for (let idx = 0; idx < entries.length; idx++) {
      const [key, val] = entries[idx];
      let name = CONFIG["propertiesToNames"][key];
      let value = val;
      let nationalValue = scoreData["US"][theme][key];

      if (typeof val !== "number") {
        value = "-";
        nationalValue = "-";
      } else if (key.includes("ratio")) {
        // for ratio data
        value += " : 1";
        nationalValue += " : 1";
      } else if (name.includes("(%)")) {
        // for percent data
        name = name.replace(" (%)", "");
        value += "%";
        nationalValue += "%";
      } else if (name.includes("($)")) {
        // for dollar data
        name = name.replace(" ($)", "");
        value = `$${value}`;
        nationalValue = `$${nationalValue}`;
      }

      $(`#state-modal .modal-body .${theme}-sec`).append(
        `<div class="row row-content ${idx % 2 === 0 ? "bg-light" : ""}">
          <div class="col-8">${name}</div>
          <div class="col-2">${value}</div>
          <div class="col-2">${nationalValue}</div>
          </div>`
      );
    }
  }

  $("#state-modal").modal("show");
}

mapboxgl.accessToken = CONFIG["accessToken"];
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
let currentSubTheme = "cr_score100";
map.on("load", () => {
  map.fitBounds(boundingBox);
  paintState(currentTheme);
  updateSideDropdown(currentTheme);

  for (const theme of themes) {
    const nationalScore = scoreData["US"][theme]["cr_score100"];
    const hasUniqueColor = colorScale[theme]["cr_score100"] !== undefined;
    const colorSubTheme = hasUniqueColor ? "cr_score100" : "default";
    generateProgressBar(
      "national",
      theme,
      nationalScore,
      colorScale[theme][colorSubTheme][colorScale[theme][colorSubTheme].length - 1]
    );
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

  map.on("click", "state", (e) => {
    const state = e.features[0].properties.state_name;
    const stateAbbrev = e.features[0].properties.state_abbrev;
    openStateModal(state, stateAbbrev);
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

$("#state-legends .state-badge").click(function () {
  const name = $(this).attr("name");
  const abbr = $(this).text();
  openStateModal(name, abbr);
});
