import React, { useEffect, useRef, useState } from "react";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import "./Map.css";
import VillaInformation from "./Villa_information";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZXRlcm5pdGVjaCIsImEiOiJjbGp3djU5N28xczRsM2JuZ3h0NG1iZWZoIn0.Ef8zkzCW9v9tFrowdiacrQ";

const apiToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X29iamVjdF9pZCI6Mzk5MTU4NzUsInVzZXJfaWQiOiI0MDY2NTAyMSIsInVzZXJfbmFtZSI6InN5c3RlbStsdW5hLTh5NXljIiwic2NvcGUiOlsiYnJpdm8uYXBpIl0sImlzc3VlZCI6IjE2NzUxMTI3NDYxMzYiLCJleHAiOjE2NzUxMTI4MDYsInNlcnZpY2VfdG9rZW4iOm51bGwsImF1dGhvcml0aWVzIjpbIlJPTEVfU1VQRVJfQURNSU4iLCJST0xFX0FETUlOIl0sImp0aSI6ImVmNzY1MDIyLTZhNzctNGZkMy04Njg1LTFhZTFhZmEzOTJhZSIsImNsaWVudF9pZCI6IjkzOTFlYjVkLWUwNmUtNDY4MS1iNTdhLWQwZTU3NDhhM2RlZSIsIndoaXRlX2xpc3RlZCI6ZmFsc2V9.N9MIeiLyrT3hBUtMJsTvwbYW5Z_o7ZSBuZmir2ytrb8DiE4MoXcmh8C6KriWhmnRqUnSMBRtuLcauVbqjFTorOcWMOd2RQGmisPgXBm1tHT30Hl0i57rQuLZHAVW201ot-TdQwW9oEZ3n2HTGu_A6tRhTizVmG6NRAd5KhOB2_c";

const continentDefault = {
  type: "FeatureCollection",
  features: [
    // {
    //   // Australia
    //   type: "Feature",
    //   properties: {},
    //   geometry: {
    //     coordinates: [130.08150699373945, -22.000825079689697],
    //     type: "Point",
    //   },
    // },
    {
      // South America
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [-65.03566465880945, 0.11347580615962916],
        type: "Point",
      },
    },
    {
      // Ashia
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [94.04635205722194, 55.40990487833411],
        type: "Point",
      },
    },
    {
      // North America
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [-104.7622254741253, 35.40990487833411],
        type: "Point",
      },
    },
    {
      // Europe
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [15.829081, 50.926211],
        type: "Point",
      },
    },
    {
      // Africa
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [15.301302, 15.645186],
        type: "Point",
      },
    },
  ],
};

