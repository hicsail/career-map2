import * as config from './config.js';

const CONFIG = config['config'];

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
    
    $("#scores input[name='score-radio']").change(function() { 
              
        if ($(this).is(':checked')) { 
            const states = stateRecoms[$(this).val()];
            resetSmallSateBadgesColor(defaultColor);
            map.setPaintProperty('states', 'fill-color', ['case', 
                                                         ["in", ['get', 'state_name'], ['literal', stateRecoms[$(this).val()]]], 
                                                         stateRecomHighlightColor, 
                                                         defaultColor]);

            $("#dropdownBtn").text('CCD Center State Recommendation: ' + $(this).val());            
            for (const state of states) {                
                highlightSmallStateBadge(state, defaultColor, stateRecomHighlightColor); 
            }            
        }                               
    });    
}


function getSelectedScore() {

    let selectedScore;   
    $("#scores input[name='score-radio']").each(function() {
        if ($(this).is(':checked')) {                       
            selectedScore = $(this).val();
            return false;    
        }                          
    }); 
    return selectedScore;    
}

function resetStateRecoms() {

    $("#dropdownBtn").text('CCD Center State Recommendation ');
    $("#scores input[name='score-radio']").each(function () {            
        $(this).prop('checked', false);
    });    
}

function attachClickEventToStateBadges() {

     $("#state-legends div").each(function() {
        $(this).on( "click", function() {
            const stateName = $(this).attr("name");            
            onClickState(stateName);            
        });           
    });
}

function resetSmallSateBadgesColor(defaultColor) {

    $("#state-legends div").each(function() {               
        if ($(this).attr("name") === stateName) {            
            $(this).css("background-color", hightlightColor);    
        }
        else {
            $(this).css("background-color", defaultColor);    
        }        
    });
}

function highlightSmallStateBadge(stateName, defaultColor, hightlightColor) {
    
    $("#state-legends").find("[name='" + stateName + "']").css("background-color", hightlightColor);  
}

function onClickState(stateName) {
    
    resetStateRecoms();
    resetSmallSateBadgesColor(CONFIG['defaultColor']);
    highlightSmallStateBadge(stateName, CONFIG['defaultColor'], CONFIG['onClickHightlightColor']);
    

    const features = statesData.features.filter((f) => f.properties.name === stateName);
    let properties = features[0].properties;
    const propToIds = CONFIG['propertiesToIds'];


    map.setPaintProperty('states', 'fill-color', 
                        ['case', ["==", ['get', 'state_name'], stateName], 
                        CONFIG['onClickHightlightColor'], 
                        CONFIG['defaultColor']]);

    $("#stateName").removeClass("d-none").empty().text("Links for " + stateName);        
    $("#links").empty()
    for (const id in propToIds) {

        $("#links").append("<ul id='" + id + "'></ul>");
            
        const key = propToIds[id]['key'];
        const links = properties[key];        

        $("#" + id).append("<p class='text-dark font-weight-bold'>" + key + "</p>");
        if (links.length === 0) {            
            $("#" + id).append("<p class='text-secondary'>No resource found</p>")
        } 
        if (propToIds[id]['isLink']) {            
            for (let i = 0; i < links.length; ++i) {                                                               
                $("#" + id).append("<li><a target='_blank' class='text-success' href='" + links[i] + "'>" + key + " " + (i+1) + "</a></li><br>");                                                
            }
        }
        else {                                      
            for (const elm of links) {
                $("#" + id).append("<li><p class='text-secondary'>" + elm + "</p></li>");
            }
                                     
        }
        $("#links").append("<hr class='mt-1 font-weight-bold'>");        
    }
}


let statesData = null;
ajax_get(CONFIG['dataPath'], function (d) {
     statesData = d;    
});

mapboxgl.accessToken = CONFIG['accessToken'];

let map = new mapboxgl.Map({
    container: 'map',
    center: [6.488225311417817, 1.02337180459902346],
    zoom: 4.6,//3.565749355901551,
    dragPan: false, 
    pitchWithRotate: false,
    dragRotate: false,
    touchZoomRotate: false,   
    style: {
        version: 8,
        sources: {
            composite: {
                id: 'states',
                url: 'mapbox://mbxsolutions.albersusa-points,mbxsolutions.albersusa',
                type: 'vector'
            }
        },
        glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
        layers: [{
            id: 'states',
            type: 'fill',
            source: 'composite',
            'source-layer': 'albersusa',
            filter: [
                'all',
                ['match', ['get', 'type'], ['state'], true, false],
                ['match', ['get', 'state_abbrev'], ['PR'], false, true]
            ],
            paint: {
                'fill-color': CONFIG['defaultColor'],
            }
        },{
            id: 'state-boundaries',
            type: 'line',
            source: 'composite',
            'source-layer': 'albersusa',
            filter: [
                'all',
                ['match', ['get', 'type'], ['state'], true, false],
                ['match', ['get', 'state_abbrev'], ['PR'], false, true]
            ],
            paint: {
                'line-color': "black",
            }
        }, {
            id: 'state-points',
            type: 'symbol',
            source: 'composite',
            'source-layer': 'albersusa-points',
            filter: [
                'all',
                ['match', ['get', 'type'], ['state'], true, false],
                ['match', ['get', 'state_abbrev'], ['PR'], false, true]
            ],
            layout: {
                "text-field": ["to-string", ["get", "state_abbrev"]],
                "text-font": ["Overpass Mono Bold", "Arial Unicode MS Regular"]
            },
            paint: {"text-halo-width": 1, "text-halo-color": "#ffffff"}
        }]
    }
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
map.scrollZoom.disable();
 
map.on('load', () => {
    var $ = window["$"];
    $('.mapboxgl-canvas-container').css('width', '100vh');
    $('.mapboxgl-canvas-container').css('height', '100vh');
    map.resize();

    map.on('click', (e) => {
        const bbox = [
            [e.point.x - 5, e.point.y - 5],
            [e.point.x + 5, e.point.y + 5]
        ];
        const selectedFeatures = map.queryRenderedFeatures(bbox, {
            layers: ['states']
        });
        const stateName = selectedFeatures[0].properties.state_name;
        onClickState(stateName);
    });
 

    map.on('mouseenter', 'states', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
 

    map.on('mouseleave', 'states', () => {
        map.getCanvas().style.cursor = '';
    });
});


$(document).ready(function(){       
    attachOnChangeEventToStateRecomOpts(CONFIG['stateRecoms'], CONFIG['defaultColor'], CONFIG['stateRecomHighlightColor']); 
    attachClickEventToStateBadges();  
});