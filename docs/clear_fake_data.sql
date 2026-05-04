-- Run this once to clear all fake simulator data
-- This keeps your sensors table intact but removes measurements and alerts

TRUNCATE TABLE measurements RESTART IDENTITY CASCADE;
TRUNCATE TABLE alerts RESTART IDENTITY CASCADE;
