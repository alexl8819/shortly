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