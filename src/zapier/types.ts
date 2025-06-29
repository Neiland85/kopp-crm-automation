// Tipos para Zapier Platform Core
export interface ZapierBundle {
  authData: {
    hubspot_api_key: string;
    slack_webhook_url: string;
    google_access_token?: string;
    google_spreadsheet_id?: string;
  };
  inputData: any;
  cleanedRequest?: any;
  rawRequest?: any;
  targetUrl?: string;
}

export interface ZapierZ {
  console: {
    log: (message: string, data?: any) => void;
    error: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
  };
  errors: {
    Error: new (message: string) => Error;
    RefreshAuthError: new (message: string) => Error;
    HaltedError: new (message: string) => Error;
  };
  request: (options: any) => Promise<any>;
  JSON: {
    parse: (text: string) => any;
    stringify: (value: any) => string;
  };
  cursor: {
    get: () => string | null;
    store: (cursor: string) => void;
  };
  dehydrate: (func: Function, data: any) => any;
  stashFile: (request: any) => Promise<string>;
}

export interface ZapierRequest {
  url: string;
  method: string;
  headers?: { [key: string]: string };
  params?: { [key: string]: any };
  data?: any;
  json?: any;
}

export interface ZapierResponse {
  status: number;
  headers: { [key: string]: string };
  content: string;
  json?: any;
  request: ZapierRequest;
}

// Tipos específicos para HubSpot
export interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  last_form_submitted?: string;
  last_submission_date?: string;
  phone?: string;
  company?: string;
}

export interface HubSpotFormSubmission {
  id: string;
  form_id: string;
  portal_id: string;
  submitted_at: string;
  page_url?: string;
  page_title?: string;
  values: Array<{ name: string; value: any }>;
  contact_email: string;
  contact_firstname?: string;
  contact_lastname?: string;
  contact_phone?: string;
  contact_company?: string;
  raw_data?: any;
}

export interface HubSpotPageView {
  id: string;
  portal_id: string;
  email?: string;
  page_url: string;
  page_title: string;
  timestamp: string;
  session_id?: string;
  visitor_id?: string;
  raw_data?: any;
}

// Tipos para Slack Block Kit
export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  elements?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
      emoji?: boolean;
    };
    style?: string;
    url?: string;
  }>;
}

export interface SlackMessage {
  blocks: SlackBlock[];
  username?: string;
  icon_emoji?: string;
  channel?: string;
}

// Configuración de triggers y creates
export interface ZapierTrigger {
  key: string;
  noun: string;
  display: {
    label: string;
    description: string;
    important?: boolean;
  };
  operation: {
    type: string;
    perform: (z: ZapierZ, bundle: ZapierBundle) => Promise<any[]>;
    sample?: any;
    outputFields?: Array<{
      key: string;
      label: string;
      type?: string;
    }>;
  };
}

export interface ZapierCreate {
  key: string;
  noun: string;
  display: {
    label: string;
    description: string;
    important?: boolean;
  };
  operation: {
    perform: (z: ZapierZ, bundle: ZapierBundle) => Promise<any>;
    inputFields: Array<{
      key: string;
      label: string;
      type?: string;
      required?: boolean;
      helpText?: string;
    }>;
    sample?: any;
    outputFields?: Array<{
      key: string;
      label: string;
      type?: string;
    }>;
  };
}

// Error personalizado para logging
export interface ZapError {
  status?: number;
  message: string;
  url?: string;
  timestamp: string;
  operation: string;
  data?: any;
}
