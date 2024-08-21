import logo from "./logo.svg";
import "./App.css";
import SalesChart from "./Charts/SalesChart";
import CustomersChart from "./Charts/CustomerChart";

function App() {
  return (
    <div className="App">
      <SalesChart />
      {/* <CustomersChart /> */}
    </div>
  );
}

export default App;
