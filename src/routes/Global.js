import axios from "axios";
export default {
  verified: false,
  property: "",
  tenant: "",
};
const url = "https://rentapp-backend-3pnf.onrender.com/"; // Replace with your Render URL
const interval = 1000; // Interval in milliseconds (30 seconds)

function reloadWebsite() {
  fetch(url)
    .then((response) => {
      console.log(
        `Reloaded at ${new Date().toISOString()}: Status Code ${
          response.status
        }`
      );
    })
    .catch((error) => {
      console.error(
        `Error reloading at ${new Date().toISOString()}:`,
        error.message
      );
    });
}

setInterval(reloadWebsite, interval);
