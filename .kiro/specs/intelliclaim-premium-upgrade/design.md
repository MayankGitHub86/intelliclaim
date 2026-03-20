# IntelliClaim Premium Upgrade - Design Document

## Overview

### Purpose

This design document outlines the technical architecture and implementation approach for transforming IntelliClaim from a functional AI claims platform into an ultra-premium, Awwwards-caliber experience. The upgrade introduces 3D interactions, immersive storytelling, and next-generation insurtech aesthetics while maintaining the existing functionality and performance standards.

### Scope

The design covers:
- Migration from Vite to Next.js 15+ with App Router
- Integration of React Three Fiber for 3D experiences
- Implementation of Framer Motion for scroll-driven animations
- Glassmorphism design system with dynamic theming
- Real-time collaboration and enterprise features
- Performance optimization strategies for 3D content
- Accessibility compliance (WCAG 2.2 AA)

### Design Principles

1. **Progressive Enhancement**: Core functionality works without 3D, enhanced experience for capable devices
2. **Performance First**: Maintain <1.2s LCP and 60fps despite premium features
3. **Accessibility by Default**: All interactions keyboard-navigable, screen reader compatible
4. **Device-Adaptive**: Quality tiers based on device capabilities
5. **Graceful Degradation**: Fallbacks for unsupported features
6. **Maintainability**: Component-driven architecture with clear separation of concerns

### Technology Stack

**Frontend Core:**
- Next.js 15+ (App Router, Server Components, Server Actions)
- React 19+ (with Suspense, Transitions)
- TypeScript 5.3+ (strict mode)

**3D & Animation:**
- @react-three/fiber 8.15+ (React Three.js integration)
- @react-three/drei 9.92+ (helpers, controls, abstractions)
- @react-three/postprocessing 2.16+ (bloom, SSAO, DOF effects)
- Framer Motion 12+ (animations, scroll effects)
- Three.js 0.160+ (WebGL rendering)

**UI & Styling:**
- Tailwind CSS v4 (utility-first styling)
- shadcn/ui (component library)
- Radix UI (accessible primitives)

**State Management:**
- Zustand 4.4+ (global state)
- TanStack Query 5.17+ (server state, caching)
- TanStack Table 8.11+ (data tables)
- TanStack Virtual 3.0+ (virtualization)

**Real-time & Data:**
- WebSocket (Socket.io or native)
- Server-Sent Events (progress streaming)
- IndexedDB (offline storage)

**Testing & Quality:**
- Vitest (unit tests)
- Playwright (E2E tests)
- Storybook (component documentation)
- Lighthouse CI (performance monitoring)

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js App Router                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Server     │  │   Client     │  │   Shared     │ │ │
│  │  │  Components  │  │  Components  │  │  Components  │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              3D Rendering Layer                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │  R3F Canvas  │  │  Three.js    │  │ Post-        │ │ │
│  │  │  Components  │  │  Renderer    │  │ Processing   │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              State Management Layer                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Zustand    │  │   TanStack   │  │   IndexedDB  │ │ │
│  │  │   Stores     │  │   Query      │  │   Cache      │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Services                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              FastAPI Backend                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   REST API   │  │  WebSocket   │  │     SSE      │ │ │
│  │  │   Endpoints  │  │   Server     │  │   Streams    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              AI/CV Services                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Gemini AI  │  │   YOLOv8n    │  │    SHAP      │ │ │
│  │  │   Service    │  │   Service    │  │   Explainer  │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Application Structure


```
app/
├── (marketing)/              # Public pages
│   ├── page.tsx             # Landing page with 3D hero
│   ├── layout.tsx           # Marketing layout
│   └── components/          # Landing-specific components
│       ├── HeroSection3D.tsx
│       ├── ParticleNebula.tsx
│       ├── ScrollStory.tsx
│       └── FeatureShowcase3D.tsx
├── (dashboard)/             # Authenticated pages
│   ├── dashboard/
│   │   ├── page.tsx        # Main dashboard
│   │   └── components/
│   │       ├── MetricsOrbs3D.tsx
│   │       ├── TimelineCanvas.tsx
│   │       └── DataConstellation.tsx
│   ├── claims/
│   │   ├── [id]/
│   │   │   └── page.tsx    # Claim detail
│   │   └── components/
│   │       ├── DocumentViewer3D.tsx
│   │       ├── DamageInspector3D.tsx
│   │       └── AIExtractionViz.tsx
│   ├── workflows/
│   │   └── builder/
│   │       └── page.tsx    # Workflow builder
│   └── analytics/
│       └── page.tsx        # Analytics dashboard
├── api/                     # API routes
│   ├── claims/
│   ├── documents/
│   └── websocket/
└── components/              # Shared components
    ├── ui/                  # shadcn/ui components
    ├── 3d/                  # Reusable 3D components
    │   ├── Canvas.tsx
    │   ├── Scene.tsx
    │   ├── Camera.tsx
    │   └── Effects.tsx
    ├── animations/          # Framer Motion components
    │   ├── ScrollReveal.tsx
    │   ├── SpringButton.tsx
    │   └── PageTransition.tsx
    └── layout/              # Layout components
        ├── Header.tsx
        ├── Sidebar.tsx
        └── Footer.tsx
```

### Component Architecture

**Layered Component Structure:**

1. **Page Components** (app/*/page.tsx)
   - Server Components by default
   - Handle data fetching
   - Compose layout and features
   - Pass data to client components

2. **Feature Components** (app/*/components/)
   - Client Components for interactivity
   - Encapsulate business logic
   - Manage local state
   - Emit events to parent

3. **UI Components** (components/ui/)
   - Presentational components
   - Reusable across features
   - Styled with Tailwind
   - Accessible by default

4. **3D Components** (components/3d/)
   - React Three Fiber components
   - Encapsulate 3D logic
   - Performance optimized
   - Device-adaptive quality

### Data Flow Architecture

**Server → Client Flow:**
```
Server Component (RSC)
  ↓ (fetch data)
Database/API
  ↓ (serialize)
Client Component
  ↓ (hydrate)
TanStack Query Cache
  ↓ (subscribe)
UI Components
```

**Client State Flow:**
```
User Interaction
  ↓
Event Handler
  ↓
Zustand Store Update
  ↓
Component Re-render
  ↓
3D Scene Update (if needed)
```

**Real-time Flow:**
```
Backend Event
  ↓
WebSocket/SSE
  ↓
Client Event Listener
  ↓
Zustand Store Update
  ↓
Optimistic UI Update
  ↓
Background Sync
```

### Performance Architecture

**Progressive Loading Strategy:**

1. **Critical Path** (0-1s):
   - HTML shell (Server Component)
   - Critical CSS (inline)
   - Minimal JS bundle (<50KB)
   - Above-fold content

2. **Interactive** (1-2s):
   - Hydration complete
   - Event handlers attached
   - Basic interactions work
   - 2D fallbacks ready

