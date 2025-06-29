import { ZapierTrigger, ZapierZ, ZapierBundle } from '../types';
import { withRetry, logZapAction } from '../utils/common';

/**
 * Interface para una nueva fila de Google Sheets Lead Scoring
 */
interface GoogleSheetsLeadRow {
  id: string;
  email: string;
  external_score: number;
  timestamp: string;
  name?: string;
  company?: string;
  source?: string;
  raw_data: any;
}

/**
 * Obtiene nuevas filas de la hoja Lead Scoring en Google Sheets
 */
const getNewLeadScoringRows = async (
  z: ZapierZ,
  bundle: ZapierBundle
): Promise<GoogleSheetsLeadRow[]> => {
  const accessToken = bundle.authData.google_access_token;
  const spreadsheetId =
    bundle.authData.google_spreadsheet_id || bundle.inputData.spreadsheet_id;
  const sheetName = 'Lead Scoring'; // Nombre específico de la hoja

  if (!spreadsheetId) {
    throw new Error('Google Spreadsheet ID is required');
  }

  // Calcular rango de tiempo para obtener solo filas recientes
  const since = new Date();
  since.setMinutes(since.getMinutes() - 15); // Últimos 15 minutos
  const sinceTimestamp = since.getTime();

  // URL del Google Sheets API para obtener valores
  const range = `${sheetName}!A:Z`; // Obtener todas las columnas
  const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const request = {
    url: sheetsUrl,
    method: 'GET' as const,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    params: {
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    },
  };

  try {
    const response = await withRetry(() => z.request(request), 3);
    const data = response.data;

    if (!data.values || data.values.length === 0) {
      await logZapAction(z, {
        action: 'trigger_google_sheets_lead_scoring',
        timestamp: new Date().toISOString(),
        success: true,
        data: {
          spreadsheet_id: spreadsheetId,
          sheet_name: sheetName,
          rows_found: 0,
          since_timestamp: sinceTimestamp,
        },
      });
      return [];
    }

    const rows = data.values;
    const headers = rows[0]; // Primera fila contiene los headers
    const dataRows = rows.slice(1); // Resto son datos

    // Encontrar índices de las columnas importantes
    const emailIndex = headers.findIndex((h: string) =>
      h.toLowerCase().includes('email')
    );
    const scoreIndex = headers.findIndex(
      (h: string) =>
        h.toLowerCase().includes('external_score') ||
        h.toLowerCase().includes('score')
    );
    const timestampIndex = headers.findIndex(
      (h: string) =>
        h.toLowerCase().includes('timestamp') ||
        h.toLowerCase().includes('date')
    );
    const nameIndex = headers.findIndex((h: string) =>
      h.toLowerCase().includes('name')
    );
    const companyIndex = headers.findIndex((h: string) =>
      h.toLowerCase().includes('company')
    );
    const sourceIndex = headers.findIndex((h: string) =>
      h.toLowerCase().includes('source')
    );

    if (emailIndex === -1 || scoreIndex === -1) {
      throw new Error(
        'Required columns (email, external_score) not found in Lead Scoring sheet'
      );
    }

    // Filtrar filas nuevas basado en timestamp
    const newRows: GoogleSheetsLeadRow[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      // Verificar que la fila tiene datos
      if (!row[emailIndex] || !row[scoreIndex]) {
        continue;
      }

      // Verificar timestamp si está disponible
      let isNew = true;
      if (timestampIndex !== -1 && row[timestampIndex]) {
        const rowTimestamp = new Date(row[timestampIndex]).getTime();
        isNew = rowTimestamp > sinceTimestamp;
      }

      if (isNew) {
        const leadRow: GoogleSheetsLeadRow = {
          id: `sheet-row-${i + 2}`, // +2 porque empezamos desde fila 1 y saltamos header
          email: row[emailIndex]?.toString() || '',
          external_score: parseInt(row[scoreIndex]) || 0,
          timestamp:
            row[timestampIndex]?.toString() || new Date().toISOString(),
          name: nameIndex !== -1 ? row[nameIndex]?.toString() : '',
          company: companyIndex !== -1 ? row[companyIndex]?.toString() : '',
          source: sourceIndex !== -1 ? row[sourceIndex]?.toString() : '',
          raw_data: {
            row_number: i + 2,
            raw_values: row,
            headers: headers,
          },
        };

        newRows.push(leadRow);
      }
    }

    // Log de la acción
    await logZapAction(z, {
      action: 'trigger_google_sheets_lead_scoring',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        spreadsheet_id: spreadsheetId,
        sheet_name: sheetName,
        total_rows: dataRows.length,
        new_rows: newRows.length,
        since_timestamp: sinceTimestamp,
      },
    });

    return newRows;
  } catch (error: any) {
    // Log del error
    await logZapAction(z, {
      action: 'trigger_google_sheets_lead_scoring',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Unknown error',
      data: {
        spreadsheet_id: spreadsheetId,
        sheet_name: sheetName,
        since_timestamp: sinceTimestamp,
      },
    });

    z.console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
};

/**
 * Configuración del trigger para nuevas filas en Google Sheets Lead Scoring
 */
const trigger: ZapierTrigger = {
  key: 'new_google_sheets_lead_scoring',
  noun: 'Google Sheets Lead Scoring Row',
  display: {
    label: 'New Lead Scoring Row in Google Sheets',
    description:
      'Triggers when a new row is added to the Lead Scoring sheet in Google Sheets',
    important: true,
  },
  operation: {
    type: 'polling',
    perform: getNewLeadScoringRows,
    sample: {
      id: 'sheet-row-5',
      email: 'john.doe@example.com',
      external_score: 75,
      timestamp: '2024-01-15T10:30:00Z',
      name: 'John Doe',
      company: 'Example Corp',
      source: 'Website Form',
    },
    outputFields: [
      { key: 'id', label: 'Row ID', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'external_score', label: 'External Score', type: 'integer' },
      { key: 'timestamp', label: 'Timestamp', type: 'datetime' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'company', label: 'Company', type: 'string' },
      { key: 'source', label: 'Source', type: 'string' },
    ],
  },
};

export default trigger;
