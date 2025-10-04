import dayjs from 'dayjs'

// 驼峰转蛇形
export function camelToSnake(obj: Record<string, any>): Record<string, any> {
  function toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (match) => '_' + match.toLowerCase())
  }

  function convertKeys(obj: Record<string, any>): Record<string, any> {
    const converted: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeCaseKey = toSnakeCase(key)
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          converted[snakeCaseKey] = convertKeys(obj[key])
        } else if (Array.isArray(obj[key])) {
          converted[snakeCaseKey] = obj[key].map((item: any) => {
            if (typeof item === 'object' && !Array.isArray(item)) {
              return convertKeys(item)
            } else {
              return item
            }
          })
        } else {
          converted[snakeCaseKey] = obj[key]
        }
      }
    }
    return converted
  }

  return convertKeys(obj)
}
// 随机获取数组中的某一项
export function getRandomItemFromArray(array: string[]) {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

// 时间格式化
export function formatTime(timestamp: string | number, format: string) {
  const res = dayjs(timestamp).format(format)
  return res
}

// 复制
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed' // Avoid scrolling to the bottom
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    return true
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}
