---
description: Read this file to understand how to fetch data.
---

# Data Fetching Instructions

This document provides guidelines on how to fetch data effectively in our project. Follow these instructions to ensure consistency and efficiency in your data fetching operations.

## 1. User Server Components for Data Fetching

Whenever possible, use Server Components to fetch data. Never use Client Components for data fetching unless absolutely necessary. Server Components allow you to fetch data on the server side, which can improve performance and reduce the amount of JavaScript sent to the client.

## 2. Data Fetching methods

Always use the helper funtions provided in the `/data` directory for data fetching. Never fetch data directly in your components.

All helpers functions in the `/data` directory should use Drizzle ORM for database interactions.
