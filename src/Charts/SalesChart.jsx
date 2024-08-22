import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BASE_URL } from "../services/endpoints";

// Register the components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = () => {
  const [chartData, setChartData] = useState(null);
  const [interval, setInterval] = useState("monthly");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/total-sales?interval=${interval}`)
      .then((response) => {
        const salesData = response.data;

        if (salesData && salesData.length > 0) {
          const labels = salesData.map((item) => item._id);
          const data = salesData.map((item) => item.totalSales);

          setChartData({
            labels,
            datasets: [
              {
                label: "Total Sales",
                data,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 1,
              },
            ],
          });
        } else {
          console.error("Sales data is empty or undefined");
        }
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error);
      });
  }, [interval]);

  const handleIntervalChange = (event) => {
    setInterval(event.target.value); // Update the interval state
  };

  return (
    <div
      style={{
        width: "48%",
        backgroundColor: "#f4daf1",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <div className="custom-select">
        <select value={interval} onChange={handleIntervalChange}>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      {chartData ? (
        <Line data={chartData} style={{ minHeight: "300px" }} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default SalesChart;
