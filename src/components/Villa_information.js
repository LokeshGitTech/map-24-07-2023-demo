import React, { useEffect, useState } from "react";
import "./VillaInformation.css";

const VillaInformation = ({ villaInfo, villaMarkerClick }) => {
  const [villasInCounty, setVillasInCounty] = useState([]);
  

  useEffect(() => {
    if (villaMarkerClick) {
      setVillasInCounty(villaMarkerClick);
    }
  }, [villaMarkerClick]);

 
  return (
    <div className="title" id="element">
      <hr />
      <div className="villa-details-container">
        <div>
          <img
            className="image"
            src="https://media.istockphoto.com/id/539018660/photo/taj-mahal-hotel-and-gateway-of-india.jpg?s=612x612&w=0&k=20&c=L1LJVrYMS8kj2rJKlQMcUR88vYoAZeWbYIGkcTo6QV0="
          ></img>
        </div>

        <div className="image" id="villa-details">
          <div>
            <b> Villa:-</b> {villasInCounty.villa} <br />
            <b> Conty:-</b> {villaInfo.country} <br />
            <br />
            <div>
              <b>Top Destination</b>
              <div className="Top-Destination">
                {villaInfo.allVillasInCounty?.map((villaData, index) => (
                  <button key={index} className={`btn ${villasInCounty.villa === villaData[0] ? "green-button" : ""}`}>
                    {villaData[0].substring(0, 5).trim()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillaInformation;
