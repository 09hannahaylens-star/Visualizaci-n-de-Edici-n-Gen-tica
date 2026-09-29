/**
 * Tipos y definiciones para la experiencia visual "CRISPR: Del ADN a la Edición"
 */

export type SceneId =
  | 'hero'
  | 'organism_to_dna'
  | 'target_region'
  | 'guide_rna'
  | 'cas9_assembly'
  | 'recognition'
  | 'cleavage'
  | 'repair'
  | 'off_target'
  | 'cellular_effect'
  | 'medical_casgevy'
  | 'somatic_germline'
  | 'limits';

export interface SceneMeta {
  id: SceneId;
  index: number;
  numberStr: string;
  shortTitle: string;
  fullTitle: string;
  tagline: string;
  category: 'Escala' | 'Complejo' | 'Acción' | 'Respuesta' | 'Impacto';
}

export const SCENES: SceneMeta[] = [
  {
    id: 'hero',
    index: 0,
    numberStr: '00',
    shortTitle: 'Inicio',
    fullTitle: 'CRISPR: Del ADN a la Edición',
    tagline: 'Una experiencia visual sobre la edición genética',
    category: 'Escala'
  },
  {
    id: 'organism_to_dna',
    index: 1,
    numberStr: '01',
    shortTitle: 'Organismo al ADN',
    fullTitle: 'Del Organismo al ADN',
    tagline: 'Un viaje a través de las escalas biológicas hacia la molécula de la vida',
    category: 'Escala'
  },
  {
    id: 'target_region',
    index: 2,
    numberStr: '02',
    shortTitle: 'Región Objetivo',
    fullTitle: 'Encontrar la Región Objetivo',
    tagline: 'Identificación de la secuencia diana y el motivo adyacente PAM',
    category: 'Complejo'
  },
  {
    id: 'guide_rna',
    index: 3,
    numberStr: '03',
    shortTitle: 'ARN Guía',
    fullTitle: 'Llega el ARN Guía (gRNA)',
    tagline: 'Estructura molecular con secuencia espaciadora y horquillas de andamio',
    category: 'Complejo'
  },
  {
    id: 'cas9_assembly',
    index: 4,
    numberStr: '04',
    shortTitle: 'Proteína Cas9',
    fullTitle: 'Aparece la Endonucleasa Cas9',
    tagline: 'Formación del complejo ribonucleoproteico (RNP: Cas9 + ARN guía)',
    category: 'Complejo'
  },
  {
    id: 'recognition',
    index: 5,
    numberStr: '05',
    shortTitle: 'Reconocimiento',
    fullTitle: 'Reconocimiento de la Secuencia',
    tagline: 'Inspección de la doble hélice, apertura y apareamiento molecular',
    category: 'Acción'
  },
  {
    id: 'cleavage',
    index: 6,
    numberStr: '06',
    shortTitle: 'El Corte',
    fullTitle: 'Corte de Doble Cadena (DSB)',
    tagline: 'Activación de los dominios catalíticos HNH y RuvC para escindir el ADN',
    category: 'Acción'
  },
  {
    id: 'repair',
    index: 7,
    numberStr: '07',
    shortTitle: 'Reparación',
    fullTitle: '¿Qué pasa después? Reparación Celular',
    tagline: 'Vías biológicas de respuesta: NHEJ (unión no homóloga) y HDR (dirigida)',
    category: 'Respuesta'
  },
  {
    id: 'off_target',
    index: 8,
    numberStr: '08',
    shortTitle: 'Fidelidad',
    fullTitle: '¿La edición fue perfecta? Efectos Off-Target',
    tagline: 'El reto de la especificidad: discriminación de secuencias no deseadas',
    category: 'Respuesta'
  },
  {
    id: 'cellular_effect',
    index: 9,
    numberStr: '09',
    shortTitle: 'Efecto Celular',
    fullTitle: 'Del Cambio Molecular al Efecto Celular',
    tagline: 'Traducción de la secuencia alterada en la función y morfología de la célula',
    category: 'Impacto'
  },
  {
    id: 'medical_casgevy',
    index: 10,
    numberStr: '10',
    shortTitle: 'Medicina & Casgevy',
    fullTitle: 'Cuando la Edición Llega a la Medicina',
    tagline: 'El hito clínico de Casgevy: edición celular ex vivo para la hemoglobina fetal',
    category: 'Impacto'
  },
  {
    id: 'somatic_germline',
    index: 11,
    numberStr: '11',
    shortTitle: 'Somática vs Germinal',
    fullTitle: 'Edición Somática y Edición Germinal',
    tagline: 'Diferencia fundamental de alcance celular, impacto biológico y consideraciones bioéticas',
    category: 'Impacto'
  },
  {
    id: 'limits',
    index: 12,
    numberStr: '12',
    shortTitle: 'Los Límites',
    fullTitle: 'Los Límites y el Futuro',
    tagline: 'Podemos editar el ADN: ¿Cómo decidimos hasta dónde utilizar esa posibilidad?',
    category: 'Impacto'
  }
];

export interface BasePair {
  id: number;
  letterTop: 'A' | 'T' | 'C' | 'G';
  letterBottom: 'T' | 'A' | 'G' | 'C';
  isTarget?: boolean;
  isPam?: boolean;
  isCutSite?: boolean;
  isOffTargetMatch?: boolean;
}
