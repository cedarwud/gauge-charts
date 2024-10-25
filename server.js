import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import express from "express";
import cors from "cors"; // Import the CORS package

const dev = process.env.NODE_ENV !== "production";
const server = next({ dev });
const handle = server.getRequestHandler();

const port = parseInt(process.env.PORT || "3000", 10);

server.prepare().then(() => {
  const app = express();

  // Enable CORS for your frontend's URL
  app.use(
    cors({
      origin: "*", // Your frontend URL
      methods: ["GET", "POST"], // Methods you want to allow
    })
  );

  app.use(express.urlencoded({ extended: true }));
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer);

  // Handle incoming socket connections
  io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // API to emit data through Socket.io
  app.post("/api/data", express.json(), (req, res) => {
    const reqBody = req.body;
    const radarData = {
      voltage: 0,
      current: 0,
      power: 0,
      accumulatedPower: 0,
    };
    const usrpData = {
      voltage: 0,
      current: 0,
      power: 0,
      accumulatedPower: 0,
    };
    let totalPower = 0;
    for (const data of reqBody.data) {
      if (data.channel === 0) {
        if (data.type === "BATTERY_VOLTAGE") radarData.voltage = data.value;
        if (data.type === "ELECTRIC_CURRENT") radarData.current = data.value;
        if (data.type === "ELECTRICAL_CONSUMPTION")
          radarData.power = data.value;
      } else if (data.channel === 1) {
        if (data.type === "BATTERY_VOLTAGE") usrpData.voltage = data.value;
        if (data.type === "ELECTRIC_CURRENT") usrpData.current = data.value;
        if (data.type === "ELECTRICAL_CONSUMPTION") usrpData.power = data.value;
      } else {
        if (data.channel === 2) {
          radarData.accumulatedPower += radarData.power;
        } else if (data.channel === 3) {
          usrpData.accumulatedPower += usrpData.power;
        } else {
          totalPower =
            totalPower + radarData.accumulatedPower + usrpData.accumulatedPower;
        }
      }
    }

    const data = {
      radarData,
      usrpData,
      totalPower,
    };

    io.emit("newData", data);
    res.status(200).json({ message: "Data sent successfully", data });
  });

  // Default request handling
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  // Start the app
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Server is running on http://localhost:${port}`);
  });
});
