-- database.sql
-- Run this in PostgreSQL to create the database and tables

CREATE DATABASE rating_app;

\c rating_app

CREATE TYPE user_role AS ENUM ('admin', 'normal', 'store_owner');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(400),
  role user_role NOT NULL
);

CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  store_id INT REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  UNIQUE (user_id, store_id)
);
