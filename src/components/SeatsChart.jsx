import { useEffect, useState } from "react";
import { fetchHoldToken, bookSeats } from "../services/SeatsService";
import SelectedSeats from "./SelectedSeats";
import "../style/style.css";

const SEATS_CONFIG = {
  Publicworkspacekey: "57069033-6fc3-4e57-8ebc-c4f54d3d742e",
  Secretworkspacekey: "8cd678c5-d6d5-43f1-b377-255951f6405f",
  eventkey: "e979330a-5c0c-429e-8689-cf54ec6aceff",
};

const SeatsChart = () => {
  const [holdToken, setHoldToken] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [chartInitialized, setChartInitialized] = useState(false);

  useEffect(() => {
    const initializeChart = async () => {
      try {
        const token = await fetchHoldToken(SEATS_CONFIG.Secretworkspacekey);
        setHoldToken(token);
        loadSeatsIoScript();
      } catch (error) {
        console.error("Error fetching hold token:", error);
      }
    };

    if (!holdToken) {
      initializeChart();
    }
  }, [holdToken]);

  const loadSeatsIoScript = () => {
    return new Promise((resolve, reject) => {
      if (window.seatsio) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn-eu.seatsio.net/chart.js";
      script.async = false;
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error("Failed to load Seats.io script"));
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (!holdToken || chartInitialized) return;

    if (window.seatsio) {
      const chart = new window.seatsio.SeatingChart({
        publicKey: SEATS_CONFIG.Publicworkspacekey,
        event: SEATS_CONFIG.eventkey,
        holdToken: holdToken,
        divId: "chart-container",
        session: "manual",
        onObjectSelected: (object) => {
          if (object.status === "reservedByToken" || object.status === "free") {
            setSelectedSeats((prev) => [
              ...prev,
              { id: object.id, label: object.label || "N/A" },
            ]);
          }
        },
        onObjectDeselected: (object) => {
          setSelectedSeats((prev) =>
            prev.filter((seat) => seat.id !== object.id)
          );
        },
      });
      chart.render();
      setChartInitialized(true);
    }
  }, [holdToken, chartInitialized]);

  const handleBookSeats = async () => {
    if (selectedSeats.length === 0) {
      alert("No seats selected for booking.");
      return;
    }

    try {
      await bookSeats(
        SEATS_CONFIG.Secretworkspacekey,
        SEATS_CONFIG.eventkey,
        selectedSeats
      );
      alert("Seats successfully booked!");
      setSelectedSeats([]);
    } catch (error) {
      console.error("Error booking seats:", error);
      alert("An error occurred while booking the seats.");
    }
  };

  return (
    <div className="seats-chart-wrapper">
      <div id="chart-container"></div>
      <SelectedSeats
        selectedSeats={selectedSeats}
        onBookSeats={handleBookSeats}
      />
    </div>
  );
};

export default SeatsChart;
