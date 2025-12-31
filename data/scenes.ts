// Types
export type Source = {
  id: string;
  org: string;
  title: string;
  year: string;
  url: string;
  quote: string;
  note?: string;
};

export type StatCard = {
  id: string;
  text: string;
  sourceIds: string[];
};

export type Scene = {
  id: string;
  chapter: string;
  headline: string;
  narrationLines: string[];
  statCards: StatCard[];
  sources: Source[];
  scroll: { start: number; end: number };
  camera: {
    pos: [number, number, number];
    lookAt: [number, number, number];
    fov?: number;
  };
  visuals: { 
    key: string;
    model?: string; // Path to STL file in /public/models/
    // Initial rotation in radians [x, y, z] - default [0, 0, 0]
    rotation?: [number, number, number];
    // Animation rotation amplitude [x, y, z] - default [0.05, 0.2, 0] (radians)
    rotationAmplitude?: [number, number, number];
    // Scale multiplier - default 1
    scale?: number;
  };
  // Stats card placement configuration
  statsPlacement?: {
    // Position: 'top' | 'bottom' | 'center' - vertical position relative to visual
    // Default: 'top' (above the visual)
    vertical?: 'top' | 'bottom' | 'center';
    // Horizontal: 'left' | 'right' | 'center' - horizontal alignment
    // Default: 'center'
    horizontal?: 'left' | 'right' | 'center';
    // Vertical offset in viewport height percentage (e.g., -10 = 10vh higher)
    offsetY?: number;
    // Horizontal offset in viewport width percentage
    offsetX?: number;
  };
};

