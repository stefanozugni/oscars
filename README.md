# Oscars Archive

A simple Angular web app to browse all Academy Awards (Oscars) winners and nominations by year.

Instead of navigating through multiple Wikipedia pages, this tool lets you directly select a year and view all categories in one place — winners and nominees included.  
It was born out of a personal need: I often watch a movie and wonder _“Did this win any Oscars?”_  
Looking it up on Wikipedia usually means going through several links to find the right edition and then the right category. This app makes that process faster and more intuitive.

🔗 **Live site**: [oscars-archive.web.app](https://oscars-archive.web.app)

---

## Features

- Instantly view Oscar winners and nominees for any year
- Clean and responsive UI
- Simple navigation from a single timeline view

---

## Tech Stack

- [Angular CLI](https://github.com/angular/angular-cli) version 18.2.8.
- Hosted on [Firebase](https://firebase.google.com/)

---

## Data Source

This project uses data from:  
📁 [json-nominations](https://github.com/delventhalz/json-nominations) by [@delventhalz](https://github.com/delventhalz)

---

## Getting Started

To run the project locally:

```bash
git clone https://github.com/stefanozugni/oscars.git
cd oscars
npm install
ng serve
