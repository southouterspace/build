import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropzoneProps {
  onFileAccepted: (file: File) => void
  isLoading: boolean
}

export function Dropzone({ onFileAccepted, isLoading }: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0])
      }
    },
    [onFileAccepted]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isLoading
  })

  return (
    <div className="h-screen w-screen p-6">
      <div
        {...getRootProps()}
        className={cn(
          'flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
          isDragActive
            ? 'border-primary bg-slate-100 dark:bg-slate-800'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800',
          isLoading && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-primary" />
            <p className="text-lg text-muted-foreground">Parsing file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Upload
              className={cn(
                'h-12 w-12 transition-colors',
                isDragActive ? 'text-primary' : 'text-slate-400'
              )}
            />
            <div className="text-center">
              <p className="text-lg font-medium">
                {isDragActive
                  ? 'Drop your file here'
                  : 'Drag & drop your file here'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Supports CSV and Excel files (.csv, .xlsx, .xls)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
