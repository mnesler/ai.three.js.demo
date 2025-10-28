# Three.js Card Game Demo - Technical Specification

## Project Overview
A 3D multiplayer card game demo using Three.js and TypeScript, featuring smooth camera transitions, dynamic card interactions, and real-time card rendering from Scryfall API.

## Technical Requirements
- **Framework**: Three.js
- **Language**: TypeScript
- **Performance**: 60 FPS target
- **Card Source**: Scryfall.com API (random cards)
- **Max Cards**: Up to 100 cards rendered simultaneously
- **Browser Compatibility**: Modern browsers with WebGL support

## Architecture
- **3D Scene**: Square table as playing surface
- **Players**: 4 players, each with their own perspective
- **Camera**: Fixed positions with smooth transitions between player POVs
- **Card Interactions**: Hover effects with dynamic 3D transformations

---

## Story Breakdown

### Story 1: Basic Scene Setup & Performance Monitoring
**Goal**: Establish the foundation with a basic 3D scene and FPS counter

**Tasks**:
- [ ] Initialize Three.js project with TypeScript configuration
- [ ] Create basic scene with camera, renderer, and lighting
- [ ] Implement FPS counter/stats display (using stats.js or custom solution)
- [ ] Setup WebGL renderer with performance optimization flags
- [ ] Add basic ambient and directional lighting
- [ ] Verify 60 FPS baseline performance
- [ ] Setup responsive canvas that fills the viewport

**Acceptance Criteria**:
- FPS meter visible on screen
- Scene renders at consistent 60 FPS
- TypeScript compilation works without errors

---

### Story 2: Table and Environment Setup
**Goal**: Create the playing environment with a square table

**Tasks**:
- [ ] Model a square table using Three.js geometry (PlaneGeometry or BoxGeometry)
- [ ] Add table texture/material (felt-like surface)
- [ ] Position table at scene center
- [ ] Add table edges/borders for visual definition
- [ ] Setup scene background (gradient or solid color)
- [ ] Add subtle shadows to table surface
- [ ] Optimize table geometry for performance

**Acceptance Criteria**:
- Square table visible in center of scene
- Table has appropriate scale and proportions
- Maintains 60 FPS with table rendered

---

### Story 3: Camera System with Player POV Switching
**Goal**: Implement fixed camera positions for 4 players with smooth transitions

**Tasks**:
- [ ] Define 4 camera positions around the table (North, East, South, West)
- [ ] Create camera positioning logic for each player POV
- [ ] Implement smooth camera transition using GSAP or Three.js Tween
- [ ] Add UI button to cycle through player POVs
- [ ] Calculate proper camera look-at targets for each position
- [ ] Add easing curves for smooth, natural camera movement
- [ ] Ensure camera transitions maintain 60 FPS

**Acceptance Criteria**:
- 4 distinct camera positions available
- Button successfully cycles through positions
- Camera transitions are smooth and take 1-2 seconds
- Performance remains at 60 FPS during transitions

---

### Story 4: Scryfall API Integration
**Goal**: Integrate Scryfall API to fetch random card data

**Tasks**:
- [ ] Research Scryfall API documentation for random card endpoint
- [ ] Create TypeScript interfaces for Scryfall card data
- [ ] Implement API client service for fetching random cards
- [ ] Add error handling and retry logic
- [ ] Implement card image loading and caching
- [ ] Create utility to batch fetch multiple random cards
- [ ] Handle CORS and API rate limiting
- [ ] Add loading states for card data

**Acceptance Criteria**:
- Successfully fetch random cards from Scryfall API
- Card data properly typed with TypeScript
- Images load and cache correctly
- Graceful error handling for API failures

---

### Story 5: 3D Card Rendering System
**Goal**: Create 3D card objects with textures from Scryfall

**Tasks**:
- [ ] Create card geometry (thin BoxGeometry for 3D card)
- [ ] Implement texture loading from Scryfall image URLs
- [ ] Create card material with front face texture
- [ ] Add card back texture/material
- [ ] Build Card class/component for reusable card objects
- [ ] Implement card positioning system on table
- [ ] Add multiple card rendering (test with 10, 50, 100 cards)
- [ ] Optimize texture resolution for performance
- [ ] Implement texture atlas or instancing if needed for performance