3. **Enhanced** (2-3s):
   - 3D libraries loaded
   - Canvas initialized
   - Low-poly models loaded
   - Basic animations active

4. **Full Experience** (3-5s):
   - High-poly models loaded
   - Textures streamed
   - Post-processing active
   - All features available

**Device Tier Detection:**

```typescript
enum DeviceTier {
  LOW = 'low',      // <2GB RAM, integrated GPU, mobile
  MEDIUM = 'medium', // 2-8GB RAM, mid-range GPU
  HIGH = 'high'      // >8GB RAM, dedicated GPU
}

interface QualitySettings {
  particleCount: number;
  shadowQuality: 'off' | 'low' | 'medium' | 'high';
  postProcessing: boolean;
  textureResolution: 512 | 1024 | 2048;
  modelLOD: 'low' | 'medium' | 'high';
  targetFPS: 30 | 60;
}
```

---

## Components and Interfaces

### Core 3D Components

#### Canvas Wrapper

**Purpose**: Provides configured R3F Canvas with performance optimizations

```typescript
interface CanvasWrapperProps {
  children: React.ReactNode;
  camera?: CameraConfig;
  shadows?: boolean;
  dpr?: number | [number, number];
  performance?: PerformanceConfig;
  fallback?: React.ReactNode;
}

interface CameraConfig {
  position?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
}

interface PerformanceConfig {
  min?: number; // minimum pixel ratio
  max?: number; // maximum pixel ratio
  debounce?: number; // resize debounce
  regress?: boolean; // reduce quality when moving
}
```

**Key Features:**
- Automatic device tier detection
- Dynamic pixel ratio adjustment
- Frustum culling enabled
- Tone mapping configured
- Error boundary with 2D fallback

#### Scene Manager

**Purpose**: Manages 3D scene lifecycle, lighting, and environment

```typescript
interface SceneManagerProps {
  children: React.ReactNode;
  environment?: 'studio' | 'sunset' | 'night' | 'custom';
  lighting?: LightingConfig;
  fog?: FogConfig;
  background?: BackgroundConfig;
}

interface LightingConfig {
  ambient?: { intensity: number; color: string };
  directional?: { intensity: number; position: [number, number, number] };
  point?: Array<{ intensity: number; position: [number, number, number]; color: string }>;
}
```

#### Particle System

**Purpose**: Reusable particle effects for nebula, trails, bursts

```typescript
interface ParticleSystemProps {
  count: number;
  size: number;
  color: string | string[];
  speed: number;
  spread: number;
  shape: 'sphere' | 'box' | 'cone' | 'ring';
  behavior: 'float' | 'flow' | 'burst' | 'orbit';
  lifespan?: number;
  respawn?: boolean;
}
```

**Implementation Notes:**
- Use instanced mesh for performance
- GPU-based particle simulation
- Texture atlas for particle sprites
- Culling for off-screen particles

### Landing Page Components

#### HeroSection3D

**Purpose**: Cinematic 3D hero with particle nebula and interactive document

```typescript
interface HeroSection3DProps {
  title: string;
  subtitle: string;
  cta: {
    primary: { text: string; href: string };
    secondary?: { text: string; href: string };
  };
  particleCount?: number;
  autoRotate?: boolean;
}
```

**Sub-components:**
- `ParticleNebula`: Background particle field
- `ClaimStars`: Floating claim orbs
- `Document3D`: Interactive document model
- `DamagedAsset3D`: Hover-revealed asset model

#### ScrollStory

**Purpose**: Scroll-driven storytelling with kinetic typography

```typescript
interface ScrollStoryProps {
  sections: StorySection[];
  scrollBehavior?: 'smooth' | 'snap';
  progressIndicator?: boolean;
}

interface StorySection {
  id: string;
  title: string;
  content: React.ReactNode;
  animation: AnimationConfig;
  background?: string;
}

interface AnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';
  duration: number;
  easing: string;
  stagger?: number;
}
```

**Key Features:**
- useScroll hook for progress tracking
- Intersection Observer for section detection
- Smooth scroll with momentum
- Keyboard navigation support

#### FeatureShowcase3D

**Purpose**: Interactive 3D feature cards with hover effects

```typescript
interface FeatureShowcase3DProps {
  features: Feature[];
  layout?: 'grid' | 'carousel' | 'masonry';
  cardStyle?: 'glass' | 'solid' | 'gradient';
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  demo?: React.ReactNode; // Mini 3D scene
  link?: string;
}
```

### Dashboard Components

#### MetricsOrbs3D

**Purpose**: Holographic metric visualization in 3D space

```typescript
interface MetricsOrbs3DProps {
  metrics: Metric[];
  layout?: 'constellation' | 'grid' | 'spiral';
  interactive?: boolean;
  onOrbClick?: (metric: Metric) => void;
}

interface Metric {
  id: string;
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color: string;
  chart?: ChartData;
}
```

**Rendering Strategy:**
- Instanced spheres for performance
- LOD based on camera distance
- Hover state with spring animation
- Click to expand mini chart

#### TimelineCanvas

**Purpose**: Spatial claims journey timeline with animated paths

```typescript
interface TimelineCanvasProps {
  stages: TimelineStage[];
  claims?: Claim[];
  activeStage?: string;
  onStageClick?: (stage: TimelineStage) => void;
}

interface TimelineStage {
  id: string;
  label: string;
  icon: string;
  position: [number, number, number];
  status: 'pending' | 'active' | 'complete' | 'failed';
  metrics: {
    count: number;
    avgDuration: number;
    successRate: number;
  };
}
```

**Key Features:**
- Bezier curve paths with particle flow
- Scroll-based navigation
- Snap points for precision
- Mobile vertical layout option

#### DataConstellation

**Purpose**: 3D force-directed graph for claim relationships

```typescript
interface DataConstellationProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  filters?: FilterConfig;
  onNodeClick?: (node: GraphNode) => void;
}

interface GraphNode {
  id: string;
  type: 'claim' | 'party' | 'document';
  data: any;
  position?: [number, number, number];
  size: number;
  color: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'similar' | 'related' | 'fraud';
  strength: number;
}
```

**Implementation:**
- Force-directed layout (d3-force-3d)
- WebGL instancing for 1000+ nodes
- Octree for spatial queries
- Cluster detection algorithm

### Document Inspector Components

#### DocumentViewer3D

**Purpose**: Interactive 3D page-flip PDF viewer

```typescript
interface DocumentViewer3DProps {
  documentUrl: string;
  pages: Page[];
  annotations?: Annotation[];
  confidenceMap?: ConfidenceHeatmap;
  onPageChange?: (page: number) => void;
}

interface Page {
  number: number;
  imageUrl: string;
  text?: string;
  extractedData?: ExtractedField[];
}

interface ConfidenceHeatmap {
  pageNumber: number;
  regions: Array<{
    bbox: [number, number, number, number];
    confidence: number;
  }>;
}
```

