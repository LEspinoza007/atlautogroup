-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New query)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
