/**
 * Claude Code Skill Generator & Formatter
 * Complies with Claude Code (.claude/skills/<name>/SKILL.md) specifications.
 */

export interface ClaudeSkillDefinition {
  id: string;
  name: string;
  title: string;
  category: 'proteins' | 'genomics' | 'chemistry' | 'pathways' | 'literature' | 'programming';
  description: string;
  version: string;
  slashCommand: string;
  tags: string[];
  toolsRequired: string[];
  environmentVars?: string[];
  systemInstructions: string;
  cliScript?: {
    filename: string;
    language: 'python' | 'bash' | 'typescript';
    code: string;
  };
  mcpServers?: Array<{
    name: string;
    command: string;
    args: string[];
  }>;
  examples: Array<{
    userPrompt: string;
    claudeAction: string;
    expectedOutputSummary: string;
  }>;
  acceptanceCriteria: string[];
}

/**
 * Formats a ClaudeSkillDefinition into standard SKILL.md markdown with YAML frontmatter.
 */
export function formatClaudeSkillMd(skill: ClaudeSkillDefinition): string {
  const frontmatterLines = [
    '---',
    `name: ${skill.name}`,
    `description: ${skill.description.replace(/\n/g, ' ')}`,
    `version: ${skill.version || '1.0.0'}`,
    `slash_command: ${skill.slashCommand}`,
    `category: ${skill.category}`,
    `tags: [${skill.tags.map((t) => JSON.stringify(t)).join(', ')}]`,
    `tools: [${skill.toolsRequired.map((t) => JSON.stringify(t)).join(', ')}]`,
  ];

  if (skill.environmentVars && skill.environmentVars.length > 0) {
    frontmatterLines.push(`env: [${skill.environmentVars.map((e) => JSON.stringify(e)).join(', ')}]`);
  }

  frontmatterLines.push('---');

  const sections: string[] = [
    frontmatterLines.join('\n'),
    '',
    `# Skill: ${skill.title}`,
    '',
    `> **Trigger**: Run with slash command \`${skill.slashCommand}\` or by invoking in natural language: "${skill.description}"`,
    '',
    '## 1. Role & Objective',
    skill.systemInstructions.trim(),
    '',
    '## 2. Tools & Dependencies',
    `- **Required CLI / Runtime**: ${skill.toolsRequired.join(', ')}`,
    skill.environmentVars && skill.environmentVars.length > 0
      ? `- **Environment Variables**: ${skill.environmentVars.join(', ')}`
      : '- **Authentication**: No API keys required for public scientific rate limits.',
    '',
  ];

  if (skill.cliScript) {
    sections.push(
      '## 3. Automation Script (`scripts/' + skill.cliScript.filename + '`)',
      '```' + skill.cliScript.language,
      skill.cliScript.code.trim(),
      '```',
      ''
    );
  }

  if (skill.mcpServers && skill.mcpServers.length > 0) {
    sections.push(
      '## 4. Model Context Protocol (MCP) Configuration',
      'Add the following server entry to your `.claude/config.json` or `claude_desktop_config.json`:',
      '```json',
      JSON.stringify(
        {
          mcpServers: Object.fromEntries(
            skill.mcpServers.map((s) => [s.name, { command: s.command, args: s.args }])
          ),
        },
        null,
        2
      ),
      '```',
      ''
    );
  }

  sections.push(
    '## 5. Usage Examples & Workflows',
    ...skill.examples.map((ex, idx) =>
      [
        `### Example ${idx + 1}: ${ex.userPrompt}`,
        `**User Command:**`,
        '```bash',
        `claude "${ex.userPrompt}"`,
        '```',
        `**Agent Action:** ${ex.claudeAction}`,
        `**Expected Output:** ${ex.expectedOutputSummary}`,
        '',
      ].join('\n')
    ),
    '## 6. Acceptance & Quality Criteria',
    ...skill.acceptanceCriteria.map((c) => `- [ ] ${c}`),
    ''
  );

  return sections.join('\n');
}

/**
 * Generates ready-to-run bash command to install the skill in Claude Code
 */
export function generateClaudeInstallCommand(skill: ClaudeSkillDefinition): string {
  const safeName = skill.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return `mkdir -p ~/.claude/skills/${safeName}
cat << 'EOF' > ~/.claude/skills/${safeName}/SKILL.md
${formatClaudeSkillMd(skill)}
EOF
echo "Skill '${skill.name}' successfully installed to ~/.claude/skills/${safeName}/"`;
}