**Key Features:**
- Realistic page-flip physics
- Pinch-to-zoom gestures
- Annotation tools (highlight, comment)
- Confidence overlay toggle

#### DamageInspector3D

**Purpose**: 3D damage visualization with YOLO detections

```typescript
interface DamageInspector3DProps {
  imageUrl: string;
  detections: Detection[];
  modelUrl?: string; // 3D model (GLB/GLTF)
  viewMode?: '2d' | '3d' | 'split';
}

interface Detection {
  id: string;
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  severity: 'minor' | 'moderate' | 'severe';
  estimatedCost?: number;
}
```

**Rendering:**
- Textured mesh from image
- 3D bounding boxes with depth
- Severity particles
- Orbit controls
- Measurement tools

### Workflow Builder Components

#### WorkflowCanvas3D

**Purpose**: 3D workflow builder with node-based editor

```typescript
interface WorkflowCanvas3DProps {
  workflow: Workflow;
  nodeLibrary: NodeDefinition[];
  onWorkflowChange?: (workflow: Workflow) => void;
  executionState?: ExecutionState;
}

interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: Connection[];
}

interface WorkflowNode {
  id: string;
  type: string;
  position: [number, number, number];
  config: Record<string, any>;
  status?: 'pending' | 'running' | 'success' | 'error';
}

interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

**Key Features:**
- Drag-and-drop node placement
- Magnetic grid snapping
- Bezier curve connections
- Particle flow animation
- Real-time execution visualization

### Animation Components

#### SpringButton

**Purpose**: Button with spring physics and 3D effects

```typescript
interface SpringButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
  ripple?: boolean;
  tilt?: boolean;
}
```

**Animations:**
- Hover: scale + tilt + glow
- Click: scale down → up with ripple
- Loading: spinner inside button
- Success: checkmark animation

#### ScrollReveal

**Purpose**: Viewport-triggered reveal animations

```typescript
interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  once?: boolean;
}
```

#### PageTransition

**Purpose**: Smooth page transitions with shared elements

```typescript
interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'fade' | 'slide' | 'scale' | 'morph';
  duration?: number;
}
```

### UI Components (shadcn/ui based)

**Core Components:**
- `Button`: Accessible button with variants
- `Card`: Glassmorphic card container
- `Dialog`: Modal with backdrop blur
- `Dropdown`: Accessible dropdown menu
- `Input`: Form input with validation
- `Select`: Custom select with search
- `Table`: Data table with sorting/filtering
- `Toast`: Notification system
- `Tooltip`: Contextual help

**Custom Enhancements:**
- All components support glass variant
- Spring animations on interactions
- Dark/light theme support
- High contrast mode
- Keyboard navigation
- Screen reader labels

---

## Data Models

### Frontend State Models

#### User State

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'adjuster' | 'viewer';
  avatar?: string;
  preferences: UserPreferences;
  permissions: Permission[];
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  quality: 'low' | 'medium' | 'high' | 'auto';
  reducedMotion: boolean;
  language: string;
  notifications: NotificationSettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'realtime' | 'hourly' | 'daily';
}
```

#### Claim State

```typescript
interface Claim {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  type: ClaimType;
  claimant: Claimant;
  policy: Policy;
  incident: Incident;
  documents: Document[];
  timeline: TimelineEvent[];
  assessment: Assessment;
  prediction: Prediction;
  fraudScore: FraudScore;
  workflow: WorkflowState;
  metadata: ClaimMetadata;
}

type ClaimStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'pending_info'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'closed';

type ClaimType = 
  | 'auto'
  | 'home'
  | 'health'
  | 'life'
  | 'property'
  | 'liability';

interface Claimant {
  id: string;
  name: string;
  contact: ContactInfo;
  history: ClaimHistory;
}

interface Incident {
  date: string;
  location: Location;
  description: string;
  damages: Damage[];
  witnesses?: Witness[];
}

interface Damage {
  id: string;
  type: string;
  severity: 'minor' | 'moderate' | 'severe' | 'total';
  description: string;
  images: DamageImage[];
  estimatedCost: number;
  detections: YOLODetection[];
}

interface DamageImage {
  id: string;
  url: string;
  thumbnail: string;
  metadata: ImageMetadata;
  analysis: ImageAnalysis;
}

interface YOLODetection {
  id: string;
  class: string;
  confidence: number;
  bbox: BoundingBox;
  severity: 'minor' | 'moderate' | 'severe';
  estimatedCost: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

#### Document State

```typescript
interface Document {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'processing' | 'complete' | 'error';
  pages: DocumentPage[];
  extractedData: ExtractedData;
  confidence: ConfidenceScore;
  annotations: Annotation[];
}

type DocumentType = 
  | 'claim_form'
  | 'police_report'
  | 'medical_record'
  | 'invoice'
  | 'receipt'
  | 'photo'
  | 'other';

interface DocumentPage {
  number: number;
  imageUrl: string;
  text: string;
  confidence: number;
  regions: TextRegion[];
}

interface TextRegion {
  bbox: BoundingBox;
  text: string;
  confidence: number;
  type: 'text' | 'table' | 'image' | 'signature';
}

interface ExtractedData {
  fields: ExtractedField[];
  tables: ExtractedTable[];
  entities: Entity[];
}

interface ExtractedField {
  key: string;
  value: string;
  confidence: number;
  source: {
    page: number;
    bbox: BoundingBox;
  };
  validated: boolean;
  corrected?: string;
}

interface ConfidenceScore {
  overall: number;
  byPage: Record<number, number>;
  byField: Record<string, number>;
  heatmap: HeatmapData;
}

interface HeatmapData {
  page: number;
  regions: Array<{
    bbox: BoundingBox;
    confidence: number;
  }>;
}
```

#### Analytics State

```typescript
interface DashboardMetrics {
  summary: SummaryMetrics;
  trends: TrendData[];
  distribution: DistributionData;
  realtime: RealtimeMetrics;
}

interface SummaryMetrics {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  totalAmount: number;
  avgProcessingTime: number;
  fraudDetectionRate: number;
  customerSatisfaction: number;
}

interface TrendData {
  date: string;
  claims: number;
  amount: number;
  approvalRate: number;
  avgProcessingTime: number;
}

interface DistributionData {
  byType: Record<ClaimType, number>;
  byStatus: Record<ClaimStatus, number>;
  bySeverity: Record<string, number>;
  byRegion: Record<string, number>;
}

interface RealtimeMetrics {
  activeClaims: number;
  processingClaims: number;
  recentActivity: Activity[];
  alerts: Alert[];
}
```

#### Workflow State

```typescript
interface WorkflowState {
  id: string;
  name: string;
  version: number;
  nodes: WorkflowNode[];
  connections: Connection[];
  execution?: ExecutionState;
  analytics: WorkflowAnalytics;
}

interface ExecutionState {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'complete' | 'error';
  startedAt?: string;
  completedAt?: string;
  currentNode?: string;
  nodeStates: Record<string, NodeExecutionState>;
  logs: ExecutionLog[];
  variables: Record<string, any>;
}

