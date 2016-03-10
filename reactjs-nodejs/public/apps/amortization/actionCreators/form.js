export const REQUEST_FORM_UPDATE = 'REQUEST_FORM_UPDATE';

export function requestFormUpdate(id, value) {
    return {
        type:       REQUEST_FORM_UPDATE,
        id:         id,
        value:      value,
        receivedAt: Date.now()
    };
}