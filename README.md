# Cute Todo App

An iPhone-first todo app built with React Native and Expo, designed for simple task capture, local reminders, and a calm, approachable experience.

## Overview

Cute Todo App is a document-driven mobile app project for everyday task management on iPhone.
It focuses on helping users quickly capture tasks, organize them with categories and priorities, set reminders, and keep everything available offline.

This repository is intended to be understandable to both:

- non-technical readers who want to understand the product direction
- engineers who want to understand the app structure, runtime model, and documentation entry points

## Why This Project Exists

The project exists to explore a full-featured local-first productivity app with product and engineering discipline.

According to the project documents, the app is meant to:

- make task creation and editing fast
- support reminders and overdue awareness without requiring an account
- organize tasks with categories, subtasks, priorities, and recurring rules
- provide JSON export as a foundation for future backup or import support
- keep the experience focused on iPhone, offline use, and a lightweight personal workflow

## Key Features

- Task creation and editing  
  Users can create tasks with title, note, due date, due time, category, priority, subtasks, reminders, and recurrence settings.

- Local reminder support  
  The app uses local notifications to help users remember important deadlines without depending on a backend service.

- Recurring task handling  
  Recurring tasks can generate follow-up tasks based on daily, weekly, monthly, yearly, or custom interval rules.

- Search, filter, and sorting  
  Users can search tasks by keyword and narrow results with advanced filters such as category, status, reminders, and recurrence.

- Completed list and trash flow  
  Finished tasks move to a completed list, while deleted tasks move into trash with permanent deletion behavior and timed cleanup rules.

- Local JSON export  
  Users can export task data as JSON for backup and future compatibility with import flows.

- Onboarding and settings  
  The app includes onboarding, notification guidance, theme settings, default reminder behavior, and daily summary settings.

## Who This Project Is For

- iPhone users who want a personal todo app without accounts or cloud sync
- developers studying Expo, React Native, and local-first mobile app architecture
- portfolio reviewers who want to see a project built from PRD/SRS documents instead of ad hoc feature work

## Project Status

This project is in active development.

Based on the repository documents:

- Core app scope through milestone 7 is largely defined and implemented
- Milestone 8 is focused on stabilization, export handoff, and test coverage
- Some polish and QA work are still planned

Areas that are still explicitly listed as incomplete or in-progress in the docs:

- broader integration tests
- UI / E2E test coverage
- additional UX polish for onboarding, completion animation, and export flow

## Tech Stack

- React Native  
  Used to build the mobile UI.

- Expo SDK 54  
  Used to speed up iPhone app development, routing, device integration, and local testing.

- Expo Router  
  Used for file-based navigation and screen structure.

- React Native Paper  
  Used for the app's component library and shared mobile UI patterns.

- SQLite via `expo-sqlite`  
  Used to store tasks, categories, reminders, settings, and export logs locally on the device.

- Expo Notifications  
  Used for local reminder notifications and daily summary reminders.

- Expo File System and Expo Sharing  
  Used for JSON export and file handoff.

- Vitest  
  Used for unit testing selected logic.

## Project Structure

High-level structure:

```text
src/
  app/              Expo Router screens and layouts
  components/       Reusable UI components
  constants/        Theme and app constants
  database/         Schema, migrations, and database setup
  hooks/            Shared hooks
  modules/          Feature modules and use cases
  shared/           Shared utilities and types

```

Feature modules are organized around app capabilities such as:

- task
- category
- subtask
- reminder
- notification
- settings
- export

## Installation

### Prerequisites

- Node.js
- npm
- Xcode / iOS Simulator for local iPhone testing
- Expo tooling compatible with this repository

### Install dependencies

```bash
npm install
```

## How to Run

Start the project:

```bash
npm run start
```

Common commands:

```bash
npm run ios
npm run android
npm run web
npm run lint
npm run test
```

Note:

- The product documents define the app as iPhone-only.
- Android and web scripts exist because they come from the Expo development workflow, but they are not the target product platform.

## How to Use

Typical user flow:

1. Launch the app
2. Complete onboarding and notification guidance
3. Create a task with due date and time
4. Add optional category, subtasks, reminders, and recurrence
5. View tasks on the home screen
6. Search, filter, complete, or delete tasks
7. Review completed items, trash, or export data when needed

## License

MIT License. See `LICENSE`.
