#!/usr/bin/env bun

// Justification: This is a test script where console output is the primary way to demonstrate functionality

import { mockSeededConfig } from "../src/lib/container/configs/mock-seeded.config";

console.log("Config keys:", Object.keys(mockSeededConfig));
console.log("Config values:", Object.values(mockSeededConfig).length);
console.log("First key:", Object.keys(mockSeededConfig)[0]);
console.log("Config:", mockSeededConfig);
