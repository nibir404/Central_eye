// BTRC Official Datasets & Helper Definitions
// Source: Bangladesh Telecommunication Regulatory Commission (https://btrc.gov.bd)

import btrcTeledensity from '@/public/data/btrc_teledensity.json';
import btrcMobileSubs from '@/public/data/btrc_mobile_subscribers.json';
import btrcInternetSubs from '@/public/data/btrc_internet_subscribers.json';
import btrcHandsets from '@/public/data/btrc_handsets.json';
import btrcTowers from '@/public/data/btrc_towers.json';
import btrcMnoPenetration from '@/public/data/btrc_mno_penetration.json';
import btrcQos from '@/public/data/btrc_qos.json';
import btrcSpectrum from '@/public/data/btrc_spectrum.json';
import btrcOpticalFiber from '@/public/data/btrc_optical_fiber.json';
import btrcVoipTermination from '@/public/data/btrc_voip_termination.json';
import btrcSummary from '@/public/data/btrc_unified_summary.json';

export interface TeledensityRecord {
  month_bn: string;
  month_en: string;
  teledensity_pct: number;
  internet_penetration_pct: number;
  fixed_broadband_pct: number;
  mobile_internet_pct: number;
  mobile_broadband_subs_m: number;
  mobile_broadband_penetration_pct: number;
  subs_3g_m: number;
  subs_4g_m: number;
}

export interface MobileSubscriberRecord {
  month_bn: string;
  month_en: string;
  grameenphone_m: number;
  robi_m: number;
  banglalink_m: number;
  teletalk_m: number;
  total_subs_m: number;
}

export interface InternetSubscriberRecord {
  month_bn: string;
  month_en: string;
  mobile_internet_m: number;
  isp_pstn_m: number;
  total_internet_m: number;
}

export interface HandsetProductionRecord {
  month_bn: string;
  month_en: string;
  tech_2g_lakh: number;
  tech_3g_lakh: number;
  tech_4g_lakh: number;
  tech_5g_lakh: number;
  total_lakh: number;
  feature_phone_pct: number;
  smartphone_pct: number;
}

export interface HandsetImportRecord {
  month_bn: string;
  month_en: string;
  tech_2g_units: number;
  tech_3g_units: number;
  tech_4g_units: number;
  tech_5g_units: number;
  total_units: number;
  feature_phone_pct: number;
  smartphone_pct: number;
}

export interface TowerRecord {
  month: string;
  gp: number;
  robi: number;
  banglalink: number;
  teletalk: number;
  edotco: number;
  summit: number;
  kirtonkhola: number;
  frontier: number;
  btcl: number;
  total_towers: number;
}

export interface SpectrumOperator {
  operator: string;
  operator_bn: string;
  band_700mhz: number;
  band_900mhz: number;
  band_1800mhz: number;
  band_2100mhz: number;
  band_2_3ghz: number;
  band_2_6ghz: number;
  total_mhz: number;
  share_pct: number;
}

export interface OpticalFiberData {
  total_km: number;
  government: {
    total_km: number;
    overhead_km: number;
    underground_km: number;
    pct_of_total: number;
    initiatives: string[];
  };
  private: {
    total_km: number;
    overhead_km: number;
    underground_km: number;
    pct_of_total: number;
    key_nttns: string[];
  };
  submarine_cables: Array<{
    name: string;
    landing_station: string;
    operational_since?: string;
    target?: string;
    capacity: string;
    status: string;
  }>;
}

export interface BTRCSummary {
  source: string;
  portal: string;
  last_updated: string;
  metrics: {
    teledensity_pct: number;
    internet_penetration_pct: number;
    total_mobile_subs_m: number;
    total_internet_subs_m: number;
    total_towers: number;
    total_optical_fiber_km: number;
    spectrum_allocated_mhz: number;
  };
  operator_shares: Record<string, { subs_m: number; share_pct: number }>;
}

export const BTRC_TELEDENSITY: TeledensityRecord[] = btrcTeledensity as TeledensityRecord[];
export const BTRC_MOBILE_SUBS: MobileSubscriberRecord[] = btrcMobileSubs as MobileSubscriberRecord[];
export const BTRC_INTERNET_SUBS: InternetSubscriberRecord[] = btrcInternetSubs as InternetSubscriberRecord[];
export const BTRC_HANDSETS = btrcHandsets as { local_manufacturing: HandsetProductionRecord[]; imports: HandsetImportRecord[] };
export const BTRC_TOWERS: TowerRecord[] = btrcTowers as TowerRecord[];
export const BTRC_MNO_PENETRATION = btrcMnoPenetration as Record<string, any[]>;
export const BTRC_QOS = btrcQos as Record<string, { source_pdf: string; period: string; kpis: any[] }>;
export const BTRC_SPECTRUM = btrcSpectrum as {
  title: string;
  bands: string[];
  operators: SpectrumOperator[];
  band_totals: Record<string, number>;
};
export const BTRC_OPTICAL_FIBER: OpticalFiberData = btrcOpticalFiber as OpticalFiberData;
export const BTRC_VOIP = btrcVoipTermination as {
  total_illegal_sims_blocked: number;
  total_illegal_voip_raids: number;
  equipment_seized: Record<string, number>;
  revenue_loss_prevented_bdt_crore: number;
  current_year_enforcements: Array<{ division: string; raids: number; sims_deactivated: number; gateway_seized: number; status: string }>;
};
export const BTRC_METADATA: BTRCSummary = btrcSummary as BTRCSummary;

