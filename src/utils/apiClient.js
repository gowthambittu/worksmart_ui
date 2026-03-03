import API_HOST from '../config';

const generateRequestId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `req-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

export const apiFetch = async (path, options = {}) => {
    const requestId = generateRequestId();
    const headers = {
        Accept: 'application/json',
        ...(options.headers || {}),
        'X-Request-ID': requestId,
    };

    const response = await fetch(`${API_HOST}${path}`, {
        ...options,
        headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        // Keep console logs minimal and safe; no request payload logging.
        console.error('API request failed', {
            requestId,
            status: response.status,
            path,
        });
        const error = new Error(`Request failed with status ${response.status}`);
        error.requestId = requestId;
        error.status = response.status;
        error.data = body;
        throw error;
    }

    return {
        requestId,
        data: body,
        status: response.status,
    };
};
