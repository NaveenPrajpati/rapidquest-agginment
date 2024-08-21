import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

const CustomersChart = () => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/analytics/new-customers?interval=monthly")
      .then((response) => {
        const labels = response?.data?.map((item) => item._id);
        const data = response?.data?.map((item) => item.newCustomers);

        console.log(labels);
        console.log(data);
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
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return <Line data={chartData} />;
};

export default CustomersChart;
