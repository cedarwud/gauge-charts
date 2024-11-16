"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import GaugeChart from "react-gauge-chart";
import { debounce } from "lodash";
import Image from "next/image";
import awr1642Image from "../assets/images/radar.jpg";
import usrpB210Image from "../assets/images/usrp.jpg";

import "../assets/css/dashboard.css";
import BsDrag from "./bs-drag";

// const SOCKET_SERVER_URL = "http://localhost:3000";
const SOCKET_SERVER_URL = "https://gauge-charts.onrender.com";

interface DeviceData {
  voltage: number;
  current: number;
  power: number;
  accumulatedPower: number;
}

const DemoDrag: React.FC = () => {
  const [usrpCurrentPercent, setUsrpCurrentPercent] = useState(0.05);
  const [usrpPowerPercent, setUsrpPowerPercent] = useState(0.05);
  const [radarAccPowerPercent, setRadarAccPowerPercent] = useState(0.05);
  const [usrpAccPowerPercent, setUsrpAccPowerPercent] = useState(0.05);
  const [totalAccPowerPercent, setTotalAccPowerPercent] = useState(0.05);

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

  const handleNewData = debounce((data) => {
    const { radarData, usrpData } = data;

    setRadarData((prevData) => {
      const radarAccPowerPercent =
        ((prevData.accumulatedPower + radarData.power) / 4000) * 0.01;
      const newRadarAccPowerPercent =
        radarAccPowerPercent > 1
          ? 0.95
          : radarAccPowerPercent < 0
          ? 0.05
          : radarAccPowerPercent;
      setRadarAccPowerPercent(newRadarAccPowerPercent);

      return {
        ...radarData,
        accumulatedPower: prevData.accumulatedPower + radarData.power,
      };
    });
    setUsrpData((prevData) => {
      const usrpAccPowerPercent =
        ((prevData.accumulatedPower + usrpData.power) / 1900) * 0.01;
      const newUsrpAccPowerPercent =
        usrpAccPowerPercent > 1
          ? 0.95
          : usrpAccPowerPercent < 0
          ? 0.05
          : usrpAccPowerPercent;
      setUsrpAccPowerPercent(newUsrpAccPowerPercent);

      return {
        ...usrpData,
        accumulatedPower: prevData.accumulatedPower + usrpData.power,
      };
    });

    const usrpCurrentPercent = (usrpData.current - 500) / 100;
    const newUsrpCurrentPercent =
      usrpCurrentPercent > 1
        ? 0.95
        : usrpCurrentPercent < 0
        ? 0.05
        : usrpCurrentPercent;
    setUsrpCurrentPercent(newUsrpCurrentPercent);

    const usrpPowerPercent = (usrpData.power - 2500) / 500;
    const newUsrpPowerPercent =
      usrpPowerPercent > 1
        ? 0.95
        : usrpPowerPercent < 0
        ? 0.05
        : usrpPowerPercent;
    setUsrpPowerPercent(newUsrpPowerPercent);

    const totalAccPowerPercent =
      (radarAccPowerPercent + usrpAccPowerPercent) / 3;
    const newTotalAccPowerPercent =
      totalAccPowerPercent > 1
        ? 0.95
        : totalAccPowerPercent < 0
        ? 0.05
        : totalAccPowerPercent;
    setTotalAccPowerPercent(newTotalAccPowerPercent);
  }, 1000);

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

    // socket.on("newData", handleNewData);

    socket.on("newData", (receivedData) => {
      console.log("Received data:", receivedData);
      handleNewData(receivedData); // Update state with the received data
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [radarData, usrpData]);

  return (
    <div className="dashboard-container">
      <BsDrag />
      <div className="device-section"></div>
      <div className="charts-grid">
        <div className="chart-card">
          <div>
            <Image
              src={usrpB210Image.src}
              alt="USRP B210"
              className="device-image"
              width={300}
              height={200}
              priority
            />
            <h2>USRP B210</h2>
          </div>
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-wave-square"></i> USRP Current
          </h2>
          <GaugeChart
            id="usrpData-current"
            nrOfLevels={100}
            arcsLength={[0.2, 0.4, 0.4]} // Adjust arcs to represent safe, moderate, and high current ranges
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for mid, Red for high
            percent={usrpCurrentPercent} // Use the calculated percentage value for the gauge
            // percent={usrpData.current / maxUsrpCurrent} // Use the calculated percentage value for the gauge
            formatTextValue={() => `${usrpData.current?.toFixed(2) || 0} mA`} // Display the actual current value
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
            nrOfLevels={100}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={usrpPowerPercent} // Use the calculated percentage value for the gauge
            formatTextValue={() => `${usrpData.power?.toFixed(2) || 0} mW`} // Display the actual power consumption value
            needleColor="#464A4F"
            needleBaseColor="#464A4F"
            textColor="#000000"
            animate={false}
          />
        </div>
        <div className="chart-card">
          <div>
            <Image
              src={awr1642Image.src}
              alt="AWR1642BOOST-ODS"
              className="device-image"
              width={300}
              height={200}
              priority
              // style={{
              //   backgroundColor: 'transparent',
              //   objectFit: 'contain'
              // }}
            />
            <h2>AWR1642BOOST-ODS</h2>
          </div>
        </div>
        <div className="chart-card">
          <h2>
            <i className="fas fa-wave-square"></i> Radar Current
          </h2>
          <GaugeChart
            id="radarData-current"
            nrOfLevels={100}
            arcsLength={[0.2, 0.4, 0.4]} // Adjust arcs to represent safe, moderate, and high current ranges
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for mid, Red for high
            percent={
              radarData.current / 5000 > 1 ? 0.95 : radarData.current / 5000
            } // Use the calculated percentage value for the gauge
            formatTextValue={() => `${radarData.current?.toFixed(2) || 0} mA`} // Display the actual current value
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
            nrOfLevels={100}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={
              radarData.power / 16000 > 1 ? 0.95 : radarData.power / 16000
            } // Use the calculated percentage value for the gauge
            formatTextValue={() => `${radarData.power?.toFixed(2) || 0} mW`} // Display the actual power consumption value
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
            nrOfLevels={100}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={radarAccPowerPercent} // Use the calculated percentage value for the gauge
            // percent={radarAccPower / 1000 / maxRadarAccPower} // Use the calculated percentage value for the gauge
            formatTextValue={() =>
              `${(radarData.accumulatedPower / 1000)?.toFixed(2) || 0} W`
            } // Display the actual power consumption value
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
            nrOfLevels={100}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={usrpAccPowerPercent} // Use the calculated percentage value for the gauge
            formatTextValue={() =>
              `${(usrpData.accumulatedPower / 1000)?.toFixed(2) || 0} W`
            } // Display the actual power consumption value
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
            nrOfLevels={100}
            arcsLength={[0.3, 0.4, 0.3]} // Adjust arcs for low, medium, and high power consumption
            colors={["#00FF00", "#FFBF00", "#FF0000"]} // Green for low, Yellow for medium, Red for high
            percent={totalAccPowerPercent} // Use the calculated percentage value for the gauge
            formatTextValue={() =>
              `${
                (
                  (radarData.accumulatedPower + usrpData.accumulatedPower) /
                  1000
                )?.toFixed(2) || 0
              } W`
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

export default DemoDrag;
