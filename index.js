import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import { createReadStream } from 'fs';
import crypto from 'crypto';
import m from 'mongoose';
import { writeFileSync } from 'fs';
import puppeteer from 'puppeteer';

import appSrc from './app.js';

const UserSchema = new m.Schema({
    login: {
      type: 'String'
    },
    password: {
      type: 'String'
    }
});

const app = appSrc(express, bodyParser, createReadStream, crypto, http, m, UserSchema, writeFileSync, puppeteer);


app.listen(process.env.PORT || 4321);