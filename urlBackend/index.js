const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const shortid = require("shortid");
const Url = require("./Url");
const utils = require("./Util/util");

dotenv.config();
const app = express();

const newSwag = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./swagger_output.json"), "utf8")
);

app.use(cors());

app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(newSwag, { explorer: true })  
);

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Db Connected`);
  })
  .catch((err) => {
    console.log(err.message);
  });

// get all saved URLs
app.get("/all", async (req, res) => {
  // Url.find((error, data) => {
  //   if (error) {
  //     return next(error);
  //   } else {
  //     res.json(data);
  //   }
  // });
  const urls = await Url.find();
  res.send(urls);
});

// URL shortener endpoint
app.post("/short", async (req, res) => {
  // console.log("HERE",req.body);
  const { origin } = req.body;
  const base = process.env.BASE_URL;

  const urlId = shortid.generate();
  if (utils.validateUrl(origin)) {
    try {
      let url = await Url.findOne({ origUrl: origin });
      if (url) {
        res.json(url);
      } else {
        const shortUrl = `${base}/${urlId}`;

        url = new Url({
          origUrl: origin,
          shortUrl,
          urlId,
          date: new Date(),
        });

        await url.save();
        res.json(url);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error");
    }
  } else {
    res.status(400).json("Invalid Original Url");
  }
});

// redirect endpoint
app.get("/:urlId", async (req, res) => {
  try {
    const url = await Url.findOne({ urlId: req.params.urlId });
    console.log(url);
    if (url) {
      url.clicks++;
      url.save();
      return res.redirect(url.origUrl);
    } else res.status(404).json("Not found");
  } catch (err) {
    console.log(err);
    res.status(500).json("Server Error");
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
