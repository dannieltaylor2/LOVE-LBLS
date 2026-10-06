# Installed Codex skills

142 skills are installed locally under `.agents/skills/`, from 9 of the 10 requested repositories. The installation was verified using `skills@1.7.0 list --agent codex --json`.

## Sources

| Repository                                                                                      |                  Installed skills |
| ----------------------------------------------------------------------------------------------- | --------------------------------: |
| [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify)                             |                                 1 |
| [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman)                               |                                22 |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)                                 |                                13 |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)                           |                                25 |
| [anthropics/skills](https://github.com/anthropics/skills)                                       |                                20 |
| [mattpocock/skills](https://github.com/mattpocock/skills)                                       |                                38 |
| [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)       |                                 1 |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |                                 7 |
| [obra/superpowers](https://github.com/obra/superpowers)                                         |                                15 |
| `dietrich-gebert/ponytail`                                                                      | **Blocked: repository not found** |

The Ponytail URL returned HTTP 404, and native Git access using the existing platform authentication returned `Repository not found`. A corrected URL or access to that repository is required.

## Installation details

- Scope: this project; agent: Codex. No global skill directories were changed.
- Standard packs were installed with `skills@1.7.0 add <repository> --agent codex --skill '*' --full-depth --yes --copy`.
- `skills-lock.json` records 140 installer-managed skills, their upstream paths and hashes.
- Both upstream `test-driven-development` variants are retained. The Superpowers version uses its original name; Addy Osmani’s version is `addyosmani-test-driven-development`. Only the latter’s frontmatter name was changed. Its provenance is in the adjacent `INSTALLATION-NOTE.md`; this alias is not managed by the standard lockfile.
- Graphify does not expose a discoverable `SKILL.md` to the generic installer. Its official Python package, `graphifyy==0.9.77`, was installed using `uv tool install`, then registered with `graphify install --platform agents --project`. This officially supported Agent Skills format is discovered by Codex. Eight reference files accompany the skill.
- Third-party examples in `.agents/` are excluded from Astro’s TypeScript check and Prettier. Application source and npm dependencies were not changed.

## Graphify runtime

The CLI is available at `/workspace/.tools/bin/graphify`; its isolated environment is in `/workspace/.tools/uv`. To install or refresh the same version:

```sh
UV_TOOL_DIR=/workspace/.tools/uv \
UV_TOOL_BIN_DIR=/workspace/.tools/bin \
UV_CACHE_DIR=/workspace/.cache/uv \
uv tool install graphifyy==0.9.77

/workspace/.tools/bin/graphify install --platform agents --project
```

Use the absolute CLI path in this cloud environment, or add `/workspace/.tools/bin` to your shell’s PATH. The optional MCP executable is installed but no MCP server has been connected to this chat.

## Verify and preserve

```sh
npm --cache /workspace/.cache/npm exec --yes --package=skills@1.7.0 -- skills list --agent codex
npm run check
```

Keep `.agents/skills/`, `skills-lock.json` and this document in version control or the published environment snapshot. Installing files does not guarantee that an already-open chat refreshes its skill catalog; the files can be read directly, and a new task can discover them. Skill-specific external services and API credentials are configured separately when needed.

## Inventory

### Graphify-Labs/graphify

- [graphify](.agents/skills/graphify/SKILL.md)

### JuliusBrussee/caveman

- [cavecrew](.agents/skills/cavecrew/SKILL.md)
- [caveman](.agents/skills/caveman/SKILL.md)
- [caveman-commit](.agents/skills/caveman-commit/SKILL.md)
- [caveman-compress](.agents/skills/caveman-compress/SKILL.md)
- [caveman-discover](.agents/skills/caveman-discover/SKILL.md)
- [caveman-evidence-review](.agents/skills/caveman-evidence-review/SKILL.md)
- [caveman-explore](.agents/skills/caveman-explore/SKILL.md)
- [caveman-help](.agents/skills/caveman-help/SKILL.md)
- [caveman-learn](.agents/skills/caveman-learn/SKILL.md)
- [caveman-manage](.agents/skills/caveman-manage/SKILL.md)
- [caveman-optimize](.agents/skills/caveman-optimize/SKILL.md)
- [caveman-review](.agents/skills/caveman-review/SKILL.md)
- [caveman-setup](.agents/skills/caveman-setup/SKILL.md)
- [caveman-stats](.agents/skills/caveman-stats/SKILL.md)
- [investigate-first](.agents/skills/investigate-first/SKILL.md)
- [lean-build](.agents/skills/lean-build/SKILL.md)
- [megacave](.agents/skills/megacave/SKILL.md)
- [migration](.agents/skills/migration/SKILL.md)
- [safe-refactor](.agents/skills/safe-refactor/SKILL.md)
- [surgical-patch](.agents/skills/surgical-patch/SKILL.md)
- [ultracave](.agents/skills/ultracave/SKILL.md)
- [verify-and-stop](.agents/skills/verify-and-stop/SKILL.md)

### Leonxlnx/taste-skill

- [brandkit](.agents/skills/brandkit/SKILL.md)
- [design-taste-frontend](.agents/skills/design-taste-frontend/SKILL.md)
- [design-taste-frontend-v1](.agents/skills/design-taste-frontend-v1/SKILL.md)
- [full-output-enforcement](.agents/skills/full-output-enforcement/SKILL.md)
- [gpt-taste](.agents/skills/gpt-taste/SKILL.md)
- [high-end-visual-design](.agents/skills/high-end-visual-design/SKILL.md)
- [image-to-code](.agents/skills/image-to-code/SKILL.md)
- [imagegen-frontend-mobile](.agents/skills/imagegen-frontend-mobile/SKILL.md)
- [imagegen-frontend-web](.agents/skills/imagegen-frontend-web/SKILL.md)
- [industrial-brutalist-ui](.agents/skills/industrial-brutalist-ui/SKILL.md)
- [minimalist-ui](.agents/skills/minimalist-ui/SKILL.md)
- [redesign-existing-projects](.agents/skills/redesign-existing-projects/SKILL.md)
- [stitch-design-taste](.agents/skills/stitch-design-taste/SKILL.md)

### addyosmani/agent-skills

- [addyosmani-test-driven-development](.agents/skills/addyosmani-test-driven-development/SKILL.md)
- [api-and-interface-design](.agents/skills/api-and-interface-design/SKILL.md)
- [browser-testing-with-devtools](.agents/skills/browser-testing-with-devtools/SKILL.md)
- [ci-cd-and-automation](.agents/skills/ci-cd-and-automation/SKILL.md)
- [code-review-and-quality](.agents/skills/code-review-and-quality/SKILL.md)
- [code-simplification](.agents/skills/code-simplification/SKILL.md)
- [constraint-driven-development](.agents/skills/constraint-driven-development/SKILL.md)
- [context-engineering](.agents/skills/context-engineering/SKILL.md)
- [debugging-and-error-recovery](.agents/skills/debugging-and-error-recovery/SKILL.md)
- [deprecation-and-migration](.agents/skills/deprecation-and-migration/SKILL.md)
- [documentation-and-adrs](.agents/skills/documentation-and-adrs/SKILL.md)
- [doubt-driven-development](.agents/skills/doubt-driven-development/SKILL.md)
- [frontend-ui-engineering](.agents/skills/frontend-ui-engineering/SKILL.md)
- [git-workflow-and-versioning](.agents/skills/git-workflow-and-versioning/SKILL.md)
- [idea-refine](.agents/skills/idea-refine/SKILL.md)
- [incremental-implementation](.agents/skills/incremental-implementation/SKILL.md)
- [interview-me](.agents/skills/interview-me/SKILL.md)
- [observability-and-instrumentation](.agents/skills/observability-and-instrumentation/SKILL.md)
- [performance-optimization](.agents/skills/performance-optimization/SKILL.md)
- [planning-and-task-breakdown](.agents/skills/planning-and-task-breakdown/SKILL.md)
- [security-and-hardening](.agents/skills/security-and-hardening/SKILL.md)
- [shipping-and-launch](.agents/skills/shipping-and-launch/SKILL.md)
- [source-driven-development](.agents/skills/source-driven-development/SKILL.md)
- [spec-driven-development](.agents/skills/spec-driven-development/SKILL.md)
- [using-agent-skills](.agents/skills/using-agent-skills/SKILL.md)

### anthropics/skills

- [academy-guide](.agents/skills/academy-guide/SKILL.md)
- [algorithmic-art](.agents/skills/algorithmic-art/SKILL.md)
- [brand-guidelines](.agents/skills/brand-guidelines/SKILL.md)
- [canvas-design](.agents/skills/canvas-design/SKILL.md)
- [claude-api](.agents/skills/claude-api/SKILL.md)
- [discernment-nudge](.agents/skills/discernment-nudge/SKILL.md)
- [doc-coauthoring](.agents/skills/doc-coauthoring/SKILL.md)
- [docx](.agents/skills/docx/SKILL.md)
- [frontend-design](.agents/skills/frontend-design/SKILL.md)
- [internal-comms](.agents/skills/internal-comms/SKILL.md)
- [mcp-builder](.agents/skills/mcp-builder/SKILL.md)
- [pdf](.agents/skills/pdf/SKILL.md)
- [pptx](.agents/skills/pptx/SKILL.md)
- [skill-creator](.agents/skills/skill-creator/SKILL.md)
- [slack-gif-creator](.agents/skills/slack-gif-creator/SKILL.md)
- [template-skill](.agents/skills/template-skill/SKILL.md)
- [theme-factory](.agents/skills/theme-factory/SKILL.md)
- [web-artifacts-builder](.agents/skills/web-artifacts-builder/SKILL.md)
- [webapp-testing](.agents/skills/webapp-testing/SKILL.md)
- [xlsx](.agents/skills/xlsx/SKILL.md)

### mattpocock/skills

- [ask-matt](.agents/skills/ask-matt/SKILL.md)
- [chief-of-staff](.agents/skills/chief-of-staff/SKILL.md)
- [claude-handoff](.agents/skills/claude-handoff/SKILL.md)
- [code-review](.agents/skills/code-review/SKILL.md)
- [codebase-design](.agents/skills/codebase-design/SKILL.md)
- [diagnosing-bugs](.agents/skills/diagnosing-bugs/SKILL.md)
- [domain-modeling](.agents/skills/domain-modeling/SKILL.md)
- [git-guardrails-claude-code](.agents/skills/git-guardrails-claude-code/SKILL.md)
- [grill-me](.agents/skills/grill-me/SKILL.md)
- [grill-with-docs](.agents/skills/grill-with-docs/SKILL.md)
- [grilling](.agents/skills/grilling/SKILL.md)
- [handoff](.agents/skills/handoff/SKILL.md)
- [implement](.agents/skills/implement/SKILL.md)
- [implement-spec](.agents/skills/implement-spec/SKILL.md)
- [improve-codebase-architecture](.agents/skills/improve-codebase-architecture/SKILL.md)
- [loop-me](.agents/skills/loop-me/SKILL.md)
- [migrate-to-shoehorn](.agents/skills/migrate-to-shoehorn/SKILL.md)
- [pr](.agents/skills/pr/SKILL.md)
- [prototype](.agents/skills/prototype/SKILL.md)
- [research](.agents/skills/research/SKILL.md)
- [retro](.agents/skills/retro/SKILL.md)
- [scaffold-exercises](.agents/skills/scaffold-exercises/SKILL.md)
- [setup-matt-pocock-skills](.agents/skills/setup-matt-pocock-skills/SKILL.md)
- [setup-pre-commit](.agents/skills/setup-pre-commit/SKILL.md)
- [setup-ts-deep-modules](.agents/skills/setup-ts-deep-modules/SKILL.md)
- [tdd](.agents/skills/tdd/SKILL.md)
- [teach](.agents/skills/teach/SKILL.md)
- [to-questionnaire](.agents/skills/to-questionnaire/SKILL.md)
- [to-spec](.agents/skills/to-spec/SKILL.md)
- [to-tickets](.agents/skills/to-tickets/SKILL.md)
- [triage](.agents/skills/triage/SKILL.md)
- [wait-what](.agents/skills/wait-what/SKILL.md)
- [wayfinder](.agents/skills/wayfinder/SKILL.md)
- [wizard](.agents/skills/wizard/SKILL.md)
- [writing-beats](.agents/skills/writing-beats/SKILL.md)
- [writing-for-agents](.agents/skills/writing-for-agents/SKILL.md)
- [writing-fragments](.agents/skills/writing-fragments/SKILL.md)
- [writing-shape](.agents/skills/writing-shape/SKILL.md)

### multica-ai/andrej-karpathy-skills

- [karpathy-guidelines](.agents/skills/karpathy-guidelines/SKILL.md)

### nextlevelbuilder/ui-ux-pro-max-skill

- [banner-design](.agents/skills/banner-design/SKILL.md)
- [brand](.agents/skills/brand/SKILL.md)
- [design](.agents/skills/design/SKILL.md)
- [design-system](.agents/skills/design-system/SKILL.md)
- [slides](.agents/skills/slides/SKILL.md)
- [ui-styling](.agents/skills/ui-styling/SKILL.md)
- [ui-ux-pro-max](.agents/skills/ui-ux-pro-max/SKILL.md)

### obra/superpowers

- [brainstorming](.agents/skills/brainstorming/SKILL.md)
- [diagnosing-superpowers](.agents/skills/diagnosing-superpowers/SKILL.md)
- [dispatching-parallel-agents](.agents/skills/dispatching-parallel-agents/SKILL.md)
- [executing-plans](.agents/skills/executing-plans/SKILL.md)
- [finishing-a-development-branch](.agents/skills/finishing-a-development-branch/SKILL.md)
- [receiving-code-review](.agents/skills/receiving-code-review/SKILL.md)
- [requesting-code-review](.agents/skills/requesting-code-review/SKILL.md)
- [subagent-driven-development](.agents/skills/subagent-driven-development/SKILL.md)
- [systematic-debugging](.agents/skills/systematic-debugging/SKILL.md)
- [test-driven-development](.agents/skills/test-driven-development/SKILL.md)
- [using-git-worktrees](.agents/skills/using-git-worktrees/SKILL.md)
- [using-superpowers](.agents/skills/using-superpowers/SKILL.md)
- [verification-before-completion](.agents/skills/verification-before-completion/SKILL.md)
- [writing-plans](.agents/skills/writing-plans/SKILL.md)
- [writing-skills](.agents/skills/writing-skills/SKILL.md)