interface NodeExecutionState {
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
}

interface WorkflowAnalytics {
  executionCount: number;
  avgDuration: number;
  successRate: number;
  errorRate: number;
  bottlenecks: Bottleneck[];
  costAnalysis: CostAnalysis;
}
```

#### 3D Scene State

```typescript
interface SceneState {
  camera: CameraState;
  controls: ControlsState;
  quality: QualitySettings;
  performance: PerformanceMetrics;
}

interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  zoom: number;
}

interface ControlsState {
  enabled: boolean;
  autoRotate: boolean;
  rotateSpeed: number;
  zoomSpeed: number;
  panSpeed: number;
}

interface QualitySettings {
  tier: DeviceTier;
  particleCount: number;
  shadowQuality: 'off' | 'low' | 'medium' | 'high';
  postProcessing: boolean;
  textureResolution: 512 | 1024 | 2048;
  modelLOD: 'low' | 'medium' | 'high';
  targetFPS: 30 | 60;
  antialiasing: boolean;
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  memory: number;
}
```

### API Request/Response Models

#### Claim Analysis Request

```typescript
interface ClaimAnalysisRequest {
  claimId: string;
  documents: File[];
  options?: {
    extractText: boolean;
    detectDamage: boolean;
    predictOutcome: boolean;
    detectFraud: boolean;
    generateExplanation: boolean;
  };
}

interface ClaimAnalysisResponse {
  claimId: string;
  status: 'processing' | 'complete' | 'error';
  progress?: number;
  results?: {
    extraction: ExtractionResult;
    damage: DamageAnalysisResult;
    prediction: PredictionResult;
    fraud: FraudAnalysisResult;
    explanation: ExplanationResult;
  };
  error?: string;
}
```

#### Document Processing Request

```typescript
interface DocumentProcessingRequest {
  file: File;
  type: DocumentType;
  options?: {
    extractTables: boolean;
    detectEntities: boolean;
    generateHeatmap: boolean;
  };
}

interface DocumentProcessingResponse {
  documentId: string;
  status: 'processing' | 'complete' | 'error';
  progress?: number;
  result?: {
    pages: DocumentPage[];
    extractedData: ExtractedData;
    confidence: ConfidenceScore;
  };
}
```

#### Real-time Update Events

```typescript
// WebSocket event types
type WebSocketEvent =
  | ClaimUpdateEvent
  | MetricUpdateEvent
  | WorkflowExecutionEvent
  | CollaborationEvent
  | SystemEvent;

interface ClaimUpdateEvent {
  type: 'claim:update';
  claimId: string;
  field: string;
  value: any;
  timestamp: string;
  userId: string;
}

interface MetricUpdateEvent {
  type: 'metric:update';
  metric: string;
  value: number;
  delta: number;
  timestamp: string;
}

interface WorkflowExecutionEvent {
  type: 'workflow:execution';
  workflowId: string;
  executionId: string;
  nodeId?: string;
  status: string;
  timestamp: string;
}

