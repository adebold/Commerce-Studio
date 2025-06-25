@echo off
cd %~dp0
npm install
node scripts/install.js --debug
