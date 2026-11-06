import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatClaudeSkillMd,
  generateClaudeInstallCommand,
  ClaudeSkillDefinition,
} from './skill-generator';

const sampleSkill: ClaudeSkillDefinition = {
  id: 'af-test',
  name: 'alphafold-test',
  title: 'AlphaFold Test Skill',
  category: 'proteins',
  description: 'Automates AlphaFold structure downloads and confidence parsing.',
  version: '1.2.0',
  slashCommand: '/af-test',
  tags: ['alphafold', 'proteins', 'plddt'],
  toolsRequired: ['bash', 'python3', 'curl'],
  environmentVars: ['NCBI_API_KEY'],
  systemInstructions: 'You are an expert computational structural biologist.',
  examples: [
    {
      userPrompt: 'Analyze p53 AlphaFold structure',
      claudeAction: 'Queries AlphaFold DB API for P04637',
      expectedOutputSummary: 'Returns mmCIF coordinate download link and pLDDT breakdown',
    },
  ],
  acceptanceCriteria: ['Validates UniProt accession', 'Reports pLDDT confidence'],
};

test('formatClaudeSkillMd generates valid YAML frontmatter and markdown sections', () => {
  const md = formatClaudeSkillMd(sampleSkill);

  assert.ok(md.startsWith('---'));
  assert.ok(md.includes('name: alphafold-test'));
  assert.ok(md.includes('version: 1.2.0'));
  assert.ok(md.includes('slash_command: /af-test'));
  assert.ok(md.includes('tags: ["alphafold", "proteins", "plddt"]'));
  assert.ok(md.includes('# Skill: AlphaFold Test Skill'));
  assert.ok(md.includes('## 1. Role & Objective'));
  assert.ok(md.includes('You are an expert computational structural biologist.'));
  assert.ok(md.includes('- [ ] Validates UniProt accession'));
});

test('generateClaudeInstallCommand produces valid directory and file commands', () => {
  const cmd = generateClaudeInstallCommand(sampleSkill);
  assert.ok(cmd.includes('mkdir -p ~/.claude/skills/alphafold-test'));
  assert.ok(cmd.includes('cat << \'EOF\' > ~/.claude/skills/alphafold-test/SKILL.md'));
  assert.ok(cmd.includes('Skill \'alphafold-test\' successfully installed'));
});
