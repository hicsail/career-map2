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

function attachOnChangeEventToStateRecomOpts(stateRecoms, defaultColor, stateRecomHighlightColor) {
  $("#scores input[name='score-radio']").change(function () {
    if ($(this).is(":checked")) {
      const states = stateRecoms[$(this).val()];
      resetSmallSateBadgesColor(defaultColor);
      map.setPaintProperty("states", "fill-color", [
        "case",
        ["in", ["get", "state_name"], ["literal", stateRecoms[$(this).val()]]],
        stateRecomHighlightColor,
        defaultColor,
      ]);

      $("#dropdownBtn").text("CCD Center State Recommendation: " + $(this).val());
      for (const state of states) {
        highlightSmallStateBadge(state, defaultColor, stateRecomHighlightColor);
      }
    }
  });
}

function getSelectedScore() {
  let selectedScore;
  $("#scores input[name='score-radio']").each(function () {
    if ($(this).is(":checked")) {
      selectedScore = $(this).val();
      return false;
    }
  });
  return selectedScore;
}

function resetStateRecoms() {
  $("#dropdownBtn").text("CCD Center State Recommendation ");
  $("#scores input[name='score-radio']").each(function () {
    $(this).prop("checked", false);
  });
}

function attachClickEventToStateBadges() {
  $("#state-legends div").each(function () {
    $(this).on("click", function () {
      const stateAbbr = $(this).attr("name");
      onClickState(stateAbbr);
    });
  });
}

function resetSmallSateBadgesColor(defaultColor) {
  $("#state-legends div").each(function () {
    if ($(this).attr("name") === stateName) {
      $(this).css("background-color", hightlightColor);
    } else {
      $(this).css("background-color", defaultColor);
    }
  });
}

function highlightSmallStateBadge(stateName, defaultColor, hightlightColor) {
  $("#state-legends")
    .find("[name='" + stateName + "']")
    .css("background-color", hightlightColor);
}

function onClickState(stateAbbr) {
  resetStateRecoms();
  resetSmallSateBadgesColor(CONFIG["defaultColor"]);
  highlightSmallStateBadge(stateAbbr, CONFIG["defaultColor"], CONFIG["onClickHightlightColor"]);
  if (!stateAbbr) {
    return;
  }

  const features = statesData.features.filter((f) => f.properties.abbr === stateAbbr);
  let properties = features[0].properties;
  const stateName = properties["name"];

  map.setPaintProperty("states", "fill-color", [
    "case",
    ["==", ["get", "state_abbrev"], stateAbbr],
    CONFIG["onClickHightlightColor"],
    CONFIG["defaultColor"],
  ]);

  $("#stateName")
    .removeClass("d-none")
    .empty()
    .text("Links for " + stateName);
  $("#links").empty();
  const category = $(`<div class="policy-category"></div>`);
  const categoryBody = $(`<div class="policy-category-body"></div>`);
  const itemListUl = $(`<ul class="policy-item-list"></ul>`);
  for (const [key, val] of Object.entries(properties.data)) {

    for (const [subKey, subVal] of Object.entries(val)) {
      const itemList = $(`<div class="policy-item-div"></div>`);
      itemList.append(`<p class="text-dark font-weight-bold">${subKey}</p>`);

      for (const listItem of subVal) {
        const item = $(`<li class="policy-item"></li>`);
        let itemElement = null;
        if (listItem.link) {
          itemElement = $(
            `<a target="_blank" class="text-success text-wrap" href="${listItem.link}">${listItem.text}</a>`
          );
        } else {
          if (subKey.toLocaleLowerCase().includes("contact")) {
            itemElement = $(`<p class="text-secondary text-wrap">${listItem.text.replace("\n", ": ")}</p>`);
          } else {
            itemElement = $(`<p class="text-secondary text-wrap">${listItem.text}</p>`);
          }
        }

        if (listItem.text.includes("http:") || listItem.text.includes("https:")) {
          itemElement.addClass("text-break");
        }

        item.append(itemElement);
        itemList.append(item);
      }
      itemListUl.append(itemList);

      categoryBody.append(itemListUl);

    }

    category.append(categoryBody);

    $("#links").append(category);
  }
  scrollToBottom();
}

let statesData = null;
ajax_get(CONFIG["policyDataPath"], function (d) {
  statesData = d;
});

mapboxgl.accessToken = CONFIG["accessToken"];

let map = new mapboxgl.Map({
  container: "map",
  center: [0, 1],
  zoom: 5,
  dragPan: false,
  pitchWithRotate: false,
  dragRotate: false,
  touchZoomRotate: false,
  style: {
    version: 8,
    sources: {
      composite: {
        id: "states",
        url: "mapbox://mbxsolutions.albersusa-points,mbxsolutions.albersusa",
        type: "vector",
      },
    },
    glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    layers: [
      {
        id: "states",
        type: "fill",
        source: "composite",
        "source-layer": "albersusa",
        filter: [
          "all",
          ["match", ["get", "type"], ["state"], true, false],
          ["match", ["get", "state_abbrev"], ["PR"], false, true],
        ],
        paint: {
          "fill-color": CONFIG["defaultColor"],
        },
      },
      {
        id: "state-boundaries",
        type: "line",
        source: "composite",
        "source-layer": "albersusa",
        filter: [
          "all",
          ["match", ["get", "type"], ["state"], true, false],
          ["match", ["get", "state_abbrev"], ["PR"], false, true],
        ],
        paint: {
          "line-color": "black",
        },
      },
      {
        id: "state-points",
        type: "symbol",
        source: "composite",
        "source-layer": "albersusa-points",
        filter: [
          "all",
          ["match", ["get", "type"], ["state"], true, false],
          ["match", ["get", "state_abbrev"], ["PR"], false, true],
        ],
        layout: {
          "text-field": ["to-string", ["get", "state_abbrev"]],
          "text-font": ["Overpass Mono Bold", "Arial Unicode MS Regular"],
        },
        paint: { "text-halo-width": 1, "text-halo-color": "#ffffff" },
      },
    ],
  },
});

map.addControl(new mapboxgl.NavigationControl(), "bottom-left");
map.scrollZoom.disable();

map.on("load", () => {
  var $ = window["$"];
  $(".mapboxgl-canvas-container").css("width", "100vw");
  $(".mapboxgl-canvas-container").css("height", "93vh");
  map.resize();
  map.fitBounds(boundingBox);

  map.on("click", (e) => {
    const bbox = [
      [e.point.x - 5, e.point.y - 5],
      [e.point.x + 5, e.point.y + 5],
    ];
    const selectedFeatures = map.queryRenderedFeatures(bbox, {
      layers: ["states"],
    });
    const stateAbbr = selectedFeatures[0]?.properties.state_abbrev;
    onClickState(stateAbbr);
  });

  map.on("mouseenter", "states", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "states", () => {
    map.getCanvas().style.cursor = "";
  });
});

$(document).ready(function () {
  attachOnChangeEventToStateRecomOpts(
    CONFIG["stateRecoms"],
    CONFIG["defaultColor"],
    CONFIG["stateRecomHighlightColor"]
  );
  attachClickEventToStateBadges();
});

function scrollToBottom() {
  var dropdownHeight = document.getElementById("score-dropdown").scrollHeight;
  window.scrollTo({
    top: map.getContainer().scrollHeight + dropdownHeight,
    behavior: "smooth"
  });
}
