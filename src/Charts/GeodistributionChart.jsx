import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
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
  Legend,
  BarElement
);

const GeodistributionChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    axios
      .get(`${BASE_URL}/geographical-distribution`)
      .then((response) => {
        const salesData = response.data;
        if (salesData && salesData.length > 0) {
          const labels = salesData.map((item) => item._id);
          const data = salesData.map((item) => item.count);
          setChartData({
            labels,
            datasets: [
              {
                label: "Geographical Distribution of Customers:",
                data,
                backgroundColor: "rgba(75,122,192,0.2)",
                borderColor: "rgba(75,122,192,1)",
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
  }, []);

  return (
    <div
      style={{
        // height: "600px",
        backgroundColor: "wheat",
        // width: "80%",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <Bar
        data={chartData}
        style={{ minHeight: "300px" }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Customer Distribution by City",
            },
          },
        }}
      />
    </div>
  );
};

export default GeodistributionChart;
