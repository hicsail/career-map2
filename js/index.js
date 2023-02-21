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
            map.setPaintProperty('states-layer', 'fill-color', [
                                                                'case', 
                                                                ["in", ['get', 'name'], ['literal', stateRecoms[$(this).val()]]], 
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
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-95.5, 55.907],
    zoom: 3,
    //minZoom: 4.1,    
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
 
map.on('load', () => {
    var $ = window["$"];
    $('.mapboxgl-canvas-container').css('width', '100vh');
    $('.mapboxgl-canvas-container').css('height', '100vh');
    map.resize();
    map.addSource('states', {
        'type': 'geojson',
        'data': statesData
    });

    // Add a white background layer.
    map.addLayer({
        'id': 'bg',
        'type': 'background',        
        'paint': { 
            'background-color': 'white',
            'background-opacity': 0.6 
        }
    });    
 
    // Add a layer showing the state polygons.
    map.addLayer({
        'id': 'states-layer',
        'type': 'fill',
        'source': 'states',
        'paint': {
            'fill-color': '#C0C0C0',        
            'fill-outline-color': 'black'
        }
    });

    // Add a layer for showing the state names.
    map.addLayer({
        "id": "clusters-label",
        "type": "symbol",
        "source": "states",        
        "layout": {
            "text-field": "{name}",
            "text-font": [
            "DIN Offc Pro Medium",
            "Arial Unicode MS Bold"
            ],
            "text-size": 13
        }
    });
 

    map.on('click', 'states-layer', (e) => { 

        resetStateRecoms();           

        let properties = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates;
        const propToIds = CONFIG['propertiesToIds']; 
        const stateName = properties['name'];

        map.setPaintProperty('states-layer', 'fill-color', ['case', ["==", ['get', 'name'], stateName], '#5bc0de', '#C0C0C0']);    

        $("#stateName").removeClass("d-none").empty().text("Links for " + stateName);        
        $("#links").empty()
        for (const id in propToIds) {

            $("#links").append("<ul id='" + id + "'></ul>");
            
            const key = propToIds[id]['key'];
            const links = JSON.parse(properties[key]);        

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
 

    map.on('mouseenter', 'states-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
 

    map.on('mouseleave', 'states-layer', () => {
        map.getCanvas().style.cursor = '';
    });
});


$(document).ready(function(){     
    onScoresRadioChange(CONFIG['stateRecoms']);   
});