**Acceptance Criteria**:
- Individual cards render as 3D objects
- Card textures load from Scryfall images
- Can render up to 100 cards while maintaining 60 FPS
- Cards have proper proportions (standard card ratio)

---

### Story 6: Card Hover Interaction System
**Goal**: Implement dynamic 3D effects when hovering over cards

**Tasks**:
- [ ] Implement raycasting for mouse-card intersection detection
- [ ] Create hover state management for cards
- [ ] Add 3D hover effect (lift card, slight rotation)
- [ ] Animate z-axis elevation for selected card (bring to front)
- [ ] Add smooth transitions for hover in/out
- [ ] Implement de-selection when mouse leaves card
- [ ] Add subtle glow or highlight effect on hover
- [ ] Ensure only one card can be selected at a time
- [ ] Optimize raycasting for 100 card performance

**Acceptance Criteria**:
- Hovering over a card triggers smooth 3D transformation
- Selected card moves to highest z-axis (above all others)
- Hover effects are smooth and performant
- Maintains 60 FPS with 100 cards and hover interactions

---

### Story 7: Card Distribution & Game Layout
**Goal**: Position cards appropriately for 4-player layout

**Tasks**:
- [ ] Create layout system for distributing cards to 4 players
- [ ] Implement hand positioning (fan-out effect for each player)
- [ ] Add table center area for shared/played cards
- [ ] Create card arrangement algorithms (grid, fan, pile)
- [ ] Ensure cards face correct direction relative to player POV
- [ ] Add spacing and overlap logic for card collections
- [ ] Implement dynamic repositioning when cards added/removed

**Acceptance Criteria**:
- Cards distributed to 4 player positions around table
- Each player's cards visible from their POV
- Cards arranged in organized, readable layout
- Performance maintained with full card distribution

---

### Story 8: Polish & Optimization
**Goal**: Final touches and performance optimization

**Tasks**:
- [ ] Implement frustum culling for off-screen cards
- [ ] Add LOD (Level of Detail) for distant cards if needed
- [ ] Optimize shadow rendering
- [ ] Add anti-aliasing settings
- [ ] Implement object pooling for card instances
- [ ] Profile and optimize texture memory usage
- [ ] Add loading screen for initial asset loading
- [ ] Optimize raycasting with bounding volumes
- [ ] Add visual polish (reflections, subtle animations)
- [ ] Test across different browsers and devices

**Acceptance Criteria**:
- Consistent 60 FPS with 100 cards and all interactions
- Smooth performance across Chrome, Firefox, Safari
- Optimized memory usage
- Professional visual quality

---

## Technical Notes

### Performance Considerations
- Use `WebGLRenderer` with `antialias` and `powerPreference: "high-performance"`
- Implement texture compression where possible
- Use `THREE.InstancedMesh` for multiple identical cards if applicable
- Minimize draw calls through geometry batching
- Disable shadows on cards if performance issues arise

### Card Dimensions
- Standard playing card ratio: 2.5" x 3.5" (or 63mm x 88mm)
- Three.js units: Recommend 2.5 x 3.5 x 0.1 for thickness

### Camera Transition
- Recommended easing: `easeInOutCubic` or `easeInOutQuad`
- Transition duration: 1.5-2 seconds
- Consider using GSAP or @tweenjs/tween.js

### Scryfall API Endpoints
- Random card: `https://api.scryfall.com/cards/random`
- Bulk random: Multiple calls to random endpoint
- Image quality: Use "normal" or "large" size for performance

---

## Development Phases

### Phase 1: Foundation (Stories 1-2)
Basic scene, performance monitoring, and environment

### Phase 2: Core Interaction (Stories 3-4)
Camera system and API integration

### Phase 3: Card System (Stories 5-6)
Card rendering and hover interactions

### Phase 4: Game Layout & Polish (Stories 7-8)
Card distribution and final optimization

---

## Future Enhancements (Out of Scope)
- Card flip animations
- Multiplayer networking
- Game logic implementation
- Card dragging and dropping
- Sound effects
- Mobile touch controls
- VR support
