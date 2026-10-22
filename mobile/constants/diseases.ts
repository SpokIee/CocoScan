/**
 * Educational content for the "Types of Coconut Diseases" screen.
 * Mirrors backend/app/services/seed.py so Demo Mode shows the same text the
 * API serves. Content follows the CocoScan manuscript; no specific chemical
 * treatments are recommended.
 */
import type { DiseaseInfo } from '@/types';

export const INTRO_TEXT =
  "Coconut palms can show a wide range of changes in their leaves, and not every yellow patch or dry spot signals disease — some discoloration is simply part of natural leaf aging or a sign of nutrient deficiency. What makes leaf disease tricky to catch is that the earliest symptoms often look nearly identical to these harmless changes: faint spotting, slight color shifts, or minor texture changes that are easy to dismiss. By the time a disease is unmistakable to the naked eye, it has often already spread to nearby leaflets or even neighboring palms, making treatment far less effective. This section covers the two conditions CocoScan is built to recognize — Pestalotiopsis palmarum (gray leaf spot) and Coconut Leaf Rot Disease Complex (LRDC) — including how each one typically starts, how it progresses if left unaddressed, and what to look for at different stages. Knowing these patterns can help you tell a genuine problem apart from ordinary leaf wear, and catch it while it's still manageable.";

export const DISEASES: DiseaseInfo[] = [
  {
    key: 'gray_leaf_spot',
    name: 'Pestalotiopsis palmarum (Gray Leaf Spot)',
    scientificName: 'Pestalotiopsis palmarum',
    description:
      "Gray leaf spot is a fungal disease that begins as small, faint yellow-brown spots on the coconut leaflets, often resembling normal leaf aging or nutrient deficiency at first glance. As the disease progresses, the spots enlarge and merge together, developing grayish centers with darker brown or reddish borders. The affected leaf tissue eventually dries out, turns brittle, and dies. In advanced stages, large sections of the frond can appear scorched, reducing the leaf's ability to photosynthesize and weakening the overall health of the palm. The disease tends to spread more quickly in warm, humid conditions with poor air circulation.",
    symptoms: [
      'Small faint yellow-brown spots on leaflets, easy to mistake for aging',
      'Spots enlarge and merge, forming grayish centers with dark brown or reddish borders',
      'Affected tissue dries, turns brittle, and dies',
      'Large scorched-looking sections of the frond in advanced stages',
    ],
    management: [
      'Inspect leaves regularly so early spots are caught before they spread',
      'Remove and dispose of severely affected fronds away from the plantation',
      'Improve air circulation and avoid conditions that keep fronds wet for long periods',
      'Maintain balanced palm nutrition; stressed palms are more susceptible',
      'Consult an agricultural technician before applying any treatment',
    ],
  },
  {
    key: 'leaf_rot',
    name: 'Coconut Leaf Rot Disease Complex (LRDC)',
    scientificName: 'Coconut Leaf Rot Disease Complex (LRDC)',
    description:
      'Leaf rot is a disease that typically starts at the tip or edges of the coconut leaflet, appearing as subtle water-soaked or discolored patches. As it advances, the affected tissue softens and darkens, turning brown to black as decay spreads inward toward the midrib. In severe cases, the rot can produce a distinct foul odor and cause entire leaflets to collapse and wither. Leaf rot progresses fastest during periods of heavy rainfall or prolonged moisture, and can significantly weaken young or already-stressed palms if left untreated.',
    symptoms: [
      'Water-soaked or discolored patches starting at the leaflet tip or edges',
      'Tissue softens and darkens, turning brown to black',
      'Decay spreads inward toward the midrib',
      'Foul odor and collapsing, withering leaflets in severe cases',
    ],
    management: [
      'Check palms more frequently during and after heavy rainfall',
      'Remove rotted leaflet portions and dispose of them away from healthy palms',
      'Reduce prolonged leaf wetness where possible',
      'Pay special attention to young or stressed palms, which are more vulnerable',
      'Consult an agricultural technician before applying any treatment',
    ],
  },
  {
    key: 'healthy',
    name: 'Healthy Coconut Leaf',
    scientificName: null,
    description:
      'A healthy coconut leaflet is uniformly green with a smooth surface and firm texture. Natural aging of older fronds can cause gradual yellowing from the tip, which is not a disease. Use healthy leaves as a visual baseline when comparing suspicious spots or discoloration.',
    symptoms: [
      'Uniform green color across the leaflet',
      'No spots, lesions, or dark borders',
      'Firm, intact leaf tissue without soft or wet areas',
    ],
    management: ['Continue regular inspection of young and mature fronds', 'Keep records of scans so changes can be spotted early'],
  },
];

export const ABOUT_TEXT =
  'CocoScan helps coconut farmers spot gray leaf spot and leaf rot before they spread. Early symptoms like faint yellow-brown spots or subtle discoloration are easy to miss, and by the time they’re obvious, the disease has usually already taken hold. Just snap a photo of a leaf, and our AI checks it against trained disease patterns to flag Healthy, Gray Leaf Spot, or Leaf Rot with a confidence score — all in seconds, right from your phone.';

export const DID_YOU_KNOW = [
  'A single coconut leaf can have hundreds of smaller leaflets.',
  'Early gray leaf spot often looks like ordinary leaf aging.',
  'Leaf rot spreads fastest during long periods of rain.',
  'Good lighting and a steady hand give the clearest scans.',
];
