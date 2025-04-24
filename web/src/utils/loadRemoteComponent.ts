import { loadModule } from 'vue3-sfc-loader'

export function loadRemoteComponent(url: string, moduleCache: Record<string, any>, fileName?: string) {
  const componentRef = shallowRef<any>(null)

  useHttp()
    .get(url)
    .then(async (res: any) => {
      if (res.data && typeof res.data.vue === 'string') {
        const options = {
          moduleCache,
          getFile(path) {
            if (path.endsWith('.vue')) {
              return res.data.vue
            }
            else if (path.endsWith('.css')) {
              const style = document.createElement('style')
              style.textContent = res.data.css || ''
              document.head.appendChild(style)
              return null
            }
            else {
              console.warn('Unsupported file type:', path)
              return null
            }
          },
          addStyle(textContent: string) {
            const style = Object.assign(document.createElement('style'), { textContent })
            const ref = document.head.getElementsByTagName('style')[0] || null
            document.head.insertBefore(style, ref)
          },
        }

        componentRef.value = defineAsyncComponent(() =>
          loadModule(fileName || res.data.fileName || 'RemoteComponent.vue', options),
        )
      }
    })
    .catch((err: any) => {
      console.error('Failed to load remote component:', err)
    })

  return componentRef
}