const Map = () => {
  const [destinations, setdestinations] = useState(null);
  const [countriesMarker, setcountriesMarker] = useState(null);
  const mapContainer = useRef(null);
  const [villaInfo, setVillaInfo] = useState([]);
  const [showVillaInfo, setShowVillaInfo] = useState(false);
  const [villaMarkerClick, setVillaMarkerClick] = useState([]);

  let country = [];
  let continentMarkers = [];
  let villas = [];
  let hoveredId;
  let mapData = [];
  let isVilla = false;
  // Fetch destinations Api
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://api.triangle.luxury/local/destinations",
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      Object.values(response.data.destinations).forEach(({ regions }) =>
        Object.values(regions).map((key) =>
          Object.values(key.counties).map((key) => mapData.push(key))
        )
      );
      setdestinations(response.data.destinations);
      setcountriesMarker(Object.entries(response.data.destinations));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (destinations) {
      displayMap();
      
    }
  }, [destinations]);

  const displayMap = () => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/eternitech/clk3s1a0h00gi01qyh76j1iks",
      center: [0, 0], // Set initial center or any default location
      zoom: 0.8, // Set initial zoom level
      cursor: "pointer",
      projection: "mercator",
      scrollZoom: false,
    });

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());
    
    const createRestartButton = () => {
    const button = document.createElement('button');
    button.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-restart';
    button.title = 'Restart Map';
    button.onclick = () => {
      window.location.reload(); // Reload the page when the button is clicked
    };
  
    const container = document.createElement('div');
    container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
    container.appendChild(button);

    return container;
  }

  const restartButton = createRestartButton();
  map.addControl(restartButton, 'top-right');
 

    //    load a world geojson file for
    map.on("load", function () {
      map.addSource("continents", {
        type: "geojson",
        data: "/GeoJson/final.geojson",
        // data: continentsData,
      });
      map.addSource("countries", {
        type: "geojson",
        data: " /GeoJson/final-country.geojson",

        //https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson
      });
      continentFunction();
    });

    const continentFunction = () => {
      map.addLayer({
        id: "continent-fills",
        type: "fill",
        source: "continents",
        layout: {},
        paint: {
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.4, // Highlighted color
            0, // Default color
          ],
          "fill-color": "#54e81a",
          "fill-outline-color": "#0d9118", // Border color when hovered
        },
      });

      map.on("click", "continent-fills", (e) => {
        let zoomLevel = map.getZoom(); //get map's curret zoom level
        if (zoomLevel < 4) {
          map.easeTo({
            center: e.lngLat,
            zoom: 2.5,
            duration: 1000,
          });
          countryFunction(e.features[0].properties.STATE_NAME);
          map.removeLayer("continent-fills");
          continentMarkers.forEach(function (marker) {
            marker.remove();
          });
        }
      });

      map.on("mousemove", "continent-fills", (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (e.features.length > 0) {
          if (hoveredId) {
            map.setFeatureState(
              { source: "continents", id: hoveredId },
              { hover: false }
            );
          }
          hoveredId = e.features[0].id;
          map.setFeatureState(
            { source: "continents", id: hoveredId },
            { hover: true }
          );
        }
      });

      map.on("mouseleave", "continent-fills", () => {
        if (hoveredId) {
          map.setFeatureState(
            { source: "continents", id: hoveredId },
            { hover: false }
          );
        }
      });
      hoveredId = null;

      ////////////////    ADddddd continent level marker marker ////////////////////////////////////
      continentDefault.features.forEach(function (marker) {
        const element = document.createElement("div");
        element.className = "continent-marker";

        continentMarkers.push(
          new mapboxgl.Marker(element)
            .setLngLat(marker.geometry.coordinates)
            .addTo(map)
        );
      });
    };

    const countryFunction = (name) => {
      // Add a color leyer
      map.addLayer({
        id: "country-fills",
        type: "fill",
        source: "countries",
        layout: {},
        paint: {
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.4, // Highlighted color
            0, // Default color
          ],
          "fill-color": "#54e81a",
          "fill-outline-color": "#0d9118", // Border color when hovered
          
        },
      });

      

      map.on("click", "country-fills", (e) => {
        console.log("clicked country");

        // Unhide a villaInformationModel
        const villaInformationModel = document.getElementsByClassName(
          "villaInformationModel"
        )[0];
        villaInformationModel.removeAttribute("hidden");

        const features = e.features[0];
        const clickedCountryId = features.properties.ISO_A3;

        // Highlight the clicked country with a new colored layer
        map.addLayer({
          id: "clicked-country",
          type: "fill",
          source: "countries",
          filter: ["==", "ISO_A3", clickedCountryId], // first click on country.
          paint: {
            "fill-color": "#69c246", // Color to highlight the clicked country
            "fill-opacity": 0.9,
            "fill-outline-color": "#013220",
          },
        });

        // second county click
        map.on("click", "country-fills", (e) => {
          console.log("second county click");

          const features = e.features[0];
          console.log("features", features);
          const clickedCountryId = features.properties.ISO_A3;
          console.log("clickedCountryId", clickedCountryId);

          // Update the filter of the "clicked-country" layer to highlight the clicked country
          map.setFilter("clicked-country", ["==", "ISO_A3", clickedCountryId]);
        });

        let singleCountry = [];
        let countryName = e.features[0].properties.ADMIN;
        if (countryName && countriesMarker) {
          console.log("countriesMarker", countriesMarker);
          singleCountry = countriesMarker.filter(
            (i) => i[0] == e.features[0]?.properties?.ADMIN
          );
          if (singleCountry) {
            villas = Object.entries(singleCountry[0][1]?.regions);
          }
        }

        // villas marker add
        villas?.map((e) => {
          var iconElement = document.createElement("i");
          iconElement.className = " fa-solid fa-location-pin";
          iconElement.style.color = "#ffffff"; // Set the icon color

          // Create a marker with the Font Awesome icon
          var markerElement = document.createElement("div");
          markerElement.appendChild(iconElement); // Append the icon to the marker
          const popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
          }).setText(`${e[0]}`);

          const marker = new mapboxgl.Marker(iconElement)
            ?.setLngLat([e[1]?.lng, e[1]?.lat])
            .setPopup(popup)
            .addTo(map)

            marker.getElement().addEventListener("mouseenter", () => {
              // Change the color when hovering over the marker
              marker.togglePopup();
              iconElement.style.color = "#ff0000"; // Set the hover icon color
            });

             marker.getElement().addEventListener("mouseleave", () => {
              // Reset the color when the hover exits
              marker.togglePopup();
              iconElement.style.color = "#ffffff"; // Set the default icon color
            });

            marker.getElement()
            .addEventListener("click", () => {
              const villaMarkerClick = {
                country: countryName,
                villa: e[0],
                allVillasInCounty: villas,
              };
              setVillaMarkerClick(villaMarkerClick);
              setShowVillaInfo(true);
            });
        });

        

        // VillaInfo model open
        const villaInfo = {
          country: countryName,
          villa: e[0],
          allVillasInCounty: villas,
        };
        setVillaInfo(villaInfo);
        setShowVillaInfo(true);

        country?.forEach(function (marker) {
          marker.remove();
        });

        let zoomLevel = map.getZoom(); //get map's curret zoom level
        if (zoomLevel < 4) {
          map.easeTo({
            center: e.lngLat,
            zoom: 4.5,
            duration: 1000,
          });
        } else {
          map.easeTo({
            center: e.lngLat,
            zoom: 4.5,
            duration: 1000,
          });
        }
      });

      map.on("mousemove", "country-fills", (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (e.features.length > 0) {
          if (hoveredId) {
            map.setFeatureState(
              { source: "countries", id: hoveredId },
              { hover: false }
            );
          }
          hoveredId = e.features[0].id;
          map.setFeatureState(
            { source: "countries", id: hoveredId },
            { hover: true }
          );
        }
      });

      map.on("mouseleave", "country-fills", () => {
        if (hoveredId) {
          map.setFeatureState(
            { source: "countries", id: hoveredId },
            { hover: false }
          );
        }
      });

      countriesMarker?.map((i) => {
        var element = document.createElement("div");
        element.className = "villas-marker";
        new mapboxgl.Marker(element)
          .setLngLat([i[1].lng, i[1].lat])
          .addTo(map)
          .getElement()
          .addEventListener("click", () => {});
        country?.push(
          new mapboxgl.Marker(element)
            .setLngLat([i[1].lng, i[1].lat])
            .addTo(map)
        );
      });
    };
  };
  return (
    <div>
      <div className="villaInformationModel" hidden>
        {showVillaInfo && (
          <VillaInformation
            villaInfo={villaInfo}
            villaMarkerClick={villaMarkerClick}
          />
        )}
      </div>

      <div id="map-container">
        <div className="map-container" ref={mapContainer} ></div>
      </div>
    </div>
  );
};

export default Map;
