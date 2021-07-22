/****************************************
 ************ Map Layers*****************
 ****************************************/

// Adding tile layer
var street = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
});

var light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

var dark = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/dark-v10",
  accessToken: API_KEY
});

// Only one base layer can be shown at a time
var baseMaps = {
  Street: street,
  Light: light,
  Dark: dark
};

var layers = {
  PETTY_THEFT: new L.LayerGroup(),
  STOLEN_VEHICLE: new L.LayerGroup(),
  ROBBERY: new L.LayerGroup(),
  FELONY_ASSAULT: new L.LayerGroup(),
  FORCIBLE_RAPE: new L.LayerGroup()
};


// Create map object and set default layers
var myMap = L.map("map", {
  center: [37.8044, -122.2712],
  zoom: 12,
  layers: [
    street,
    layers.PETTY_THEFT,
    layers.STOLEN_VEHICLE,
    layers.ROBBERY,
    layers.FELONY_ASSAULT,
    layers.FORCIBLE_RAPE
  ]
});

// setting up the legend so that the scope is global;
var legend;

/****************************************
 ******Adding Neighborhoods Layer********
 ****************************************/

// // Pass our map layers into our layer control
// // Add the layer control to the map
// L.control.layers(baseMaps).addTo(myMap);

// // Use this link to get the geojson data.
// var link = "../static/data/neighborhoods_with_crime_data.geojson";

// // Function that will determine the color of a neighborhood based on the borough it belongs to
// function chooseColor(NAME) {
//   switch (NAME) {
//   case "Montclair":
//     return "skyblue";
//   default:
//     return "skyblue";
//   }
// }

// // Grabbing our GeoJSON data..
// d3.json(link).then(data => {
//   // Creating a geoJSON layer with the retrieved data
//   L.geoJson(data, {
//     // Style each feature (in this case a neighborhood)
//     style: function(feature) {
//       return {
//         color: "white",
//         // Call the chooseColor function to decide which color to color our neighborhood (color based on neighborhood)
//         fillColor: chooseColor(features.properties.NAME),
//         fillOpacity: 0.3,
//         weight: 1.5
//       };
//     },
//     // Called on each feature
//     onEachFeature: function(feature, layer) {
//       // Set mouse events to change map styling
//       layer.on({
//         // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
//         mouseover: function(event) {
//           layer = event.target;
//           layer.setStyle({
//             fillOpacity: 0.9
//           });
//         },
//         // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
//         mouseout: function(event) {
//           layer = event.target;
//           layer.setStyle({
//             fillOpacity: 0.5
//           });
//         },
//         // When a feature (neighborhood) is clicked, it is enlarged to fit the screen
//         click: function(event) {
//           myMap.fitBounds(event.target.getBounds());
//         }
//       });
//       // Giving each feature a pop-up with information pertinent to it
//       layer.bindPopup(`<h1>Neighborhood:&nbsp;${features.properties.NAME}</h1><hr/><h2 style='text-align: center;'>Neighborhood:&nbsp;${features.properties.NAME}</h2>`);

//     }
//   }).addTo(myMap);
// });


  /****************************************
   *************User Filters***************
  ****************************************/

function filterCrime() {

  var filter_year = document.querySelector('input[name="year"]:checked').value;
  var filter_crime_category = document.querySelector('input[name="crimecategory"]:checked').value;
  
  //clear map -- this is lazy *smile*
  //d3.select('#map').html('');
  
  try{
    myMap.removeControl(legend);
  }
  catch{;
    console.log('An error has occurred while trying to remove the legend.')
  }

  populateBarChart(filter_year, filter_crime_category);
  populateDataTable(filter_year, filter_crime_category);
  loadMap(filter_year, filter_crime_category);
}


/****************************************
 **********Bar Chart Function************
 ****************************************/

function populateBarChart(filter_year, filter_crime_category){

  d3.json('/api/data/crime_summary').then(data => {    

    filteredData = data.filter(d => d['years'] == filter_year)
                        .filter(d => d['category'] == filter_crime_category);

    filteredData.sort((a, b) => b['count'] - a['count']);
    filteredData.reverse();
    
    console.log(filteredData);

    var crime_type = filteredData.map(d => d['crimetype']);
    var incident_count = filteredData.map(d => d['count']);

    var plotdata = [{
      type: 'bar',
      x: incident_count,
      y: crime_type,
      orientation: 'h'
    }];

    var layout = {
      autosize: true,
      yaxis: {
        automargin: true
      }
    }
    
    Plotly.newPlot('crime-bar', plotdata, layout);


  })

}

/****************************************
 ***************Data Table****************
 ****************************************/

function populateDataTable(filter_year, filter_crime_category) {
  
  var tbody = d3.select('#crime-tbody');
  tbody.html('');
  
  d3.json('api/data').then(data => {

  filteredData = data.filter(d => d['years'] == filter_year)
  .filter(d => d['category'] == filter_crime_category);

  filteredData.forEach(row => {

    tr = tbody.append('tr');

    tr.append('td').text(row['casenumber'])
    tr.append('td').text(row['description'])
    tr.append('td').text(row['address'])
    // consider using object.entries
        
  });



  });

}



/****************************************
 **************Choropleth****************
 ****************************************/

function loadMap(filter_year, filter_crime_category) {
  // Load in geojson data
  var geoData = "../static/data/neighborhoods_with_crime_data.geojson";

  var geojson;

  // Grab data with d3
  d3.json(geoData).then(function(data) {

    // Preview geoJSON
    console.log(data);

    // Create a new choropleth layer
    geojson = L.choropleth(data, {

      // Define what  property in the features to use
      neighborhood: "NAME",

      valueProperty: `${filter_year} ${filter_crime_category}`,

      // Set color scale
      scale: ["#ffffb2", "#b10026"],

      // Number of breaks in step range
      steps: 10,

      // q for quartile, e for equidistant, k for k-means
      mode: "q",
      style: {
        // Border color
        color: "#fff",
        weight: 1,
        fillOpacity: 0.7
      },

      // Binding a pop-up to each layer
      onEachFeature: function(feature, layer) {

        // Set mouse events to change map styling
        layer.on({
          // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
          mouseover: function(event) {
            layer = event.target;
            layer.setStyle({
              fillOpacity: 0.9
            });
          },
          // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 60%
          mouseout: function(event) {
            layer = event.target;
            layer.setStyle({
              fillOpacity: 0.7
            });
          },
          // // When a feature (neighborhood) is clicked, it is enlarged to fit the screen
          // click: function(event) {
          //   myMap.fitBounds(event.target.getBounds());
          // }
        });

        
        year = filter_year;
        crime_other = feature['properties'][`${year} Other`]
        crime_property = feature['properties'][`${year} Property`]
        crime_violent = feature['properties'][`${year} Violent`]

        layer.bindPopup(`<b>${feature.properties.NAME} <hr/>` +
                        `${year} Violent Crimes: ${crime_violent}` + 
                        `<br>${year} Property Crimes: ${crime_property}` +
                        `<br>${year} Other Crimes: ${crime_other}` 
                      );
            }
    }).addTo(myMap);

    // Set up the legend
    legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var limits = geojson.options.limits;
      var colors = geojson.options.colors;
      var labels = [];

      // Add min & max
      var legendInfo = "<h6>Crime Instances</h6>" +
        "<div class=\"labels\">" +
          "<div class=\"min\">" + limits[0] + "</div>" +
          "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
        "</div>";

      div.innerHTML = legendInfo;

      limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      });

      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);

  });
}


// Run filterCrime function by default, which calls loadMap()
filterCrime();