export const GENERIC_ERROR_MESSAGE = 'The operation was unsuccessful, please try again later'
export const VALID_URL: RegExp = /^((https?):\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(:\d+)?(\/[a-zA-Z0-9\-._~:\/?#[\]@!$&'()*+,;%=]*)*(\?[a-zA-Z0-9\-._~:\/?#[\]@!$&'()*+,;%=]*)?$/
export const QUERY_LIMIT = 20;
export const CHART_OPTIONS = {
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom' as const,
        },
        title: {
            display: false,
        }
    },
};
export const DATETIME_PICKER_OPTIONS = {
    clickOpens: false,
    position: 'auto center' as const,
    mode: 'single' as const,
    minuteIncrement: 1,
    disableMobile: true,
    inline: true
}
export const MINIMUM_MINUTE_DIFF = 5;
export const MINIMUM_DATETIME = Date.now() + (60 * 1000 * (MINIMUM_MINUTE_DIFF + 1));
export const CLIENT_IP_HEADERS = (headers: Headers) => headers.get('x-client-ip') || headers.get('x-forwarded-for')?.split(',')[0] || headers.get('cf-connecting-ip')
|| headers.get('fastly-client-ip') || headers.get('true-client-ip') || headers.get('x-real-ip') || headers.get('x-cluster-client-ip') || headers.get('appengine-user-ip')
|| headers.get('x-forwarded') || headers.get('forwarded-for') || headers.get('cf-pseudo-ipv4');