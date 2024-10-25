"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import GaugeChart from "react-gauge-chart";
import { debounce } from "lodash";
import Image from "next/image";
import "../assets/css/dashboard.css";

import awr1642Image from "../assets/images/radar.jpg";
import usrpB210Image from "../assets/images/usrp.jpg";

const SOCKET_SERVER_URL = "https://gauge-charts.onrender.com";

interface DeviceData {
  voltage: number;
  current: number;
  power: number;
  accumulatedPower: number;
}

const Dashboard: React.FC = () => {
  const [maxRadarVoltage, setMaxRadarVoltage] = useState(15);
  const [maxRadarCurrent, setMaxRadarCurrent] = useState(1000);
  const [maxRadarPower, setMaxRadarPower] = useState(10000);
  const [maxUsrpVoltage, setMaxUsrpVoltage] = useState(15);
  const [maxUsrpCurrent, setMaxUsrpCurrent] = useState(1000);
  const [maxUsrpPower, setMaxUsrpPower] = useState(10000);
  const [maxRadarAccPower, setMaxRadarAccPower] = useState(100);
  const [maxUsrpAccPower, setMaxUsrpAccPower] = useState(100);
  const [maxTotalAccPower, setMaxTotalAccPower] = useState(100);

  const [radarData, setRadarData] = useState<DeviceData>({
    voltage: 0,
    current: 0,
    power: 0,
    accumulatedPower: 0,
  });

  const [usrpData, setUsrpData] = useState<DeviceData>({
    voltage: 0,
    current: 0,
    power: 0,
    accumulatedPower: 0,
  });

  const [radarAccPower, setRadarAccPower] = useState<number>(0);
  const [usrpAccPower, setUsrpAccPower] = useState<number>(0);
  const [totalPower, setTotalPower] = useState<number>(0);

  useEffect(() => {
    // Use environment variable for the server URL, falling back to localhost for local development
    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"], // Allow both transports
      secure: true, // Ensure secure connection
    });

    // Add the connect_error event listener to catch connection errors
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
    });

    const handleNewData = debounce((data) => {
      setRadarData(data.radarData);
      setUsrpData(data.usrpData);
      setRadarAccPower((prevData) => prevData + data.radarData.power);
      setUsrpAccPower((prevData) => prevData + data.usrpData.power);
      setTotalPower((prevData) => prevData + data.totalPower);

      setMaxRadarVoltage((prevData) =>
        data.radarData.voltage > prevData ? data.radarData.voltage : prevData
      );
      setMaxRadarCurrent((prevData) =>
        data.radarData.current > prevData ? data.radarData.current : prevData
      );
      setMaxRadarPower((prevData) =>
        data.radarData.power > prevData ? data.radarData.power : prevData
      );
      setMaxUsrpVoltage((prevData) =>
        data.usrpData.voltage > prevData ? data.usrpData.voltage : prevData
      );
      setMaxUsrpCurrent((prevData) =>
        data.usrpData.current > prevData ? data.usrpData.current : prevData
      );
      setMaxUsrpPower((prevData) =>
        data.usrpData.power > prevData ? data.usrpData.power : prevData
      );
      setMaxRadarAccPower((prevData) =>
        radarAccPower > prevData ? radarAccPower : prevData
      );
      setMaxUsrpAccPower((prevData) =>
        usrpAccPower > prevData ? usrpAccPower : prevData
      );
      setMaxTotalAccPower((prevData) =>
        totalPower > prevData ? totalPower : prevData
      );
    }, 1000);

    // socket.on("newData", handleNewData);

    socket.on("newData", (receivedData) => {
      console.log("Received data:", receivedData);
      handleNewData(receivedData); // Update state with the received data
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Base Station Dashboard</h1>
      <div className="device-section">
        <div>
          <p>AWR1642BOOST-ODS</p>
          <Image
            src={awr1642Image.src}
            alt="AWR1642BOOST-ODS"
            className="device-image"
            width={300}
            height={200}
            priority
          />
        </div>
        <div>
          <p>USRP B210</p>
          <Image
            src={usrpB210Image.src}
            alt="USRP B210"
            className="device-image"
            width={300}
            height={200}
            priority
          />
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2>
            <i className="fas fa-bolt"></i> Radar Voltage
          </h2>
          <GaugeChart
            id="radarData-voltage"
            nrOfLevels={50}
            arcsLength={[0.2, 0.3, 0.5]} // Split into segments as needed
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green, Yellow, Red
            percent={radarData.voltage / maxRadarVoltage} // Still using a percentage for fill
            formatTextValue={() => `${radarData.voltage.toFixed(2)} V`} // Show real value as text
            textColor="#000000"
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-wave-square"></i> Radar Current
          </h2>
          <GaugeChart
            id="radarData-current"
            nrOfLevels={50}
            arcsLength={[0.2, 0.4, 0.4]} // Adjust arcs to represent safe, moderate, and high current ranges
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for mid, Red for high
            percent={radarData.current / maxRadarCurrent} // Use the calculated percentage value for the gauge
            formatTextValue={() => `${radarData.current.toFixed(2)} mA`} // Display the actual current value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-plug"></i> Radar Power Consumption
          </h2>
          <GaugeChart
            id="radarData-power"
            nrOfLevels={50}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={radarData.power / maxRadarPower} // Use the calculated percentage value for the gauge
            formatTextValue={() => `${radarData.power.toFixed(2)} mW`} // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-bolt"></i> USRP Voltage
          </h2>
          <GaugeChart
            id="usrpData-voltage"
            nrOfLevels={50}
            arcsLength={[0.2, 0.3, 0.5]} // Split into segments as needed
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green, Yellow, Red
            percent={usrpData.voltage / maxUsrpVoltage} // Still using a percentage for fill
            formatTextValue={() => `${usrpData.voltage.toFixed(2)} V`} // Show real value as text
            textColor="#000000"
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-wave-square"></i> USRP Current
          </h2>
          <GaugeChart
            id="usrpData-current"
            nrOfLevels={50}
            arcsLength={[0.2, 0.4, 0.4]} // Adjust arcs to represent safe, moderate, and high current ranges
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for mid, Red for high
            percent={usrpData.current / maxUsrpCurrent} // Use the calculated percentage value for the gauge
            formatTextValue={() => `${usrpData.current.toFixed(2)} mA`} // Display the actual current value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-plug"></i> USRP Power Consumption
          </h2>
          <GaugeChart
            id="usrpData-power"
            nrOfLevels={50}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={usrpData.power / maxUsrpPower} // Use the calculated percentage value for the gauge
            formatTextValue={() => `${usrpData.power.toFixed(2)} mW`} // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-battery-full"></i> Radar Accumulated Power
          </h2>
          <GaugeChart
            id="radarData-accumulated"
            nrOfLevels={50}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={radarAccPower / 1000 / maxRadarAccPower} // Use the calculated percentage value for the gauge
            formatTextValue={() => `${(radarAccPower / 1000).toFixed(2)} W`} // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-battery-full"></i> USRP Accumulated Power
          </h2>
          <GaugeChart
            id="usrpData-accumulated"
            nrOfLevels={50}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={usrpAccPower / 1000 / maxUsrpAccPower} // Use the calculated percentage value for the gauge
            formatTextValue={() => `${(usrpAccPower / 1000).toFixed(2)} W`} // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-plug"></i> Total Accumulated Power Consumption
          </h2>
          <GaugeChart
            id="total-power"
            nrOfLevels={50}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={totalPower / 1000 / maxTotalAccPower} // Use the calculated percentage value for the gauge
            formatTextValue={() => `${(totalPower / 1000).toFixed(2)} W`} // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-plug"></i> Total Power Consumption
          </h2>
          <GaugeChart
            id="total-power"
            nrOfLevels={50}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={
              (radarData.power + usrpData.power) /
              (maxRadarPower + maxUsrpPower)
            } // Use the calculated percentage value for the gauge
            formatTextValue={() =>
              `${(radarData.power + usrpData.power).toFixed(2)} mW`
            } // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
