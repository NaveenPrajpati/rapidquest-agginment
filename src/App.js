import logo from "./logo.svg";
import "./App.css";
import SalesChart from "./Charts/SalesChart";
import CustomersChart from "./Charts/CustomerChart";
import RepeatChart from "./Charts/RepeatChart";
import GeodistributionChart from "./Charts/GeodistributionChart";

function App() {
  return (
    <div>
      <div className="app">
        <SalesChart />
        <CustomersChart />
      </div>
      <RepeatChart />
      <GeodistributionChart />
    </div>
  );
}

export default App;
