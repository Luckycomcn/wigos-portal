import regionCodes from '../data/territoryRegionCodes.json'
import observedVariableLabels from '../data/observedVariableLabels.json'
import type { Locale } from './index'

type OptionLabels = Record<string, readonly [zh: string, fr: string, es: string]>
type OptionGroup = 'type' | 'program' | 'variable' | 'ra' | 'terr'

const labels: Record<OptionGroup, OptionLabels> = {
  type: {
    landFixed: ['陆地（固定）', 'Terrestre (fixe)', 'Terrestre (fija)'],
    landMobile: ['陆地（移动）', 'Terrestre (mobile)', 'Terrestre (móvil)'],
    landOnIce: ['陆地（冰上）', 'Terrestre (sur glace)', 'Terrestre (sobre hielo)'],
    seaFixed: ['海上（固定）', 'Marine (fixe)', 'Marina (fija)'],
    seaMobile: ['海上（移动）', 'Marine (mobile)', 'Marina (móvil)'],
    seaOnIce: ['海上（冰上）', 'Marine (sur glace)', 'Marina (sobre hielo)'],
    lakeRiverFixed: ['湖泊或河流（固定）', 'Lac ou rivière (fixe)', 'Lago o río (fija)'],
    lakeRiverMobile: ['湖泊或河流（移动）', 'Lac ou rivière (mobile)', 'Lago o río (móvil)'],
    underwaterFixed: ['水下（固定）', 'Sous-marine (fixe)', 'Subacuática (fija)'],
    underwaterMobile: ['水下（移动）', 'Sous-marine (mobile)', 'Subacuática (móvil)'],
    airFixed: ['空中（固定）', 'Aérienne (fixe)', 'Aérea (fija)'],
    airMobile: ['空中（移动）', 'Aérienne (mobile)', 'Aérea (móvil)'],
    spaceBased: ['天基', 'Spatiale', 'Espacial'],
  },
  variable: {
    39: ['大气密度', 'Masse volumique de l’air', 'Densidad atmosférica'],
    91: ['次表层盐度', 'Salinité sous la surface', 'Salinidad subsuperficial'],
    92: ['海表盐度', 'Salinité de surface de la mer', 'Salinidad superficial del mar'],
    94: ['次表层温度', 'Température sous la surface', 'Temperatura subsuperficial'],
    95: ['海表温度', 'Température de surface de la mer', 'Temperatura superficial del mar'],
    180: ['云量', 'Couverture nuageuse', 'Cobertura nubosa'],
    210: ['降水量', 'Quantité de précipitations', 'Cantidad de precipitación'],
    211: ['降水持续时间', 'Durée des précipitations', 'Duración de la precipitación'],
    212: ['降水强度', 'Intensité des précipitations', 'Intensidad de la precipitación'],
    213: ['上一时段是否降水', 'Précipitations durant la période précédente (oui/non)', 'Precipitación durante el período anterior (sí/no)'],
    215: ['降水类型', 'Type de précipitations', 'Tipo de precipitación'],
    216: ['大气压力', 'Pression atmosphérique', 'Presión atmosférica'],
    224: ['气温（距参考面指定距离）', 'Température de l’air à une distance spécifiée de la surface de référence', 'Temperatura del aire a una distancia especificada de la superficie de referencia'],
    225: ['露点温度（距参考面指定距离）', 'Température du point de rosée à une distance spécifiée de la surface de référence', 'Temperatura del punto de rocío a una distancia especificada de la superficie de referencia'],
    226: ['极端温度（最低、最高；距参考面指定距离）', 'Température extrême (min., max.) à une distance spécifiée de la surface de référence', 'Temperatura extrema (mín., máx.) a una distancia especificada de la superficie de referencia'],
    227: ['温度廓线', 'Profil de température', 'Perfil de temperatura'],
    230: ['能见度', 'Visibilité', 'Visibilidad'],
    251: ['相对湿度（相对于水）', 'Humidité relative par rapport à l’eau', 'Humedad relativa con respecto al agua'],
    388: ['火灾温度', 'Température du feu', 'Temperatura del fuego'],
    389: ['陆地表面温度', 'Température de surface des terres', 'Temperatura de la superficie terrestre'],
    405: ['海冰表面温度', 'Température de surface de la glace de mer', 'Temperatura superficial del hielo marino'],
    410: ['湖面温度', 'Température de surface du lac', 'Temperatura superficial del lago'],
    596: ['土壤温度', 'Température du sol', 'Temperatura del suelo'],
    629: ['积雪深度', 'Épaisseur de neige', 'Espesor de la nieve'],
    10000: ['大气', 'Atmosphère', 'Atmósfera'],
    10030: ['湿度', 'Humidité', 'Humedad'],
    10039: ['降水', 'Précipitations', 'Precipitación'],
    10051: ['温度', 'Température', 'Temperatura'],
    10059: ['能见度', 'Visibilité', 'Visibilidad'],
    10062: ['地球', 'Terre', 'Tierra'],
    10063: ['海洋', 'Océan', 'Océano'],
    10085: ['外层空间', 'Espace extra-atmosphérique', 'Espacio ultraterrestre'],
    10091: ['陆地', 'Milieu terrestre', 'Medio terrestre'],
    10096: ['温度', 'Température', 'Temperatura'],
    10100: ['湿度', 'Humidité', 'Humedad'],
    10106: ['温度', 'Température', 'Temperatura'],
    10112: ['湿度', 'Humidité', 'Humedad'],
    10113: ['温度', 'Température', 'Temperatura'],
    12005: ['水平风向（距参考面指定距离）', 'Direction du vent horizontal à une distance spécifiée de la surface de référence', 'Dirección del viento horizontal a una distancia especificada de la superficie de referencia'],
    12006: ['水平风速（距参考面指定距离）', 'Vitesse du vent horizontal à une distance spécifiée de la surface de référence', 'Velocidad del viento horizontal a una distancia especificada de la superficie de referencia'],
    12524: ['多年冻土温度', 'Température du pergélisol', 'Temperatura del permafrost'],
    12564: ['比湿', 'Humidité spécifique', 'Humedad específica'],
    12568: ['亮温', 'Température de brillance', 'Temperatura de brillo'],
  },
  ra: {
    africa: ['非洲', 'Afrique', 'África'],
    asia: ['亚洲', 'Asie', 'Asia'],
    europe: ['欧洲', 'Europe', 'Europa'],
    northCentralAmericaCaribbean: ['北美洲、中美洲和加勒比地区', 'Amérique du Nord, Amérique centrale et Caraïbes', 'América del Norte, América Central y el Caribe'],
    southAmerica: ['南美洲', 'Amérique du Sud', 'América del Sur'],
    southWestPacific: ['西南太平洋', 'Pacifique Sud-Ouest', 'Pacífico suroccidental'],
    antarctica: ['南极洲', 'Antarctique', 'Antártida'],
    inapplicable: ['不适用', 'Sans objet', 'No aplicable'],
    unknown: ['未知', 'Inconnu', 'Desconocido'],
  },
  terr: {
    BCT: ['英属加勒比领地', 'Territoires britanniques des Caraïbes', 'Territorios británicos del Caribe'],
    CSM: ['库拉索和圣马丁', 'Curaçao et Saint-Martin', 'Curazao y San Martín'],
    inapplicable: ['不适用', 'Sans objet', 'No aplicable'],
    unknown: ['未知', 'Inconnu', 'Desconocido'],
  },
  program: {
    AMDAR: ['飞机气象资料中继 (AMDAR)', 'Transmission de données météorologiques d’aéronefs (AMDAR)', 'Retransmisión de datos meteorológicos de aeronaves (AMDAR)'],
    GBON: ['全球基本观测网 (GBON)', 'Réseau mondial d’observation de base (GBON)', 'Red Mundial Básica de Observaciones (GBON)'],
    RBON: ['区域基本观测网 (RBON)', 'Réseau régional d’observation de base (RBON)', 'Red Regional Básica de Observaciones (RBON)'],
    RBCN: ['区域基本气候网 (RBCN)', 'Réseau climatologique régional de base (RBCN)', 'Red Climatológica Regional Básica (RBCN)'],
    RBSN: ['区域基本天气网 (RBSN)', 'Réseau synoptique régional de base (RBSN)', 'Red Sinóptica Regional Básica (RBSN)'],
    GCWCryoNet: ['全球冰冻圈监测网 CryoNet 站点', 'Station CryoNet de la Veille mondiale de la cryosphère', 'Estación CryoNet de la Vigilancia de la Criosfera Global'],
    GSN: ['GCOS 地面观测网 (GSN)', 'Réseau de stations d’observation en surface du SMOC (GSN)', 'Red de observación en superficie del SMOC (GSN)'],
    GUAN: ['GCOS 高空观测网 (GUAN)', 'Réseau de stations d’observation en altitude du SMOC (GUAN)', 'Red de observación en altitud del SMOC (GUAN)'],
    WHYCOS: ['世界水文循环观测系统 (WHYCOS)', 'Système mondial d’observation du cycle hydrologique (WHYCOS)', 'Sistema Mundial de Observación del Ciclo Hidrológico (WHYCOS)'],
  },
}

const languageIndex = { zh: 0, fr: 1, es: 2 } as const
const variableLabels: Record<string, string[]> = observedVariableLabels
const regions = new Map(Object.entries(regionCodes))
const displayNames = {
  zh: new Intl.DisplayNames('zh', { type: 'region', fallback: 'none' }),
  fr: new Intl.DisplayNames('fr', { type: 'region', fallback: 'none' }),
  es: new Intl.DisplayNames('es', { type: 'region', fallback: 'none' }),
}

export function searchOptionLabel(group: OptionGroup, id: string, original: string, locale: Locale) {
  if (locale === 'en') return original
  const translated = labels[group][id]?.[languageIndex[locale]]
  if (translated) return translated
  if (group === 'variable') return variableLabels[id]?.[languageIndex[locale]] ?? original
  const region = group === 'terr' ? regions.get(id) : undefined
  return (region && displayNames[locale].of(region)) || original
}
