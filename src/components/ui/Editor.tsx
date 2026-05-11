import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import { api } from '../../services/api'
import { useRef, useState, useEffect } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

const lowlight = createLowlight(common)

const LANGUAGES = [
    { value: '', label: '언어 선택' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'json', label: 'JSON' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'yaml', label: 'YAML' },
    { value: 'xml', label: 'XML' },
]

async function uploadImage(file: File): Promise<string> {
    const form = new FormData()
    form.append('image', file)
    const res = await api.post<{ data: { url: string } }>('/images', form)
    return res.data.url
}

// ── Table NodeView ────────────────────────────────────────────────────────────

const TableExtension = Table.configure({ resizable: true })

// ── UI helpers ────────────────────────────────────────────────────────────────

type ToolbarButtonProps = {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
}

function ToolbarButton({ onClick, active, disabled, children, title }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={`p-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed
                ${active
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
        >
            {children}
        </button>
    )
}

function Divider() {
    return <div className="w-px h-5 bg-outline-variant/40 mx-1" />
}

type LanguageSelectProps = {
    value: string
    onChange: (lang: string) => void
}

function LanguageSelect({ value, onChange }: LanguageSelectProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const current = LANGUAGES.find(l => l.value === value) ?? LANGUAGES[0]

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
            >
                <span className="material-symbols-outlined text-[14px]">terminal</span>
                {current.label}
                <span className={`material-symbols-outlined text-[14px] transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1.5 z-50 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 overflow-hidden min-w-[140px]">
                    {LANGUAGES.slice(1).map(lang => (
                        <button
                            key={lang.value}
                            type="button"
                            onClick={() => { onChange(lang.value); setOpen(false) }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors
                                ${lang.value === value
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Table Modal (삽입 / 행열 조정 공용) ───────────────────────────────────────

type TableModalProps = {
    initialRows?: number
    initialCols?: number
    mode: 'insert' | 'adjust'
    onConfirm: (rows: number, cols: number) => void
    onClose: () => void
}

function TableModal({ initialRows = 3, initialCols = 3, mode, onConfirm, onClose }: TableModalProps) {
    const [rows, setRows] = useState(initialRows)
    const [cols, setCols] = useState(initialCols)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 p-6 w-72 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <h3 className="font-headline text-sm font-bold text-on-surface">
                        {mode === 'insert' ? '표 삽입' : '행/열 조정'}
                    </h3>
                    <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {([['행', rows, setRows], ['열', cols, setCols]] as const).map(([label, value, setter]) => (
                        <div key={label} className="flex items-center justify-between gap-4">
                            <label className="text-xs font-bold text-on-surface-variant">{label} 수</label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setter(v => Math.max(1, v - 1))}
                                    className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors font-bold"
                                >−</button>
                                <span className="w-6 text-center text-sm font-bold text-on-surface">{value}</span>
                                <button
                                    type="button"
                                    onClick={() => setter(v => Math.min(10, v + 1))}
                                    className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors font-bold"
                                >+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => { onConfirm(rows, cols); onClose() }}
                    className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                    {mode === 'insert' ? '삽입' : '적용'}
                </button>
            </div>
        </div>
    )
}

// ── Editor ────────────────────────────────────────────────────────────────────

type Props = {
    content?: string
    onChange?: (html: string) => void
}

function Editor({ content = '', onChange }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [tableModal, setTableModal] = useState<{ mode: 'insert' | 'adjust'; rows: number; cols: number } | null>(null)
    const adjustTableEl = useRef<HTMLTableElement | null>(null)

    function handleEditorDoubleClick(e: React.MouseEvent) {
        const tableEl = (e.target as HTMLElement).closest('table') as HTMLTableElement | null
        if (!tableEl || !editor) return
        e.preventDefault()
        adjustTableEl.current = tableEl
        setTableModal({
            mode: 'adjust',
            rows: tableEl.rows.length,
            cols: tableEl.rows[0]?.cells.length ?? 0,
        })
    }

    function handleTableConfirm(newRows: number, newCols: number) {
        if (!editor) return

        if (tableModal?.mode === 'insert') {
            editor.chain().focus().insertTable({ rows: newRows, cols: newCols, withHeaderRow: true }).run()
            return
        }

        const tableEl = adjustTableEl.current
        if (!tableEl) return

        const currentRows = tableEl.rows.length
        const currentCols = tableEl.rows[0]?.cells.length ?? 0
        const rowDiff = newRows - currentRows
        const colDiff = newCols - currentCols

        if (rowDiff > 0) {
            const lastCell = tableEl.rows[tableEl.rows.length - 1].cells[0]
            const pos = editor.view.posAtDOM(lastCell, 0)
            let chain = editor.chain().focus(pos)
            for (let i = 0; i < rowDiff; i++) chain = chain.addRowAfter()
            chain.run()
        } else if (rowDiff < 0) {
            for (let i = 0; i < Math.abs(rowDiff); i++) {
                if (tableEl.rows.length <= 1) break
                const lastCell = tableEl.rows[tableEl.rows.length - 1].cells[0]
                const pos = editor.view.posAtDOM(lastCell, 0)
                editor.chain().focus(pos).deleteRow().run()
            }
        }

        if (colDiff > 0) {
            const lastCell = tableEl.rows[0].cells[tableEl.rows[0].cells.length - 1]
            const pos = editor.view.posAtDOM(lastCell, 0)
            let chain = editor.chain().focus(pos)
            for (let i = 0; i < colDiff; i++) chain = chain.addColumnAfter()
            chain.run()
        } else if (colDiff < 0) {
            for (let i = 0; i < Math.abs(colDiff); i++) {
                if (tableEl.rows[0].cells.length <= 1) break
                const lastCell = tableEl.rows[0].cells[tableEl.rows[0].cells.length - 1]
                const pos = editor.view.posAtDOM(lastCell, 0)
                editor.chain().focus(pos).deleteColumn().run()
            }
        }
    }

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Image.configure({ inline: false, allowBase64: true }),
            CodeBlockLowlight.configure({ lowlight }),
            TableExtension,
            TableRow,
            TableCell,
            TableHeader,
        ],
        content,
        onUpdate({ editor }) {
            onChange?.(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none min-h-[240px] px-5 py-4 outline-none text-on-surface leading-relaxed focus:outline-none',
            },
        },
    })

    async function handleImageFile(file: File) {
        if (!editor || !file.type.startsWith('image/')) return
        const src = await uploadImage(file)
        editor.chain().focus().setImage({ src }).run()
    }

    function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) handleImageFile(file)
        e.target.value = ''
    }

    function handleDrop(e: React.DragEvent) {
        const file = e.dataTransfer.files?.[0]
        if (file?.type.startsWith('image/')) {
            e.preventDefault()
            handleImageFile(file)
        }
    }

    const { isCodeBlockActive, currentLanguage } = useEditorState({
        editor,
        selector: (ctx) => ({
            isCodeBlockActive: ctx.editor?.isActive('codeBlock') ?? false,
            currentLanguage: ctx.editor?.getAttributes('codeBlock').language ?? '',
        }),
    })

    if (!editor) return null

    return (
        <div
            className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm shadow-primary/5 focus-within:ring-2 focus-within:ring-primary/30 transition-shadow"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onDoubleClick={handleEditorDoubleClick}
        >
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-outline-variant/20 flex-wrap">
                <ToolbarButton title="실행 취소" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                </ToolbarButton>
                <ToolbarButton title="다시 실행" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                    <span className="material-symbols-outlined text-[18px]">redo</span>
                </ToolbarButton>

                <Divider />

                <ToolbarButton title="제목 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                    <span className="text-[13px] font-black leading-none">H1</span>
                </ToolbarButton>
                <ToolbarButton title="제목 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <span className="text-[13px] font-black leading-none">H2</span>
                </ToolbarButton>
                <ToolbarButton title="제목 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                    <span className="text-[13px] font-black leading-none">H3</span>
                </ToolbarButton>

                <Divider />

                <ToolbarButton title="굵게" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <span className="material-symbols-outlined text-[18px]">format_bold</span>
                </ToolbarButton>
                <ToolbarButton title="기울임" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <span className="material-symbols-outlined text-[18px]">format_italic</span>
                </ToolbarButton>
                <ToolbarButton title="취소선" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
                    <span className="material-symbols-outlined text-[18px]">format_strikethrough</span>
                </ToolbarButton>
                <ToolbarButton title="인라인 코드" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
                    <span className="material-symbols-outlined text-[18px]">code</span>
                </ToolbarButton>

                <Divider />

                <ToolbarButton title="순서 없는 목록" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                </ToolbarButton>
                <ToolbarButton title="순서 있는 목록" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                </ToolbarButton>
                <ToolbarButton title="인용구" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <span className="material-symbols-outlined text-[18px]">format_quote</span>
                </ToolbarButton>
                <ToolbarButton title="코드 블록" active={isCodeBlockActive} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                    <span className="material-symbols-outlined text-[18px]">integration_instructions</span>
                </ToolbarButton>
                <ToolbarButton title="표 삽입" onClick={() => setTableModal({ mode: 'insert', rows: 3, cols: 3 })}>
                    <span className="material-symbols-outlined text-[18px]">table</span>
                </ToolbarButton>

                {isCodeBlockActive && (
                    <>
                        <Divider />
                        <LanguageSelect
                            value={currentLanguage}
                            onChange={lang => editor.chain().focus().setCodeBlock({ language: lang }).run()}
                        />
                    </>
                )}

                <Divider />

                <ToolbarButton title="이미지 삽입" onClick={() => fileInputRef.current?.click()}>
                    <span className="material-symbols-outlined text-[18px]">image</span>
                </ToolbarButton>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                />
            </div>

            <EditorContent editor={editor} />

            {tableModal && (
                <TableModal
                    mode={tableModal.mode}
                    initialRows={tableModal.rows}
                    initialCols={tableModal.cols}
                    onConfirm={handleTableConfirm}
                    onClose={() => setTableModal(null)}
                />
            )}
        </div>
    )
}

export default Editor