interface CollaborationEvent {
  type: 'collaboration:cursor' | 'collaboration:selection' | 'collaboration:edit';
  userId: string;
  data: any;
  timestamp: string;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy that can be consolidated:

**Performance Properties**: Multiple criteria test FPS thresholds (US-1.1.3, US-2.1.4, US-2.5.4, US-4.1.3). These can be combined into a single comprehensive performance property that validates FPS across all 3D scenes.

**Zoom Constraint Properties**: Multiple criteria test zoom bounds (US-3.2.2, US-3.3.4, US-6.4.1). These can be combined into a single property that validates zoom constraints across all zoomable components.

**Keyboard Navigation Properties**: Multiple criteria test keyboard navigation (US-1.2.3, US-1.4.2, US-2.2.4). These can be combined into a single property that validates keyboard navigation works consistently across all interactive components.

**Color Mapping Properties**: Multiple criteria test color-to-value mappings (US-3.3.2, US-4.2.2, US-4.3.3, US-5.3.2). These can be combined into a single property that validates color mapping functions.

**Accessibility Properties**: Multiple criteria test accessibility features (US-1.1.5, US-2.4.3, US-6.3.4). These can be combined into properties that validate accessibility features work consistently.

**Number Formatting Properties**: Multiple criteria test number formatting (US-1.5.2, US-2.3.3). These can be combined into a single property.

**Layout Shift Properties**: Multiple criteria test CLS = 0 (US-1.5.3, US-2.3.4). These can be combined into a single property.

### Core Properties

### Property 1: 3D Scene Performance Consistency

*For any* 3D scene component (particle nebula, metrics orbs, data constellation, workflow canvas, damage inspector), when rendered with the appropriate device tier quality settings, the frame rate should meet or exceed the target FPS for that tier (60fps for high tier desktop, 30fps for low tier mobile).

**Validates: Requirements US-1.1.3, US-2.1.4, US-2.5.4, US-4.1.3**

### Property 2: Device Tier Fallback

*For any* device with detected capabilities below the medium tier threshold, the system should automatically render 2D fallback versions of 3D components without requiring user intervention.

**Validates: Requirements US-1.1.4**

### Property 3: Reduced Motion Compliance

*For any* user with prefers-reduced-motion enabled, all animations should be disabled except for fade transitions, and parallax scrolling should be replaced with standard scrolling.

**Validates: Requirements US-1.1.5, US-6.3.4**

### Property 4: Animation Timing Consistency

*For any* stagger animation (kinetic typography, feature cards, toast notifications), the delay between successive elements should match the specified interval (50ms for typography, 100ms for cards).

**Validates: Requirements US-1.2.1**

### Property 5: Scroll-Linked Property Interpolation

*For any* scroll-linked animation property (opacity, scale, position), the value should interpolate linearly between start and end values as scroll progress moves from 0% to 100%, with no jumps or discontinuities.

**Validates: Requirements US-1.2.2, US-6.3.2**


### Property 6: Keyboard Navigation Completeness

*For any* interactive component collection (feature cards, timeline nodes, workflow nodes), arrow key navigation should move focus through all elements in logical order, and Enter key should activate the focused element.

**Validates: Requirements US-1.2.3, US-1.4.2, US-2.2.4**

### Property 7: Rotation Constraint Enforcement

*For any* 3D element with tilt or rotation effects (glass cards, feature panels, workflow nodes), the maximum rotation angle should not exceed the specified limit (15deg for cards, 30deg for nodes) regardless of input intensity.

**Validates: Requirements US-1.3.1, US-5.1.2**

### Property 8: Focus Indicator Visibility

*For any* focusable element, when it receives keyboard focus, a visible focus indicator (2px cyan outline) should appear with sufficient contrast ratio (minimum 3:1) against all possible backgrounds.

**Validates: Requirements US-1.3.2**

### Property 9: Touch Target Size Compliance

*For any* interactive element on touch devices, the hit area should be at least 48x48px to meet accessibility guidelines, even if the visual element is smaller.

**Validates: Requirements US-1.3.3**

### Property 10: Proportional Scaling Accuracy

*For any* visual element whose size is proportional to a data value (metric orbs, graph nodes, chart segments), the scale should map linearly from the data range to the specified visual range (e.g., 0.5x-2x for orbs, 0.5x-3x for nodes) with correct interpolation.

**Validates: Requirements US-2.1.2, US-2.5.2, US-4.3.2**

### Property 11: Hover Interaction Responsiveness

*For any* hoverable 3D element (orbs, nodes, cards), the hover state should trigger within 16ms (one frame at 60fps) and apply the specified transformation (scale, lift, glow) with spring physics.

**Validates: Requirements US-2.1.3, US-5.1.2**

### Property 12: Particle System Density

*For any* particle effect (nebula, path flow, burst), the system should render at least the minimum specified particle count (10,000 for nebula, 50 per path, 100 for bursts) when quality settings allow.

**Validates: Requirements US-1.1.1, US-2.2.3, US-5.2.2**

### Property 13: WebSocket Update Smoothness

*For any* real-time metric update received via WebSocket, the displayed value should transition smoothly to the new value over 300ms with easing, never jumping instantly.

**Validates: Requirements US-2.3.2**

### Property 14: Number Formatting Consistency

*For any* numeric display (counters, metrics, amounts), the formatting should include thousands separators, appropriate decimal precision, and localized currency symbols based on the user's locale.

**Validates: Requirements US-1.5.2, US-2.3.3**

### Property 15: Zero Cumulative Layout Shift

*For any* dynamic content update (counter animation, metric update, toast notification), the layout should not shift, maintaining CLS = 0 by reserving space before content loads.

**Validates: Requirements US-1.5.3, US-2.3.4**

### Property 16: Theme Persistence Round-Trip

*For any* theme selection (light, dark, system), when saved to localStorage and the page is reloaded, the same theme should be applied before first paint without FOUC.

**Validates: Requirements US-6.1.3, US-6.1.4**

### Property 17: System Theme Synchronization

*For any* user with theme set to "system", when the OS theme preference changes, the application theme should update automatically within 100ms to match.

**Validates: Requirements US-2.4.2**

### Property 18: High Contrast Mode Adaptation

*For any* user with high contrast mode enabled, all glassmorphic effects should be replaced with solid backgrounds, borders should increase to 2px minimum, and blur effects should be disabled.

**Validates: Requirements US-2.4.3**

### Property 19: File Type Validation

*For any* file upload attempt, the system should accept only the specified file types (PDF, JPG, PNG, TXT) and reject all others with a clear error message, and should reject files exceeding 50MB.

**Validates: Requirements US-3.1.3**

### Property 20: Multi-File Layout Spacing

*For any* multi-file upload, each file should be positioned with a consistent 3D offset (e.g., 20px x, 20px y, 10px z) from the previous file to create a stacked appearance.

**Validates: Requirements US-3.1.4**

### Property 21: Zoom Constraint Enforcement

*For any* zoomable component (document viewer, damage inspector, 3D scenes), zoom level should be clamped to the specified range (0.5x-5x for documents, 0.5x-3x for damage inspector) regardless of input method (scroll, pinch, button).

**Validates: Requirements US-3.2.2, US-3.3.4, US-6.4.1**

### Property 22: Multi-Input Navigation Equivalence

*For any* navigable content (document pages, timeline stages), all input methods (arrow buttons, keyboard arrows, swipe gestures) should produce identical navigation results.

**Validates: Requirements US-3.2.3**

### Property 23: Annotation Persistence Round-Trip

*For any* annotation created on a document, when saved to the backend and retrieved in a new session or on a different device, the annotation should appear at the same position with the same content and styling.

**Validates: Requirements US-3.2.4**

### Property 24: Severity-to-Color Mapping

*For any* damage detection or risk indicator, the color should map deterministically from severity level: minor → yellow, moderate → orange, severe → red, with no ambiguity.

**Validates: Requirements US-3.3.2, US-4.2.2**

### Property 25: Confidence Heatmap Color Gradient

*For any* confidence score between 0-100%, the heatmap color should interpolate smoothly along the gradient from red (0%) through yellow (50%) to green (100%).

**Validates: Requirements US-3.4.1**

### Property 26: Validation Feedback Mapping

*For any* field validation result, the feedback indicator should map correctly: valid → checkmark (green), suspicious → warning (yellow), invalid → error (red).

**Validates: Requirements US-3.4.3**

### Property 27: Chart Data Proportion Accuracy

*For any* pie chart or bar chart, the visual size of each segment should be proportional to its data value, such that the ratio of visual areas equals the ratio of data values within 1% tolerance.

**Validates: Requirements US-4.1.1**

### Property 28: Chart Type Transition Smoothness

*For any* transition between chart types (pie → bar → line → scatter), the geometry should morph smoothly over 800ms with spring physics, with no sudden jumps or disappearances.

**Validates: Requirements US-4.1.2**

### Property 29: 3D Scatter Plot Position Accuracy

*For any* data point in a 3D scatter plot, the position should accurately reflect the data values on all three axes (x: amount, y: time, z: risk score) with correct scaling.

**Validates: Requirements US-4.2.1**

### Property 30: Anomaly Pulse Timing

*For any* anomaly indicator, the pulse animation should complete one full cycle in exactly 1 second, with pulse intensity proportional to fraud confidence score.

**Validates: Requirements US-4.2.3**

### Property 31: Feature Importance Size Mapping

*For any* SHAP value visualization node, the node size should be proportional to feature importance, with the most important feature being the largest and least important being the smallest.

**Validates: Requirements US-4.3.2**

### Property 32: Influence Color Mapping

*For any* feature in explainable AI visualization, the color should map from influence value: positive → green, negative → red, neutral (near zero) → gray.

**Validates: Requirements US-4.3.3**

### Property 33: Grid Snap Precision

*For any* draggable workflow node, when drag ends, the node position should snap to the nearest grid point (20px spacing) within 5px tolerance.

**Validates: Requirements US-5.1.3**

### Property 34: Multi-Select Consistency

*For any* workflow canvas, both multi-select methods (shift+click and drag selection box) should produce identical selection sets when targeting the same nodes.

**Validates: Requirements US-5.1.4**

### Property 35: Connection Thickness Scaling

*For any* workflow connection, the line thickness should scale linearly from data volume, mapping the data range to 1-5px thickness range.

**Validates: Requirements US-5.2.3**

### Property 36: Execution Status Color Mapping

*For any* workflow node during execution, the status orb color should map correctly: pending → gray, running → blue (pulsing), success → green, error → red.

**Validates: Requirements US-5.3.2**

### Property 37: Log Chronological Ordering

*For any* execution log panel, log entries should appear in strict chronological order based on timestamps, with newest entries at the bottom (or top, consistently).

**Validates: Requirements US-5.3.3**

### Property 38: Toast Auto-Dismiss Timing

*For any* toast notification, it should automatically dismiss after the specified duration (default 5s) unless the user hovers over it, in which case the timer should pause.

**Validates: Requirements US-6.2.3**

### Property 39: Toast Queue Management

*For any* sequence of toast notifications, a maximum of 3 should be visible simultaneously, with additional toasts queued and displayed as space becomes available.

**Validates: Requirements US-6.2.4**

### Property 40: Scroll Threshold Visibility

*For any* scroll-to-top button, it should appear when scroll position exceeds 500px and disappear when scroll position is below 500px, with smooth fade transition.

**Validates: Requirements US-6.3.3**

### Property 41: Gesture Threshold Enforcement

*For any* swipe gesture, it should only be recognized if the swipe distance exceeds 50px minimum threshold, preventing accidental triggers.

**Validates: Requirements US-6.4.3**

### Property 42: Device Tier Classification Consistency

*For any* device, the tier classification (low, medium, high) should be deterministic based on GPU capabilities, RAM, and screen resolution, producing the same tier on repeated detections.

**Validates: Requirements US-7.1.1**

### Property 43: Progressive Model Loading Order

*For any* 3D model with multiple LOD levels, the low-poly version should always load and render first, followed by the high-poly version only after low-poly is displayed.

**Validates: Requirements US-7.1.2**

### Property 44: Lazy Load Proximity Trigger

*For any* 3D scene below the fold, loading should trigger when the scene enters the viewport proximity (within 200px), not when it's fully visible.

**Validates: Requirements US-7.1.3**

### Property 45: Bundle Size Constraint

*For any* production build, the initial bundle size (HTML + CSS + JS) should not exceed 200KB when gzipped, measured by build tools.

**Validates: Requirements US-7.2.1**

### Property 46: Route Code Splitting

*For any* application route, a separate JavaScript bundle should be generated, verifiable by inspecting build output for multiple chunk files.

**Validates: Requirements US-7.2.2**

### Property 47: Link Hover Prefetch

*For any* internal navigation link, hovering over it should trigger a prefetch request for that route's resources, observable in network tab.

**Validates: Requirements US-7.3.1**

### Property 48: Offline Resource Availability

*For any* resource cached by the service worker, it should be accessible when the device is offline, returning the cached version instead of a network error.

**Validates: Requirements US-7.3.2**

### Property 49: Optimistic UI Update Ordering

*For any* user action that modifies data, the UI should update immediately with the expected result, then sync with the server, reverting only if the server rejects the change.

**Validates: Requirements US-7.3.3**

### Property 50: Cursor Position Broadcast Accuracy

*For any* collaborative editing session, when a user moves their cursor, the position should be broadcast to other users and displayed within 100ms with <5px position error.

**Validates: Requirements US-8.1.2**

### Property 51: Concurrent Edit Conflict Resolution

*For any* two users editing the same field simultaneously, the operational transformation algorithm should merge both edits without data loss, preserving both users' intentions.

**Validates: Requirements US-8.1.3**

### Property 52: KPI Calculation Accuracy

*For any* executive dashboard KPI, the calculated value should match the result of aggregating the underlying raw data with the specified formula, within 0.1% tolerance for floating-point precision.

**Validates: Requirements US-8.2.1**

### Property 53: Report Component Persistence

*For any* custom report built with drag-and-drop, the component layout should be saved and restored exactly when the report is reopened, maintaining order and configuration.

**Validates: Requirements US-8.2.2**

### Property 54: Audit Log Completeness

*For any* user action that modifies data (create, update, delete), an audit log entry should be created with timestamp, user ID, action type, resource ID, and before/after values.

**Validates: Requirements US-8.3.1**

### Property 55: Log Filter Accuracy

*For any* audit log search with filters (user, action, date range, resource), the results should include only entries matching all specified filters, with no false positives or negatives.

**Validates: Requirements US-8.3.2**

### Property 56: Log Immutability Verification

*For any* audit log entry, the cryptographic hash should be verifiable by recomputing the hash from the entry data, and any modification to the entry should result in hash mismatch.

**Validates: Requirements US-8.3.3**

---

## Error Handling

### Error Handling Strategy

The application implements a multi-layered error handling approach:

1. **Component-Level Error Boundaries**: Catch React errors and display fallback UI
2. **API Error Handling**: Standardized error responses with retry logic
3. **3D Rendering Errors**: Graceful degradation to 2D fallbacks
4. **Network Errors**: Offline detection and queued operations
5. **Validation Errors**: User-friendly messages with correction suggestions

### Error Boundary Implementation

```typescript
interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: any[];
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  // Catches rendering errors
  // Logs to monitoring service
  // Shows fallback UI
  // Provides reset mechanism
}
```

**Error Boundary Placement:**
- Root level: Catches catastrophic errors, shows full-page error
- Route level: Catches page errors, allows navigation to other pages
- Feature level: Catches component errors, shows inline error with retry
- 3D Canvas level: Catches WebGL errors, falls back to 2D

### API Error Handling

**Error Response Format:**
```typescript
interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
  retryAfter?: number;
}
```

**Error Categories:**

1. **Client Errors (4xx)**
   - 400 Bad Request: Show validation errors inline
   - 401 Unauthorized: Redirect to login
   - 403 Forbidden: Show permission error
   - 404 Not Found: Show not found page
   - 429 Too Many Requests: Show rate limit message, retry after delay

2. **Server Errors (5xx)**
   - 500 Internal Server Error: Show generic error, offer retry
   - 502 Bad Gateway: Show service unavailable, auto-retry
   - 503 Service Unavailable: Show maintenance message
   - 504 Gateway Timeout: Show timeout error, offer retry

**Retry Logic:**
```typescript
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

// Exponential backoff: delay = min(initialDelay * (multiplier ^ attempt), maxDelay)
// Default: 3 attempts, 1s initial, 10s max, 2x multiplier
```

### 3D Rendering Error Handling

**WebGL Context Loss:**
- Detect context loss event
- Pause rendering loop
- Show loading indicator
- Attempt context restoration
- Fall back to 2D if restoration fails

**Performance Degradation:**
- Monitor FPS continuously
- If FPS < 20 for 5 seconds:
  - Reduce quality tier automatically
  - Show notification to user
  - Offer manual quality control

**Model Loading Errors:**
- Show loading skeleton during load
- If load fails after 30s timeout:
  - Show error message
  - Offer retry button
  - Fall back to placeholder model

### Network Error Handling

**Offline Detection:**
```typescript
// Listen to online/offline events
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

// Show offline banner when offline
// Queue mutations for later sync
// Use cached data when available
```

**Request Queuing:**
- Queue failed mutations in IndexedDB
- Retry when connection restored
- Show sync status indicator
- Handle conflicts on sync

### Validation Error Handling

**Client-Side Validation:**
- Validate on blur and on submit
- Show inline error messages
- Highlight invalid fields
- Prevent submission until valid

**Server-Side Validation:**
- Display server validation errors
- Map errors to form fields
- Show summary of all errors
- Preserve user input on error

**Error Message Guidelines:**
- Be specific about what's wrong
- Suggest how to fix it
- Use plain language
- Avoid technical jargon
- Provide examples when helpful

### Logging and Monitoring

**Error Logging:**
```typescript
interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context: {
    userId?: string;
    route: string;
    userAgent: string;
    viewport: { width: number; height: number };
  };
  metadata?: Record<string, any>;
}
```

**Monitoring Integration:**
- Send errors to monitoring service (e.g., Sentry)
- Track error rates and patterns
- Set up alerts for critical errors
- Monitor Core Web Vitals
- Track 3D performance metrics

### User-Facing Error Messages

**Error Message Components:**
```typescript
interface ErrorMessageProps {
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant: 'primary' | 'secondary';
  }>;
  severity: 'error' | 'warning' | 'info';
}
```

**Error Message Examples:**
- "Unable to load document. Please check your connection and try again."
- "This file type is not supported. Please upload a PDF, JPG, PNG, or TXT file."
- "Your session has expired. Please log in again to continue."
- "We're experiencing high traffic. Please wait a moment and try again."

---

## Testing Strategy

### Testing Approach

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, error conditions, and integration points
**Property Tests**: Verify universal properties across all inputs with randomized test data

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing

**Library Selection:**
- **JavaScript/TypeScript**: fast-check (recommended for Next.js/React)
- Provides generators for primitive and complex types
- Supports async properties
- Integrates with Vitest

**Configuration:**
```typescript
import fc from 'fast-check';

// Minimum 100 iterations per property test
fc.assert(
  fc.property(/* generators */, (/* inputs */) => {
    // property assertion
  }),
  { numRuns: 100 }
);
```

**Property Test Structure:**
```typescript
describe('Feature: intelliclaim-premium-upgrade, Property 1: 3D Scene Performance Consistency', () => {
  it('should maintain target FPS for device tier', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          scene: fc.constantFrom('nebula', 'orbs', 'constellation', 'workflow', 'inspector'),
          deviceTier: fc.constantFrom('low', 'medium', 'high'),
          duration: fc.integer({ min: 1000, max: 5000 })
        }),
        async ({ scene, deviceTier, duration }) => {
          const targetFPS = deviceTier === 'high' ? 60 : 30;
          const fps = await measureSceneFPS(scene, deviceTier, duration);
          expect(fps).toBeGreaterThanOrEqual(targetFPS * 0.9); // 10% tolerance
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Custom Generators:**
```typescript
// Generator for claims
const claimArbitrary = fc.record({
  id: fc.uuid(),
  amount: fc.float({ min: 100, max: 100000 }),
  status: fc.constantFrom('pending', 'approved', 'rejected'),
  type: fc.constantFrom('auto', 'home', 'health'),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date() })
});

