// export const globalBaseUrl = 'https://backend.bollettify.com'
export const globalBaseUrl = 'http://localhost:5000'

export default ({ app }) => {
  // app.config.globalProperties.$globalBaseUrl = 'https://backend.bollettify.com'
  app.config.globalProperties.$globalBaseUrl = 'http://localhost:5000'
}
