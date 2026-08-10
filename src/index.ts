#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(here, "..", "package.json"), "utf8"),
) as { version: string; name: string };

// Distinctive UA so Apify run meta.userAgent marks MCP-originated runs.
const USER_AGENT = `mambalabs-mcp ${pkg.name}@${pkg.version}`;

type ToolResult = {
  isError?: boolean;
  content: Array<{ type: "text"; text: string }>;
};

// Drop undefined values so optional inputs are not sent to the actor.
function compact(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// Shared caller. actorPath is the actor's immutable Apify actor ID (a stable key
// that survives Store renames). The /v2/acts/{id} endpoint accepts it directly,
// so a Store rename never breaks these calls.
//
// The token is read here rather than at module load, so the tool registers
// unconditionally and a server started without APIFY_TOKEN still advertises its
// capabilities instead of reporting none.
async function runActor(
  actorPath: string,
  actorLabel: string,
  input: Record<string, unknown>,
): Promise<ToolResult> {
  const APIFY_TOKEN = process.env.APIFY_TOKEN;
  if (!APIFY_TOKEN) {
    return { isError: true, content: [{ type: "text", text: "APIFY_TOKEN is not set. Create a token at https://console.apify.com/account/integrations and set it as the APIFY_TOKEN environment variable." }] };
  }

  const url = `https://api.apify.com/v2/acts/${actorPath}/run-sync-get-dataset-items?timeout=300`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${APIFY_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify(input),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { isError: true, content: [{ type: "text", text: `Could not reach the Apify API: ${message}` }] };
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body?.error?.message) detail = ` ${body.error.message}`;
    } catch {
      detail = "";
    }

    let message: string;
    switch (response.status) {
      case 400:
        message = `The ${actorLabel} run was rejected as invalid input.${detail}`;
        break;
      case 401:
        message = "Invalid Apify token. Check your APIFY_TOKEN environment variable.";
        break;
      case 402:
        message =
          "Insufficient Apify credits. Check your account balance at https://console.apify.com/billing";
        break;
      case 408:
        message = `The ${actorLabel} run timed out after 300 seconds. Ask for less per call, or run the actor on Apify directly for larger jobs.`;
        break;
      default:
        message = `Apify request to ${actorLabel} failed with status ${response.status}.${detail}`;
    }
    return { isError: true, content: [{ type: "text", text: message }] };
  }

  // A 2xx from run-sync-get-dataset-items normally carries the dataset array.
  // Anything else on this path is a failure the caller must see, never an empty
  // success: surfacing it here is what keeps a failed run from reading as "no
  // results found".
  let items: unknown;
  try {
    items = await response.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { isError: true, content: [{ type: "text", text: `The ${actorLabel} run returned a response that could not be parsed: ${message}` }] };
  }

  if (!Array.isArray(items)) {
    const asObj = items as { error?: { type?: string; message?: string } };
    const detail = asObj?.error?.message
      ? `${asObj.error.message}`
      : JSON.stringify(items);
    return { isError: true, content: [{ type: "text", text: `The ${actorLabel} run did not return a dataset. ${detail}` }] };
  }

  return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
}

const server = new McpServer({
  name: "mamba-workplace-program-detector",
  version: pkg.version,
});

// Workplace Program Detector (immutable actor ID Li6pPDhqbdzFz3h7G)
server.registerTool(
  "detect_workplace_programs",
  {
    title: "Detect Workplace Programs",
    description:
      "Detect which people programs a company publishes on its own surfaces, and return one flat row per domain. It reads two independent paths and each catches what the other misses: the company's live job postings through its Greenhouse, Lever or Ashby board, which is where benefits language that marketing pages omit shows up, and the careers, culture, benefits, DEI and ESG pages on the website, which is where employee resource group and volunteering language shows up. Either path can be turned off. If you already know the company's ATS board slug, pass ats_slug to skip discovery and read that board directly. Results are cached for 14 days and skipCache forces a fresh crawl. This reports what a company publishes, which is not the same as what it does: absence of a signal means the company does not say it publicly, not that the program does not exist. Requires an APIFY_TOKEN and consumes Apify credits. Read only: it reads public pages, it writes nothing.",
    annotations: {
      title: "Detect Workplace Programs",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
    domain: z.string().describe("Bare domain, for example hubspot.com. Protocol and path are stripped."),
    ats_slug: z.string().optional().describe("Skip ATS discovery and read this Greenhouse, Lever or Ashby board slug directly."),
    scan_job_postings: z.boolean().optional().describe("Reads the company's live job bodies from its ATS. This path finds benefits language that marketing pages omit. Default: true."),
    scan_web_pages: z.boolean().optional().describe("Probes the careers, culture, benefits, DEI and ESG paths. This path finds ERG and volunteering language that job postings omit. Default: true."),
    max_pages: z.string().optional().describe("Sent as a string for Clay. Clamped to 1 to 25. Default: \"14\"."),
    skipCache: z.enum(["false", "true"]).optional().describe("false uses the 14 day cache, true forces a fresh crawl. Sent as a string for Clay, matching the fleet convention. Default: \"false\"."),
    },
  },
  async (args) =>
    runActor("Li6pPDhqbdzFz3h7G", "Workplace Program Detector", compact(args as Record<string, unknown>)),
);

const transport = new StdioServerTransport();
await server.connect(transport);
