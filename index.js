//DEPENDENCIES
const mysql = require("mysql2");
const inquirer = require("inquirer");
const express = require('express');
const connection = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

