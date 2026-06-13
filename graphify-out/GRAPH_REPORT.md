# Graph Report - .  (2026-06-12)

## Corpus Check
- Corpus is ~18,387 words - fits in a single context window. You may not need a graph.

## Summary
- 182 nodes · 224 edges · 23 communities (13 shown, 10 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.89)
- Token cost: 18,500 input · 3,200 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Space Portfolio Page & Scroll UX|Space Portfolio Page & Scroll UX]]
- [[_COMMUNITY_3D Orbital Shader Pipeline|3D Orbital Shader Pipeline]]
- [[_COMMUNITY_TypeScript Compiler Config|TypeScript Compiler Config]]
- [[_COMMUNITY_Dev Dependencies & Tooling|Dev Dependencies & Tooling]]
- [[_COMMUNITY_3D Canvas & Space Background|3D Canvas & Space Background]]
- [[_COMMUNITY_Animation & Runtime Dependencies|Animation & Runtime Dependencies]]
- [[_COMMUNITY_UI Components & Glassmorphism|UI Components & Glassmorphism]]
- [[_COMMUNITY_Bento Grid & Projects Showcase|Bento Grid & Projects Showcase]]
- [[_COMMUNITY_App Layout & Typography|App Layout & Typography]]
- [[_COMMUNITY_Brand Identity & Logo|Brand Identity & Logo]]
- [[_COMMUNITY_Next.js Config & Static Export|Next.js Config & Static Export]]
- [[_COMMUNITY_Project Documentation|Project Documentation]]
- [[_COMMUNITY_TypeScript Path Aliases|TypeScript Path Aliases]]
- [[_COMMUNITY_CICD Deploy Pipeline|CI/CD Deploy Pipeline]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_PostCSS Configuration|PostCSS Configuration]]
- [[_COMMUNITY_Globe Icon Asset|Globe Icon Asset]]
- [[_COMMUNITY_Next.js Branding Asset|Next.js Branding Asset]]
- [[_COMMUNITY_Vercel Branding Asset|Vercel Branding Asset]]
- [[_COMMUNITY_Package Manifest Root|Package Manifest Root]]
- [[_COMMUNITY_File Icon Asset|File Icon Asset]]
- [[_COMMUNITY_Window Icon Asset|Window Icon Asset]]
- [[_COMMUNITY_Claude Settings|Claude Settings]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Home()` - 11 edges
3. `Planet()` - 9 edges
4. `OrbitalSystem()` - 7 edges
5. `AboutMe()` - 7 edges
6. `useScrollThreshold()` - 7 edges
7. `SpaceBackground()` - 6 edges
8. `BentoGrid()` - 6 edges
9. `MagneticButton()` - 6 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Portfolio Favicon (KS Compass/Crosshair)` --semantically_similar_to--> `KS Monogram Logo`  [INFERRED] [semantically similar]
  src/app/icon.png → logo.png
- `KS Monogram Portfolio Logo (public)` --semantically_similar_to--> `KS Monogram Logo`  [INFERRED] [semantically similar]
  public/logo.png → logo.png
- `SpaceBackground()` --shares_data_with--> `OrbitalSystem()`  [INFERRED]
  src/components/3d/SpaceBackground.tsx → src/components/3d/OrbitalSystem.tsx
- `CustomCursor()` --semantically_similar_to--> `MagneticButton()`  [INFERRED] [semantically similar]
  src/components/ui/CustomCursor.tsx → src/components/ui/MagneticButton.tsx
- `TextScramble()` --semantically_similar_to--> `Typewriter()`  [INFERRED] [semantically similar]
  src/components/ui/TextScramble.tsx → src/components/ui/Typewriter.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **WebGL 3D Scene Composition (Canvas + OrbitalSystem + SpaceBackground + Camera)** — 3d_canvascontainer_canvascontainer, 3d_orbitalsystem_orbitalsystem, 3d_spacebackground_spacebackground, 3d_canvascontainer_camerarig, hooks_useresponsivecamera_useresponsivecamera [EXTRACTED 0.95]
- **Portfolio Page Sections (Hero, AboutMe, BentoGrid, Experience, Education, Contact)** — app_page_home, ui_hero_hero, ui_aboutme_aboutme, ui_bentogrid_bentogrid, ui_experience_experience, ui_education_education, ui_contact_contact [EXTRACTED 1.00]
- **Planet Shader Pipeline (vertex + fragment + atmosphere + noise)** — 3d_orbitalsystem_planetvertex, 3d_orbitalsystem_planetfragment, 3d_orbitalsystem_atmovertex, 3d_orbitalsystem_atmofragment, 3d_orbitalsystem_noise_glsl [EXTRACTED 0.95]
- **Build and Deploy Pipeline** — workflows_deploy_deploy_workflow, workflows_deploy_static_export, tsconfig_typescript_config [INFERRED 0.85]

## Communities (23 total, 10 thin omitted)

### Community 0 - "Space Portfolio Page & Scroll UX"
Cohesion: 0.12
Nodes (18): CanvasContainer, Home(), Scroll-Driven Animation Pattern (framer-motion useScroll/useTransform), Space-Themed Portfolio Architecture, Passive Scroll Event Listener, requestAnimationFrame Scroll Debounce Pattern, useScrollThreshold(), Contact() (+10 more)

### Community 1 - "3D Orbital Shader Pipeline"
Cohesion: 0.15
Nodes (21): atmoFragment Shader, atmoVertex Shader, CentralStar(), INITIAL_LIGHT_DIR, Moon(), moonFragment Shader, MoonLabel(), NOISE_GLSL (Shared GLSL helpers) (+13 more)

### Community 2 - "TypeScript Compiler Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 3 - "Dev Dependencies & Tooling"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 4 - "3D Canvas & Space Background"
Cohesion: 0.21
Nodes (12): CameraRig(), CanvasContainer(), CosmicRay, drawStaticScene(), hexToRgba(), Mote, pickStarColor(), SpaceBackground() (+4 more)

### Community 5 - "Animation & Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, clsx, framer-motion, framer-motion-3d, gsap, next, postprocessing, react (+7 more)

### Community 6 - "UI Components & Glassmorphism"
Cohesion: 0.22
Nodes (10): Glassmorphism UI Pattern (glass-panel), AboutMe(), processText(), Word(), Hero(), TextScramble(), TextScrambleProps, Mode (+2 more)

### Community 7 - "Bento Grid & Projects Showcase"
Cohesion: 0.31
Nodes (8): BentoGrid(), cardVariants, containerVariants, ProjectCard(), PROJECTS, ProjectModal(), ProjectModalProps, TABS

### Community 8 - "App Layout & Typography"
Cohesion: 0.25
Nodes (7): fraunces, geist, metadata, plexMono, RootLayout(), sora, LoadingScreen()

### Community 9 - "Brand Identity & Logo"
Cohesion: 0.29
Nodes (7): Portfolio Favicon (KS Compass/Crosshair), Personal Brand Identity (KS Initials), KS Monogram Logo, Minimalist Technical Circular Badge Style, Circular Frame with Dashed Border, Crosshair/Compass Lines Design, KS Monogram Portfolio Logo (public)

### Community 11 - "Project Documentation"
Cohesion: 0.67
Nodes (3): Geist Font via next/font, Next.js Portfolio Project, Portfolio README

### Community 12 - "TypeScript Path Aliases"
Cohesion: 0.67
Nodes (3): Next.js TypeScript Plugin, @/* Path Alias to src/*, TypeScript Compiler Config

### Community 13 - "CI/CD Deploy Pipeline"
Cohesion: 0.67
Nodes (3): GitHub Actions Deploy Workflow, GitHub Pages Deployment Target, Next.js Static Export (./out)

## Knowledge Gaps
- **101 isolated node(s):** `eslintConfig`, `name`, `version`, `private`, `dev` (+96 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Home()` connect `Space Portfolio Page & Scroll UX` to `3D Canvas & Space Background`, `UI Components & Glassmorphism`, `Bento Grid & Projects Showcase`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `CanvasContainer()` connect `3D Canvas & Space Background` to `Space Portfolio Page & Scroll UX`, `3D Orbital Shader Pipeline`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `OrbitalSystem()` connect `3D Orbital Shader Pipeline` to `3D Canvas & Space Background`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `name`, `version` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Space Portfolio Page & Scroll UX` be split into smaller, more focused modules?**
  _Cohesion score 0.11692307692307692 - nodes in this community are weakly interconnected._
- **Should `3D Orbital Shader Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.1471861471861472 - nodes in this community are weakly interconnected._
- **Should `TypeScript Compiler Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._