// SOURCES POOL
export const SOURCES: Record<string, Source> = {
  S_UNEP_2025_PR: {
    id: 'S_UNEP_2025_PR',
    org: 'UNEP',
    title: 'Unsustainable fashion and textiles in focus for International Day of Zero Waste 2025',
    year: '2025',
    url: 'https://www.unep.org/news-and-stories/press-release/unsustainable-fashion-and-textiles-focus-international-day-zero',
    quote: 'Every year, 92 million tonnes of textile waste is produced globally.',
  },
  S_UNEP_2025_PR_2000_2015: {
    id: 'S_UNEP_2025_PR_2000_2015',
    org: 'UNEP',
    title: 'Unsustainable fashion and textiles in focus for International Day of Zero Waste 2025',
    year: '2025',
    url: 'https://www.unep.org/news-and-stories/press-release/unsustainable-fashion-and-textiles-focus-international-day-zero',
    quote: 'Production doubled from 2000 to 2015… garment use decreased by 36 per cent.',
  },
  S_UNEP_2025_STORY_TRUCK: {
    id: 'S_UNEP_2025_STORY_TRUCK',
    org: 'UNEP',
    title: 'Zero Waste Day shines a light on fashion and textiles',
    year: '2025',
    url: 'https://www.unep.org/news-and-stories/story/zero-waste-day-shines-light-fashion-and-textiles',
    quote: 'Each second the equivalent of a garbage truck full of clothing is… dumped in a landfill.',
  },
  S_EMF_TEXTILES_REPORT_TRUCK: {
    id: 'S_EMF_TEXTILES_REPORT_TRUCK',
    org: 'Ellen MacArthur Foundation',
    title: "A New Textiles Economy: Redesigning fashion's future (PDF)",
    year: '2017',
    url: 'https://content.ellenmacarthurfoundation.org/m/6d5071bb8a5f05a2/original/A-New-Textiles-Economy-Redesigning-fashions-future.pdf',
    quote: 'Overall, one garbage truck of textiles is landfilled or incinerated every second.',
  },
  S_EMF_TEXTILES_REPORT_RECYCLE: {
    id: 'S_EMF_TEXTILES_REPORT_RECYCLE',
    org: 'Ellen MacArthur Foundation',
    title: "A New Textiles Economy: Redesigning fashion's future (PDF)",
    year: '2017',
    url: 'https://content.ellenmacarthurfoundation.org/m/6d5071bb8a5f05a2/original/A-New-Textiles-Economy-Redesigning-fashions-future.pdf',
    quote: 'Less than 1% of material used to produce clothing is recycled into new clothing.',
  },
  S_EMF_TEXTILES_REPORT_87: {
    id: 'S_EMF_TEXTILES_REPORT_87',
    org: 'Ellen MacArthur Foundation',
    title: "A New Textiles Economy: Redesigning fashion's future (PDF)",
    year: '2017',
    url: 'https://content.ellenmacarthurfoundation.org/m/6d5071bb8a5f05a2/original/A-New-Textiles-Economy-Redesigning-fashions-future.pdf',
    quote: 'Of the total fibre input used for clothing, 87% is landfilled or incinerated.',
  },
  S_EMF_FASHION_OVERVIEW_TRUCK: {
    id: 'S_EMF_FASHION_OVERVIEW_TRUCK',
    org: 'Ellen MacArthur Foundation',
    title: 'Circular Economy for the Fashion Industry (overview)',
    year: 'undated',
    url: 'https://www.ellenmacarthurfoundation.org/topics/fashion/overview',
    quote: 'Every second… a rubbish truckload of clothes is burnt or buried in landfill.',
  },
  S_TE_MMR_2023_POLY: {
    id: 'S_TE_MMR_2023_POLY',
    org: 'Textile Exchange',
    title: 'Materials Market Report 2023 (key takeaways page)',
    year: '2023',
    url: 'https://textileexchange.org/knowledge-center/reports/materials-market-report-2023/',
    quote: 'Polyester… making up 54% of the global market in 2022.',
  },
  S_TE_MMR_2023_PER_CAPITA: {
    id: 'S_TE_MMR_2023_PER_CAPITA',
    org: 'Textile Exchange',
    title: 'Materials Market Report 2023 (key takeaways page)',
    year: '2023',
    url: 'https://textileexchange.org/knowledge-center/reports/materials-market-report-2023/',
    quote: 'Global fiber production… increased… to 14.6 kilograms per person in 2022.',
  },
  S_IUCN_2017_MICRO: {
    id: 'S_IUCN_2017_MICRO',
    org: 'IUCN',
    title: 'Primary Microplastics in the Oceans (PDF)',
    year: '2017',
    url: 'https://portals.iucn.org/library/sites/library/files/documents/2017-002-En.pdf',
    quote: 'Close to two-thirds (63.1%)… first the laundry of synthetic textiles (34.8%).',
    note: "This 34.8% is for primary microplastics releases to oceans in the report's central scenario.",
  },
  S_JAMBECK_2015_OCEAN: {
    id: 'S_JAMBECK_2015_OCEAN',
    org: 'Science (Jambeck et al.)',
    title: 'Plastic waste inputs from land into the ocean',
    year: '2015',
    url: 'https://www.science.org/doi/10.1126/science.1260352',
    quote: '4.8 to 12.7 million MT entering the ocean.',
  },
  S_UNEP_2021_METHANE: {
    id: 'S_UNEP_2021_METHANE',
    org: 'UNEP',
    title: 'Global Assessment: Urgent steps must be taken to reduce methane',
    year: '2021',
    url: 'https://www.unep.org/news-and-stories/press-release/global-assessment-urgent-steps-must-be-taken-reduce-methane',
    quote: 'In the waste sector, landfills and wastewater make up about 20 per cent of emissions.',
  },
  S_MCKINSEY_GFA_2020_FOC: {
    id: 'S_MCKINSEY_GFA_2020_FOC',
    org: 'McKinsey & Global Fashion Agenda',
    title: 'Fashion on Climate (PDF)',
    year: '2020',
    url: 'https://www.mckinsey.com/~/media/mckinsey/industries/retail/our%20insights/fashion%20on%20climate/fashion-on-climate-full-report.pdf',
    quote: '2.1 billion tonnes of GHG emissions in 2018, equalling 4% of the global total.',
  },
  S_WRAP_2024_LIFETIME: {
    id: 'S_WRAP_2024_LIFETIME',
    org: 'WRAP',
    title: "Extending Product Lifetimes: WRAP's Work on Clothing Durability",
    year: '2024',
    url: 'https://www.wrap.ngo/resources/case-study/extending-product-lifetimes-wraps-work-clothing-durability',
    quote: 'Extending… by just nine months could reduce… footprints by up to 20%.',
  },
};

// All sources as array for the drawer
export const ALL_SOURCES: Source[] = Object.values(SOURCES);

