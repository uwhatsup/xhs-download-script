import filetypeinfo from 'magic-bytes.js'
import StreamSaver from 'streamsaver'

export async function downloadLargeFile(
  url: string,
  fileName: string,
  onProgress?: (loaded: number, total?: number) => void
): Promise<void> {
  console.log('开始下载', fileName, url)
  try {
    // 创建一个写入流
    const fileStream = StreamSaver.createWriteStream(fileName)
    const writer = fileStream.getWriter()

    // 发起网络请求
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    // 获取文件总大小（如果可用）
    const contentLength = response.headers.get('Content-Length')
    const total = contentLength ? parseInt(contentLength, 10) : undefined

    // 创建读取器
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Failed to access response body')
    }

    let loaded = 0 // 已下载字节数

    // 循环读取流数据并写入文件
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // 写入数据到文件
      await writer.write(value)

      // 更新进度
      loaded += value.length
      if (onProgress && total !== undefined) {
        onProgress(loaded, total)
      } else if (onProgress) {
        onProgress(loaded)
      }
    }

    // 关闭写入器
    writer.close()
    console.log(`${fileName} downloaded successfully!`)
  } catch (error) {
    console.error('Error during download:', error)
    throw error // 将错误抛出以供调用方处理
  }
}
// 获取文件后缀
export async function getFileExtensionFromPartialContent(
  url: string
): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        Range: 'bytes=0-1024', // 只请求前 1024 字节
      },
    })

    if (!response.ok) {
      throw new Error(`请求失败，状态码：${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const fileType = filetypeinfo(new Uint8Array(buffer))
    const sub = '.' + fileType[0].extension
    return sub
  } catch (error) {
    throw new Error('文件名推断请求出错: ')
  }
}
