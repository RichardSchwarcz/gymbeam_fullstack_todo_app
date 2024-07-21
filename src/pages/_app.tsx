import { GeistSans } from 'geist/font/sans'
import { type AppType } from 'next/app'

import { api } from '~/utils/api'

import { ThemeProvider } from 'next-themes'
import { Toaster } from '~/components/ui/toaster'
import '~/styles/globals.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className={GeistSans.className}>
        <Component {...pageProps} />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default api.withTRPC(MyApp)
