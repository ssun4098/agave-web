import { useState, useRef, useCallback, useEffect } from "react";
import { CategoryService } from "../../services/category";
import type { CategoryDetailDto } from "../../types/category";

function CategoryItem({
    item,
    selectedId,
    onSelect,
    depth = 0,
}: {
    item: CategoryDetailDto;
    selectedId?: number;
    onSelect: (item: CategoryDetailDto) => void;
    depth?: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = item.child && item.child.length > 0;

    return (
        <>
            <div
                className={`flex items-center w-full text-left text-sm font-semibold transition-colors hover:bg-surface-container ${selectedId === item.categoryId ? 'text-primary bg-primary/5' : 'text-on-surface'}`}
                style={{ paddingLeft: `${16 + depth * 16}px`, paddingRight: '8px' }}
            >
                <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="flex items-center gap-2 flex-1 py-2.5 cursor-pointer"
                >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                </button>
                {hasChildren && (
                    <button
                        type="button"
                        onClick={() => setExpanded(v => !v)}
                        className="p-1 text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                        <span className={`material-symbols-outlined text-[18px] transition-transform ${expanded ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>
                )}
            </div>
            {hasChildren && expanded && (
                <>
                    {item.child.map(child => (
                        <CategoryItem
                            key={child.categoryId}
                            item={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            depth={depth + 1}
                        />
                    ))}
                </>
            )}
        </>
    );
}


export default function CategorySelectDropdown({ value, onChange, initialLabel }: {
    value?: number;
    onChange: (id: number) => void;
    initialLabel?: string;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [items, setItems] = useState<CategoryDetailDto[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedName, setSelectedName] = useState(initialLabel ?? '');
    const containerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef(0);
    const loadingRef = useRef(false);
    const searchRef = useRef('');

    const load = useCallback(async (page: number, q: string, reset: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const res = await CategoryService.getList({ page, size: 20, name: q });
            if (res) {
                setItems(prev => reset ? [...res.content] : [...prev, ...res.content]);
                setHasMore(!res.last);
                pageRef.current = page;
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        searchRef.current = search;
        loadingRef.current = false;
        setItems([]);
        pageRef.current = 0;
        load(0, search, true);
    }, [open, search, load]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !open) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && hasMore && !loadingRef.current) {
                load(pageRef.current + 1, searchRef.current, false);
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [open, hasMore, items, load]);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    function handleSelect(item: CategoryDetailDto) {
        onChange(item.categoryId);
        setSelectedName(`${item.icon} ${item.name}`);
        setOpen(false);
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full bg-surface-container-lowest border-0 rounded-xl py-4 px-4 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 appearance-none transition-all shadow-sm flex items-center justify-between cursor-pointer"
            >
                <span className={selectedName ? '' : 'text-outline-variant'}>
                    {selectedName || '카테고리 선택'}
                </span>
                <span className="material-symbols-outlined text-outline">expand_more</span>
            </button>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden">
                    <div className="p-2 border-b border-outline-variant/10">
                        <div className="relative">
                            <input
                                autoFocus
                                className="w-full bg-surface-container border-0 rounded-lg py-2.5 pl-9 pr-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant outline-none"
                                placeholder="카테고리 검색..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                        </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                        {items.length === 0 && !loading && (
                            <p className="text-center text-xs text-outline-variant py-6">검색 결과가 없습니다.</p>
                        )}
                        {items.map(item => (
                            <CategoryItem
                                key={item.categoryId}
                                item={item}
                                selectedId={value}
                                onSelect={handleSelect}
                            />
                        ))}
                        {loading && (
                            <div className="flex justify-center py-3">
                                <span className="material-symbols-outlined text-outline animate-spin">progress_activity</span>
                            </div>
                        )}
                        <div ref={sentinelRef} />
                    </div>
                </div>
            )}
        </div>
    );
}
