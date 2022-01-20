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

function onScoresRadioChange() {
    $("#scores input[name='score-radio']").change(function() {
        if ($(this).is(':checked')) {           
            map.setPaintProperty('states-layer', 'fill-color', { 'property': $(this).val(), stops: [[0, 'red'], [1, 'red'], [2, 'green'], [3, 'green'],[4, 'blue'], [5, 'blue']] });
             
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

let statesData = null;

ajax_get('data/states-careers3.json', function (d) {
     statesData = d;    
});

onScoresRadioChange();
	
mapboxgl.accessToken = 'pk.eyJ1IjoiYXNhZGVnMDIiLCJhIjoiY2t4em41c3hvNHp6bTJucG40YTlweHFjMSJ9.KxWmd9kZ3Ng6hbXBP3adgA';



const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-86.5, 38.907],
    zoom: 4.1,
    minZoom: 4.1
    //scrollZoom      : false,
    //boxZoom         : false,
    //doubleClickZoom : false
});
 
map.on('load', () => {
    var $ = window["$"];
    $('.mapboxgl-canvas-container').css('width', '100vh');
    $('.mapboxgl-canvas-container').css('height', '100vh');
    map.resize();
    map.addSource('states', {
        'type': 'geojson',
        'data': statesData
    });
 
    // Add a layer showing the state polygons.
    map.addLayer({
        'id': 'states-layer',
        'type': 'fill',
        'source': 'states',
        'paint': {
        'fill-color': {
            property: 'Statewide ILP P&G',
            stops: [[0, 'red'], [1, 'red'], [2, 'green'], [3, 'green'],[4, 'blue'], [5, 'blue']]
        },
        //'fill-outline-color': 'rgba(200, 100, 240, 1)',
        'fill-outline-color': 'black'
        }
    });

    // Add a layer for showing the state names.
    map.addLayer({
        "id": "clusters-label",
        "type": "symbol",
        "source": "states",
        "layout": {
            "text-field": "{state_name}",
            "text-font": [
            "DIN Offc Pro Medium",
            "Arial Unicode MS Bold"
            ],
            "text-size": 12
        }
    });
 
// When a click event occurs on a feature in the states layer,
// open a popup at the location of the click, with description
// HTML from the click event's properties.
map.on('click', 'states-layer', (e) => {

    let properties = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates;
    const propToIds = config['config']['propertiesToIds']; 
    const stateName = properties['state_name'];
    
    //update the main accordion buttons titles, add the name of clicked state to them
    const buttonIds = ["ILPPolicyBtn", "ILPSupportsBtn", "ILPProgramBtn"]
    for (const id of buttonIds) {
        $("#" + id).html($("#ILPPolicyBtn").html().split("(")[0] + " (" + stateName + ")");    
    }
    
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML("<h5 class='text-info mt-2'>" + getSelectedScore() + " : " + properties[getSelectedScore()] + "</h5>")
        .addTo(map);     

    for (const id in propToIds) {
        let noData = true;
        $("#" + id).empty(); 
        const elems = propToIds[id];
        for (let j = 0; j < elems.length; ++j) { 
            const elem = elems[j];           
            const links = JSON.parse(properties[elem['key']]);
            if (elem['key'] !== 'ILP Contact Name + Email') {
                for (let i = 0; i < links.length; ++i) {
                    if (elem['isLink']) {                        
                        $("#" + id).append("<a class='text-success' href='" + links[i] + "'>" + elem['key'] + " " + (i+1) + "</a><br>");
                        noData = false;                              
                    }                   
                    else {                        
                        $("#" + id).append("<p class='text-dark'>" + elem['key'] + ":" + "</p>");                        
                        $("#" + id).append("<p class='text-secondary'>" + links[i] + "</p>");
                        noData = false;                                                                           
                    }
                }
            }
            else if (elem['key'] === 'ILP Contact Name + Email'){
                $("#" + id).append("<p class='text-dark'>" + elem['key'] + ":" + "</p>");
                for (const elm of links) {
                    $("#" + id).append("<p class='text-secondary'>" + elm + "</p>");
                }
                noData = false;                      
            }
            if (links.length > 0 && j !== elems.length-1) {
                let isTheLast = true;
                for (let k = j + 1; k < elems.length; ++k ) {
                    if (JSON.parse(properties[elems[k]['key']]).length > 0) {
                        isTheLast = false;
                        break;
                    }
                }  
                if(!isTheLast) {
                    $("#" + id).append("<hr class='mt-1 font-weight-bold'>");    
                }           
            }                
        }
        if (noData) {
            $("#" + id).append("<p>No data available</p>");   
        }  
    }
         
    /*for (const key in properties) {
        if (key in propToIds)
            //$("#" + propToIds[key]['HTMLId']).empty();
        if (key in propToIds) {            
            for (let i = 0; i < JSON.parse(properties[key]).length; ++i) {
                const elem = JSON.parse(properties[key])[i];
                if(propToIds[key].isLink) {
                    //$("#" + propToIds[key]['HTMLId']).append("<li><a href='" + elem + "'>" + "Link " + (i+1) + "</a></li>");
                    $("#" + propToIds[key]['HTMLId']).append("<a class='text-success' href='" + elem + "'>" + key + " " + (i+1) + "</a><br>");    
                }
            }
            if (JSON.parse(properties[key]).length > 0) {
                $("#" + propToIds[key]['HTMLId']).append("<hr class='mt-1'>");
            }
            
        }
    }*/

});
 
// Change the cursor to a pointer when
// the mouse is over the states layer.
map.on('mouseenter', 'states-layer', () => {
map.getCanvas().style.cursor = 'pointer';
});
 
// Change the cursor back to a pointer
// when it leaves the states layer.
map.on('mouseleave', 'states-layer', () => {
map.getCanvas().style.cursor = '';
});
});


$(document).ready(function(){
    $("#instructionsModal").modal('show');
});
