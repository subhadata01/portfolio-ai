require('dotenv').config()

const express = require('express')
const cors = require("cors");
const portfolioRoutes = require('./routes/portfolio')

// express app
const app = express()

// middleware
app.use(express.json({ limit: "50mb" }));
app.use(cors());

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/', portfolioRoutes)

app.listen(4000, ()=> {
  console.log("Hello");
}) 