import fs from 'fs'
import path from 'path'
import decompress from 'decompress'
import type { Plugin } from 'vite'

export function extractAndCopySwiftLaTeX(): Plugin {
  return {
    name: 'extract-and-copy-swiftlatex',
    async buildStart() {
      const zipPath = path.resolve('external/SwiftLaTeX/20-02-2022.zip')
      const extractPath = path.resolve('external/SwiftLaTeX/extracted')
      
      try {
        await decompress(zipPath, extractPath)
        console.log('Zip extracted successfully')
        
        const filesToCopy = ['swiftlatexpdftex.js', 'swiftlatexpdftex.wasm', 'PdfTeXEngine.js']
        const publicDir = path.resolve('public')
        
        filesToCopy.forEach(file => {
          const sourcePath = path.resolve(extractPath, file)
          const destPath = path.resolve(publicDir, file)
          
          if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath)
            console.log(`Copied ${file} to public directory`)
          } else {
            console.warn(`File ${file} not found in extracted directory`)
          }
        })

        // HACK: patch bug in PdfTexEngine.js
        // consider patching this in the SwiftLaTeX repo or forking
        const pdfTexDestPath = path.resolve('public', 'PdfTeXEngine.js')
        try {
          if (fs.existsSync(pdfTexDestPath)) {
            let content = fs.readFileSync(pdfTexDestPath, 'utf8')
            
            content = content.replace(
              /(this\.latexWorker\.postMessage\(\{ 'cmd': 'settexliveurl', 'url': url \}\);\s+)this\.latexWorker = undefined;(\s+)/,
              '$1$2'
            )
            
            fs.writeFileSync(pdfTexDestPath, content)
            console.log(`Patched and copied PdfTeXEngine.js`)
          } else {
            console.warn(`PdfTeXEngine.js not found at ${pdfTexDestPath}`)
          }
        } catch (error) {
          console.error('Error patching PdfTeXEngine.js:', error)
        }
      } catch (error) {
        console.error('Error during extraction or copying:', error)
      }
    }
  }
}