// Generator for documents
const documentArbitrary = fc.record({
  type: fc.constantFrom('pdf', 'jpg', 'png', 'txt'),
  size: fc.integer({ min: 1024, max: 50 * 1024 * 1024 }),
  pages: fc.array(pageArbitrary, { minLength: 1, maxLength: 100 })
});

// Generator for 3D positions
const position3DArbitrary = fc.tuple(
  fc.float({ min: -100, max: 100 }),
  fc.float({ min: -100, max: 100 }),
  fc.float({ min: -100, max: 100 })
);
```

### Unit Testing

**Testing Framework**: Vitest (fast, ESM-native, Vite-compatible)

**Test Organization:**
```
__tests__/
├── unit/
│   ├── components/
│   │   ├── HeroSection3D.test.tsx
│   │   ├── MetricsOrbs3D.test.tsx
│   │   └── DocumentViewer3D.test.tsx
│   ├── hooks/
│   │   ├── useDeviceTier.test.ts
│   │   ├── useScrollProgress.test.ts
│   │   └── use3DScene.test.ts
│   ├── utils/
│   │   ├── formatNumber.test.ts
│   │   ├── colorMapping.test.ts
│   │   └── validation.test.ts
│   └── stores/
│       ├── userStore.test.ts
│       └── claimStore.test.ts
├── integration/
│   ├── claim-workflow.test.tsx
│   ├── document-upload.test.tsx
│   └── dashboard-metrics.test.tsx
└── e2e/
    ├── landing-page.spec.ts
    ├── claim-submission.spec.ts
    └── workflow-builder.spec.ts