// SCENES
export const SCENES: Scene[] = [
  {
    id: 'SC_00',
    chapter: 'ONE WEAR',
    headline: 'A shirt. One wear. A bin.',
    narrationLines: [
      'The story begins with a single shirt—bought fast, worn once, discarded quickly.',
      'The end looks small: a closed lid, a quiet curb.',
      'The scale is not small.',
    ],
    statCards: [
      {
        id: 'stat_00_1',
        text: 'Every year, 92 million tonnes of textile waste is produced globally.',
        sourceIds: ['S_UNEP_2025_PR'],
      },
      {
        id: 'stat_00_2',
        text: 'Production doubled from 2000 to 2015… garment use decreased by 36%.',
        sourceIds: ['S_UNEP_2025_PR_2000_2015'],
      },
    ],
    sources: [SOURCES.S_UNEP_2025_PR, SOURCES.S_UNEP_2025_PR_2000_2015],
    scroll: { start: 0, end: 0.09 },
    camera: { pos: [0, 0, 5], lookAt: [0, 0, 0], fov: 50 },
    visuals: { 
      key: 'shirtToBin',
      model: '/models/shirt.stl',
      // Rotation in radians: [x, y, z] - adjust these values!
      rotation: [-1.57, 0, 0],           // Initial orientation
      rotationAmplitude: [0.05, 0.2, 0], // How much it oscillates on each axis
      scale: 1,                      // Size multiplier
    },
    // Stats placement: 'top' | 'center' | 'bottom' vertical, 'left' | 'center' | 'right' horizontal
    // offsetY/offsetX in vh/vw for fine-tuning
    statsPlacement: {
      vertical: 'top',
      horizontal: 'center',
      offsetY: -10,
      offsetX: 0,
    },
  },
  {
    id: 'SC_01',
    chapter: 'COLLECTION',
    headline: 'Compacted into the stream',
    narrationLines: [
      'Discarded clothing enters the waste stream.',
      'A personal decision becomes industrial throughput.',
    ],
    statCards: [
      {
        id: 'stat_01_1',
        text: 'Each second the equivalent of a garbage truck full of clothing is… dumped in a landfill.',
        sourceIds: ['S_UNEP_2025_STORY_TRUCK'],
      },
    ],
    sources: [SOURCES.S_UNEP_2025_STORY_TRUCK],
    scroll: { start: 0.09, end: 0.18 },
    camera: { pos: [0, 0, 5], lookAt: [0, 0, 0], fov: 50 },
    visuals: { 
      key: 'binToTruck',
      model: '/models/bin.stl',
      rotation: [-1.4, 0, 0.5],           // Initial orientation [x, y, z] in radians
      rotationAmplitude: [0.05, 0.2, 0], // Oscillation amplitude [x, y, z]
      scale: 1,                      // Size multiplier
    },
  },
  {
    id: 'SC_02',
    chapter: 'LANDFILL',
    headline: '"Away" is a place',
    narrationLines: [
      'At the landfill, fabric becomes terrain.',
      'Time passes. The pile remains.',
      'This is where fast turns into long.',
    ],
    statCards: [
      {
        id: 'stat_02_1',
        text: 'Of the total fibre input used for clothing, 87% is landfilled or incinerated.',
        sourceIds: ['S_EMF_TEXTILES_REPORT_87'],
      },
      {
        id: 'stat_02_2',
        text: 'Overall, one garbage truck of textiles is landfilled or incinerated every second.',
        sourceIds: ['S_EMF_TEXTILES_REPORT_TRUCK'],
      },
    ],
    sources: [SOURCES.S_EMF_TEXTILES_REPORT_87, SOURCES.S_EMF_TEXTILES_REPORT_TRUCK],
    scroll: { start: 0.18, end: 0.28 },
    camera: { pos: [0, 0, 5], lookAt: [0, 0, 0], fov: 50 },
    visuals: { 
      key: 'landfillZoom',
      model: '/models/landfill.stl',
      rotation: [-1.3, 0, 0.5],           // Initial orientation [x, y, z] in radians
      rotationAmplitude: [0.05, 0.05, 0], // Oscillation amplitude [x, y, z]
      scale: 2,                      // Size multiplier
    },
  },
  {
    id: 'SC_03',
    chapter: 'RECYCLING',
    headline: 'A loop that barely closes',
    narrationLines: [
      'Most clothing is not remade into clothing.',
      'Material value leaks out of the system.',
    ],
    statCards: [
      {
        id: 'stat_03_1',
        text: 'Less than 1% of material used to produce clothing is recycled into new clothing.',
        sourceIds: ['S_EMF_TEXTILES_REPORT_RECYCLE'],
      },
    ],
    sources: [SOURCES.S_EMF_TEXTILES_REPORT_RECYCLE],
    scroll: { start: 0.28, end: 0.38 },
    camera: { pos: [0, 0, 5], lookAt: [0, 0, 0], fov: 50 },
    visuals: { 
      key: 'labelsAndThreads',
      // model: '/models/threads.stl',
      rotation: [0, 0, 0],           // Initial orientation [x, y, z] in radians
      rotationAmplitude: [0.05, 0.05, 0], // Oscillation amplitude [x, y, z]
      scale: 1,                      // Size multiplier
    },
  },
  {
    id: 'SC_04',
    chapter: 'MATERIALS',
    headline: 'The closet begins at extraction',
    narrationLines: [
      'Zoom out far enough and the shirt turns back into its inputs.',
      'More fiber per person. More synthetic share.',
    ],
    statCards: [
      {
        id: 'stat_04_1',
        text: 'Global fiber production… increased… to 14.6 kilograms per person in 2022.',
        sourceIds: ['S_TE_MMR_2023_PER_CAPITA'],
      },
      {
        id: 'stat_04_2',
        text: 'Polyester… making up 54% of the global market in 2022.',
        sourceIds: ['S_TE_MMR_2023_POLY'],
      },
    ],
    sources: [SOURCES.S_TE_MMR_2023_PER_CAPITA, SOURCES.S_TE_MMR_2023_POLY],
    scroll: { start: 0.38, end: 0.48 },
    camera: { pos: [0, 0, 5], lookAt: [0, 0, 0], fov: 50 },
    visuals: { 
      key: 'fibersToPolymers',
      model: '/models/fiber.stl',
      rotation: [-1.54, 0, 0.3],           // Initial orientation [x, y, z] in radians
      rotationAmplitude: [0.05, 0.2, 0], // Oscillation amplitude [x, y, z]
      scale: 1,                      // Size multiplier
    },
    statsPlacement: {
      vertical: 'top',
      horizontal: 'center',
      offsetY: -10,
      offsetX: 0,
    },
  },
  {
    id: 'SC_05',
    chapter: 'MICROFIBERS',
    headline: 'Pollution that slips through',
    narrationLines: [
      'Synthetic fabrics shed fibers during laundry.',
      'Those fibers move through wastewater pathways toward rivers and coasts.',
    ],
    statCards: [
      {
        id: 'stat_05_1',
        text: 'Close to two-thirds (63.1%)… first the laundry of synthetic textiles (34.8%).',
        sourceIds: ['S_IUCN_2017_MICRO'],
      },
    ],
    sources: [SOURCES.S_IUCN_2017_MICRO],
    scroll: { start: 0.48, end: 0.58 },
    camera: { pos: [0, 0, 5], lookAt: [0, 0, 0], fov: 50 },
    visuals: { 
      key: 'washParticles',
      // model: '/models/washer.stl',
      // rotation: [0, 0, 0],           // Initial orientation [x, y, z] in radians
      // rotationAmplitude: [0.05, 0.2, 0], // Oscillation amplitude [x, y, z]
      // scale: 1,                      // Size multiplier
    },
  },
  {
    id: 'SC_06',
    chapter: 'OCEAN',
    headline: 'From a seam to the sea',
    narrationLines: [
      'Rivers connect closets to coastlines.',
      'Micro becomes widespread; widespread becomes hard to reverse.',
    ],
    statCards: [
      {
        id: 'stat_06_1',
        text: '4.8 to 12.7 million MT entering the ocean.',
        sourceIds: ['S_JAMBECK_2015_OCEAN'],
      },
    ],
    sources: [SOURCES.S_JAMBECK_2015_OCEAN],
    scroll: { start: 0.58, end: 0.78 },
    camera: { pos: [0, 0, 5], lookAt: [0, 0, 0], fov: 50 },
    visuals: { 
      key: 'riverToGyre',
      model: '/models/ocean.stl',
      rotation: [-1.4, 0, 0],           // Initial orientation [x, y, z] in radians
      rotationAmplitude: [0.05, 0, 0], // Oscillation amplitude [x, y, z]
      scale: 10,                      // Size multiplier
    },
  },
  {
    id: 'SC_07',
    chapter: 'CHANGE',
    headline: 'A longer life changes the math',
    narrationLines: [
      'A smaller wardrobe can still contain enough.',
      'Keeping clothing in active use longer reduces new production pressure.',
    ],
    statCards: [
      {
        id: 'stat_09_1',
        text: 'Extending… by just nine months could reduce… footprints by up to 20%.',
        sourceIds: ['S_WRAP_2024_LIFETIME'],
      },
    ],
    sources: [SOURCES.S_WRAP_2024_LIFETIME],
    scroll: { start: 0.78, end: 0.99 },
    camera: { pos: [0, 0, 5], lookAt: [0, 0, 0], fov: 50 },
    visuals: { 
      key: 'repairAndReuse',
      // model: '/models/shirt-mended.stl',
      // rotation: [0, 0, 0],           // Initial orientation [x, y, z] in radians
      // rotationAmplitude: [0.05, 0.2, 0], // Oscillation amplitude [x, y, z]
      // scale: 1,                      // Size multiplier
    },
    statsPlacement: {
      vertical: 'top',
      horizontal: 'center',
      offsetY: 30,
      offsetX: 0,
    },
  },
];

