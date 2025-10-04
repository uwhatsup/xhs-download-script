import filetypeinfo from 'magic-bytes.js'
import StreamSaver from 'streamsaver'

// 使用前提
// 1. 同源
// 2. 文件名主要是后端控制，后端的优先级是大于前端的download
// 3. 如果后端没有指定Content-Disposition 在谷歌中测试，是不生效的
// 在处理文件下载时，Content-Disposition 头部中的 filename 属性和前端 <a> 标签的 download 属性之间的优先级如下：
// Content-Disposition 的 filename 属性：服务器返回的 Content-Disposition 头部中的 filename 属性通常会优先于前端的 download 属性。如果服务器指定了一个文件名，浏览器一般会使用这个文件名来保存下载的文件。

// download 属性：如果没有设置 Content-Disposition 头部，或者在某些情况下，download 属性会生效，并使用其指定的文件名。但如果同时存在并且冲突，浏览器大多数情况下会优先使用服务器返回的 filename。

// 总结
// 优先级：Content-Disposition > download
// 建议：为了确保一致性，建议在服务器端通过 Content-Disposition 指定文件名，尤其是在需要提供下载功能的情况下。这样可以避免由于浏览器差异导致的意外行为。
// export function downloadFileWithLink(url: string, fileName: string) {
//   console.log('链接点击下载', url, fileName);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = fileName;
//   a.title = fileName;
//   a.target = '_blank';
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
// }
// xhr下载
export function downloadFileWithXhr(url: string, fileName: string) {
  console.log(url)
  console.log(fileName)
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'blob'
  xhr.onload = async function () {
    if (xhr.status === 200) {
      const blob = xhr.response as Blob
      let sub
      const buffer = await blob.arrayBuffer()
      const fileType = filetypeinfo(new Uint8Array(buffer))
      sub = '.' + fileType[0].extension

      fileName += sub
      // 获取响应的类型
      console.log('推断的文件类型', fileType)
      console.log('文件名:', fileName)
      const link = document.createElement('a')
      const href = URL.createObjectURL(blob)
      link.href = href
      link.download = fileName
      link.click()
      URL.revokeObjectURL(href)
    }
  }
  xhr.onerror = (error) => {
    console.log('下载出错', error)
  }
  xhr.send()
  return xhr
}
// 大型文件下载
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
