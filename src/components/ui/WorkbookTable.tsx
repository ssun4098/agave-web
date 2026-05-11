import type { WorkbookSummary } from "../../types/workbook";
import { WorkbookService } from "../../services/workbook";
import { NavLink } from "react-router";

type Props = {
    items: WorkbookSummary[];
    totalElements: number;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
};

function WorkbookTable({ items, totalElements, page, totalPages, onPageChange, onRefresh }: Props) {
    const start = items.length === 0 ? 0 : (page - 1) * items.length + 1;
    const end = start + items.length - 1;

    const handleClickDelete = (id: number) => {
        if (!confirm('삭제하시겠습니까?')) return;
        WorkbookService.delete(id).then(() => onRefresh());
    };

    const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        const half = 2;
        let startPage = Math.max(1, page - half);
        const endPage = Math.min(totalPages, startPage + 4);
        startPage = Math.max(1, endPage - 4);
        return startPage + i;
    }).filter(n => n <= totalPages);

    return (
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm shadow-primary/5">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-surface-container-low">
                        <th className="px-6 py-5 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold text-center w-96 border-x border-outline-variant/60">이름</th>
                        <th className="px-7 py-5 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold text-center w-28 border-x border-outline-variant/60">문제 수</th>
                        <th className="px-6 py-5 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold text-center w-28 border-x border-outline-variant/60">생성일</th>
                        <th className="px-4 py-5 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold text-center w-20 border-x border-outline-variant/60">공개여부</th>
                        <th className="px-7 py-5 font-headline text-xs uppercase tracking-widest text-on-surface-variant font-bold text-center w-36 border-x border-outline-variant/60"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-8 py-16 text-center text-sm text-on-surface-variant">
                                등록된 문제집이 없습니다.
                            </td>
                        </tr>
                    ) : items.map(item => (
                        <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors group">
                            <td className="px-8 py-6 border-x border-outline-variant/60">
                                <span className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors block">
                                    {item.name}
                                </span>
                            </td>
                            <td className="px-6 py-6 text-center border-x border-outline-variant/60">
                                <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
                                    {item.questionCount}문제
                                </span>
                            </td>
                            <td className="px-4 py-6 text-center text-sm text-on-surface-variant w-24 border-x border-outline-variant/60">
                                {item.createdAt.slice(0, 10).replace(/-/g, '.')}
                            </td>
                            <td className="px-8 py-6 w-36 text-center border-x border-outline-variant/60">
                                {item.public ? (
                                    <div className="flex items-center justify-center space-x-2 text-primary">
                                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>visibility</span>
                                        <span className="text-xs font-bold">공개</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2 text-on-surface-variant opacity-40">
                                        <span className="material-symbols-outlined text-sm">visibility_off</span>
                                        <span className="text-xs font-bold">비공개</span>
                                    </div>
                                )}
                            </td>
                            <td className="py-6 w-36 border-x border-outline-variant/60">
                                <div className="flex items-center justify-center gap-2 w-full">
                                    <div className="relative group/btn">
                                        <NavLink to={`/attempts?workbookId=${item.id}`}>
                                            <button type="button" className="flex items-center justify-center w-10 h-10 rounded-xl text-green-600 bg-green-500/10 hover:bg-green-500/20 transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                            </button>
                                        </NavLink>
                                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-on-surface text-surface text-[11px] font-bold whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                            시험보기
                                        </span>
                                    </div>
                                    <div className="relative group/btn">
                                        <NavLink to={`/workbook/${item.id}`}>
                                            <button type="button" className="flex items-center justify-center w-10 h-10 rounded-xl text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                            </button>
                                        </NavLink>
                                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-on-surface text-surface text-[11px] font-bold whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                            상세보기
                                        </span>
                                    </div>
                                    <div className="relative group/btn">
                                        <button type="button" onClick={() => handleClickDelete(item.id)} className="flex items-center justify-center w-10 h-10 rounded-xl text-error bg-error/10 hover:bg-error/20 transition-colors cursor-pointer">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-on-surface text-surface text-[11px] font-bold whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                            삭제
                                        </span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="px-8 py-6 flex items-center justify-between border-t border-surface-container-low bg-surface-container-lowest">
                <div className="text-sm text-on-surface-variant font-medium">
                    총 <span className="font-bold text-on-surface">{totalElements}</span>개의 문제집 중&nbsp;
                    <span className="font-bold text-on-surface">{start}-{end}</span> 표시
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => onPageChange(1)} disabled={page === 1} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant disabled:opacity-30">
                        <span className="material-symbols-outlined">first_page</span>
                    </button>
                    <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant disabled:opacity-30">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <div className="flex px-4 space-x-2">
                        {pageNumbers.map(n => (
                            <button
                                key={n}
                                onClick={() => onPageChange(n)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors
                                    ${n === page ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant disabled:opacity-30">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant disabled:opacity-30">
                        <span className="material-symbols-outlined">last_page</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WorkbookTable;
