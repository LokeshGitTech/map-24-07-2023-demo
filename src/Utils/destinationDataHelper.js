import axios from "axios";
import { API_TOKEN, DESTINATIONS_API } from "../Constants/mapboxConstants";

const fetchDestinationsData = async (dispatch) => {
  try {
    const response = await axios.get(DESTINATIONS_API, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });
    return response.data.destinations;
  } catch (error) {
    console.log(error);
    return []; // Return an empty array in case of an error
  }
};

export default fetchDestinationsData;
