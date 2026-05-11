import Button from "../../components/ui/Button";
import type { WorkbookSummary } from "../../types/workbook";

interface Props {
    workbooks: WorkbookSummary[];
    selectedWorkbookId: number | null;
    setSelectedWorkbookId: (id: number) => void;
    order: 'sequential' | 'random';
    setOrder: (o: 'sequential' | 'random') => void;
    navEnabled: boolean;
    setNavEnabled: (v: (prev: boolean) => boolean) => void;
    handleStart: () => void;
}

export default function SetupPhase({
    workbooks,
    selectedWorkbookId,
    setSelectedWorkbookId,
    order,
    setOrder,
    navEnabled,
    setNavEnabled,
    handleStart,
}: Props) {
    return (
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
            {/* Left: Workbook Selection */}
            <div className="flex-1 min-w-0 bg-surface-container-lowest rounded-3xl shadow-sm shadow-primary/5 overflow-hidden">
                <div className="px-6 py-5 border-b border-outline-variant/20">
                    <h2 className="font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">menu_book</span>
                        문제집 선택
                    </h2>
                </div>
                <div className="divide-y divide-outline-variant/15 max-h-[70vh] overflow-y-auto">
                    {workbooks.length === 0 ? (
                        <p className="text-sm text-on-surface-variant text-center py-12">등록된 문제집이 없습니다.</p>
                    ) : workbooks.map(wb => (
                        <button
                            key={wb.id}
                            onClick={() => setSelectedWorkbookId(wb.id)}
                            className={`w-full flex items-center justify-between px-6 py-4 transition-colors cursor-pointer text-left
                                ${selectedWorkbookId === wb.id
                                    ? 'bg-primary/5 text-primary'
                                    : 'hover:bg-surface-container-low text-on-surface'
                                }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {selectedWorkbookId === wb.id
                                    ? <span className="material-symbols-outlined text-[18px] flex-shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                                    : <span className="material-symbols-outlined text-[18px] text-outline-variant flex-shrink-0">radio_button_unchecked</span>
                                }
                                <span className="font-semibold truncate">{wb.name}</span>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0 ml-3
                                ${selectedWorkbookId === wb.id ? 'bg-primary text-white' : 'bg-secondary-fixed text-on-secondary-fixed'}`}>
                                {wb.questionCount}문제
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Settings + Start */}
            <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-6 space-y-4">
                <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm shadow-primary/5">
                    <h2 className="font-bold text-on-surface mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                        시험 설정
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-semibold text-on-surface-variant mb-3">문제 순서</p>
                            <div className="flex gap-3">
                                {(['sequential', 'random'] as const).map(o => (
                                    <button
                                        key={o}
                                        onClick={() => setOrder(o)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-semibold text-sm transition-all cursor-pointer
                                            ${order === o
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/30'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {o === 'sequential' ? 'format_list_numbered' : 'shuffle'}
                                        </span>
                                        {o === 'sequential' ? '순차' : '랜덤'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-on-surface">이전/다음 이동</p>
                                <p className="text-xs text-on-surface-variant mt-0.5">시험 중 문제 간 자유 이동 허용</p>
                            </div>
                            <button
                                onClick={() => setNavEnabled(v => !v)}
                                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0
                                    ${navEnabled ? 'bg-primary' : 'bg-outline-variant'}`}
                            >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
                                    ${navEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <Button
                    variant="primary"
                    className="w-full !py-4 !text-base flex items-center justify-center gap-2"
                    disabled={!selectedWorkbookId}
                    onClick={handleStart}
                >
                    <span className="material-symbols-outlined">play_arrow</span>
                    시험 시작
                </Button>
            </div>
        </div>
    );
}
