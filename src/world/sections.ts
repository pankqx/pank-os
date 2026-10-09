export const sections = [
  { id: 'person', num: 'I', label: 'The Person', key: '1' },
  { id: 'lab', num: 'II', label: 'The Laboratory', key: '2' },
  { id: 'transmissions', num: 'III', label: 'Transmissions', key: '3' },
  { id: 'trophy', num: 'IV', label: 'The Trophy Room', key: '4' },
  { id: 'contact', num: 'V', label: 'The Boundary', key: '5' },
] as const
export type SectionId = (typeof sections)[number]['id']
