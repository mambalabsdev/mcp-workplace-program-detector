# Workplace Program Detector MCP Server

[![Smithery](https://smithery.ai/badge/mambabuilt/mcp-workplace-program-detector)](https://smithery.ai/servers/mambabuilt/mcp-workplace-program-detector) [![Glama score](https://glama.ai/mcp/servers/mambalabsdev/mcp-workplace-program-detector/badges/score.svg)](https://glama.ai/mcp/servers/mambalabsdev/mcp-workplace-program-detector) [![MCP Registry](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fregistry.modelcontextprotocol.io%2Fv0%2Fservers%3Fsearch%3Dcom.mambabuilt%252Fmcp-workplace-program-detector%26limit%3D1&query=%24.servers%5B0%5D._meta%5B%22io.modelcontextprotocol.registry%2Fofficial%22%5D.status&label=mcp%20registry&color=blue)](https://registry.modelcontextprotocol.io/v0/servers?search=com.mambabuilt/mcp-workplace-program-detector&limit=1) [![npm version](https://img.shields.io/npm/v/@mambalabsdev/mcp-workplace-program-detector)](https://www.npmjs.com/package/@mambalabsdev/mcp-workplace-program-detector) [![npm downloads](https://img.shields.io/npm/dm/@mambalabsdev/mcp-workplace-program-detector)](https://www.npmjs.com/package/@mambalabsdev/mcp-workplace-program-detector) [![license](https://img.shields.io/github/license/mambalabsdev/mcp-workplace-program-detector)](https://github.com/mambalabsdev/mcp-workplace-program-detector/blob/main/LICENSE) [![mcpservers.org](https://img.shields.io/badge/mcpservers.org-listed-blue)](https://mcpservers.org/servers/mambalabsdev/mcp-workplace-program-detector)

MCP server for the Mamba Labs [Workplace Program Detector](https://apify.com/mambalabs/workplace-program-detector) actor on Apify.

A company domain in, the people programs that company publishes out: employee resource groups, DEI, wellbeing and mental health, learning and tuition support, parental and caregiver leave, and volunteering.

## Install

```bash
npx -y @mambalabsdev/mcp-workplace-program-detector
```

### Claude Desktop

```json
{
  "mcpServers": {
    "mamba-workplace-program-detector": {
      "command": "npx",
      "args": ["-y", "@mambalabsdev/mcp-workplace-program-detector"],
      "env": { "APIFY_TOKEN": "your-apify-token" }
    }
  }
}
```

Get an Apify token at [console.apify.com/account/integrations](https://console.apify.com/account/integrations).

## Tool

### `detect_workplace_programs`

A company domain in, the people programs that company publishes out: employee resource groups, DEI, wellbeing and mental health, learning and tuition support, parental and caregiver leave, and volunteering.

| Input | Type | Required | Notes |
| --- | --- | --- | --- |
| `domain` | string | yes | Bare domain, for example hubspot.com. Protocol and path are stripped. |
| `ats_slug` | string | no | Skip ATS discovery and read this Greenhouse, Lever or Ashby board slug directly. |
| `scan_job_postings` | boolean | no | Reads the company's live job bodies from its ATS. This path finds benefits language that marketing pages omit. |
| `scan_web_pages` | boolean | no | Probes the careers, culture, benefits, DEI and ESG paths. This path finds ERG and volunteering language that job postings omit. |
| `max_pages` | string | no | Sent as a string for Clay. Clamped to 1 to 25. |
| `skipCache` | enum | no | false uses the 14 day cache, true forces a fresh crawl. Sent as a string for Clay, matching the fleet convention. |

## Billing

You are charged per domain analyzed, plus a small actor start fee.

Pricing is on the [actor's Apify page](https://apify.com/mambalabs/workplace-program-detector). Running this server consumes Apify credits.

## What this server does and does not do

It is a thin client for the Apify actor. It passes your input through and returns the actor's output unchanged. Every behavior described above lives in the actor, not here.

Errors are surfaced, never swallowed. An invalid input, an invalid token, an exhausted balance, a timeout, or a run that returns anything other than a dataset all come back as an explicit tool error rather than as an empty result.

## Source

The actor is on the [Apify Store]( https://apify.com/mambalabs/workplace-program-detector). This wrapper is [MIT licensed](LICENSE).

Built by [Mamba Labs](https://apify.com/mambalabs)
