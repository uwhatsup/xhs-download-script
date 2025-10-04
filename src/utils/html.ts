// 获取html中指定选择器的内容
export async function extractHtmlContent(
  url: string,
  selector: string
): Promise<string> {
  const response = await fetch(url)
  const html = await response.text()

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const element = doc.querySelector(selector)

  return element?.textContent?.trim() || ''
}