export type TelcoSubMenuId =
  | 'teledensity'
  | 'mobile-subscribers'
  | 'internet-subscribers'
  | 'handsets'
  | 'towers'
  | 'mno-penetration'
  | 'qos'
  | 'spectrum'
  | 'optical-fiber'
  | 'voip-termination';

export interface TelcoSubMenuItem {
  id: TelcoSubMenuId;
  title_bn: string;
  title_en: string;
  countBadge?: string;
  sourceUrl: string;
}

export const TELCO_SUBMENU_ITEMS: TelcoSubMenuItem[] = [
  {
    id: 'teledensity',
    title_bn: 'টেলিডেনসিটি',
    title_en: 'Teledensity & Broadband',
    countBadge: `${BTRC_METADATA.metrics.teledensity_pct}%`,
    sourceUrl: 'https://btrc.gov.bd/pages/static-pages/teledensity-penetration-8ecc0e-6922e009933eb65569e2524c',
  },
  {
    id: 'mobile-subscribers',
    title_bn: 'মোবাইল গ্রাহক',
    title_en: 'Mobile Subscribers',
    countBadge: `${BTRC_METADATA.metrics.total_mobile_subs_m}M`,
    sourceUrl: 'https://btrc.gov.bd/pages/static-pages/6922dda8933eb65569e15c3d',
  },
  {
    id: 'internet-subscribers',
    title_bn: 'ইন্টারনেট গ্রাহক',
    title_en: 'Internet Subscribers',
    countBadge: `${BTRC_METADATA.metrics.total_internet_subs_m}M`,
    sourceUrl: 'https://btrc.gov.bd/pages/static-pages/6922e0a3933eb65569e27f59',
  },
  {
    id: 'handsets',
    title_bn: 'মোবাইল ফোন হ্যান্ডসেটের তথ্য',
    title_en: 'Handsets (Local & Import)',
    countBadge: '5G/4G/2G',
    sourceUrl: 'https://btrc.gov.bd/pages/static-pages/6922df27933eb65569e20359',
  },
  {
    id: 'towers',
    title_bn: 'অপারেটর টাওয়ার সংখ্যা',
    title_en: 'Towers Infrastructure',
    countBadge: `${BTRC_METADATA.metrics.total_towers.toLocaleString()}`,
    sourceUrl: 'https://btrc.gov.bd/pages/static-pages/number-of-operator-s-towers-3a9686-6922dbce933eb65569e0cab2',
  },
  {
    id: 'mno-penetration',
    title_bn: 'এমএনও নেটওয়ার্কে হ্যান্ডসেট পেনিট্রেশন',
    title_en: 'MNO Handset Penetration',
    countBadge: '700M/2.6G',
    sourceUrl: 'https://btrc.gov.bd/pages/miscellaneous-infos?filters=%7B%22miscellaneous_info_type%22%3A%226a82b2d4f3e3dd14e339e946%22%7D',
  },
  {
    id: 'qos',
    title_bn: 'সেবার মান (QoS) সংক্রান্ত তথ্য',
    title_en: 'Quality of Service (QoS)',
    countBadge: '11 KPIs',
    sourceUrl: 'https://btrc.gov.bd/pages/miscellaneous-infos?filters=%7B%22miscellaneous_info_type%22%3A%226a95a4671c79f3cb24e166c4%22%7D',
  },
  {
    id: 'spectrum',
    title_bn: 'বরাদ্দকৃত তরঙ্গের তথ্য',
    title_en: 'Allocated Frequencies',
    countBadge: `${BTRC_SPECTRUM.band_totals.total_mhz} MHz`,
    sourceUrl: 'https://btrc.gov.bd/pages/static-pages/information-on-allocated-frequencies-btrc-6a95365fcb81efaf5dd1a83f',
  },
  {
    id: 'optical-fiber',
    title_bn: 'অপটিক্যাল ফাইবারের তথ্য',
    title_en: 'Optical Fiber Network',
    countBadge: `${BTRC_OPTICAL_FIBER.total_km.toLocaleString()} km`,
    sourceUrl: 'https://btrc.gov.bd/pages/static-pages/optical-fiber-information-btrc-6a95310e9ab15f9160845e66',
  },
  {
    id: 'voip-termination',
    title_bn: 'অবৈধ ভিওআইপি ও সেবা বন্ধ',
    title_en: 'Illegal VoIP & Termination',
    countBadge: '14.2M SIMs',
    sourceUrl: 'https://btrc.gov.bd/pages/static-pages/termination-illegal-voip-3175ed-6922def9933eb65569e1ed71',
  },
];
