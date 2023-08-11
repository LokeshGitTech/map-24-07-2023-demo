import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";
import { ACCESS_TOKEN, defaultContinent } from "../Constants/mapboxConstants";
import fetchDestinationsData from "../Utils/destinationDataHelper";
import { Dropdown, DropdownButton, Form } from "react-bootstrap";

mapboxgl.accessToken = ACCESS_TOKEN;

const Map = () => {
  const [destinationsData, setDestinationsData] = useState([]);
  const [singleCountryMarker, setSingleCountryMarker] = useState([]);
  const [dropdownItem, setDropdownItem] = useState([]);
  const [clickedCountryId, setClickedCountryId] = useState("");
  const [isVillaInfo, setIsVillaInfo] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [villasInfo, setVillasInfo] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [clickedDestination, setClickedDestination] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [currentPopup, setCurrentPopup] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [areaText, setAreaText] = useState("");
  const [villaInModal, setVillaInModal] = useState("");
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  let hoveredId;
  let continentMarkers = [];
  let countryMarkers = [];
  let clickedMarker = null;
  let villas = [];
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems =
    villasInfo && villasInfo?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(villasInfo.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    const fetchDataFromApi = async () => {
      try {
        const apiData = await fetchDestinationsData();
        setDestinationsData(apiData);
        setDropdownItem(Object.entries(apiData));
      } catch (error) {
        console.log(error);
        setDestinationsData([]); // Set destinationsData to an empty array in case of an error
      }
    };
    fetchDataFromApi();
  }, []);

  useEffect(() => {
    const displayMap = () => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/eternitech/clk3s1a0h00gi01qyh76j1iks",
        center: [0, 40], // Set initial center or any default location
        zoom: 0.9, // Set initial zoom level
        cursor: "pointer",
        projection: "mercator",
        scrollZoom: false,
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl());
      map.on("load", function () {
        map.addSource("continents", {
          type: "geojson",
          data: "/GeoJson/final.geojson",
          // data: continentsData,
        });
        map.addSource("countries", {
          type: "geojson",
          data: " /GeoJson/final-country.geojson",
        });
        continentFunction(); //Continent Functions
      });
    };
    if (destinationsData) {
      displayMap();
    }
  }, [destinationsData]);

  useEffect(() => {
    if (clickedCountryId) {
      setActiveCountry(clickedCountryId);
    }
  }, [clickedCountryId]);

  const continentFunction = () => {
    mapRef.current.addLayer({
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

    //Hover Functionality
    mapRef.current.on("mousemove", "continent-fills", (e) => {
      mapRef.current.getCanvas().style.cursor = "pointer";
      if (e.features.length > 0) {
        if (hoveredId) {
          mapRef.current.setFeatureState(
            { source: "continents", id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = e.features[0].id;
        mapRef.current.setFeatureState(
          { source: "continents", id: hoveredId },
          { hover: true }
        );
      }
    });

    //Remove Hover Functionality
    mapRef.current.on("mouseleave", "continent-fills", () => {
      if (hoveredId) {
        mapRef.current.setFeatureState(
          { source: "continents", id: hoveredId },
          { hover: false }
        );
      }
    });
    hoveredId = null;

    //Click to Zoom Functionality
    mapRef.current.on("click", "continent-fills", (e) => {
      if (e?.features[0]?.properties?.STATE_NAME) {
        setDisplayName(e?.features[0]?.properties?.STATE_NAME);
      }
      let zoomLevel = mapRef.current.getZoom();
      if (zoomLevel < 4) {
        mapRef.current.easeTo({
          center: e.lngLat,
          zoom: 2.5,
          duration: 1000,
        });
        setShowDropdown(true);
        if (continentMarkers?.length > 0) {
          continentMarkers.map((marker) => marker.remove());
          continentMarkers = []; // Clear the marker array
        }
        mapRef.current.removeLayer("continent-fills");
        continentMarkers?.forEach(function (marker) {
          marker.remove();
        });
        countryFunction();
      }
    });

    //Continent Markers
    defaultContinent?.features?.forEach(function (marker) {
      const el = document.createElement("div");
      el.style.cursor = "pointer";
      el.className = "custom-continent-marker";
      continentMarkers?.push(
        new mapboxgl.Marker({
          element: el,
          rotation: -45,
        })
          .setLngLat(marker.geometry.coordinates)
          .addTo(mapRef.current)
      );
    });
  };

  const countryFunction = () => {
    mapRef.current.addLayer({
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

    mapRef.current.on("mousemove", "country-fills", (e) => {
      mapRef.current.getCanvas().style.cursor = "pointer";
      if (e.features.length > 0) {
        if (hoveredId) {
          mapRef.current.setFeatureState(
            { source: "countries", id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = e.features[0].id;
        mapRef.current.setFeatureState(
          { source: "countries", id: hoveredId },
          { hover: true }
        );
      }
    });

    mapRef.current.on("mouseleave", "country-fills", () => {
      if (hoveredId) {
        mapRef.current.setFeatureState(
          { source: "countries", id: hoveredId },
          { hover: false }
        );
      }
    });

    Object.entries(destinationsData)?.map((i) => {
      const el = document.createElement("div");
      el.style.cursor = "pointer";
      el.className = "custom-country-marker";
      countryMarkers?.push(
        new mapboxgl.Marker({ element: el, rotation: -45 })
          .setLngLat([i[1].lng, i[1].lat])
          .addTo(mapRef.current)
      );
    });

    mapRef.current.on("click", "country-fills", (e) => {
      const features = e.features[0];
      setClickedCountryId(features.properties.ISO_A3);
      setDisplayName(features?.properties?.ADMIN);

      if (countryMarkers.length > 0) {
        countryMarkers.forEach((marker) => marker.remove());
        countryMarkers = []; // Clear the marker array
      }

      setSingleCountryMarker(
        Object.entries(destinationsData).filter(
          (i) => i[0] == features?.properties?.ADMIN
        )
      );

      let zoomLevel = mapRef.current.getZoom();
      if (zoomLevel < 4) {
        mapRef.current.easeTo({
          center: e.lngLat,
          zoom: 4.5,
          duration: 1000,
        });
      } else {
        mapRef.current.easeTo({
          // center: e.lngLat,
          zoom: 4.5,
          duration: 1000,
        });
      }
    });
  };

  const handleSelectCountry = (country) => {
    if (mapRef.current.getLayer("clicked-country")) {
      mapRef.current.removeLayer("clicked-country");
    }

    if (mapRef.current.getSource("clicked-country")) {
      mapRef.current.removeSource("clicked-country");
    }

    if (countryMarkers.length > 0) {
      countryMarkers.forEach((marker) => marker.remove());
      countryMarkers = []; // Clear the marker array
    }

    let final = Object.entries(destinationsData).filter((i) => i[0] == country);

    let coords = {
      lng: final[0][1].lng,
      lat: final[0][1].lat,
    };

    let zoomLevel = mapRef.current.getZoom();
    if (zoomLevel < 4) {
      mapRef.current.easeTo({
        center: coords,
        zoom: 4.5,
        duration: 1000,
      });
    } else {
      mapRef.current.easeTo({
        center: coords,
        zoom: 4.5,
        duration: 1000,
      });
    }

    mapRef.current.addLayer({
      id: "clicked-country",
      type: "fill",
      source: "countries",
      filter: ["==", "ADMIN", country], // Filter for the clicked country.
      paint: {
        "fill-color": "#69c246", // Color to highlight the clicked country
        "fill-opacity": 0.9,
        "fill-outline-color": "#013220",
      },
    });

    if (final) {
      if (countryMarkers.length > 0) {
        countryMarkers.map((marker) => marker.remove());
        countryMarkers = []; // Clear the marker array
      }

      Object.entries(final)?.map(() => {
        const el = document.createElement("div");
        el.style.cursor = "pointer";
        el.className = "custom-country-marker";

        if (final) {
          setIsVillaInfo(true);
          villas = Object.entries(final.length !== 0 && final[0][1]?.regions);
          villas?.map((villaItem) => {
            setVillasInfo(villas);
            const iconElement = document.createElement("div");
            iconElement.style.cursor = "pointer";
            iconElement.className = "custom-active-country-marker";

            let markerElement = document.createElement("div");
            markerElement.appendChild(iconElement); // Append the icon to the marker

            const popup = new mapboxgl.Popup({
              anchor: "top",
              offset: [0, 10],
              closeButton: false,
              closeOnClick: true,
            }).setText(`${villaItem[0]}`);

            let marker = new mapboxgl.Marker(iconElement)
              ?.setLngLat([villaItem[1]?.lng, villaItem[1]?.lat])
              .setPopup(popup)
              .addTo(mapRef.current);

            const popup1 = new mapboxgl.Marker({
              element: iconElement,
              rotation: -45,
            })
              ?.setLngLat([villaItem[1]?.lng, villaItem[1]?.lat])
              .addTo(mapRef.current);

            marker.getElement().addEventListener("mouseenter", () => {
              marker.togglePopup();
              if (clickedMarker !== marker) {
                iconElement.className = "custom-top-destination-marker";
              }
            });

            marker.getElement().addEventListener("mouseleave", () => {
              marker.togglePopup();
              if (clickedMarker !== marker) {
                iconElement.className = "custom-active-country-marker";
              }
            });

            marker.getElement().addEventListener("click", () => {
              if (clickedMarker) {
                const clickedIconElement = clickedMarker.getElement();
                clickedIconElement.className = "custom-active-country-marker";
              }
              iconElement.className = "custom-top-destination-clicked-marker";
              clickedMarker = marker;
              popup1.setPopup(popup);
              setClickedDestination(villaItem[0]);
            });
          });
        }
      });
    }
  };

  const setActiveCountry = () => {
    if (mapRef.current.getLayer("clicked-country")) {
      mapRef.current.removeLayer("clicked-country");
    }

    // Remove the previously added "clicked-country" source if it exists
    if (mapRef.current.getSource("clicked-country")) {
      mapRef.current.removeSource("clicked-country");
    }

    // Add the new "clicked-country" layer with the clickedCountryId
    mapRef.current.addLayer({
      id: "clicked-country",
      type: "fill",
      source: "countries",
      filter: ["==", "ISO_A3", clickedCountryId], // Filter for the clicked country.
      paint: {
        "fill-color": "#69c246", // Color to highlight the clicked country
        "fill-opacity": 0.9,
        "fill-outline-color": "#013220",
      },
    });

    if (singleCountryMarker) {
      if (countryMarkers.length > 0) {
        countryMarkers.map((marker) => marker.remove());
        countryMarkers = []; // Clear the marker array
      }

      Object.entries(singleCountryMarker)?.map(() => {
        const el = document.createElement("div");
        el.style.cursor = "pointer";
        el.className = "custom-country-marker";

        if (singleCountryMarker) {
          setIsVillaInfo(true);
          villas = Object.entries(
            singleCountryMarker.length !== 0 &&
              singleCountryMarker[0][1]?.regions
          );
          villas?.map((villaItem) => {
            setVillasInfo(villas);
            const iconElement = document.createElement("div");
            iconElement.style.cursor = "pointer";
            iconElement.className = "custom-active-country-marker";

            let markerElement = document.createElement("div");
            markerElement.appendChild(iconElement); // Append the icon to the marker

            const popup = new mapboxgl.Popup({
              anchor: "top",
              offset: [0, 10],
              closeButton: false,
              closeOnClick: true,
            }).setText(`${villaItem[0]}`);

            let marker = new mapboxgl.Marker(iconElement)
              ?.setLngLat([villaItem[1]?.lng, villaItem[1]?.lat])
              .setPopup(popup)
              .addTo(mapRef.current);

            const popup1 = new mapboxgl.Marker({
              element: iconElement,
              rotation: -45,
            })
              ?.setLngLat([villaItem[1]?.lng, villaItem[1]?.lat])
              .addTo(mapRef.current);

            marker.getElement().addEventListener("mouseenter", () => {
              marker.togglePopup();
              if (clickedMarker !== marker) {
                iconElement.className = "custom-top-destination-marker";
              }
            });

            marker.getElement().addEventListener("mouseleave", () => {
              marker.togglePopup();
              if (clickedMarker !== marker) {
                iconElement.className = "custom-active-country-marker";
              }
            });

            marker.getElement().addEventListener("click", () => {
              if (clickedMarker) {
                const clickedIconElement = clickedMarker.getElement();
                clickedIconElement.className = "custom-active-country-marker";
              }
              iconElement.className = "custom-top-destination-clicked-marker";
              clickedMarker = marker;
              popup1.setPopup(popup);
              setClickedDestination(villaItem[0]);
              setAreaText(` |  Area `);
              setVillaInModal(villaItem[0]);
            });
          });
        }
      });
    }
  };

  const handleDivClick = (villaName) => {
    setClickedDestination(villaName);
    RemoveAllPopups();
    // Find the corresponding marker based on the villaName
    setPopupForVilla(villaName);
  };

  const RemoveAllPopups = () => {
    console.log("mapRef.current", mapRef.current);
  };

  const setPopupForVilla = (villaName) => {
    if (currentPopup) {
      currentPopup.remove();
    }

    const villaMarker = Object.entries(
      singleCountryMarker.length !== 0 && singleCountryMarker[0][1]?.regions
    );

    const matchedVilla = villaMarker.find(([name]) => name === villaName);
    setAreaText(`Area | `);
    setVillaInModal(matchedVilla[0]);
    console.log("matchedVilla", matchedVilla);
    if (currentPopup) {
      currentPopup.remove();
    }

    if (matchedVilla) {
      const popup = new mapboxgl.Popup({
        anchor: "top",
        offset: [0, 10],
        closeButton: false,
        closeOnClick: true,
      })
        .setLngLat([matchedVilla[1]?.lng, matchedVilla[1]?.lat])
        .setText(`${matchedVilla[0]}`)
        .addTo(mapRef.current);
      setCurrentPopup(popup);
    }
  };

  return (
    <>
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginRight: "2%",
          }}
        >
          <div className="header">
            <b> Interactive Map</b>
          </div>
          <div>
            {showDropdown && (
              <>
                <div
                  className="overlay"
                  onClick={() => setShowDropdown(false)}
                ></div>
                <select
                  aria-label="Default select example"
                  size="lg"
                  onChange={(e) => handleSelectCountry(e.target.value)}
                  style={{
                    padding: "4%",
                    marginRight: "10%",
                    border: "1px solid #d9d9d9",
                    borderRadius: "5px",
                    boxShadow:
                      " 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    color: "#003366",
                  }}
                >
                  <option className="m-2 p-5">Destination by country</option>
                  {dropdownItem?.map((item) => {
                    return (
                      <option className="m-2 p-5" key={item[0]} value={item[0]}>
                        {item[0]}
                      </option>
                    );
                  })}
                </select>
              </>
            )}
          </div>
        </div>
        <hr />

        {isVillaInfo && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              overflowY: "hidden",
            }}
            className="villaInformationModel "
            hidden
          >
            <div style={{ width: "20%", padding: "1%" }}>
              <img
                src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
                style={{ objectFit: "cover", objectPosition: "center" }}
                width="100%"
                height="90%"
              />
            </div>

            <div
              style={{
                width: "80%",
                display: "flex",
                flexDirection: "column",
                padding: "1%",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ color: "gray", fontWeight: "bold" }}>
                  Country &nbsp;{" "}
                </div>
                <div style={{ color: "#133C73", fontWeight: "bold" }}>
                  {displayName} &nbsp;
                </div>
                <div style={{ color: "gray", fontWeight: "bold" }}>
                  {areaText} &nbsp;
                </div>
                {
                  <div style={{ color: "green", fontWeight: "bold" }}>
                    {villaInModal} &nbsp;{" "}
                  </div>
                }
              </div>
              <div>
                <div>
                  From the fragrant lavender fields of Provence and the
                  sun-kissed villas of the Côte d'Azur to storybook alpine
                  chalets, ornate Parisian retreats, and historic vineyard
                  châteaux, find your haven in France and live in a dream...
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    color: "#133C73",
                    fontWeight: "bold",
                    marginTop: "3%",
                  }}
                >
                  Top Destination
                </div>
                <div style={{ cursor: "pointer" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "8px",
                    }}
                  >
                    <div
                      style={{ color: "#133C73", fontWeight: "bold" }}
                      onClick={handlePrevPage}
                      disabled={currentPage === 3}
                    >
                      {`<`} &nbsp;
                    </div>

                    <div style={{ color: "#133C73" }}>
                      <b>{`${currentPage}`}&nbsp;</b>
                      {`of ${totalPages}`} &nbsp;
                    </div>
                    <div
                      style={{ color: "#133C73", fontWeight: "bold" }}
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      {`>`}
                    </div>
                  </div>
                </div>
              </div>
              <div className="destinations">
                {console.log("villaData", villas)}
                {currentItems?.map((villaData, index) => {
                  const isHighlighted = clickedDestination === villaData[0];

                  return (
                    <div
                      data-villa-id={villaData[0]}
                      onClick={() => handleDivClick(villaData[0])}
                      key={index}
                      className={` ${
                        isHighlighted ? "des-btn-active" : "des-btn"
                      }`}
                    >
                      {villaData[0]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div id="map-container" style={{ overflow: "auto" }}>
          <div className="map-container" ref={mapContainer}>
            <h1 id="continent-name" class="continent-text">
              {displayName && displayName}
            </h1>
          </div>
        </div>
      </div>
      <hr />
    </>
  );
};

export default Map;
