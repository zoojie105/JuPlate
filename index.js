const express = require("./config/express");
const { logger } = require("./config/winston");

const port = 3000;
express().listen(port);
logger.info(` API Server Start At Port ${port}`);
