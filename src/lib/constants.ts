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