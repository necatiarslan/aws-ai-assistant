#!/usr/bin/env node
import * as net from 'net';
import * as readline from 'readline';

const PORT = parseInt(process.env.AWS_AI_ASSISTANT_MCP_PORT || '37114', 10);
const HOST = process.env.AWS_AI_ASSISTANT_MCP_HOST || '127.0.0.1';

function fail(message: string) {
  process.stdout.write(JSON.stringify({ id: 'init', error: { message } }) + '\n');
  process.exit(1);
}

const socket = net.createConnection({ host: HOST, port: PORT }, () => {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    const trimmed = (line || '').trim();
    if (trimmed.length === 0) return;
    socket.write(trimmed + '\n');
  });
});

socket.on('data', (data) => {
  const text = data.toString('utf-8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  for (const l of lines) {
    process.stdout.write(l + '\n');
  }
});

socket.on('error', (err) => {
  fail(`Cannot connect to MCP bridge at ${HOST}:${PORT}. Start it in VS Code via 'Goggles: Start MCP Server'. Detail: ${err.message}`);
});

socket.on('close', () => process.exit(0));
