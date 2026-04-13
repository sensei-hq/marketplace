#!/usr/bin/env bun
/**
 * sensei-marketplace installer
 *
 * Installs skills, plugins, commands, and hooks for a target project or globally.
 *
 * Usage:
 *   bun run install.ts --target <project-path> [--scope global|project] [--acp claude-code|cursor|windsurf]
 *   bun run install.ts --global [--acp claude-code]
 *   bun run install.ts --list                 # List all catalog items
 *   bun run install.ts --item <name>          # Install specific item
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { parseArgs } from 'util';
import { homedir } from 'os';

interface CatalogItem {
  name: string;
  kind: 'skill' | 'plugin' | 'command' | 'hook';
  description: string;
  scope: 'global' | 'project';
  recommended_for: string[];
  stage: string[];
  path: string;
  mcp_config?: { command: string; args: string[] };
  event?: string;
}

interface Catalog {
  version: string;
  items: CatalogItem[];
}

const MARKETPLACE_ROOT = dirname(new URL(import.meta.url).pathname);
const catalog: Catalog = JSON.parse(readFileSync(join(MARKETPLACE_ROOT, 'catalog.json'), 'utf-8'));

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    target: { type: 'string', short: 't' },
    global: { type: 'boolean', short: 'g' },
    acp: { type: 'string', default: 'claude-code' },
    scope: { type: 'string', default: 'all' },
    item: { type: 'string', short: 'i' },
    list: { type: 'boolean', short: 'l' },
    kind: { type: 'string', short: 'k' },
    role: { type: 'string', short: 'r' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`sensei-marketplace installer

  --list              List all catalog items
  --target <path>     Install to a project directory
  --global            Install global items to ~/.claude/
  --acp <name>        Target ACP (claude-code, cursor, windsurf)
  --item <name>       Install specific item by name
  --kind <type>       Filter by kind (skill, plugin, command, hook)
  --role <type>       Filter by role (api, frontend, mobile, etc)
  --scope <s>         Filter by scope (global, project)
  `);
  process.exit(0);
}

// ── List ──────────────────────────────────────────────────────────────────────

if (values.list) {
  let items = catalog.items;
  if (values.kind) items = items.filter(i => i.kind === values.kind);
  if (values.role) items = items.filter(i => i.recommended_for.includes(values.role!) || i.recommended_for.includes('all'));
  if (values.scope && values.scope !== 'all') items = items.filter(i => i.scope === values.scope);

  console.log(`\nsensei-marketplace v${catalog.version} — ${items.length} items\n`);
  for (const item of items) {
    const tags = item.recommended_for.filter(t => t !== 'all').join(', ');
    console.log(`  ${item.kind.padEnd(8)} ${item.name.padEnd(30)} ${item.scope.padEnd(8)} ${tags ? `[${tags}]` : ''}`);
  }
  console.log();
  process.exit(0);
}

// ── Install ───────────────────────────────────────────────────────────────────

const targetPath = values.target ?? (values.global ? homedir() : null);
if (!targetPath) {
  console.error('Error: specify --target <path> or --global');
  process.exit(1);
}

const acp = values.acp ?? 'claude-code';
let items = catalog.items;

// Filter by specific item, kind, or scope
if (values.item) {
  items = items.filter(i => i.name === values.item);
  if (items.length === 0) {
    console.error(`Item "${values.item}" not found in catalog`);
    process.exit(1);
  }
} else {
  if (values.scope === 'global') items = items.filter(i => i.scope === 'global');
  else if (values.scope === 'project') items = items.filter(i => i.scope === 'project');
  if (values.kind) items = items.filter(i => i.kind === values.kind);
  if (values.role) items = items.filter(i => i.recommended_for.includes(values.role!) || i.recommended_for.includes('all'));
}

console.log(`Installing ${items.length} items to ${targetPath} (ACP: ${acp})\n`);

let installed = 0;
for (const item of items) {
  try {
    switch (item.kind) {
      case 'skill':
        installSkill(item, targetPath);
        break;
      case 'command':
        installCommand(item, targetPath);
        break;
      case 'hook':
        installHook(item, targetPath);
        break;
      case 'plugin':
        installPlugin(item, targetPath, acp);
        break;
    }
    installed++;
    console.log(`  ✓ ${item.kind} ${item.name}`);
  } catch (e) {
    console.error(`  ✗ ${item.kind} ${item.name}: ${e}`);
  }
}

console.log(`\n${installed}/${items.length} items installed.`);

// ── Install functions ─────────────────────────────────────────────────────────

function installSkill(item: CatalogItem, target: string) {
  const src = join(MARKETPLACE_ROOT, item.path);
  const dest = join(target, '.claude', 'skills', `${item.name}.md`);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
}

function installCommand(item: CatalogItem, target: string) {
  const src = join(MARKETPLACE_ROOT, item.path);
  const dest = join(target, '.claude', 'commands', `${item.name}.md`);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
}

function installHook(item: CatalogItem, target: string) {
  const src = join(MARKETPLACE_ROOT, item.path);
  const dest = join(target, '.claude', 'hooks', item.name);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
}

function installPlugin(item: CatalogItem, target: string, acp: string) {
  if (!item.mcp_config) return;
  const configPath = join(MARKETPLACE_ROOT, item.path);
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const acpConfig = config.acp_configs?.[acp];

  if (acp === 'claude-code') {
    // Write to .claude/plugins/<name>/plugin.json
    const dest = join(target, '.claude', 'plugins', item.name, 'plugin.json');
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, JSON.stringify({
      name: item.name,
      description: item.description,
      mcp_server: config.mcp_server,
    }, null, 2));
  } else {
    // Generic MCP config for cursor/windsurf/etc
    const mcpConfigPath = join(target, acpConfig?.config_path ?? `.${acp}/mcp.json`);
    let existing: Record<string, any> = {};
    if (existsSync(mcpConfigPath)) {
      existing = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'));
    }
    existing.mcpServers = existing.mcpServers ?? {};
    existing.mcpServers[item.name] = {
      command: config.mcp_server.command,
      args: config.mcp_server.args,
      env: config.mcp_server.env ?? {},
    };
    mkdirSync(dirname(mcpConfigPath), { recursive: true });
    writeFileSync(mcpConfigPath, JSON.stringify(existing, null, 2));
  }
}
