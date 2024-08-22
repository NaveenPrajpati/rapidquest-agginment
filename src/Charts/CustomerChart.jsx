import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

// Import Chart.js components for better readability
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
  // Use descriptive variable names for clarity
  const [customerData, setCustomerData] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState("monthly");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/analytics/new-customers?interval=${selectedInterval}`
        );
        const responseData = response.data;

        // Check for valid data before processing
        if (responseData && responseData.length > 0) {
          const labels = responseData.map((item) => item._id);
          const newCustomers = responseData.map((item) => item.newCustomers);

          setCustomerData({
            labels,
            datasets: [
              {
                label: "New Customers",
                data: newCustomers,
                backgroundColor: "rgba(153,102,255,0.2)",
                borderColor: "rgba(153,102,255,1)",
                borderWidth: 1,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedInterval]);

  const handleIntervalChange = (event) => {
    setSelectedInterval(event.target.value);
  };

  return (
    <div
      style={{
        width: "48%",
        backgroundColor: "#a5fbd5",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <div className="custom-select">
        {" "}
        {/* Use className for consistency */}
        <select value={selectedInterval} onChange={handleIntervalChange}>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      {customerData ? (
        <Line data={customerData} style={{ minHeight: "300px" }} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CustomersChart;