// Helper to get scene by scroll position
export function getActiveScene(scrollProgress: number): Scene {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (scrollProgress >= SCENES[i].scroll.start) {
      return SCENES[i];
    }
  }
  return SCENES[0];
}

// Helper to get scene index
export function getActiveSceneIndex(scrollProgress: number): number {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (scrollProgress >= SCENES[i].scroll.start) {
      return i;
    }
  }
  return 0;
}

// Helper to get source by ID
export function getSourceById(id: string): Source | undefined {
  return SOURCES[id];
}

// Interpolate camera between scenes with smooth blending
export function interpolateCamera(
  scrollProgress: number
): { pos: [number, number, number]; lookAt: [number, number, number]; fov: number } {
  const currentIndex = getActiveSceneIndex(scrollProgress);
  const currentScene = SCENES[currentIndex];
  const nextScene = SCENES[Math.min(currentIndex + 1, SCENES.length - 1)];
  const prevScene = SCENES[Math.max(currentIndex - 1, 0)];

  // Calculate progress within current scene
  const sceneStart = currentScene.scroll.start;
  const sceneEnd = currentScene.scroll.end;
  const rawProgress = (scrollProgress - sceneStart) / (sceneEnd - sceneStart);
  const sceneProgress = Math.min(1, Math.max(0, rawProgress));

  // Use smoother easing for less jarring transitions
  const easedProgress = easeInOutQuart(sceneProgress);

  // Blend zones for smoother transitions at scene boundaries
  const blendZone = 0.15; // 15% blend zone at start/end of scenes
  
  let blendedPos: [number, number, number];
  let blendedLookAt: [number, number, number];
  let blendedFov: number;

  if (sceneProgress < blendZone && currentIndex > 0) {
    // Blend from previous scene
    const blendProgress = sceneProgress / blendZone;
    const smoothBlend = easeInOutQuad(blendProgress);
    
    blendedPos = [
      lerp(prevScene.camera.pos[0], currentScene.camera.pos[0], smoothBlend),
      lerp(prevScene.camera.pos[1], currentScene.camera.pos[1], smoothBlend),
      lerp(prevScene.camera.pos[2], currentScene.camera.pos[2], smoothBlend),
    ];
    blendedLookAt = [
      lerp(prevScene.camera.lookAt[0], currentScene.camera.lookAt[0], smoothBlend),
      lerp(prevScene.camera.lookAt[1], currentScene.camera.lookAt[1], smoothBlend),
      lerp(prevScene.camera.lookAt[2], currentScene.camera.lookAt[2], smoothBlend),
    ];
    blendedFov = lerp(prevScene.camera.fov || 50, currentScene.camera.fov || 50, smoothBlend);
  } else if (sceneProgress > (1 - blendZone) && currentIndex < SCENES.length - 1) {
    // Blend to next scene
    const blendProgress = (sceneProgress - (1 - blendZone)) / blendZone;
    const smoothBlend = easeInOutQuad(blendProgress);
    
    blendedPos = [
      lerp(currentScene.camera.pos[0], nextScene.camera.pos[0], smoothBlend),
      lerp(currentScene.camera.pos[1], nextScene.camera.pos[1], smoothBlend),
      lerp(currentScene.camera.pos[2], nextScene.camera.pos[2], smoothBlend),
    ];
    blendedLookAt = [
      lerp(currentScene.camera.lookAt[0], nextScene.camera.lookAt[0], smoothBlend),
      lerp(currentScene.camera.lookAt[1], nextScene.camera.lookAt[1], smoothBlend),
      lerp(currentScene.camera.lookAt[2], nextScene.camera.lookAt[2], smoothBlend),
    ];
    blendedFov = lerp(currentScene.camera.fov || 50, nextScene.camera.fov || 50, smoothBlend);
  } else {
    // Stay at current scene position
    blendedPos = [...currentScene.camera.pos];
    blendedLookAt = [...currentScene.camera.lookAt];
    blendedFov = currentScene.camera.fov || 50;
  }

  return { pos: blendedPos, lookAt: blendedLookAt, fov: blendedFov };
}

// Linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Smoother easing function
function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

// Quadratic easing for blend zones
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

