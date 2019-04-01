### Job scraper

This project aims to find related jobs from a series of websites in NZ and comprehensively display them with meaningful visuazliations.
It also takes graduate numbers where the data is available, and compares the number of graduates to the number of jobs to find an industry that is in demand.

## Architecture
It is split into two main parts, 
- Server which runs Puppeteer to scrape the relevant information
- Client running a React application to show data visualization using chart.js
