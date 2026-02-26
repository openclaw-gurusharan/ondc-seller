export interface BecknMessage {
  context:: string;
    {
    domain action: string;
    transaction_id: string;
    message_id: string;
    timestamp: string;
  };
  message: Record<string, unknown>;
}

export interface BecknResponse {
  message: BecknMessage;
  error?: {
    code: string;
    message: string;
  };
}

export class BecknAdapter {
  private apiKey: string;
  private becknUrl: string;

  constructor(apiKey: string, becknUrl: string) {
    this.apiKey = apiKey;
    this.becknUrl = becknUrl;
  }

  async on_search(payload: BecknMessage): Promise<BecknResponse> {
    try {
      const response = await fetch(`${this.becknUrl}/on_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return {
        message: payload,
        error: {
          code: 'ON_SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async on_select(payload: BecknMessage): Promise<BecknResponse> {
    try {
      const response = await fetch(`${this.becknUrl}/on_select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return {
        message: payload,
        error: {
          code: 'ON_SELECT_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async on_init(payload: BecknMessage): Promise<BecknResponse> {
    try {
      const response = await fetch(`${this.becknUrl}/on_init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return {
        message: payload,
        error: {
          code: 'ON_INIT_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async on_confirm(payload: BecknMessage): Promise<BecknResponse> {
    try {
      const response = await fetch(`${this.becknUrl}/on_confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return {
        message: payload,
        error: {
          code: 'ON_CONFIRM_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async on_status(payload: BecknMessage): Promise<BecknResponse> {
    try {
      const response = await fetch(`${this.becknUrl}/on_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return {
        message: payload,
        error: {
          code: 'ON_STATUS_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async on_cancel(payload: BecknMessage): Promise<BecknResponse> {
    try {
      const response = await fetch(`${this.becknUrl}/on_cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return {
        message: payload,
        error: {
          code: 'ON_CANCEL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async on_update(payload: BecknMessage): Promise<BecknResponse> {
    try {
      const response = await fetch(`${this.becknUrl}/on_update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return {
        message: payload,
        error: {
          code: 'ON_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}

export default BecknAdapter;
