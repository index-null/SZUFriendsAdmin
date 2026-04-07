import { onMounted } from 'vue'
import { useUserStore } from '@/stores/modules/user'

const CDN_URL =
  'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js'

let initialized = false

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const el = document.createElement('script')
    el.src = src
    el.onload = () => resolve()
    el.onerror = reject
    document.head.appendChild(el)
  })
}

export function useChatSDK() {
  onMounted(async () => {
    if (initialized) return
    const botId = import.meta.env.VITE_COZE_BOT_ID
    const token = import.meta.env.VITE_COZE_API_KEY
    if (!botId || !token) return

    try {
      await loadScript(CDN_URL)
      const SDK = (window as any).CozeWebSDK
      if (!SDK?.WebChatClient) return

      const userStore = useUserStore()
      const { userInfo } = userStore

      new SDK.WebChatClient({
        config: {
          bot_id: botId,
        },
        auth: {
          type: 'token',
          token,
          onRefreshToken: () => token,
        },
        userInfo: {
          id: userInfo.userId != null ? String(userInfo.userId) : undefined,
          nickname: userInfo.nickname || userInfo.username || '管理员',
          url: userInfo.avatar || undefined,
        },
        ui: {
          base: {
            layout: 'pc',
            lang: 'zh-CN',
            zIndex: 99999,
          },
          asstBtn: {
            isNeed: true,
          },
          header: {
            isShow: true,
            isNeedClose: true,
          },
          footer: {
            isShow: true,
            expressionText: 'Powered by {{coze}}',
            linkvars: {
              coze: {
                text: '深大校友录',
                link: 'https://www.szu.edu.cn',
              },
            },
          },
          chatBot: {
            title: '校友录 AI 助手',
            uploadable: false,
            width: 420,
            isNeedAddNewConversation: true,
          },
          conversations: {
            isNeed: true,
          },
        },
      })

      initialized = true
    } catch (err) {
      console.error('[ChatSDK] 初始化失败:', err)
    }
  })
}
