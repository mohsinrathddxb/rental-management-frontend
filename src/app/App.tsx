import { ConfigProvider, theme } from 'antd'
import { AppProviders } from './providers'
import { AppRouter } from './router'

const appTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#0b1c2e',
    colorInfo: '#0b1c2e',
    colorSuccess: '#2f855a',
    colorWarning: '#d69e2e',
    colorError: '#c53030',
    borderRadius: 12,
    fontFamily:
      '"Segoe UI", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#0b1c2e',
      siderBg: '#0b1c2e',
      bodyBg: '#f6f1e6',
      triggerBg: '#10263d',
    },
    Menu: {
      darkItemBg: '#0b1c2e',
      darkItemSelectedBg: '#163657',
      darkItemHoverBg: '#112a44',
      darkItemColor: '#f8f5ef',
      darkItemSelectedColor: '#f7d67b',
    },
    Card: {
      borderRadiusLG: 18,
    },
    Table: {
      headerBg: '#0b1c2e',
      headerColor: '#f8f5ef',
      headerSplitColor: '#1f3b59',
      rowHoverBg: '#faf5e8',
      borderColor: '#ead7a4',
    },
  },
}

export default function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ConfigProvider>
  )
}
