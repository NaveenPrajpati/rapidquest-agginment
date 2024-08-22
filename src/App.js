import logo from "./logo.svg";
import "./App.css";
import SalesChart from "./Charts/SalesChart";
import CustomersChart from "./Charts/CustomerChart";
import RepeatChart from "./Charts/RepeatChart";
import GeodistributionChart from "./Charts/GeodistributionChart";
import GrowthChart from "./Charts/GrowthChart";

function App() {
  return (
    <div className="container">
      <div className="app">
        <SalesChart />
        <CustomersChart />
      </div>
      <GeodistributionChart />
      <div className="app">
        <RepeatChart />
        <GrowthChart />
      </div>
    </div>
  );
}

export default App;
