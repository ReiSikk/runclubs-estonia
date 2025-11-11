# 🏃‍♂️ Run Clubs Estonia

A web app for discovering running clubs across Estonia. Built to help runners find their community, whether training for a 5K or looking for weekly running buddies. This project is a work in progress and will be developed further in the future.

**Live site:** [runclubs.ee](https://runclubs.ee)

---

## 🎯 Project Purpose

This project started as a personal initiative to solve a real problem: finding local running clubs in Estonia wasn't easy. I wanted to create a centralized, user-friendly platform where runners could quickly discover clubs by city, search by name, and see which clubs are running today. Right now all these running clubs are on different platforms and are tough to find. 

I handled everything from concept to design, development, testing, and infrastructure. It was my first time implementing E2E tests into a fully automated CI/CD pipeline managed through Netlify and Github Actions. 

---

## 🛠️ Tech Stack

### Core
- **Next.js 15**
- **TypeScript**
- **React 19**

### Content & Data
- **Google Firestore** - BaaS used for database and file storing
- **TanStack Query** - Server state management, caching, prefetching

### Styling
- **CSS Modules** - Component-scoped styling

### Testing & Quality
- **Playwright** - End-to-end testing across Chromium, Firefox, and WebKit
- **GitHub Actions** - Automated CI/CD pipeline

### Deployment & Analytics
- **Netlify** - Hosting, deploy previews, serverless functions
- **Umami Analytics** - Privacy-friendly analytics
---

## ✨ Key Features

- 🔍 **Search & Filter** - Find clubs by name or filter by city
- 📅 **Today's Clubs** - See which clubs are running today
- 🎨 **Responsive Design** - Works beautifully on mobile, tablet, and desktop
- ⚡ **Fast Performance** - SSR, image optimization, smart caching
- 🚀 **CI/CD Pipeline** - Automated testing and deployment - E2E tests run on every pull request to the main branch, branch is merged only if all tests pass. Push to 'main' triggers new deploy on Netlify. 
- 🔒 **Branch Protection** - Tests must pass before merging to main

---

## 🏗️ Architecture Highlights

### Server + Client Rendering Strategy
- Server Components for initial data fetching (SEO-friendly, fast FCP)
- Client Components for interactive filtering/searching
- TanStack Query for managing data fetching states.

### Testing Philosophy
- Tests run on every PR (required status check)
- Cross-browser compatibility verified