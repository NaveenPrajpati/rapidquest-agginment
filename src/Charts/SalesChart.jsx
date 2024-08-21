import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

const SalesChart = () => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/analytics/total-sales?interval=monthly")
      .then((response) => {
        console.log(response.data);
        const labels = response?.data?.map((item) => item._id);
        const data = response?.data?.map((item) => item.totalSales);

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
      });
  }, []);

  return <Line data={chartData} />;
};

export default SalesChart;
