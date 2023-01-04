import * as config from './config.js'

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

function onScoresRadioChange(stateRecoms) { 
   
    $("#scores input[name='score-radio']").change(function() {        
        if ($(this).is(':checked')) {            
            map.setPaintProperty('states', 'fill-color', [
                                                                'case', 
                                                                ["in", ['get', 'state_name'], ['literal', stateRecoms[$(this).val()]]], 
                                                                '#f0ad4e', 
                                                                '#C0C0C0']);
            $("#dropdownBtn").text('CCD Center State Recommendation: ' + $(this).val());            
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

const CONFIG = config['config'];
let statesData = null;

ajax_get(CONFIG['dataPath'], function (d) {
     statesData = d;    
});

mapboxgl.accessToken = CONFIG['accessToken'];

let map = new mapboxgl.Map({
    container: 'map',
    center: [6.488225311417807, -0.8537180459902345],
    zoom: 3.565749355901551,
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
                'fill-color': '#C0C0C0',
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
 
map.on('load', () => {
    var $ = window["$"];
    $('.mapboxgl-canvas-container').css('width', '100vh');
    $('.mapboxgl-canvas-container').css('height', '100vh');
    map.resize();

    map.on('click', (e) => {
        resetStateRecoms();

        const bbox = [
            [e.point.x - 5, e.point.y - 5],
            [e.point.x + 5, e.point.y + 5]
        ];
        const selectedFeatures = map.queryRenderedFeatures(bbox, {
            layers: ['states']
        });
        const stateName = selectedFeatures[0].properties.state_name;
        const features = statesData.features.filter((f) => f.properties.name === stateName);

        let properties = features[0].properties;
        const propToIds = CONFIG['propertiesToIds'];

        map.setPaintProperty('states', 'fill-color', ['case', ["==", ['get', 'state_name'], stateName], '#5bc0de', '#C0C0C0']);
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

    });
 

    map.on('mouseenter', 'states', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
 

    map.on('mouseleave', 'states', () => {
        map.getCanvas().style.cursor = '';
    });
});


$(document).ready(function(){     
    onScoresRadioChange(CONFIG['stateRecoms']);   
});