```

**Unit Test Examples:**

```typescript
// Component test
describe('SpringButton', () => {
  it('should render with correct variant styles', () => {
    const { container } = render(<SpringButton variant="glass">Click</SpringButton>);
    expect(container.firstChild).toHaveClass('backdrop-blur-xl');
  });

  it('should show loading spinner when loading prop is true', () => {
    const { getByRole } = render(<SpringButton loading>Submit</SpringButton>);
    expect(getByRole('button')).toContainElement(getByTestId('spinner'));
  });

  it('should call onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<SpringButton onClick={handleClick}>Click</SpringButton>);
    await userEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// Hook test
describe('useDeviceTier', () => {
  it('should detect high tier for powerful devices', () => {
    mockGPUCapabilities({ renderer: 'NVIDIA RTX 3080', memory: 8192 });
    const { result } = renderHook(() => useDeviceTier());
    expect(result.current.tier).toBe('high');
  });

  it('should detect low tier for mobile devices', () => {
    mockGPUCapabilities({ renderer: 'Mali-G76', memory: 2048 });
    const { result } = renderHook(() => useDeviceTier());
    expect(result.current.tier).toBe('low');
  });
});

// Utility test
describe('formatNumber', () => {
  it('should format with thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should format currency with symbol', () => {
    expect(formatNumber(1234.56, { style: 'currency', currency: 'USD' })).toBe('$1,234.56');
  });

  it('should handle different locales', () => {
    expect(formatNumber(1234.56, { locale: 'de-DE' })).toBe('1.234,56');
  });
});
```

### Integration Testing

**Focus Areas:**
- Multi-component workflows
- API integration
- State management
- Real-time updates

**Example Integration Test:**
```typescript
describe('Claim Submission Workflow', () => {
  it('should complete full claim submission flow', async () => {
    // 1. Upload documents
    const files = [createMockFile('claim-form.pdf'), createMockFile('damage.jpg')];
    await uploadDocuments(files);
    
    // 2. Wait for AI processing
    await waitFor(() => expect(screen.getByText('Processing complete')).toBeInTheDocument());
    
    // 3. Review extracted data
    expect(screen.getByLabelText('Claim Amount')).toHaveValue('$5,000');
    
    // 4. Submit claim
    await userEvent.click(screen.getByRole('button', { name: 'Submit Claim' }));
    
    // 5. Verify success
    await waitFor(() => expect(screen.getByText('Claim submitted successfully')).toBeInTheDocument());
  });
});
```

### End-to-End Testing

**Framework**: Playwright (cross-browser, reliable, fast)

**Test Scenarios:**
- Critical user journeys
- Cross-browser compatibility
- Mobile responsiveness
- Performance benchmarks

**Example E2E Test:**
```typescript
test('landing page 3D experience', async ({ page }) => {
  await page.goto('/');
  
  // Wait for 3D scene to load
  await page.waitForSelector('canvas');
  
  // Verify particle nebula is rendering
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  
  // Test scroll interaction
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(1000);
  
  // Verify orbs condensed
  const document3D = page.locator('[data-testid="document-3d"]');
  await expect(document3D).toBeVisible();
  
  // Test CTA interaction
  await page.click('text=Get Started');
  await expect(page).toHaveURL('/dashboard');
});
```

### Visual Regression Testing

**Tool**: Playwright with screenshot comparison

**Approach:**
- Capture screenshots of key UI states
- Compare against baseline images
- Flag visual differences for review
- Update baselines when changes are intentional

```typescript
test('dashboard visual regression', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Capture full page
  await expect(page).toHaveScreenshot('dashboard-full.png');
  
  // Capture specific components
  await expect(page.locator('[data-testid="metrics-orbs"]')).toHaveScreenshot('metrics-orbs.png');
});
```

### Performance Testing

**Metrics to Track:**
- Lighthouse scores (Performance, Accessibility, Best Practices, SEO)
- Core Web Vitals (LCP, FID, CLS, INP)
- 3D rendering FPS
- Bundle sizes
- API response times

**Lighthouse CI Configuration:**
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["http://localhost:3000", "http://localhost:3000/dashboard"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1200 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 1200 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.05 }]
      }
    }
  }
}
```

### Accessibility Testing

**Tools:**
- axe-core (automated accessibility testing)
- Playwright accessibility assertions
- Manual testing with screen readers

**Test Coverage:**
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Color contrast
- ARIA labels
- Alternative text

```typescript
test('dashboard accessibility', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Run axe accessibility scan
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
  
  // Test keyboard navigation
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'first-interactive-element');
  
  // Test screen reader labels
  const button = page.getByRole('button', { name: 'Submit Claim' });
  await expect(button).toHaveAttribute('aria-label');
});
```

### Test Coverage Goals

**Coverage Targets:**
- Unit tests: >80% code coverage
- Integration tests: All critical workflows
- E2E tests: All user journeys
- Property tests: All correctness properties
- Accessibility tests: WCAG 2.2 AA compliance

**Coverage Reporting:**
```bash
# Generate coverage report
vitest run --coverage

# View coverage in browser
open coverage/index.html
```

### Continuous Integration

**CI Pipeline:**
1. Lint and type check
2. Run unit tests with coverage
3. Run integration tests
4. Run property-based tests
5. Build application
6. Run E2E tests
7. Run Lighthouse CI
8. Run accessibility tests
9. Generate reports
10. Deploy to staging (if all pass)

**GitHub Actions Workflow:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run build
      - run: npm run test:e2e
      - run: npm run lighthouse
```

---

## Implementation Approach

### Migration Strategy

**Phase 1: Foundation Setup (Week 1)**
- Initialize Next.js 15 project with App Router
- Configure TypeScript, ESLint, Prettier
- Set up Tailwind CSS v4 with custom config
- Install and configure core dependencies
- Set up testing infrastructure (Vitest, Playwright)
- Configure CI/CD pipeline

**Phase 2: Design System (Week 1-2)**
- Create design tokens (colors, spacing, typography)
- Build core UI components (Button, Card, Input, etc.)
- Implement glassmorphism utilities
- Set up theme system (light/dark/high-contrast)
- Create animation variants library
- Document components in Storybook

**Phase 3: 3D Infrastructure (Week 2)**
- Set up R3F Canvas wrapper with error boundaries
- Implement device tier detection
- Create quality settings system
- Build reusable 3D components (Scene, Camera, Lights)
- Implement particle system
- Add performance monitoring

**Phase 4: Landing Page (Week 3-4)**
- Build hero section with particle nebula
- Implement 3D document model
- Create scroll storytelling system
- Add kinetic typography animations
- Build feature showcase with 3D cards
- Implement premium CTAs
- Add live statistics counter

**Phase 5: Dashboard Upgrade (Week 5-6)**
- Build metrics orbs 3D visualization
- Create spatial timeline canvas
- Implement data constellation graph
- Add glassmorphic card system
- Build real-time counter animations
- Integrate WebSocket for live updates
- Add AI insights panel

**Phase 6: Document Inspector (Week 7-8)**
- Build physics-based file upload
- Create 3D document viewer with page-flip
- Implement damage inspector with YOLO visualization
- Add AI extraction visualization
- Build confidence heatmap overlay
- Implement annotation tools
- Add gesture controls

**Phase 7: Advanced Features (Week 9-10)**
- Build prediction visualization with 3D charts
- Create fraud detection scatter plot
- Implement explainable AI visualization
- Build workflow builder with 3D nodes
- Add workflow execution visualization
- Implement collaboration features

**Phase 8: Polish & Optimization (Week 11)**
- Implement all micro-interactions
- Add loading states and skeleton screens
- Optimize bundle sizes
- Implement progressive loading
- Add service worker for offline support
- Fine-tune animations and transitions

**Phase 9: Testing & QA (Week 11-12)**
- Write property-based tests for all properties
- Complete unit test coverage
- Run E2E test suite
- Perform accessibility audit
- Conduct performance testing
- Fix bugs and issues

**Phase 10: Launch Preparation (Week 12)**
- Security audit and hardening
- Final performance optimization
- Documentation completion
- User acceptance testing
- Staging deployment
- Production deployment

### Risk Mitigation

**Technical Risks:**
- **3D Performance**: Mitigate with device tiers, LOD, lazy loading
- **Bundle Size**: Mitigate with code splitting, tree-shaking, compression
- **Browser Compatibility**: Mitigate with feature detection, polyfills, fallbacks
- **WebGL Context Loss**: Mitigate with context restoration, 2D fallbacks

**Project Risks:**
- **Scope Creep**: Mitigate with strict prioritization, MVP definition
- **Timeline Delays**: Mitigate with buffer time, parallel workstreams
- **Resource Constraints**: Mitigate with clear task breakdown, pair programming

### Success Criteria

The upgrade is considered successful when:
1. All 56 correctness properties pass property-based tests
2. Lighthouse Performance score ≥95
3. Core Web Vitals meet targets (LCP <1.2s, FID <50ms, CLS <0.05)
4. 3D scenes maintain 60fps on desktop, 30fps on mobile
5. WCAG 2.2 AA compliance verified
6. All critical user journeys pass E2E tests
7. Bundle size <200KB gzipped
8. Zero critical security vulnerabilities
9. User acceptance testing approved
10. Production deployment successful

---

**Document Version**: 1.0  
**Last Updated**: January 30, 2026  
**Status**: Complete - Ready for Review
