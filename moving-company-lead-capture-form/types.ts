
export interface Prospect {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

export enum HomeSize {
  Studio = "studio",
  OneBR = "1BR",
  TwoBR = "2BR",
  ThreeBR = "3BR",
  FourBRPlus = "4BR+",
}

export enum StairsOrElevator {
  None = "none",
  Stairs = "stairs",
  Elevator = "elevator",
  Both = "both",
}

export enum BudgetRange {
  Under500 = "<500",
  From500To999 = "$500-$999",
  From1kTo1_9k = "$1k-$1.9k",
  From2kTo3_9k = "$2k-$3.9k",
  Over4k = ">$4k",
}

export interface Move {
  from_zip: string;
  to_zip: string;
  date: string | null;
  flexible: boolean;
  home_size: HomeSize | null;
  items_count: number | null;
  stairs_or_elevator: StairsOrElevator | null;
  parking_constraints: string | null;
  budget_range: BudgetRange | null;
  notes: string | null;
}

export interface Tracking {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  fbclid: string | null;
  referrer_url: string | null;
  landing_url: string | null;
  user_agent: string | null;
  ip: string | null;
  first_page_seen_at: string | null;
  session_id: string | null;
}

export interface Consent {
  tcpa: boolean;
  text: string;
}

export interface LeadData {
  lead_id?: string;
  timestamp?: string;
  prospect: Prospect;
  move: Move;
  tracking: Tracking;
  consent: Consent;
  // Honeypot field for spam prevention
  honeypot_nickname: string;
}

export type FormErrors = {
  [key in keyof (Prospect & Move & Consent)]?: string;
};

export interface Step {
  id: number;
  name: string;
  fields: (keyof (Prospect & Move & Consent))[];
}
