// 统一配置管理
export const config = {
  site: {
    name: import.meta.env.VITE_SITE_NAME,
    author: import.meta.env.VITE_SITE_ANTHOR,
    url: import.meta.env.VITE_SITE_URL,
  },
  api: {
    weatherKey: import.meta.env.VITE_WALLPAPERS_KEY,
  },
  wallpapers: {
    local: {
      count: 10, // 本地壁纸数量
      format: 'jpg'
    }
  }
}; 