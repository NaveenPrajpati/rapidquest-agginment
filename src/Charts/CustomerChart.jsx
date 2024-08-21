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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CustomersChart = () => {
  const [chartData, setChartData] = useState(null);
  const [interval, setInterval] = useState("monthly");

  useEffect(() => {
    axios
      .get(
        `http://localhost:4000/api/analytics/new-customers?interval=${interval}`
      )
      .then((response) => {
        const salesData = response.data;
        if (salesData && salesData.length > 0) {
          const labels = response?.data?.map((item) => item._id);
          const data = response?.data?.map((item) => item.newCustomers);

          setChartData({
            labels,
            datasets: [
              {
                label: "New Customers",
                data,
                backgroundColor: "rgba(153,102,255,0.2)",
                borderColor: "rgba(153,102,255,1)",
                borderWidth: 1,
              },
            ],
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [interval]);

  const handleIntervalChange = (event) => {
    setInterval(event.target.value);
  };

  return (
    <div style={{ width: "500px" }}>
      <select value={interval} onChange={handleIntervalChange}>
        <option value="daily">Daily</option>
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="yearly">Yearly</option>
      </select>
      {chartData ? <Line data={chartData} /> : <p>Loading...</p>}
    </div>
  );
};

export default CustomersChart;
